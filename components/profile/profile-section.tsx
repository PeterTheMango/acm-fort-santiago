"use client"

import * as React from "react"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
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
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{emptyTitle}</EmptyTitle>
                  {emptyDescription ? (
                    <EmptyDescription>{emptyDescription}</EmptyDescription>
                  ) : null}
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </section>
  )
}


