"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircle02Icon,
  Settings02Icon,
  Moon01Icon,
  Exchange01Icon,
  Logout01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface UserProfileDropdownProps {
  name?: string
  email?: string
  initials?: string
}

function LightThumbail() {
  return (
    <svg
      width="88"
      height="66"
      viewBox="0 0 88 66"
      className="shrink-0 rounded border border-[#dfe1e6]"
    >
      <rect width="88" height="66" fill="#f4f5f7" rx="3" />
      {/* Sidebar */}
      <rect x="0" y="0" width="18" height="66" fill="#e8eaed" rx="3" />
      <rect x="3" y="8" width="12" height="2" rx="1" fill="#b0b8c8" />
      <rect x="3" y="14" width="10" height="2" rx="1" fill="#b0b8c8" />
      <rect x="3" y="20" width="12" height="2" rx="1" fill="#b0b8c8" />
      <rect x="3" y="26" width="9" height="2" rx="1" fill="#b0b8c8" />
      {/* Top bar */}
      <rect x="18" y="0" width="70" height="10" fill="#fff" />
      <rect
        x="20"
        y="3"
        width="18"
        height="4"
        rx="1"
        fill="#0052cc"
        opacity="0.9"
      />
      {/* Content rows */}
      <rect x="20" y="14" width="58" height="3" rx="1" fill="#dde1e7" />
      <rect x="20" y="20" width="42" height="3" rx="1" fill="#dde1e7" />
      <rect x="20" y="26" width="50" height="3" rx="1" fill="#dde1e7" />
      <rect x="20" y="32" width="35" height="3" rx="1" fill="#dde1e7" />
      <rect x="20" y="38" width="46" height="3" rx="1" fill="#dde1e7" />
    </svg>
  )
}

function DarkThumbnail() {
  return (
    <svg
      width="88"
      height="66"
      viewBox="0 0 88 66"
      className="shrink-0 rounded border border-[#3b4252]"
    >
      <rect width="88" height="66" fill="#1e2433" rx="3" />
      {/* Sidebar */}
      <rect x="0" y="0" width="18" height="66" fill="#161b27" rx="3" />
      <rect x="3" y="8" width="12" height="2" rx="1" fill="#4a5568" />
      <rect x="3" y="14" width="10" height="2" rx="1" fill="#4a5568" />
      <rect x="3" y="20" width="12" height="2" rx="1" fill="#4a5568" />
      <rect x="3" y="26" width="9" height="2" rx="1" fill="#4a5568" />
      {/* Top bar */}
      <rect x="18" y="0" width="70" height="10" fill="#1a2035" />
      <rect
        x="20"
        y="3"
        width="18"
        height="4"
        rx="1"
        fill="#0052cc"
        opacity="0.9"
      />
      {/* Content rows */}
      <rect x="20" y="14" width="58" height="3" rx="1" fill="#2d3748" />
      <rect x="20" y="20" width="42" height="3" rx="1" fill="#2d3748" />
      <rect x="20" y="26" width="50" height="3" rx="1" fill="#2d3748" />
      <rect x="20" y="32" width="35" height="3" rx="1" fill="#2d3748" />
      <rect x="20" y="38" width="46" height="3" rx="1" fill="#2d3748" />
    </svg>
  )
}

