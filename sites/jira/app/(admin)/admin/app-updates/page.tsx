"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const releaseNotes = [
  {
    app: "Atlassian Administration",
    note: "SCIM API keys set to expire",
    status: "COMING SOON",
    statusColor:
      "border-gray-300 text-gray-700 bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800",
    changeType: "Announcement",
    date: "April 2025",
  },
  {
    app: "Jira",
    note: "AI-powered snippets for Confluence links in Jira",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Jira Plans - Easier setup when creating new plans",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Archive child work items while archiving an epic",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Export work item details to Excel directly from the work item view",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Approvals are coming to Jira",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Atlassian Administration",
    note: "Pending requests and invite improvements for site admins",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Experiment",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Project recap emails for non-engaged users",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Share your calendar as a Smart Link",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Experiment",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Jira Plans - Improved onboarding for new users",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Jira: Add a due date and assignee to work items in your backlog",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Experiment",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Timeline updates: Roll-up and sticky (fixed) columns",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Configure fields directly from All work",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Relocating the AI Work Breakdown trigger to make it easier to find in Jira Plans",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Experiment",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Enable AI work creation experience in Jira Plans (Premium and Enterprise only)",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Create release fields in your plan",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Invite teammates directly while creating or editing a team",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Beta: Link similar work items as you create with Atlassian Intelligence",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Announcement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Request access setting for Jira spaces",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Improvement",
    date: "Apr 5, 2026",
  },
  {
    app: "Jira",
    note: "Intent detection for search destinations",
    status: "ROLLOUT COMPLETE",
    statusColor:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950",
    changeType: "Experiment",
    date: "Apr 5, 2026",
  },
]

