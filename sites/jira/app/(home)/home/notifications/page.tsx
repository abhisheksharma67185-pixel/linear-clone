"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { IssueLink } from "@/components/issue-link"

const filterCategories = [
  {
    id: "all",
    name: "All",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    id: "direct",
    name: "Direct",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
  },
  {
    id: "watching",
    name: "Watching",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

const appFilters = [
  {
    id: "all-apps",
    name: "All apps",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: "jira",
    name: "Jira",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: "confluence",
    name: "Confluence",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
]

const shortcuts = [
  { label: "Move through notifications", keys: ["↓", "↑"] },
  { label: "Expand notification", keys: ["e"] },
  { label: "Change read state", keys: ["r"] },
  { label: "First notification", keys: ["shift", "+", "↑"] },
  { label: "Last notification", keys: ["shift", "+", "↓"] },
]

type Notification = {
  id: string
  avatarInitials: string
  avatarColor: string
  text: React.ReactNode
  timestamp: string
  category: "direct" | "watching"
  app: "jira" | "confluence"
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "n1",
    avatarInitials: "PP",
    avatarColor: "bg-violet-500",
    text: (
      <>
        <span className="font-medium">Priya Patel</span> assigned{" "}
        <IssueLink issueKey="SCRUM-5" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          SCRUM-5
        </IssueLink>{" "}
        to you
      </>
    ),
    timestamp: "2 hours ago",
    category: "direct",
    app: "jira",
    read: false,
  },
  {
    id: "n2",
    avatarInitials: "RK",
    avatarColor: "bg-emerald-500",
    text: (
      <>
        <span className="font-medium">Ravi Kumar</span> commented on{" "}
        <IssueLink issueKey="SCRUM-3" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          SCRUM-3
        </IssueLink>
      </>
    ),
    timestamp: "5 hours ago",
    category: "watching",
    app: "jira",
    read: false,
  },
  {
    id: "n3",
    avatarInitials: "JS",
    avatarColor: "bg-blue-500",
    text: (
      <>
        Sprint <span className="font-medium">&apos;Sprint 1&apos;</span> has been started
      </>
    ),
    timestamp: "1 day ago",
    category: "watching",
    app: "jira",
    read: false,
  },
  {
    id: "n4",
    avatarInitials: "AS",
    avatarColor: "bg-orange-500",
    text: (
      <>
        You were mentioned in{" "}
        <IssueLink issueKey="SCRUM-8" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          SCRUM-8
        </IssueLink>
      </>
    ),
    timestamp: "2 days ago",
    category: "direct",
    app: "jira",
    read: true,
  },
  {
    id: "n5",
    avatarInitials: "LC",
    avatarColor: "bg-rose-500",
    text: (
      <>
        <span className="font-medium">Liam Chen</span> changed status of{" "}
        <IssueLink issueKey="SCRUM-12" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          SCRUM-12
        </IssueLink>{" "}
        to <span className="inline-flex items-center rounded-sm bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Done</span>
      </>
    ),
    timestamp: "3 days ago",
    category: "watching",
    app: "jira",
    read: true,
  },
  {
    id: "n6",
    avatarInitials: "PP",
    avatarColor: "bg-violet-500",
    text: (
      <>
        <span className="font-medium">Priya Patel</span> updated the description of{" "}
        <IssueLink issueKey="SCRUM-5" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          SCRUM-5
        </IssueLink>
      </>
    ),
    timestamp: "3 days ago",
    category: "watching",
    app: "jira",
    read: true,
  },
]

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState("direct")
  const [activeApp, setActiveApp] = useState("all-apps")
  const [showUnread, setShowUnread] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory !== "all" && n.category !== activeCategory) return false
    if (activeApp !== "all-apps" && n.app !== activeApp) return false
    if (showUnread && n.read) return false
    return true
  })

  function toggleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white tabular-nums">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="flex gap-8">
        {/* Left sidebar */}
        <div className="w-44 shrink-0">
          <div className="flex flex-col gap-0.5">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                  activeCategory === cat.id
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={
                    activeCategory === cat.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground"
                  }
                >
                  {cat.icon}
                </span>
                {cat.name}
              </button>
            ))}
          </div>

          <div className="my-3 border-t" />

          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Apps
          </p>
          <div className="flex flex-col gap-0.5">
            {appFilters.map((app) => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                  activeApp === app.id
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={
                    activeApp === app.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground"
                  }
                >
                  {app.icon}
                </span>
                {app.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1">
          {/* Header with toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Today</p>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">&middot; {unreadCount} unread</span>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              Only show unread
              <Switch
                size="sm"
                checked={showUnread}
                onCheckedChange={setShowUnread}
              />
            </label>
          </div>

          {/* Notification list */}
          {filteredNotifications.length > 0 ? (
            <div className="flex flex-col divide-y rounded-lg border">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 ${
                    !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="flex shrink-0 items-center pt-1">
                    <div
                      className={`size-2 rounded-full ${
                        !n.read ? "bg-blue-600" : "bg-transparent"
                      }`}
                    />
                  </div>

                  {/* Avatar */}
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${n.avatarColor}`}
                  >
                    {n.avatarInitials}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">
                      {n.text}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.timestamp}
                    </p>
                  </div>

                  {/* Mark as read/unread button */}
                  <button
                    onClick={() => toggleRead(n.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title={n.read ? "Mark as unread" : "Mark as read"}
                  >
                    {n.read ? (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="mb-4 size-12 text-muted-foreground/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="text-sm text-muted-foreground">
                {showUnread
                  ? "No unread notifications."
                  : "No notifications match the current filters."}
              </p>
            </div>
          )}

          {/* Keyboard shortcuts popover */}
          {showShortcuts && (
            <div className="mt-4 w-72 rounded-lg border bg-background p-5 shadow-lg text-left">
              <h3 className="mb-4 text-sm font-semibold">
                Keyboard shortcuts
              </h3>
              <div className="space-y-3">
                {shortcuts.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) =>
                        k === "+" ? (
                          <span
                            key={i}
                            className="text-xs text-muted-foreground"
                          >
                            +
                          </span>
                        ) : (
                          <kbd
                            key={i}
                            className="inline-flex min-w-[24px] items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                          >
                            {k}
                          </kbd>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer bar */}
          <div className="mt-8 flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Press
              <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>
              <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
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
