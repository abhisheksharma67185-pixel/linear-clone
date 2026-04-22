"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const apps = [
  {
    name: "Service Collection",
    url: "",
    plan: "Premium",
    users: "1 / 1",
    usersLink: true,
    site: "abhisheksharma679...",
    nextPrice: "USD 51.09",
    billingCycle: "Monthly",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-amber-500">
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
    ),
  },
  {
    name: "Rovo Credits",
    url: "abhisheksharma67185",
    plan: "Free",
    users: "",
    usersLink: false,
    site: "abhisheksharma679...",
    nextPrice: "",
    billingCycle: "",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gray-800">
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          <path d="M12 6l-1.5 4.5L6 12l4.5 1.5L12 18l1.5-4.5L18 12l-4.5-1.5z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    url: "https://abhisheksharma67185.atlassian.ne...",
    plan: "Free",
    users: "",
    usersLink: false,
    site: "https://abhishekshar...",
    nextPrice: "",
    billingCycle: "",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-green-600">
        <svg
          className="size-4 text-white"
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
    name: "Jira",
    url: "https://abhisheksharma67185.atlassian.ne...",
    plan: "Premium",
    users: "1 / 3",
    usersLink: true,
    site: "https://abhishekshar...",
    nextPrice: "USD 18.30",
    billingCycle: "Monthly",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Assets",
    url: "https://abhisheksharma67185.atlassian.ne...",
    plan: "Free",
    users: "",
    usersLink: false,
    site: "https://abhishekshar...",
    nextPrice: "",
    billingCycle: "",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
        <svg
          className="size-4 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
    ),
  },
]

export default function BillingPage() {
  const [sitesOpen, setSitesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSitesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="max-w-6xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Billing</h1>

      {/* Bug 4: Billing data is not API-accessible — link out to admin.atlassian.com */}
      <div
        data-testid="billing-manage-section"
        className="mb-6 flex items-start gap-4 rounded-xl border bg-background p-5"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <svg
            className="size-5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Current plan: <span className="text-blue-600">Jira Premium</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Billing data is managed at{" "}
            <span className="font-mono">admin.atlassian.com</span>. Use the
            button to manage subscriptions, invoices, and payment methods.
          </p>
        </div>
        <a
          href="https://admin.atlassian.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="manage-billing-btn"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-700"
        >
          Manage billing
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Summary below is a static preview. Centrally manage subscriptions at
        admin.atlassian.com.
      </p>

      {/* Sites dropdown */}
      <div className="relative mb-6" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1 ${sitesOpen ? "border-blue-600 text-blue-600" : ""}`}
          onClick={() => setSitesOpen(!sitesOpen)}
        >
          Sites
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>

        {sitesOpen && (
          <div className="absolute top-full left-0 z-10 mt-1 w-72 rounded-lg border bg-background shadow-lg">
            <div className="p-2">
              <div className="relative">
                <Input placeholder="Search" className="h-8 pr-8 text-xs" />
                <svg
                  className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <div className="px-2 pb-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border accent-blue-600"
                />
                <span>abhisheksharma67185.atlassian.net</span>
              </label>
            </div>
            <div className="border-t px-3 py-2 text-right text-xs text-muted-foreground">
              1 of 1
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mb-8 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Atlassian and Marketplace apps
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Plan
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Users
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Site
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Next price estimat...
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Billing cycl...
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr
                key={app.name}
                className="border-b transition-colors last:border-b-0 hover:bg-accent/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {app.icon}
                    <div>
                      <p className="text-sm font-medium">{app.name}</p>
                      {app.url && (
                        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {app.url}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{app.plan}</td>
                <td className="px-4 py-3 text-sm">
                  {app.usersLink && app.users ? (
                    <Link
                      href="/admin/users"
                      className="text-blue-600 hover:underline"
                    >
                      {app.users}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">
                      {app.users || "—"}
                    </span>
                  )}
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-sm text-muted-foreground">
                  {app.site}
                </td>
                <td className="px-4 py-3 text-sm">{app.nextPrice || "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {app.billingCycle || ""}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href="/admin/settings"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Separate billing section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold">
          Can&apos;t see all your subscriptions here?
        </h3>
        <p className="text-sm text-muted-foreground">
          Some of your apps may be billed separately.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-600">
            <svg
              className="size-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </div>
          <span className="text-sm font-medium">Bitbucket</span>
          <Link
            href="/bitbucket"
            className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
          >
            Visit Bitbucket
            <svg
              className="size-3"
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
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-500">
            <svg
              className="size-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <rect
                x="7"
                y="7"
                width="4"
                height="4"
                rx="1"
                fill="white"
                opacity="0.5"
              />
            </svg>
          </div>
          <span className="text-sm font-medium">Trello</span>
          <Link
            href="https://trello.com"
            className="inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
          >
            Visit Trello
            <svg
              className="size-3"
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
        </div>
      </div>
    </div>
  )
}
