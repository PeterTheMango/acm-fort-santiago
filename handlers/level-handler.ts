import {
  Timestamp,
  orderBy,
  getDocs,
  collection,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getOne, addOne, patchOne, list } from "../service/firebase-service";
import { db } from "../firebase";

export interface Level {
  id: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LevelHistory {
  experienceGained: number;
  date: Timestamp;
}

export interface WeeklyLevelHistory {
  experienceGained: number;
  date: Timestamp;
}

export interface DailyLevelHistory {
  experienceGained: number;
  date: Timestamp;
}

/**
 * Computes the experience required to advance from the given level to the next level.
 *
 * @param level - The current numeric level
 * @returns The experience points required to reach the next level
 */
function calculateExperienceToNextLevel(level: number): number {
  return 100 * level;
}

/**
 * Compute the user's cumulative total experience given their current level and progress within that level.
 *
 * @param level - The user's current level (1-based)
 * @param remainingExp - Experience points already earned toward the next level
 * @returns The total accumulated experience across all completed levels plus `remainingExp`
 */
function calculateTotalExperience(level: number, remainingExp: number): number {
  let totalExp = remainingExp;
  // Sum up all XP required for previous levels
  for (let i = 1; i < level; i++) {
    totalExp += calculateExperienceToNextLevel(i);
  }
  return totalExp;
}

/**
 * Derives the current level and remaining experience from a cumulative total experience value.
 *
 * @param totalExperience - The user's total accumulated experience points across all levels
 * @returns An object with `level` set to the current level and `experience` set to the remaining experience toward the next level
 */
function calculateLevelAndExperience(totalExperience: number): {
  level: number;
  experience: number;
} {
  let level = 1;
  let remainingExp = totalExperience;
  let expRequired = calculateExperienceToNextLevel(level);

  while (remainingExp >= expRequired) {
    remainingExp -= expRequired;
    level++;
    expRequired = calculateExperienceToNextLevel(level);
  }

  return { level, experience: remainingExp };
}

/**
 * Fetches the Level record for a given user from the "levels" collection.
 *
 * @param userId - The user's identifier; must be a non-empty string.
 * @returns The user's Level record if found, `undefined` if no record exists.
 * @throws Error if `userId` is empty or if retrieval from the data store fails.
 */
export async function getUserLevel(
  userId: string
): Promise<Level | undefined> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const level = await getOne<Level>("levels", userId);
    return level ?? undefined;
  } catch (error) {
    throw new Error(`Failed to get user level: ${(error as Error).message}`);
  }
}

/**
 * Adds experience to a user's account, updating their level and recording history.
 *
 * @param userId - The ID of the user to credit experience to
 * @param experience - The amount of experience to add (must be greater than 0)
 * @throws When `userId` is empty, when `experience` is not greater than 0, or when the persistence/update operations fail
 */
export async function giveExperience(
  userId: string,
  experience: number
): Promise<void> {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (experience <= 0) {
    throw new Error("experience must be greater than 0");
  }

  try {
    const existingRecord = await getOne<Level>("levels", userId);

    if (existingRecord) {
      // Calculate total cumulative experience, then add the new experience
      const currentTotalExp = calculateTotalExperience(
        existingRecord.level,
        existingRecord.experience
      );
      const newTotalExperience = currentTotalExp + experience;
      const { level: newLevel, experience: remainingExp } =
        calculateLevelAndExperience(newTotalExperience);
      const experienceToNextLevel = calculateExperienceToNextLevel(newLevel);

      await patchOne<Level>("levels", userId, {
        experience: remainingExp,
        level: newLevel,
        experienceToNextLevel,
      });
    } else {
      const { level, experience: remainingExp } =
        calculateLevelAndExperience(experience);
      const experienceToNextLevel = calculateExperienceToNextLevel(level);

      await addOne(
        "levels",
        {
          id: userId,
          level,
          experience: remainingExp,
          experienceToNextLevel,
        } as Partial<Level>,
        userId,
        { merge: true }
      );
    }

    // Add to history collections
    // level-history as subcollection under users/{userId}/level-history
    await addOne(`users/${userId}/level-history`, {
      experienceGained: experience,
      date: Timestamp.now(),
    });

    // weekly and daily use userId as document ID - increment experience
    const weeklyRecord = await getOne<WeeklyLevelHistory>("weekly-level-history", userId);
    await addOne(
      "weekly-level-history",
      {
        experienceGained: (weeklyRecord?.experienceGained ?? 0) + experience,
        date: Timestamp.now(),
      },
      userId,
      { merge: true }
    );

    const dailyRecord = await getOne<DailyLevelHistory>("daily-level-history", userId);
    await addOne(
      "daily-level-history",
      {
        experienceGained: (dailyRecord?.experienceGained ?? 0) + experience,
        date: Timestamp.now(),
      },
      userId,
      { merge: true }
    );
  } catch (error) {
    throw new Error(
      `Failed to give experience: ${(error as Error).message}`
    );
  }
}

