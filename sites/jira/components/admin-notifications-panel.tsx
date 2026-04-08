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
  const [menuOpen, setMenuOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

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
      className="absolute right-12 top-12 z-50 flex w-[420px] flex-col rounded-lg border bg-background shadow-lg"
      style={{ maxHeight: "calc(100vh - 80px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">BETA</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            Only show unread
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showUnreadOnly ? "bg-blue-600" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                  showUnreadOnly ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </button>
          </label>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`rounded p-1 transition-colors ${menuOpen ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-44 rounded-md border bg-background py-1 shadow-lg">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  About this feature
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  Give feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto px-5" style={{ maxHeight: "500px" }}>
        {/* Date header */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-muted-foreground">{dateStr}</span>
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
                    <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-tight">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </div>

                  {notification.content && (
                    <div className="mt-2 rounded-md border bg-muted/30 p-3">
                      <div className="flex items-start gap-2">
                        <svg className="mt-0.5 size-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" />
                        </svg>
                        <p className="text-xs leading-relaxed">{notification.content}</p>
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
        ) : null}

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="mb-3 size-12 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <p className="text-sm text-muted-foreground">
            That&apos;s all your notifications from
          </p>
          <p className="text-sm text-muted-foreground">the last 90 days</p>
        </div>
      </div>
    </div>
  )
}
