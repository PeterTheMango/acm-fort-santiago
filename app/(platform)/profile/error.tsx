"use client"

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    </div>
  )
}


