"use client"

import { useState } from "react"
import Link from "next/link"

const yourApps = [
  {
    name: "Goals",
    href: "/goals",
    ariaLabel: "Open Goals",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
        <svg
          aria-hidden="true"
          className="size-4 text-purple-600"
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
    name: "Jira",
    href: "/dashboard",
    ariaLabel: "Open Jira",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg
          aria-hidden="true"
          className="size-4 text-white"
          viewBox="0 0 32 32"
          fill="white"
        >
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    href: "/project-directory",
    ariaLabel: "Open Projects",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-pink-100 dark:bg-pink-900/30">
        <svg
          aria-hidden="true"
          className="size-4 text-pink-600"
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
    ariaLabel: "Open Teams",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30">
        <svg
          aria-hidden="true"
          className="size-4 text-teal-600"
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
    ariaLabel: "Open Administration",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-muted">
        <svg
          aria-hidden="true"
          className="size-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
        </svg>
      </div>
    ),
  },
]

const internalHelpfulLinks = [
  {
    name: "Account settings",
    href: "/home/account-settings",
    ariaLabel: "Go to Account settings",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" />
      </svg>
    ),
  },
  {
    name: "Administration",
    href: "/admin",
    ariaLabel: "Go to Administration",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" />
      </svg>
    ),
  },
]

const externalHelpfulLinks = [
  {
    name: "Atlassian Support",
    href: "https://support.atlassian.com",
    ariaLabel: "Go to Atlassian Support, opens in new tab",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    name: "Atlassian Community",
    href: "https://community.atlassian.com",
    ariaLabel: "Go to Atlassian Community, opens in new tab",
    icon: (
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
    ),
  },
  {
    name: "Self-managed licensing",
    href: "https://my.atlassian.com",
    ariaLabel: "Go to Self-managed licensing, opens in new tab",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    name: "Atlassian Documentation",
    href: "https://support.atlassian.com/atlassian-account/docs/atlassian-documentation/",
    ariaLabel: "Go to Atlassian Documentation, opens in new tab",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    name: "Try Atlassian products",
    href: "https://www.atlassian.com/try",
    ariaLabel: "Go to Try Atlassian products, opens in new tab",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
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
    name: "Atlassian.com",
    href: "https://www.atlassian.com",
    ariaLabel: "Go to Atlassian.com, opens in new tab",
    icon: (
      <svg
        aria-hidden="true"
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
]

const defaultOrder = ["Goals", "Jira", "Projects", "Teams", "Administration"]

function sortApps(apps: typeof yourApps, sortBy: string) {
  const sorted = [...apps]
  if (sortBy === "Sort by name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    sorted.sort(
      (a, b) => defaultOrder.indexOf(a.name) - defaultOrder.indexOf(b.name)
    )
  }
  return sorted
}

const externalApps = new Set(["Goals", "Projects", "Teams"])

export default function AppsPage() {
  const [sortBy, setSortBy] = useState("Sort by frequently used")
  const sortedApps = sortApps(yourApps, sortBy)

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Apps</h1>

      {/* Your apps */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Your apps</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="Sort by frequently used">
              Sort by frequently used
            </option>
            <option value="Sort by name">Sort by name</option>
          </select>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          abhisheksharma67185
        </p>

        <div className="grid grid-cols-4 gap-3">
          {sortedApps.map((app) =>
            externalApps.has(app.name) ? (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={app.ariaLabel}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3.5 transition-colors hover:bg-accent/50"
              >
                {app.icon}
                <span className="text-sm font-medium">{app.name}</span>
              </a>
            ) : (
              <Link
                key={app.name}
                href={app.href}
                aria-label={app.ariaLabel}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3.5 transition-colors hover:bg-accent/50"
              >
                {app.icon}
                <span className="text-sm font-medium">{app.name}</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* More from Atlassian */}
      <div>
        <h2 className="mb-2 text-base font-semibold">More from Atlassian</h2>
        <p className="mb-4 text-sm text-muted-foreground">Helpful links</p>

        <div className="grid grid-cols-4 gap-3">
          {internalHelpfulLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-label={link.ariaLabel}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3.5 text-left text-sm transition-colors hover:bg-accent/50"
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
          {externalHelpfulLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3.5 text-left text-sm transition-colors hover:bg-accent/50"
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
