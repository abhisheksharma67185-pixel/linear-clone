"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mainApps = [
  {
    name: "Home",
    href: "/home",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
        <svg
          className="size-5 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
    ),
  },
  {
    name: "Jira",
    href: "/projects",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4 text-white" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Goals",
    href: "/goals",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
        <svg
          className="size-5 text-purple-600"
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
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-pink-100 dark:bg-pink-900/30">
        <svg
          className="size-5 text-pink-600"
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
  {
    name: "Teams",
    href: "/teams",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30">
        <svg
          className="size-5 text-teal-600"
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
    ),
  },
  {
    name: "Administration",
    href: "/admin",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
        <svg
          className="size-5 text-gray-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
        </svg>
      </div>
    ),
  },
]

const initialRecommended = [
  {
    name: "Product roadmap",
    description: "Align everyone with custom roadmaps",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
        <svg
          className="size-5 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      </div>
    ),
  },
  {
    name: "Confluence",
    description: "Document collaboration",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
        <svg
          className="size-5 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Work requests",
    description: "Create one place to manage requests",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-900/30">
        <svg
          className="size-5 text-yellow-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    ),
  },
]

export function AppSwitcher() {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const visibleRecommended = initialRecommended.filter(
    (r) => !hidden.has(r.name)
  )

  return (
    <Popover>
      <PopoverTrigger
        aria-label="App switcher"
        className="rounded-md border p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="p-3">
          <div className="flex flex-col gap-0.5">
            {mainApps.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
              >
                {app.icon}
                <span className="font-medium">{app.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t" />

        <div className="p-3">
          <p className="mb-2 px-2 text-[11px] font-semibold text-muted-foreground">
            Recommended for your team
          </p>
          <div className="flex flex-col gap-0.5">
            {visibleRecommended.map((item) => (
              <div
                key={item.name}
                className="relative flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
              >
                {item.icon}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <svg
                      className="size-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        setHidden((prev) => new Set(prev).add(item.name))
                      }
                    >
                      Not interested
                    </DropdownMenuItem>
                    <DropdownMenuItem>Why am I seeing this?</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            <Link
              href="/home/apps"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span className="font-medium">More Atlassian apps</span>
            </Link>
          </div>
        </div>

        <div className="border-t px-4 py-3">
          <Link
            href="/home/apps"
            className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Manage list
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
