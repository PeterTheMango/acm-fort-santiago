"use client"

import * as React from "react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type Award = {
  id: string
  title: string
  issuer?: string | null
  date?: string | null
  iconSrc?: string | null
}

/**
 * Render a square award card that displays an icon (or placeholder) and a tooltip with the award's title, optional date, and optional issuer.
 *
 * @param className - Optional additional CSS classes to apply to the card container
 * @param award - The award data to display (title, optional issuer, optional date, and optional iconSrc)
 * @returns A JSX element representing the award card with tooltip
 */
export function AwardCard({
  className,
  award,
}: {
  className?: string
  award: Award
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("rounded-lg border p-3 bg-card hover:bg-accent/30 transition-colors flex items-center justify-center", className)}>
          {award.iconSrc ? (
            <Image src={award.iconSrc} alt={award.title} width={48} height={48} />
          ) : (
            <div className="size-12 rounded-md bg-muted" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-[220px]">
          <div className="font-medium">{award.title}{award.date ? ` • ${award.date}` : ""}</div>
          {award.issuer ? (
            <p className="text-xs text-muted-foreground mt-1">Issued by {award.issuer}</p>
          ) : null}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

