"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AppSwitcher } from "@/components/app-switcher"
import { CreateButton, SearchBar } from "@/components/top-nav"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Header dropdowns ─────────────────────────────────────────────────────────

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<"Direct" | "Watching">("Direct")
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 z-50 mt-2 w-[500px] overflow-hidden rounded-xl border bg-popover shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Only show unread
          </span>
          <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted transition-colors">
            <span className="inline-block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform" />
          </button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-0 border-b px-5">
        {(["Direct", "Watching"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`mr-5 border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-5">
          <svg
            className="h-24 w-24 text-blue-200"
            viewBox="0 0 96 96"
            fill="none"
          >
            <rect x="20" y="30" width="56" height="44" rx="4" fill="#DBEAFE" />
            <rect x="28" y="16" width="40" height="52" rx="4" fill="#3B82F6" />
            <rect
              x="34"
              y="26"
              width="28"
              height="4"
              rx="2"
              fill="white"
              opacity="0.6"
            />
            <rect
              x="34"
              y="34"
              width="20"
              height="4"
              rx="2"
              fill="white"
              opacity="0.4"
            />
            <circle cx="68" cy="16" r="8" fill="#FBBF24" />
          </svg>
        </div>
        <p className="text-sm leading-snug text-muted-foreground">
          You have no notifications from
          <br />
          the last 30 days.
        </p>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Press{" "}
          <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">
            ↓
          </kbd>{" "}
          <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">
            ↑
          </kbd>{" "}
          to move through notifications.
        </p>
        <button className="rounded border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
          See all shortcuts
        </button>
      </div>
    </div>
  )
}

function HelpDropdown({
  onClose,
  onOpenFeedback,
  onOpenShortcuts,
}: {
  onClose: () => void
  onOpenFeedback: () => void
  onOpenShortcuts: () => void
}) {
  const ExternalIcon = () => (
    <svg
      className="size-3.5 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )

  const HELP_ITEMS = [
    {
      label: "Read help articles",
      url: "https://support.atlassian.com/atlassian-account/",
      external: true,
      onClick: undefined as undefined | (() => void),
    },
    {
      label: "Ask the community",
      url: "https://community.atlassian.com/",
      external: true,
      onClick: undefined,
    },
    {
      label: "Give feedback",
      url: null,
      external: false,
      onClick: onOpenFeedback,
    },
    {
      label: "Get support",
      url: "https://support.atlassian.com/contact/",
      external: true,
      onClick: undefined,
    },
    {
      label: "Status page",
      url: "https://support.status.atlassian.com/",
      external: true,
      onClick: undefined,
    },
    {
      label: "Keyboard shortcuts",
      url: null,
      external: false,
      onClick: onOpenShortcuts,
    },
  ]

  return (
    <>
      {/* Bug 7: invisible backdrop — click outside closes panel */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "transparent",
        }}
        onClick={onClose}
      />
      {/* Fixed right panel */}
      <div
        style={{
          position: "fixed",
          top: 48,
          right: 0,
          width: 320,
          height: "calc(100vh - 48px)",
          background: "#FFFFFF",
          borderLeft: "1px solid #DFE1E6",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
        }}
        className="dark:border-border dark:bg-popover"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #DFE1E6",
          }}
          className="dark:border-border"
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#172B4D",
              margin: 0,
            }}
            className="dark:text-foreground"
          >
            Help
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#6B778C",
            }}
            className="rounded hover:bg-accent"
          >
            <svg
              style={{ width: 20, height: 20 }}
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
        {/* Items — height:48px, padding:0 16px, font-size:14px, color:#172B4D, hover:#F4F5F7, no dividers */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {HELP_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 48,
                  padding: "0 16px",
                  fontSize: 14,
                  color: "#172B4D",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F4F5F7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>{item.label}</span>
                <ExternalIcon />
              </a>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 48,
                  padding: "0 16px",
                  fontSize: 14,
                  color: "#172B4D",
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F4F5F7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {item.label}
              </button>
            )
          )}
        </div>
        {/* Footer */}
        <footer
          style={{
            display: "flex",
            gap: 16,
            padding: "12px 16px",
            borderTop: "0.5px solid #DFE1E6",
          }}
          className="dark:border-border"
        >
          {[
            {
              label: "Terms of Use",
              url: "https://www.atlassian.com/legal/cloud-terms-of-service",
            },
            {
              label: "Notice of Collection",
              url: "https://www.atlassian.com/legal/privacy-policy/notice-at-collection",
            },
            {
              label: "Privacy Policy",
              url: "https://www.atlassian.com/legal/privacy-policy",
            },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#6B778C", textDecoration: "none" }}
              className="hover:underline"
            >
              {link.label}
            </a>
          ))}
        </footer>
      </div>
    </>
  )
}

// Static icon used inside AdminDropdown rows; declared at module scope so
// React doesn't recreate it on every render.
function ExternalLinkIcon() {
  return (
    <svg
      className="size-3.5 shrink-0 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function AdminDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [onClose])

  return (
    <div
      ref={ref}
      data-testid="admin-dropdown"
      className="absolute top-full right-0 z-50 mt-2 w-[460px] overflow-hidden rounded-xl border bg-popover shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          Personal Jira settings
        </p>
        <button className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent">
          Search
          <kbd className="flex items-center gap-0.5 font-mono text-[10px]">
            <span>⌘</span>
            <span>+</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Personal Jira settings */}
      <div className="py-1">
        <Link
          href="/home/account-settings"
          onClick={onClose}
          data-testid="admin-menu-general-settings"
          className="flex w-full items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
        >
          <svg
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium">General settings</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Manage language, time zone, and other personal preferences
            </p>
          </div>
        </Link>
        <Link
          href="/home/notifications"
          onClick={onClose}
          data-testid="admin-menu-notification-settings"
          className="flex w-full items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
        >
          <svg
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium">Notification settings</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Manage email and in-app notifications from Jira
            </p>
          </div>
        </Link>
      </div>

      {/* Jira admin settings */}
      <div className="border-t pt-1">
        <p className="px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Jira admin settings
        </p>
        {[
          {
            label: "System",
            desc: "Manage general configuration, security, automation, user interface, and more",
            href: "/admin/system",
            testid: "admin-menu-system",
            icon: (
              <svg
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            ),
          },
          {
            label: "Jira apps",
            desc: "Manage access, settings, and integrations across Jira",
            href: "/admin/apps",
            testid: "admin-menu-jira-apps",
            icon: (
              <svg
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            ),
          },
          {
            label: "Spaces",
            desc: "Manage space settings, categories, and more",
            href: "/admin/teams",
            testid: "admin-menu-teams-settings",
            icon: (
              <svg
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            ),
          },
          {
            label: "Work items",
            desc: "Configure work types, workflows, screens, fields, and more",
            href: "/admin/work-items",
            testid: "admin-menu-work-items",
            icon: (
              <svg
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            ),
          },
          {
            label: "Marketplace apps",
            desc: "Add and manage Jira Marketplace apps and integrations",
            href: "/admin/marketplace",
            testid: "admin-menu-marketplace",
            icon: (
              <svg
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            data-testid={item.testid}
            className="flex w-full items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
          >
            {item.icon}
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Atlassian admin settings */}
      <div className="border-t pt-1 pb-1">
        <p className="px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Atlassian admin settings
        </p>
        <Link
          href="/admin/users"
          onClick={onClose}
          data-testid="admin-menu-user-management"
          className="flex w-full items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
        >
          <svg
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">User management</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Manage users, groups, and access requests
            </p>
          </div>
          <ExternalLinkIcon />
        </Link>
        <Link
          href="/admin/licensing"
          onClick={onClose}
          data-testid="admin-menu-licensing"
          className="flex w-full items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
        >
          <svg
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Licensing</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Server and Data Center licensing
            </p>
          </div>
          <ExternalLinkIcon />
        </Link>
        <Link
          href="/admin/billing"
          onClick={onClose}
          data-testid="admin-menu-billing"
          className="flex w-full items-start gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
        >
          <svg
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Billing</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Update your billing details, manage subscriptions, and more
            </p>
          </div>
          <ExternalLinkIcon />
        </Link>
      </div>
    </div>
  )
}

function ProfileDropdown({
  onClose,
  onLogOut,
  onSwitchAccount,
  onThemeToggle,
}: {
  onClose: () => void
  onLogOut: () => void
  onSwitchAccount: () => void
  onThemeToggle: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [onClose])

  return (
    <div
      ref={ref}
      data-testid="profile-dropdown"
      className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-popover shadow-2xl"
    >
      {/* Profile header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="size-12 shrink-0">
          <AvatarFallback className="bg-blue-600 text-base font-bold text-white">
            AS
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Abhishek Sharma</p>
          <p className="truncate text-xs text-muted-foreground">
            theta.computer01@gmail.com
          </p>
        </div>
      </div>
      <div className="border-t py-1">
        <Link
          href="/home/profile"
          onClick={onClose}
          data-testid="profile-menu-profile"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
        >
          <svg
            className="size-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          </svg>
          Profile
        </Link>
        <Link
          href="/home/account-settings"
          onClick={onClose}
          data-testid="profile-menu-account-settings"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
        >
          <svg
            className="size-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
          </svg>
          Account settings
        </Link>
        <button
          onClick={() => {
            onThemeToggle()
            onClose()
          }}
          data-testid="profile-menu-theme"
          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <svg
              className="size-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Theme
          </div>
          <svg
            className="size-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div className="my-1 border-t" />
        <button
          onClick={() => {
            onSwitchAccount()
            onClose()
          }}
          data-testid="profile-menu-switch-account"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
        >
          <svg
            className="size-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
            <polyline points="11 7 16 12 11 17" />
            <line x1="16" y1="12" x2="4" y2="12" />
          </svg>
          Switch account
        </button>
        <button
          onClick={() => {
            onLogOut()
            onClose()
          }}
          data-testid="profile-menu-logout"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
        >
          <svg
            className="size-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>
      <div className="border-t px-4 py-2.5">
        <Link
          href="/teams/directory"
          onClick={onClose}
          data-testid="profile-menu-browse-teams"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse all teams
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

const sidebarItems = [
  {
    name: "For you",
    href: "/teams",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    name: "Teams",
    href: "/teams/directory",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "People",
    href: "/teams/people",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    name: "Kudos",
    href: "/teams/kudos",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
]

function CreateTeamPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [members, setMembers] = useState([
    { name: "Abhishek Sharma", initials: "AS" },
  ])
  const [memberInput, setMemberInput] = useState("")
  const [type, setType] = useState("official")

  if (!open) return null

  const removeMember = (idx: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const addMember = () => {
    if (memberInput.trim()) {
      const initials = memberInput
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      setMembers((prev) => [...prev, { name: memberInput.trim(), initials }])
      setMemberInput("")
    }
  }

  const handleCreate = () => {
    if (name.trim()) {
      onClose()
      setName("")
      setMembers([{ name: "Abhishek Sharma", initials: "AS" }])
    }
  }

  return (
    <div className="absolute top-0 right-0 z-50 flex h-full w-[340px] flex-col border-l bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <svg
          className="size-5 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="text-sm font-semibold">Team</span>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 text-xs text-muted-foreground">
          Required fields are marked with an asterisk{" "}
          <span className="text-red-500">*</span>
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="border-2 border-blue-600 focus:ring-0"
          />
        </div>

        {/* Members */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">
            Add team members <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5">
            {members.map((m, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
              >
                <Avatar className="size-4">
                  <AvatarFallback className="bg-blue-600 text-[7px] font-semibold text-white">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                {m.name}
                <button
                  onClick={() => removeMember(i)}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <svg
                    className="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              placeholder="Type name"
              className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium">
            Type <span className="text-red-500">*</span>
          </label>
          <Select value={type} onValueChange={(val) => val && setType(val)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="official">Official team</SelectItem>
              <SelectItem value="virtual">Virtual team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-[11px] text-muted-foreground">
          This site is protected by reCAPTCHA and the Google{" "}
          <span className="text-blue-600">Privacy Policy</span> and{" "}
          <span className="text-blue-600">Terms of Service</span> apply.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          Create
        </Button>
      </div>
    </div>
  )
}

const SHORTCUTS = [
  { action: "Create team", keys: ["C"] },
  { action: "Search", keys: ["/"] },
  { action: "Go to For you", keys: ["G", "H"] },
  { action: "Go to Teams", keys: ["G", "T"] },
  { action: "Go to People", keys: ["G", "P"] },
  { action: "Close dialog", keys: ["Esc"] },
]

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [createOpen, setCreateOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [navFeedbackDismissed, setNavFeedbackDismissed] = useState(false)
  const feedbackModalRef = useRef<HTMLDivElement>(null)
  const shortcutsModalRef = useRef<HTMLDivElement>(null)

  // Mount-only sync from localStorage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavFeedbackDismissed(
      localStorage.getItem("atlas_nav_feedback_dismissed") === "true"
    )
  }, [])

  function dismissNavFeedback() {
    localStorage.setItem("atlas_nav_feedback_dismissed", "true")
    setNavFeedbackDismissed(true)
  }

  function handleLogOut() {
    router.push("/login")
  }

  function handleSwitchAccount() {
    router.push("/switch-account")
  }

  function handleThemeToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  async function handleSubmitFeedback() {
    if (!feedbackText.trim()) return
    try {
      await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          text: feedbackText,
          page: window.location.pathname,
        }),
      })
    } catch {
      /* ignore */
    }
    setFeedbackOpen(false)
    setFeedbackText("")
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelpOpen(false)
        setFeedbackOpen(false)
        setShortcutsOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Focus trap for feedback modal
  useEffect(() => {
    if (!feedbackOpen || !feedbackModalRef.current) return
    const el = feedbackModalRef.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener("keydown", onKeyDown)
    return () => el.removeEventListener("keydown", onKeyDown)
  }, [feedbackOpen])

  // Focus trap for shortcuts modal
  useEffect(() => {
    if (!shortcutsOpen || !shortcutsModalRef.current) return
    const el = shortcutsModalRef.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener("keydown", onKeyDown)
    return () => el.removeEventListener("keydown", onKeyDown)
  }, [shortcutsOpen])

  useEffect(() => {
    const handler = () => setCreateOpen(true)
    window.addEventListener("open-create-team", handler)
    return () => window.removeEventListener("open-create-team", handler)
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <AppSwitcher />
          <div className="flex items-center gap-2">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-sm font-semibold">Teams</span>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="group/collapse relative rounded p-1 text-muted-foreground hover:bg-accent"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`size-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-[11px] whitespace-nowrap text-background opacity-0 transition-opacity group-hover/collapse:opacity-100">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </button>
        </div>
        <div className="mx-4 flex flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar isBlue={false} defaultTab="home" />
          </div>
          <CreateButton />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v)
                setHelpOpen(false)
                setAdminOpen(false)
                setProfileOpen(false)
              }}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            {notifOpen && (
              <NotificationsDropdown onClose={() => setNotifOpen(false)} />
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setHelpOpen((v) => !v)
                setNotifOpen(false)
                setAdminOpen(false)
                setProfileOpen(false)
              }}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            {helpOpen && (
              <HelpDropdown
                onClose={() => setHelpOpen(false)}
                onOpenFeedback={() => setFeedbackOpen(true)}
                onOpenShortcuts={() => setShortcutsOpen(true)}
              />
            )}
          </div>
          <div className="relative">
            <button
              data-testid="admin-settings-btn"
              onClick={() => {
                setAdminOpen((v) => !v)
                setNotifOpen(false)
                setHelpOpen(false)
                setProfileOpen(false)
              }}
              className={`rounded p-1.5 transition-colors ${adminOpen ? "bg-blue-50 text-blue-600 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
              </svg>
            </button>
            {adminOpen && <AdminDropdown onClose={() => setAdminOpen(false)} />}
          </div>
          <div className="relative">
            <button
              data-testid="profile-avatar-btn"
              onClick={() => {
                setProfileOpen((v) => !v)
                setNotifOpen(false)
                setHelpOpen(false)
                setAdminOpen(false)
              }}
              className="rounded-full p-0.5"
            >
              <Avatar className="size-8 cursor-pointer">
                <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
            </button>
            {profileOpen && (
              <ProfileDropdown
                onClose={() => setProfileOpen(false)}
                onLogOut={handleLogOut}
                onSwitchAccount={handleSwitchAccount}
                onThemeToggle={handleThemeToggle}
              />
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex shrink-0 flex-col overflow-y-auto border-r transition-all duration-200 ${sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"}`}
        >
          <nav className="flex flex-col gap-0.5 p-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-foreground hover:bg-accent"}`}
                >
                  <span
                    className={
                      isActive ? "text-blue-600" : "text-muted-foreground"
                    }
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              )
            })}

            <div className="my-2 border-t" />

            <Link
              href="/goals"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Goals
              <svg
                className="ml-auto size-3.5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <Link
              href="/project-directory"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Projects
              <svg
                className="ml-auto size-3.5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </nav>
          {/* Bug 8: dismissible nav feedback banner */}
          {!navFeedbackDismissed && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "0.5px solid #DFE1E6",
                fontSize: 12,
                color: "#42526E",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "auto",
              }}
            >
              <button
                onClick={() => setFeedbackOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#42526E",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Give feedback on the new navigation
              </button>
              <button
                onClick={dismissNavFeedback}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#6B778C",
                  lineHeight: 1,
                  padding: "0 0 0 8px",
                }}
                aria-label="Dismiss feedback banner"
              >
                ×
              </button>
            </div>
          )}
        </aside>
        <main className="relative flex-1 overflow-y-auto">
          {children}
          <CreateTeamPanel
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />
        </main>
      </div>

      {/* Feedback modal — triggered from Help panel or sidebar nav feedback */}
      {feedbackOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={() => setFeedbackOpen(false)}
        >
          <div
            ref={feedbackModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Give feedback"
            className="w-full max-w-md rounded-xl border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-base font-semibold">Give feedback</h2>
              <button
                onClick={() => setFeedbackOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
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
            <div className="px-5 py-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think..."
                rows={5}
                autoFocus
                style={{ width: "100%" }}
                className="resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts modal */}
      {shortcutsOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={() => setShortcutsOpen(false)}
        >
          <div
            ref={shortcutsModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="w-full max-w-sm rounded-xl border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-base font-semibold">Keyboard shortcuts</h2>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
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
            <div className="px-5 py-4">
              <table
                style={{ width: "100%", fontSize: 13 }}
                className="border-collapse"
              >
                <tbody>
                  {SHORTCUTS.map(({ action, keys }) => (
                    <tr key={action} className="border-b last:border-b-0">
                      <td className="py-2 text-sm text-foreground">{action}</td>
                      <td className="py-2 text-right">
                        <span className="flex items-center justify-end gap-1">
                          {keys.map((k, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {i > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  then
                                </span>
                              )}
                              <kbd className="rounded border border-gray-300 bg-muted px-1.5 py-0.5 font-mono text-xs font-medium">
                                {k}
                              </kbd>
                            </span>
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
