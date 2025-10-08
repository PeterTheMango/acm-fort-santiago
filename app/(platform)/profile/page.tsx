import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSection } from "@/components/profile/profile-section"
import { AchievementCard, type Achievement } from "@/components/profile/achievement-card"
import { AwardCard, type Award } from "@/components/profile/award-card"
import { listUserAchievements, listUserAwards, getOrCreateUser, listConnections, getUserById } from "@/lib/firebase/user-manager"
import { auth } from "@clerk/nextjs/server"


/**
 * Render the owner profile page with header, bio, achievements, and awards using mocked profile data.
 *
 * Uses a local mock for the owner profile; replace the mock with a real authenticated data fetch when integrating.
 *
 * @returns The profile page JSX element containing the profile header and sections for bio, achievements, and awards.
 */
export default async function Page() {
  // First check if user is authenticated with Clerk
  const { userId } = await auth()
  
  if (!userId) {
    // This shouldn't happen due to middleware, but just in case
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
        </div>
      </div>
    )
  }

  // Get or create user in Firebase (since they're authenticated with Clerk)
  const user = await getOrCreateUser(userId)

  const [userAchievements, userAwards, connections] = await Promise.all([
    listUserAchievements(user.id),
    listUserAwards(user.id),
    listConnections(user.id, 5)
  ])
  const connectionUsers = await Promise.all(connections.map(async c => ({ id: c.id, u: await getUserById(c.id) })))
  
  const data = getOwnerProfileFromUser(user, userAchievements, userAwards)

  const isEmptyBio = !data.bio
  const hasAchievements = data.achievements && data.achievements.length > 0
  const hasAwards = data.awards && data.awards.length > 0

  const displayedAchievements = data.achievements.slice(0, 3)
  const displayedAwards = data.awards.slice(0, 3)

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="bg-card rounded-lg border shadow-sm p-6 space-y-8">
        {/* Header Section */}
        <ProfileHeader
          isOwner
          userId={user.id}
          fullName={data.fullName}
          avatarUrl={data.avatarUrl}
          level={data.level}
          studentId={data.studentId}
          badges={data.badges}
        />

        {/* Bio Section */}
        <div>
          <ProfileSection
            title="User Biography"
            description="Your public introduction."
            isEmpty={isEmptyBio}
            emptyTitle="No bio yet"
            emptyDescription="Tell others a bit about yourself."
          >
            <p className="text-sm leading-6 text-foreground/90">{data.bio}</p>
          </ProfileSection>
        </div>

        {/* Achievements and Awards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Achievements</h2>
                <p className="text-sm text-muted-foreground">Milestones you&apos;ve unlocked in the chapter.</p>
              </div>
              {data.achievements.length > 3 && (
                <button className="text-sm text-primary hover:underline">
                  View All
                </button>
              )}
            </div>
            {!hasAchievements ? (
              <div className="text-center py-8">
                <p className="font-medium text-muted-foreground">No achievements yet</p>
                <p className="text-sm text-muted-foreground">Complete activities to unlock achievements.</p>
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
                <p className="text-sm text-muted-foreground">Recognition from events and contributions.</p>
              </div>
              {data.awards.length > 3 && (
                <button className="text-sm text-primary hover:underline">
                  View All
                </button>
              )}
            </div>
            {!hasAwards ? (
              <div className="text-center py-8">
                <p className="font-medium text-muted-foreground">No awards yet</p>
                <p className="text-sm text-muted-foreground">Earn recognition for your contributions.</p>
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
              <p className="text-sm text-muted-foreground">People you’re connected with.</p>
            </div>
            <a href="/connections" className="text-sm text-primary hover:underline">View Connections</a>
          </div>
          {connectionUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No connections yet</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {connectionUsers.map(({ id, u }) => (
                <a key={id} href={`/profile/${id}`} className="rounded border px-3 py-1 text-sm hover:bg-accent">
                  {(u && `${u.firstName} ${u.lastName}`.trim()) || id}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  biography: string;
  displayedBadges: Array<{ id: string; dateAwarded: unknown }>;
}

interface UserAchievementData {
  id?: string;
  dateAwarded?: { toDate?: () => Date };
  [key: string]: unknown;
}

interface UserAwardData {
  id?: string;
  dateAwarded?: { toDate?: () => Date };
  [key: string]: unknown;
}

function getOwnerProfileFromUser(
  user: UserData,
  userAchievements: UserAchievementData[],
  userAwards: UserAwardData[]
) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed User"
  
  // Convert user badges to the format expected by ProfileHeader
  const badges = user.displayedBadges.map((badge, index) => ({
    id: badge.id || `badge-${index}`,
    label: `Badge ${index + 1}`, // You might want to fetch badge details from a badges collection
    iconSrc: "/badge.png"
  }))
  
  // Convert user achievements to the format expected by AchievementCard
  const achievements: Achievement[] = userAchievements.map((achievement, index) => ({
    id: achievement.id || `achievement-${index}`,
    title: `Achievement ${index + 1}`, // You might want to fetch achievement details from an achievements collection
    description: `Earned on ${achievement.dateAwarded?.toDate?.()?.toLocaleDateString() || 'Unknown date'}`,
    points: 100,
    iconSrc: "/achievement.png"
  }))
  
  // Convert user awards to the format expected by AwardCard
  const awards: Award[] = userAwards.map((award, index) => ({
    id: award.id || `award-${index}`,
    title: `Award ${index + 1}`, // You might want to fetch award details from an awards collection
    issuer: "ACM UDST",
    date: award.dateAwarded?.toDate?.()?.toLocaleDateString() || 'Unknown date',
    iconSrc: "/gold.png"
  }))
  
  return {
    fullName,
    avatarUrl: user.profilePicture || undefined,
    level: 1, // You might want to calculate this based on achievements/points
    studentId: user.email || undefined,
    badges,
    bio: user.biography || "No bio yet",
    achievements,
    awards
  }
}
