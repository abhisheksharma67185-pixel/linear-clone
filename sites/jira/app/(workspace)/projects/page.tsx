"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Project, User } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
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

      {/* Move to trash dialog */}
      <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Move to trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move <strong>{projectName}</strong> to trash? The space will be deleted after 60 days if not restored.
            </DialogDescription>
          </DialogHeader>
          {actionDone ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <svg className="size-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium">Moved to trash</p>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrashOpen(false)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setActionDone(true)
                  setTimeout(() => {
                    setTrashOpen(false)
                    setActionDone(false)
                  }, 1500)
                }}
              >
                Move to trash
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive dialog */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive space</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive <strong>{projectName}</strong>? Archived spaces are read-only and hidden from navigation.
            </DialogDescription>
          </DialogHeader>
          {actionDone ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <svg className="size-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium">Space archived</p>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancel</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setActionDone(true)
                  setTimeout(() => {
                    setArchiveOpen(false)
                    setActionDone(false)
                  }, 1500)
                }}
              >
                Archive
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

const templateList = [
  {
    name: "Scrum",
    description: "Deliver work in short time blocks",
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  {
    name: "Work requests",
    description: "Quickly manage incoming requests",
    badge: "TRY",
    color: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600",
  },
  {
    name: "IT service",
    description: "Manage requests and incidents",
    badge: "TRY",
    color: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
  },
  {
    name: "Kanban",
    description: "Visualize your work on a board",
    color: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600",
  },
  {
    name: "Personal tasks",
    description: "Create your to-do list",
    color: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
  },
  {
    name: "Business project",
    description: "Manage tasks with due dates",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
  },
  {
    name: "Top-level planning",
    description: "Monitor work from many projects",
    badge: "PREMIUM",
    color: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
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
  const [showTemplates, setShowTemplates] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>([...filterChips])
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")
  const [newSpaceKey, setNewSpaceKey] = useState("")

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

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.key.toLowerCase().includes(search.toLowerCase())
  )

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
        {/* Header */}
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
              onClick={() => setShowTemplates(!showTemplates)}
            >
              Templates
            </Button>
          </div>
        </div>

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
            <Input
              placeholder="Search spaces"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
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
                  <button className="flex items-center gap-1 text-xs font-medium">
                    Name
                    <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
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
                const lead = users.find((u) => u.id === project.lead)
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
                        className="flex items-center gap-2 font-medium text-blue-600 hover:underline"
                      >
                        <div className="flex size-6 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                          <HugeiconsIcon
                            icon={Layers01Icon}
                            className="size-3.5 text-blue-600"
                          />
                        </div>
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
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{lead.name}</span>
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
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="w-72 border-l bg-card p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold">Templates</h2>
            <button
              onClick={() => setShowTemplates(false)}
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
                className="flex items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-accent transition-colors"
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

          <button className="mt-4 text-sm font-medium text-blue-600 hover:underline">
            More templates
          </button>
        </div>
      )}

      {/* Create space dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create space</DialogTitle>
            <DialogDescription>
              Create a new space to organize and manage your work.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" htmlFor="space-name">
                Space name <span className="text-red-500">*</span>
              </label>
              <Input
                id="space-name"
                value={newSpaceName}
                onChange={(e) => {
                  setNewSpaceName(e.target.value)
                  setNewSpaceKey(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5))
                }}
                placeholder="e.g. Marketing"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" htmlFor="space-key">
                Key
              </label>
              <Input
                id="space-key"
                value={newSpaceKey}
                onChange={(e) => setNewSpaceKey(e.target.value.toUpperCase())}
                placeholder="e.g. MARK"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateOpen(false)
              setNewSpaceName("")
              setNewSpaceKey("")
            }}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!newSpaceName.trim()}
              onClick={() => {
                setCreateOpen(false)
                setNewSpaceName("")
                setNewSpaceKey("")
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
