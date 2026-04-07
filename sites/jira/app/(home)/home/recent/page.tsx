"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function RecentPage() {
  const [tab, setTab] = useState<"worked" | "viewed">("worked")

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">Recent</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b">
        <button
          onClick={() => setTab("worked")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            tab === "worked"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Worked on
        </button>
        <button
          onClick={() => setTab("viewed")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            tab === "viewed"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Viewed
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="relative w-56">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <Input placeholder="Filter by title" className="pl-9" />
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-lg border bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
          You&apos;re all done for now. Check back soon to find out what&apos;s next.
        </div>
      </div>
    </div>
  )
}
