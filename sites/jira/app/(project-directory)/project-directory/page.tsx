"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const projectStatusStyle: Record<string, string> = {
  "ON TRACK": "border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  "AT RISK": "border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  "OFF TRACK": "border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  "PENDING": "border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-800/30 dark:text-gray-400",
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "just now"
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`
}

const defaultEmojis = ["📋", "🚀", "💻", "🎯", "📊", "🔧", "📦", "🌟", "🎨", "☁️", "🤝", "🌱"]

const mockProjects = [
  { id: 1, key: "SCRUM", name: "New employee onboarding update", status: "ON TRACK", icon: "🎨", lastUpdated: "1 day ago", tag: "onboarding", goal: "Employee experience", team: "HR", owner: "Abhishek Sharma", projectType: "scrum" },
  { id: 2, key: "KANB", name: "Cloud migration phase 2", status: "AT RISK", icon: "☁️", lastUpdated: "3 days ago", tag: "infrastructure", goal: "Platform reliability", team: "Engineering", owner: "Sam Williams", projectType: "kanban" },
  { id: 3, key: "SCRUM", name: "Customer portal redesign", status: "AT RISK", icon: "🤝", lastUpdated: "5 days ago", tag: "design", goal: "Customer experience", team: "Design", owner: "Jordan Lee", projectType: "scrum" },
  { id: 4, key: "SCRUM", name: "Mobile app performance optimization", status: "ON TRACK", icon: "🌱", lastUpdated: "1 week ago", tag: "performance", goal: "Platform reliability", team: "Engineering", owner: "Taylor Brown", projectType: "scrum" },
]

interface ProjectItem {
  id: number
  key: string
  name: string
  status: string
  icon: string
  lastUpdated: string
  tag: string
  goal: string
  team: string
  owner: string
  projectType?: string
}

const allStatuses = ["ON TRACK", "AT RISK", "OFF TRACK"]
const allGoals = ["Employee experience", "Platform reliability", "Customer experience"]
const allTags = ["onboarding", "infrastructure", "design", "performance"]
const allTeams = ["HR", "Engineering", "Design", "QA", "Product"]
const allOwners = ["Abhishek Sharma", "Sam Williams", "Jordan Lee", "Taylor Brown"]

const tabs = ["All projects", "My projects", "Archived"]

type FilterKey = "status" | "goal" | "tag" | "team" | "owner" | "projectType"

interface FilterConfig {
  key: FilterKey
  label: string
  options: string[]
  icon: React.ReactNode
}

const allProjectTypes = ["Scrum", "Kanban"]

const filterConfigs: FilterConfig[] = [
  {
    key: "tag", label: "Filter by Tag", options: allTags,
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  },
  {
    key: "status", label: "Status", options: allStatuses,
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>,
  },
  {
    key: "goal", label: "Goal", options: allGoals,
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
  },
  {
    key: "team", label: "Team", options: allTeams,
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    key: "owner", label: "Owner", options: allOwners,
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>,
  },
  {
    key: "projectType", label: "Project type", options: allProjectTypes,
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
]

function ProjectRowMenu({ project, onArchive, onDelete, onToast, onEdit, following, onToggleFollow }: {
  project: { id: number; key: string; name: string }
  onArchive: (id: number) => void
  onDelete: (id: number) => void
  onToast: (msg: string) => void
  onEdit: (id: number) => void
  following: boolean
  onToggleFollow: (id: number) => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  // Position the dropdown using fixed coords from the trigger button
  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (open) { setOpen(false); return }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right - 192 }) // 192 = w-48
    }
    setOpen(true)
  }

  // Close on outside click — listen on mousedown so it fires before click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (btnRef.current?.contains(target)) return // let the toggle handle it
      if (menuRef.current && !menuRef.current.contains(target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openMenu}
        onMouseDown={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-foreground rounded p-1 hover:bg-accent transition-colors"
      >
        <svg className="size-4 pointer-events-none" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
      </button>

      {/* Fixed-position dropdown — escapes all parent overflow/clipping */}
      {open && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="z-[9999] w-48 rounded-lg border bg-popover shadow-lg py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(`/projects/${project.key}/board`) }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            View project
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(project.id) }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit details
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onArchive(project.id) }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
            Archive
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onToggleFollow(project.id)
              onToast(following ? `Unfollowed ${project.name}` : `Now following ${project.name}`)
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {following
                ? <><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><line x1="2" y1="2" x2="22" y2="22" /></>
                : <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              }
            </svg>
            {following ? "Unfollow" : "Follow"}
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => { setOpen(false); setDeleteOpen(true) }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            Delete project
          </button>
        </div>
      )}

      {/* Delete confirmation overlay */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={(e) => { e.stopPropagation(); setDeleteOpen(false) }}>
          <div className="w-full max-w-[400px] rounded-lg border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Delete project</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{project.name}</span>? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button type="button" onClick={() => { onDelete(project.id); setDeleteOpen(false) }} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FilterPopover({ config, selected, onToggle, onClear }: {
  config: FilterConfig
  selected: Set<string>
  onToggle: (value: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [filterSearch, setFilterSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const hasSelection = selected.size > 0
  const filtered = config.options.filter((o) => o.toLowerCase().includes(filterSearch.toLowerCase()))

  useEffect(() => {
    if (!open) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setFilterSearch("") }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setFilterSearch("") }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${hasSelection ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-muted-foreground hover:bg-accent"}`}
      >
        {config.icon}
        {config.label}
        {hasSelection && <span className="ml-0.5 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">{selected.size}</span>}
        <svg className="size-3 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-lg border bg-popover shadow-lg">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder={`Search ${config.label.toLowerCase()}...`}
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                autoFocus
                className="w-full rounded-md border bg-background py-1.5 pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {/* Options */}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No matches</p>
            )}
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <span className={`flex size-4 items-center justify-center rounded border ${selected.has(option) ? "bg-blue-600 border-blue-600 text-white" : "border-muted-foreground/40"}`}>
                  {selected.has(option) && <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </span>
                <span className="truncate">{option}</span>
              </button>
            ))}
          </div>
          {/* Footer */}
          {hasSelection && (
            <div className="border-t px-3 py-2">
              <button type="button" onClick={() => { onClear(); setOpen(false); setFilterSearch("") }} className="text-xs text-blue-600 hover:underline">Clear filter</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SortByDropdown({ sortBy, sortAsc, onSelect }: { sortBy: string; sortAsc: boolean; onSelect: (s: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])
  const options = ["following", "name", "status", "updated", "target date"]
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        Sort by {sortBy}
        <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path d={sortAsc ? "M8 4l-4 4h8z" : "M8 12l-4-4h8z"} /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border bg-popover shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt}
              role="menuitem"
              onClick={() => { onSelect(opt); setOpen(false) }}
              className={`flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left ${sortBy === opt ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              Sort by {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ColumnsPopover({ open, setOpen, visibleColumns, setVisibleColumns }: {
  open: boolean; setOpen: (v: boolean) => void;
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, setOpen])
  const cols = [
    { id: "project", label: "Project", locked: true },
    { id: "status", label: "Status", locked: false },
    { id: "target_date", label: "Target date", locked: false },
    { id: "owner", label: "Owner", locked: false },
    { id: "team", label: "Team", locked: false },
    { id: "last_updated", label: "Last updated", locked: false },
  ]
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded border px-2 py-1 text-sm text-muted-foreground hover:bg-accent">
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        Columns
      </button>
      {open && (
        <div role="dialog" className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border bg-popover shadow-lg p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">Columns</div>
          <div className="max-h-64 overflow-y-auto">
            {cols.map((col) => (
              <div key={col.id} className="flex items-center justify-between px-2 py-1.5 text-sm">
                <span>{col.label}</span>
                {col.locked ? (
                  <svg className="size-4 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ) : (
                  <button
                    onClick={() => setVisibleColumns((prev) => ({ ...prev, [col.id]: !prev[col.id] }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${visibleColumns[col.id] ? "bg-blue-600" : "bg-muted"}`}
                  >
                    <span className={`size-4 rounded-full bg-white shadow-sm transition-transform ${visibleColumns[col.id] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MoreMenu({ open, setOpen, onExport, onSettings }: { open: boolean; setOpen: (v: boolean) => void; onExport: () => void; onSettings: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, setOpen])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground rounded p-1 hover:bg-accent">
        <svg className="size-5" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border bg-popover shadow-lg py-1">
          <button role="menuitem" onClick={onExport} className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent text-left">Export CSV</button>
          <button role="menuitem" onClick={onSettings} className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent text-left">Settings</button>
        </div>
      )}
    </div>
  )
}

export default function ProjectDirectoryPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [projects, setProjects] = useState<ProjectItem[]>(mockProjects)
  const [toast, setToast] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectType, setNewProjectType] = useState("scrum")
  const [editOpen, setEditOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<number | null>(null)
  const [editProjectName, setEditProjectName] = useState("")
  const [archiveConfirmId, setArchiveConfirmId] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState("following")
  const [sortAsc, setSortAsc] = useState(true)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    project: true, status: true, target_date: true, owner: true, team: true, last_updated: true,
  })
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) return
    const key = name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "") || "NEW"
    const id = Date.now()
    setProjects((prev) => [...prev, {
      id, key, name, status: "PENDING", icon: "📋", lastUpdated: "just now",
      tag: "", goal: "", team: "", owner: "Abhishek Sharma", projectType: newProjectType,
    }])
    setCreateOpen(false)
    setNewProjectName("")
    setNewProjectType("scrum")
    setToast("Project created")
    setTimeout(() => setToast(null), 3000)
  }

  const handleEditProject = (id: number) => {
    const p = projects.find((x) => x.id === id)
    if (!p) return
    setEditProjectId(id)
    setEditProjectName(p.name)
    setEditOpen(true)
  }
  const commitEdit = () => {
    if (editProjectId === null) return
    const newName = editProjectName.trim()
    if (!newName) return
    setProjects((prev) => prev.map((x) => x.id === editProjectId ? { ...x, name: newName } : x))
    setEditOpen(false)
    setEditProjectId(null)
    setToast("Project updated")
    setTimeout(() => setToast(null), 3000)
  }
  const [filters, setFilters] = useState<Record<FilterKey, Set<string>>>({
    status: new Set(),
    goal: new Set(),
    tag: new Set(),
    team: new Set(),
    owner: new Set(),
    projectType: new Set(),
  })
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [activeTab, setActiveTab] = useState<"all" | "my" | "archived">("all")
  const [followedProjects, setFollowedProjects] = useState<Set<number>>(new Set())

  // Fetch projects from API and merge with mock data
  useEffect(() => {
    fetch("/api/data/projects")
      .then((r) => r.json())
      .then((apiProjects: { id: string; key: string; name: string; type: string; lead: string; createdAt: string }[]) => {
        const existingKeys = new Set(mockProjects.map((p) => p.key))
        const newProjects: ProjectItem[] = apiProjects
          .filter((p) => !existingKeys.has(p.key))
          .map((p, i) => ({
            id: 1000 + i,
            key: p.key,
            name: p.name,
            status: "PENDING",
            icon: defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)],
            lastUpdated: formatRelativeDate(p.createdAt),
            tag: "",
            goal: "",
            team: "",
            owner: "Abhishek Sharma",
            projectType: p.type,
          }))
        if (newProjects.length > 0) {
          setProjects([...mockProjects, ...newProjects])
        }
      })
      .catch(() => {})
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const handleArchive = (id: number) => { setArchiveConfirmId(id) }
  const confirmArchive = () => {
    if (archiveConfirmId === null) return
    setProjects((p) => p.filter((x) => x.id !== archiveConfirmId))
    setArchiveConfirmId(null)
    showToast("Project archived")
  }
  const handleDelete = (id: number) => { setProjects((p) => p.filter((x) => x.id !== id)); showToast("Project deleted") }
  const toggleFollow = (id: number) => {
    setFollowedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    // Sync with /project-directory/following page via localStorage (by project key)
    const proj = projects.find((p) => p.id === id)
    if (!proj || typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem("pd_followed_keys")
      const current: string[] = raw === null ? ["SCRUM", "MOB", "PLAT"] : JSON.parse(raw)
      const idx = current.indexOf(proj.key)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(proj.key)
      window.localStorage.setItem("pd_followed_keys", JSON.stringify(current))
    } catch {}
  }

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[key])
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return { ...prev, [key]: next }
    })
  }

  const clearFilter = (key: FilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: new Set() }))
  }

  const clearAllFilters = () => {
    setFilters({ status: new Set(), goal: new Set(), tag: new Set(), team: new Set(), owner: new Set(), projectType: new Set() })
  }

  const hasAnyFilter = Object.values(filters).some((s) => s.size > 0)

  const filteredProjects = projects.filter((p) => {
    // Tab filter
    if (activeTab === "my" && p.owner !== "Abhishek Sharma") return false
    if (activeTab === "archived") return false // archived tab shows empty — archived projects live at /project-directory/archived
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.status.size > 0 && !filters.status.has(p.status)) return false
    if (filters.goal.size > 0 && !filters.goal.has(p.goal)) return false
    if (filters.tag.size > 0 && !filters.tag.has(p.tag)) return false
    if (filters.team.size > 0 && !filters.team.has(p.team)) return false
    if (filters.owner.size > 0 && !filters.owner.has(p.owner)) return false
    if (filters.projectType.size > 0 && (!p.projectType || ![...filters.projectType].some((t) => t.toLowerCase() === p.projectType!.toLowerCase()))) return false
    return true
  }).slice().sort((a, b) => {
    const dir = sortAsc ? 1 : -1
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir
    if (sortBy === "status") return a.status.localeCompare(b.status) * dir
    if (sortBy === "updated") return a.lastUpdated.localeCompare(b.lastUpdated) * dir
    if (sortBy === "target date") return 0 // mock has no target date values
    return 0
  })

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border bg-background px-4 py-3 shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg className="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          {toast}
        </div>
      )}
      {/* Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg className="size-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">
            Use projects to keep everyone up to date with weekly status updates on any stream on work.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">Create your first project</Button>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            More about projects
          </Link>
        </div>
      </div>

      {/* Create Project modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/50" onClick={() => setCreateOpen(false)}>
          <div className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-3">Create project</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  placeholder="e.g. Banner Test Project"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type</label>
                <select
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="scrum">Scrum</option>
                  <option value="kanban">Kanban</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
              <button onClick={handleCreateProject} disabled={!newProjectName.trim()} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/50" onClick={() => setEditOpen(false)}>
          <div className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-3">Edit project</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                autoFocus
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
              <button onClick={commitEdit} disabled={!editProjectName.trim()} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      {archiveConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setArchiveConfirmId(null)}>
          <div className="w-full max-w-[400px] rounded-lg border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Archive project</h3>
            <p className="mt-2 text-sm text-muted-foreground">Are you sure you want to archive this project? You can restore it later from the Archived view.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setArchiveConfirmId(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
              <button onClick={confirmArchive} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Title + tabs */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Projects</h1>
        <div className="flex items-center gap-0 border-b">
          {([
            { key: "all" as const, label: "All projects" },
            { key: "my" as const, label: "My projects" },
            { key: "archived" as const, label: "Archived" },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                if (tab.key === "archived") {
                  router.push("/project-directory/archived")
                } else {
                  setActiveTab(tab.key)
                }
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter buttons — each is a Popover */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filterConfigs.map((config) => (
          <FilterPopover
            key={config.key}
            config={config}
            selected={filters[config.key]}
            onToggle={(v) => toggleFilter(config.key, v)}
            onClear={() => clearFilter(config.key)}
          />
        ))}

        {/* Reporting line — static link */}
        <Link href="/teams/people" className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
          Reporting line
        </Link>

        {hasAnyFilter && (
          <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline ml-1">Clear all</button>
        )}
      </div>

      {/* Count + sort */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <div className="flex rounded border">
            <button onClick={() => setViewMode("list")} className={`px-2 py-1 ${viewMode === "list" ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
            <button onClick={() => setViewMode("board")} className={`px-2 py-1 ${viewMode === "board" ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
            </button>
          </div>
          <SortByDropdown sortBy={sortBy} sortAsc={sortAsc} onSelect={(s) => { if (s === sortBy) setSortAsc((v) => !v); else { setSortBy(s); setSortAsc(true) } }} />
          <ColumnsPopover open={columnsOpen} setOpen={setColumnsOpen} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
          <MoreMenu open={moreMenuOpen} setOpen={setMoreMenuOpen} onExport={() => { showToast("Export started"); setMoreMenuOpen(false) }} onSettings={() => { router.push("/project-directory"); setMoreMenuOpen(false) }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr_100px_100px_80px_100px_100px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Project</span>
          {visibleColumns.status && <span>Status</span>}
          {visibleColumns.target_date && <span>Target date</span>}
          {visibleColumns.owner && <span>Owner</span>}
          {visibleColumns.team && <span>Team</span>}
          {visibleColumns.last_updated && <span>Last updated</span>}
        </div>
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/projects/${project.key}/board`)}
            className="grid grid-cols-[1fr_100px_100px_80px_100px_100px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <Link href={`/projects/${project.key}/board`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 hover:text-blue-600">
              <span className="text-base">{project.icon}</span>
              <span className="text-sm truncate">{project.name}</span>
            </Link>
            {visibleColumns.status && (
              <div>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${projectStatusStyle[project.status]}`}>
                  {project.status}
                </span>
              </div>
            )}
            {visibleColumns.target_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div className="h-2.5 w-12 rounded bg-muted" />
              </div>
            )}
            {visibleColumns.owner && <div className="text-xs text-muted-foreground truncate">{project.owner.split(" ")[0]}</div>}
            {visibleColumns.team && <div className="text-xs text-muted-foreground truncate">{project.team}</div>}
            <div className="flex items-center justify-between">
              {visibleColumns.last_updated && <span className="text-xs text-muted-foreground">{project.lastUpdated}</span>}
              <ProjectRowMenu project={project} onArchive={handleArchive} onDelete={handleDelete} onToast={showToast} onEdit={handleEditProject} following={followedProjects.has(project.id)} onToggleFollow={toggleFollow} />
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No projects match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
