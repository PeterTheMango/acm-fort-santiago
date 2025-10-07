"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

/**
 * Renders an edit profile page with inputs for full name and bio and actions to save or cancel.
 *
 * The form prevents default submission and, when saved, navigates to "/profile" (API save is a TODO).
 * The Cancel action navigates back in history.
 *
 * @returns The JSX element for the edit profile page UI.
 */
export default function EditProfilePage() {
  const router = useRouter()
  const [fullName, setFullName] = React.useState("Alex Student")
  const [bio, setBio] = React.useState(
    "I’m an active member of ACM UDST Student Chapter, passionate about web and systems programming."
  )

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // TODO: hook up API for saving profile.
    router.push("/profile")
  }

  return (
    <div className="container mx-auto max-w-2xl py-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Edit profile</h1>
        <p className="text-sm text-muted-foreground">Update your public profile information.</p>
      </div>
      <Separator />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage alt={fullName} />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others a bit about yourself"
            className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit">Save changes</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

