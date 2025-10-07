"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@clerk/nextjs"
import { uploadImage, deleteFileFromUrl } from "@/service/storage-service"

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
  const { user, isLoaded } = useUser()
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [profilePicture, setProfilePicture] = React.useState("")
  const [userId, setUserId] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    // Optimistically prefill from Clerk while fetching Firestore profile
    if (isLoaded && user) {
      setUserId((prev) => prev ?? user.id)
      setFirstName((prev) => prev || user.firstName || "")
      setLastName((prev) => prev || user.lastName || "")
      setProfilePicture((prev) => prev || user.imageUrl || "")
    }
  }, [isLoaded, user])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })
        if (response.status === 401) {
          router.push("/sign-in")
          return
        }
        if (!response.ok) throw new Error("Failed to fetch user")
        const u = await response.json()
        if (cancelled) return
        setUserId(u.id)
        setFirstName(u.firstName ?? "")
        setLastName(u.lastName ?? "")
        setBio(u.biography ?? "")
        setProfilePicture(u.profilePicture ?? "")
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          biography: bio,
          profilePicture,
        }),
      })
      if (!res.ok) throw new Error("Failed to save user")
      router.push("/profile")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePickImage() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const path = `users/${userId}/avatar/${Date.now()}_${file.name}`
      const url = await uploadImage(file, path, (p) => setUploadProgress(Math.round(p)))
      // Optionally cleanup old image
      if (profilePicture) {
        try { await deleteFileFromUrl(profilePicture) } catch {}
      }
      setProfilePicture(url)
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
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
            <AvatarImage src={profilePicture || undefined} alt={`${firstName} ${lastName}`} />
            <AvatarFallback>UP</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            </div>
            <div>
              <label className="text-sm font-medium">Profile picture URL</label>
              <div className="flex gap-2">
                <Input value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} placeholder="https://..." />
                <Button type="button" variant="secondary" disabled={!userId || isUploading} onClick={handlePickImage}>
                  {isUploading ? `Uploading${uploadProgress !== null ? ` ${uploadProgress}%` : "..."}` : "Upload"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
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
          <Button type="submit" disabled={isSaving || isLoading || !userId}>{isSaving ? "Saving..." : "Save changes"}</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

