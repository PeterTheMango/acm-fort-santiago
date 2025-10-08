import { Timestamp } from "firebase/firestore";

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

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	profilePicture: string;
	biography: string;
	displayedBadges: UserBadges[];
	userSetup: boolean;
	completedChallenges: number;
	role?: "admin" | "user";
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export interface CreateUserData {
	firstName?: string;
	lastName?: string;
	email?: string;
	profilePicture?: string;
	biography?: string;
	displayedBadges?: UserBadges[];
	userSetup?: boolean;
	completedChallenges?: number;
}

export interface UserConnections {
    id: string;
    connectedOn: Timestamp;
}

export interface UserConnectionRequest {
    id: string; // requester user id
    requestedOn: Timestamp;
}

export interface FirestoreUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
    biography?: string;
    userSetup?: boolean;
    completedChallenges?: number;
    role?: "admin" | "user";
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface FirestoreDocData {
    [key: string]: unknown;
}

