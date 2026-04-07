"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const filterCategories = [
  { id: "all", name: "All", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg> },
  { id: "direct", name: "Direct", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg> },
  { id: "watching", name: "Watching", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
]

const appFilters = [
  { id: "all-apps", name: "All apps", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
  { id: "jira", name: "Jira", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
  { id: "confluence", name: "Confluence", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
]

const shortcuts = [
  { label: "Move through notifications", keys: ["↓", "↑"] },
  { label: "Expand notification", keys: ["e"] },
  { label: "Change read state", keys: ["r"] },
  { label: "First notification", keys: ["shift", "+", "↑"] },
  { label: "Last notification", keys: ["shift", "+", "↓"] },
]

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState("direct")
  const [activeApp, setActiveApp] = useState("all-apps")
  const [showUnread, setShowUnread] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

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
              <Switch checked={showUnread} onCheckedChange={setShowUnread} />
            </label>
          </div>

          {/* Empty state */}
          <div className="relative flex flex-col items-center justify-center py-16 text-center">
            {/* Flag illustration */}
            <svg className="mb-6" width="120" height="130" viewBox="0 0 120 130" fill="none">
              {/* Flagpole */}
              <line x1="32" y1="15" x2="32" y2="125" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="32" cy="13" r="4.5" fill="#F5A623" />

              {/* Flag body - folded/waving shape */}
              <path d="M35 20 L95 20 Q100 20 100 25 L100 55 Q100 60 95 60 L55 65 Q45 67 35 65 Z" fill="#4C9AFF" />
              <path d="M35 20 L95 20 Q100 20 100 25 L100 42 L55 48 Q45 50 35 47 Z" fill="#2563EB" opacity="0.6" />

              {/* Mountain/triangle shapes on flag */}
              <path d="M55 55 L65 35 L75 55 Z" fill="white" opacity="0.3" />
              <path d="M65 55 L78 30 L90 55 Z" fill="white" opacity="0.25" />
              <path d="M45 60 L55 42 L65 60 Z" fill="white" opacity="0.2" />
            </svg>

            <p className="text-sm text-muted-foreground">You have no notifications from</p>
            <p className="text-sm text-muted-foreground">the last 30 days.</p>

            {/* Keyboard shortcuts card */}
            {showShortcuts && (
              <div className="absolute right-0 top-8 w-72 rounded-lg border bg-background p-5 shadow-lg text-left">
                <h3 className="mb-4 text-sm font-semibold">Keyboard shortcuts</h3>
                <div className="space-y-3">
                  {shortcuts.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{s.label}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((k, i) => (
                          k === "+" ? (
                            <span key={i} className="text-xs text-muted-foreground">+</span>
                          ) : (
                            <kbd key={i} className="inline-flex min-w-[24px] items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                              {k}
                            </kbd>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Press
              <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border bg-background px-1 py-0.5 font-mono text-[10px]">↓</kbd>
              <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border bg-background px-1 py-0.5 font-mono text-[10px]">↑</kbd>
              to move through notifications.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowShortcuts(!showShortcuts)}
            >
              See all shortcuts
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
