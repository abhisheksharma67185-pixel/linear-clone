"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import type { Project, Issue, User, Epic } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SummaryPage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterSearch, setFilterSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [starred, setStarred] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [addPeopleOpen, setAddPeopleOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  // Captured once at mount so the "X hours ago" labels are stable across
  // re-renders (avoids react-hooks/purity for Date.now()).
  const [now] = useState(() => Date.now())

  const FILTER_OPTIONS = [
    "Assignee",
    "Created",
    "Due date",
    "Parent",
    "Priority",
    "Updated",
    "Work type",
  ]
  const filteredFilterOptions = filterSearch
    ? FILTER_OPTIONS.filter((f) =>
        f.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : FILTER_OPTIONS

  const VIEWS = [
    { name: "Archived work items", icon: "archive" },
    { name: "Calendar", icon: "calendar" },
    { name: "Deployments", icon: "deploy" },
    { name: "Development", icon: "dev" },
    { name: "Forms", icon: "form" },
    { name: "Goals", icon: "goal" },
    { name: "List", icon: "list" },
    { name: "Pages", icon: "page" },
    { name: "Releases", icon: "release" },
    { name: "Reports", icon: "report" },
    { name: "Security", icon: "security" },
    { name: "Shortcuts", icon: "shortcut" },
    { name: "Timeline", icon: "timeline" },
  ]

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectKey}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([p, i, u, e]) => {
      setProject(p)
      setIssues(i)
      setUsers(u)
      setEpics(e)
      setLoading(false)
    })
  }, [projectKey])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const projectIssues = useMemo(
    () => (project ? issues.filter((i) => i.projectId === project.id) : []),
    [issues, project]
  )

  const workflow = project?.workflow ?? []
  const doneStates = workflow.filter(
    (w) =>
      w.toLowerCase().includes("done") ||
      w.toLowerCase().includes("closed") ||
      w.toLowerCase().includes("deployed")
  )
  const inProgressStates = workflow.filter(
    (w) =>
      w.toLowerCase().includes("progress") ||
      w.toLowerCase().includes("review") ||
      w.toLowerCase().includes("doing") ||
      w.toLowerCase().includes("development")
  )

  const completedCount = projectIssues.filter((i) =>
    doneStates.includes(i.status)
  ).length
  const inProgressCount = projectIssues.filter((i) =>
    inProgressStates.includes(i.status)
  ).length
  const todoCount = projectIssues.length - completedCount - inProgressCount

  // Priority breakdown
  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      highest: 0,
      high: 0,
      medium: 0,
      low: 0,
      lowest: 0,
    }
    for (const i of projectIssues)
      counts[i.priority] = (counts[i.priority] ?? 0) + 1
    return counts
  }, [projectIssues])
  const maxPriority = Math.max(...Object.values(priorityCounts), 1)

  // Type breakdown
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of projectIssues) counts[i.type] = (counts[i.type] ?? 0) + 1
    return counts
  }, [projectIssues])

  // Team workload
  const workload = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of projectIssues) {
      const key = i.assigneeId ?? "unassigned"
      counts[key] = (counts[key] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([id, count]) => ({
        user: id === "unassigned" ? null : users.find((u) => u.id === id),
        id,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [projectIssues, users])
  const maxWorkload = Math.max(...workload.map((w) => w.count), 1)

  // Recent activity
  const recentIssues = useMemo(
    () =>
      [...projectIssues]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [projectIssues]
  )

  // Project epics
  const projectEpics = useMemo(
    () => (project ? epics.filter((e) => e.projectId === project.id) : []),
    [epics, project]
  )

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  // Donut chart SVG
  const total = projectIssues.length || 1
  const doneAngle = (completedCount / total) * 360
  const ipAngle = (inProgressCount / total) * 360
  const todoAngle = (todoCount / total) * 360

  function donutPath(
    startAngle: number,
    endAngle: number,
    r: number,
    cx: number,
    cy: number
  ) {
    if (endAngle - startAngle >= 360) {
      return `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`
    }
    const s = ((startAngle - 90) * Math.PI) / 180
    const e = ((endAngle - 90) * Math.PI) / 180
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${largeArc} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`
  }

  return (
    <div className="flex h-full flex-col">
      {/* Project header */}
      <div className="px-6 pt-4 pb-1">
        <p className="mb-1 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Spaces
          </Link>
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78m0 0L12 8l7-7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            {/* Team members */}
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Team members"
            >
              <svg
                className="size-4 text-muted-foreground"
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
            </button>
            {/* Three dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    aria-label="More actions"
                    className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                  />
                }
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 py-2">
                <DropdownMenuItem
                  onClick={() => {
                    setStarred(!starred)
                    setToast(
                      starred ? "Removed from starred" : "Project starred"
                    )
                  }}
                  className="gap-3 px-4 py-2.5"
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill={starred ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-sm">
                    {starred ? "Remove from starred" : "Add to starred"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAddPeopleOpen(true)}
                  className="gap-3 px-4 py-2.5"
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="text-sm">Add people</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setToast("Available on Enterprise plan")}
                  className="gap-3 px-4 py-2.5"
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="text-sm">Save as template</span>
                  <span className="ml-auto rounded border border-purple-300 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-purple-600 dark:border-purple-700 dark:text-purple-400">
                    ENTERPRISE
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setToast("Background picker coming soon")}
                  className="gap-3 px-4 py-2.5"
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                  </svg>
                  <span className="flex-1 text-sm">Set space background</span>
                  <svg
                    className="size-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    (window.location.href = `/projects/${project.key}/settings`)
                  }
                  className="gap-3 px-4 py-2.5"
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span className="text-sm">Space settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setArchiveConfirmOpen(true)}
                  className="gap-3 px-4 py-2.5"
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="3" width="20" height="5" rx="1" />
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                    <path d="M10 12h4" />
                  </svg>
                  <span className="text-sm">Archive space</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="gap-3 px-4 py-2.5 text-red-500 focus:text-red-500"
                >
                  <svg
                    className="size-5 shrink-0 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span className="text-sm">Delete space</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <svg
                    className="size-5 shrink-0 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M22 2L13.8 22l-2.6-8.2L3 11.2 22 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Software space</p>
                    <p className="text-xs text-muted-foreground">
                      {project.teamManaged ? "Team-managed" : "Company-managed"}
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Right action icons */}
          <div className="flex items-center gap-1">
            {/* Share */}
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Share"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
            {/* Automation */}
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Automation"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>
            {/* Chat/comment */}
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Chat"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            {/* Full screen */}
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Full screen"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b px-6">
        <div className="flex items-center gap-0">
          {[
            {
              label: "Summary",
              href: `/projects/${project.key}/summary`,
              active: true,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
            },
            {
              label: "Backlog",
              href: `/projects/${project.key}/backlog`,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 7h10M7 12h10M7 17h6" />
                </svg>
              ),
            },
            {
              label: "Board",
              href: `/projects/${project.key}/board`,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="5" height="18" rx="1" />
                  <rect x="10" y="3" width="5" height="18" rx="1" />
                  <rect x="17" y="3" width="5" height="18" rx="1" />
                </svg>
              ),
            },
            {
              label: "Code",
              href: `/projects/${project.key}/code`,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              ),
            },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                tab.active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
          {/* + Add view button */}
          <div className="relative ml-1">
            <button
              onClick={() => setViewsOpen(!viewsOpen)}
              className={`flex size-8 items-center justify-center rounded transition-colors ${viewsOpen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            {viewsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setViewsOpen(false)}
                />
                <div className="absolute top-full left-0 z-50 mt-2 flex rounded-lg border bg-popover shadow-xl">
                  {/* Views list */}
                  <div className="w-[200px] border-r py-2">
                    <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      Views
                    </p>
                    {VIEWS.map((view) => (
                      <button
                        key={view.name}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        onClick={() => setViewsOpen(false)}
                      >
                        <svg
                          className="size-4 shrink-0 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {view.icon === "archive" && (
                            <>
                              <path d="M21 8v13H3V8" />
                              <path d="M1 3h22v5H1z" />
                              <path d="M10 12h4" />
                            </>
                          )}
                          {view.icon === "calendar" && (
                            <>
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </>
                          )}
                          {view.icon === "deploy" && (
                            <>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </>
                          )}
                          {view.icon === "dev" && (
                            <>
                              <polyline points="16 18 22 12 16 6" />
                              <polyline points="8 6 2 12 8 18" />
                            </>
                          )}
                          {view.icon === "form" && (
                            <>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6M9 13h6M9 17h3" />
                            </>
                          )}
                          {view.icon === "goal" && (
                            <>
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="6" />
                              <circle cx="12" cy="12" r="2" />
                            </>
                          )}
                          {view.icon === "list" && (
                            <>
                              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                            </>
                          )}
                          {view.icon === "page" && (
                            <>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                            </>
                          )}
                          {view.icon === "release" && (
                            <>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <path d="M12 15V3" />
                            </>
                          )}
                          {view.icon === "report" && (
                            <>
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </>
                          )}
                          {view.icon === "security" && (
                            <>
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </>
                          )}
                          {view.icon === "shortcut" && (
                            <>
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </>
                          )}
                          {view.icon === "timeline" && (
                            <>
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </>
                          )}
                        </svg>
                        {view.name}
                      </button>
                    ))}
                  </div>
                  {/* Preview panel */}
                  <div className="w-[220px] p-4">
                    <div className="mb-3 flex h-[100px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
                      <svg
                        className="size-10 text-blue-400/50"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <p className="mb-1 text-sm font-medium">
                      Archived work items
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      View all the work items archived in your space items.
                    </p>
                    <button className="text-xs font-medium text-blue-600 hover:underline">
                      Add to navigation
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b px-6 py-2.5">
        <div className="relative inline-block">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 gap-1.5 text-xs ${filterOpen ? "bg-accent" : ""}`}
            onClick={() => {
              setFilterOpen(!filterOpen)
              setFilterSearch("")
            }}
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </Button>
          {filterOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1 w-[220px] rounded-lg border bg-popover shadow-lg">
                {/* Search */}
                <div className="border-b p-2">
                  <input
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Search more filters"
                    autoFocus
                    className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                {/* Filter options */}
                <div className="max-h-[240px] overflow-y-auto py-1">
                  {filteredFilterOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setActiveFilters((prev) =>
                          prev.includes(f)
                            ? prev.filter((x) => x !== f)
                            : [...prev, f]
                        )
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <span
                        className={`flex size-4 items-center justify-center rounded border text-[10px] transition-colors ${activeFilters.includes(f) ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 dark:border-gray-600"}`}
                      >
                        {activeFilters.includes(f) && (
                          <svg
                            className="size-2.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      {f}
                    </button>
                  ))}
                </div>
                {/* Footer */}
                <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
                  {activeFilters.length} of {FILTER_OPTIONS.length}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Stats row */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            {
              label: "completed",
              sublabel: "in the last 7 days",
              value: completedCount,
              color: "text-green-600",
            },
            {
              label: "updated",
              sublabel: "in the last 7 days",
              value: projectIssues.length,
              color: "text-blue-600",
            },
            {
              label: "created",
              sublabel: "in the last 7 days",
              value: projectIssues.length,
              color: "text-teal-600",
            },
            {
              label: "due soon",
              sublabel: "in the next 7 days",
              value: Math.min(2, projectIssues.length),
              color: "text-yellow-600",
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <div>
                <p className="text-xs font-medium">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {stat.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          {/* Status overview */}
          <div className="rounded-lg border p-5">
            <h3 className="mb-1 text-sm font-semibold">Status overview</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Get a snapshot of the status of your work items.{" "}
              <Link
                href={`/projects/${project.key}/backlog`}
                className="text-blue-600 hover:underline"
              >
                View all work items
              </Link>
            </p>
            <div className="flex items-center gap-6">
              {/* Donut chart */}
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {completedCount > 0 && (
                    <path
                      d={donutPath(0, doneAngle, 55, 70, 70)}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                  )}
                  {inProgressCount > 0 && (
                    <path
                      d={donutPath(doneAngle, doneAngle + ipAngle, 55, 70, 70)}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                  )}
                  {todoCount > 0 && (
                    <path
                      d={donutPath(
                        doneAngle + ipAngle,
                        doneAngle + ipAngle + todoAngle,
                        55,
                        70,
                        70
                      )}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                  )}
                  {projectIssues.length === 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r="55"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">
                    {projectIssues.length}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Total Work Item{projectIssues.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full bg-green-500" />
                  Done {completedCount}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full bg-blue-500" />
                  In Progress {inProgressCount}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full bg-gray-300" />
                  To Do {todoCount}
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-lg border p-5">
            <h3 className="mb-1 text-sm font-semibold">Recent activity</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Stay up to date with what&apos;s happening across the space.
            </p>
            <div className="space-y-3">
              {recentIssues.map((issue) => {
                const reporter = users.find((u) => u.id === issue.reporterId)
                const timeDiff = now - new Date(issue.updatedAt).getTime()
                const hours = Math.floor(timeDiff / 3600000)
                const timeAgo =
                  hours < 1
                    ? "just now"
                    : hours < 24
                      ? `about ${hours} hour${hours > 1 ? "s" : ""} ago`
                      : `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? "s" : ""} ago`
                return (
                  <div key={issue.id} className="flex items-start gap-2.5">
                    <Avatar className="mt-0.5 size-6 shrink-0">
                      {reporter?.avatar && (
                        <AvatarImage src={reporter.avatar} />
                      )}
                      <AvatarFallback className="bg-blue-500 text-[8px] text-white">
                        {(reporter?.name ?? "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">
                          {reporter?.name ?? "Someone"}
                        </span>
                        {" created "}
                        <Link
                          href={`/issue/${issue.key}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {issue.key}
                        </Link>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {timeAgo}
                      </p>
                    </div>
                  </div>
                )
              })}
              {recentIssues.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No recent activity.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Priority breakdown + Types of work */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          {/* Priority breakdown */}
          <div className="rounded-lg border p-5">
            <h3 className="mb-1 text-sm font-semibold">Priority breakdown</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Get a holistic view of how work is being prioritized.{" "}
              <Link
                href="https://support.atlassian.com/jira-software-cloud/docs/what-is-a-jira-software-project/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                How to manage priorities for spaces
              </Link>
            </p>
            <div className="flex items-end gap-3" style={{ height: 120 }}>
              {["highest", "high", "medium", "low", "lowest"].map((p) => {
                const barHeight = Math.max(
                  Math.round((priorityCounts[p] / maxPriority) * 100),
                  priorityCounts[p] > 0 ? 8 : 4
                )
                return (
                  <div
                    key={p}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[10px] text-muted-foreground tabular-nums">
                      {priorityCounts[p]}
                    </span>
                    <div
                      className="w-full rounded-t bg-gray-300 dark:bg-gray-600"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="mt-2 text-[10px] text-muted-foreground capitalize">
                      {p}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Types of work */}
          <div className="rounded-lg border p-5">
            <h3 className="mb-1 text-sm font-semibold">Types of work</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Get a breakdown of work items by their types.{" "}
              <Link
                href={`/projects/${project.key}/backlog`}
                className="text-blue-600 hover:underline"
              >
                View all items
              </Link>
            </p>
            <div className="space-y-2.5">
              <div className="mb-1 grid grid-cols-[auto_1fr_auto] gap-x-3 text-[11px] font-semibold text-muted-foreground">
                <span>Type</span>
                <span />
                <span>Distribution</span>
              </div>
              {Object.entries(typeCounts).map(([type, count]) => {
                const pct = Math.round(
                  (count / (projectIssues.length || 1)) * 100
                )
                const colors: Record<string, string> = {
                  task: "bg-blue-500",
                  story: "bg-green-500",
                  bug: "bg-red-500",
                  subtask: "bg-cyan-500",
                  epic: "bg-purple-500",
                }
                const icons: Record<string, string> = {
                  task: "T",
                  story: "S",
                  bug: "B",
                  subtask: "ST",
                  epic: "E",
                }
                return (
                  <div
                    key={type}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex size-4 items-center justify-center rounded-sm text-[8px] font-bold text-white ${colors[type] ?? "bg-gray-500"}`}
                      >
                        {icons[type] ?? "?"}
                      </span>
                      <span className="text-xs capitalize">{type}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${colors[type] ?? "bg-gray-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Team workload + Epic progress */}
        <div className="grid grid-cols-2 gap-6">
          {/* Team workload */}
          <div className="rounded-lg border p-5">
            <h3 className="mb-1 text-sm font-semibold">Team workload</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Monitor the capacity of your team.{" "}
              <Link
                href={`/projects/${project.key}/board`}
                className="text-blue-600 hover:underline"
              >
                Reassign work items to get the right balance
              </Link>
            </p>
            <div className="space-y-2.5">
              <div className="mb-1 grid grid-cols-[120px_1fr] gap-x-3 text-[11px] font-semibold text-muted-foreground">
                <span>Assignee</span>
                <span>Work distribution</span>
              </div>
              {workload.map(({ user, id, count }) => {
                const pct = Math.round((count / maxWorkload) * 100)
                return (
                  <div
                    key={id}
                    className="grid grid-cols-[120px_1fr] items-center gap-x-3"
                  >
                    <span className="truncate text-xs">
                      {user?.name ?? "Unassigned"}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded bg-green-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-[10px] text-muted-foreground tabular-nums">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Epic progress */}
          <div className="rounded-lg border p-5">
            <h3 className="mb-1 text-sm font-semibold">Epic progress</h3>
            {projectEpics.length > 0 ? (
              <div className="mt-3 space-y-3">
                {projectEpics.map((epic) => {
                  const epicIssues = projectIssues.filter(
                    (i) => i.epicId === epic.id
                  )
                  const epicDone = epicIssues.filter((i) =>
                    doneStates.includes(i.status)
                  ).length
                  const pct = epicIssues.length
                    ? Math.round((epicDone / epicIssues.length) * 100)
                    : 0
                  return (
                    <div key={epic.id}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium">{epic.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {epicDone}/{epicIssues.length}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <svg
                  className="mb-3 size-12 text-muted-foreground/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <p className="mb-1 text-sm font-medium">Epic progress</p>
                <p className="text-center text-xs text-muted-foreground">
                  Use epics to track larger initiatives in your space.{" "}
                  <Link
                    href="https://support.atlassian.com/jira-software-cloud/docs/what-is-an-epic/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    What is an epic?
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add people modal */}
      {addPeopleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setAddPeopleOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">
                Add people to {project.name}
              </h3>
              <button
                onClick={() => setAddPeopleOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
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
              <p className="text-sm text-muted-foreground">
                Invite team members by email address.
              </p>
              <input
                placeholder="Enter email addresses"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddPeopleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setAddPeopleOpen(false)
                  setToast("Invitations sent")
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      {archiveConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setArchiveConfirmOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold">
              Archive this space?
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Archived spaces can be restored later from the project directory.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setArchiveConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setArchiveConfirmOpen(false)
                  setToast("Space archived")
                }}
              >
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-5 py-4">
              <h3 className="text-base font-semibold text-red-600">
                Delete {project.name}?
              </h3>
            </div>
            <div className="px-5 py-4">
              <p className="mb-3 text-sm text-muted-foreground">
                This action cannot be undone. All issues, sprints, and project
                data will be permanently deleted.
              </p>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Warning: This will permanently delete all work items in this
                  project.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  window.location.href = "/projects"
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-lg border bg-popover px-4 py-2.5 shadow-lg">
            <svg
              className="size-4 shrink-0 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
