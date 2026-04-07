"use client"

import { Button } from "@/components/ui/button"

export default function MobileAppPoliciesPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Mobile app policies</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        Mobile application policies allow you to manage the security of Atlassian mobile apps on user smartphones and tablets.{" "}
        <button type="button" className="text-blue-600 hover:underline">How to use mobile app policies</button>
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm text-muted-foreground">Total app users</span>
            <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-lg font-semibold">-</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm text-muted-foreground">Jira</span>
            <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-lg font-semibold">-</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm text-muted-foreground">Confluence</span>
            <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>

        <h3 className="text-sm font-semibold mb-1">
          Get Atlassian Guard to unlock mobile app policies
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start a free trial of an Atlassian Guard subscription. Get mobile security and user management features to scale your organization with confidence.
        </p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Learn more
        </Button>
      </div>
    </div>
  )
}
