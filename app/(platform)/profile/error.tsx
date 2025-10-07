"use client"

import { useEffect } from "react"

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1">An unexpected error occurred</p>
      </div>
    </div>
  )
}


