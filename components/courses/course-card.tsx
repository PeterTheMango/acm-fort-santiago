import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type BaseProps = {
  slug: string
  title: string
  description?: string
  author: string
  bannerUrl: string
}

type BrowseProps = BaseProps & {
  mode: "browse"
}

type EnrolledProps = BaseProps & {
  mode: "enrolled"
  completedLessons: number
  totalLessons: number
}

type Props = BrowseProps | EnrolledProps

/**
 * Renders a course card showing banner, title, author, and a mode-dependent CTA and progress.
 *
 * @param props - Component props. When `mode` is "browse", the card links to `/courses/{slug}` and may show `description`. When `mode` is "enrolled", the card links to `/courses/{slug}/learn`, displays a "Resume" CTA, and—if `totalLessons > 0`—shows completion percentage computed from `completedLessons` / `totalLessons`.
 * @returns The JSX element for the course card.
 */
export function CourseCard(props: Props) {
  const { slug, title, author, bannerUrl } = props

  const href = props.mode === "browse" ? `/courses/${slug}` : `/courses/${slug}/learn`
  const cta = props.mode === "browse" ? "View" : "Resume"

  const percent =
    props.mode === "enrolled" && props.totalLessons > 0
      ? Math.round((props.completedLessons / props.totalLessons) * 100)
      : undefined

  return (
    <Card className="overflow-hidden">
// at the top of components/courses/course-card.tsx, add the Image import
import Image from "next/image"
import Link from "next/link"

// …later in your JSX…

      <div className="aspect-[16/9] w-full bg-muted">
        <Image
          src={bannerUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          width={640}
          height={360}
          unoptimized={bannerUrl.includes("unsplash")}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-base font-semibold leading-tight">{title}</CardTitle>
        <CardDescription>By {author}</CardDescription>
      </CardHeader>
      <CardContent>
        {props.mode === "browse" && props.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{props.description}</p>
        ) : null}

        {props.mode === "enrolled" && typeof percent === "number" ? (
          <div className="mt-1">
            <div className="mb-2 text-xs font-medium text-muted-foreground">{percent}%</div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <Button asChild>
            <Link href={href}>{cta}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

