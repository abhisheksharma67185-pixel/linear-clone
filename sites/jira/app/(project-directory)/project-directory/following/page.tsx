"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const LS_KEY = "pd_followed_keys"
const defaultFollowedKeys = ["SCRUM", "MOB", "PLAT"]

function readFollowedKeys(): string[] {
  if (typeof window === "undefined") return defaultFollowedKeys
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (raw === null) return defaultFollowedKeys
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultFollowedKeys
  } catch { return defaultFollowedKeys }
}

function writeFollowedKeys(keys: string[]) {
  if (typeof window === "undefined") return
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(keys)) } catch {}
}

interface FollowedProject {
  id: number
  name: string
  key: string
  type: "kanban" | "scrum"
  lead: string
  href: string
  icon: string
}

const projectCatalog: Record<string, FollowedProject> = {
  SCRUM: { id: 1, name: "SCRUM Project", key: "SCRUM", type: "scrum", lead: "Abhishek Sharma", href: "/projects/SCRUM/board", icon: "S" },
  MOB: { id: 2, name: "Mobile App", key: "MOB", type: "kanban", lead: "Priya Patel", href: "/projects/MOB/board", icon: "M" },
  PLAT: { id: 3, name: "Platform Core", key: "PLAT", type: "scrum", lead: "James Chen", href: "/projects/PLAT/board", icon: "P" },
  KANB: { id: 4, name: "Cloud migration phase 2", key: "KANB", type: "kanban", lead: "Sam Williams", href: "/projects/KANB/board", icon: "C" },
  FAPP: { id: 5, name: "Frontend App", key: "FAPP", type: "scrum", lead: "Abhishek Sharma", href: "/projects/FAPP/board", icon: "F" },
  SUS: { id: 6, name: "Support US", key: "SUS", type: "kanban", lead: "Abhishek Sharma", href: "/projects/SUS/board", icon: "S" },
  SEU: { id: 7, name: "Support EU", key: "SEU", type: "kanban", lead: "Abhishek Sharma", href: "/projects/SEU/board", icon: "S" },
  SAP: { id: 8, name: "Support APAC", key: "SAP", type: "kanban", lead: "Abhishek Sharma", href: "/projects/SAP/board", icon: "S" },
  DEVOPS: { id: 9, name: "DevOps", key: "DEVOPS", type: "kanban", lead: "Abhishek Sharma", href: "/projects/DEVOPS/board", icon: "D" },
  LCRM: { id: 10, name: "Legacy CRM", key: "LCRM", type: "scrum", lead: "Abhishek Sharma", href: "/projects/LCRM/board", icon: "L" },
}

const typeStyle: Record<string, string> = {
  kanban: "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  scrum: "border-teal-300 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
}

export default function ProjectFollowingPage() {
  const router = useRouter()
  const [followedKeys, setFollowedKeys] = useState<string[]>(defaultFollowedKeys)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  // Hydrate from localStorage on mount
  useEffect(() => { setFollowedKeys(readFollowedKeys()) }, [])

  const projects: FollowedProject[] = followedKeys
    .map((k) => projectCatalog[k])
    .filter((p): p is FollowedProject => Boolean(p))

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) return
    const key = name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "") || "NEW"
    // Add to catalog for this session + add to followed keys so it appears in the list
    projectCatalog[key] = {
      id: Date.now(),
      name,
      key,
      type: "scrum",
      lead: "Abhishek Sharma",
      href: `/projects/${key}/board`,
      icon: name.charAt(0).toUpperCase(),
    }
    const next = [...followedKeys, key]
    setFollowedKeys(next)
    writeFollowedKeys(next)
    setCreateOpen(false)
    setNewProjectName("")
    showToast("Project created")
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.lead.toLowerCase().includes(search.toLowerCase())
  )

  function handleUnfollow(id: number) {
    const proj = projects.find((p) => p.id === id)
    if (!proj) return
    const next = followedKeys.filter((k) => k !== proj.key)
    setFollowedKeys(next)
    writeFollowedKeys(next)
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
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setCreateOpen(true)}>Create your first project</Button>
          <Link href="/products" className="text-sm text-muted-foreground hover:underline">More about projects</Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border bg-background px-4 py-3 shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Create Project modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/50" onClick={() => setCreateOpen(false)}>
          <div className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-3">Create project</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                placeholder="e.g. Following Page E2E Project"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
              <button onClick={handleCreateProject} disabled={!newProjectName.trim()} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Title + tabs */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Projects</h1>
        <div className="flex items-center gap-1">
          <Link href="/project-directory" className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            All projects
          </Link>
          <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Following
          </span>
          <Link href="/project-directory/archived" className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            Archived
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          placeholder="Search followed projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Count */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} you follow</p>
      </div>

      {/* Table */}
      {filteredProjects.length > 0 ? (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_80px_90px_140px_120px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Project</span>
            <span>Key</span>
            <span>Type</span>
            <span>Lead</span>
            <span className="text-right">Actions</span>
          </div>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-[1fr_80px_90px_140px_120px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors"
            >
              {/* Project name + icon */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {project.icon}
                </div>
                <Link href={project.href} className="text-sm font-medium truncate hover:text-blue-600 hover:underline">
                  {project.name}
                </Link>
              </div>

              {/* Key */}
              <span className="text-xs text-muted-foreground font-mono">{project.key}</span>

              {/* Type badge */}
              <div>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${typeStyle[project.type]}`}>
                  {project.type}
                </span>
              </div>

              {/* Lead */}
              <div className="flex items-center gap-2">
                <svg className="size-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                </svg>
                <span className="text-xs text-muted-foreground truncate">{project.lead}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleUnfollow(project.id)}
                >
                  Unfollow
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="mb-4 size-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-sm text-muted-foreground">No followed projects found.</p>
        </div>
      )}
    </div>
  )
}
