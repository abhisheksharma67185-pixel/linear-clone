"use client"

import { useState } from "react"
import Link from "next/link"
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
  { id: 1, name: "Legacy API", key: "LEG", type: "kanban", archivedAgo: "2 months ago", icon: "L" },
  { id: 2, name: "Internal Tools", key: "INT", type: "scrum", archivedAgo: "1 month ago", icon: "I" },
]

const typeStyle: Record<string, string> = {
  kanban: "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  scrum: "border-teal-300 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
}

export default function ProjectArchivedPage() {
  const [projects, setProjects] = useState<ArchivedProject[]>(initialProjects)
  const [search, setSearch] = useState("")

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  )

  function handleRestore(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  function handleDelete(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-6">
      {/* Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg className="size-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">Use projects to keep everyone up to date with weekly status updates on any stream on work.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Create your first project</Button>
          <button className="text-sm text-muted-foreground hover:underline">More about projects</button>
        </div>
      </div>

      {/* Title + tabs */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Projects</h1>
        <div className="flex items-center gap-1">
          <Link href="/project-directory" className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            All projects
          </Link>
          <Link href="/project-directory/following" className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            Following
          </Link>
          <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Archived
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
        <p className="text-sm text-muted-foreground">{filteredProjects.length} archived project{filteredProjects.length !== 1 ? "s" : ""}</p>
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
              className="grid grid-cols-[1fr_80px_90px_120px_180px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors"
            >
              {/* Project name + icon */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {project.icon}
                </div>
                <span className="text-sm font-medium truncate">{project.name}</span>
              </div>

              {/* Key */}
              <span className="text-xs text-muted-foreground font-mono">{project.key}</span>

              {/* Type badge */}
              <div>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${typeStyle[project.type]}`}>
                  {project.type}
                </span>
              </div>

              {/* Archived date */}
              <span className="text-xs text-muted-foreground">{project.archivedAgo}</span>

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
                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  onClick={() => handleDelete(project.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="mb-4 size-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <p className="text-sm text-muted-foreground">No archived projects found.</p>
        </div>
      )}
    </div>
  )
}
