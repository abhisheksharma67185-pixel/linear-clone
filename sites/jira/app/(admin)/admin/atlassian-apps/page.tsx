"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const apps = [
  {
    name: "Goals",
    slug: "goals",
    url: "https://abhisheksharma67185.atlassian.net",
    plan: "Free",
    users: 1,
    icon: "◎",
  },
  {
    name: "Jira Administration",
    slug: "jira-administration",
    url: "https://abhisheksharma67185.atlassian.net",
    plan: "",
    users: null,
    icon: "⚙",
  },
  {
    name: "Jira",
    slug: "jira",
    url: "https://abhisheksharma67185.atlassian.net",
    plan: "Premium",
    users: 1,
    icon: "◆",
  },
  {
    name: "Projects",
    slug: "projects",
    url: "https://abhisheksharma67185.atlassian.net",
    plan: "Free",
    users: 1,
    icon: "✦",
  },
]

const appFilterOptions = ["Goals", "Jira", "Jira Administration", "Projects"]
const planFilterOptions = ["Free", "None", "Premium"]

type FilterType = "apps" | "plans" | null

function AppIcon({ icon }: { icon: string }) {
  if (icon === "◆" || icon === "⚙") {
    return (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm">
      {icon}
    </div>
  )
}

export default function AtlassianAppsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null)
  const [headerMenu, setHeaderMenu] = useState(false)
  const [rowMenu, setRowMenu] = useState<string | null>(null)
  const [addAppOpen, setAddAppOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const headerMenuRef = useRef<HTMLDivElement>(null)
  const rowMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      )
        setActiveFilter(null)
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target as Node)
      )
        setHeaderMenu(false)
      if (
        rowMenuRef.current &&
        !rowMenuRef.current.contains(event.target as Node)
      )
        setRowMenu(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Atlassian apps</h1>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setAddAppOpen(true)}
          >
            Add app
          </Button>
          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setHeaderMenu(!headerMenu)}
              className="rounded-md border p-2 text-muted-foreground hover:bg-accent"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {headerMenu && (
              <div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border bg-background shadow-lg">
                <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent">
                  Link Bitbucket
                </button>
                <button className="w-full rounded-b-lg px-4 py-2.5 text-left text-sm hover:bg-accent">
                  Update landing app
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mb-1 text-sm text-muted-foreground">
        Manage access, changes, and more for all the Atlassian apps in your
        organization.
      </p>
      <button
        type="button"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        Looking for your Marketplace and third-party apps?
      </button>

      <div className="mb-4 flex items-center gap-2" ref={filterRef}>
        <div className="relative max-w-xs">
          <Input placeholder="Find by name" className="pr-8" />
          <svg
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Apps filter */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveFilter(activeFilter === "apps" ? null : "apps")
            }
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${activeFilter === "apps" ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Apps{" "}
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {activeFilter === "apps" && (
            <div className="absolute top-full left-0 z-10 mt-1 w-56 rounded-lg border bg-background shadow-lg">
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
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {appFilterOptions.map((app) => (
                  <label
                    key={app}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <input type="checkbox" className="size-4 rounded border" />
                    <AppIcon
                      icon={
                        app === "Goals"
                          ? "◎"
                          : app === "Jira"
                            ? "◆"
                            : app === "Jira Administration"
                              ? "⚙"
                              : "✦"
                      }
                    />
                    <span>{app}</span>
                  </label>
                ))}
              </div>
              <div className="border-t px-3 py-2 text-right text-xs text-muted-foreground">
                4 of 4
              </div>
            </div>
          )}
        </div>

        {/* Plans filter */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveFilter(activeFilter === "plans" ? null : "plans")
            }
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${activeFilter === "plans" ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Plans{" "}
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {activeFilter === "plans" && (
            <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border bg-background shadow-lg">
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
              <p className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase">
                Edition
              </p>
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {planFilterOptions.map((plan) => (
                  <label
                    key={plan}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <input type="checkbox" className="size-4 rounded border" />
                    <span>{plan}</span>
                  </label>
                ))}
              </div>
              <div className="border-t px-3 py-2 text-right text-xs text-muted-foreground">
                3 of 3
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing 4 results out of 4 apps</span>
        <svg
          className="size-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      <div className="mb-8 rounded-md border" ref={rowMenuRef}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  App{" "}
                  <svg
                    className="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                  </svg>
                </div>
              </th>
              <th className="w-[100px] px-4 py-2.5 text-left font-medium">
                Plan
              </th>
              <th className="w-[80px] px-4 py-2.5 text-left font-medium">
                Users
              </th>
              <th className="w-[120px] px-4 py-2.5 text-left font-medium">
                Actions
              </th>
              <th className="w-[50px] px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr
                key={app.name}
                className="border-b transition-colors last:border-b-0 hover:bg-accent/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/atlassian-apps/${app.slug}`}
                    className="flex items-center gap-3"
                  >
                    <AppIcon icon={app.icon} />
                    <div>
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.url}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">{app.plan}</td>
                <td className="px-4 py-3 text-sm">{app.users ?? ""}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/atlassian-apps/${app.slug}`}>
                    <Button variant="outline" size="sm">
                      Manage app
                    </Button>
                  </Link>
                </td>
                <td className="relative px-4 py-3">
                  <button
                    onClick={() =>
                      setRowMenu(rowMenu === app.slug ? null : app.slug)
                    }
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                  {rowMenu === app.slug && (
                    <div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border bg-background shadow-lg">
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2.5 text-sm hover:bg-accent"
                      >
                        Manage users
                      </Link>
                      <Link
                        href={`/admin/atlassian-apps/${app.slug}`}
                        className="block px-4 py-2.5 text-sm hover:bg-accent"
                      >
                        Manage app
                      </Link>
                      <div className="border-t" />
                      <Link
                        href={`/admin/atlassian-apps/${app.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent"
                      >
                        Open {app.name}
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
                      <Link
                        href={`/admin/atlassian-apps/${app.slug}`}
                        className="flex items-center justify-between rounded-b-lg px-4 py-2.5 text-sm hover:bg-accent"
                      >
                        {app.name} settings
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* JSM promo */}
      <div className="rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h3 className="text-lg font-semibold">Jira Service Management</h3>
              <button className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
            <p className="mb-1 text-sm font-semibold">
              Make your work more visible with Jira and Jira Service Management
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Both are built on a common platform so your support and
              development teams can connect their work and create a full
              picture, from request to resolution.
            </p>
            <div className="flex items-center gap-3">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
              >
                Try it now
              </Button>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add app dialog */}
      <Dialog open={addAppOpen} onOpenChange={setAddAppOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add an app</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose an Atlassian app to add to your organization. You can manage
            access and settings after adding it.
          </p>

          <div className="flex flex-col gap-3">
            {[
              {
                name: "Jira Service Management",
                desc: "IT service management",
                icon: "⚡",
              },
              {
                name: "Confluence",
                desc: "Document collaboration",
                icon: "📝",
              },
              {
                name: "Jira Product Discovery",
                desc: "Product management",
                icon: "🔍",
              },
              { name: "Opsgenie", desc: "Incident management", icon: "🔔" },
            ].map((item) => (
              <button
                key={item.name}
                className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddAppOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
