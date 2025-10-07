import {
  Timestamp,
  orderBy,
  where,
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
  id: string;
  experienceGained: number;
  date: Timestamp;
}

export interface WeeklyLevelHistory {
  id: string;
  experienceGained: number;
  date: Timestamp;
}

export interface DailyLevelHistory {
  id: string;
  experienceGained: number;
  date: Timestamp;
}

// Calculate XP needed for next level (100 XP per level)
function calculateExperienceToNextLevel(level: number): number {
  return 100 * level;
}

// Calculate level based on total experience
function calculateLevel(totalExperience: number): number {
  let level = 1;
  let expRequired = calculateExperienceToNextLevel(level);

  while (totalExperience >= expRequired) {
    totalExperience -= expRequired;
    level++;
    expRequired = calculateExperienceToNextLevel(level);
  }

  return level;
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
      const newExperience = existingRecord.experience + experience;
      const newLevel = calculateLevel(newExperience);
      const experienceToNextLevel = calculateExperienceToNextLevel(newLevel);

      await patchOne<Level>("levels", userId, {
        experience: newExperience,
        level: newLevel,
        experienceToNextLevel,
      });
    } else {
      const level = 1;
      const experienceToNextLevel = calculateExperienceToNextLevel(level);

      await addOne(
        "levels",
        {
          id: userId,
          level,
          experience,
          experienceToNextLevel,
        } as Partial<Level>,
        userId,
        { merge: true }
      );
    }

    // Add to history collections
    await addOne("level-history", {
      id: userId,
      experienceGained: experience,
      date: Timestamp.now(),
    });

    await addOne("weekly-level-history", {
      id: userId,
      experienceGained: experience,
      date: Timestamp.now(),
    });

    await addOne("daily-level-history", {
      id: userId,
      experienceGained: experience,
      date: Timestamp.now(),
    });
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

    const newExperience = Math.max(0, existingRecord.experience - experience);
    const newLevel = calculateLevel(newExperience);
    const experienceToNextLevel = calculateExperienceToNextLevel(newLevel);

    await patchOne<Level>("levels", userId, {
      experience: newExperience,
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
): Promise<WeeklyLevelHistory[] | undefined> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const { items } = await list<WeeklyLevelHistory>("weekly-level-history", {
      filters: [where("id", "==", userId)],
      orders: [orderBy("date", "desc")],
    });

    return items.length > 0 ? items : undefined;
  } catch (error) {
    throw new Error(
      `Failed to get weekly level history: ${(error as Error).message}`
    );
  }
}

export async function getDailyLevelHistory(
  userId: string
): Promise<DailyLevelHistory[] | undefined> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const { items } = await list<DailyLevelHistory>("daily-level-history", {
      filters: [where("id", "==", userId)],
      orders: [orderBy("date", "desc")],
    });

    return items.length > 0 ? items : undefined;
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
    const { items } = await list<LevelHistory>("level-history", {
      filters: [where("id", "==", userId)],
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
