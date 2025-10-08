import * as React from "react";
import { currentUser } from "@clerk/nextjs/server";
import {
  getUserById,
  areUsersConnected,
  hasOutgoingRequest,
  listUserAchievements,
  listUserAwards,
  listConnections,
} from "@/lib/firebase/user-manager";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileSection } from "@/components/profile/profile-section";
import { ConnectButton } from "@/components/social/connect-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AchievementCard,
  type Achievement,
} from "@/components/profile/achievement-card";
import { AwardCard, type Award } from "@/components/profile/award-card";
import { getOne } from "@/service/firebase-service";
import type { Level } from "@/handlers/level-handler";
import { Timestamp } from "firebase/firestore";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cu = await currentUser();
  if (!cu) return null;
  const { id: targetId } = await params;
  const target = await getUserById(targetId);
  if (!target)
    return (
      <div className="container mx-auto max-w-3xl py-8">User not found</div>
    );

  const [
    connected,
    requested,
    userAchievements,
    userAwards,
    connections,
    userLevel,
  ] = await Promise.all([
    areUsersConnected(cu.id, targetId),
    hasOutgoingRequest(cu.id, targetId),
    listUserAchievements(targetId),
    listUserAwards(targetId),
    listConnections(targetId, 5),
    getOne<Level>("levels", targetId),
  ]);

  const connectionUsers = await Promise.all(
    connections.map(async (c) => ({ id: c.id, u: await getUserById(c.id) }))
  );

  const fullName =
    [target.firstName, target.lastName].filter(Boolean).join(" ") ||
    "Unnamed User";

  // Convert UserBadges to BadgeItem format
  const badges = (target.displayedBadges || []).map((badge, index) => ({
    id: badge.id || `badge-${index}`,
    label: `Badge ${index + 1}`,
    iconSrc: "/badge.png",
  }));

  // Convert user achievements to the format expected by AchievementCard
  const achievements: Achievement[] = userAchievements.map(
    (achievement, index) => {
      const data = achievement as { id: string; dateAwarded?: Timestamp };
      return {
        id: data.id || `achievement-${index}`,
        title: `Achievement ${index + 1}`,
        description: `Earned on ${
          data.dateAwarded?.toDate?.()?.toLocaleDateString() ||
          "Unknown date"
        }`,
        points: 100,
        iconSrc: "/achievement.png",
        dateAwarded: data.dateAwarded || null,
      };
    }
  );

  // Convert user awards to the format expected by AwardCard
  const awards: Award[] = userAwards.map((award, index) => {
    const data = award as { id: string; dateAwarded?: Timestamp };
    return {
      id: data.id || `award-${index}`,
      title: `Award ${index + 1}`,
      issuer: "ACM UDST",
      date: data.dateAwarded?.toDate?.()?.toLocaleDateString() || "Unknown date",
      iconSrc: "/gold.png",
    };
  });

  const isEmptyBio = !target.biography;
  const hasAchievements = achievements && achievements.length > 0;
  const hasAwards = awards && awards.length > 0;

  const displayedAchievements = achievements.slice(0, 3);
  const displayedAwards = awards.slice(0, 3);

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="bg-card rounded-lg border shadow-sm p-6 space-y-8">
        <ProfileHeader
          fullName={fullName}
          avatarUrl={target.profilePicture}
          level={userLevel?.level || 1}
          studentId={target.email}
          badges={badges}
        />

        {cu.id !== targetId && (
          <ConnectButton
            targetUserId={targetId}
            initialConnected={connected}
            initialRequested={requested}
          />
        )}

        {/* Bio Section */}
        <div>
          <ProfileSection
            title="User Biography"
            description="Public introduction."
            isEmpty={isEmptyBio}
            emptyTitle="No bio yet"
            emptyDescription="This user hasn't added a bio yet."
          >
            <p className="text-sm leading-6 text-foreground/90">
              {target.biography}
            </p>
          </ProfileSection>
        </div>

        {/* Achievements and Awards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Achievements</h2>
                <p className="text-sm text-muted-foreground">
                  Milestones unlocked in the chapter.
                </p>
              </div>
              {achievements.length > 3 && (
                <button className="text-sm text-primary hover:underline">
                  View All
                </button>
              )}
            </div>
            {!hasAchievements ? (
              <div className="text-center py-8">
                <p className="font-medium text-muted-foreground">
                  No achievements yet
                </p>
                <p className="text-sm text-muted-foreground">
                  No achievements to display.
                </p>
              </div>
            ) : (
              <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {displayedAchievements.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>

          {/* Awards Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Awards</h2>
                <p className="text-sm text-muted-foreground">
                  Recognition from events and contributions.
                </p>
              </div>
              {awards.length > 3 && (
                <button className="text-sm text-primary hover:underline">
                  View All
                </button>
              )}
            </div>
            {!hasAwards ? (
              <div className="text-center py-8">
                <p className="font-medium text-muted-foreground">
                  No awards yet
                </p>
                <p className="text-sm text-muted-foreground">
                  No awards to display.
                </p>
              </div>
            ) : (
              <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {displayedAwards.map((w) => (
                    <AwardCard key={w.id} award={w} />
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Connections Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Connections</h2>
              <p className="text-sm text-muted-foreground">
                People they&apos;re connected with.
              </p>
            </div>
          </div>
          {connectionUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No connections yet
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {connectionUsers.map(({ id, u }) => (
                <a
                  key={id}
                  href={`/profile/${id}`}
                  className="rounded border px-3 py-1 text-sm hover:bg-accent"
                >
                  {(u && `${u.firstName} ${u.lastName}`.trim()) || id}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
