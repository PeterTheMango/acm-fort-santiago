"use client"

import * as React from "react"
import { Empty } from "@/components/ui/empty"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ProfileSectionProps = {
  className?: string
  title: string
  description?: string
  children?: React.ReactNode
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

/**
   * Render a profile section card with a header and either its children or an empty state.
   *
   * @param className - Optional additional class names applied to the outer section
   * @param title - Title shown in the card header
   * @param description - Optional description shown beneath the title in the header
   * @param children - Content to render inside the card when not empty
   * @param isEmpty - When `true`, displays the empty state instead of `children`
   * @param emptyTitle - Title used in the empty state (defaults to "Nothing here yet")
   * @param emptyDescription - Optional description used in the empty state
   * @returns The rendered profile section element
   */
  export function ProfileSection({
  className,
  title,
  description,
  children,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription,
}: ProfileSectionProps) {
  return (
    <section className={cn("flex flex-col", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <div className="rounded-md border py-8">
              <Empty title={emptyTitle} description={emptyDescription} />
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </section>
  )}

