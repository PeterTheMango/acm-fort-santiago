"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getHighestPointsUser } from "@/handlers/points-handler";
import {
  getTopUsersByLevel,
  Level,
  WeeklyLevelHistory,
  DailyLevelHistory,
} from "@/handlers/level-handler";
import { getUserById, User } from "@/handlers/user-handler";
import { subscribe } from "@/service/firebase-service";
import { orderBy } from "firebase/firestore";

interface LeaderboardUser {
  rank: number;
  userId: string;
  user?: User;
  level: number;
  totalExperience: number;
}

interface WeeklyLeaderboardUser {
  rank: number;
  userId: string;
  user?: User;
  level: number;
  experienceGained: number;
}

interface DailyLeaderboardUser {
  rank: number;
  userId: string;
  user?: User;
  level: number;
  experienceGained: number;
}

interface HighestPointsData {
  user?: User;
  points: number;
}

interface HighestExperienceData {
  user?: User;
  totalExperience: number;
}

/**
 * Calculate total experience from a user's level and remaining experience
 */
function calculateTotalExperience(level: number, experience: number): number {
  let totalExp = experience;
  for (let i = 1; i < level; i++) {
    totalExp += 100 * i;
  }
  return totalExp;
}

/**
 * Render the Leaderboard page containing top-stat cards and a global ranking table.
 *
 * Uses real-time data from Firestore to populate three statistic cards (points, experience, challenges)
 * and a scrollable table of player rankings with avatars and formatted points.
 *
 * @returns The page's JSX element showing the Leaderboard UI populated from real-time data
 */
