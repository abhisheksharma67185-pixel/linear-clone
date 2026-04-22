import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "External users",
}

export default function ExternalUsersPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">External users</h1>

      <div className="mb-6 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          An external user is someone who collaborates with your team but has a
          different email address from your company domain. External user
          policies control how users with an external email address access your
          organization&apos;s apps.
        </p>
        <Link
          href="/admin/security/security-guide"
          aria-label="More about external user security"
          className="text-sm text-blue-600 hover:underline"
        >
          More about external user security
        </Link>
      </div>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold">External users</p>
        <p className="text-sm">1</p>
      </div>

      {/* Guard upsell card */}
      <div className="rounded-lg border p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>

        <h3 className="mb-1 text-sm font-semibold">
          Get Atlassian Guard to unlock external user settings
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Start a free trial of an Atlassian Guard subscription. Get security
          and user management features to scale your organization with
          confidence.
        </p>

        <Link
          href="/admin/security/security-guide"
          aria-label="Learn more about Atlassian Guard for external user security"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}
