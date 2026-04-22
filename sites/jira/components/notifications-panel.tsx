"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type Notification = {
  id: string
  avatarInitials: string
  avatarColor: string
  title: string
  meta: string
  timestamp: string
  category: "direct" | "watching"
  read: boolean
}

const INITIAL: Notification[] = [
  {
    id: "n1",
    avatarInitials: "PP",
    avatarColor: "#8777D9",
    title: "Priya Patel assigned SCRUM-5 to you",
    meta: "SCRUM-5 · Jira",
    timestamp: "2h ago",
    category: "direct",
    read: true,
  },
  {
    id: "n2",
    avatarInitials: "RK",
    avatarColor: "#36B37E",
    title: "Ravi Kumar commented on SCRUM-3",
    meta: "SCRUM-3 · Jira",
    timestamp: "5h ago",
    category: "watching",
    read: true,
  },
  {
    id: "n3",
    avatarInitials: "JS",
    avatarColor: "#0052CC",
    title: "Sprint 'Sprint 1' has been started",
    meta: "SCRUM · Jira",
    timestamp: "1d ago",
    category: "watching",
    read: true,
  },
  {
    id: "n4",
    avatarInitials: "AS",
    avatarColor: "#FF8B00",
    title: "You were mentioned in SCRUM-8",
    meta: "SCRUM-8 · Jira",
    timestamp: "2d ago",
    category: "direct",
    read: true,
  },
  {
    id: "n5",
    avatarInitials: "LC",
    avatarColor: "#DE350B",
    title: "Liam Chen changed status of SCRUM-12 to Done",
    meta: "SCRUM-12 · Jira",
    timestamp: "3d ago",
    category: "watching",
    read: true,
  },
]

const NOTIF_SHORTCUTS = [
  { keys: ["↓", "↑"], label: "Move through notifications" },
  { keys: ["e"], label: "Expand notification" },
  { keys: ["r"], label: "Change read state" },
  { keys: ["shift", "+", "↑"], label: "First notification" },
  { keys: ["shift", "+", "↓"], label: "Last notification" },
]

// ─── Atlassian flag illustration ──────────────────────────────────────────────

function AtlassianFlag() {
  return (
    <svg className="mb-5 h-36 w-36" viewBox="0 0 140 140" fill="none">
      <rect x="44" y="20" width="6" height="106" rx="3" fill="#FFC400" />
      <circle cx="47" cy="17" r="7" fill="#FF8B00" />
      <g transform="translate(50,36) rotate(8,0,0)">
        <path d="M0 0 L64 10 L56 54 L0 62 Z" fill="#0747A6" />
      </g>
      <g transform="translate(50,26) rotate(-4,0,0)">
        <path d="M0 0 L64 8 L60 58 L0 64 Z" fill="#2684FF" />
        <path
          d="M20 36c-1.5-2-3.6-1.8-4.3.6L9 54c-.4.9 0 1.8.9 1.8H21c.5 0 .9-.3 1-.8 1.7-4.2 1-11.6-1-19z"
          fill="rgba(255,255,255,0.5)"
        />
        <path
          d="M28 22c-4.8 8.4-5 18.8-.6 27.6l5.6 10.8c.3.5.7.7 1.1.7h9.8c.9 0 1.3-1 .9-1.8L29.8 22c-.5-.9-1.3-.9-1.8 0z"
          fill="rgba(255,255,255,0.85)"
        />
      </g>
    </svg>
  )
}

