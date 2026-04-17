"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircle02Icon,
  Settings02Icon,
  Moon01Icon,
  Sun01Icon,
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

// ─────────────────────────────────────────────────────────────────────────────
// Premium Jira-style user-profile dropdown.
//
// Contents (in order):
//   1. Profile             → /home/profile
//   2. Account settings    → /home/account-settings
//   3. Theme (toggles dark mode via next-themes; shows a right-chevron)
//   4. ─── divider ───
//   5. Switch account      → /switch-account
//   6. Log out             → clears mock auth state + redirects to /login
//
// Icons are from @hugeicons (the codebase's existing icon library — same
// API shape as Lucide React, rendered via <HugeiconsIcon icon={...} />).
// ─────────────────────────────────────────────────────────────────────────────

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
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  const handleLogout = async () => {
    // Clear any mock auth state we may have stored client-side.
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("jira-auth")
        window.localStorage.removeItem("jira-session")
        window.sessionStorage.clear()
      }
    } catch {
      // ignore — storage may be unavailable (private mode, etc.)
    }

    // Invalidate server-side cookie / session (mock endpoint returns 200).
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // swallow — we still want to bounce the user to /login
    }

    router.push("/login")
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label="User profile"
        className="rounded-full transition-all hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 overflow-hidden rounded-lg border shadow-xl"
      >
        {/* Header with user info */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Primary menu items */}
        <div className="py-1">
          <Link
            href="/home/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <HugeiconsIcon
              icon={UserCircle02Icon}
              className="size-4 text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-profile"
            />
            <span>Profile</span>
          </Link>

          <Link
            href="/home/account-settings"
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <HugeiconsIcon
              icon={Settings02Icon}
              className="size-4 text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-account-settings"
            />
            <span>Account settings</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Theme"
            className="flex w-full items-center justify-between gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <span className="flex items-center gap-3">
              <HugeiconsIcon
                icon={isDark ? Sun01Icon : Moon01Icon}
                className="size-4 text-muted-foreground"
                aria-hidden="true"
                data-testid="icon-theme"
              />
              <span>Theme</span>
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 text-muted-foreground shrink-0"
              aria-hidden="true"
              data-testid="icon-theme-chevron"
            />
          </button>
        </div>

        {/* Visual divider above Switch account */}
        <div className="border-t" />

        {/* Secondary menu items */}
        <div className="py-1">
          <Link
            href="/switch-account"
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <HugeiconsIcon
              icon={Exchange01Icon}
              className="size-4 text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-switch-account"
            />
            <span>Switch account</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              className="size-4 text-muted-foreground"
              aria-hidden="true"
              data-testid="icon-logout"
            />
            <span>Log out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
