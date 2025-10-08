import { Timestamp, orderBy, where } from "firebase/firestore";
import { User } from "./user-handler";
import { getOne, addOne, patchOne, list } from "../service/firebase-service";

interface UserPoints {
  id: User["id"];
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserPointsHistory {
  id: User["id"];
  points: number;
  date: Timestamp;
}

export async function givePoints(
  userId: string,
  points: number
): Promise<void> {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (points <= 0) {
    throw new Error("points must be greater than 0");
  }

  try {
    const existingRecord = await getOne<UserPoints>("points", userId);

    if (existingRecord) {
      const newPoints = existingRecord.points + points;
      await patchOne<UserPoints>("points", userId, { points: newPoints });
    } else {
      await addOne(
        "points",
        { id: userId, points } as Partial<UserPoints>,
        userId,
        { merge: true }
      );
    }
  } catch (error) {
    throw new Error(`Failed to give points: ${(error as Error).message}`);
  }
}

export async function removePoints(
  userId: string,
  points: number
): Promise<void> {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (points <= 0) {
    throw new Error("points must be greater than 0");
  }

  try {
    const existingRecord = await getOne<UserPoints>("points", userId);

    if (!existingRecord) {
      throw new Error("User points record not found");
    }

    const newPoints = Math.max(0, existingRecord.points - points);
    await patchOne<UserPoints>("points", userId, { points: newPoints });
  } catch (error) {
    throw new Error(`Failed to remove points: ${(error as Error).message}`);
  }
}

export async function getPoints(userId: string): Promise<number> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const record = await getOne<UserPoints>("points", userId);
    return record?.points ?? 0;
  } catch (error) {
    throw new Error(`Failed to get points for user ${userId}: ${(error as Error).message}`);
  }
}

export async function getHighestPointsUser(): Promise<UserPoints | null> {
  try {
    const { items } = await list<UserPoints>("points", {
      orders: [orderBy("points", "desc")],
      pageSize: 1,
    });

    return items.length > 0 ? items[0] : null;
  } catch (error) {
    throw new Error(
      `Failed to get highest points user: ${(error as Error).message}`
    );
  }
}

export async function getUserPointsHistory(
  userId: string
): Promise<UserPointsHistory[] | null> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const { items } = await list<UserPointsHistory>("point-history", {
      filters: [where("id", "==", userId)],
      orders: [orderBy("date", "desc")],
    });

    return items.length > 0 ? items : null;
  } catch (error) {
    throw new Error(
      `Failed to get user points history: ${(error as Error).message}`
    );
  }
}
