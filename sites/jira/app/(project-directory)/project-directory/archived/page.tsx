"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ArchivedProject {
  id: number
  name: string
  key: string
  type: "kanban" | "scrum"
  archivedAgo: string
  icon: string
}

const initialProjects: ArchivedProject[] = [
  {
    id: 1,
    name: "Legacy API",
    key: "LEG",
    type: "kanban",
    archivedAgo: "2 months ago",
    icon: "L",
  },
  {
    id: 2,
    name: "Internal Tools",
    key: "INT",
    type: "scrum",
    archivedAgo: "1 month ago",
    icon: "I",
  },
]

const typeStyle: Record<string, string> = {
  kanban:
    "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  scrum:
    "border-teal-300 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
}

export default function ProjectArchivedPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ArchivedProject[]>(initialProjects)
  const [search, setSearch] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectType, setNewProjectType] = useState<"scrum" | "kanban">(
    "scrum"
  )
  const [toast, setToast] = useState<string | null>(null)

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) return
    // Note: archived page is for showing archived; new projects don't land here. Just close.
    setCreateOpen(false)
    setNewProjectName("")
    setToast(`Project "${name}" created in All projects`)
    setTimeout(() => setToast(null), 3000)
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  )

  function handleRestore(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  function confirmDelete() {
    if (deleteConfirmId === null) return
    setProjects((prev) => prev.filter((p) => p.id !== deleteConfirmId))
    setDeleteConfirmId(null)
  }

  return (
    <div className="p-6">
      {/* Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg
            className="size-6 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">
            Use projects to keep everyone up to date with weekly status updates
            on any stream on work.
          </p>
        </div>
        <div className="ml-4 flex shrink-0 items-center gap-3">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setCreateOpen(true)}
          >
            Create your first project
          </Button>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:underline"
          >
            More about projects
          </Link>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">
          {toast}
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold">Create project</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  placeholder="e.g. Archived Page E2E Project"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Type</label>
                <select
                  value={newProjectType}
                  onChange={(e) =>
                    setNewProjectType(e.target.value as "scrum" | "kanban")
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="scrum">Scrum</option>
                  <option value="kanban">Kanban</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title + tabs */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">
          Projects
        </h1>
        <div className="flex items-center gap-1">
          <Link
            href="/project-directory"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            All projects
          </Link>
          <Link
            href="/project-directory/following"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Following
          </Link>
          <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Archived
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
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
          placeholder="Search archived projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Count */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">
          {filteredProjects.length} archived project
          {filteredProjects.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      {filteredProjects.length > 0 ? (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_80px_90px_120px_180px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Project</span>
            <span>Key</span>
            <span>Type</span>
            <span>Archived</span>
            <span className="text-right">Actions</span>
          </div>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-[1fr_80px_90px_120px_180px] items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/50"
            >
              {/* Project name + icon — clickable */}
              <button
                onClick={() => router.push(`/projects/${project.key}/board`)}
                className="flex items-center gap-3 text-left transition-colors hover:text-blue-600"
              >
                <div className="flex size-8 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {project.icon}
                </div>
                <span className="truncate text-sm font-medium">
                  {project.name}
                </span>
              </button>

              {/* Key */}
              <span className="font-mono text-xs text-muted-foreground">
                {project.key}
              </span>

              {/* Type badge */}
              <div>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${typeStyle[project.type]}`}
                >
                  {project.type}
                </span>
              </div>

              {/* Archived date */}
              <span className="text-xs text-muted-foreground">
                {project.archivedAgo}
              </span>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleRestore(project.id)}
                >
                  Restore
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => setDeleteConfirmId(project.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="mb-4 size-16 text-muted-foreground/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <p className="text-sm text-muted-foreground">
            No archived projects found.
          </p>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-lg border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">
              Delete project permanently?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone. The project will be permanently
              removed.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
