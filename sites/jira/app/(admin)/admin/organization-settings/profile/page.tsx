import type { Metadata } from "next"

export const metadata: Metadata = { title: "Profile" }

export default function Page() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
      <p className="text-sm text-muted-foreground">
        This section is coming soon.
      </p>
    </div>
  )
}
