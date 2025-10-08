import { Timestamp } from "firebase/firestore";
import { getOne, addOne, patchOne } from "../service/firebase-service";

export interface UserStreak {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Gets or creates a user's streak record.
 */
export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const streak = await getOne<UserStreak>("user-streaks", userId);
    return streak;
  } catch (error) {
    console.error("Error getting user streak:", error);
    return null;
  }
}

/**
 * Checks if two dates are on consecutive days.
 */
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Checks if two dates are on the same day.
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Updates a user's streak. Can only be updated once per day.
 * Returns updated streak info and whether the update was successful.
 */
export async function updateStreak(
  userId: string
): Promise<{ success: boolean; streak: UserStreak | null; alreadyUpdatedToday: boolean }> {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const existingStreak = await getOne<UserStreak>("user-streaks", userId);
    const now = new Date();

    if (existingStreak) {
      const lastActivityDate = existingStreak.lastActivityDate.toDate();

      // Check if already updated today
      if (isSameDay(lastActivityDate, now)) {
        return {
          success: false,
          streak: existingStreak,
          alreadyUpdatedToday: true,
        };
      }

      // Check if streak continues (consecutive day)
      const isConsecutive = isConsecutiveDay(lastActivityDate, now);
      const newStreak = isConsecutive
        ? existingStreak.currentStreak + 1
        : 1; // Reset to 1 if not consecutive

      const updatedData: Partial<UserStreak> = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, existingStreak.longestStreak),
        lastActivityDate: Timestamp.now(),
      };

      await patchOne<UserStreak>("user-streaks", userId, updatedData);

      return {
        success: true,
        streak: {
          ...existingStreak,
          ...updatedData,
        } as UserStreak,
        alreadyUpdatedToday: false,
      };
    } else {
      // Create new streak record
      const newStreakData: Partial<UserStreak> = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: Timestamp.now(),
      };

      await addOne("user-streaks", newStreakData, userId, { merge: true });

      return {
        success: true,
        streak: {
          id: userId,
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        alreadyUpdatedToday: false,
      };
    }
  } catch (error) {
    console.error("Error updating streak:", error);
    return { success: false, streak: null, alreadyUpdatedToday: false };
  }
}

/**
 * Checks if a user has already updated their streak today.
 */
export async function hasUpdatedStreakToday(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const streak = await getOne<UserStreak>("user-streaks", userId);
    if (!streak) {
      return false;
    }

    const now = new Date();
    const lastActivityDate = streak.lastActivityDate.toDate();

    return isSameDay(lastActivityDate, now);
  } catch (error) {
    console.error("Error checking streak today:", error);
    return false;
  }
}
