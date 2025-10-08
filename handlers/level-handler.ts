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

// Calculate XP needed for next level (100 XP per level)
function calculateExperienceToNextLevel(level: number): number {
  return 100 * level;
}

// Calculate total cumulative experience from level and remaining experience
function calculateTotalExperience(level: number, remainingExp: number): number {
  let totalExp = remainingExp;
  // Sum up all XP required for previous levels
  for (let i = 1; i < level; i++) {
    totalExp += calculateExperienceToNextLevel(i);
  }
  return totalExp;
}

// Calculate level and remaining experience based on total experience
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
