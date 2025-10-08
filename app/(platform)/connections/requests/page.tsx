import { currentUser } from "@clerk/nextjs/server"
import { listIncomingRequests, getUserById, acceptConnectionRequest, denyConnectionRequest } from "@/lib/firebase/user-manager"

export default async function Page() {
  const cu = await currentUser()
  if (!cu) return null
  const items = await listIncomingRequests(cu.id)
  const users = await Promise.all(items.map(async (i) => ({ req: i, user: await getUserById(i.id) })))
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <h1 className="text-xl font-semibold">Connection Requests</h1>
      <div className="space-y-4">
        {users.length === 0 && <p className="text-sm text-muted-foreground">No requests</p>}
        {users.map(({ req, user }) => (
          <RequestRow key={req.id} userId={cu.id} fromId={req.id} name={(user && `${user.firstName} ${user.lastName}`.trim()) || req.id} />
        ))}
      </div>
    </div>
  )
}

function RequestRow({ userId, fromId, name }: { userId: string; fromId: string; name: string }) {
  async function accept() {
    'use server'
    await acceptConnectionRequest(userId, fromId)
  }
  async function deny() {
    'use server'
    await denyConnectionRequest(userId, fromId)
  }
  return (
    <form action={accept} className="flex items-center justify-between rounded border p-3">
      <div className="text-sm">{name}</div>
      <div className="space-x-2">
        <button formAction={accept} className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">Accept</button>
        <button formAction={deny} className="rounded border px-3 py-1 text-sm">Deny</button>
      </div>
    </form>
  )
}

