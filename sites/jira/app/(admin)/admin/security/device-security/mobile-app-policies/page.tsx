"use client"

import { Button } from "@/components/ui/button"

export default function MobileAppPoliciesPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Mobile app policies</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Mobile application policies allow you to manage the security of
        Atlassian mobile apps on user smartphones and tablets.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          How to use mobile app policies
        </button>
      </p>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">
              Total app users
            </span>
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-lg font-semibold">-</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Jira</span>
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-lg font-semibold">-</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Confluence</span>
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-lg font-semibold">-</p>
        </div>
      </div>

      {/* Guard upsell card */}
      <div className="rounded-lg border p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>

        <h3 className="mb-1 text-sm font-semibold">
          Get Atlassian Guard to unlock mobile app policies
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Start a free trial of an Atlassian Guard subscription. Get mobile
          security and user management features to scale your organization with
          confidence.
        </p>

        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Learn more
        </Button>
      </div>
    </div>
  )
}
