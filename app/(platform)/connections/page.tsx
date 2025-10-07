import { currentUser } from "@clerk/nextjs/server"
import { listConnections, getUserById } from "@/lib/firebase/user-manager"
import Link from "next/link"

export default async function Page() {
  const cu = await currentUser()
  if (!cu) return null
  const items = await listConnections(cu.id)
  const users = await Promise.all(items.map(async (i) => ({ id: i.id, user: await getUserById(i.id) })))
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <h1 className="text-xl font-semibold">Your Connections</h1>
      <ul className="space-y-2">
        {users.map(({ id, user }) => (
          <li key={id} className="rounded border p-3 flex items-center justify-between">
            <div className="text-sm">{(user && `${user.firstName} ${user.lastName}`.trim()) || id}</div>
            <Link href={`/profile/${id}`} className="text-sm text-primary">View</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

