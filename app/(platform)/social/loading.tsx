import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders a skeleton loading UI for the social page with a header and a responsive grid of placeholder cards.
 *
 * The grid contains eight cards; each card includes a title placeholder, an avatar placeholder, two metadata lines, and a trailing action placeholder.
 *
 * @returns A JSX element containing the skeleton loading layout
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6">
        <Skeleton className="h-7 w-32" />
        <div className="mt-2">
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <Skeleton className="h-5 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-40" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

