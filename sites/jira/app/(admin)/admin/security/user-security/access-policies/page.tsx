import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Access policies",
}

export default function AccessPoliciesPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Access policies</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        An access policy defines who can access what, from where, and under
        which conditions. These policies block access to the organization based
        on user or device.
      </p>

      {/* Guard upsell card */}
      <div className="rounded-lg border p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>

        <h3 className="mb-1 text-sm font-semibold">
          Get Atlassian Guard to use access policies
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Start a free trial of an Atlassian Guard subscription. Get security
          and user management features to scale your organization with
          confidence.
        </p>

        <Link
          href="/admin/security/security-guide"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}
