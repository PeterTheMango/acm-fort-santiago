"use client";

import * as React from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

export type Achievement = {
  id: string;
  title: string;
  description?: string | null;
  dateAwarded: Timestamp | null;
  points?: number | null;
  iconSrc?: string | null;
};

/**
 * Render an achievement badge that shows an icon (or placeholder) and displays the achievement title, optional points, and optional description inside a tooltip.
 *
 * @param className - Optional additional CSS classes applied to the outer card.
 * @param achievement - Achievement data to display (id, title, optional description, points, and iconSrc).
 * @returns The achievement badge element with a tooltip containing the title, points, and description.
 */
export function AchievementCard({
  className,
  achievement,
}: {
  className?: string;
  achievement: Achievement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "aspect-square rounded-lg bg-card hover:bg-accent/30 transition-colors flex items-center justify-center",
            className
          )}
        >
          {achievement.iconSrc ? (
            <Image
              src={achievement.iconSrc}
              alt={achievement.title}
              width={120}
              height={120}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full rounded-md bg-muted" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-[220px]">
          <div className="font-medium">
            {achievement.title}
            {achievement.points ? ` (+${achievement.points} pts)` : ""}
          </div>
          {achievement.description ? (
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.description}
            </p>
          ) : null}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
