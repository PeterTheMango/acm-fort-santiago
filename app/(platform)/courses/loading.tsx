import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Render skeleton placeholders for the courses page while content loads.
 *
 * @returns A React element containing header skeletons and two responsive grids of placeholder course cards (featured and browse).
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-7 w-40" />
        <div className="mt-2">
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <Card key={`your-${i}`} className="overflow-hidden">
            <div className="aspect-[16/9] w-full bg-accent" />
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <Skeleton className="h-5 w-44" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-52" />
              <div className="mt-3 h-2 w-full rounded-full bg-accent" />
              <div className="mt-4">
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 md:mt-12">
        <Skeleton className="h-7 w-44" />
        <div className="mt-2">
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={`browse-${i}`} className="overflow-hidden">
            <div className="aspect-[16/9] w-full bg-accent" />
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <Skeleton className="h-5 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-60" />
              <Skeleton className="h-4 w-40" />
              <div className="mt-4">
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

