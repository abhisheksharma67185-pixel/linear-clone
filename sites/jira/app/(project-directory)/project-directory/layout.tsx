"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppSwitcher } from "@/components/app-switcher"
import { CreateButton, SearchBar } from "@/components/top-nav"
import { NotificationsPanel } from "@/components/notifications-panel"
import { HelpMenu } from "@/components/help-menu"
import { SettingsMenu } from "@/components/settings-menu"
import { UserProfileDropdown } from "@/components/user-profile-dropdown"

const sidebarItems = [
  { name: "Project directory", href: "/project-directory", icon: "folder" },
  { name: "Following", href: "/project-directory/following", icon: "eye" },
  {
    name: "Status updates",
    href: "/project-directory/status-updates",
    icon: "activity",
  },
  { name: "Archived", href: "/project-directory/archived", icon: "archive" },
]

const iconMap: Record<string, React.ReactNode> = {
  folder: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  eye: (
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
  ),
  activity: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  archive: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
}

export default function ProjectDirectoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      {/* Top nav */}
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
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-semibold">Projects</span>
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

        <div className="mx-4 flex flex-1 justify-center">
          <SearchBar isBlue={false} defaultTab="home" />
        </div>

        <div className="flex items-center gap-1">
          <CreateButton />
          <NotificationsPanel />
          <HelpMenu />
          <SettingsMenu />
          <UserProfileDropdown />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside
          className={`flex shrink-0 flex-col overflow-y-auto border-r transition-all duration-200 ${sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"}`}
        >
          <nav className="flex flex-col gap-0.5 p-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={
                    pathname === item.href
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }
                >
                  {iconMap[item.icon]}
                </span>
                {item.name}
              </Link>
            ))}

            <div className="my-2 border-t" />

            <Link
              href="/teams"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <svg
                className="size-4 text-muted-foreground"
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
              Teams
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
          </nav>

          <div className="mt-auto border-t p-3">
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Give feedback on the new navigation
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
