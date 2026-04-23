"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Issue, Project, User, Sprint, Epic } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserProfileCard } from "@/components/user-profile-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  statusVariant,
  statusDisplayLabel,
  priorityVariant,
  priorityDisplayLabel,
} from "@/lib/badge-styles"
import { IssueLink } from "@/components/issue-link"

interface PopulatedIssue extends Issue {
  assignee: User | null
  reporter: User | null
  project: Project | null
  sprint: Sprint | null
  epic: Epic | null
}

interface SearchResults {
  issues: PopulatedIssue[]
  projects: Project[]
  users: User[]
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Loading...</div>
      }
    >
      <SearchPageInner />
    </Suspense>
  )
}

const TYPE_ICON: Record<string, { color: string; label: string }> = {
  story: { color: "bg-green-500", label: "Story" },
  task: { color: "bg-blue-500", label: "Task" },
  bug: { color: "bg-red-500", label: "Bug" },
  subtask: { color: "bg-cyan-500", label: "Sub-task" },
}

function SaveFilterDialog({
  query,
  onClose,
}: {
  query: string
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch("/api/data/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), jql: query }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        setSaving(false)
        setSaved(true)
        setTimeout(onClose, 1500)
        return
      }
    } catch {
      clearTimeout(timeout)
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-base font-semibold">Save filter</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Filter name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Open Bugs"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Query
            </label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground">
              {query}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving || saved}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save filter"}
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveFilterOpen, setSaveFilterOpen] = useState(false)

  // External sync: URL ?q= → query/results state.
  useEffect(() => {
    const q = searchParams.get("q") ?? ""
    /* eslint-disable react-hooks/set-state-in-effect */
    setQuery(q)
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch(`/api/data/search?q=${encodeURIComponent(q.trim())}&issueLimit=50`)
      .then((r) => r.json())
      .then((data: SearchResults) => {
        setResults(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim())
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const total = results
    ? results.issues.length + results.projects.length + results.users.length
    : 0

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-xl">
          <svg
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, spaces, and people"
            className="h-11 pl-10 text-base"
            autoFocus
          />
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Searching...
        </div>
      )}

      {/* Empty */}
      {!loading && results && total === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <svg
            className="mb-4 size-16 text-muted-foreground/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <p className="text-base font-semibold text-foreground">
            No results found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t find anything matching &ldquo;
            {searchParams.get("q")}&rdquo;
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && results && total > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} result{total !== 1 ? "s" : ""} for &ldquo;
              {searchParams.get("q")}&rdquo;
            </p>
            <button
              onClick={() => setSaveFilterOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save filter
            </button>
          </div>

          {/* ── Issues table ── */}
          {results.issues.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Issues ({results.issues.length})
              </h2>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[44px]" />
                      <TableHead className="w-[90px] font-medium">
                        Key
                      </TableHead>
                      <TableHead className="font-medium">Summary</TableHead>
                      <TableHead className="w-[120px] font-medium">
                        Project
                      </TableHead>
                      <TableHead className="w-[100px] font-medium">
                        Status
                      </TableHead>
                      <TableHead className="w-[90px] font-medium">
                        Priority
                      </TableHead>
                      <TableHead className="w-[130px] font-medium">
                        Assignee
                      </TableHead>
                      <TableHead className="w-[110px] font-medium">
                        Sprint
                      </TableHead>
                      <TableHead className="w-[110px] font-medium">
                        Epic
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.issues.map((issue) => {
                      const typeInfo = TYPE_ICON[issue.type] || TYPE_ICON.task
                      return (
                        <TableRow key={issue.id}>
                          {/* Type icon */}
                          <TableCell className="pr-0">
                            <div
                              className={`flex size-5 items-center justify-center rounded-sm ${typeInfo.color}`}
                              title={typeInfo.label}
                            >
                              <svg
                                className="size-3 text-white"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                              >
                                {issue.type === "bug" ? (
                                  <circle cx="8" cy="8" r="4" />
                                ) : (
                                  <path d="M3 3h10v10H3z" />
                                )}
                              </svg>
                            </div>
                          </TableCell>
                          {/* Key */}
                          <TableCell>
                            <IssueLink
                              issueKey={issue.key}
                              className="font-mono text-xs text-blue-600 hover:underline"
                            >
                              {issue.key}
                            </IssueLink>
                          </TableCell>
                          {/* Summary */}
                          <TableCell>
                            <IssueLink
                              issueKey={issue.key}
                              className="block max-w-[300px] truncate text-left text-sm hover:underline"
                            >
                              {issue.summary}
                            </IssueLink>
                          </TableCell>
                          {/* Project */}
                          <TableCell className="text-xs text-muted-foreground">
                            {issue.project?.name ?? "—"}
                          </TableCell>
                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${statusVariant[issue.status]}`}
                            >
                              {statusDisplayLabel[issue.status] ?? issue.status}
                            </Badge>
                          </TableCell>
                          {/* Priority */}
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${priorityVariant[issue.priority]}`}
                            >
                              {priorityDisplayLabel[issue.priority] ??
                                issue.priority}
                            </Badge>
                          </TableCell>
                          {/* Assignee */}
                          <TableCell>
                            {issue.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <UserProfileCard
                                  name={
                                    issue.assignee.displayName ??
                                    issue.assignee.name
                                  }
                                  email={issue.assignee.email}
                                  size="sm"
                                />
                                <span className="truncate text-xs">
                                  {issue.assignee.displayName ??
                                    issue.assignee.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          {/* Sprint */}
                          <TableCell className="text-xs text-muted-foreground">
                            {issue.sprint?.name ?? "Backlog"}
                          </TableCell>
                          {/* Epic */}
                          <TableCell>
                            {issue.epic ? (
                              <span className="text-xs text-purple-600 dark:text-purple-400">
                                {issue.epic.name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── Spaces ── */}
          {results.projects.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Spaces ({results.projects.length})
              </h2>
              <div className="divide-y rounded-lg border">
                {results.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.key}/board`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-900/30">
                      <svg
                        className="size-3.5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {project.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.key} &middot;{" "}
                        {project.type === "scrum"
                          ? "Team-managed software"
                          : "Team-managed business"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── People ── */}
          {results.users.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                People ({results.users.length})
              </h2>
              <div className="divide-y rounded-lg border">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href="/teams/people"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {(user.displayName ?? user.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {user.displayName ?? user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {saveFilterOpen && (
        <SaveFilterDialog
          query={searchParams.get("q") ?? query}
          onClose={() => setSaveFilterOpen(false)}
        />
      )}
    </div>
  )
}
