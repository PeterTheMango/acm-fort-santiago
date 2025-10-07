import { Clock } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Platform page showing a "coming soon" message using the Empty component.
 *
 * @returns The React element representing the platform page.
 */
export default function PlatformPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock className="w-16 h-16" />
          </EmptyMedia>
          <EmptyTitle>Coming Soon</EmptyTitle>
          <EmptyDescription>
            We&apos;re working hard to bring you something amazing. This platform will be available soon!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-muted-foreground text-sm">
            Stay tuned for updates.
          </p>
        </EmptyContent>
      </Empty>
    </div>
  );
}