export default function LeaderboardPage() {
  const [highestPoints, setHighestPoints] = useState<HighestPointsData | null>(null);
  const [highestExperience, setHighestExperience] = useState<HighestExperienceData | null>(null);
  const [globalRanking, setGlobalRanking] = useState<LeaderboardUser[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyLeaderboardUser[]>([]);
  const [dailyRanking, setDailyRanking] = useState<DailyLeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch highest points user
  useEffect(() => {
    async function fetchHighestPoints() {
      try {
        const pointsUser = await getHighestPointsUser();
        if (pointsUser && pointsUser.id) {
          const user = await getUserById(pointsUser.id);
          setHighestPoints({
            user,
            points: pointsUser.points,
          });
        }
      } catch (error) {
        console.error("Error fetching highest points:", error);
      }
    }
    fetchHighestPoints();
  }, []);

  // Fetch highest experience user
  useEffect(() => {
    async function fetchHighestExperience() {
      try {
        const topUsers = await getTopUsersByLevel(1);
        if (topUsers.length > 0) {
          const topUser = topUsers[0];
          const user = await getUserById(topUser.id);
          const totalExp = calculateTotalExperience(topUser.level, topUser.experience);
          setHighestExperience({
            user,
            totalExperience: totalExp,
          });
        }
      } catch (error) {
        console.error("Error fetching highest experience:", error);
      }
    }
    fetchHighestExperience();
  }, []);

  // Subscribe to global ranking (levels collection)
  useEffect(() => {
    const unsubscribe = subscribe<Level>(
      "levels",
      async (levels) => {
        try {
          const rankedUsers: LeaderboardUser[] = await Promise.all(
            levels.map(async (level, index) => {
              const user = await getUserById(level.id);
              const totalExp = calculateTotalExperience(level.level, level.experience);
              return {
                rank: index + 1,
                userId: level.id,
                user,
                level: level.level,
                totalExperience: totalExp,
              };
            })
          );
          setGlobalRanking(rankedUsers);
          setLoading(false);
        } catch (error) {
          console.error("Error processing global ranking:", error);
          setLoading(false);
        }
      },
      {
        orders: [orderBy("level", "desc"), orderBy("experience", "desc")],
        pageSize: 50,
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to weekly ranking
  useEffect(() => {
    const unsubscribe = subscribe<WeeklyLevelHistory>(
      "weekly-level-history",
      async (weeklyData) => {
        try {
          // Sort by experienceGained descending
          const sorted = [...weeklyData].sort(
            (a, b) => (b.experienceGained || 0) - (a.experienceGained || 0)
          );

          const rankedUsers: WeeklyLeaderboardUser[] = await Promise.all(
            sorted.slice(0, 10).map(async (data, index) => {
              const user = await getUserById(data.docId);
              // Fetch current level
              const levelData = await import("@/handlers/level-handler").then(m => 
                m.getUserLevel(data.docId)
              );
              return {
                rank: index + 1,
                userId: data.docId,
                user,
                level: levelData?.level || 1,
                experienceGained: data.experienceGained || 0,
              };
            })
          );
          setWeeklyRanking(rankedUsers);
        } catch (error) {
          console.error("Error processing weekly ranking:", error);
        }
      },
      {
        orders: [orderBy("experienceGained", "desc")],
        pageSize: 10,
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to daily ranking
  useEffect(() => {
    const unsubscribe = subscribe<DailyLevelHistory>(
      "daily-level-history",
      async (dailyData) => {
        try {
          // Sort by experienceGained descending
          const sorted = [...dailyData].sort(
            (a, b) => (b.experienceGained || 0) - (a.experienceGained || 0)
          );

          const rankedUsers: DailyLeaderboardUser[] = await Promise.all(
            sorted.slice(0, 10).map(async (data, index) => {
              const user = await getUserById(data.docId);
              // Fetch current level
              const levelData = await import("@/handlers/level-handler").then(m => 
                m.getUserLevel(data.docId)
              );
              return {
                rank: index + 1,
                userId: data.docId,
                user,
                level: levelData?.level || 1,
                experienceGained: data.experienceGained || 0,
              };
            })
          );
          setDailyRanking(rankedUsers);
        } catch (error) {
          console.error("Error processing daily ranking:", error);
        }
      },
      {
        orders: [orderBy("experienceGained", "desc")],
        pageSize: 10,
      }
    );

    return () => unsubscribe();
  }, []);
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Track the top performers and see who&apos;s leading in points, experience, and challenges completed.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highest Points Achieved */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Image src="/gold.png" alt="Gold Medal" width={32} height={32} />
                  <div className="text-sm text-muted-foreground">Highest Points Achieved</div>
                </div>
                {highestPoints ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={highestPoints.user?.profilePicture || "/placeholder-avatar-1.png"} 
                        alt={highestPoints.user?.firstName || "User"} 
                      />
                      <AvatarFallback>
                        {highestPoints.user?.firstName?.[0] || "U"}
                        {highestPoints.user?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {highestPoints.user ? 
                          `${highestPoints.user.firstName} ${highestPoints.user.lastName}` : 
                          "Loading..."}
                      </div>
                      <div className="text-2xl font-bold">
                        {highestPoints.points.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Loading...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Highest Experience Gained */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Image src="/gold.png" alt="Gold Medal" width={32} height={32} />
                  <div className="text-sm text-muted-foreground">Highest Experience Gained</div>
                </div>
                {highestExperience ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={highestExperience.user?.profilePicture || "/placeholder-avatar-2.png"} 
                        alt={highestExperience.user?.firstName || "User"} 
                      />
                      <AvatarFallback>
                        {highestExperience.user?.firstName?.[0] || "U"}
                        {highestExperience.user?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {highestExperience.user ? 
                          `${highestExperience.user.firstName} ${highestExperience.user.lastName}` : 
                          "Loading..."}
                      </div>
                      <div className="text-2xl font-bold">
                        {highestExperience.totalExperience.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Loading...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Highest Challenges Completed */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Image src="/gold.png" alt="Gold Medal" width={32} height={32} />
                  <div className="text-sm text-muted-foreground">Highest Challenges Completed</div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-avatar-3.png" alt="Molida Glinda" />
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Molida Glinda</div>
                    <div className="text-2xl font-bold">78</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly and Daily Level Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Level Leaderboard */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Weekly Level Leaderboard</h2>
              <div className="space-y-3">
                {weeklyRanking.length > 0 ? (
                  weeklyRanking.slice(0, 5).map((player) => (
                    <div
                      key={player.userId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8">
                        {player.rank === 1 ? (
                          <Image src="/gold.png" alt="Gold Medal" width={24} height={24} />
                        ) : player.rank === 2 ? (
                          <Image src="/silver.png" alt="Silver Medal" width={24} height={24} />
                        ) : player.rank === 3 ? (
                          <Image src="/bronze.png" alt="Bronze Medal" width={24} height={24} />
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm">
                            {player.rank}
                          </div>
                        )}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={player.user?.profilePicture || "/placeholder-avatar-1.png"} 
                          alt={player.user?.firstName || "User"} 
                        />
                        <AvatarFallback>
                          {player.user?.firstName?.[0] || "U"}
                          {player.user?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {player.user ? 
                            `${player.user.firstName} ${player.user.lastName}` : 
                            "Loading..."}
                        </div>
                        <div className="text-sm text-muted-foreground">Level {player.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{player.experienceGained.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-center py-4">No weekly data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Level Leaderboard */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Daily Level Leaderboard</h2>
              <div className="space-y-3">
                {dailyRanking.length > 0 ? (
                  dailyRanking.slice(0, 5).map((player) => (
                    <div
                      key={player.userId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8">
                        {player.rank === 1 ? (
                          <Image src="/gold.png" alt="Gold Medal" width={24} height={24} />
                        ) : player.rank === 2 ? (
                          <Image src="/silver.png" alt="Silver Medal" width={24} height={24} />
                        ) : player.rank === 3 ? (
                          <Image src="/bronze.png" alt="Bronze Medal" width={24} height={24} />
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm">
                            {player.rank}
                          </div>
                        )}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={player.user?.profilePicture || "/placeholder-avatar-1.png"} 
                          alt={player.user?.firstName || "User"} 
                        />
                        <AvatarFallback>
                          {player.user?.firstName?.[0] || "U"}
                          {player.user?.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {player.user ? 
                            `${player.user.firstName} ${player.user.lastName}` : 
                            "Loading..."}
                        </div>
                        <div className="text-sm text-muted-foreground">Level {player.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{player.experienceGained.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-center py-4">No daily data yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Ranking Table */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Global Ranking</h2>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading rankings...</div>
            ) : globalRanking.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                        Rank
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                        Level
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                        Total Experience
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalRanking.map((player) => (
                      <tr
                        key={player.userId}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {player.rank === 1 ? (
                              <Image src="/gold.png" alt="Gold Medal" width={32} height={32} />
                            ) : player.rank === 2 ? (
                              <Image src="/silver.png" alt="Silver Medal" width={32} height={32} />
                            ) : player.rank === 3 ? (
                              <Image src="/bronze.png" alt="Bronze Medal" width={32} height={32} />
                            ) : (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                {player.rank}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage 
                                src={player.user?.profilePicture || "/placeholder-avatar-1.png"} 
                                alt={player.user?.firstName || "User"} 
                              />
                              <AvatarFallback>
                                {player.user?.firstName?.[0] || "U"}
                                {player.user?.lastName?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {player.user ? 
                                  `${player.user.firstName} ${player.user.lastName}` : 
                                  "Loading..."}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {player.user?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold">Level {player.level}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold">{player.totalExperience.toLocaleString()} XP</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No ranking data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}