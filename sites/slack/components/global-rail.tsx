"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AtSign,
  Bell,
  FileText,
  Home,
  MessageCircle,
  MoreHorizontal,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  status: { emoji: string; text: string; expiresAt: string | null }
}

type Workspace = {
  name: string
  iconColor?: string
}

type Notification = { read: boolean; type: string }
type ReadState = { unreadCount: number; unreadMentions: number }

const CURRENT_USER_ID = "usr-1"

type RailItem = {
  href: string
  label: string
  icon: LucideIcon
  // When non-zero, render a small numeric badge or unread dot. Use 0 to mean
  // "no badge"; a positive number renders the count (capped to 99).
  badge?: number
  // Render as a dot rather than a count (used for unread-but-no-mentions).
  dot?: boolean
  matchesPathname?: (pathname: string) => boolean
}

/**
 * The thin left-most rail (real Slack calls it "global nav"). Workspace tile
 * at the top, primary nav buttons in the middle, then add/admin/avatar at
 * the bottom. Sits to the left of AppSidebar; both share the dark aubergine
 * palette so they read as a single chrome.
 */
export function GlobalRail() {
  const pathname = usePathname()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [unreadDms, setUnreadDms] = useState(0)
  const [unreadMentions, setUnreadMentions] = useState(0)
  const [unreadActivity, setUnreadActivity] = useState(0)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    Promise.all([
      fetch("/api/data/workspace").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch(`/api/data/read-states?userId=${CURRENT_USER_ID}`).then((r) =>
        r.json()
      ),
      fetch("/api/data/notifications").then((r) => r.json()),
    ]).then(
      ([w, users, rs, notifs]: [
        Workspace,
        User[],
        ReadState[],
        Notification[],
      ]) => {
        setWorkspace(w)
        setUser(users.find((u) => u.id === CURRENT_USER_ID) ?? null)
        setUnreadDms(
          rs.reduce(
            (sum, r) =>
              sum +
              (typeof r.unreadCount === "number" && r.unreadCount > 0 ? 1 : 0),
            0
          )
        )
        setUnreadMentions(
          rs.reduce(
            (sum, r) =>
              sum +
              (typeof r.unreadMentions === "number" ? r.unreadMentions : 0),
            0
          )
        )
        setUnreadActivity(notifs.filter((n) => !n.read).length)
      }
    )
  }, [pathname])
  /* eslint-enable react-hooks/set-state-in-effect */

  const initials = (name?: string): string => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    return (
      (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
    ).toUpperCase()
  }

  const items: RailItem[] = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      matchesPathname: (p) =>
        p === "/" || p.startsWith("/c/") || p.startsWith("/threads"),
    },
    {
      href: "/dms",
      label: "DMs",
      icon: MessageCircle,
      badge: unreadDms,
      matchesPathname: (p) => p === "/dms" || p.startsWith("/dm/"),
    },
    {
      href: "/activity",
      label: "Activity",
      icon: Bell,
      badge: unreadMentions || unreadActivity,
      dot: !unreadMentions && unreadActivity > 0,
      matchesPathname: (p) => p === "/activity" || p === "/mentions",
    },
    {
      href: "/files",
      label: "Files",
      icon: FileText,
    },
  ]

  return (
    <nav
      className="flex w-[68px] shrink-0 flex-col items-center gap-1 bg-slack-aubergine pt-2 pb-3 text-white"
      aria-label="Workspace navigation"
    >
      {/* Workspace tile — clicking goes home. */}
      <Link
        href="/"
        className="mb-2 flex size-10 items-center justify-center rounded-md bg-white/95 text-base font-bold text-slack-aubergine shadow-sm transition hover:scale-[1.03]"
        style={
          workspace?.iconColor
            ? { backgroundColor: workspace.iconColor, color: "white" }
            : undefined
        }
        title={workspace?.name ?? "Workspace"}
      >
        {workspace ? initials(workspace.name) : "T"}
      </Link>

      <div className="flex flex-col items-center gap-0.5">
        {items.map((item) => {
          const isActive = item.matchesPathname
            ? item.matchesPathname(pathname)
            : pathname === item.href
          const Icon = item.icon
          const showCount = (item.badge ?? 0) > 0 && !item.dot
          const showDot = item.dot
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex w-14 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium transition",
                isActive
                  ? "bg-white/12 text-white"
                  : "text-white/85 hover:bg-white/8 hover:text-white"
              )}
            >
              <span className="relative flex size-6 items-center justify-center">
                <Icon className="size-5" />
                {showCount ? (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slack-mention-red px-1 text-[9px] font-bold text-white ring-2 ring-slack-aubergine">
                    {item.badge! > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
                {showDot ? (
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-slack-mention-red ring-2 ring-slack-aubergine" />
                ) : null}
              </span>
              <span className="leading-tight">{item.label}</span>
            </Link>
          )
        })}

        <button
          type="button"
          className="group relative mt-0.5 flex w-14 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium text-white/85 hover:bg-white/8 hover:text-white"
          aria-label="More navigation"
        >
          <span className="flex size-6 items-center justify-center">
            <MoreHorizontal className="size-5" />
          </span>
          <span className="leading-tight">More</span>
        </button>
      </div>

      {/* Divider between primary nav and bottom utilities — matches the
          thin horizontal line in real Slack between More and Admin. */}
      <div className="my-2 h-px w-8 shrink-0 bg-white/15" />

      <Link
        href="/admin"
        className={cn(
          "group relative flex w-14 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium transition",
          pathname.startsWith("/admin")
            ? "bg-white/12 text-white"
            : "text-white/85 hover:bg-white/8 hover:text-white"
        )}
        aria-label="Admin"
      >
        <span className="flex size-6 items-center justify-center">
          <Settings className="size-5" />
        </span>
        <span className="leading-tight">Admin</span>
      </Link>

      <Link
        href={`/people/${CURRENT_USER_ID}`}
        aria-label="Your profile"
        className="mt-auto"
      >
        {user ? (
          <UserAvatar
            name={user.name}
            src={user.avatar}
            presence={user.presence}
            size="md"
            showPresence
          />
        ) : (
          <span className="size-9 rounded-md bg-white/10" />
        )}
      </Link>

      {/* Side icons mimic Slack: rendering an aria-only label so screen
          readers still call out the section even though the visible labels
          are the per-item ones. */}
      <span className="sr-only">Workspace navigation rail</span>
    </nav>
  )
}
