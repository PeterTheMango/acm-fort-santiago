import { Timestamp, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  addOne,
  getOne,
  patchOne,
  list,
  queryMany,
  removeOne,
} from "../service/firebase-service";
import { givePoints } from "./points-handler";
import {
  giveExperience,
  resetWeeklyLevels,
  resetDailyLevels,
} from "./level-handler";
import { db } from "@/firebase";

/**
 * Increments the completedChallenges counter for a user.
 */
async function incrementCompletedChallenges(userId: string): Promise<void> {
  const user = await getOne<{ completedChallenges?: number }>("users", userId);
  if (!user) throw new Error("User not found");

  await updateDoc(doc(db, "users", userId), {
    completedChallenges: (user.completedChallenges || 0) + 1,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// Daily Trivia Quiz Interfaces
// ============================================================================

export interface TriviaReward {
  type: "xp" | "points";
  value: number;
}

export interface DailyTrivia {
  id?: string;
  question: string;
  correctAnswer: string;
  choices: string[];
  rewards: TriviaReward[];
  startDate: Timestamp;
  endDate: Timestamp;
  status: "active" | "ended" | "scheduled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TriviaAnswer {
  id?: string;
  triviaId: string;
  userId: string;
  answer: string;
  answeredAt: Timestamp;
  isCorrect: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Community Quest Interfaces
// ============================================================================

export interface QuestReward {
  type: "xp" | "points" | "badge";
  value: number | string; // number for xp/points, string for badge ID
  tier: "all" | "top" | "first"; // all contributors, top X contributor, or first X contributor
  count?: number; // number of top/first contributors to reward (e.g., top 3, first 5)
}

export interface CommunityQuest {
  id?: string;
  title: string;
  description: string;
  questType: "gain_experience" | "answer_trivia" | "gain_points" | "level_up";
  targetContributors: number; // For gain quests: total XP/points goal; For count quests: number of unique contributors
  currentContributors: number; // For gain quests: total accumulated XP/points; For count quests: number of unique contributors
  rewards: QuestReward[];
  status: "active" | "completed";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Platform Announcement Interfaces
// ============================================================================

export interface PlatformAnnouncement {
  id?: string;
  message: string;
  type: "warning" | "success" | "info";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================================================
// Daily Trivia Quiz Functions
// ============================================================================

/**
 * Creates a new daily trivia quiz.
 */
export async function createDailyTrivia(
  trivia: Omit<DailyTrivia, "id" | "createdAt" | "updatedAt">
): Promise<string | undefined> {
  try {
    const triviaId = await addOne("daily-trivia", trivia);
    return triviaId;
  } catch (error) {
    console.error("Error creating daily trivia:", error);
    return undefined;
  }
}

/**
 * Updates a daily trivia quiz.
 */
export async function updateDailyTrivia(
  triviaId: string,
  updates: Partial<DailyTrivia>
): Promise<void> {
  try {
    await patchOne("daily-trivia", triviaId, updates);
  } catch (error) {
    console.error("Error updating daily trivia:", error);
    throw error;
  }
}

/**
 * Ends a daily trivia quiz by setting its status to "ended".
 */
export async function endDailyTrivia(triviaId: string): Promise<void> {
  try {
    await patchOne("daily-trivia", triviaId, { status: "ended" });
  } catch (error) {
    console.error("Error ending daily trivia:", error);
    throw error;
  }
}

/**
 * Deletes a daily trivia quiz.
 */
export async function deleteDailyTrivia(triviaId: string): Promise<void> {
  try {
    await removeOne("daily-trivia", triviaId);
  } catch (error) {
    console.error("Error deleting daily trivia:", error);
    throw error;
  }
}

/**
 * Retrieves all daily trivia quizzes.
 */
export async function getAllDailyTrivia(): Promise<DailyTrivia[]> {
  try {
    const { items } = await list<DailyTrivia>("daily-trivia");
    return items;
  } catch (error) {
    console.error("Error fetching daily trivia:", error);
    return [];
  }
}

/**
 * Retrieves the active daily trivia quiz for today.
 */
export async function getActiveDailyTrivia(): Promise<DailyTrivia | null> {
  try {
    const now = Timestamp.now();
    const { items } = await queryMany<DailyTrivia>("daily-trivia", [
      where("status", "==", "active"),
      where("startDate", "<=", now),
      where("endDate", ">=", now),
    ]);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error("Error fetching active daily trivia:", error);
    return null;
  }
}

/**
 * Submits an answer to a daily trivia quiz.
 */
export async function submitTriviaAnswer(
  triviaId: string,
  userId: string,
  answer: string
): Promise<{ success: boolean; isCorrect: boolean; rewards?: TriviaReward[] }> {
  try {
    // Check if user already answered this trivia
    const { items: existingAnswers } = await queryMany<TriviaAnswer>(
      "trivia-answers",
      [where("triviaId", "==", triviaId), where("userId", "==", userId)]
    );

    if (existingAnswers.length > 0) {
      return { success: false, isCorrect: false };
    }

    // Get the trivia question
    const trivia = await getOne<DailyTrivia>("daily-trivia", triviaId);
    if (!trivia) {
      return { success: false, isCorrect: false };
    }

    const isCorrect = answer === trivia.correctAnswer;

    // Record the answer
    await addOne("trivia-answers", {
      triviaId,
      userId,
      answer,
      answeredAt: Timestamp.now(),
      isCorrect,
    } as Partial<TriviaAnswer>);

    // Award rewards if correct
    if (isCorrect && trivia.rewards) {
      for (const reward of trivia.rewards) {
        if (reward.type === "xp") {
          await giveExperience(userId, reward.value);
        } else if (reward.type === "points") {
          await givePoints(userId, reward.value);
        }
      }
      // Increment completed challenges counter
      await incrementCompletedChallenges(userId);

      // Track quest contribution for answer_trivia quests
      await trackQuestContribution(userId, "answer_trivia", 1);
    }

    return {
      success: true,
      isCorrect,
      rewards: isCorrect ? trivia.rewards : undefined,
    };
  } catch (error) {
    console.error("Error submitting trivia answer:", error);
    return { success: false, isCorrect: false };
  }
}

/**
 * Checks if a user has already answered a specific trivia.
 */
export async function hasUserAnsweredTrivia(
  triviaId: string,
  userId: string
): Promise<boolean> {
  try {
    const { items } = await queryMany<TriviaAnswer>("trivia-answers", [
      where("triviaId", "==", triviaId),
      where("userId", "==", userId),
    ]);
    return items.length > 0;
  } catch (error) {
    console.error("Error checking trivia answer:", error);
    return false;
  }
}

// ============================================================================
// Community Quest Contribution Interface
// ============================================================================

export interface QuestContribution {
  id?: string;
  questId: string;
  userId: string;
  submissionUrl?: string;
  submissionText?: string;
  contributionValue: number; // The amount contributed (e.g., XP gained, points earned)
  contributedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Community Quest Functions
// ============================================================================

/**
 * Creates a new community quest.
 */
export async function createCommunityQuest(
  quest: Omit<CommunityQuest, "id" | "createdAt" | "updatedAt">
): Promise<string | undefined> {
  try {
    const questId = await addOne("community-quests", quest);
    return questId;
  } catch (error) {
    console.error("Error creating community quest:", error);
    return undefined;
  }
}

/**
 * Updates a community quest.
 */
export async function updateCommunityQuest(
  questId: string,
  updates: Partial<CommunityQuest>
): Promise<void> {
  try {
    await patchOne("community-quests", questId, updates);
  } catch (error) {
    console.error("Error updating community quest:", error);
    throw error;
  }
}

/**
 * Deletes a community quest.
 */
export async function deleteCommunityQuest(questId: string): Promise<void> {
  try {
    await removeOne("community-quests", questId);
  } catch (error) {
    console.error("Error deleting community quest:", error);
    throw error;
  }
}

/**
 * Retrieves all community quests.
 */
export async function getAllCommunityQuests(): Promise<CommunityQuest[]> {
  try {
    const { items } = await list<CommunityQuest>("community-quests");
    return items;
  } catch (error) {
    console.error("Error fetching community quests:", error);
    return [];
  }
}

/**
 * Gets active community quests.
 */
export async function getActiveCommunityQuests(): Promise<CommunityQuest[]> {
  try {
    const { items } = await queryMany<CommunityQuest>("community-quests", [
      where("status", "==", "active"),
    ]);
    return items;
  } catch (error) {
    console.error("Error fetching active community quests:", error);
    return [];
  }
}

/**
 * Submits a manual contribution to a community quest (legacy function for manual submissions).
 * @deprecated Use trackQuestContribution for automatic quest tracking instead.
 */
export async function submitQuestContribution(
  questId: string,
  userId: string,
  submissionUrl: string,
  submissionText: string
): Promise<{ success: boolean; alreadyContributed: boolean }> {
  try {
    // Check if user already contributed to this quest
    const { items: existingContributions } = await queryMany<QuestContribution>(
      "quest-contributions",
      [where("questId", "==", questId), where("userId", "==", userId)]
    );

    if (existingContributions.length > 0) {
      return { success: false, alreadyContributed: true };
    }

    // Get the quest
    const quest = await getOne<CommunityQuest>("community-quests", questId);
    if (!quest) {
      return { success: false, alreadyContributed: false };
    }

    // Record the contribution
    await addOne("quest-contributions", {
      questId,
      userId,
      submissionUrl,
      submissionText,
      contributionValue: 1,
      contributedAt: Timestamp.now(),
    } as Partial<QuestContribution>);

    // Update quest contributor count
    const newContributorCount = quest.currentContributors + 1;
    await patchOne("community-quests", questId, {
      currentContributors: newContributorCount,
    });

    // Check if quest is completed
    if (newContributorCount >= quest.targetContributors) {
      await completeQuest(questId);
    }

    // Increment completed challenges counter
    await incrementCompletedChallenges(userId);

    return { success: true, alreadyContributed: false };
  } catch (error) {
    console.error("Error submitting quest contribution:", error);
    return { success: false, alreadyContributed: false };
  }
}

/**
 * Checks if a user has already contributed to a specific quest.
 */
export async function hasUserContributedToQuest(
  questId: string,
  userId: string
): Promise<boolean> {
  try {
    const { items } = await queryMany<QuestContribution>("quest-contributions", [
      where("questId", "==", questId),
      where("userId", "==", userId),
    ]);
    return items.length > 0;
  } catch (error) {
    console.error("Error checking quest contribution:", error);
    return false;
  }
}

/**
 * Gets all contributions for a specific quest.
 */
export async function getQuestContributions(
  questId: string
): Promise<QuestContribution[]> {
  try {
    const { items } = await queryMany<QuestContribution>("quest-contributions", [
      where("questId", "==", questId),
    ]);
    return items;
  } catch (error) {
    console.error("Error fetching quest contributions:", error);
    return [];
  }
}

/**
 * Tracks automatic quest contributions based on user actions.
 * Called when a user gains experience, points, answers trivia, or levels up.
 */
export async function trackQuestContribution(
  userId: string,
  questType: CommunityQuest["questType"],
  contributionValue: number = 1
): Promise<void> {
  try {
    // Get all active quests of this type
    const { items: activeQuests } = await queryMany<CommunityQuest>(
      "community-quests",
      [
        where("status", "==", "active"),
        where("questType", "==", questType),
      ]
    );

    // Track contribution for each matching quest
    for (const quest of activeQuests) {
      const questId = quest.id || quest.docId;
      if (!questId) continue;

      // Check if user already contributed to this quest
      const { items: existingContributions } = await queryMany<QuestContribution>(
        "quest-contributions",
        [
          where("questId", "==", questId),
          where("userId", "==", userId),
        ]
      );

      // Determine if this is a "gain" quest (cumulative) or "count" quest (unique contributors)
      const isGainQuest = questType === "gain_experience" || questType === "gain_points";

      // Always add a new contribution record
      await addOne("quest-contributions", {
        questId,
        userId,
        contributionValue,
        contributedAt: Timestamp.now(),
      } as Partial<QuestContribution>);

      if (isGainQuest) {
        // For gain quests: add to cumulative total
        const newTotal = quest.currentContributors + contributionValue;
        await patchOne("community-quests", questId, {
          currentContributors: newTotal,
        });

        // Check if quest is completed
        if (newTotal >= quest.targetContributors) {
          await completeQuest(questId);
        }
      } else {
        // For count quests: increment unique contributor count only if this is their first contribution
        if (existingContributions.length === 0) {
          const newContributorCount = quest.currentContributors + 1;
          await patchOne("community-quests", questId, {
            currentContributors: newContributorCount,
          });

          // Check if quest is completed
          if (newContributorCount >= quest.targetContributors) {
            await completeQuest(questId);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error tracking quest contribution:", error);
  }
}

/**
 * Completes a quest and distributes rewards to all contributors.
 */
async function completeQuest(questId: string): Promise<void> {
  try {
    // Get the quest
    const quest = await getOne<CommunityQuest>("community-quests", questId);
    if (!quest) return;

    // Mark quest as completed
    await patchOne("community-quests", questId, { status: "completed" });

    // Get all contributors
    const contributions = await getQuestContributions(questId);

    // Aggregate contributions by user (sum all contributions per user)
    const userContributions = new Map<string, { userId: string; totalValue: number; firstContribution: number }>();

    for (const contribution of contributions) {
      const existing = userContributions.get(contribution.userId);
      if (existing) {
        existing.totalValue += contribution.contributionValue;
        // Keep track of earliest contribution
        if (contribution.contributedAt.toMillis() < existing.firstContribution) {
          existing.firstContribution = contribution.contributedAt.toMillis();
        }
      } else {
        userContributions.set(contribution.userId, {
          userId: contribution.userId,
          totalValue: contribution.contributionValue,
          firstContribution: contribution.contributedAt.toMillis(),
        });
      }
    }

    const aggregatedContributions = Array.from(userContributions.values());

    // Distribute rewards
    for (const reward of quest.rewards) {
      if (reward.tier === "all") {
        // Give reward to all contributors
        for (const contribution of aggregatedContributions) {
          await distributeQuestReward(contribution.userId, reward);
        }
      } else if (reward.tier === "top" && reward.count) {
        // Sort by total contribution value and give to top N
        const sortedContributions = aggregatedContributions
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, reward.count);

        for (const contribution of sortedContributions) {
          await distributeQuestReward(contribution.userId, reward);
        }
      } else if (reward.tier === "first" && reward.count) {
        // Sort by first contribution date and give to first N
        const sortedContributions = aggregatedContributions
          .sort((a, b) => a.firstContribution - b.firstContribution)
          .slice(0, reward.count);

        for (const contribution of sortedContributions) {
          await distributeQuestReward(contribution.userId, reward);
        }
      }
    }
  } catch (error) {
    console.error("Error completing quest:", error);
  }
}

/**
 * Distributes a single reward to a user.
 */
async function distributeQuestReward(
  userId: string,
  reward: QuestReward
): Promise<void> {
  try {
    if (reward.type === "xp") {
      await giveExperience(userId, reward.value as number, true);
    } else if (reward.type === "points") {
      await givePoints(userId, reward.value as number, true);
    }
    // TODO: Implement badge rewards when badge system is ready
  } catch (error) {
    console.error(`Error distributing reward to user ${userId}:`, error);
  }
}

// ============================================================================
// Leaderboard Functions
// ============================================================================

/**
 * Resets the weekly leaderboard by clearing all weekly level history.
 */
export async function resetWeeklyLeaderboard(): Promise<void> {
  try {
    await resetWeeklyLevels();
  } catch (error) {
    console.error("Error resetting weekly leaderboard:", error);
    throw error;
  }
}

/**
 * Resets the daily leaderboard by clearing all daily level history.
 */
export async function resetDailyLeaderboard(): Promise<void> {
  try {
    await resetDailyLevels();
  } catch (error) {
    console.error("Error resetting daily leaderboard:", error);
    throw error;
  }
}

// ============================================================================
// Manual Reward Functions
// ============================================================================

/**
 * Gives manual rewards to a user.
 */
export async function giveManualReward(
  userId: string,
  rewards: TriviaReward[]
): Promise<void> {
  try {
    for (const reward of rewards) {
      if (reward.type === "xp") {
        await giveExperience(userId, reward.value);
      } else if (reward.type === "points") {
        await givePoints(userId, reward.value);
      }
    }
  } catch (error) {
    console.error("Error giving manual reward:", error);
    throw error;
  }
}

// ============================================================================
// Platform Announcement Functions
// ============================================================================

/**
 * Creates a platform announcement.
 */
export async function createPlatformAnnouncement(
  announcement: Omit<PlatformAnnouncement, "id" | "createdAt" | "updatedAt">
): Promise<string | undefined> {
  try {
    const announcementId = await addOne("platform-announcements", announcement);
    return announcementId;
  } catch (error) {
    console.error("Error creating platform announcement:", error);
    return undefined;
  }
}

/**
 * Retrieves all platform announcements.
 */
export async function getAllPlatformAnnouncements(): Promise<
  PlatformAnnouncement[]
> {
  try {
    const { items } = await list<PlatformAnnouncement>("platform-announcements");
    return items;
  } catch (error) {
    console.error("Error fetching platform announcements:", error);
    return [];
  }
}

/**
 * Deletes a platform announcement.
 */
export async function deletePlatformAnnouncement(
  announcementId: string
): Promise<void> {
  try {
    await removeOne("platform-announcements", announcementId);
  } catch (error) {
    console.error("Error deleting platform announcement:", error);
    throw error;
  }
}
