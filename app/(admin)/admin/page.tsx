"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserByEmail } from "@/handlers/user-handler";
import { DailyTriviaManager } from "@/components/admin/daily-trivia-manager";
import { CommunityQuestsManager } from "@/components/admin/community-quests-manager";
import { LeaderboardReset } from "@/components/admin/leaderboard-reset";
import { ManualRewards } from "@/components/admin/manual-rewards";
import { PlatformAnnouncements } from "@/components/admin/platform-announcements";
import { BadgeManager } from "@/components/admin/badge-manager";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const userData = await getUserByEmail(email);
        if (userData && userData.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, isLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage platform content, events, and user rewards
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <DailyTriviaManager />
          <CommunityQuestsManager />
        </div>
        <BadgeManager />
        <div className="grid gap-6 md:grid-cols-2">
          <LeaderboardReset />
          <ManualRewards />
        </div>
        <PlatformAnnouncements />
      </div>
    </div>
  );
}
