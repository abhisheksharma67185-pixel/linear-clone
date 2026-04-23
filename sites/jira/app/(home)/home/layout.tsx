"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { Issue, Project, User } from "@/app/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AppSwitcher } from "@/components/app-switcher"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useTheme } from "next-themes"

const homeNavItems = [
  { id: "recent", name: "Recent", enabled: true },
  { id: "starred", name: "Starred", enabled: true },
  { id: "notifications", name: "Notifications", enabled: true },
  { id: "status", name: "Status updates", enabled: true },
  { id: "tags", name: "Tags", enabled: true },
  { id: "kudos", name: "Kudos", enabled: true },
]

const appShortcutItems = [
  { id: "jira", name: "Jira", enabled: true },
  { id: "teams", name: "Teams", enabled: true },
  { id: "goals", name: "Goals", enabled: true },
  { id: "projects", name: "Projects", enabled: true },
]

function CustomizeSidebarDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [navItems, setNavItems] = useState(homeNavItems)
  const [appItems, setAppItems] = useState(appShortcutItems)

  const toggleNav = (id: string) => {
    setNavItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const toggleApp = (id: string) => {
    setAppItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const navIcons: Record<string, React.ReactNode> = {
    recent: (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    starred: (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    notifications: (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    status: (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    tags: (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
    kudos: (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  }

  const appIcons: Record<string, React.ReactNode> = {
    jira: (
      <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-3 text-white" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
    teams: (
      <div className="flex size-5 items-center justify-center rounded bg-teal-100">
        <svg
          className="size-3 text-teal-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
    ),
    goals: (
      <div className="flex size-5 items-center justify-center rounded bg-purple-100">
        <svg
          className="size-3 text-purple-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    ),
    projects: (
      <div className="flex size-5 items-center justify-center rounded bg-pink-100">
        <svg
          className="size-3 text-pink-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose()
      }}
    >
      <DialogContent
        className="max-h-[80vh] overflow-y-auto p-0 sm:max-w-[540px]"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg">Customize your sidebar</DialogTitle>
          <DialogDescription>
            The changes you make here only affect you and not anyone else on
            your site.
          </DialogDescription>
        </DialogHeader>

        {/* Home navigation */}
        <div className="px-6 pb-4">
          <h3 className="mb-1 text-sm font-semibold">Home navigation</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            The following navigation items are available in Home.
          </p>

          {/* For you - always on */}
          <div className="flex items-center gap-3 px-1 py-2">
            <Checkbox checked disabled className="size-5" />
            <svg
              className="size-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span className="text-sm">For you</span>
          </div>

          {navItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-1 py-2">
              <svg
                className="size-4 cursor-grab text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
              </svg>
              <Checkbox
                checked={item.enabled}
                onCheckedChange={() => toggleNav(item.id)}
                className="size-5"
              />
              {navIcons[item.id]}
              <span className="flex-1 text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        {/* App shortcuts */}
        <div className="px-6 pb-4">
          <h3 className="mb-1 text-sm font-semibold">App shortcuts</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            The following Atlassian apps are available for your organization.
          </p>

          {appItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-1 py-2">
              <svg
                className="size-4 cursor-grab text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
              </svg>
              <Checkbox
                checked={item.enabled}
                onCheckedChange={() => toggleApp(item.id)}
                className="size-5"
              />
              {appIcons[item.id]}
              <span className="flex-1 text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const sidebarNav = [
  {
    name: "For you",
    href: "/home",
    ariaLabel: "For you",
    icon: (
      <svg
        aria-hidden="true"
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
    name: "Recent",
    href: "/home/recent",
    ariaLabel: "Recent",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    name: "Starred",
    href: "/home/starred",
    ariaLabel: "Starred",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    name: "Notifications",
    href: "/home/notifications",
    ariaLabel: "Notifications",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    name: "Status updates",
    href: "/home/status-updates",
    ariaLabel: "Status updates",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    name: "Tags",
    href: "/home/tags",
    ariaLabel: "Tags",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
  },
  {
    name: "Kudos",
    href: "/teams/kudos",
    ariaLabel: "Kudos",
    icon: (
      <svg
        aria-hidden="true"
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

const appLinks = [
  {
    name: "Jira",
    href: "/dashboard",
    ariaLabel: "Open Jira",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg
          aria-hidden="true"
          className="size-3.5 text-white"
          viewBox="0 0 32 32"
          fill="white"
        >
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Teams",
    href: "/teams",
    ariaLabel: "Open Teams",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-teal-100 dark:bg-teal-900/30">
        <svg
          aria-hidden="true"
          className="size-3.5 text-teal-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
    ),
  },
  {
    name: "Goals",
    href: "/goals",
    ariaLabel: "Open Goals",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30">
        <svg
          aria-hidden="true"
          className="size-3.5 text-purple-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    href: "/project-directory",
    ariaLabel: "Open Projects",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-pink-100 dark:bg-pink-900/30">
        <svg
          aria-hidden="true"
          className="size-3.5 text-pink-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
]

function UserAvatarDropdown() {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // no-op — redirect to login regardless
    }
    router.push("/login")
  }

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Match system" },
  ] as const

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setThemeMenuOpen(false)
      }}
    >
      <PopoverTrigger
        aria-label="User profile - Abhishek Sharma"
        className="rounded-full transition-colors hover:ring-2 hover:ring-blue-200"
      >
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
            AS
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        {/* User info header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-blue-600 text-base font-semibold text-white">
              AS
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Abhishek Sharma
            </p>
            <p className="text-xs text-muted-foreground">
              abhisheksharma67185@gmail.com
            </p>
          </div>
        </div>

        <div className="border-t" />

        {themeMenuOpen ? (
          /* Theme sub-menu */
          <div className="py-1.5">
            <button
              onClick={() => setThemeMenuOpen(false)}
              aria-label="Back to menu"
              className="flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              <svg
                aria-hidden="true"
                className="size-5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Theme
            </button>
            <div className="my-1 border-t" />
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setThemeMenuOpen(false)
                }}
                aria-label={`Set theme to ${option.label}`}
                className="flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <span className="flex size-5 items-center justify-center">
                  {theme === option.value && (
                    <svg
                      aria-hidden="true"
                      className="size-4 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {option.label}
                {option.value === "system" && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    default
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Menu items */}
            <div className="py-1.5">
              <Link
                href="/home/profile"
                aria-label="Go to your profile"
                className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </Link>
              <Link
                href="/home/account-settings"
                aria-label="Go to account settings"
                className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
                </svg>
                Account settings
              </Link>
              <button
                onClick={() => setThemeMenuOpen(true)}
                aria-label="Change theme"
                aria-haspopup="true"
                className="flex w-full items-center justify-between gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-3">
                  <svg
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Theme
                </span>
                <svg
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="border-t" />

            <div className="py-1.5">
              <Link
                href="/switch-account"
                aria-label="Switch to another account"
                className="flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
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
                Switch account
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Log out of your account"
                className="flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

function HelpButton() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"menu" | "shortcuts">("menu")
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)

  const ExtIcon = (
    <svg
      className="ml-auto size-3.5 shrink-0 text-muted-foreground"
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

  const shortcutSections = [
    {
      title: "Multi key shortcuts",
      items: [
        {
          label:
            "Add . opt as a modifier key to all shortcuts for improved accessibility",
          keys: [],
        },
      ],
    },
    {
      title: "Global",
      items: [
        { label: "Keyboard shortcuts", keys: ["?"] },
        { label: "Quick search", keys: ["/"] },
        { label: "Create new", keys: ["C"] },
        { label: "Go home", keys: ["G", "H"] },
        { label: "Go projects", keys: ["G", "P"] },
        { label: "Go teams", keys: ["G", "T"] },
        { label: "Go tags", keys: ["G", "A"] },
      ],
    },
    {
      title: "Home page updates",
      items: [
        { label: "Previous page", keys: ["K"] },
        { label: "Next page", keys: ["J"] },
        { label: "Previous item", keys: ["P"] },
        { label: "Next item", keys: ["N"] },
        { label: "Activate reading mode", keys: ["M"] },
      ],
    },
    {
      title: "Projects and goals",
      items: [
        { label: "Share", keys: ["S"] },
        { label: "Post an update", keys: ["U"] },
        { label: "Copy link to clipboard", keys: ["L"] },
        { label: "Go status tab", keys: ["1"] },
        { label: "Go updates tab", keys: ["2"] },
        { label: "Go learnings tab", keys: ["3"] },
      ],
    },
    {
      title: "Directory",
      items: [
        { label: "Search in directory", keys: ["/"] },
        { label: "Copy link to clipboard", keys: ["L"] },
      ],
    },
  ]

  return (
    <>
      <button
        onClick={() => {
          setOpen(!open)
          setView("menu")
        }}
        aria-label="Help"
        className={`rounded-full p-1.5 transition-colors ${open ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
      >
        <svg
          aria-hidden="true"
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

      {/* Slide-out help panel */}
      {open && (
        <div className="fixed top-14 right-0 bottom-0 z-50 flex w-80 flex-col border-l bg-background shadow-xl">
          {/* Header */}
          <div className="flex items-center px-5 pt-5 pb-4">
            {view === "shortcuts" ? (
              <button
                onClick={() => setView("menu")}
                className="mr-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
                Back
              </button>
            ) : (
              <div className="w-6" />
            )}
            <h3 className="flex-1 text-center text-base font-semibold">
              {view === "menu" ? "Help" : ""}
            </h3>
            <button
              onClick={() => setOpen(false)}
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

          {view === "menu" ? (
            <>
              <div className="flex-1 overflow-y-auto px-2">
                <div className="flex flex-col gap-0.5">
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </span>
                    Read help articles
                    {ExtIcon}
                  </Link>
                  <Link
                    href="/teams"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    Ask the community
                    {ExtIcon}
                  </Link>
                  <button
                    onClick={() => {
                      setFeedbackOpen(true)
                      setFeedbackSent(false)
                      setFeedbackType("")
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8l-4 4" />
                        <path d="M14 10l-4 0" />
                        <path d="M14 7l-4 0" />
                      </svg>
                    </span>
                    Give feedback
                  </button>
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </span>
                    Get support
                    {ExtIcon}
                  </Link>
                  <Link
                    href="/home/status-updates"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </span>
                    Status page
                    {ExtIcon}
                  </Link>
                  <button
                    onClick={() => setView("shortcuts")}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </span>
                    Keyboard shortcuts
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 border-t px-5 py-3 text-xs text-muted-foreground">
                <Link
                  href="/admin/settings"
                  className="hover:text-foreground hover:underline"
                >
                  Terms of Use
                </Link>
                <Link
                  href="/admin/security/data-protection"
                  className="hover:text-foreground hover:underline"
                >
                  Notice of Collection
                </Link>
                <Link
                  href="/admin/security"
                  className="hover:text-foreground hover:underline"
                >
                  Privacy Policy
                </Link>
              </div>
            </>
          ) : (
            /* Keyboard shortcuts view */
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <h3 className="mb-1 text-lg font-semibold">Keyboard shortcuts</h3>
              {shortcutSections.map((section) => (
                <div key={section.title} className="mt-4">
                  <h4 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {section.title}
                  </h4>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-foreground">
                          {item.label}
                        </span>
                        {item.keys.length > 0 && (
                          <span className="ml-2 flex shrink-0 items-center gap-1">
                            {item.keys.map((k, i) => (
                              <kbd
                                key={i}
                                className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                              >
                                {k}
                              </kbd>
                            ))}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Give feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Share your thoughts</DialogTitle>
            <DialogDescription>
              Required fields are marked with an asterisk *
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-4 text-xs text-muted-foreground">
              This is to provide feedback on the Home app. If you are after
              support or have billing or data queries, please raise a request at
              the support portal.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Select feedback *
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Choose one</option>
                <option value="bug">Bug report</option>
                <option value="suggestion">Suggestion</option>
                <option value="question">Question</option>
                <option value="compliment">Compliment</option>
              </select>
            </div>
          </div>
          {feedbackSent ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <svg
                className="size-8 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium">
                Thank you for your feedback!
              </p>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!feedbackType}
                onClick={() => {
                  setFeedbackSent(true)
                  setTimeout(() => setFeedbackOpen(false), 1500)
                }}
              >
                Send feedback
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function NotificationsPopover() {
  const [tab, setTab] = useState<"direct" | "watching">("direct")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifications"
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[400px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-base font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
              Only show unread
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${unreadOnly ? "bg-blue-600" : "bg-muted"}`}
              >
                <span
                  className={`inline-block size-3 rounded-full bg-white transition-transform ${unreadOnly ? "translate-x-3.5" : "translate-x-0.5"}`}
                />
              </button>
            </label>
            <Link
              href="/home/notifications"
              className="rounded p-1 text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </Link>
            {/* Three-dot menu with Give feedback */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </button>
              {moreMenuOpen && (
                <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-md border bg-popover py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false)
                      document
                        .querySelector<HTMLButtonElement>("[data-help-trigger]")
                        ?.click()
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Give feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4">
          <button
            onClick={() => setTab("direct")}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${tab === "direct" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Direct
          </button>
          <button
            onClick={() => setTab("watching")}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${tab === "watching" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Watching
          </button>
        </div>

        {/* Content — empty state with illustration */}
        <div className="flex flex-col items-center justify-center px-6 py-10">
          <svg className="mb-4 h-28 w-28" viewBox="0 0 120 120" fill="none">
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

          <p className="text-center text-sm text-muted-foreground">
            You have no notifications from
            <br />
            the last 30 days.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Press{" "}
            <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">
              ↓
            </kbd>{" "}
            <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">
              ↑
            </kbd>{" "}
            to move through notifications.
          </span>
          <button
            onClick={() => setShortcutsOpen(!shortcutsOpen)}
            className="text-blue-600 hover:underline"
          >
            See all shortcuts
          </button>
        </div>

        {/* Keyboard shortcuts popover (Image 21) */}
        {shortcutsOpen && (
          <div className="border-t bg-popover px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Keyboard shortcuts</h4>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent"
              >
                <svg
                  className="size-3.5"
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
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  Move through notifications
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↓
                  </kbd>
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↑
                  </kbd>
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  Expand notification
                </span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  →
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Change read state</span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  R
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  First notification
                </span>
                <span className="flex items-center gap-0.5">
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    shift
                  </kbd>
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↑
                  </kbd>
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Last notification</span>
                <span className="flex items-center gap-0.5">
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    shift
                  </kbd>
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ↓
                  </kbd>
                </span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function CreateDropdown() {
  const router = useRouter()
  const [createType, setCreateType] = useState<
    "goal" | "work" | "project" | "team" | null
  >(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [goalType, setGoalType] = useState("Objective")
  const [targetDate, setTargetDate] = useState("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [datePickerYear, setDatePickerYear] = useState(new Date().getFullYear())
  const [datePickerTab, setDatePickerTab] = useState<
    "day" | "month" | "quarter"
  >("month")
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [ownerSearch, setOwnerSearch] = useState("")
  const [selectedOwner, setSelectedOwner] = useState("Abhishek Sharma")
  const [goalDescription, setGoalDescription] = useState("")
  const [goalTeam, setGoalTeam] = useState("Engineering")
  // Work item state
  const [workSpace, setWorkSpace] = useState("Support (SUP)")
  const [workType, setWorkType] = useState("Submit a request or incident")
  const [workRequestType, setWorkRequestType] = useState(
    "Submit a request or incident"
  )
  const [workDescription, setWorkDescription] = useState("")
  const [workOrg, setWorkOrg] = useState("")
  const [useRequestFields, setUseRequestFields] = useState(true)
  const [createAnother, setCreateAnother] = useState(false)
  const [spaceDropOpen, setSpaceDropOpen] = useState(false)
  const [reqTypeDropOpen, setReqTypeDropOpen] = useState(false)
  const [headingDropOpen, setHeadingDropOpen] = useState(false)
  const [boldDropOpen, setBoldDropOpen] = useState(false)
  const [listDropOpen, setListDropOpen] = useState(false)
  const [aiDropOpen, setAiDropOpen] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [imagePopOpen, setImagePopOpen] = useState(false)
  const [imageTab, setImageTab] = useState<"file" | "link" | "upload">("file")
  const [codePopOpen, setCodePopOpen] = useState(false)
  const [codeLang, setCodeLang] = useState("")
  const [emojiPopOpen, setEmojiPopOpen] = useState(false)
  const [emojiSearch, setEmojiSearch] = useState("")
  const [insertPopOpen, setInsertPopOpen] = useState(false)
  const closeAllToolbar = () => {
    setHeadingDropOpen(false)
    setBoldDropOpen(false)
    setListDropOpen(false)
    setAiDropOpen(false)
    setColorPickerOpen(false)
    setImagePopOpen(false)
    setCodePopOpen(false)
    setEmojiPopOpen(false)
    setInsertPopOpen(false)
  }

  const [projectToast, setProjectToast] = useState<string | null>(null)
  const showProjectToast = (msg: string) => {
    setProjectToast(msg)
    setTimeout(() => setProjectToast(null), 3000)
  }

  // Escape closes project/work dialog
  useEffect(() => {
    if (createType !== "project" && createType !== "work") return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreateType(null)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [createType])

  const handleProjectCreate = () => {
    const projectName = name.trim()
    if (!projectName) return
    const key =
      projectName
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 4) || "PROJ"
    fetch("/api/data/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName, key, type: "scrum" }),
    }).catch(() => {})
    setCreateType(null)
    setName("")
    showProjectToast(`Project "${projectName}" created`)
    router.push("/project-directory")
  }

  // Work item — uncontrolled ref for Summary (base-ui Input won't propagate state)
  const workSummaryRef = useRef<HTMLInputElement>(null)
  const [workToast, setWorkToast] = useState<{
    text: string
    key: string
  } | null>(null)
  const showWorkToast = (text: string, key: string) => {
    setWorkToast({ text, key })
    setTimeout(() => setWorkToast(null), 4000)
  }

  const handleWorkCreate = () => {
    const summary = workSummaryRef.current?.value.trim() || ""
    if (!summary) {
      workSummaryRef.current?.focus()
      return
    }
    if (!workSpace) return
    const issueKey = `SUP-${Math.floor(Math.random() * 900) + 100}`
    // Fire-and-forget API call
    fetch("/api/data/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary,
        type: "task",
        priority: "medium",
        projectId: "proj-1",
        status: "to_do",
      }),
    }).catch(() => {})
    showWorkToast(`Issue created: ${summary}`, issueKey)
    if (createAnother) {
      // Clear form but keep modal open
      if (workSummaryRef.current) workSummaryRef.current.value = ""
      setWorkDescription("")
      workSummaryRef.current?.focus()
    } else {
      setCreateType(null)
      setWorkDescription("")
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    if (createType === "goal") {
      const ownerMap: Record<string, string> = {
        "Abhishek Sharma": "usr-1",
        "Sam Williams": "usr-2",
        "Jordan Lee": "usr-3",
        "Taylor Brown": "usr-4",
      }
      await fetch("/api/data/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          owner: ownerMap[selectedOwner] ?? "usr-1",
          team: goalTeam,
          targetDate: targetDate || "",
        }),
      })
      setSaving(false)
      setCreateType(null)
      setName("")
      setGoalDescription("")
      setGoalTeam("Engineering")
      setSelectedOwner("Abhishek Sharma")
      setTargetDate("")
      router.push("/goals")
    } else if (createType === "team") {
      setSaving(false)
      setCreateType(null)
      setName("")
      router.push("/teams")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Create"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <svg
            aria-hidden="true"
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={() => {
              setCreateType("goal")
              setName("")
            }}
          >
            <svg
              className="size-5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Goal
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCreateType("work")
              setName("")
            }}
          >
            <svg
              className="size-5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            Work item
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCreateType("project")
              setName("")
            }}
          >
            <svg
              className="size-5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCreateType("team")
              setName("")
            }}
          >
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
            Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Goal dialog — matches real Jira */}
      <Dialog
        open={createType === "goal"}
        onOpenChange={(o) => {
          if (!o) setCreateType(null)
        }}
      >
        <DialogContent className="p-0 sm:max-w-[480px]">
          {/* Header with back arrow + icon */}
          <div className="flex items-center gap-2 px-6 pt-6 pb-2">
            <button
              onClick={() => setCreateType(null)}
              className="rounded p-1 text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <svg
              className="size-5 text-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
            </svg>
            <span className="text-lg font-semibold">Goal</span>
          </div>
          <p className="mb-4 px-6 text-xs text-muted-foreground">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </p>

          <div className="space-y-4 px-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) handleCreate()
                }}
              />
            </div>
            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="What is this goal about?"
                className="min-h-[72px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            {/* Type dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2.5 text-sm"
              >
                <option value="Objective">Objective</option>
                <option value="Key Result">Key Result</option>
                <option value="Project">Project</option>
              </select>
            </div>

            {/* Target date — interactive picker */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Target date
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDatePickerOpen(!datePickerOpen)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left"
                >
                  <span
                    className={`text-sm ${targetDate ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {targetDate || "Select a date"}
                  </span>
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>

                {datePickerOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border bg-popover p-3 shadow-lg">
                    {/* Tab bar */}
                    <div className="mb-3 flex rounded-md border">
                      {(["day", "month", "quarter"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setDatePickerTab(t)}
                          className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${datePickerTab === t ? "bg-blue-600 text-white" : "hover:bg-accent"}`}
                        >
                          {t === "day"
                            ? "Day"
                            : t === "month"
                              ? "Month"
                              : "Quarter"}
                        </button>
                      ))}
                    </div>

                    {/* Year nav */}
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        onClick={() => setDatePickerYear((y) => y - 1)}
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
                      <span className="text-sm font-semibold">
                        {datePickerYear}
                      </span>
                      <button
                        onClick={() => setDatePickerYear((y) => y + 1)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>

                    {/* Month grid */}
                    {datePickerTab === "month" && (
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ].map((m, i) => {
                          const val = `${m} ${datePickerYear}`
                          const isSelected = targetDate === val
                          const isCurrent =
                            new Date().getMonth() === i &&
                            new Date().getFullYear() === datePickerYear
                          return (
                            <button
                              key={m}
                              onClick={() => {
                                setTargetDate(val)
                                setDatePickerOpen(false)
                              }}
                              className={`rounded-md py-2 text-xs font-medium transition-colors ${isSelected ? "bg-blue-600 text-white" : isCurrent ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : "hover:bg-accent"}`}
                            >
                              {m}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Quarter grid */}
                    {datePickerTab === "quarter" && (
                      <div className="grid grid-cols-2 gap-2">
                        {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                          const val = `${q} ${datePickerYear}`
                          return (
                            <button
                              key={q}
                              onClick={() => {
                                setTargetDate(val)
                                setDatePickerOpen(false)
                              }}
                              className={`rounded-md py-3 text-sm font-medium transition-colors ${targetDate === val ? "bg-blue-600 text-white" : "border hover:bg-accent"}`}
                            >
                              {q}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Day — simple input */}
                    {datePickerTab === "day" && (
                      <div>
                        <input
                          type="date"
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              setTargetDate(
                                new Date(e.target.value).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              )
                              setDatePickerOpen(false)
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Owner — searchable dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Owner <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOwnerOpen(!ownerOpen)}
                  className="flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {selectedOwner
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="flex-1 text-left text-sm">
                    {selectedOwner}
                  </span>
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {ownerOpen && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border bg-popover shadow-lg">
                    <div className="p-2">
                      <Input
                        placeholder="Search people..."
                        value={ownerSearch}
                        onChange={(e) => setOwnerSearch(e.target.value)}
                        className="h-8 text-xs"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      {[
                        { name: "Abhishek Sharma", color: "bg-blue-600" },
                        { name: "Slack", color: "bg-purple-500" },
                        { name: "Alert Integration", color: "bg-orange-500" },
                        { name: "Jira Spreadsheets", color: "bg-green-600" },
                        { name: "Automation", color: "bg-yellow-500" },
                        { name: "Jira Outlook", color: "bg-blue-500" },
                        { name: "Statuspage for Jira", color: "bg-teal-500" },
                        {
                          name: "Microsoft Teams for Jira Cloud",
                          color: "bg-indigo-600",
                        },
                      ]
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(ownerSearch.toLowerCase())
                        )
                        .map((person) => (
                          <button
                            key={person.name}
                            onClick={() => {
                              setSelectedOwner(person.name)
                              setOwnerOpen(false)
                              setOwnerSearch("")
                            }}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${selectedOwner === person.name ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "hover:bg-accent"}`}
                          >
                            <div
                              className={`flex size-6 items-center justify-center rounded-full ${person.color} shrink-0 text-[9px] font-bold text-white`}
                            >
                              {person.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            {person.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Team <span className="text-red-500">*</span>
              </label>
              <select
                value={goalTeam}
                onChange={(e) => setGoalTeam(e.target.value)}
                className="flex w-full items-center rounded-md border bg-background px-3 py-2.5 text-sm"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="QA">QA</option>
                <option value="DevOps">DevOps</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t px-6 py-5">
            <Button variant="outline" onClick={() => setCreateType(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleCreate}
              disabled={!name.trim() || saving}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Work toast */}
      {workToast && (
        <div className="fixed top-4 right-4 z-[10000] flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          <svg
            className="size-4 shrink-0 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{workToast.text}</span>
          <Link
            href={`/issue/${workToast.key}`}
            className="ml-1 text-blue-600 hover:underline"
          >
            View
          </Link>
        </div>
      )}

      {/* Work item dialog — manual modal, not base-ui Dialog */}
      {createType === "work" && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateType(null)
          }}
        >
          <div
            className="max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-1">
              <h2 className="text-base font-semibold">
                Create Submit a request or incident
              </h2>
              <div className="flex items-center gap-1">
                <button
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                  title="Minimize"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
                <button
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                  title="More"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="mb-3 px-6 text-xs text-muted-foreground">
              Required fields are marked with an asterisk{" "}
              <span className="text-red-500">*</span>
            </p>

            <div className="space-y-4 px-6">
              {/* Space selector — custom dropdown with icons */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Space <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSpaceDropOpen(!spaceDropOpen)}
                    className="flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded bg-orange-400 text-[9px] font-bold text-white">
                      <svg
                        className="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <span className="flex-1 text-sm">{workSpace}</span>
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {spaceDropOpen && (
                    <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                      {[
                        {
                          group: "Recent",
                          items: [
                            {
                              name: "khfiyfifiyfy (KHFIYF)",
                              color: "bg-blue-400",
                              icon: "grid",
                            },
                            {
                              name: "hcu (IJDAIDJAIP)",
                              color: "bg-orange-500",
                              icon: "box",
                            },
                            {
                              name: "My Scrum Project (SCRUM)",
                              color: "bg-blue-400",
                              icon: "grid",
                            },
                          ],
                        },
                        {
                          group: "All Spaces",
                          items: [
                            {
                              name: "bvjwbefeow (BVJWBEF)",
                              color: "bg-orange-500",
                              icon: "box",
                            },
                            {
                              name: "hcu (IJDAIDJAIP)",
                              color: "bg-orange-500",
                              icon: "box",
                            },
                            {
                              name: "khfiyfifiyfy (KHFIYF)",
                              color: "bg-blue-400",
                              icon: "grid",
                            },
                            {
                              name: "My Scrum Project (SCRUM)",
                              color: "bg-blue-400",
                              icon: "grid",
                            },
                            {
                              name: "Support (SUP)",
                              color: "bg-orange-400",
                              icon: "pen",
                            },
                          ],
                        },
                      ].map((section) => (
                        <div key={section.group}>
                          <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground">
                            {section.group}
                          </p>
                          {section.items.map((item) => (
                            <button
                              key={`${section.group}-${item.name}`}
                              onClick={() => {
                                setWorkSpace(item.name)
                                setSpaceDropOpen(false)
                              }}
                              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${workSpace === item.name ? "border-l-2 border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "hover:bg-accent"}`}
                            >
                              <div
                                className={`flex size-6 items-center justify-center rounded ${item.color} shrink-0 text-white`}
                              >
                                <svg
                                  className="size-3"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                >
                                  <rect
                                    x="2"
                                    y="2"
                                    width="12"
                                    height="12"
                                    rx="2"
                                  />
                                </svg>
                              </div>
                              {item.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Work type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Work type <span className="text-red-500">*</span>
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="Submit a request or incident">
                    Submit a request or incident
                  </option>
                  <option value="Ask a question">Ask a question</option>
                  <option value="Emailed request">Emailed request</option>
                  <option value="Task">Task</option>
                </select>
                <Link
                  href="/products"
                  className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                >
                  Learn about work types
                </Link>
              </div>

              {/* Request type — custom dropdown with descriptions */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Request type <span className="text-red-500">*</span>
                  <Link
                    href="/products"
                    className="ml-2 text-xs font-normal text-blue-600 hover:underline"
                  >
                    What&apos;s this?
                  </Link>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setReqTypeDropOpen(!reqTypeDropOpen)}
                    className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors hover:border-blue-400"
                  >
                    <span className="text-sm">{workRequestType}</span>
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {reqTypeDropOpen && (
                    <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                      {/* Current selection */}
                      <button
                        onClick={() => {
                          setWorkRequestType("Submit a request or incident")
                          setReqTypeDropOpen(false)
                        }}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${workRequestType === "Submit a request or incident" ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-accent"}`}
                      >
                        <svg
                          className="mt-0.5 size-5 shrink-0 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">
                            Submit a request or incident
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submit a request or report a problem.
                          </p>
                        </div>
                      </button>

                      <div className="my-1 border-t" />

                      {/* No request type */}
                      <button
                        onClick={() => {
                          setWorkRequestType("No request type")
                          setReqTypeDropOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                      >
                        <svg
                          className="size-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        <div>
                          <p className="text-sm">No request type</p>
                          <p className="text-[11px] text-muted-foreground">
                            Work items can&apos;t be shared with customers, and
                            may not work as expected.
                          </p>
                        </div>
                      </button>

                      <div className="my-1 border-t" />
                      <p className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                        Request types
                      </p>

                      {[
                        {
                          name: "Ask a question",
                          desc: "Have a question? Submit it here.",
                          icon: "help",
                        },
                        {
                          name: "Emailed request",
                          desc: "Request received from your email support channel.",
                          icon: "mail",
                        },
                        {
                          name: "Submit a request or incident",
                          desc: "Submit a request or report a problem.",
                          icon: "file",
                        },
                      ].map((rt) => (
                        <button
                          key={rt.name}
                          onClick={() => {
                            setWorkRequestType(rt.name)
                            setReqTypeDropOpen(false)
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${workRequestType === rt.name ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-accent"}`}
                        >
                          <svg
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            {rt.icon === "help" && (
                              <>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </>
                            )}
                            {rt.icon === "mail" && (
                              <>
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </>
                            )}
                            {rt.icon === "file" && (
                              <>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </>
                            )}
                          </svg>
                          <div>
                            <p className="text-sm">{rt.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {rt.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Use request type fields toggle */}
              <label className="flex cursor-pointer items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseRequestFields(!useRequestFields)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useRequestFields ? "bg-blue-600" : "bg-muted"}`}
                >
                  <span
                    className={`inline-block size-3.5 rounded-full bg-white transition-transform ${useRequestFields ? "translate-x-4.5" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-xs text-muted-foreground">
                  Use request type fields
                </span>
              </label>

              {/* Raise on behalf of */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Raise this request on behalf of{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2.5 rounded-md border px-3 py-2.5">
                  <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    AS
                  </div>
                  <span className="text-sm">Abhishek Sharma</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Summary <span className="text-red-500">*</span>
                </label>
                <input
                  ref={workSummaryRef}
                  type="text"
                  autoFocus
                  defaultValue=""
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleWorkCreate()
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Description with full toolbar — matches Image 47 */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    What are the details of your request?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  {workDescription.trim() && (
                    <button className="flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent">
                      View changes
                      <kbd className="rounded bg-muted px-1 font-mono text-[9px]">
                        ⌘⇧Z
                      </kbd>
                    </button>
                  )}
                </div>
                <div className="rounded-md border transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <div className="relative flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
                    {/* AI Improve writing dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setAiDropOpen(!aiDropOpen)
                          setHeadingDropOpen(false)
                          setBoldDropOpen(false)
                          setListDropOpen(false)
                        }}
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground/60 italic hover:bg-accent"
                      >
                        <svg
                          className="size-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
                        </svg>
                        Improve writing
                        <svg
                          className="size-3 text-muted-foreground/40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {aiDropOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-44 rounded-md border bg-popover py-1 shadow-lg">
                          {[
                            "Improve writing",
                            "Fix spelling & grammar",
                            "Make shorter",
                            "Make longer",
                            "Change tone",
                          ].map((a) => (
                            <button
                              key={a}
                              onClick={() => setAiDropOpen(false)}
                              className="flex w-full px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="mx-0.5 h-4 w-px bg-border" />

                    {/* Tt heading dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setHeadingDropOpen(!headingDropOpen)
                          setAiDropOpen(false)
                          setBoldDropOpen(false)
                          setListDropOpen(false)
                        }}
                        className="rounded px-1 py-0.5 text-sm font-semibold text-muted-foreground hover:bg-accent"
                      >
                        Tt
                      </button>
                      {headingDropOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-40 rounded-md border bg-popover py-1 shadow-lg">
                          <button
                            onClick={() => setHeadingDropOpen(false)}
                            className="flex w-full items-center gap-2 bg-blue-50 px-3 py-1.5 text-sm transition-colors hover:bg-accent dark:bg-blue-900/20"
                          >
                            <svg
                              className="size-3.5 text-blue-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Normal text
                          </button>
                          {[1, 2, 3, 4, 5, 6].map((h) => (
                            <button
                              key={h}
                              onClick={() => setHeadingDropOpen(false)}
                              className="flex w-full px-3 py-1.5 transition-colors hover:bg-accent"
                            >
                              <span
                                style={{
                                  fontSize: `${20 - h * 2}px`,
                                  fontWeight: 600,
                                  lineHeight: 1.3,
                                }}
                              >
                                Heading {h}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bold dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setBoldDropOpen(!boldDropOpen)
                          setHeadingDropOpen(false)
                          setAiDropOpen(false)
                          setListDropOpen(false)
                        }}
                        className="flex items-center rounded text-muted-foreground hover:bg-accent"
                      >
                        <span className="px-1 py-0.5 text-sm font-bold">B</span>
                        <svg
                          className="mr-0.5 size-3 text-muted-foreground/40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {boldDropOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-36 rounded-md border bg-popover py-1 shadow-lg">
                          {[
                            {
                              label: "Bold",
                              shortcut: "⌘B",
                              style: "font-bold",
                            },
                            {
                              label: "Italic",
                              shortcut: "⌘I",
                              style: "italic",
                            },
                            {
                              label: "Underline",
                              shortcut: "⌘U",
                              style: "underline",
                            },
                            {
                              label: "Strikethrough",
                              shortcut: "⌘⇧S",
                              style: "line-through",
                            },
                            {
                              label: "Code",
                              shortcut: "⌘⇧M",
                              style: "font-mono text-xs",
                            },
                            {
                              label: "Subscript",
                              shortcut: "",
                              style: "text-xs",
                            },
                            {
                              label: "Superscript",
                              shortcut: "",
                              style: "text-xs",
                            },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => setBoldDropOpen(false)}
                              className="flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                            >
                              <span className={item.style}>{item.label}</span>
                              {item.shortcut && (
                                <span className="text-[10px] text-muted-foreground">
                                  {item.shortcut}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* List dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setListDropOpen(!listDropOpen)
                          setHeadingDropOpen(false)
                          setAiDropOpen(false)
                          setBoldDropOpen(false)
                        }}
                        className="flex items-center rounded text-muted-foreground hover:bg-accent"
                      >
                        <span className="p-1">
                          <svg
                            className="size-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                        </span>
                        <svg
                          className="mr-0.5 size-3 text-muted-foreground/40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {listDropOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-40 rounded-md border bg-popover py-1 shadow-lg">
                          {[
                            "Bullet list",
                            "Numbered list",
                            "Checklist",
                            "Expand",
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => setListDropOpen(false)}
                              className="flex w-full px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="mx-0.5 h-4 w-px bg-border" />

                    {/* Text color picker (Image 50) */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          closeAllToolbar()
                          setColorPickerOpen(!colorPickerOpen)
                        }}
                        className="rounded border px-1.5 py-0.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                        title="Text color"
                      >
                        A
                      </button>
                      {colorPickerOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-md border bg-popover p-3 shadow-lg">
                          <p className="mb-2 text-xs font-medium">Text color</p>
                          <div className="mb-3 grid grid-cols-8 gap-1.5">
                            {[
                              "#172B4D",
                              "#0052CC",
                              "#00875A",
                              "#FF5630",
                              "#FF991F",
                              "#6554C0",
                              "#00B8D9",
                              "#36B37E",
                              "#253858",
                              "#0747A6",
                              "#006644",
                              "#BF2600",
                              "#FF8B00",
                              "#403294",
                              "#008DA6",
                              "#006644",
                              "#505F79",
                              "#4C9AFF",
                              "#57D9A3",
                              "#FF7452",
                              "#FFC400",
                              "#8777D9",
                              "#79E2F2",
                              "#ABF5D1",
                              "#7A869A",
                              "#B3D4FF",
                              "#ABF5D1",
                              "#FFBDAD",
                              "#FFF0B3",
                              "#C0B6F2",
                              "#B3F5FF",
                              "#DFFBE6",
                            ].map((c, i) => (
                              <button
                                key={i}
                                onClick={() => setColorPickerOpen(false)}
                                className="size-5 rounded-sm border transition-transform hover:scale-110"
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setColorPickerOpen(false)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Remove color
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image insert (Image 51) */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          closeAllToolbar()
                          setImagePopOpen(!imagePopOpen)
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                        title="Insert image"
                      >
                        <svg
                          className="size-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </button>
                      {imagePopOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md border bg-popover shadow-lg">
                          <div className="flex border-b">
                            {(["file", "link", "upload"] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => setImageTab(t)}
                                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${imageTab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                              >
                                {t === "file"
                                  ? "File"
                                  : t === "link"
                                    ? "Link"
                                    : "Upload"}
                              </button>
                            ))}
                          </div>
                          <div className="p-3">
                            {imageTab === "link" ? (
                              <input
                                type="text"
                                placeholder="Paste image URL"
                                className="mb-2 h-8 w-full rounded-md border bg-background px-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 rounded-md border-2 border-dashed py-3">
                                <svg
                                  className="size-8 text-muted-foreground/40"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                  />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p className="text-xs text-muted-foreground">
                                  Add image, video, or file
                                </p>
                              </div>
                            )}
                            <button
                              onClick={() => setImagePopOpen(false)}
                              className="mt-2 w-full rounded bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              {imageTab === "upload" ? "Upload" : "Insert"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Code snippet (Image 52) */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          closeAllToolbar()
                          setCodePopOpen(!codePopOpen)
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                        title="Code block"
                      >
                        <svg
                          className="size-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      </button>
                      {codePopOpen && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md border bg-popover shadow-lg">
                          <div className="px-3 pt-3 pb-1">
                            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Code snippet
                            </span>
                          </div>
                          <div className="p-3">
                            <select
                              value={codeLang}
                              onChange={(e) => setCodeLang(e.target.value)}
                              className="mb-2 w-full rounded border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="">Select language</option>
                              {[
                                "JavaScript",
                                "TypeScript",
                                "Python",
                                "Java",
                                "Go",
                                "Rust",
                                "HTML",
                                "CSS",
                                "SQL",
                                "Bash",
                                "JSON",
                                "YAML",
                                "Markdown",
                              ].map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setCodePopOpen(false)}
                              className="w-full rounded bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Emoji picker (Image 53) */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          closeAllToolbar()
                          setEmojiPopOpen(!emojiPopOpen)
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                        title="Emoji"
                      >
                        <svg
                          className="size-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </button>
                      {emojiPopOpen && (
                        <div className="absolute top-full right-0 z-50 mt-1 w-72 rounded-md border bg-popover shadow-lg">
                          <div className="border-b p-2">
                            <div className="relative">
                              <svg
                                className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                              <input
                                type="text"
                                value={emojiSearch}
                                onChange={(e) => setEmojiSearch(e.target.value)}
                                placeholder="Search..."
                                className="h-7 w-full rounded-md border bg-background pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="mb-1 px-1 text-[10px] font-semibold text-muted-foreground">
                              + Add your own emoji
                            </p>
                            <p className="mt-2 mb-1.5 px-1 text-[10px] font-semibold text-muted-foreground">
                              People
                            </p>
                            <div className="grid grid-cols-8 gap-0.5">
                              {[
                                "😀",
                                "😃",
                                "😄",
                                "😁",
                                "😆",
                                "😅",
                                "🤣",
                                "😂",
                                "🙂",
                                "😊",
                                "😇",
                                "🥰",
                                "😍",
                                "🤩",
                                "😘",
                                "😗",
                                "😋",
                                "😛",
                                "😜",
                                "🤪",
                                "😝",
                                "🤑",
                                "🤗",
                                "🤭",
                                "😐",
                                "😑",
                                "😶",
                                "🫡",
                                "🤔",
                                "🤫",
                                "🫢",
                                "😬",
                                "😏",
                                "😒",
                                "🙄",
                                "😮‍💨",
                                "😌",
                                "😔",
                                "🥹",
                                "😪",
                              ].map((e) => (
                                <button
                                  key={e}
                                  onClick={() => {
                                    setWorkDescription((d) => d + e)
                                    setEmojiPopOpen(false)
                                  }}
                                  className="flex size-7 items-center justify-center rounded text-base hover:bg-accent"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Plus/Insert menu (Image 54) */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          closeAllToolbar()
                          setInsertPopOpen(!insertPopOpen)
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                        title="Insert"
                      >
                        <svg
                          className="size-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      {insertPopOpen && (
                        <div className="absolute top-full right-0 z-50 mt-1 w-64 rounded-md border bg-popover shadow-lg">
                          <div className="border-b p-2">
                            <div className="relative">
                              <svg
                                className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                              <input
                                type="text"
                                placeholder="Search"
                                className="h-7 w-full rounded-md border bg-background pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto py-1">
                            {[
                              {
                                name: "Action item",
                                desc: "Create and assign action items.",
                                icon: "check-square",
                              },
                              {
                                name: "Mention",
                                desc: "Mention someone to send them a notification.",
                                icon: "at-sign",
                              },
                              {
                                name: "Table",
                                desc: "Insert a table.",
                                icon: "table",
                              },
                              {
                                name: "Info panel",
                                desc: "Highlight information in a colored panel.",
                                icon: "info",
                              },
                              {
                                name: "Quote",
                                desc: "Insert a quote or citation.",
                                icon: "quote",
                              },
                              {
                                name: "Decision",
                                desc: "Capture decisions so they're easy to track.",
                                icon: "thumbs-up",
                              },
                              {
                                name: "Divider",
                                desc: "Separate content with a horizontal line.",
                                icon: "minus",
                              },
                              {
                                name: "Expand",
                                desc: "Insert an expand.",
                                icon: "expand",
                              },
                              {
                                name: "Date",
                                desc: "Add a date using a calendar.",
                                icon: "calendar",
                              },
                              {
                                name: "Status",
                                desc: "Add a custom status label.",
                                icon: "status",
                              },
                            ].map((item) => (
                              <button
                                key={item.name}
                                onClick={() => setInsertPopOpen(false)}
                                className="flex w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                              >
                                <div className="mt-0.5 shrink-0">
                                  <svg
                                    className="size-5 text-muted-foreground"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    {item.icon === "check-square" && (
                                      <>
                                        <path d="M9 11l3 3L22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                      </>
                                    )}
                                    {item.icon === "at-sign" && (
                                      <>
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                                      </>
                                    )}
                                    {item.icon === "table" && (
                                      <>
                                        <rect
                                          x="3"
                                          y="3"
                                          width="18"
                                          height="18"
                                          rx="2"
                                        />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="3" y1="15" x2="21" y2="15" />
                                        <line x1="9" y1="3" x2="9" y2="21" />
                                        <line x1="15" y1="3" x2="15" y2="21" />
                                      </>
                                    )}
                                    {item.icon === "info" && (
                                      <>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line
                                          x1="12"
                                          y1="8"
                                          x2="12.01"
                                          y2="8"
                                        />
                                      </>
                                    )}
                                    {item.icon === "quote" && (
                                      <>
                                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
                                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
                                      </>
                                    )}
                                    {item.icon === "thumbs-up" && (
                                      <>
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                      </>
                                    )}
                                    {item.icon === "minus" && (
                                      <line x1="5" y1="12" x2="19" y2="12" />
                                    )}
                                    {item.icon === "expand" && (
                                      <>
                                        <polyline points="15 3 21 3 21 9" />
                                        <polyline points="9 21 3 21 3 15" />
                                        <line x1="21" y1="3" x2="14" y2="10" />
                                        <line x1="3" y1="21" x2="10" y2="14" />
                                      </>
                                    )}
                                    {item.icon === "calendar" && (
                                      <>
                                        <rect
                                          x="3"
                                          y="4"
                                          width="18"
                                          height="18"
                                          rx="2"
                                        />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                      </>
                                    )}
                                    {item.icon === "status" && (
                                      <>
                                        <rect
                                          x="2"
                                          y="7"
                                          width="20"
                                          height="10"
                                          rx="5"
                                        />
                                        <line x1="8" y1="12" x2="16" y2="12" />
                                      </>
                                    )}
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {item.desc}
                                  </p>
                                </div>
                                {item.name === "Mention" && (
                                  <button className="mt-1 ml-auto shrink-0 text-muted-foreground hover:text-foreground">
                                    <svg
                                      className="size-4"
                                      viewBox="0 0 16 16"
                                      fill="currentColor"
                                    >
                                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                    </svg>
                                  </button>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Link */}
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-accent"
                      title="Link"
                      onClick={() => {
                        const url = prompt("Enter URL:")
                        if (url)
                          setWorkDescription((d) => d + ` [link](${url})`)
                      }}
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>
                    {/* Undo */}
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-accent"
                      title="Undo"
                      onClick={() => setWorkDescription((d) => d.slice(0, -1))}
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </button>
                    {/* Redo */}
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-accent"
                      title="Redo"
                      onClick={() => setWorkDescription((d) => d + " ")}
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </button>
                    {/* History */}
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-accent"
                      title="Recent edit history"
                      onClick={() => setWorkDescription("")}
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Type /ai to Ask Rovo or @ to mention and notify someone."
                    className="min-h-[100px] w-full resize-none border-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Organizations */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Organizations
                </label>
                <select
                  value={workOrg}
                  onChange={(e) => setWorkOrg(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="">Select organization</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t px-6 py-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={() => setCreateAnother(!createAnother)}
                  className="size-4 rounded border accent-blue-600"
                />
                Create another
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreateType(null)}
                  className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWorkCreate}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project toast */}
      {projectToast && (
        <div className="fixed top-4 right-4 z-[10000] flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          <svg
            className="size-4 shrink-0 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {projectToast}
        </div>
      )}

      {/* Project dialog — manual modal, not base-ui Dialog */}
      {createType === "project" && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateType(null)
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-5 pt-5 pb-1">
              <button
                onClick={() => setCreateType(null)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <svg
                className="size-5 text-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-base font-semibold">Project</span>
            </div>
            <p className="mb-3 px-5 text-xs text-muted-foreground">
              Required fields are marked with an asterisk{" "}
              <span className="text-red-500">*</span>
            </p>

            <div className="space-y-4 px-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleProjectCreate()
                  }}
                  placeholder="e.g. Marketing"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Choose an emoji */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-accent">
                  <span className="text-base">📁</span>
                  <span className="text-muted-foreground">Choose an emoji</span>
                </button>
              </div>

              {/* Link to epic */}
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Link to an existing Jira epic
                </label>
                <div className="relative">
                  <svg
                    className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search epics"
                    className="h-8 w-full rounded-md border bg-background pr-3 pl-9 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Privacy controls */}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Privacy controls
                </label>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <p className="text-xs leading-snug text-muted-foreground">
                    Only contributors or people you share with can view a
                    private project.
                  </p>
                  <button
                    className="relative ml-3 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-muted"
                    onClick={(e) => {
                      const el = e.currentTarget
                      el.classList.toggle("bg-blue-600")
                      el.classList.toggle("bg-muted")
                      const dot = el.firstElementChild as HTMLElement
                      dot.classList.toggle("translate-x-4.5")
                      dot.classList.toggle("translate-x-0.5")
                    }}
                  >
                    <span className="inline-block size-3.5 translate-x-0.5 rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setCreateType(null)
                  setName("")
                }}
                className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProjectCreate}
                disabled={!name.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team dialog — matches Image 61 */}
      <Dialog
        open={createType === "team"}
        onOpenChange={(o) => {
          if (!o) setCreateType(null)
        }}
      >
        <DialogContent className="p-0 sm:max-w-[420px]">
          <div className="flex items-center gap-2 px-5 pt-5 pb-1">
            <button
              onClick={() => setCreateType(null)}
              className="rounded p-1 text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <svg
              className="size-5 text-foreground"
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
            <span className="text-base font-semibold">Team</span>
          </div>

          <div className="space-y-4 px-5 pt-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate()
                }}
              />
            </div>

            {/* Add team members */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Add team members <span className="text-red-500">*</span>
              </label>
              <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-md border px-2 py-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 py-0.5 pr-2 pl-1 dark:bg-blue-900/30">
                  <div className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
                    AS
                  </div>
                  <span className="text-xs font-medium">Abhishek Sharma</span>
                </span>
                <input
                  placeholder="Type name..."
                  className="min-w-[80px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Type <span className="text-red-500">*</span>
              </label>
              <select className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                <option value="official">Official team 🛡️</option>
                <option value="virtual">Virtual team</option>
                <option value="project">Project team</option>
              </select>
            </div>

            {/* reCAPTCHA notice */}
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              This site is protected by reCAPTCHA and the Google{" "}
              <Link
                href="/admin/security"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/admin/settings"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              apply.
            </p>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={() => setCreateType(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleCreate}
              disabled={!name.trim() || saving}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Static icon components used inside HomeSearchBar; declared at module
// scope so React doesn't recreate them on every render.
function IssueTypeIcon({ type }: { type: string }) {
  const bg =
    type === "bug"
      ? "bg-red-500"
      : type === "story"
        ? "bg-green-500"
        : "bg-blue-500"
  return (
    <div
      className={`flex size-6 shrink-0 items-center justify-center rounded-md ${bg}`}
    >
      <svg
        className="size-3.5 text-white"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2,7 5.5,10.5 12,3.5" />
      </svg>
    </div>
  )
}

function BoardGridIcon() {
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background">
      <svg
        className="size-3.5 text-foreground"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <rect x="1" y="1" width="6" height="6" rx="0.5" />
        <rect x="9" y="1" width="6" height="6" rx="0.5" />
        <rect x="1" y="9" width="6" height="6" rx="0.5" />
        <rect x="9" y="9" width="6" height="6" rx="0.5" />
      </svg>
    </div>
  )
}

function JiraProjectIcon({ color = "bg-violet-600" }: { color?: string }) {
  return (
    <div
      className={`flex size-6 shrink-0 items-center justify-center rounded-md ${color}`}
    >
      <svg className="size-3.5 text-white" viewBox="0 0 32 32" fill="white">
        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
      </svg>
    </div>
  )
}

function ProjectIcon({ color = "bg-blue-500" }: { color?: string }) {
  return (
    <div
      className={`flex size-6 shrink-0 items-center justify-center rounded-md ${color}`}
    >
      <svg
        className="size-3.5 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3 3h18v4H3zm0 6h18v4H3zm0 6h18v4H3z" />
      </svg>
    </div>
  )
}

function TeamIcon({ color = "bg-blue-500" }: { color?: string }) {
  return (
    <div
      className={`flex size-6 shrink-0 items-center justify-center rounded-md ${color}`}
    >
      <svg
        className="size-3.5 text-white"
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
    </div>
  )
}

function HomeSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"Home" | "Jira">("Jira")
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [results, setResults] = useState<{
    issues: Issue[]
    projects: Project[]
    users: User[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    fetch("/api/data/issues")
      .then((r) => r.json())
      .then((data: Issue[]) => {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setRecentIssues(sorted.slice(0, 3))
      })
      .catch(() => {})
    fetch("/api/data/projects")
      .then((r) => r.json())
      .then((data: Project[]) => setRecentProjects(data.slice(0, 2)))
      .catch(() => {})
    fetch("/api/data/users")
      .then((r) => r.json())
      .then((data: User[]) => setRecentUsers(data.slice(0, 2)))
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
        setResults(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setQuery("")
        setResults(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    fetch(`/api/data/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 200)
  }

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    setResults(null)
    router.push(href)
  }

  const hasResults =
    results &&
    (results.issues.length > 0 ||
      results.projects.length > 0 ||
      results.users.length > 0)

  const handleClear = () => {
    setQuery("")
    setResults(null)
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex-1" ref={ref}>
      {/* Input */}
      <div
        className={`flex h-9 items-center gap-2 rounded-md border px-3 transition-colors ${open ? "border-blue-500 bg-white ring-2 ring-blue-500/20" : "border-input bg-muted/50"}`}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        <svg
          className="size-4 shrink-0 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Jira"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim())
              go(`/search?q=${encodeURIComponent(query.trim())}`)
          }}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && (
          <div className="size-4 shrink-0 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        )}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="shrink-0 text-muted-foreground hover:text-foreground"
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
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 left-0 z-[200] mt-1 overflow-hidden rounded-lg border bg-popover shadow-xl">
          {/* Tabs — Home | Jira */}
          <div className="flex border-b px-2 pt-1">
            {(["Home", "Jira"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Jira tab ── */}
          {activeTab === "Jira" && (
            <div>
              {!query.trim() ? (
                <>
                  {/* View all issues */}
                  <button
                    onClick={() => go("/filters/all-work-items")}
                    className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="flex-1 text-sm font-medium">
                      View all issues
                    </span>
                    <span className="rounded border px-1 py-0.5 text-xs text-muted-foreground">
                      ↵
                    </span>
                  </button>

                  {/* Recently viewed issues */}
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Recently viewed issues
                  </div>
                  {recentIssues.length > 0 ? (
                    recentIssues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => go(`/issue/${issue.key}`)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                      >
                        <IssueTypeIcon type={issue.type} />
                        <span className="flex-1 truncate text-sm">
                          {issue.key} {issue.summary}
                        </span>
                        <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                          My Team
                        </span>
                        <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                          Recently viewed
                        </span>
                      </button>
                    ))
                  ) : (
                    <>
                      {[
                        { key: "SCRUM-6", summary: "wxdxadxax" },
                        { key: "SCRUM-5", summary: "vijay" },
                        { key: "SCRUM-1", summary: "Task 1" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => go(`/issue/${item.key}`)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                        >
                          <IssueTypeIcon type="task" />
                          <span className="flex-1 truncate text-sm">
                            {item.key} {item.summary}
                          </span>
                          <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                            My Team
                          </span>
                          <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                            Recently viewed
                          </span>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Recent projects and filters */}
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Recent projects and filters
                  </div>
                  {recentProjects.length > 0 ? (
                    recentProjects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => go(`/projects/${proj.key}/board`)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                      >
                        <BoardGridIcon />
                        <span className="flex-1 truncate text-sm">
                          {proj.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          My Team
                        </span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => go("/projects/SCRUM/board")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                      >
                        <BoardGridIcon />
                        <span className="flex-1 text-sm">SCRUM board</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          My Team
                        </span>
                      </button>
                      <button
                        onClick={() => go("/projects")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                      >
                        <JiraProjectIcon color="bg-violet-600" />
                        <span className="flex-1 text-sm">My Team (SCRUM)</span>
                      </button>
                    </>
                  )}

                  {/* Footer — pill buttons */}
                  <div className="mt-1 flex items-center gap-2 border-t px-4 py-3">
                    <span className="shrink-0 text-sm text-muted-foreground">
                      Go to all:
                    </span>
                    {[
                      { label: "Issues", href: "/filters/all-work-items" },
                      { label: "Projects", href: "/projects" },
                      { label: "Filters", href: "/filters" },
                      { label: "People", href: "/teams/people" },
                    ].map(({ label, href }) => (
                      <button
                        key={label}
                        onClick={() => go(href)}
                        className="rounded border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Search hint + help link */}
                  <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="flex-1 text-xs text-muted-foreground">
                      Search for pages, users, and more
                    </span>
                    <a
                      href="https://support.atlassian.com/jira-work-management/docs/search-for-issues/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Tell me more about search
                    </a>
                  </div>
                </>
              ) : (
                /* Search results */
                <div>
                  {!hasResults && !loading && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}
                  {results && results.issues.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Recently viewed issues
                      </div>
                      {results.issues.map((issue) => (
                        <button
                          key={issue.id}
                          onClick={() => go(`/issue/${issue.key}`)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                        >
                          <IssueTypeIcon type={issue.type} />
                          <span className="flex-1 truncate text-sm">
                            {issue.key} {issue.summary}
                          </span>
                          <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                            My Team
                          </span>
                          <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                            Recently viewed
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results && results.projects.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Recent projects and filters
                      </div>
                      {results.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => go(`/projects/${project.key}/board`)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                        >
                          <BoardGridIcon />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm">
                              {project.name}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            My Team
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results && results.users.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        People
                      </div>
                      {results.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => go("/teams/people")}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                        >
                          <Avatar className="size-[22px]">
                            <AvatarFallback className="bg-teal-500 text-[9px] text-white">
                              {(user.displayName ?? user.name)
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm">
                              {user.displayName ?? user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 border-t px-4 py-3">
                    <span className="shrink-0 text-sm text-muted-foreground">
                      Go to all:
                    </span>
                    {[
                      { label: "Issues", href: "/filters/all-work-items" },
                      { label: "Projects", href: "/projects" },
                      { label: "Filters", href: "/filters" },
                      { label: "People", href: "/teams/people" },
                    ].map(({ label, href }) => (
                      <button
                        key={label}
                        onClick={() => go(href)}
                        className="rounded-sm border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Home tab ── */}
          {activeTab === "Home" && (
            <div className="max-h-[520px] overflow-y-auto">
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Recent projects
              </div>
              {recentProjects.length > 0 ? (
                recentProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => go(`/projects/${proj.key}/board`)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <ProjectIcon color="bg-blue-500" />
                    <span className="text-sm">{proj.name}</span>
                  </button>
                ))
              ) : (
                <button
                  onClick={() => go("/projects")}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                >
                  <ProjectIcon color="bg-orange-400" />
                  <span className="text-sm">vijay</span>
                </button>
              )}

              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Recent goals
              </div>
              {["geeta", "geeta", "geeta"].map((name, i) => (
                <button
                  key={i}
                  onClick={() => go("/goals")}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                >
                  <ProjectIcon color="bg-blue-400" />
                  <span className="text-sm">{name}</span>
                </button>
              ))}

              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Recent people
              </div>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => go("/teams/people")}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <Avatar className="size-[22px]">
                      <AvatarFallback className="bg-teal-500 text-[9px] text-white">
                        {(user.displayName ?? user.name)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {user.displayName ?? user.name}
                    </span>
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={() => go("/teams/people")}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <Avatar className="size-[22px]">
                      <AvatarFallback className="bg-teal-500 text-[9px] text-white">
                        TC
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Theta Computer</span>
                  </button>
                  <button
                    onClick={() => go("/teams/people")}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <Avatar className="size-[22px]">
                      <AvatarFallback className="bg-orange-500 text-[9px] text-white">
                        V
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">vijay2</span>
                  </button>
                </>
              )}

              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Recently viewed teams
              </div>
              {[
                { name: "geeta", color: "bg-blue-500" },
                { name: "geeta", color: "bg-pink-500" },
                { name: "geeta2", color: "bg-pink-600" },
              ].map(({ name, color }, i) => (
                <button
                  key={i}
                  onClick={() => go("/teams")}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-accent"
                >
                  <TeamIcon color={color} />
                  <span className="text-sm">{name}</span>
                  <svg
                    className="ml-0.5 size-4 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              ))}
              <div className="h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      <CustomizeSidebarDialog
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
      <div className="flex h-screen flex-col" suppressHydrationWarning>
        <header className="relative z-50 flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <AppSwitcher />
            <div className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-sm font-semibold">Home</span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded p-1 text-muted-foreground hover:bg-accent"
              aria-label="Collapse sidebar"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                aria-hidden="true"
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
            </button>
          </div>
          <div className="mx-4 flex flex-1 items-center gap-2">
            <HomeSearchBar />
            <CreateDropdown />
          </div>
          <div className="flex items-center gap-2">
            <NotificationsPopover />
            <HelpButton />
            <Popover>
              <PopoverTrigger
                aria-label="Settings"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent"
              >
                <svg
                  aria-hidden="true"
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
                </svg>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 py-3">
                <p className="px-5 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Atlassian Home settings
                </p>
                <Link
                  href="/admin/organization-settings"
                  aria-label="Workspace settings - Manage workspace name, domains, user groups and time zone"
                  className="flex w-full items-start gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    aria-hidden="true"
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
                  <div>
                    <p className="text-sm font-medium">Workspace settings</p>
                    <p className="text-xs text-muted-foreground">
                      Manage workspace name, domains, user groups and time zone
                    </p>
                  </div>
                </Link>
                <Link
                  href="/home/account-settings"
                  aria-label="Personal settings - Manage notification preferences and themes"
                  className="flex w-full items-start gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Personal settings</p>
                    <p className="text-xs text-muted-foreground">
                      Manage notification preferences and themes
                    </p>
                  </div>
                </Link>

                <div className="my-2 border-t" />

                <p className="px-5 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Atlassian admin settings
                </p>
                <Link
                  href="/admin/users"
                  aria-label="User management - Manage users, groups, and access requests"
                  className="flex w-full items-start gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    aria-hidden="true"
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
                  <div>
                    <p className="text-sm font-medium">User management</p>
                    <p className="text-xs text-muted-foreground">
                      Manage users, groups, and access requests
                    </p>
                  </div>
                </Link>
                <Link
                  href="/admin/licensing"
                  aria-label="Licensing - Server and Data Center licensing"
                  className="flex w-full items-start gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Licensing</p>
                    <p className="text-xs text-muted-foreground">
                      Server and Data Center licensing
                    </p>
                  </div>
                </Link>
                <Link
                  href="/admin/billing"
                  aria-label="Billing - Update your billing details, manage subscriptions, and more"
                  className="flex w-full items-start gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Billing</p>
                    <p className="text-xs text-muted-foreground">
                      Update your billing details, manage subscriptions, and
                      more
                    </p>
                  </div>
                </Link>
              </PopoverContent>
            </Popover>
            <UserAvatarDropdown />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside
            className={`flex shrink-0 flex-col overflow-y-auto border-r transition-all duration-200 ${sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"}`}
          >
            <nav className="isolate flex flex-col gap-0.5 p-2">
              {sidebarNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className={`relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-foreground hover:bg-accent"}`}
                >
                  <span
                    className={
                      pathname === item.href
                        ? "text-blue-600"
                        : "text-muted-foreground"
                    }
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}

              <div className="my-2 border-t" />

              {appLinks.map((app) => (
                <Link
                  key={app.name}
                  href={app.href}
                  aria-label={app.ariaLabel}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  {app.icon}
                  {app.name}
                  <svg
                    aria-hidden="true"
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
              ))}

              <Link
                href="/home/apps"
                aria-label="Open Jira Service Management"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600">
                  <svg
                    aria-hidden="true"
                    className="size-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                Jira Service Management
                <span className="ml-auto rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  TRY
                </span>
                <svg
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </Link>

              <Link
                href="/home/apps"
                aria-label="View all apps"
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/home/apps" ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                View all apps
              </Link>

              <button
                onClick={() => setCustomizeOpen(true)}
                aria-label="Customize sidebar"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
                </svg>
                Customize sidebar
              </button>
            </nav>

            <div className="mt-auto border-t p-3">
              <a
                href="https://www.atlassian.com/feedback"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Give feedback on the new navigation"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Give feedback on the new navigation
              </a>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </>
  )
}
