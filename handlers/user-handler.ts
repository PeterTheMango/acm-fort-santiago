import { Timestamp, where } from "firebase/firestore";
import {
  addOne,
  existsDoc,
  getOne,
  queryOne,
} from "../service/firebase-service";
import { randomUUID } from "crypto";

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  biography: string;
  displayedBadges: UserBadges[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserAwards {
  id: string;
  dateAwarded: Timestamp;
}

export interface UserAchievements {
  id: string;
  dateAwarded: Timestamp;
}

export interface UserBadges {
  id: string;
  dateAwarded: Timestamp;
}

export interface UserConnections {
  id: string;
  connectedOn: Timestamp;
}

/**
 * Determines if a user document exists for the given user ID.
 *
 * @param userId - The user's document ID in the "users" collection
 * @returns `true` if a user document with the given ID exists, `false` otherwise.
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const exists = await existsDoc("users", userId);
    return exists;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

/**
 * Create a user record and assign a generated id when one is not already provided.
 *
 * @param userData - The user object to persist; if `userData.id` is absent a new id will be assigned to it.
 * @returns The user's id when creation succeeds, or `undefined` if creation fails.
 */
export async function createUser(userData: User): Promise<string | undefined> {
  try {
    const exists = userData.id && (await userExists(userData.id));

    if (exists) return userData.id as string;

    const userId = randomUUID();

    userData.id = userId;

    const newUser = await addOne("users", userData, userId, {
      failIfExists: true,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return undefined;
  }
}

/**
 * Retrieve a user by the provided user's `id`, or create a new user and assign its id to the input object.
 *
 * If `user.id` exists and corresponds to an existing user, the input `user` is returned unchanged; otherwise a new user is created and its generated id is set on `user`.
 *
 * @param user - The user object to look up or create; when a new user is created, `user.id` will be populated with the new id
 * @returns The existing or newly created `User` with `id` populated, or `undefined` if creation fails or an error occurs
 */
export async function getOrCreateUser(user: User): Promise<User | undefined> {
  try {
    const exists = user.id && (await userExists(user.id));

    if (exists) return user;

    const newUserId = await createUser(user);

    if (!newUserId) return undefined;

    user.id = newUserId;

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return undefined;
  }
}

/**
 * Retrieve a user document by its ID from the "users" collection.
 *
 * @param userId - The user's unique identifier
 * @returns The matching `User` if found, `undefined` otherwise
 */
export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const user = (await getOne<User>("users", userId)) as User | undefined;
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return undefined;
  }
}

/**
 * Retrieve a user from the "users" collection by email address.
 *
 * @param email - The email address to look up.
 * @returns The matching `User` if found, `undefined` otherwise.
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = (await queryOne<User>("users", [
      where("email", "==", email),
    ])) as User | undefined;

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return undefined;
  }
}