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

/**
 * Adds the specified number of points to the user's points record, creating the record if one does not exist.
 *
 * @param userId - The identifier of the user to receive points
 * @param points - The number of points to add; must be greater than 0
 * @throws If `userId` is falsy, if `points` is not greater than 0, or if the underlying datastore operation fails
 */
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

/**
 * Decreases a user's points by a specified amount, clamping the result at zero.
 *
 * @param userId - The ID of the user whose points will be decreased
 * @param points - The number of points to remove; must be greater than 0
 * @throws If `userId` is falsy
 * @throws If `points` is less than or equal to 0
 * @throws If the user's points record does not exist
 * @throws If the operation fails due to an underlying data-access error
 */
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

/**
 * Retrieve the current points total for a user.
 *
 * @returns The user's points total; `0` if no points record exists for the user.
 */
export async function getPoints(userId: string): Promise<number> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const record = await getOne<UserPoints>("points", userId);
    return record?.points ?? 0;
  } catch (error) {
    throw new Error(`Failed to get points: ${(error as Error).message}`);
  }
}

/**
 * Retrieves the user record that currently has the highest points.
 *
 * @returns The `UserPoints` record with the highest `points`, or `null` if no points records exist.
 */
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

/**
 * Retrieves a user's points history ordered from newest to oldest.
 *
 * @param userId - The id of the user whose points history to retrieve
 * @returns An array of UserPointsHistory records ordered by `date` descending, or `null` if no records exist
 * @throws If `userId` is falsy
 * @throws If fetching the history fails
 */
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