"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AuditLogPage() {
  const [searchMode, setSearchMode] = useState<"basic" | "alql">("basic")
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <Button variant="outline">Export log</Button>
      </div>

      <div className="text-sm text-muted-foreground mb-2 max-w-3xl">
        <p className="mb-2">
          Your organization&apos;s audit log tracks activities that occurred from your organization and across your sites within the past 180 days. For Atlassian app-specific activity, visit the app&apos;s audit log.
        </p>
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Explore your organization&apos;s audit log</a>
      </div>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        To save activities before they pass 180 days, regularly export the log or use the organization REST API to store activities to another location.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Explore your organization&apos;s REST API</a>
      </p>

      {/* Guard upsell card */}
      <div className="rounded-lg border p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>
        <h3 className="text-sm font-semibold mb-1">Quickly investigate user access changes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The audit log is an Atlassian Guard feature. To see audit log activity, you need to have an Atlassian Guard subscription.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Learn more</Button>
      </div>

      {/* Info banner */}
      {showBanner && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-4 py-3 mb-6">
          <svg className="size-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" />
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-0.5">Audit log access available to site admins</h4>
            <p className="text-sm text-muted-foreground mb-1">
              Site admins can now view audit log data for their site(s), making it easier to track important changes and events.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Understand more about site admin access</a>
              <span className="text-muted-foreground">·</span>
              <button onClick={() => setShowBanner(false)} className="text-blue-600 hover:underline">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Search filters */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className="flex rounded-md border overflow-hidden">
          <button
            onClick={() => setSearchMode("basic")}
            className={`px-3 py-1.5 text-xs font-medium ${searchMode === "basic" ? "bg-blue-600 text-white" : "bg-background text-foreground hover:bg-accent"}`}
          >
            Basic
          </button>
          <button
            onClick={() => setSearchMode("alql")}
            className={`px-3 py-1.5 text-xs font-medium border-l ${searchMode === "alql" ? "bg-blue-600 text-white" : "bg-background text-foreground hover:bg-accent"}`}
          >
            ALQL
          </button>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input placeholder="Search by name, group, or site" className="pl-9 w-56 h-8 text-xs" />
        </div>
        <Button variant="outline" size="sm" className="gap-1 border-blue-300 text-blue-600 h-8 text-xs">
          Date: Within the last 7 days
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
          Activities
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
          Actor
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
          IP Address
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
          Location
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
          App
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
      </div>
      <Button variant="outline" size="sm" disabled className="mb-4 h-8 text-xs">
        Apply
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>Showing 0 activities</span>
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Date</th>
              <th className="px-4 py-2.5 text-left font-medium">Location</th>
              <th className="px-4 py-2.5 text-left font-medium">Actor</th>
              <th className="px-4 py-2.5 text-left font-medium">Activity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm italic text-muted-foreground">
                No events
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feedback */}
      <div className="flex items-center gap-3 mt-6 text-sm">
        <span className="text-muted-foreground">Did you find what you were looking for?</span>
        <Button variant="outline" size="sm" className="h-7 text-xs">Yes</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs">No</Button>
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline text-sm">Give feedback or suggestions</a>
      </div>
    </div>
  )
}
