import { CourseCard } from "@/components/courses/course-card"
import { browseCourses, yourCourses } from "@/lib/courses"

/**
 * Render the Courses page with "Your Courses" and "Browse Courses" sections.
 *
 * The top-level layout contains a responsive container that renders:
 * - "Your Courses": a grid of enrolled course cards showing title, author, banner, and progress (completed and total lessons).
 * - "Browse Courses": a grid of browseable course cards showing title, description, author, and banner.
 *
 * @returns The page's top-level JSX element containing both course sections and their responsive grids of CourseCard components.
 */
export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <section className="mb-8 md:mb-10">
        <h1 className="text-xl font-semibold">Your Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {yourCourses.map((course) => (
            <CourseCard
              key={course.slug}
              mode="enrolled"
              slug={course.slug}
              title={course.title}
              author={course.author}
              bannerUrl={course.bannerUrl}
              completedLessons={course.completedLessons}
              totalLessons={course.totalLessons}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Browse Courses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore topics from development to AI and cybersecurity.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {browseCourses.map((course) => (
            <CourseCard
              key={course.slug}
              mode="browse"
              slug={course.slug}
              title={course.title}
              description={course.description}
              author={course.author}
              bannerUrl={course.bannerUrl}
            />
          ))}
        </div>
      </section>
    </div>
  )
}