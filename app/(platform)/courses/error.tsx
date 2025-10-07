"use client"

import { useEffect } from "react"

export default function Error({ error }: { error: Error & { digest?: string } }) {
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


