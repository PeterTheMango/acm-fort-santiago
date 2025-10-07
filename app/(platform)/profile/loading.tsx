import { Skeleton } from "@/components/ui/skeleton"

/**
 * Renders a skeleton-based placeholder layout for a profile loading state.
 *
 * The layout mirrors a profile page: avatar and header area, a large content block,
 * and two responsive two-column grids of content placeholders.
 *
 * @returns A React element representing the loading skeleton UI
 */
export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="size-24 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-[140px] w-full" />
      <Skeleton className="h-8 w-28" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    </div>
  )
}

