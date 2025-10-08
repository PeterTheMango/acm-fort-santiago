"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type BadgeItem = {
  id: string
  label: string
}

export type ProfileHeaderProps = {
  className?: string
  isOwner?: boolean
  userId?: string
  fullName: string
  avatarUrl?: string | null
  level?: number | null
  studentId?: string | null
  badges?: (BadgeItem & { iconSrc?: string | null })[] | null
}

/**
 * Render a user profile header with avatar, display name, level badge, optional edit control, and optional badges with tooltips.
 *
 * @param className - Additional class names to apply to the outer container
 * @param isOwner - When true, shows an edit button that links to the profile edit page
 * @param fullName - The user's full name shown as the primary heading; used to compute avatar fallback initials
 * @param avatarUrl - Optional image URL for the avatar; when absent, initials are shown
 * @param level - Optional user level displayed on the avatar; defaults to 1 when not provided
 * @param studentId - Optional student ID to display below the name
 * @param badges - Optional list of badges to render; each badge will show an icon (if `iconSrc` provided) and a tooltip with its label
 * @returns The rendered profile header element
 */
export function ProfileHeader({
  className,
  isOwner,
  fullName,
  avatarUrl,
  level,
  studentId,
  badges,
}: ProfileHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="rounded-2xl border bg-card/40 p-5">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <Avatar className="size-20 shadow-sm">
              <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
              <AvatarFallback>
                <Image src="/default_pfp.png" alt="Default Avatar" width={80} height={80} />
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 flex items-center justify-center">
              <Image
                src="/level.png"
                alt="Level"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="absolute text-sm font-bold text-white">
                {level ?? 1}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold truncate tracking-tight">{fullName}</h1>
              <TooltipProvider>
                <div className="flex items-center -space-x-2">
                  {(badges && badges.length > 0) && (
                    badges.slice(0, 3).map((b) => (
                      <Tooltip key={b.id}>
                        <TooltipTrigger asChild>
                          <div className="rounded-full p-2 bg-card hover:bg-accent/30 transition-colors hover:z-10 relative">
                            {b.iconSrc ? (
                              <Image src={b.iconSrc} alt={b.label} width={32} height={32} />
                            ) : (
                              <div className="size-8 rounded-full bg-muted" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm font-medium">{b.label}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  )}
                </div>
              </TooltipProvider>
            </div>

            {studentId && (
              <p className="text-sm text-muted-foreground mt-1">Student ID: {studentId}</p>
            )}
          </div>

          {isOwner ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/profile/edit" className="shrink-0">
                    <Image src="/edit-profile.png" alt="Edit User Profile" width={24} height={24} className="hover:opacity-80 transition-opacity" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit User Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
      </div>
    </div>
  )
}

