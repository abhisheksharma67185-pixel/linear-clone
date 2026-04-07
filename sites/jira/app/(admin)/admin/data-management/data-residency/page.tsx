"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const apps = [
  {
    name: "abhisheksharma67185.atlassian.net",
    product: "Goals",
    icon: (
      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
    ),
    location: "Not set",
    pinnedApps: "No apps",
    marketplaceStatus: "Not applicable",
  },
  {
    name: "abhisheksharma67185.atlassian.net",
    product: "Jira",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
    location: "Not set",
    pinnedApps: "No apps",
    marketplaceStatus: "Not applicable",
    hasAction: true,
  },
  {
    name: "abhisheksharma67185.atlassian.net",
    product: "Projects",
    icon: (
      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
    location: "Not set",
    pinnedApps: "No apps",
    marketplaceStatus: "Not applicable",
  },
]

export default function DataResidencyPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span>Admin</span>
        <span>/</span>
        <span>Security</span>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Data residency</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        You can control the location of your data with data residency. If data residency is available for your Atlassian app, you can set a location for hosting the in-scope Atlassian app and Marketplace app data.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Explore data residency</a>
      </p>

      {/* Summary card */}
      <div className="rounded-lg border px-5 py-3 mb-6">
        <p className="text-sm text-muted-foreground">Atlassian apps</p>
        <p className="text-lg font-semibold">0 of 3 pinned</p>
      </div>

      {/* App summary */}
      <h2 className="text-base font-semibold mb-4">App summary</h2>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search by site URL or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
          <svg className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          Atlassian apps
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Location
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Status
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Showing 3 results</p>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  Atlassian app
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Location</th>
              <th className="px-4 py-2.5 text-left font-medium">Pinned Marketplace apps</th>
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  Marketplace apps status
                  <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {app.icon}
                    <div>
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.product}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{app.location}</span>
                    <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{app.pinnedApps}</td>
                <td className="px-4 py-3 text-sm">{app.marketplaceStatus}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {app.hasAction && (
                      <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline">Set location</a>
                    )}
                    {app.hasAction && (
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
