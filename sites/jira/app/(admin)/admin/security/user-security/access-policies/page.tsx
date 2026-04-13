import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Access policies",
}

export default function AccessPoliciesPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Access policies</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        An access policy defines who can access what, from where, and under which conditions. These policies block access to the organization based on user or device.
      </p>

      {/* Guard upsell card */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>

        <h3 className="text-sm font-semibold mb-1">
          Get Atlassian Guard to use access policies
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start a free trial of an Atlassian Guard subscription. Get security and user management features to scale your organization with confidence.
        </p>

        <Link
          href="/admin/security/security-guide"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}
