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
}

export interface UserConnections {
    id: string;
    connectedOn: Timestamp;
}

export interface UserConnectionRequest {
    id: string; // requester user id
    requestedOn: Timestamp;
}


