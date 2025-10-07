import * as React from "react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSection } from "@/components/profile/profile-section"
import { AchievementCard, type Achievement } from "@/components/profile/achievement-card"
import { AwardCard, type Award } from "@/components/profile/award-card"

/**
 * Provide a temporary mocked owner profile used for development and UI layout.
 *
 * This mock is intended to be replaced by real backend data; it includes representative
 * fields used by the profile page (display name, avatar URL, level, badges, bio,
 * achievements, and awards).
 *
 * @returns An object with the owner's profile data: `fullName`, `avatarUrl`, `level`,
 * `badges` (array of {id, label, iconSrc}), `bio`, `achievements` (array of `Achievement`),
 * and `awards` (array of `Award`).
 */
function getOwnerProfileMock() {
  return {
    fullName: "Alex Student",
    avatarUrl: undefined as string | undefined,
    level: 7,
    badges: [
      { id: "b1", label: "ACM Member", iconSrc: "/badge.svg" },
      { id: "b2", label: "Hackathon", iconSrc: "/award.svg" },
    ],
    bio:
      "I’m an active member of ACM UDST Student Chapter, passionate about web and systems programming.",
    achievements: [
      {
        id: "a1",
        title: "Completed 10 Challenges",
        description: "Solved 10 weekly coding challenges.",
        points: 100,
        iconSrc: "/achievement.svg",
      },
    ] as Achievement[],
    awards: [
      {
        id: "w1",
        title: "Member of the Month",
        issuer: "ACM UDST",
        date: "Sep 2025",
        iconSrc: "/award.svg",
      },
    ] as Award[],
  }
}

/**
 * Render the owner profile page with header, bio, achievements, and awards using mocked profile data.
 *
 * Uses a local mock for the owner profile; replace the mock with a real authenticated data fetch when integrating.
 *
 * @returns The profile page JSX element containing the profile header and sections for bio, achievements, and awards.
 */
export default async function Page() {
  // In real implementation, fetch the authenticated user profile here.
  const data = getOwnerProfileMock()

  const isEmptyBio = !data.bio
  const hasAchievements = data.achievements && data.achievements.length > 0
  const hasAwards = data.awards && data.awards.length > 0

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      <ProfileHeader
        isOwner
        fullName={data.fullName}
        avatarUrl={data.avatarUrl}
        level={data.level}
        badges={data.badges}
      />

      <ProfileSection
        title="Bio"
        description="Your public introduction."
        isEmpty={isEmptyBio}
        emptyTitle="No bio yet"
        emptyDescription="Tell others a bit about yourself."
      >
        <p className="text-sm leading-6 text-foreground/90">{data.bio}</p>
      </ProfileSection>

      <ProfileSection
        title="Achievements"
        description="Milestones you’ve unlocked in the chapter."
        isEmpty={!hasAchievements}
        emptyTitle="No achievements yet"
        emptyDescription="Complete activities to unlock achievements."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data.achievements.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection
        title="Awards"
        description="Recognition from events and contributions."
        isEmpty={!hasAwards}
        emptyTitle="No awards yet"
        emptyDescription="Earn recognition for your contributions."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data.awards.map((w) => (
            <AwardCard key={w.id} award={w} />
          ))}
        </div>
      </ProfileSection>
    </div>
  )
}