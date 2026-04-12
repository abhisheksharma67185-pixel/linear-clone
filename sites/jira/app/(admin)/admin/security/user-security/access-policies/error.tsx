"use client"

export default function AccessPoliciesError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Access Policies</h1>
      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Unable to load access policies. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
