# Firebase User Profile Implementation Guide

This document outlines how to implement a user profile system with Firebase Firestore that includes automatic user creation, real-time updates, and basic CRUD operations.

## Overview

The system will:
- Check if a user exists when they visit `/profile`
- Create a new user with a random UUID if they don't exist
- Fetch user data on the server side
- Provide real-time updates using Firestore listeners
- Store user data in the "users" collection

## Project Structure

```
lib/
├── firebase/
│   ├── config.ts          # Firebase configuration
│   ├── firestore.ts       # Firestore service functions
│   └── types.ts           # TypeScript types
app/
├── profile/
│   └── page.tsx           # Profile page component
└── api/
    └── users/
        └── route.ts       # API route for user operations
```

## 1. Firebase Configuration

First, ensure your Firebase configuration is properly set up:

```typescript
// lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## 2. TypeScript Types

Define the user data structure:

```typescript
// lib/firebase/types.ts
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateUserData {
  email?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
}
```

## 3. Firestore Service Functions

Create the core CRUD operations:

```typescript
// lib/firebase/firestore.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { User, CreateUserData } from './types';
import { v4 as uuidv4 } from 'uuid';

const USERS_COLLECTION = 'users';

// Generate a random UUID for new users
export const generateUserId = (): string => {
  return uuidv4();
};

// Check if a user exists
export const userExists = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
};

// Get user data
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (
  userId: string, 
  userData: CreateUserData
): Promise<User> => {
  try {
    const newUser: Omit<User, 'id'> = {
      email: userData.email || '',
      displayName: userData.displayName || 'Anonymous User',
      bio: userData.bio || '',
      avatar: userData.avatar || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, USERS_COLLECTION, userId), {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: userId,
      ...newUser,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user data
export const updateUser = async (
  userId: string, 
  userData: Partial<CreateUserData>
): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Set up real-time listener for user data
export const subscribeToUser = (
  userId: string, 
  callback: (user: User | null) => void
): Unsubscribe => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const user: User = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
      callback(user);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in user subscription:', error);
    callback(null);
  });
};

// Get or create user (main function for profile page)
export const getOrCreateUser = async (userId?: string): Promise<User> => {
  try {
    // If no userId provided, generate a new one
    const finalUserId = userId || generateUserId();
    
    // Check if user exists
    const existingUser = await getUser(finalUserId);
    
    if (existingUser) {
      return existingUser;
    }
    
    // User doesn't exist, create a new one
    const newUser = await createUser(finalUserId, {
      displayName: 'New User',
      bio: 'Welcome to ACM Fort Santiago!',
    });
    
    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
};
```

## 4. Server-Side Profile Page

Create the profile page that fetches data on the server:

```typescript
// app/profile/page.tsx
import { getOrCreateUser } from '@/lib/firebase/firestore';
import { ProfileClient } from './profile-client';

interface ProfilePageProps {
  searchParams: { userId?: string };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  try {
    // Get userId from URL params or generate a new one
    const user = await getOrCreateUser(searchParams.userId);
    
    return <ProfileClient initialUser={user} />;
  } catch (error) {
    console.error('Error loading profile:', error);
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Profile
          </h1>
          <p className="text-gray-600">
            Unable to load user profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
```

## 5. Client-Side Profile Component with Real-Time Updates

```typescript
// app/profile/profile-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/firebase/types';
import { subscribeToUser, updateUser } from '@/lib/firebase/firestore';

interface ProfileClientProps {
  initialUser: User;
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToUser(user.id, (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user.id]);

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    setIsLoading(true);
    try {
      await updateUser(user.id, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        
        {/* User Info Display */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <p className="mt-1 text-sm text-gray-500 font-mono">{user.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                defaultValue={user.displayName}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onBlur={(e) => handleUpdateProfile({ displayName: e.target.value })}
              />
            ) : (
              <p className="mt-1 text-lg">{user.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            {isEditing ? (
              <textarea
                defaultValue={user.bio}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onBlur={(e) => handleUpdateProfile({ bio: e.target.value })}
              />
            ) : (
              <p className="mt-1 text-gray-600">{user.bio || 'No bio yet'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                defaultValue={user.email}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onBlur={(e) => handleUpdateProfile({ email: e.target.value })}
              />
            ) : (
              <p className="mt-1 text-gray-600">{user.email || 'No email set'}</p>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>Created: {user.createdAt.toLocaleDateString()}</p>
            <p>Last Updated: {user.updatedAt.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isEditing ? 'Done Editing' : 'Edit Profile'}
          </button>

          {isLoading && (
            <div className="flex items-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              Saving...
            </div>
          )}
        </div>

        {/* Real-time Status Indicator */}
        <div className="mt-4 text-xs text-green-600">
          🟢 Real-time updates active
        </div>
      </div>
    </div>
  );
}
```

## 6. API Route (Optional)

For additional server-side operations, you can create API routes:

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser, createUser, updateUser, deleteUser } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, ...userData } = await request.json();
    const user = await createUser(userId, userData);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, ...userData } = await request.json();
    await updateUser(userId, userData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    await deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
```

## 7. Required Dependencies

Install the necessary packages:

```bash
npm install firebase uuid
npm install --save-dev @types/uuid
```

## 8. Environment Variables

Ensure your `.env.local` file contains all the Firebase configuration variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Key Features

1. **Automatic User Creation**: When a user visits `/profile`, the system automatically creates a user if they don't exist
2. **Server-Side Rendering**: Initial user data is fetched on the server for better performance
3. **Real-Time Updates**: Uses Firestore's `onSnapshot` for live data synchronization
4. **Error Handling**: Comprehensive error handling throughout the application
5. **TypeScript Support**: Fully typed for better development experience
6. **CRUD Operations**: Complete Create, Read, Update, Delete functionality

## Usage Examples

### Access Profile Page
- Visit `/profile` to auto-create a user
- Visit `/profile?userId=specific-uuid` to load a specific user

### Real-Time Updates
- Open the profile page in multiple tabs
- Edit in one tab and see changes instantly in others

This implementation provides a robust foundation for a Firebase-powered user profile system with real-time capabilities.