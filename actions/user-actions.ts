"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/firebase/user-manager";
import type { User } from "@/lib/firebase/types";
import type { Timestamp } from "firebase/firestore";

// Serializable version of User for client components
export type SerializableUser = Omit<User, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

/**
 * Server action to get the current authenticated user's data from Firebase
 * @returns User data serialized for client or null if not found/authenticated
 */
export async function getCurrentUserData(): Promise<SerializableUser | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) return null;

    const userData = await getUserById(clerkUser.id);
    if (!userData) return null;

    // Convert Timestamp objects to ISO strings for client components
    return {
      ...userData,
      createdAt: userData.createdAt.toDate().toISOString(),
      updatedAt: userData.updatedAt.toDate().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching current user data:", error);
    return null;
  }
}

/**
 * Server action to get a user by ID from Firebase
 * @param userId - The ID of the user to fetch
 * @returns User data serialized for client or null if not found
 */
export async function getUserDataById(userId: string): Promise<SerializableUser | null> {
  try {
    const userData = await getUserById(userId);
    if (!userData) return null;

    // Convert Timestamp objects to ISO strings for client components
    return {
      ...userData,
      createdAt: userData.createdAt.toDate().toISOString(),
      updatedAt: userData.updatedAt.toDate().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching user data by ID:", error);
    return null;
  }
}
