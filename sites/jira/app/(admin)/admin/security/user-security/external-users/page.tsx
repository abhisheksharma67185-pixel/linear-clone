import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "External users",
}

export default function ExternalUsersPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">External users</h1>

      <div className="mb-6 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          An external user is someone who collaborates with your team but has a different email address from your company domain. External user policies control how users with an external email address access your organization&apos;s apps.
        </p>
        <Link href="/admin/security/security-guide" aria-label="More about external user security" className="text-sm text-blue-600 hover:underline">More about external user security</Link>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold mb-1">External users</p>
        <p className="text-sm">1</p>
      </div>

      {/* Guard upsell card */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>

        <h3 className="text-sm font-semibold mb-1">
          Get Atlassian Guard to unlock external user settings
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start a free trial of an Atlassian Guard subscription. Get security and user management features to scale your organization with confidence.
        </p>

        <Link
          href="/admin/security/security-guide"
          aria-label="Learn more about Atlassian Guard for external user security"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}
