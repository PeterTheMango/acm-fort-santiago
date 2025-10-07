"use client"

import { useEffect } from "react"

/**
 * Render a centered error UI and report the provided error to the console.
 *
 * On mount and whenever `error` changes, the component logs `error` to the console.
 *
 * @param error - The error object to display/report; may include an optional `digest` string for reference.
 * @returns A React element showing a "Something went wrong" heading and a short helper message.
 */
export default function CoursesError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Please refresh the page or try again later.
      </p>
    </div>
  )
}

