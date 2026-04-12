import type { Metadata } from "next"

export const metadata: Metadata = { title: "Teams" }

export default function Page() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Teams</h1>
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  )
}
