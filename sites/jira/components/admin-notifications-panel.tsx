"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  time: string
  read: boolean
  icon: "atlassian" | "rovo"
  content: string
  actions?: { label: string; href: string }[]
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New AI features are available in Goals and Projects",
    time: "0 seconds ago",
    read: false,
    icon: "atlassian",
    content:
      "Rovo-powered updates help your teams write clearer status update with less effort. Now, Rovo can draft project updates and shorten written drafts in both apps.",
    actions: [
      { label: "Manage AI settings", href: "/admin/rovo-settings" },
      { label: "How it works", href: "#" },
    ],
  },
]

export function AdminNotificationsPanel({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onClose, anchorRef])

  useEffect(() => {
    if (!moreOpen) return
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [moreOpen])

  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [])

  if (!open) return null

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const displayed = showUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications

  return (
    <div
      ref={panelRef}
      className="absolute top-12 right-12 z-50 flex w-[420px] flex-col rounded-lg border bg-background shadow-lg"
      style={{ maxHeight: "calc(100vh - 80px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">
            BETA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            Only show unread
            <button
              type="button"
              role="switch"
              aria-checked={showUnreadOnly}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showUnreadOnly ? "bg-blue-600" : "bg-muted-foreground/30"}`}
            >
              <span
                className={`inline-block size-3.5 rounded-full bg-white transition-transform ${showUnreadOnly ? "translate-x-[18px]" : "translate-x-[3px]"}`}
              />
            </button>
          </label>
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  About this feature
                </button>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  Give feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div
        className="flex-1 overflow-y-auto px-5"
        style={{ maxHeight: "500px" }}
      >
        {/* Date header */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-muted-foreground">
            {dateStr}
          </span>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        </div>

        {displayed.length > 0 ? (
          <div className="flex flex-col gap-3 pb-4">
            {displayed.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-accent/50"
              >
                {/* Icon */}
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded">
                  {notification.icon === "atlassian" ? (
                    <svg className="size-6" viewBox="0 0 32 32" fill="none">
                      <path
                        d="M10.9 15.1c-.3-.4-.8-.3-1 .2l-3.7 7.5c-.2.3 0 .8.4.8h5.3c.2 0 .4-.1.5-.3.8-1.9.3-5.5-1.5-8.2z"
                        fill="#2684FF"
                      />
                      <path
                        d="M15.2 6.5c-2.5 4.2-2.6 9.3-.2 13.6l2.9 5.5c.1.2.3.3.5.3h5.3c.4 0 .6-.5.4-.8L16.2 6.5c-.2-.4-.7-.4-1 0z"
                        fill="#2684FF"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="size-5 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm leading-tight font-medium">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </div>

                  {notification.content && (
                    <div className="mt-2 rounded-md border bg-muted/30 p-3">
                      <div className="flex items-start gap-2">
                        <svg
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" />
                        </svg>
                        <p className="text-xs leading-relaxed">
                          {notification.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {notification.actions && (
                    <div className="mt-2 flex items-center gap-3">
                      {notification.actions.map((action, i) => (
                        <Link
                          key={i}
                          href={action.href}
                          onClick={() => onClose()}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Atlassian flag illustration */}
            <svg className="mb-4 size-24" viewBox="0 0 120 120" fill="none">
              <rect x="36" y="18" width="4" height="90" rx="2" fill="#FFC400" />
              <circle cx="38" cy="16" r="5" fill="#FF8B00" />
              <g transform="translate(40, 28) rotate(8)">
                <path d="M0 0L48 8L42 40L0 48Z" fill="#0747A6" rx="3" />
              </g>
              <g transform="translate(40, 22) rotate(-4)">
                <path d="M0 0L50 6L46 42L0 48Z" fill="#2684FF" rx="3" />
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
              That&apos;s all your notifications from
            </p>
            <p className="text-sm text-muted-foreground">the last 30 days.</p>
          </div>
        )}
      </div>
    </div>
  )
}
