"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, Project, User, Sprint, Epic } from "@/app/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { statusVariant, statusDisplayLabel, priorityVariant, priorityDisplayLabel, typeLabel } from "@/lib/badge-styles"
import { IssueLink } from "@/components/issue-link"
import { resolveUser, resolveSprintName, resolveEpicName } from "@/lib/resolve-user"

const DASHBOARD_META: Record<string, { name: string; description: string }> = {
  "dash-1": { name: "Default dashboard", description: "Your personal default dashboard showing assigned issues and activity." },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ─── Gadget wrapper ──────────────────────────────────────────────────────────

function Gadget({ title, subtitle, children, className }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border ${className ?? ""}`}>
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button className="text-muted-foreground hover:text-foreground rounded p-0.5">
          <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  )
}

// ─── Type icon helper ────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const color = type === "bug" ? "bg-red-500" : type === "story" ? "bg-green-500" : type === "subtask" ? "bg-cyan-500" : "bg-blue-500"
  return (
    <div className={`flex size-5 shrink-0 items-center justify-center rounded-sm ${color}`} title={typeLabel[type] ?? type}>
      <svg className="size-3 text-white" viewBox="0 0 16 16" fill="currentColor">
        {type === "bug" ? <circle cx="8" cy="8" r="4" /> : <path d="M3 3h10v10H3z" />}
      </svg>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DashboardDetailPage() {
  const params = useParams<{ id: string }>()
  const dashId = params.id
  const meta = DASHBOARD_META[dashId] ?? { name: dashId, description: "" }

  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([i, u, p, s, e]) => {
      setIssues(i)
      setUsers(u)
      setProjects(p)
      setSprints(s)
      setEpics(e)
      setLoading(false)
    })
  }, [])

  const getProject = (id: string) => projects.find((p) => p.id === id)

  // Derived data
  const myIssues = useMemo(() => issues.filter((i) => i.assigneeId === "usr-1" && i.status !== "done"), [issues])
  const recentlyUpdated = useMemo(() => [...issues].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10), [issues])
  const doneIssues = useMemo(() => issues.filter((i) => i.status === "done"), [issues])

  // Stats for pie chart gadget
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of issues) { counts[i.status] = (counts[i.status] || 0) + 1 }
    return counts
  }, [issues])

  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of issues) { counts[i.priority] = (counts[i.priority] || 0) + 1 }
    return counts
  }, [issues])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of issues) { counts[i.type] = (counts[i.type] || 0) + 1 }
    return counts
  }, [issues])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-muted-foreground py-12 text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/dashboards" className="hover:text-foreground">Dashboards</Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5" /></svg>
        <span className="text-foreground">{meta.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{meta.name}</h1>
          {meta.description && <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <svg className="size-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit dashboard
          </Button>
          <Button variant="outline" size="sm">
            <svg className="size-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add gadget
          </Button>
        </div>
      </div>

      {/* Gadget grid — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Assigned to Me ── */}
        <Gadget title="Assigned to Me" subtitle={`${myIssues.length} open issue${myIssues.length !== 1 ? "s" : ""}`}>
          <div className="divide-y max-h-[360px] overflow-y-auto">
            {myIssues.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No issues assigned to you.</div>
            )}
            {myIssues.map((issue) => {
              const project = getProject(issue.projectId)
              return (
                <IssueLink key={issue.id} issueKey={issue.key} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors">
                  <TypeIcon type={issue.type} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm truncate block">{issue.summary}</span>
                    <span className="text-xs text-muted-foreground">{issue.key} &middot; {project?.name}</span>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 text-[10px] ${priorityVariant[issue.priority]}`}>
                    {priorityDisplayLabel[issue.priority] ?? issue.priority}
                  </Badge>
                  <Badge variant="secondary" className={`shrink-0 text-[10px] ${statusVariant[issue.status]}`}>
                    {statusDisplayLabel[issue.status] ?? issue.status}
                  </Badge>
                </IssueLink>
              )
            })}
          </div>
        </Gadget>

        {/* ── Activity Stream ── */}
        <Gadget title="Activity Stream" subtitle="Recent updates across your projects">
          <div className="divide-y max-h-[360px] overflow-y-auto">
            {recentlyUpdated.map((issue) => {
              const actor = resolveUser(issue.reporterId, users)
              const project = getProject(issue.projectId)
              return (
                <div key={issue.id} className="px-4 py-2.5 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {(actor?.displayName ?? actor?.name ?? "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{actor?.displayName ?? actor?.name ?? "Someone"}</span>
                    <span className="text-xs text-muted-foreground">updated</span>
                    <IssueLink issueKey={issue.key} className="text-xs text-blue-600 hover:underline">{issue.key}</IssueLink>
                    <span className="text-xs text-muted-foreground ml-auto">{timeAgo(issue.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-7 truncate">{issue.summary} &middot; {project?.name}</p>
                </div>
              )
            })}
          </div>
        </Gadget>

        {/* ── Issues by Status ── */}
        <Gadget title="Issues by Status" subtitle={`${issues.length} total issues`}>
          <div className="p-4 space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / issues.length) * 100)
              const colors: Record<string, string> = { to_do: "bg-gray-400", in_progress: "bg-blue-500", in_review: "bg-yellow-500", done: "bg-green-500" }
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{statusDisplayLabel[status] ?? status}</span>
                    <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${colors[status] ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Gadget>

        {/* ── Issues by Priority ── */}
        <Gadget title="Issues by Priority" subtitle="Priority distribution">
          <div className="p-4 space-y-3">
            {["highest", "high", "medium", "low", "lowest"].filter((p) => priorityCounts[p]).map((priority) => {
              const count = priorityCounts[priority]
              const pct = Math.round((count / issues.length) * 100)
              const colors: Record<string, string> = { highest: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-blue-500", lowest: "bg-blue-300" }
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize">{priority}</span>
                    <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${colors[priority] ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Gadget>

        {/* ── Recently Updated ── */}
        <Gadget title="Recently Updated" subtitle="Last 10 updated issues">
          <div className="divide-y max-h-[360px] overflow-y-auto">
            {recentlyUpdated.map((issue) => {
              const assignee = resolveUser(issue.assigneeId, users)
              return (
                <IssueLink key={issue.id} issueKey={issue.key} className="flex items-center gap-3 px-4 py-2 hover:bg-accent/50 transition-colors">
                  <TypeIcon type={issue.type} />
                  <span className="font-mono text-xs text-blue-600 w-[75px] shrink-0">{issue.key}</span>
                  <span className="text-sm flex-1 truncate">{issue.summary}</span>
                  {assignee && (
                    <Avatar className="size-5 shrink-0">
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {(assignee.displayName ?? assignee.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-[10px] text-muted-foreground shrink-0 w-[50px] text-right">{timeAgo(issue.updatedAt)}</span>
                </IssueLink>
              )
            })}
          </div>
        </Gadget>

        {/* ── Issues by Type ── */}
        <Gadget title="Issues by Type" subtitle="Type breakdown">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {["story", "task", "bug", "subtask"].filter((t) => typeCounts[t]).map((type) => {
                const count = typeCounts[type]
                return (
                  <div key={type} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5">
                    <TypeIcon type={type} />
                    <div>
                      <div className="text-lg font-semibold leading-none">{count}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{typeLabel[type] ?? type}{count !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Gadget>

        {/* ── Sprint Progress ── */}
        <Gadget title="Sprint Progress" subtitle="Active sprints">
          <div className="p-4 space-y-4">
            {sprints.filter((s) => s.state === "active").length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">No active sprints.</div>
            )}
            {sprints.filter((s) => s.state === "active").map((sprint) => {
              const sprintIssues = issues.filter((i) => i.sprintId === sprint.id)
              const done = sprintIssues.filter((i) => i.status === "done").length
              const total = sprintIssues.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const project = getProject(sprint.projectId)
              return (
                <div key={sprint.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{sprint.name}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px]">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{project?.name} &middot; {sprint.startDate} – {sprint.endDate}</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{done} of {total} issues done</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Gadget>

        {/* ── Recently Resolved ── */}
        <Gadget title="Recently Resolved" subtitle={`${doneIssues.length} resolved issue${doneIssues.length !== 1 ? "s" : ""}`}>
          <div className="divide-y max-h-[360px] overflow-y-auto">
            {doneIssues.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No resolved issues.</div>
            )}
            {doneIssues.slice(0, 8).map((issue) => {
              const project = getProject(issue.projectId)
              return (
                <IssueLink key={issue.id} issueKey={issue.key} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors">
                  <TypeIcon type={issue.type} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm truncate block">{issue.summary}</span>
                    <span className="text-xs text-muted-foreground">{issue.key} &middot; {project?.name}</span>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {statusDisplayLabel.done}
                  </Badge>
                </IssueLink>
              )
            })}
          </div>
        </Gadget>
      </div>
    </div>
  )
}
