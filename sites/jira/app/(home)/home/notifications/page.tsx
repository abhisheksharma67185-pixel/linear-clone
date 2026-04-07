"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const filterCategories = [
  { id: "all", name: "All", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg> },
  { id: "direct", name: "Direct", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> },
  { id: "watching", name: "Watching", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
]

const appFilters = [
  { id: "all-apps", name: "All apps", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
  { id: "jira", name: "Jira", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
  { id: "confluence", name: "Confluence", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
]

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState("direct")
  const [activeApp, setActiveApp] = useState("all-apps")
  const [showUnread, setShowUnread] = useState(false)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">Notifications</h1>

      <div className="flex gap-8">
        {/* Left filter sidebar */}
        <div className="w-44 shrink-0">
          <div className="flex flex-col gap-0.5">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                  activeCategory === cat.id
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className={activeCategory === cat.id ? "text-blue-600" : "text-muted-foreground"}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          <div className="my-3 border-t" />

          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Apps</p>
          <div className="flex flex-col gap-0.5">
            {appFilters.map((app) => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                  activeApp === app.id
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className={activeApp === app.id ? "text-blue-600" : "text-muted-foreground"}>{app.icon}</span>
                {app.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium">Today</p>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              Only show unread
              <button
                onClick={() => setShowUnread(!showUnread)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  showUnread ? "bg-blue-600" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                    showUnread ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Flag illustration */}
            <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
              <rect x="30" y="25" width="65" height="55" rx="4" fill="#4C9AFF" />
              <polygon points="30,25 95,25 95,55 30,80" fill="#2563EB" opacity="0.7" />
              <path d="M45 40 L55 50 L70 35" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              <line x1="25" y1="20" x2="25" y2="100" stroke="#F5A623" strokeWidth="3" />
              <circle cx="25" cy="20" r="4" fill="#F5A623" />
            </svg>

            <p className="text-sm text-muted-foreground">You have no notifications from</p>
            <p className="text-sm text-muted-foreground">the last 30 days.</p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              Press
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">&darr;</kbd>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">&uarr;</kbd>
              to move through notifications.
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              See all shortcuts
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
