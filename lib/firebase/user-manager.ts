import {
	collection,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	onSnapshot,
	serverTimestamp,
	Unsubscribe,
	Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import type {
    User,
    CreateUserData,
    UserBadges,
    UserConnections,
    UserConnectionRequest,
} from "./types";

const USERS_COLLECTION = "users";

export const generateUserId = (): string => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export async function userExists(userId: string): Promise<boolean> {
	const ref = doc(db, USERS_COLLECTION, userId);
	const snap = await getDoc(ref);
	return snap.exists();
}

export async function getUser(userId: string): Promise<User | null> {
	const ref = doc(db, USERS_COLLECTION, userId);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	const data = snap.data() as any;
	const [badges] = await Promise.all([
		listUserBadges(userId),
	]);
	return {
		id: snap.id,
		firstName: data.firstName ?? "",
		lastName: data.lastName ?? "",
		email: data.email ?? "",
		profilePicture: data.profilePicture ?? "",
		biography: data.biography ?? "",
		displayedBadges: badges,
		createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
		updatedAt: (data.updatedAt as Timestamp) ?? Timestamp.now(),
	};
}

export async function createUser(
	userId: string,
	data: CreateUserData = {}
): Promise<User> {
	const now = serverTimestamp();
	const payload = {
		firstName: data.firstName ?? "",
		lastName: data.lastName ?? "",
		email: data.email ?? "",
		profilePicture: data.profilePicture ?? "",
		biography: data.biography ?? "",
		createdAt: now,
		updatedAt: now,
	};
	await setDoc(doc(db, USERS_COLLECTION, userId), payload);
	// Return with Timestamp placeholders; caller can refetch if needed
	const created = await getUser(userId);
	if (!created) throw new Error("Failed to create user");
	return created;
}

export async function updateUser(
	userId: string,
	data: Partial<CreateUserData>
): Promise<void> {
	await updateDoc(doc(db, USERS_COLLECTION, userId), {
		...data,
		updatedAt: serverTimestamp(),
	});
}

export async function deleteUser(userId: string): Promise<void> {
	await deleteDoc(doc(db, USERS_COLLECTION, userId));
}

export function subscribeToUser(
	userId: string,
	callback: (user: User | null) => void
): Unsubscribe {
	const ref = doc(db, USERS_COLLECTION, userId);
	return onSnapshot(
		ref,
		(snap) => {
			if (!snap.exists()) return callback(null);
			const data = snap.data() as any;
			// Also fetch subcollections on change
			listUserBadges(userId)
				.then((badges) => {
					callback({
						id: snap.id,
						firstName: data.firstName ?? "",
						lastName: data.lastName ?? "",
						email: data.email ?? "",
						profilePicture: data.profilePicture ?? "",
						biography: data.biography ?? "",
						displayedBadges: badges,
						createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
						updatedAt: (data.updatedAt as Timestamp) ?? Timestamp.now(),
					});
				})
				.catch(() => {
					callback({
						id: snap.id,
						firstName: data.firstName ?? "",
						lastName: data.lastName ?? "",
						email: data.email ?? "",
						profilePicture: data.profilePicture ?? "",
						biography: data.biography ?? "",
						displayedBadges: [],
						createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
						updatedAt: (data.updatedAt as Timestamp) ?? Timestamp.now(),
					});
				});
		},
		(err) => {
			console.error("subscribeToUser error", err);
			callback(null);
		}
	);
}

export async function getOrCreateUser(userId?: string): Promise<User> {
	const clerk = await currentUser().catch(() => null as any);
	const id = userId ?? (clerk?.id || generateUserId());
	const existing = await getUser(id);
	if (existing) {
		// Backfill missing fields from Clerk
		const primaryEmail = clerk?.primaryEmailAddress?.emailAddress
			?? clerk?.emailAddresses?.[0]?.emailAddress
			?? "";
		const patch: Partial<CreateUserData> = {};
		if (!existing.firstName && clerk?.firstName) patch.firstName = clerk.firstName;
		if (!existing.lastName && clerk?.lastName) patch.lastName = clerk.lastName;
		if (!existing.email && primaryEmail) patch.email = primaryEmail;
		if (!existing.profilePicture && clerk?.imageUrl) patch.profilePicture = clerk.imageUrl;
		if (Object.keys(patch).length) {
			await updateUser(id, patch);
			const updated = await getUser(id);
			if (updated) return updated;
		}
		return existing;
	}
	// Create with Clerk-derived defaults when available
	const email = clerk?.primaryEmailAddress?.emailAddress
		?? clerk?.emailAddresses?.[0]?.emailAddress
		?? "";
	return createUser(id, {
		firstName: clerk?.firstName ?? "",
		lastName: clerk?.lastName ?? "",
		email,
		profilePicture: clerk?.imageUrl ?? "",
		biography: "",
	});
}

// --- Subcollections ---------------------------------------------------------

import { collection as coll, getDocs, addDoc, doc as docRef, where } from "firebase/firestore";
import { existsDoc, addOne, getOne, queryOne } from "@/service/firebase-service";
import { currentUser } from "@clerk/nextjs/server";

const CONNECTIONS_SUB = "connections";
const REQUESTS_SUB = "connectionRequests";

export async function listUserBadges(userId: string): Promise<UserBadges[]> {
	const c = coll(db, `${USERS_COLLECTION}/${userId}/badges`);
	const snap = await getDocs(c);
	return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserBadges[];
}

export async function addUserBadge(userId: string, badge: Omit<UserBadges, "id">): Promise<string> {
	const c = coll(db, `${USERS_COLLECTION}/${userId}/badges`);
	const ref = await addDoc(c, badge as any);
	return ref.id;
}

export async function removeUserBadge(userId: string, badgeId: string): Promise<void> {
	await deleteDoc(docRef(db, `${USERS_COLLECTION}/${userId}/badges`, badgeId));
}

export async function listUserAwards(userId: string) {
	const c = coll(db, `${USERS_COLLECTION}/${userId}/awards`);
	const snap = await getDocs(c);
	return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function addUserAward(userId: string, award: { dateAwarded: Timestamp }) {
	const c = coll(db, `${USERS_COLLECTION}/${userId}/awards`);
	const ref = await addDoc(c, award as any);
	return ref.id;
}

export async function removeUserAward(userId: string, awardId: string) {
	await deleteDoc(docRef(db, `${USERS_COLLECTION}/${userId}/awards`, awardId));
}

export async function listUserAchievements(userId: string) {
	const c = coll(db, `${USERS_COLLECTION}/${userId}/achievements`);
	const snap = await getDocs(c);
	return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function addUserAchievement(userId: string, achievement: { dateAwarded: Timestamp }) {
	const c = coll(db, `${USERS_COLLECTION}/${userId}/achievements`);
	const ref = await addDoc(c, achievement as any);
	return ref.id;
}

export async function removeUserAchievement(userId: string, achievementId: string) {
	await deleteDoc(docRef(db, `${USERS_COLLECTION}/${userId}/achievements`, achievementId));
}

// --- Helpers using generic service (exists/add) -----------------------------

export async function userExistsViaService(userId: string): Promise<boolean> {
	try {
		return await existsDoc(USERS_COLLECTION, userId);
	} catch (error) {
		console.error("Error checking user existence:", error);
		return false;
	}
}

export async function createUserViaService(userData: User): Promise<string | undefined> {
	try {
		const exists = userData.id && (await userExistsViaService(userData.id));
		if (exists) return userData.id as string;

		const userId = userData.id || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

		// Write base profile fields only to root doc (badges via subcollection)
		const { firstName, lastName, email, profilePicture, biography } = userData;
		await addOne(
			USERS_COLLECTION,
			{ firstName, lastName, email, profilePicture, biography },
			userId,
			{ failIfExists: true }
		);

		// Optionally seed badges subcollection
		if (Array.isArray(userData.displayedBadges) && userData.displayedBadges.length) {
			await Promise.all(
				userData.displayedBadges.map((b) => addUserBadge(userId, { dateAwarded: b.dateAwarded }))
			);
		}

		return userId;
	} catch (error) {
		console.error("Error creating user:", error);
		return undefined;
	}
}

export async function getAndCreateUserViaService(user: User): Promise<void> {
	try {
		const exists = user.id && (await userExistsViaService(user.id));
		if (exists) return;
		await createUserViaService(user);
	} catch (error) {
		console.error("Error creating user:", error);
	}
}

// --- Authenticated user functions --------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
	try {
		const user = await currentUser();
		if (!user) return null;
		const userRecord = await getUserById(user.id);
		return userRecord || null;
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
}

export async function getUserById(userId: string): Promise<User | undefined> {
	try {
		const user = (await getOne<User>(USERS_COLLECTION, userId)) as User | undefined;
		if (!user) return undefined;
		
		// Fetch badges from subcollection
		const badges = await listUserBadges(userId);
		return {
			...user,
			displayedBadges: badges,
		};
	} catch (error) {
		console.error("Error fetching user by ID:", error);
		return undefined;
	}
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
	try {
		const user = (await queryOne<User>(USERS_COLLECTION, [
			where("email", "==", email),
		])) as User | undefined;

		if (!user) return undefined;
		
		// Fetch badges from subcollection
		const badges = await listUserBadges(user.id);
		return {
			...user,
			displayedBadges: badges,
		};
	} catch (error) {
		console.error("Error fetching user by email:", error);
		return undefined;
	}
}


// --- Connections -------------------------------------------------------------

export async function listConnections(userId: string, limit?: number): Promise<UserConnections[]> {
    const c = coll(db, `${USERS_COLLECTION}/${userId}/${CONNECTIONS_SUB}`);
    const snap = await getDocs(c);
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserConnections[];
    return typeof limit === "number" ? items.slice(0, Math.max(0, limit)) : items;
}

export async function areUsersConnected(a: string, b: string): Promise<boolean> {
    const ref = doc(db, `${USERS_COLLECTION}/${a}/${CONNECTIONS_SUB}`, b);
    const snap = await getDoc(ref);
    return snap.exists();
}

export async function removeConnection(a: string, b: string): Promise<void> {
    await Promise.all([
        deleteDoc(doc(db, `${USERS_COLLECTION}/${a}/${CONNECTIONS_SUB}`, b)),
        deleteDoc(doc(db, `${USERS_COLLECTION}/${b}/${CONNECTIONS_SUB}`, a)),
    ]);
}

// Requests
export async function listIncomingRequests(userId: string): Promise<UserConnectionRequest[]> {
    const c = coll(db, `${USERS_COLLECTION}/${userId}/${REQUESTS_SUB}`);
    const snap = await getDocs(c);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserConnectionRequest[];
}

export async function sendConnectionRequest(fromUserId: string, toUserId: string): Promise<void> {
    // Create/overwrite request document in recipient's requests subcollection
    await setDoc(doc(db, `${USERS_COLLECTION}/${toUserId}/${REQUESTS_SUB}`, fromUserId), {
        requestedOn: serverTimestamp(),
    });
}

export async function acceptConnectionRequest(userId: string, fromUserId: string): Promise<void> {
    // Create reciprocal connection docs with known ids
    const now = serverTimestamp();
    await Promise.all([
        setDoc(doc(db, `${USERS_COLLECTION}/${userId}/${CONNECTIONS_SUB}`, fromUserId), { connectedOn: now }),
        setDoc(doc(db, `${USERS_COLLECTION}/${fromUserId}/${CONNECTIONS_SUB}`, userId), { connectedOn: now }),
        deleteDoc(doc(db, `${USERS_COLLECTION}/${userId}/${REQUESTS_SUB}`, fromUserId)),
    ]);
}

export async function denyConnectionRequest(userId: string, fromUserId: string): Promise<void> {
    await deleteDoc(doc(db, `${USERS_COLLECTION}/${userId}/${REQUESTS_SUB}`, fromUserId));
}

export async function recommendConnections(userId: string, max: number = 5): Promise<string[]> {
    // Simple mutuals-based recommendation: users most connected to your connections, excluding already-connected and self
    const myConnections = await listConnections(userId);
    const mySet = new Set(myConnections.map((c) => c.id));
    mySet.add(userId);
    const counts = new Map<string, number>();
    await Promise.all(
        myConnections.map(async (c) => {
            const theirs = await listConnections(c.id);
            for (const t of theirs) {
                if (mySet.has(t.id)) continue;
                counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
            }
        })
    );
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([id]) => id);
}

export async function hasOutgoingRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    const ref = doc(db, `${USERS_COLLECTION}/${toUserId}/${REQUESTS_SUB}`, fromUserId);
    const snap = await getDoc(ref);
    return snap.exists();
}