// ─── Notifications Panel ──────────────────────────────────────────────────────

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"direct" | "watching">("direct")
  const [showUnread, setShowUnread] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)
  const panelRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  const visible = notifications.filter(
    (n) => n.category === tab && (!showUnread || !n.read)
  )

  const toggleRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  // Close panel on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  // Close panel on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <>
      {/* Bell trigger */}
      <button
        type="button"
        aria-label="Notifications"
        data-testid="notifications-trigger"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-1.5 text-[#626f86] transition-colors hover:bg-[#f4f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-muted-foreground dark:hover:bg-accent"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-[#0052cc] text-[9px] leading-none font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Floating panel — fixed card, no backdrop */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
          data-testid="notifications-panel"
          className="fixed top-14 right-2 bottom-2 z-50 flex w-[480px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-lg border border-[#dfe1e6] bg-white shadow-[0_8px_32px_rgba(9,30,66,0.18)] dark:border-border dark:bg-background"
        >
          {/* ── Header ── */}
          <div className="shrink-0 px-6 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <h2 className="shrink-0 text-xl leading-tight font-bold text-[#172b4d] dark:text-foreground">
                Notifications
              </h2>
              <div className="flex-1" />

              {/* Only show unread */}
              <label className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap select-none">
                <span className="text-[13px] text-[#626f86] dark:text-muted-foreground">
                  Only show unread
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showUnread}
                  onClick={() => setShowUnread((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#0052cc] focus-visible:outline-none ${
                    showUnread
                      ? "bg-[#1e293b] dark:bg-foreground"
                      : "bg-[#97a0af]"
                  }`}
                >
                  <span
                    className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      showUnread ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
              </label>

              {/* Open in full page */}
              <Link
                href="/home/notifications"
                onClick={() => setOpen(false)}
                title="Open in full page"
                className="shrink-0 rounded p-1 text-[#626f86] transition-colors hover:bg-[#f4f5f7] dark:text-muted-foreground dark:hover:bg-accent"
              >
                <svg
                  className="size-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
              </Link>

              {/* Three-dot menu */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`rounded p-1 transition-colors ${
                    moreOpen
                      ? "bg-[#f4f5f7] text-[#172b4d] dark:bg-accent"
                      : "text-[#626f86] hover:bg-[#f4f5f7] dark:text-muted-foreground dark:hover:bg-accent"
                  }`}
                >
                  <svg
                    className="size-[18px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {moreOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMoreOpen(false)}
                    />
                    <div className="absolute top-full right-0 z-50 mt-1 w-52 rounded-[3px] border border-[#dfe1e6] bg-white py-1 shadow-[0_8px_24px_rgba(9,30,66,0.15)] dark:bg-popover">
                      {notifications.some((n) => !n.read) && (
                        <button
                          type="button"
                          onClick={() => {
                            markAllRead()
                            setMoreOpen(false)
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-[#626f86]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Mark all as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowShortcuts((v) => !v)
                          setMoreOpen(false)
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
                      >
                        <svg
                          className="size-4 text-[#626f86]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        >
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        Keyboard shortcuts
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoreOpen(false)}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
                      >
                        <svg
                          className="size-4 text-[#626f86]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Give feedback
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Close × */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="shrink-0 rounded p-1 text-[#626f86] transition-colors hover:bg-[#f4f5f7] dark:text-muted-foreground dark:hover:bg-accent"
              >
                <svg
                  className="size-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-3 flex shrink-0 border-b border-[#dfe1e6] px-6 dark:border-border">
            {(["direct", "watching"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`mr-6 border-b-2 pt-1 pb-3 text-[14px] font-medium transition-colors ${
                  tab === t
                    ? "border-[#0052cc] text-[#0052cc]"
                    : "border-transparent text-[#626f86] hover:text-[#172b4d] dark:text-muted-foreground dark:hover:text-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Notification list / Empty state ── */}
          <div className="flex-1 overflow-y-auto">
            {visible.length > 0 ? (
              <div>
                {visible.map((n) => (
                  <div
                    key={n.id}
                    className={`group flex cursor-pointer items-start gap-3 border-b border-[#f4f5f7] px-6 py-4 transition-colors hover:bg-[#f4f5f7] dark:border-border dark:hover:bg-accent/40 ${
                      !n.read ? "bg-[#e9f2ff] dark:bg-blue-900/10" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-2 flex shrink-0 items-center">
                      <div
                        className={`size-2 rounded-full ${
                          !n.read ? "bg-[#0052cc]" : "bg-transparent"
                        }`}
                      />
                    </div>
                    {/* Avatar */}
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                      style={{ backgroundColor: n.avatarColor }}
                    >
                      {n.avatarInitials}
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] leading-snug ${!n.read ? "font-medium text-[#172b4d] dark:text-foreground" : "text-[#172b4d] dark:text-foreground"}`}
                      >
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#626f86] dark:text-muted-foreground">
                        {n.meta} · {n.timestamp}
                      </p>
                    </div>
                    {/* Mark read/unread */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRead(n.id)
                      }}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                      className="mt-0.5 shrink-0 rounded p-1 text-[#626f86] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#dfe1e6] dark:hover:bg-border"
                    >
                      {n.read ? (
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
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
                          strokeWidth="1.75"
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
                <AtlassianFlag />
                <p className="text-[14px] leading-relaxed font-medium text-[#172b4d] dark:text-foreground">
                  You&apos;re all caught up.
                </p>
                <p className="mt-1 text-[12px] text-[#44546f] dark:text-muted-foreground">
                  No new notifications to show.
                </p>
                <Link
                  href="/home/notifications"
                  onClick={() => setOpen(false)}
                  className="mt-4 text-[13px] font-medium text-[#0052cc] hover:underline"
                >
                  View all
                </Link>
              </div>
            )}
          </div>

          {/* ── Keyboard shortcuts panel ── */}
          {showShortcuts && (
            <div className="shrink-0 border-t border-[#dfe1e6] bg-[#f4f5f7] px-6 py-4 dark:border-border dark:bg-muted/30">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#172b4d] dark:text-foreground">
                  Keyboard shortcuts
                </p>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="rounded p-0.5 text-[#626f86] transition-colors hover:bg-[#dfe1e6] dark:hover:bg-border"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {NOTIF_SHORTCUTS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[12px] text-[#626f86] dark:text-muted-foreground">
                      {s.label}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {s.keys.map((k, i) =>
                        k === "+" ? (
                          <span
                            key={i}
                            className="px-0.5 text-[11px] text-[#626f86]"
                          >
                            +
                          </span>
                        ) : (
                          <kbd
                            key={i}
                            className="inline-flex min-w-[22px] items-center justify-center rounded border border-[#dfe1e6] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#626f86] dark:bg-background"
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

          {/* ── Footer ── */}
          <div className="shrink-0 border-t border-[#dfe1e6] px-5 py-3 dark:border-border">
            <div className="flex items-center justify-between rounded-[3px] border border-[#dfe1e6] bg-white px-4 py-2.5 dark:border-border dark:bg-background">
              <div className="flex items-center gap-1.5 text-[12px] text-[#626f86] dark:text-muted-foreground">
                Press
                <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border border-[#dfe1e6] bg-[#f4f5f7] px-1.5 py-0.5 font-mono text-[10px] text-[#626f86] dark:bg-muted">
                  ↓
                </kbd>
                <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border border-[#dfe1e6] bg-[#f4f5f7] px-1.5 py-0.5 font-mono text-[10px] text-[#626f86] dark:bg-muted">
                  ↑
                </kbd>
                to move through notifications.
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts((v) => !v)}
                className="rounded border border-[#dfe1e6] px-3 py-1.5 text-[12px] whitespace-nowrap text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:border-border dark:text-foreground dark:hover:bg-accent"
              >
                See all shortcuts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
