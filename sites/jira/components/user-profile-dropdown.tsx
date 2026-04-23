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
