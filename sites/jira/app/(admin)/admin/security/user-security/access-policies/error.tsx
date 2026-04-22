"use client"

export default function AccessPoliciesError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Access Policies</h1>
      <div className="rounded-lg border p-6 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Unable to load access policies. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
