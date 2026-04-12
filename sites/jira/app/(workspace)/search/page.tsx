"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Issue, Project, User, Sprint, Epic } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { statusVariant, statusDisplayLabel, priorityVariant, priorityDisplayLabel } from "@/lib/badge-styles"
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
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
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

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = searchParams.get("q") ?? ""
    setQuery(q)
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    fetch(`/api/data/search?q=${encodeURIComponent(q.trim())}&issueLimit=50`)
      .then((r) => r.json())
      .then((data: SearchResults) => { setResults(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const total = results ? results.issues.length + results.projects.length + results.users.length : 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-xl">
          <svg className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Searching...
        </div>
      )}

      {/* Empty */}
      {!loading && results && total === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <svg className="size-16 text-muted-foreground/30 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-base font-semibold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">
            We couldn&apos;t find anything matching &ldquo;{searchParams.get("q")}&rdquo;
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && results && total > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-6">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{searchParams.get("q")}&rdquo;
          </p>

          {/* ── Issues table ── */}
          {results.issues.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Issues ({results.issues.length})
              </h2>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[44px]" />
                      <TableHead className="font-medium w-[90px]">Key</TableHead>
                      <TableHead className="font-medium">Summary</TableHead>
                      <TableHead className="font-medium w-[120px]">Project</TableHead>
                      <TableHead className="font-medium w-[100px]">Status</TableHead>
                      <TableHead className="font-medium w-[90px]">Priority</TableHead>
                      <TableHead className="font-medium w-[130px]">Assignee</TableHead>
                      <TableHead className="font-medium w-[110px]">Sprint</TableHead>
                      <TableHead className="font-medium w-[110px]">Epic</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.issues.map((issue) => {
                      const typeInfo = TYPE_ICON[issue.type] || TYPE_ICON.task
                      return (
                        <TableRow key={issue.id}>
                          {/* Type icon */}
                          <TableCell className="pr-0">
                            <div className={`flex size-5 items-center justify-center rounded-sm ${typeInfo.color}`} title={typeInfo.label}>
                              <svg className="size-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                                {issue.type === "bug" ? <circle cx="8" cy="8" r="4" /> : <path d="M3 3h10v10H3z" />}
                              </svg>
                            </div>
                          </TableCell>
                          {/* Key */}
                          <TableCell>
                            <IssueLink issueKey={issue.key} className="font-mono text-xs text-blue-600 hover:underline">
                              {issue.key}
                            </IssueLink>
                          </TableCell>
                          {/* Summary */}
                          <TableCell>
                            <IssueLink issueKey={issue.key} className="text-sm hover:underline truncate block max-w-[300px] text-left">
                              {issue.summary}
                            </IssueLink>
                          </TableCell>
                          {/* Project */}
                          <TableCell className="text-xs text-muted-foreground">
                            {issue.project?.name ?? "—"}
                          </TableCell>
                          {/* Status */}
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] ${statusVariant[issue.status]}`}>
                              {statusDisplayLabel[issue.status] ?? issue.status}
                            </Badge>
                          </TableCell>
                          {/* Priority */}
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] ${priorityVariant[issue.priority]}`}>
                              {priorityDisplayLabel[issue.priority] ?? issue.priority}
                            </Badge>
                          </TableCell>
                          {/* Assignee */}
                          <TableCell>
                            {issue.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="size-5">
                                  <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {(issue.assignee.displayName ?? issue.assignee.name).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate">{issue.assignee.displayName ?? issue.assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          {/* Sprint */}
                          <TableCell className="text-xs text-muted-foreground">
                            {issue.sprint?.name ?? "Backlog"}
                          </TableCell>
                          {/* Epic */}
                          <TableCell>
                            {issue.epic ? (
                              <span className="text-xs text-purple-600 dark:text-purple-400">{issue.epic.name}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Spaces ({results.projects.length})
              </h2>
              <div className="rounded-lg border divide-y">
                {results.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.key}/board`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-900/30">
                      <svg className="size-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{project.name}</span>
                      <span className="text-xs text-muted-foreground">{project.key} &middot; {project.type === "scrum" ? "Team-managed software" : "Team-managed business"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── People ── */}
          {results.users.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                People ({results.users.length})
              </h2>
              <div className="rounded-lg border divide-y">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href="/teams/people"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {(user.displayName ?? user.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{user.displayName ?? user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
