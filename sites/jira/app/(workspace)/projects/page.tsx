"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Project, User } from "@/app/lib/mock-data"
import { resolveUser } from "@/lib/resolve-user"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserProfileCard } from "@/components/user-profile-card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons"

function SpaceActionsDropdown({ projectKey, projectName }: { projectKey: string; projectName: string }) {
  const [open, setOpen] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [actionDone, setActionDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border bg-popover py-1 shadow-md">
            <button
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              onClick={() => {
                setOpen(false)
                router.push(`/projects/${projectKey}/settings`)
              }}
            >
              Space settings
            </button>
            <button
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              onClick={() => {
                setOpen(false)
                setTrashOpen(true)
              }}
            >
              Move to trash
            </button>
            <button
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              onClick={() => {
                setOpen(false)
                setArchiveOpen(true)
              }}
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Move to trash dialog — manual modal */}
      {trashOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setTrashOpen(false) }}>
          <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Move to trash</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to move <strong>{projectName}</strong> to trash? The space will be deleted after 60 days if not restored.
            </p>
            {actionDone ? (
              <div className="flex flex-col items-center gap-2 py-3 mt-2">
                <svg className="size-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <p className="text-sm font-medium">Moved to trash</p>
              </div>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setTrashOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
                <button type="button" onClick={() => { setActionDone(true); setTimeout(() => { setTrashOpen(false); setActionDone(false) }, 1500) }} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors">Move to trash</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archive dialog — manual modal */}
      {archiveOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setArchiveOpen(false) }}>
          <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Archive space</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to archive <strong>{projectName}</strong>? Archived spaces are read-only and hidden from navigation.
            </p>
            {actionDone ? (
              <div className="flex flex-col items-center gap-2 py-3 mt-2">
                <svg className="size-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <p className="text-sm font-medium">Space archived</p>
              </div>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setArchiveOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
                <button type="button" onClick={() => { setActionDone(true); setTimeout(() => { setArchiveOpen(false); setActionDone(false) }, 1500) }} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">Archive</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const templateList = [
  {
    name: "Scrum",
    description: "Deliver work in short time blocks",
    fullDescription: "Sprint toward your project goals with a board, backlog, and timeline.",
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
    previewColor: "from-green-400 to-green-600",
  },
  {
    name: "Work requests",
    description: "Quickly manage incoming requests",
    fullDescription: "Set up a service desk to manage and track incoming work requests from your team.",
    badge: "TRY",
    color: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600",
    previewColor: "from-purple-400 to-purple-600",
  },
  {
    name: "IT service",
    description: "Manage requests and incidents",
    fullDescription: "Manage IT service requests, incidents, problems, and changes with an ITIL-ready project.",
    badge: "TRY",
    color: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
    previewColor: "from-teal-400 to-teal-600",
  },
  {
    name: "Kanban",
    description: "Visualize your work on a board",
    fullDescription: "Visualize and advance your project forward using issues on a powerful board.",
    color: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600",
    previewColor: "from-blue-400 to-blue-600",
  },
  {
    name: "Personal tasks",
    description: "Create your to-do list",
    fullDescription: "Track your personal tasks and to-dos in a simple, focused project just for you.",
    color: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
    previewColor: "from-orange-400 to-orange-600",
  },
  {
    name: "Business project",
    description: "Manage tasks with due dates",
    fullDescription: "Manage activities like budgets, goals, and tasks with a calendar and list view.",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
    previewColor: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Top-level planning",
    description: "Monitor work from many projects",
    fullDescription: "Plan, track, and manage work across multiple teams and projects from a single view.",
    badge: "PREMIUM",
    color: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
    previewColor: "from-pink-400 to-pink-600",
  },
]

const filterChips = [
  "Jira - software spaces",
  "Jira - business spaces",
]

export default function SpacesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([...filterChips])
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")
  const [newSpaceKey, setNewSpaceKey] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [spaceToast, setSpaceToast] = useState<string | null>(null)

  const handleCreateSpace = () => {
    const name = newSpaceName.trim()
    if (!name) return
    const key = newSpaceKey.trim() || name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5) || "PROJ"
    fetch("/api/data/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, key, type: "scrum" }),
    })
      .then((r) => r.json())
      .then((created) => {
        if (created && !created.error) setProjects((prev) => [...prev, created])
      })
      .catch(() => {})
    setCreateOpen(false)
    setNewSpaceName("")
    setNewSpaceKey("")
    setSpaceToast(`Space "${name}" created`)
    setTimeout(() => setSpaceToast(null), 3000)
  }

  const activeTemplate = templateList.find((t) => t.name === selectedTemplate)

  const toggleStar = (projectId: string) => {
    setStarredProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([p, u]) => {
      setProjects(p)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const softwareActive = activeFilters.includes("Jira - software spaces")
  const businessActive = activeFilters.includes("Jira - business spaces")

  const filteredProjects = projects
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
    )
    // Chip semantics: scrum == software, anything else (kanban) == business.
    // If neither chip is active, show no projects. If both active, show all.
    .filter((p) => {
      const isSoftware = p.type === "scrum"
      return (isSoftware && softwareActive) || (!isSoftware && businessActive)
    })
    .sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortDir === "asc" ? cmp : -cmp
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header - always visible */}
        {!activeTemplate && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setCreateOpen(true)}
              >
                Create space
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowTemplates(!showTemplates); setSelectedTemplate(null) }}
              >
                Templates
              </Button>
            </div>
          </div>
        )}

        {/* Template Preview */}
        {activeTemplate ? (
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="mb-8 self-start text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
              Back to Spaces
            </button>
            <h2 className="text-2xl font-semibold text-foreground mb-2">{activeTemplate.name}</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
              {activeTemplate.fullDescription}
            </p>
            {/* Template illustration */}
            <div className={`w-[480px] h-[320px] rounded-xl bg-gradient-to-br ${activeTemplate.previewColor} p-1 shadow-lg`}>
              <div className="h-full w-full rounded-lg bg-white dark:bg-card p-4 overflow-hidden">
                {/* Fake backlog/board UI */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Backlog</span>
                  <div className="flex gap-1">
                    <div className="size-3 rounded-sm bg-blue-200" />
                    <div className="size-3 rounded-sm bg-green-200" />
                    <div className="size-3 rounded-sm bg-orange-200" />
                  </div>
                </div>
                <div className="rounded-md border bg-[#f9fafb] dark:bg-muted/30 p-3 mb-2">
                  <div className="text-xs text-muted-foreground mb-2">2 Sep – 15 Sep</div>
                  {[
                    { colors: ["bg-blue-500", "bg-blue-300", "bg-pink-400", "bg-green-400"], pts: 3 },
                    { colors: ["bg-green-500", "bg-green-300", "bg-orange-400"], pts: 2 },
                    { colors: ["bg-blue-500", "bg-blue-300", "bg-orange-400", "bg-purple-300", "bg-gray-300"], pts: 5 },
                    { colors: ["bg-green-500", "bg-green-300", "bg-pink-400"], pts: 2 },
                    { colors: ["bg-blue-400", "bg-gray-300", "bg-gray-200"], pts: 1 },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-1.5 mb-1.5">
                      {row.colors.map((c, j) => (
                        <div key={j} className={`h-4 flex-1 rounded-sm ${c}`} />
                      ))}
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{row.pts}</span>
                      <div className="size-3 rounded-full border border-muted-foreground/30" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center mt-4">
                  <div className="size-12 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center">
                    <svg className="size-6 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="mt-8 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setSelectedTemplate(null)
                setCreateOpen(true)
              }}
            >
              Use template
            </Button>
          </div>
        ) : (
          <>
        {/* Spaces list content below */}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search spaces"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 text-sm"
                >
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">
                  <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  >
                    Name
                    <HugeiconsIcon
                      icon={sortDir === "asc" ? ArrowDown01Icon : ArrowUp01Icon}
                      className="size-3"
                    />
                  </button>
                </TableHead>
                <TableHead className="text-xs font-medium">Key</TableHead>
                <TableHead className="text-xs font-medium">Type</TableHead>
                <TableHead className="text-xs font-medium">Lead</TableHead>
                <TableHead className="text-xs font-medium">Space URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const lead = resolveUser(project.lead, users)
                const typeLabel =
                  project.type === "scrum"
                    ? "Team-managed software"
                    : "Team-managed business"
                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <button
                        className={starredProjects.has(project.id) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}
                        onClick={() => toggleStar(project.id)}
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill={starredProjects.has(project.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${project.key}/board`}
                        className="flex items-center gap-2.5 font-medium text-blue-600 hover:underline"
                      >
                        {(() => {
                          const colors = [
                            "bg-red-500", "bg-orange-500", "bg-green-500", "bg-blue-500",
                            "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500",
                          ]
                          const idx = project.key.charCodeAt(0) % colors.length
                          return (
                            <div className={`flex size-7 items-center justify-center rounded ${colors[idx]} text-[11px] font-bold text-white shrink-0`}>
                              {project.key.slice(0, 2)}
                            </div>
                          )
                        })()}
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {project.key}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {typeLabel}
                    </TableCell>
                    <TableCell>
                      {lead && (
                        <div className="flex items-center gap-2">
                          <UserProfileCard
                            name={lead.displayName ?? lead.name}
                            email={lead.email}
                            size="sm"
                          />
                          <span className="text-sm">{(lead.displayName ?? lead.name)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <SpaceActionsDropdown projectKey={project.key} projectName={project.name} />
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No spaces found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <button className="rounded p-1.5 text-muted-foreground hover:bg-accent" disabled>
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
          </button>
          <button className="flex size-8 items-center justify-center rounded border bg-blue-50 text-sm font-medium text-blue-600 dark:bg-blue-900/20">
            1
          </button>
          <button className="rounded p-1.5 text-muted-foreground hover:bg-accent" disabled>
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>
      {/* Close the spaces list conditional */}
          </>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="w-72 border-l bg-card p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold">Templates</h2>
            <button
              onClick={() => { setShowTemplates(false); setSelectedTemplate(null) }}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Preview a template for your next space
          </p>

          <div className="flex flex-col gap-1">
            {templateList.map((tmpl) => (
              <button
                key={tmpl.name}
                onMouseEnter={() => setSelectedTemplate(tmpl.name)}
                onClick={() => setSelectedTemplate(tmpl.name)}
                className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors ${
                  selectedTemplate === tmpl.name
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-accent"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-md ${tmpl.color}`}
                >
                  <HugeiconsIcon
                    icon={Layers01Icon}
                    className={`size-4 ${tmpl.iconColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{tmpl.name}</span>
                    {tmpl.badge && (
                      <span
                        className={`rounded px-1 py-0.5 text-[10px] font-bold leading-none ${
                          tmpl.badge === "PREMIUM"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {tmpl.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Link href="/templates" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            More templates
          </Link>
        </div>
      )}

      {/* Create space dialog — manual modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) { setCreateOpen(false); setNewSpaceName(""); setNewSpaceKey("") } }}>
          <div className="w-full max-w-md rounded-lg border bg-background shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Create space</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create a new space to organize and manage your work.</p>
            </div>
            <div className="flex flex-col gap-3 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Space name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  autoFocus
                  value={newSpaceName}
                  onChange={(e) => {
                    setNewSpaceName(e.target.value)
                    setNewSpaceKey(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5))
                  }}
                  placeholder="e.g. Marketing"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Key</label>
                <input
                  type="text"
                  value={newSpaceKey}
                  onChange={(e) => setNewSpaceKey(e.target.value.toUpperCase())}
                  placeholder="e.g. MARK"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button type="button" onClick={() => { setCreateOpen(false); setNewSpaceName(""); setNewSpaceKey("") }} className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button
                type="button"
                disabled={!newSpaceName.trim()}
                onClick={handleCreateSpace}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {spaceToast && (
        <div className="fixed top-4 right-4 z-[10000] rounded-lg border bg-background px-4 py-3 shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg className="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          {spaceToast}
        </div>
      )}
    </div>
  )
}