const appFilterOptions = ["Atlassian Administration", "Jira"]
const statusFilterOptions = [
  "PLANNED",
  "COMING SOON",
  "ROLLING OUT",
  "ROLLOUT COMPLETE",
]
const changeTypeFilterOptions = [
  "Announcement",
  "Improvement",
  "Fix",
  "Removed",
  "Experiment",
]

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  open,
  onOpenChange,
  search,
  onSearchChange,
  isStatus,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (val: string) => void
  open: boolean
  onOpenChange: (v: boolean) => void
  search: string
  onSearchChange: (v: string) => void
  isStatus?: boolean
}) {
  const filtered = options.filter(
    (o) => !search || o.toLowerCase().includes(search.toLowerCase())
  )
  const hasSelection = selected.length > 0

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors ${open ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30" : hasSelection ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
      >
        {label}{" "}
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border bg-background shadow-lg">
            <div className="border-b p-2">
              <div className="relative">
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
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
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.map((opt) => (
                <button
                  key={opt}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/50"
                  onClick={() => onToggle(opt)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => {}}
                    className="size-4 rounded border accent-blue-600"
                  />
                  {isStatus ? (
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        opt === "PLANNED"
                          ? "border-gray-300 bg-gray-50 text-gray-700"
                          : opt === "COMING SOON"
                            ? "border-gray-300 bg-gray-50 text-gray-700"
                            : opt === "ROLLING OUT"
                              ? "border-blue-300 bg-blue-50 text-blue-700"
                              : "border-green-300 bg-green-50 text-green-700"
                      }`}
                    >
                      {opt}
                    </span>
                  ) : (
                    <span>
                      {label === "App" ? (
                        <span className="flex items-center gap-2">
                          {opt === "Jira" ? (
                            <span className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                              <svg
                                className="size-3"
                                viewBox="0 0 32 32"
                                fill="white"
                              >
                                <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex size-5 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
                              <svg
                                className="size-3 text-gray-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" />
                              </svg>
                            </span>
                          )}
                          {opt}
                        </span>
                      ) : (
                        opt
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AppUpdatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [infoBannerVisible, setInfoBannerVisible] = useState(true)
  const [perPage, setPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter state
  const [appFilter, setAppFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [changeTypeFilter, setChangeTypeFilter] = useState<string[]>([])
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [filterSearch, setFilterSearch] = useState("")

  function toggleFilter(
    list: string[],
    val: string,
    setter: (v: string[]) => void
  ) {
    setter(list.includes(val) ? list.filter((v) => v !== val) : [...list, val])
  }

  const filtered = releaseNotes.filter((item) => {
    if (
      searchQuery &&
      !item.note.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    if (appFilter.length > 0 && !appFilter.includes(item.app)) return false
    if (statusFilter.length > 0 && !statusFilter.includes(item.status))
      return false
    if (
      changeTypeFilter.length > 0 &&
      !changeTypeFilter.includes(item.changeType)
    )
      return false
    return true
  })

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">App updates</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        App updates shows release notes about Atlassian changes that impact your
        organization.{" "}
        <button className="text-blue-600 hover:underline">
          How app updates work
        </button>
      </p>

      {/* Info banner */}
      {infoBannerVisible && (
        <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-4 py-3 dark:bg-blue-900/10">
          <div className="flex items-center gap-2">
            <svg
              className="size-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm">
              <span className="font-medium">App updates</span> doesn&apos;t show
              Goals or Projects release notes.
            </p>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setInfoBannerVisible(false)}
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
      )}

      {/* Search + filters */}
      <div className="mb-4 flex items-center gap-2">
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
            placeholder="Search release notes"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <FilterDropdown
          label="App"
          options={appFilterOptions}
          selected={appFilter}
          onToggle={(v) => toggleFilter(appFilter, v, setAppFilter)}
          open={openFilter === "app"}
          onOpenChange={(v) => {
            setOpenFilter(v ? "app" : null)
            setFilterSearch("")
          }}
          search={filterSearch}
          onSearchChange={setFilterSearch}
        />
        <FilterDropdown
          label="Status"
          options={statusFilterOptions}
          selected={statusFilter}
          onToggle={(v) => toggleFilter(statusFilter, v, setStatusFilter)}
          open={openFilter === "status"}
          onOpenChange={(v) => {
            setOpenFilter(v ? "status" : null)
            setFilterSearch("")
          }}
          search={filterSearch}
          onSearchChange={setFilterSearch}
          isStatus
        />
        <FilterDropdown
          label="Change type"
          options={changeTypeFilterOptions}
          selected={changeTypeFilter}
          onToggle={(v) =>
            toggleFilter(changeTypeFilter, v, setChangeTypeFilter)
          }
          open={openFilter === "change"}
          onOpenChange={(v) => {
            setOpenFilter(v ? "change" : null)
            setFilterSearch("")
          }}
          search={filterSearch}
          onSearchChange={setFilterSearch}
        />
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        Showing {Math.min(perPage, filtered.length)} results out of 612 items
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] font-medium">App</TableHead>
              <TableHead className="font-medium">Release note</TableHead>
              <TableHead className="w-[150px] font-medium">Status</TableHead>
              <TableHead className="w-[130px] font-medium">
                Change type
              </TableHead>
              <TableHead className="w-[130px] font-medium">
                Rollout schedule
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.app === "Jira" ? (
                      <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                        <svg
                          className="size-3.5 text-white"
                          viewBox="0 0 32 32"
                          fill="white"
                        >
                          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
                        <svg
                          className="size-3.5 text-gray-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm">{item.app}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <button className="text-left text-sm text-blue-600 hover:underline">
                    {item.note}
                  </button>
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{item.changeType}</TableCell>
                <TableCell className="text-sm">{item.date}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-20 text-center text-sm text-muted-foreground italic"
                >
                  No results match your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Results per page:
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm ${currentPage <= 1 ? "cursor-not-allowed text-muted-foreground/40" : "text-muted-foreground hover:text-foreground"}`}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </button>
          <button
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cloud roadmap card */}
      <div className="mt-8 max-w-md rounded-lg border p-6">
        <p className="mb-2 font-serif text-2xl text-blue-600">&ldquo;</p>
        <h3 className="mb-1 text-base font-semibold">Cloud roadmap</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          See what changes are planned for the future.
        </p>
        <button className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent">
          View the cloud roadmap
        </button>
      </div>
    </div>
  )
}
