"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Settings } from "lucide-react"

type BadgeItem = {
  id: string
  label: string
}

export type ProfileHeaderProps = {
  className?: string
  isOwner?: boolean
  fullName: string
  avatarUrl?: string | null
  level?: number | null
  badges?: (BadgeItem & { iconSrc?: string | null })[] | null
}

export function ProfileHeader({
  className,
  isOwner,
  fullName,
  avatarUrl,
  level,
  badges,
}: ProfileHeaderProps) {
  const initials = React.useMemo(() => {
    const parts = fullName.split(" ").filter(Boolean)
    const first = parts[0]?.[0] ?? "U"
    const last = parts[parts.length - 1]?.[0] ?? "N"
    return (first + last).toUpperCase()
  }, [fullName])

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="rounded-2xl border bg-card/40 p-5">
        <div className="flex items-start gap-5">
          <div className="relative">
            <Avatar className="size-28 shadow-sm">
              <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 shadow-md">
              Lv {level ?? 1}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold truncate tracking-tight">{fullName}</h1>
              {isOwner ? (
                <Button asChild variant="ghost" size="icon" aria-label="Edit profile">
                  <Link href="/profile/edit">
                    <Settings className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(badges && badges.length > 0) ? (
                badges.map((b) => (
                  <TooltipProvider key={b.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="rounded-lg border p-2 bg-card hover:bg-accent/30 transition-colors">
                          {b.iconSrc ? (
                            <Image src={b.iconSrc} alt={b.label} width={28} height={28} />
                          ) : (
                            <div className="size-7 rounded-md bg-muted" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm font-medium">{b.label}</div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No badges yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


