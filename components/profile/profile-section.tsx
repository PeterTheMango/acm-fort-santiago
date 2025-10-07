"use client";

import * as React from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export type ProfileSectionProps = {
  className?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

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
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div>
          {isEmpty ? (
            <div className="py-8">
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
        </div>
      </div>
    </section>
  );
}
