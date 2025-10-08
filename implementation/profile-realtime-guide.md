# Real‑Time User Profile Page with Firebase & Firestore

_Last updated: 2025-10-07 20:40:10 UTC_

This guide shows how to wire a `/profile` page so that:

- On **first visit**, the **server checks** if a user doc exists in **`users`** and **creates one if missing** (with a random UUID + default fields).
- The initial profile data is **fetched on the server** (SSR) for fast first paint.
- The page **subscribes to real‑time updates** on the client (no refresh needed).

The examples use **Next.js (App Router)**, **TypeScript**, **Firebase Auth**, and **Cloud Firestore** with both the **Admin SDK** (server) and **Web SDK** (client). Adapt as needed if you’re not using Next.js or Auth.

---


## Contents

1. [Project Setup](#project-setup)  
2. [Data Model](#data-model)  
3. [Security Rules](#security-rules)  
4. [Firebase Service (Server + Client in one place)](#firebase-service-server--client)  
5. [Server: getOrCreateUserProfile](#server-getorcreateuserprofile)  
6. [Server Rendering `/profile`](#server-rendering-profile)  
7. [Client: Real‑Time Subscription](#client-real-time-subscription)  
8. [End‑to‑End Flow](#end-to-end-flow)  
9. [Validation & Types](#validation--types)  
10. [Testing Locally](#testing-locally)  
11. [Common Pitfalls](#common-pitfalls)

---

## Project Setup

Install dependencies:

```bash
npm i firebase zod
npm i -D @types/node
# For server / Admin SDK:
npm i firebase-admin
```

Folder layout (suggested):

```
/app
  /profile
    page.tsx
/lib
  firebase/
    admin.ts
    client.ts
    service.ts
  types/
    profile.ts
```

> You can combine files if you prefer a single `firebase-service` module—this guide shows both split and unified styles.

---

## Data Model

All user profiles live in the Firestore collection **`users`**.

**Document path:** `users/{uid}` (uid from Firebase Auth)  
If you don’t use Firebase Auth, create your own stable key and map it to a cookie or session.

**Example document:**
```json
{
  "profileId": "7f73f7a6-6c80-4a56-9a6a-3b9f1e2a6a1a",
  "displayName": "New User",
  "photoURL": null,
  "bio": "",
  "createdAt": 1738867200000,
  "updatedAt": 1738867200000
}
```

- `createdAt` and `updatedAt` use `Date.now()` (ms). You can switch to Firestore `serverTimestamp()` on the client side; for Admin, you can use `FieldValue.serverTimestamp()`.

---

## Security Rules

Start restrictive and open as needed:

```js
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      // Only signed-in user can read/write own profile
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy rules with the Firebase CLI.

---

## Firebase Service (Server + Client)

You mentioned a “firebase-service” file; here’s a pragmatic approach.

### `/lib/firebase/admin.ts` (Node/Server only)

```ts
// lib/firebase/admin.ts
import { cert, getApps, initializeApp, App as AdminApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// IMPORTANT: Load creds from env (recommended: a single JSON string or individual vars)
const firebaseAdminApp: AdminApp =
  getApps()[0] ??
  initializeApp({
    // If using GOOGLE_APPLICATION_CREDENTIALS, you may omit 'credential'
    // Otherwise:
    // credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON!)),
  });

export const adminDb = getFirestore(firebaseAdminApp);
```

### `/lib/firebase/client.ts` (Browser + Edge/Client Components)

```ts
// lib/firebase/client.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const clientAuth = getAuth(app);
export const clientDb = getFirestore(app);
```

### `/lib/firebase/service.ts` (Shared helpers)

```ts
// lib/firebase/service.ts
import { randomUUID } from "crypto";
import { adminDb } from "./admin";
import { z } from "zod";

export const ProfileSchema = z.object({
  profileId: z.string().uuid(),
  displayName: z.string().min(1).default("New User"),
  photoURL: z.string().url().nullable().default(null),
  bio: z.string().max(400).default(""),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Get the user profile or create a default */
export async function getOrCreateUserProfile(uid: string): Promise<Profile> {
  const ref = adminDb.collection("users").doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data()!;
    return ProfileSchema.parse(data);
  }

  const now = Date.now();
  const doc: Profile = ProfileSchema.parse({
    profileId: randomUUID(),
    displayName: "New User",
    photoURL: null,
    bio: "",
    createdAt: now,
    updatedAt: now,
  });

  await ref.set(doc, { merge: false });
  return doc;
}

/** Update a subset (server utility) */
export async function updateUserProfile(uid: string, patch: Partial<Profile>) {
  const ref = adminDb.collection("users").doc(uid);
  await ref.set({ ...patch, updatedAt: Date.now() }, { merge: true });
}
```

> If your runtime doesn’t support `crypto.randomUUID()`, use the `uuid` package (`import { v4 as uuidv4 } from "uuid"`).

---

## Server: getOrCreateUserProfile

A typical server entry point is a **Route Handler** or a **Server Component**. Below is a minimal **Route Handler** that returns the profile JSON.

```ts
// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getOrCreateUserProfile } from "@/lib/firebase/service";

// Replace this with your real auth — e.g., read a Firebase Auth session cookie.
// For demo, we assume you have a UID in a header (X-Demo-UID) or similar.
function getUidFromRequest(req: Request): string | null {
  const demo = req.headers.get("x-demo-uid");
  return demo; // return null if unauthenticated
}

export async function GET(req: Request) {
  const uid = getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const profile = await getOrCreateUserProfile(uid);
  return NextResponse.json(profile, { status: 200 });
}
```

---

## Server Rendering `/profile`

Render on the server first for fast initial load:

```tsx
// app/profile/page.tsx
import { getOrCreateUserProfile } from "@/lib/firebase/service";
import ProfileClient from "./profile-client";

async function getUidFromCookies(): Promise<string | null> {
  // TODO: Verify Firebase session cookie or your auth cookie.
  // Return null if not logged in.
  return "demo-uid-123"; // Replace in real app
}

export default async function ProfilePage() {
  const uid = await getUidFromCookies();
  if (!uid) {
    // You could redirect to /login
    return <div>Please sign in</div>;
  }

  // Server fetch (and auto-create)
  const initialProfile = await getOrCreateUserProfile(uid);

  // Pass initial data + uid to the client component for real-time updates
  return <ProfileClient uid={uid} initialProfile={initialProfile} />;
}
```

---

## Client: Real‑Time Subscription

Subscribe to the same document on the client to keep the UI live.

```tsx
// app/profile/profile-client.tsx
"use client";

import { useEffect, useState } from "react";
import { clientDb } from "@/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import type { Profile } from "@/lib/firebase/service";

type Props = {
  uid: string;
  initialProfile: Profile;
};

export default function ProfileClient({ uid, initialProfile }: Props) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  useEffect(() => {
    const ref = doc(clientDb, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile({ ...(snap.data() as Profile) });
      }
    });

    return () => unsub();
  }, [uid]);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Profile</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <div><strong>Display Name:</strong> {profile.displayName}</div>
        <div><strong>Bio:</strong> {profile.bio || "—"}</div>
        <div><strong>Profile ID:</strong> {profile.profileId}</div>
        <div><strong>Updated:</strong> {new Date(profile.updatedAt).toLocaleString()}</div>
      </div>
    </main>
  );
}
```

> Because the doc was ensured on the server, `onSnapshot` will always find it and stream updates in real time.

---

## End‑to‑End Flow

1. User hits `/profile`.  
2. Server resolves `uid` and calls `getOrCreateUserProfile(uid)`.  
3. If no doc: server creates one under **`users/{uid}`** with a random `profileId` and defaults.  
4. Server returns the profile as **initial props**.  
5. Client hydrates and starts a Firestore `onSnapshot` on `users/{uid}`.  
6. Any changes (from this tab, another device, or a backend job) **instantly update the UI**.

---

## Validation & Types

We use **Zod** to validate documents at the server boundary. This avoids surprises if rules change or clients send malformed data. You can also create a Firestore converter to enforce types on the client.

**Optional client-side converter:**
```ts
import { FirestoreDataConverter } from "firebase/firestore";
import type { Profile } from "@/lib/firebase/service";

export const profileConverter: FirestoreDataConverter<Profile> = {
  toFirestore: (p) => p,
  fromFirestore: (snap) => snap.data() as Profile,
};
```

---

## Testing Locally

- Use the **Firebase Emulator Suite**:
  ```bash
  firebase emulators:start --only firestore,auth
  ```
- Set your client config to the emulator (or use `FIRESTORE_EMULATOR_HOST`).
- Create a test UID and hit `/profile` with `x-demo-uid: test-uid-1`.

---

## Common Pitfalls

- **Mixing Admin & Web SDK in the same runtime.**  
  Keep Admin on server-only files; keep Web SDK in client/browser code.

- **Leaking credentials to the client.**  
  Never expose service account keys. Use environment variables and server-only files.

- **No auth checks in rules.**  
  Lock the `users/{uid}` path so users can **only** see or edit their own doc.

- **Lack of idempotency on create.**  
  Always use `.doc(uid)` and `set()` so repeated requests don’t create duplicates.

- **Missing timestamps.**  
  Update `updatedAt` on any write for debugging and UI freshness.

---

## Minimal “Single File” firebase‑service (if you prefer)

If you truly want a single service module:

```ts
// lib/firebase-service.ts (Node-only APIs exported; client SDK exported separately)
import { randomUUID } from "crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

let db: Firestore;

function getAdminDb() {
  if (!db) {
    const app = getApps()[0] ?? initializeApp({
      // credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON!)),
    });
    db = getFirestore(app);
  }
  return db;
}

export type Profile = {
  profileId: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  createdAt: number;
  updatedAt: number;
};

export async function getOrCreateUserProfile(uid: string): Promise<Profile> {
  const adminDb = getAdminDb();
  const ref = adminDb.collection("users").doc(uid);
  const snap = await ref.get();
  if (snap.exists) return snap.data() as Profile;

  const now = Date.now();
  const doc: Profile = {
    profileId: randomUUID(),
    displayName: "New User",
    photoURL: null,
    bio: "",
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return doc;
}
```

Pair that with the earlier **client `onSnapshot`** example.

---

### That’s it!

You now have:
- Server‑side **existence check + auto‑create** in **`users`**.
- **Server‑rendered** initial profile.
- **Client** real‑time updates via Firestore.

Happy building!
