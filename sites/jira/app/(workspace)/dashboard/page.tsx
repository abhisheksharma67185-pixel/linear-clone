"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Issue, User, Project } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { useIssueDrawer } from "@/components/issue-drawer-provider"

// ─── Issue Type Icon ────────────────────────────────────────────────────────

function IssueTypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    story: "bg-green-500",
    task: "bg-blue-500",
    bug: "bg-red-500",
    subtask: "bg-cyan-500",
    epic: "bg-purple-500",
  }
  return (
    <span className={`flex size-5 items-center justify-center rounded-sm ${colors[type] ?? "bg-blue-500"} shrink-0`}>
      <svg className="size-3 text-white" viewBox="0 0 16 16" fill="currentColor">
        {type === "bug" ? (
          <circle cx="8" cy="8" r="4" />
        ) : type === "story" ? (
          <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" />
        ) : type === "subtask" ? (
          <path d="M3 3h10v10H3z" opacity="0.5" />
        ) : (
          <path d="M3 3h10v10H3z" />
        )}
      </svg>
    </span>
  )
}

// ─── Group issues by time ───────────────────────────────────────────────────

function groupByTime(issues: Issue[]): { label: string; issues: Issue[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const monthAgo = new Date(today.getTime() - 30 * 86400000)

  const groups: Record<string, Issue[]> = {
    TODAY: [],
    YESTERDAY: [],
    "IN THE LAST WEEK": [],
    "IN THE LAST MONTH": [],
    OLDER: [],
  }

  for (const issue of issues) {
    const d = new Date(issue.updatedAt)
    if (d >= today) groups.TODAY.push(issue)
    else if (d >= yesterday) groups.YESTERDAY.push(issue)
    else if (d >= weekAgo) groups["IN THE LAST WEEK"].push(issue)
    else if (d >= monthAgo) groups["IN THE LAST MONTH"].push(issue)
    else groups.OLDER.push(issue)
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, issues: items }))
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

type TabKey = "worked_on" | "viewed" | "assigned" | "starred" | "boards"

const TABS: { key: TabKey; label: string }[] = [
  { key: "worked_on", label: "Worked on" },
  { key: "viewed", label: "Viewed" },
  { key: "assigned", label: "Assigned to me" },
  { key: "starred", label: "Starred" },
  { key: "boards", label: "Boards" },
]

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("worked_on")
  const [spacesFilter, setSpacesFilter] = useState<"recommended" | "recent">("recommended")
  const { openIssue } = useIssueDrawer()

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ]).then(([i, u, p]) => {
      setIssues(i)
      setUsers(u)
      setProjects(p)
      setLoading(false)
    })
  }, [])

  // Filter issues by tab
  const filteredIssues = (() => {
    const sorted = [...issues].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    switch (activeTab) {
      case "assigned":
        return sorted.filter((i) => i.assigneeId === "usr-1")
      case "starred":
        return sorted.slice(0, 5) // placeholder
      case "viewed":
        return sorted.slice(0, 15) // placeholder
      case "boards":
        return [] // boards tab shows project boards, not issues
      case "worked_on":
      default:
        return sorted.slice(0, 20)
    }
  })()

  const timeGroups = groupByTime(filteredIssues)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6">For you</h1>

      {/* Recommended spaces */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recommended spaces</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSpacesFilter("recommended")}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                spacesFilter === "recommended"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setSpacesFilter("recent")}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                spacesFilter === "recent"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              Recent
            </button>
            <Link href="/projects" className="px-2.5 py-1 text-xs text-blue-600 hover:underline ml-2">
              View all spaces
            </Link>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {(spacesFilter === "recent"
            ? [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4)
            : projects.slice(0, 4)
          ).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.key}/board`}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 min-w-[140px] hover:bg-accent/50 transition-colors"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                  {project.key.charAt(0)}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{project.name}</p>
                  <p className="text-[10px] text-muted-foreground">{project.type === "scrum" ? "Software project" : "Service project"}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  All Popular with teammates
                </p>
              </Link>
            ))}
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="border-b mb-1">
        <div className="flex items-center gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issue List */}
      {activeTab === "boards" ? (
        <div className="py-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.key}/board`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shrink-0">
                  {project.key.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.key} board</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No items to show.</p>
        </div>
      ) : (
        <div className="divide-y">
          {timeGroups.map((group) => (
            <div key={group.label}>
              <div className="px-1 pt-5 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
              </div>
              {group.issues.map((issue) => {
                const project = projects.find((p) => p.id === issue.projectId)
                const assignee = users.find((u) => u.id === issue.assigneeId)
                return (
                  <div
                    key={issue.id}
                    className="flex items-center gap-3 px-1 py-2.5 hover:bg-accent/50 rounded-md transition-colors group cursor-pointer"
                    onClick={() => openIssue(issue.key)}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      className="size-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Issue type icon */}
                    <IssueTypeIcon type={issue.type} />

                    {/* Issue info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{issue.summary}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {issue.key} - {project?.name ?? "Unknown project"}
                      </p>
                    </div>

                    {/* Action label */}
                    <span className="text-xs text-muted-foreground shrink-0">Created</span>

                    {/* Avatar */}
                    <Avatar className="size-7 shrink-0">
                      {assignee?.avatar && <AvatarImage src={assignee.avatar} />}
                      <AvatarFallback className="text-[10px] bg-blue-500 text-white">
                        {(assignee?.name ?? issue.reporterId).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
