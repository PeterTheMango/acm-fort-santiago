import { currentUser } from "@clerk/nextjs/server"
import { getUserById, areUsersConnected, hasOutgoingRequest } from "@/lib/firebase/user-manager"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ConnectButton } from "@/components/social/connect-button"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const cu = await currentUser()
  if (!cu) return null
  const { id: targetId } = await params
  const target = await getUserById(targetId)
  if (!target) return <div className="container mx-auto max-w-3xl py-8">User not found</div>
  const [connected, requested] = await Promise.all([
    areUsersConnected(cu.id, targetId),
    hasOutgoingRequest(cu.id, targetId),
  ])
  const fullName = [target.firstName, target.lastName].filter(Boolean).join(" ") || "Unnamed User"
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="bg-card rounded-lg border shadow-sm p-6 space-y-8">
        <ProfileHeader fullName={fullName} avatarUrl={target.profilePicture} level={1} studentId={target.email} badges={[]} />
        {cu.id !== targetId && (
          <ConnectButton targetUserId={targetId} initialConnected={connected} initialRequested={requested} />
        )}
      </div>
    </div>
  )
}
