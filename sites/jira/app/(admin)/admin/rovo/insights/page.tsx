import type { Metadata } from "next"

export const metadata: Metadata = { title: "Rovo Insights" }

export default function Page() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Rovo insights</h1>
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  )
}
