"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, User } from "@/app/lib/mock-data"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"

const FILTER_CONFIGS: Record<string, {
  title: string
  activeFilters: { label: string; value: string }[]
  filterFn: (issues: Issue[]) => Issue[]
}> = {
  "my-open-work-items": {
    title: "My open work items",
    activeFilters: [
      { label: "Assignee = Current User", value: "assignee" },
      { label: "Resolution = Unresolved", value: "resolution" },
    ],
    filterFn: (issues) => issues.filter((i) => i.assigneeId === "usr-1" && i.status !== "done"),
  },
  "reported-by-me": {
    title: "Reported by me",
    activeFilters: [
      { label: "Reporter = Current User", value: "reporter" },
    ],
    filterFn: (issues) => issues.filter((i) => i.reporterId === "usr-1"),
  },
  "all-work-items": {
    title: "All work items",
    activeFilters: [],
    filterFn: (issues) => issues,
  },
  "open-work-items": {
    title: "Open work items",
    activeFilters: [
      { label: "Resolution = Unresolved", value: "resolution" },
    ],
    filterFn: (issues) => issues.filter((i) => i.status !== "done"),
  },
  "done-work-items": {
    title: "Done work items",
    activeFilters: [
      { label: "Status Category = Done", value: "status-done" },
    ],
    filterFn: (issues) => issues.filter((i) => i.status === "done"),
  },
  "viewed-recently": {
    title: "Viewed recently",
    activeFilters: [
      { label: "Key", value: "key" },
    ],
    filterFn: (issues) => issues.slice(0, 10),
  },
  "created-recently": {
    title: "Created recently",
    activeFilters: [
      { label: "Created: Within the last 1 week", value: "created" },
    ],
    filterFn: (issues) => {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return issues.filter((i) => new Date(i.createdAt) >= oneWeekAgo)
    },
  },
  "resolved-recently": {
    title: "Resolved recently",
    activeFilters: [
      { label: "Resolved: Within the last 1 week", value: "resolved" },
    ],
    filterFn: (issues) => {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return issues.filter((i) => i.status === "done" && new Date(i.updatedAt) >= oneWeekAgo)
    },
  },
  "updated-recently": {
    title: "Updated recently",
    activeFilters: [
      { label: "Updated: Within the last 1 week", value: "updated" },
    ],
    filterFn: (issues) => {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return issues.filter((i) => new Date(i.updatedAt) >= oneWeekAgo)
    },
  },
}

const priorityLabel: Record<string, string> = {
  highest: "Highest",
  high: "High",
  medium: "Medium",
  low: "Low",
  lowest: "Lowest",
}

const statusLabel: Record<string, string> = {
  to_do: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
}

export default function FilterViewPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const config = FILTER_CONFIGS[slug]

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([i, u]) => {
      setIssues(i)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  if (!config) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Filter not found.
      </div>
    )
  }

  const userName = (id: string | null) =>
    users.find((u) => u.id === id)?.name ?? "Unassigned"

  const filtered = config.filterFn(issues).filter((i) =>
    search ? i.summary.toLowerCase().includes(search.toLowerCase()) || i.key.toLowerCase().includes(search.toLowerCase()) : true
  )

  const filterButtons = ["Space", "Assignee", "Type", "Status"]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{config.title}</h1>
          <button className="text-muted-foreground hover:text-yellow-500">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            Apps
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            Share
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </Button>
          <div className="flex rounded-md border">
            <button className="bg-accent px-2 py-1">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button className="px-2 py-1 text-muted-foreground hover:bg-accent">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Ask AI button */}
          <button className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.636 5.636l2.122 2.122m8.484 8.484l2.122 2.122M5.636 18.364l2.122-2.122m8.484-8.484l2.122-2.122" />
            </svg>
            Ask AI
          </button>

          {/* Basic / JQL toggle */}
          <div className="flex rounded-md border">
            <button className="bg-blue-600 px-3 py-1.5 text-sm font-medium text-white rounded-l-md">
              Basic
            </button>
            <button className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-r-md">
              JQL
            </button>
          </div>

          {/* Search work */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              placeholder="Search work"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-36 pl-8 text-sm"
            />
          </div>

          {/* Filter dropdowns */}
          {filterButtons.map((label) => (
            <button
              key={label}
              className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              {label}
              <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
            </button>
          ))}

          {/* Active filter chips */}
          {config.activeFilters.map((af) => (
            <span
              key={af.value}
              className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {af.label}
              <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
              <button className="ml-0.5 hover:text-blue-900">
                <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </span>
          ))}

          {/* More filters */}
          <button className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors">
            More filters
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
        </div>

        {/* Clear / Copy row */}
        {config.activeFilters.length > 0 && (
          <div className="mt-2 flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground">Clear filters</button>
            <button className="text-sm font-medium text-blue-600 hover:underline">Copy filter</button>
          </div>
        )}
        {config.activeFilters.length === 0 && (
          <div className="mt-2 flex items-center gap-3">
            <button className="text-sm font-medium text-blue-600 hover:underline">Copy filter</button>
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">
                  <Checkbox />
                </TableHead>
                <TableHead className="font-medium">Work</TableHead>
                <TableHead className="font-medium w-[140px]">Assignee</TableHead>
                <TableHead className="font-medium w-[140px]">Reporter</TableHead>
                <TableHead className="font-medium w-[100px]">Priority</TableHead>
                <TableHead className="font-medium w-[100px]">Status</TableHead>
                <TableHead className="w-10">
                  <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-80">
                    <div className="flex flex-col items-center justify-center gap-3">
                      {/* Empty state X icon */}
                      <svg className="size-24 text-muted-foreground/30" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="45" r="35" fill="currentColor" opacity="0.15" />
                        <path d="M35 30L65 60M65 30L35 60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
                        <rect x="55" y="60" width="12" height="20" rx="3" fill="currentColor" opacity="0.2" transform="rotate(-15 55 60)" />
                      </svg>
                      <p className="text-base font-semibold text-foreground">
                        There&apos;s nothing matching your search
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <Link href={`/issue/${issue.key}`} className="flex items-center gap-2 hover:underline">
                      <span className="font-mono text-xs text-blue-600">{issue.key}</span>
                      <span className="text-sm truncate">{issue.summary}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{userName(issue.assigneeId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{userName(issue.reporterId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{priorityLabel[issue.priority] ?? issue.priority}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {statusLabel[issue.status] ?? issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
