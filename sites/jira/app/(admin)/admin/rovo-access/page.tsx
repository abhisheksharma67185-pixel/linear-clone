"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const availableApps = [
  {
    name: "Goals",
    url: "abhisheksharma67185.atlassian.net",
    plan: "Free",
    icon: "goal",
  },
  {
    name: "Jira",
    url: "abhisheksharma67185.atlassian.net",
    plan: "Premium",
    icon: "jira",
  },
  {
    name: "Projects",
    url: "abhisheksharma67185.atlassian.net",
    plan: "Free",
    icon: "projects",
  },
]

function AppIcon({ icon }: { icon: string }) {
  if (icon === "jira")
    return (
      <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-3.5" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    )
  if (icon === "goal")
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs">
        &#9678;
      </div>
    )
  return (
    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs">
      &#10022;
    </div>
  )
}

// ── Add App Full-Screen Dialog ─────────────────────────────────────
function AddAppDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (apps: string[]) => void
}) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const allSelected = selected.length === availableApps.length

  if (!open) return null

  const filtered = availableApps.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleApp(name: string) {
    setSelected(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name]
    )
  }

  function toggleAll() {
    if (allSelected) setSelected([])
    else setSelected(availableApps.map((a) => a.name))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <h1 className="mb-6 text-2xl font-semibold">
            Select apps to block access to Rovo
          </h1>

          <div className="flex gap-6">
            {/* Left: search + table */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="relative max-w-xs flex-1">
                  <svg
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <Input
                    placeholder="Search by name"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  Apps{" "}
                  <svg
                    className="ml-1 size-3"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </Button>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                Showing {filtered.length} items
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="w-10 px-4 py-2.5 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="size-4 rounded border accent-blue-600"
                        />
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium">App</th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Plan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app) => (
                      <tr
                        key={app.name}
                        className={`cursor-pointer border-b transition-colors last:border-b-0 ${selected.includes(app.name) ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-accent/30"}`}
                        onClick={() => toggleApp(app.name)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(app.name)}
                            onChange={() => {}}
                            className="size-4 rounded border accent-blue-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <AppIcon icon={app.icon} />
                            <div>
                              <p className="font-medium">{app.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {app.url}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{app.plan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: selected apps panel */}
            <div className="w-72 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Apps selected</span>
                <span className="flex size-6 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                  {selected.length}
                </span>
              </div>
              <div className="space-y-2">
                {selected.map((name) => {
                  const app = availableApps.find((a) => a.name === name)!
                  return (
                    <div key={name} className="flex items-center gap-2 text-sm">
                      <AppIcon icon={app.icon} />
                      <span className="flex-1 truncate text-muted-foreground">
                        {app.url}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleApp(name)
                        }}
                        className="text-muted-foreground hover:text-foreground"
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
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-2 border-t px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => {
            setSelected([])
            setSearch("")
            onClose()
          }}
        >
          Cancel
        </Button>
        <Button
          className={
            selected.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : ""
          }
          variant={selected.length > 0 ? "default" : "ghost"}
          disabled={selected.length === 0}
          onClick={() => {
            onAdd(selected)
            setSelected([])
            setSearch("")
            onClose()
          }}
        >
          Block access
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function RovoAccessPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [blockedApps, setBlockedApps] = useState<string[]>([])
  const [searchBlocklist, setSearchBlocklist] = useState("")
  const [appsFilterOpen, setAppsFilterOpen] = useState(false)
  const [appsFilterSearch, setAppsFilterSearch] = useState("")

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Rovo access</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage which apps can access Rovo in your organization.{" "}
        <button className="text-blue-600 hover:underline">
          See how we protect your data
        </button>
      </p>

      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Blocklist</h2>
          <p className="text-sm text-muted-foreground">
            Add apps to the blocklist so they can&apos;t access or be used by
            Rovo.
          </p>
        </div>
        <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
          Add app
        </Button>
      </div>

      <div className="mt-4 mb-4 flex items-center gap-3">
        <div className="relative max-w-xs">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder="Search by name"
            className="pl-9"
            value={searchBlocklist}
            onChange={(e) => setSearchBlocklist(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setAppsFilterOpen(!appsFilterOpen)}
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${appsFilterOpen ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Apps{" "}
            <svg
              className="ml-1 size-3"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {appsFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setAppsFilterOpen(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border bg-background shadow-lg">
                <div className="border-b p-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={appsFilterSearch}
                      onChange={(e) => setAppsFilterSearch(e.target.value)}
                      className="h-8 pr-8 text-sm"
                    />
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
                <div className="px-3 py-2 text-center text-sm text-muted-foreground">
                  No matches found
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        Showing {blockedApps.length} items
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">App</TableHead>
              <TableHead className="font-medium">Plan</TableHead>
              <TableHead className="w-[100px] font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blockedApps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No apps added
                </TableCell>
              </TableRow>
            ) : (
              blockedApps.map((name) => {
                const app = availableApps.find((a) => a.name === name)
                if (!app) return null
                return (
                  <TableRow key={name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AppIcon icon={app.icon} />
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{app.plan}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setBlockedApps(blockedApps.filter((n) => n !== name))
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddAppDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={(apps) =>
          setBlockedApps([...new Set([...blockedApps, ...apps])])
        }
      />
    </div>
  )
}