function SystemThumbnail() {
  return (
    <svg
      width="88"
      height="66"
      viewBox="0 0 88 66"
      className="shrink-0 rounded border border-[#3b4252]"
    >
      {/* Left half light, right half dark */}
      <rect width="44" height="66" fill="#f4f5f7" rx="3" />
      <rect x="44" width="44" height="66" fill="#1e2433" />
      {/* Sidebar left */}
      <rect x="0" y="0" width="10" height="66" fill="#e8eaed" />
      <rect x="1" y="8" width="7" height="2" rx="1" fill="#b0b8c8" />
      <rect x="1" y="14" width="6" height="2" rx="1" fill="#b0b8c8" />
      <rect x="1" y="20" width="7" height="2" rx="1" fill="#b0b8c8" />
      {/* Sidebar right */}
      <rect x="44" y="0" width="10" height="66" fill="#161b27" />
      <rect x="45" y="8" width="7" height="2" rx="1" fill="#4a5568" />
      <rect x="45" y="14" width="6" height="2" rx="1" fill="#4a5568" />
      <rect x="45" y="20" width="7" height="2" rx="1" fill="#4a5568" />
      {/* Top bar left */}
      <rect x="10" y="0" width="34" height="8" fill="#fff" />
      <rect
        x="12"
        y="2"
        width="14"
        height="4"
        rx="1"
        fill="#0052cc"
        opacity="0.9"
      />
      {/* Top bar right */}
      <rect x="54" y="0" width="34" height="8" fill="#1a2035" />
      {/* Content left */}
      <rect x="12" y="12" width="30" height="2" rx="1" fill="#dde1e7" />
      <rect x="12" y="17" width="22" height="2" rx="1" fill="#dde1e7" />
      <rect x="12" y="22" width="26" height="2" rx="1" fill="#dde1e7" />
      {/* Content right */}
      <rect x="56" y="12" width="30" height="2" rx="1" fill="#2d3748" />
      <rect x="56" y="17" width="22" height="2" rx="1" fill="#2d3748" />
      <rect x="56" y="22" width="26" height="2" rx="1" fill="#2d3748" />
      {/* Center divider */}
      <line x1="44" y1="0" x2="44" y2="66" stroke="#6b778c" strokeWidth="1" />
    </svg>
  )
}

export function UserProfileDropdown({
  name = "Abhishek Sharma",
  email = "abhisheksharma67185@gmail.com",
  initials = "AS",
}: UserProfileDropdownProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const closeAll = () => {
    setOpen(false)
  }

  const handleLogout = async () => {
    closeAll()
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("jira-auth")
        window.localStorage.removeItem("jira-session")
        window.sessionStorage.clear()
      }
    } catch {
      // ignore — storage may be unavailable in private mode
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // swallow — still redirect to /login
    }
    router.push("/login")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="User profile"
        data-testid="user-profile-trigger"
        className="rounded-full transition-all hover:ring-2 hover:ring-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:ring-blue-900"
      >
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback className="bg-[#0052cc] text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[240px] overflow-visible rounded-[3px] border border-[#dfe1e6] p-0 shadow-[0_8px_24px_rgba(9,30,66,0.15)]"
      >
        {/* User info header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-[#0052cc] text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-tight font-semibold text-[#172b4d] dark:text-foreground">
                {name}
              </p>
              <p className="truncate text-[11px] leading-tight text-[#6b778c] dark:text-muted-foreground">
                {email}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#dfe1e6] dark:border-border" />

        {/* Primary items */}
        <div className="py-1">
          <Link
            href="/home/profile"
            onClick={closeAll}
            data-testid="menu-profile"
            className="flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
          >
            <HugeiconsIcon
              icon={UserCircle02Icon}
              className="size-[18px] shrink-0 text-[#626f86] dark:text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-profile"
            />
            Profile
          </Link>

          <Link
            href="/home/account-settings"
            onClick={closeAll}
            data-testid="menu-account-settings"
            className="flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
          >
            <HugeiconsIcon
              icon={Settings02Icon}
              className="size-[18px] shrink-0 text-[#626f86] dark:text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-account-settings"
            />
            Account settings
          </Link>

          {/* Theme — direct toggle light ↔ dark */}
          <div className="relative">
            <button
              type="button"
              aria-label="Theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="menu-theme"
              className="flex w-full items-center justify-between px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
            >
              <span className="flex items-center gap-3">
                <HugeiconsIcon
                  icon={Moon01Icon}
                  className="size-[18px] shrink-0 text-[#626f86] dark:text-muted-foreground"
                  aria-hidden="true"
                  data-testid="icon-theme"
                />
                Theme
              </span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 shrink-0 text-[#626f86] dark:text-muted-foreground"
                aria-hidden="true"
                data-testid="icon-theme-chevron"
              />
            </button>
          </div>
        </div>

        <div className="border-t border-[#dfe1e6] dark:border-border" />

        {/* Secondary items */}
        <div className="py-1">
          <Link
            href="/switch-account"
            onClick={closeAll}
            data-testid="menu-switch-account"
            className="flex items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
          >
            <HugeiconsIcon
              icon={Exchange01Icon}
              className="size-[18px] shrink-0 text-[#626f86] dark:text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-switch-account"
            />
            Switch account
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            data-testid="menu-logout"
            className="flex w-full items-center gap-3 px-4 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground dark:hover:bg-accent"
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              className="size-[18px] shrink-0 text-[#626f86] dark:text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-logout"
            />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
