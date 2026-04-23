"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IssueLink } from "@/components/issue-link"

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
        <IssueLink
          issueKey="SCRUM-5"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
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
        <IssueLink
          issueKey="SCRUM-3"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
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
        Sprint <span className="font-medium">&apos;Sprint 1&apos;</span> has
        been started
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
        <IssueLink
          issueKey="SCRUM-8"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
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
        <IssueLink
          issueKey="SCRUM-12"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          SCRUM-12
        </IssueLink>{" "}
        to{" "}
        <span className="inline-flex items-center rounded-sm bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Done
        </span>
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
        <span className="font-medium">Priya Patel</span> updated the description
        of{" "}
        <IssueLink
          issueKey="SCRUM-5"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
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
  const [activeTab, setActiveTab] = useState<"direct" | "watching">("direct")
  const [showUnread, setShowUnread] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)

  const filteredNotifications = notifications.filter((n) => {
    if (n.category !== activeTab) return false
    if (showUnread && n.read) return false
    return true
  })

  function toggleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header — matches real Jira: title, toggle, expand icon, three-dot menu */}
      <div className="flex items-center justify-between px-6 pt-6 pb-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-3">
          {/* Only show unread toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            Only show unread
            <button
              type="button"
              role="switch"
              aria-checked={showUnread}
              onClick={() => setShowUnread(!showUnread)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showUnread ? "bg-blue-600" : "bg-muted-foreground/30"}`}
            >
              <span
                className={`inline-block size-3.5 rounded-full bg-white transition-transform ${showUnread ? "translate-x-[18px]" : "translate-x-[3px]"}`}
              />
            </button>
            {showUnread && (
              <button
                type="button"
                onClick={() => setShowUnread(false)}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </label>
          {/* Expand/open in new tab icon */}
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Open in full page"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </button>
          {/* Three-dot menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`rounded p-1 transition-colors ${moreMenuOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border bg-popover py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Give feedback
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs — Direct / Watching (matches real Jira) */}
      <div className="flex border-b px-6">
        <button
          onClick={() => setActiveTab("direct")}
          className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "direct"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Direct
        </button>
        <button
          onClick={() => setActiveTab("watching")}
          className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "watching"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Watching
        </button>
      </div>

      {/* Notification list */}
      <div className="min-h-[400px]">
        {filteredNotifications.length > 0 ? (
          <div className="flex flex-col">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 border-b px-6 py-3 transition-colors last:border-b-0 hover:bg-accent/50 ${
                  !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                }`}
              >
                {/* Unread dot */}
                <div className="flex shrink-0 items-center pt-2">
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
                  <p className="text-sm leading-snug text-foreground">
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
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Atlassian flag illustration — matches real Jira empty state */}
            <svg className="mb-4 size-32" viewBox="0 0 120 120" fill="none">
              {/* Flag pole */}
              <rect x="36" y="18" width="4" height="90" rx="2" fill="#FFC400" />
              {/* Orange dot on pole top */}
              <circle cx="38" cy="16" r="5" fill="#FF8B00" />
              {/* Back flag (darker blue, rotated) */}
              <g transform="translate(40, 28) rotate(8)">
                <path d="M0 0L48 8L42 40L0 48Z" fill="#0747A6" rx="3" />
              </g>
              {/* Front flag (blue) */}
              <g transform="translate(40, 22) rotate(-4)">
                <path d="M0 0L50 6L46 42L0 48Z" fill="#2684FF" rx="3" />
                {/* Atlassian logo mark on flag */}
                <path
                  d="M16 28c-1-1.6-2.8-1.4-3.4.4l-5 12c-.3.6 0 1.2.6 1.2h7.4c.3 0 .6-.2.7-.5 1.2-3 .6-8.6-0.3-13.1z"
                  fill="rgba(255,255,255,0.6)"
                />
                <path
                  d="M22 16c-3.6 6.4-3.8 14-.4 20.4l4.2 8c.2.3.5.5.8.5h7.4c.6 0 .9-.7.6-1.2L23.4 16c-.3-.6-1-.6-1.4 0z"
                  fill="rgba(255,255,255,0.8)"
                />
              </g>
            </svg>
            <p className="text-sm text-muted-foreground">
              You have no notifications from
            </p>
            <p className="text-sm text-muted-foreground">the last 30 days.</p>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts popover */}
      {showShortcuts && (
        <div className="mx-6 mt-4 w-72 rounded-lg border bg-background p-5 text-left shadow-lg">
          <h3 className="mb-4 text-sm font-semibold">Keyboard shortcuts</h3>
          <div className="space-y-3">
            {shortcuts.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.label}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, i) =>
                    k === "+" ? (
                      <span key={i} className="text-xs text-muted-foreground">
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

      {/* Footer bar — matches real Jira */}
      <div className="mx-6 mt-6 mb-6 flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5">
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
  )
}
