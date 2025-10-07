"use client"

import * as React from "react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type Achievement = {
  id: string
  title: string
  description?: string | null
  points?: number | null
  iconSrc?: string | null
}

export function AchievementCard({
  className,
  achievement,
}: {
  className?: string
  achievement: Achievement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("rounded-lg border p-3 bg-card hover:bg-accent/30 transition-colors flex items-center justify-center", className)}>
          {achievement.iconSrc ? (
            <Image src={achievement.iconSrc} alt={achievement.title} width={48} height={48} />
          ) : (
            <div className="size-12 rounded-md bg-muted" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-[220px]">
          <div className="font-medium">{achievement.title}{achievement.points ? ` (+${achievement.points} pts)` : ""}</div>
          {achievement.description ? (
            <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
          ) : null}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}


