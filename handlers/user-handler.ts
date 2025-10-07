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

export async function userExists(userId: string): Promise<boolean> {
  try {
    const exists = await existsDoc("users", userId);
    return exists;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

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

export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const user = (await getOne<User>("users", userId)) as User | undefined;
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return undefined;
  }
}

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