/**
 * Deducts experience points from a user's level record and updates the stored level, remaining experience, and experience-to-next-level.
 *
 * Total experience is floored at zero; level and remaining experience are recalculated from the resulting total.
 *
 * @param userId - The ID of the user whose experience will be reduced
 * @param experience - The amount of experience to remove (must be greater than 0)
 * @throws If `userId` is empty
 * @throws If `experience` is not greater than 0
 * @throws If the user's level record does not exist
 * @throws If the update operation fails
 */
export async function removeExperience(
  userId: string,
  experience: number
): Promise<void> {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (experience <= 0) {
    throw new Error("experience must be greater than 0");
  }

  try {
    const existingRecord = await getOne<Level>("levels", userId);

    if (!existingRecord) {
      throw new Error("User level record not found");
    }

    // Calculate total cumulative experience, then subtract
    const currentTotalExp = calculateTotalExperience(
      existingRecord.level,
      existingRecord.experience
    );
    const newTotalExperience = Math.max(0, currentTotalExp - experience);
    const { level: newLevel, experience: remainingExp } =
      calculateLevelAndExperience(newTotalExperience);
    const experienceToNextLevel = calculateExperienceToNextLevel(newLevel);

    await patchOne<Level>("levels", userId, {
      experience: remainingExp,
      level: newLevel,
      experienceToNextLevel,
    });
  } catch (error) {
    throw new Error(
      `Failed to remove experience: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieves a user's weekly aggregated level history record.
 *
 * @param userId - The user's unique identifier used to locate their weekly history document
 * @returns The user's WeeklyLevelHistory record if present, `undefined` otherwise
 * @throws If `userId` is empty or the retrieval operation fails
 */
export async function getWeeklyLevelHistory(
  userId: string
): Promise<WeeklyLevelHistory | undefined> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const record = await getOne<WeeklyLevelHistory>("weekly-level-history", userId);
    return record ?? undefined;
  } catch (error) {
    throw new Error(
      `Failed to get weekly level history: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieve a user's daily level history record.
 *
 * @param userId - The ID of the user whose daily history to retrieve
 * @returns The user's `DailyLevelHistory` record, or `undefined` if no record exists
 * @throws If `userId` is empty. If the lookup fails, throws an error with the underlying message.
 */
export async function getDailyLevelHistory(
  userId: string
): Promise<DailyLevelHistory | undefined> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const record = await getOne<DailyLevelHistory>("daily-level-history", userId);
    return record ?? undefined;
  } catch (error) {
    throw new Error(
      `Failed to get daily level history: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieves the top users ranked by level and experience.
 *
 * @param limit - Maximum number of users to return
 * @returns An array of Level records ordered by `level` descending then `experience` descending
 * @throws Error if `limit` is less than or equal to zero or if the retrieval fails
 */
export async function getTopUsersByLevel(limit: number): Promise<Level[]> {
  if (limit <= 0) {
    throw new Error("limit must be greater than 0");
  }

  try {
    const { items } = await list<Level>("levels", {
      orders: [orderBy("level", "desc"), orderBy("experience", "desc")],
      pageSize: limit,
    });

    return items;
  } catch (error) {
    throw new Error(
      `Failed to get top users by level: ${(error as Error).message}`
    );
  }
}

/**
 * Fetches a user's level-history entries ordered by date from newest to oldest.
 *
 * @param userId - The ID of the user whose level history will be retrieved
 * @returns An array of level history records for the user, ordered from newest to oldest
 * @throws If `userId` is empty
 * @throws If retrieving the history from the database fails
 */
export async function getUserLevelHistory(
  userId: string
): Promise<LevelHistory[]> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const { items } = await list<LevelHistory>(`users/${userId}/level-history`, {
      orders: [orderBy("date", "desc")],
    });

    return items;
  } catch (error) {
    throw new Error(
      `Failed to get user level history: ${(error as Error).message}`
    );
  }
}

/**
 * Deletes all entries in the "weekly-level-history" Firestore collection.
 *
 * @throws An Error if retrieving or deleting documents from the collection fails.
 */
export async function resetWeeklyLevels(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, "weekly-level-history"));
    const deletePromises = snapshot.docs.map((document) =>
      deleteDoc(doc(db, "weekly-level-history", document.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(
      `Failed to reset weekly levels: ${(error as Error).message}`
    );
  }
}

/**
 * Deletes all documents from the "daily-level-history" Firestore collection.
 *
 * @throws Error if the reset operation fails.
 */
export async function resetDailyLevels(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, "daily-level-history"));
    const deletePromises = snapshot.docs.map((document) =>
      deleteDoc(doc(db, "daily-level-history", document.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(
      `Failed to reset daily levels: ${(error as Error).message}`
    );
  }
}