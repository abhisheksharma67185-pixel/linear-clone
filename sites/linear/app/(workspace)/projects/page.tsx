"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useSearchParams, useRouter } from "next/navigation"
import type { Project, Member, Team, Issue } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { IconPickerPopover } from "@/components/icon-picker-popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SlidersHorizontalIcon,
  FilterHorizontalIcon,
  PanelRightIcon,
  PlusSignIcon,
  Layers01Icon,
  ArrowDown01Icon,
  CubeIcon,
  CheckmarkSquare01Icon,
  CalendarAdd01Icon,
} from "@hugeicons/core-free-icons"

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsPageInner />
    </Suspense>
  )
}

function ProjectsPageInner() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false) // eslint-disable-line
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<"health" | "leads">("health")
  const [editingView, setEditingView] = useState(false)
  const [viewName, setViewName] = useState("All projects")
  const [viewDesc, setViewDesc] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [healthFiltered, setHealthFiltered] = useState(false)
  const [leadsFiltered, setLeadsFiltered] = useState(false)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [viewType, setViewType] = useState<"list" | "board" | "timeline">("list")

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(col)
      setSortDir("asc")
    }
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
    ]).then(([p, m, t, i]) => {
      setProjects(p)
      setMembers(m)
      setTeams(t)
      setIssues(i)
      setLoading(false)
    })
  }, [])

  const statsByProject = useMemo(() => {
    const map = new Map<string, number>()
    for (const project of projects) {
      const pi = issues.filter((i) => i.projectId === project.id)
      const done = pi.filter((i) => i.status === "done" || i.status === "cancelled").length
      map.set(project.id, pi.length > 0 ? Math.round((done / pi.length) * 100) : 0)
    }
    return map
  }, [projects, issues])

  const sortedProjects = useMemo(() => {
    if (!sortBy) return projects
    return [...projects].sort((a, b) => {
      let cmp = 0
      if (sortBy === "name") cmp = a.name.localeCompare(b.name)
      if (sortBy === "status") {
        const pa = statsByProject.get(a.id) ?? 0
        const pb = statsByProject.get(b.id) ?? 0
        cmp = pa - pb
      }
      if (sortBy === "date") {
        const da = a.targetDate ? new Date(a.targetDate).getTime() : Infinity
        const db = b.targetDate ? new Date(b.targetDate).getTime() : Infinity
        cmp = da - db
      }
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [projects, sortBy, sortDir, statsByProject])

  return (
    <>
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2.5">
        <h1 className="text-sm font-medium">Projects</h1>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setCreateOpen(true)}
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        </Button>
      </header>

      {/* Tabs + toolbar */}
      <div className="flex items-center justify-between border-b px-4">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              setEditingView(false)
              setViewName("All projects")
              setViewDesc("")
            }}
            className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/80"
          >
            All projects
          </button>
          {editingView ? (
            /* Active editing — show dashed "New view" pill */
            <button
              type="button"
              onClick={() => setEditingView(false)}
              className="ml-1 flex items-center gap-1.5 rounded-full border border-dashed border-muted-foreground/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground"
            >
              <HugeiconsIcon icon={Layers01Icon} className="size-3" />
              New view
              {/* pencil icon */}
              <svg viewBox="0 0 12 12" className="size-3" fill="none">
                <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            /* Inactive — small layers toggle */
            <button
              type="button"
              onClick={() => setEditingView(true)}
              className="ml-1 flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={Layers01Icon} className="size-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FilterPopover />
          <DisplayPopover viewType={viewType} setViewType={setViewType} />
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className={`flex size-7 items-center justify-center rounded-full transition-colors duration-150 ${
              panelOpen
                ? "bg-zinc-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={PanelRightIcon} className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Table + Panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-auto">

        {/* Inline view editor */}
        {editingView && (
          <div className="border-b">
            {/* Name + description inputs */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Layers01Icon} className="size-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="All projects"
                  className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingView(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingView(false)}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    Save
                  </button>
                </div>
              </div>
              <input
                value={viewDesc}
                onChange={(e) => setViewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="mt-1.5 w-full bg-transparent pl-6 text-xs text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>

            {/* Sub-toolbar */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              {/* Left: filter */}
              <button type="button" className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                <HugeiconsIcon icon={FilterHorizontalIcon} className="size-3.5" />
              </button>
              {/* Right: timeline controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Today
                </button>
                <div className="relative">
                  <select className="appearance-none rounded-full bg-muted px-3 py-1 pr-6 text-xs font-medium text-foreground focus:outline-none cursor-pointer">
                    {["Year", "Quarter"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                </div>
                <button type="button" className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                  <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col gap-2 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded" />
            ))}
          </div>
        ) : viewType === "board" ? (
          <BoardView projects={sortedProjects} members={members} statsByProject={statsByProject} onCreateProject={() => setCreateOpen(true)} />
        ) : viewType === "timeline" ? (
          <TimelineView projects={sortedProjects} members={members} />
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center border-b px-5 py-2 text-[11px] text-muted-foreground">
              <span className="mr-2 w-4 shrink-0" />
              <SortHeader label="Name"        col="name"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="flex-1 justify-start" />
              <SortHeader label="Health"      col="health"   sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="w-36" />
              <SortHeader label="Priority"    col="priority" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="w-24" />
              <span className="w-16">Lead</span>
              <SortHeader label="Target date" col="date"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="w-28" />
              <SortHeader label="Status"      col="status"   sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="w-20 justify-end" />
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <p className="text-sm font-medium">No projects yet</p>
                <p className="text-xs text-muted-foreground">Create a project to get started.</p>
                <Button
                  size="sm"
                  className="mt-2 h-7 rounded-full bg-violet-600 px-4 text-xs hover:bg-violet-700"
                  onClick={() => setCreateOpen(true)}
                >
                  New project
                </Button>
              </div>
            ) : (
              sortedProjects.map((project) => {
                const lead = members.find((m) => m.id === project.leadId)
                const pct = statsByProject.get(project.id) ?? 0
                const isSelected = selectedIds.has(project.id)
                return (
                  <div
                    key={project.id}
                    className={`group flex items-center border-b px-5 py-2.5 text-sm transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-600/10 hover:bg-blue-600/15" : "hover:bg-accent/40"
                    }`}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    {/* Checkbox */}
                    <div
                      className="mr-2 flex size-4 shrink-0 items-center justify-center"
                      onClick={(e) => toggleSelect(project.id, e)}
                    >
                      {isSelected ? (
                        <div className="flex size-4 items-center justify-center rounded bg-blue-600">
                          <svg viewBox="0 0 12 12" className="size-2.5 text-white" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-4 rounded border border-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>
                    {/* Name */}
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <ProjectIconPicker />
                      <span className="truncate font-medium">{project.name}</span>
                    </div>
                    {/* Health */}
                    <div className="flex w-36 items-center gap-1.5 text-muted-foreground">
                      <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                      </svg>
                      <span className="text-xs">No updates</span>
                    </div>
                    {/* Priority */}
                    <div className="w-24" onClick={(e) => e.stopPropagation()}>
                      <PriorityPicker />
                    </div>
                    {/* Lead */}
                    <div className="w-16" onClick={(e) => e.stopPropagation()}>
                      <LeadPicker initialLead={lead ?? null} members={members} />
                    </div>
                    {/* Target date */}
                    <div className="w-28" onClick={(e) => e.stopPropagation()}>
                      <DatePickerPopover />
                    </div>
                    {/* Status */}
                    <div className="flex w-20 items-center justify-end gap-1.5 text-xs text-muted-foreground">
                      <ProgressCircle pct={pct} />
                      <span>{pct}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>

      {/* Right panel */}
      {panelOpen && (
        <div className="flex w-72 shrink-0 flex-col border-l bg-background">
          {/* Health / Leads tabs */}
          <div className="flex gap-2 px-3 pb-3">
            {(["health", "leads"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPanelTab(t)}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  panelTab === t
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-auto px-3 py-1">
            {panelTab === "health" ? (
              <div
                className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-accent/40"
                onClick={() => setHealthFiltered((v) => !v)}
              >
                <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground/50" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
                <span className="flex-1 text-foreground">No update expected</span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{healthFiltered ? "Clear filter" : "See projects"}</span>
                  <span>1</span>
                </div>
              </div>
            ) : (
              <div
                className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-accent/40"
                onClick={() => setLeadsFiltered((v) => !v)}
              >
                <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground/60" fill="none">
                  <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="flex-1 text-foreground">No lead</span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{leadsFiltered ? "Clear filter" : "See projects"}</span>
                  <span>1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>

    {/* Selection action bar */}
    {selectedIds.size > 0 && (
      <div className="pointer-events-none fixed inset-x-0 bottom-6 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-0 rounded-xl bg-[oklch(0.22_0_0)] px-1 py-1 shadow-2xl ring-1 ring-white/8">
          {/* Count + deselect */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Actions button */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/6 hover:text-foreground"
          >
            <kbd className="font-sans text-xs">⌘</kbd>
            <span>Actions</span>
          </button>
        </div>
      </div>
    )}

    <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function MemberRow({
  member, selected, onSelect,
}: {
  member: Member
  selected: boolean
  onSelect: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 })
  const rowRef = useRef<HTMLButtonElement>(null)

  function handleMouseEnter() {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect()
      setCardPos({ top: rect.top, left: rect.left - 232 })
    }
    setHovered(true)
  }

  const initials = member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  const localTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

  return (
    <>
      <button
        ref={rowRef}
        type="button"
        onClick={onSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-accent"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[9px] font-semibold text-white">
          {initials}
        </div>
        <span className="flex-1 truncate text-left text-sm">{member.name}</span>
        {selected && (
          <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-foreground" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {hovered && typeof window !== "undefined" && createPortal(
        <div
          className="pointer-events-none fixed z-[9999] w-56 rounded-xl border border-border/60 bg-popover p-4 shadow-2xl"
          style={{ top: cardPos.top, left: cardPos.left }}
        >
          {/* Avatar + name */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                theta.computer01 <span className="mx-1">·</span>
                <span className="text-green-500">Online ●</span>
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>{localTime} local time</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 12c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="truncate">{member.name.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={CubeIcon} className="size-3.5 shrink-0" />
              <span className="truncate">theta-rl-labs</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function LeadPicker({ initialLead, members }: { initialLead: Member | null; members: Member[] }) {
  const [open, setOpen] = useState(false)
  const [lead, setLead] = useState<Member | null>(null)
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<button type="button" className="flex items-center rounded-full" />}>
        {lead ? (
          <div className="flex size-7 items-center justify-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">
            {lead.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <svg viewBox="0 0 16 16" className="size-7 text-muted-foreground/50 transition-colors hover:text-muted-foreground/70" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2.8" strokeLinecap="round" />
            <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.1" />
            <path d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        )}
      </PopoverTrigger>

      <PopoverContent side="right" align="start" sideOffset={6} className="w-60 gap-0 p-0">
        {/* No lead row */}
        <div className="px-1.5 pt-1.5">
          <button
            type="button"
            onClick={() => { setLead(null); setOpen(false) }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2.5" strokeLinecap="round" />
              <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.1" />
              <path d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            <span className="flex-1 text-left text-sm">No lead</span>
            {!lead && (
              <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-foreground" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="text-xs text-muted-foreground">0</span>
          </button>
        </div>

        {/* Users from the project */}
        <p className="px-3.5 pb-1 pt-3 text-xs text-muted-foreground">Users from the project ...</p>
        <div className="px-1.5 pb-1">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              selected={lead?.id === m.id}
              onSelect={() => { setLead(m); setOpen(false); setSearch("") }}
            />
          ))}
        </div>

        {/* New user section */}
        <div className="border-t border-border/60" />
        <p className="px-3.5 pb-1 pt-2.5 text-xs text-muted-foreground">New user</p>
        <div className="px-1.5 pb-2">
          <button
            type="button"
            onClick={() => { setOpen(false); setInviteOpen(true) }}
            className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground" fill="none">
              <path d="M13 3L3 7.5l4 1.5M13 3l-5.5 6M13 3L7.5 8.5l1.5 4.5L13 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-foreground">Invite and add...</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>

    {/* Invite dialog */}
    {inviteOpen && typeof window !== "undefined" && createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
        onClick={() => setInviteOpen(false)}
      >
        <div
          className="w-[480px] rounded-2xl bg-[oklch(0.17_0_0)] p-6 shadow-2xl ring-1 ring-white/8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white">
              AB
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">Invite &amp; add to project</span>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Email field */}
          <label className="mb-1.5 block text-sm text-foreground">Email</label>
          <input
            autoFocus
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@gmail.com"
            className="w-full rounded-lg border border-blue-500 bg-[oklch(0.22_0_0)] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />

          {/* Footer */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Invite and assign
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}

const MONTH_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
const PX_PER_DAY = 4

function TimelineView({ projects, members }: { projects: Project[]; members: Member[] }) {
  const router = useRouter()
  const today = new Date()
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<"Year" | "Quarter" | "Month" | "Week">("Year")
  const [zoomOpen, setZoomOpen] = useState(false)
  const [cursorX, setCursorX] = useState<number | null>(null)

  // Timeline: Jan 1 1943 → 3 years from now (fixed range, never changes)
  const START_MS = new Date(1943, 0, 1).getTime()
  const END_MS   = new Date(today.getFullYear() + 3, 11, 31).getTime()
  const totalDays  = Math.round((END_MS - START_MS) / 86400000)
  const totalWidth = totalDays * PX_PER_DAY

  function dayX(date: Date) {
    return Math.round((date.getTime() - START_MS) / 86400000) * PX_PER_DAY
  }

  const todayX = dayX(today)

  // Build month segments — memoized
  const months = useMemo(() => {
    const result: { label: string; year: number; x: number; width: number }[] = []
    let d = new Date(1943, 0, 1)
    const end = new Date(today.getFullYear() + 3, 11, 31)
    while (d < end) {
      const m = d.getMonth(), y = d.getFullYear()
      const mStartMs = new Date(y, m, 1).getTime()
      const mEndMs   = new Date(y, m + 1, 1).getTime()
      const x = Math.round((mStartMs - START_MS) / 86400000) * PX_PER_DAY
      const w = Math.round((Math.min(mEndMs, END_MS) - mStartMs) / 86400000) * PX_PER_DAY
      result.push({ label: MONTH_ABBR[m], year: y, x, width: w })
      d = new Date(y, m + 1, 1)
    }
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.getFullYear()])

  // Build bi-weekly date ticks — memoized
  const ticks = useMemo(() => {
    const result: { label: string; x: number; isToday: boolean }[] = []
    const todayStr = today.toDateString()
    months.forEach(({ year, label: _l }) => {
      const m = MONTH_ABBR.indexOf(_l)
      ;[1, 15].forEach((day) => {
        const tickDate = new Date(year, m, day)
        const tx = Math.round((tickDate.getTime() - START_MS) / 86400000) * PX_PER_DAY
        if (tx < 0 || tx > totalWidth) return
        result.push({ label: String(day), x: tx, isToday: tickDate.toDateString() === todayStr })
      })
    })
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months])

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const offset = todayX - scrollRef.current.clientWidth / 2
      scrollRef.current.scrollLeft = offset
      if (headerRef.current) headerRef.current.scrollLeft = offset
    }
  }, [todayX])

  function scrollToToday() {
    if (scrollRef.current) {
      const offset = todayX - scrollRef.current.clientWidth / 2
      scrollRef.current.scrollLeft = offset
      if (headerRef.current) headerRef.current.scrollLeft = offset
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top controls */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-b px-4 py-2">
        <button
          type="button"
          onClick={scrollToToday}
          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
        >
          Today
        </button>
        <Popover open={zoomOpen} onOpenChange={setZoomOpen}>
          <PopoverTrigger render={
            <button type="button" className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent" />
          }>
            {zoom}
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" sideOffset={6} className="w-44 gap-0 p-1">
            {(["Year", "Quarter", "Month", "Week"] as const).map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => { setZoom(opt); setZoomOpen(false) }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent text-foreground"
              >
                <span className="flex-1 text-left">{opt}</span>
                {zoom === opt && (
                  <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-foreground" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <kbd className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {["Y", "Q", "M", "W"][i]}
                </kbd>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Fixed date header bar (synced with scroll, full-width, no spacer div) ── */}
      <div
        ref={headerRef}
        className="no-scrollbar relative shrink-0 overflow-x-hidden border-b border-border/40"
        style={{ height: 56 }}
      >
        {/* Content is 256 + totalWidth wide — cells are offset by 256 so they align with the canvas */}
        <div style={{ width: 256 + totalWidth, height: 56, position: "relative" }}>
          {/* Left column overlay — covers the first 256px with bg so month labels don't bleed under the project list */}
          <div className="absolute inset-y-0 left-0 z-10 bg-background" style={{ width: 256 }} />
          {/* Month cells — offset x by 256 */}
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 flex items-center border-b border-r border-border/40 px-2"
              style={{ left: m.x + 256, width: m.width, height: 28 }}
            >
              <span className="text-[11px] font-medium text-muted-foreground">
                {m.label}{m.year !== today.getFullYear() ? ` ${m.year}` : ""}
              </span>
            </div>
          ))}
          {/* Today indicator in month row */}
          <div
            className="pointer-events-none absolute top-0 z-10 border-l border-blue-500/60"
            style={{ left: todayX + 256, height: 28 }}
          />
          {/* Date tick cells — offset x by 256 */}
          <div className="absolute border-b border-border/40" style={{ top: 28, left: 256, right: 0, height: 28 }}>
            {ticks.map((t, i) => (
              <div
                key={i}
                className="absolute top-0 flex h-full items-center"
                style={{ left: t.x }}
              >
                {t.isToday ? (
                  <span className="flex h-5 items-center rounded bg-blue-600 px-1.5 text-[11px] font-semibold text-white -translate-x-1/2">
                    {MONTH_ABBR[today.getMonth()]} {today.getDate()}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground -translate-x-1/2">{t.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main scroll area: left panel + timeline canvas ── */}
      <div
        ref={scrollRef}
        className="flex flex-1 overflow-x-auto overflow-y-hidden"
        onScroll={(e) => {
          if (headerRef.current) headerRef.current.scrollLeft = e.currentTarget.scrollLeft
        }}
        onMouseMove={(e) => {
          const rect = scrollRef.current?.getBoundingClientRect()
          if (rect) setCursorX(e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0))
        }}
        onMouseLeave={() => setCursorX(null)}
      >
        {/* Inner canvas: left col (256px) + timeline */}
        <div style={{ width: 256 + totalWidth, minHeight: "100%" }} className="relative flex">

          {/* ── Sticky left column — NO spacer, rows start at top ── */}
          <div className="sticky left-0 z-30 flex w-64 shrink-0 flex-col bg-background border-r border-border/40">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex h-10 shrink-0 items-center gap-2 border-b border-border/40 px-3 hover:bg-accent/40 transition-colors"
              >
                <HugeiconsIcon icon={CubeIcon} className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm font-medium">{project.name}</span>
                <button
                  type="button"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 16 16" className="size-3.5 text-muted-foreground/80" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
                  </svg>
                  <svg viewBox="0 0 16 16" className="size-3.5 text-orange-400" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <PriorityPicker />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <TimelineLeadPicker members={members} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Timeline canvas — no header rows, bars start at top ── */}
          <div
            style={{ width: totalWidth, height: Math.max(projects.length * 40, 200) }}
            className="relative shrink-0"
          >
            {/* Project bar rows */}
            {projects.map((project, pi) => {
              const startX = project.createdAt ? dayX(new Date(project.createdAt)) : null
              const endX   = project.targetDate ? dayX(new Date(project.targetDate)) : null
              const barX   = startX ?? 0
              const barW   = endX && startX ? Math.max(endX - startX, 20) : 0

              return (
                <div
                  key={project.id}
                  className="absolute border-b border-border/20 hover:bg-accent/20 transition-colors"
                  style={{ top: pi * 40, left: 0, width: totalWidth, height: 40 }}
                >
                  {barW > 0 && (
                    <div
                      className="absolute top-1/2 flex h-6 -translate-y-1/2 cursor-pointer items-center gap-1.5 overflow-hidden rounded-full bg-violet-600/80 px-2.5 hover:bg-violet-600 transition-colors"
                      style={{ left: barX, width: barW }}
                    >
                      <HugeiconsIcon icon={CubeIcon} className="size-3 shrink-0 text-white/70" />
                      <span className="truncate text-[11px] font-medium leading-none text-white/90">{project.name}</span>
                    </div>
                  )}
                  {barW === 0 && (
                    <div
                      className="absolute top-1/2 flex h-5 -translate-y-1/2 cursor-pointer items-center gap-1 rounded-full border border-dashed border-muted-foreground/20 px-2 text-[11px] text-muted-foreground/40 opacity-0 hover:opacity-100 transition-opacity"
                      style={{ left: todayX }}
                    >
                      <svg viewBox="0 0 10 10" className="size-2.5" fill="none">
                        <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Add dates
                    </div>
                  )}
                </div>
              )
            })}

            {/* Today line */}
            <div className="pointer-events-none absolute top-0 z-20 h-full border-l border-blue-500/60" style={{ left: todayX }} />

            {/* Cursor hover line */}
            {cursorX !== null && (() => {
              const daysOffset = (cursorX - 256) / PX_PER_DAY
              const hoverDate = new Date(START_MS + daysOffset * 86400000)
              const hoverLabel = `${MONTH_ABBR[hoverDate.getMonth()]} ${hoverDate.getDate()}`
              return (
                <div
                  className="pointer-events-none absolute top-0 z-20 h-full"
                  style={{ left: cursorX - 256 }}
                >
                  <div className="absolute flex -translate-x-1/2 items-center" style={{ top: 4 }}>
                    <span className="flex h-5 items-center whitespace-nowrap rounded bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                      {hoverLabel}
                    </span>
                  </div>
                  <div className="h-full w-px bg-muted-foreground/25" />
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

const BOARD_COLUMNS = [
  {
    key: "backlog",
    label: "Backlog",
    icon: (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-muted-foreground/60" />
      </svg>
    ),
  },
  {
    key: "planned",
    label: "Planned",
    icon: (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground/60" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-orange-400" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "completed",
    label: "Completed",
    icon: (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-blue-500" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const

function BoardView({
  projects, members, statsByProject, onCreateProject,
}: {
  projects: Project[]
  members: Member[]
  statsByProject: Map<string, number>
  onCreateProject: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-4">
      {BOARD_COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => {
          if (col.key === "backlog") return p.status === "cancelled" || !["planned", "in_progress", "completed"].includes(p.status as string)
          return p.status === col.key
        })

        return (
          <div key={col.key} className="flex w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-muted/20">
            {/* Column header */}
            <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
              {col.icon}
              <span className="flex-1 text-sm font-medium text-foreground">{col.label}</span>
              <span className="text-xs text-muted-foreground">{colProjects.length}</span>
              <button type="button" className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
                  <circle cx="2" cy="6" r="1" /><circle cx="6" cy="6" r="1" /><circle cx="10" cy="6" r="1" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onCreateProject}
                className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-1.5 p-2">
              {colProjects.map((project) => {
                const pct = statsByProject.get(project.id) ?? 0
                return (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2 text-sm transition-colors hover:bg-accent/40"
                  >
                    <HugeiconsIcon icon={CubeIcon} className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate font-medium">{project.name}</span>
                    <button type="button" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                      <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
                        <circle cx="2" cy="6" r="1" /><circle cx="6" cy="6" r="1" /><circle cx="10" cy="6" r="1" />
                      </svg>
                    </button>
                    <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-orange-400" fill="none">
                      <circle cx="8" cy="8" r={6} stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )
              })}

              {/* Add card button */}
              <button
                type="button"
                onClick={onCreateProject}
                className="flex w-full items-center justify-center rounded-lg border border-dashed border-border/40 py-2 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-accent/30 hover:text-foreground"
              >
                <svg viewBox="0 0 12 12" className="mr-1 size-3" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add project
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SortHeader({
  label, col, sortBy, sortDir, onSort, className = "",
}: {
  label: string
  col: string
  sortBy: string | null
  sortDir: "asc" | "desc"
  onSort: (col: string) => void
  className?: string
}) {
  const active = sortBy === col
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className={`flex items-center gap-0.5 rounded transition-colors hover:text-foreground ${
        active
          ? "rounded-full bg-accent px-2 py-0.5 text-foreground"
          : "text-muted-foreground"
      } ${className}`}
    >
      {label}
      {active && (
        <span className="ml-0.5 text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  )
}

function ProjectIconPicker() {
  return (
    <IconPickerPopover
      stopPropagation
      defaultIcon={CubeIcon}
      defaultColorId="gray"
      trigger={
        <HugeiconsIcon icon={CubeIcon} className="size-4 shrink-0 text-muted-foreground" />
      }
    />
  )
}

function TimelineLeadPicker({ members }: { members: Member[] }) {
  const [open, setOpen] = useState(false)
  const [lead, setLead] = useState<Member | null>(null)
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const displayInitials = lead
    ? lead.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "HV"

  return (
    <>
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch("") }}>
        <PopoverTrigger render={
          <button
            type="button"
            className="rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground/70 hover:bg-accent transition-colors"
          />
        }>
          {displayInitials}
        </PopoverTrigger>

        <PopoverContent side="bottom" align="end" sideOffset={4} className="w-72 gap-0 p-0">
          {/* Search / header */}
          <div className="flex items-center border-b px-3 py-2.5">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Set lead..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">P</kbd>
              <span>then</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">A</kbd>
            </div>
          </div>

          {/* No lead */}
          <div className="px-1.5 pt-1.5">
            <button
              type="button"
              onClick={() => { setLead(null); setOpen(false) }}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2.5" strokeLinecap="round" />
                <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.1" />
                <path d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <span className="flex-1 text-left text-sm">No lead</span>
              {!lead && (
                <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-foreground" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span className="text-xs text-muted-foreground">0</span>
            </button>
          </div>

          {/* Invited user placeholder row */}
          <div className="px-1.5 pt-1 pb-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border/60 text-[9px] font-semibold text-muted-foreground">
                HV
              </div>
              <span className="flex-1 truncate text-left text-sm text-foreground">hvkvkvk@234234gmail.com</span>
              <span className="shrink-0 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Invited
              </span>
              <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-foreground" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Users from project team */}
          <p className="px-3.5 pb-1 pt-2 text-xs text-muted-foreground">Users from the project team</p>
          <div className="px-1.5 pb-1">
            {filtered.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                selected={lead?.id === m.id}
                onSelect={() => { setLead(m); setOpen(false); setSearch("") }}
              />
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground">No members found</p>
            )}
          </div>

          {/* New user */}
          <div className="border-t border-border/60" />
          <p className="px-3.5 pb-1 pt-2.5 text-xs text-muted-foreground">New user</p>
          <div className="px-1.5 pb-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setInviteOpen(true) }}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground" fill="none">
                <path d="M13 3L3 7.5l4 1.5M13 3l-5.5 6M13 3L7.5 8.5l1.5 4.5L13 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-foreground">Invite and add...</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Invite dialog */}
      {inviteOpen && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          onClick={() => setInviteOpen(false)}
        >
          <div
            className="w-[480px] rounded-2xl bg-[oklch(0.17_0_0)] p-6 shadow-2xl ring-1 ring-white/8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white">
                AB
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">Invite &amp; add to project</span>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <label className="mb-1.5 block text-sm text-foreground">Email</label>
            <input
              autoFocus
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@gmail.com"
              className="w-full rounded-lg border border-blue-500 bg-[oklch(0.22_0_0)] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Invite and assign
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

const PRIORITIES = [
  { value: "none",   label: "No priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
]

function PriorityTriggerIcon({ value }: { value: string }) {
  if (value === "none") return (
    <span className="flex items-center gap-[2px] text-muted-foreground/80">
      <span className="block size-[3px] rounded-full bg-current" />
      <span className="block size-[3px] rounded-full bg-current" />
      <span className="block size-[3px] rounded-full bg-current" />
    </span>
  )
  return <PriorityMenuIcon value={value} className="size-4" />
}

function PriorityMenuIcon({ value, className = "size-4" }: { value: string; className?: string }) {
  if (value === "none") return (
    <svg viewBox="0 0 16 16" className={`${className} text-muted-foreground`} fill="none">
      <path d="M3 5h2M7 5h2M11 5h2M3 8h2M7 8h2M11 8h2M3 11h2M7 11h2M11 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
  if (value === "urgent") return (
    <svg viewBox="0 0 16 16" className={`${className} text-red-500`} fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
  if (value === "high") return (
    <svg viewBox="0 0 16 16" className={`${className} text-muted-foreground`} fill="currentColor">
      <rect x="1.5" y="7" width="3" height="7" rx="1" />
      <rect x="6.5" y="4" width="3" height="10" rx="1" />
      <rect x="11.5" y="1" width="3" height="13" rx="1" />
    </svg>
  )
  if (value === "medium") return (
    <svg viewBox="0 0 16 16" className={`${className} text-muted-foreground`} fill="currentColor">
      <rect x="1.5" y="7" width="3" height="7" rx="1" />
      <rect x="6.5" y="4" width="3" height="10" rx="1" />
      <rect x="11.5" y="1" width="3" height="13" rx="1" opacity="0.3" />
    </svg>
  )
  if (value === "low") return (
    <svg viewBox="0 0 16 16" className={`${className} text-muted-foreground`} fill="currentColor">
      <rect x="1.5" y="7" width="3" height="7" rx="1" />
      <rect x="6.5" y="4" width="3" height="10" rx="1" opacity="0.3" />
      <rect x="11.5" y="1" width="3" height="13" rx="1" opacity="0.3" />
    </svg>
  )
  return null
}

function PriorityPicker() {
  const [open, setOpen] = useState(false)
  const [priority, setPriority] = useState("none")

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<button type="button" className="flex items-center justify-start px-1 py-1 rounded hover:bg-accent" />}
        >
          <PriorityTriggerIcon value={priority} />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" sideOffset={4} className="w-60 gap-0 p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs text-muted-foreground">Change priority...</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">P</kbd>
              <span>then</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">P</kbd>
            </div>
          </div>
          {/* Options */}
          {PRIORITIES.map((p, i) => (
            <button
              key={p.value}
              type="button"
              onClick={() => { setPriority(p.value); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <PriorityMenuIcon value={p.value} />
              <span className="flex-1 text-left text-sm">{p.label}</span>
              {priority === p.value && (
                <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-foreground" fill="none">
                  <path d="M3 8l3 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span className="ml-auto text-xs text-muted-foreground">{i}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ProgressCircle({ pct }: { pct: number }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-orange-400">
      <circle cx="8" cy="8" r={6} fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="1 2.5" strokeLinecap="round" />
    </svg>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const DATE_TABS = ["Day", "Month", "Quarter", "Half-year", "Year"] as const
type DateTab = typeof DATE_TABS[number]
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAY_HEADERS = ["Mo","Tu","We","Th","Fr","Sa","Su"]

function parseDateInput(raw: string): Date | null {
  const s = raw.trim()
  if (!s) return null
  // DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (slashMatch) {
    const d = new Date(+slashMatch[3], +slashMatch[2] - 1, +slashMatch[1])
    if (!isNaN(d.getTime())) return d
  }
  // "May 2027" or "May, 2027"
  const monthYear = s.match(/^([a-z]+)[,\s]+(\d{4})$/i)
  if (monthYear) {
    const m = MONTH_NAMES.findIndex(n => n.toLowerCase().startsWith(monthYear[1].toLowerCase()))
    if (m !== -1) return new Date(+monthYear[2], m, 1)
  }
  // Q1–Q4 [year]
  const quarter = s.match(/^Q([1-4])(?:\s+(\d{4}))?$/i)
  if (quarter) {
    const yr = quarter[2] ? +quarter[2] : new Date().getFullYear()
    return new Date(yr, (+quarter[1] - 1) * 3, 1)
  }
  return null
}

function buildDayGrid(year: number, month: number): Date[] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Date[] = []
  for (let i = firstDow - 1; i >= 0; i--) cells.push(new Date(year, month, -i))
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  let next = 1
  while (cells.length < 42) cells.push(new Date(year, month + 1, next++))
  return cells
}

function DatePickerPopover() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date | null>(null)
  const [view, setView] = useState(() => new Date())
  const [activeTab, setActiveTab] = useState<DateTab>("Day")
  const [inputValue, setInputValue] = useState("")

  const year = view.getFullYear()
  const month = view.getMonth()
  const cells = buildDayGrid(year, month)

  const today = new Date()
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const isCurrentMonth = (d: Date) => d.getMonth() === month

  function handleInput(val: string) {
    setInputValue(val)
    const parsed = parseDateInput(val)
    if (parsed) setView(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
  }

  function selectDay(d: Date) {
    setSelected(d)
    setInputValue(d.toLocaleDateString("en-GB").replace(/\//g, "/"))
    setOpen(false)
  }

  function selectMonth(m: number, y: number = year) {
    const d = new Date(y, m, 1)
    setSelected(d)
    setView(d)
    setInputValue(`${MONTH_NAMES[m]} ${y}`)
    setActiveTab("Day")
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<button type="button" className="flex items-center gap-1.5" />}
        >
          {selected ? (
            <span className="text-xs text-muted-foreground">
              {selected.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          ) : (
            <HugeiconsIcon icon={CalendarAdd01Icon} className="size-4 text-muted-foreground/40" />
          )}
        </PopoverTrigger>

        <PopoverContent side="bottom" align="start" sideOffset={4} className="w-[300px] gap-0 p-0">
          {/* Header: label + input */}
          <div className="px-4 pt-4 pb-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Target date</p>
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Try: May 2027, Q4, 20/05/2027"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1.5 border-b px-4 pb-3">
            {DATE_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === t
                    ? "bg-zinc-700 text-foreground"
                    : "text-muted-foreground ring-1 ring-border/60 hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Day view */}
          {activeTab === "Day" && (
            <div className="p-4">
              {/* Month nav */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{MONTH_NAMES[month]} {year}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setView(new Date(year, month - 1, 1))}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => setView(new Date(year, month + 1, 1))}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7">
                {DAY_HEADERS.map((h) => (
                  <div key={h} className="flex items-center justify-center text-[11px] text-muted-foreground">{h}</div>
                ))}
              </div>
              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {cells.map((d, i) => (
                  <button key={i} type="button" onClick={() => selectDay(d)}
                    className={[
                      "mx-auto flex size-8 items-center justify-center rounded-full text-xs transition-colors",
                      !isCurrentMonth(d) ? "text-muted-foreground/30 hover:bg-accent/30" : "text-foreground hover:bg-accent",
                      isToday(d) && !( selected && isSameDay(d, selected)) ? "ring-1 ring-muted-foreground/50" : "",
                      selected && isSameDay(d, selected) ? "!bg-foreground !text-background" : "",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Month view — multi-year, 3-col grid */}
          {activeTab === "Month" && (
            <div className="max-h-72 overflow-auto px-4 py-3">
              {Array.from({length: 3}, (_, i) => year + i).map((y) => (
                <div key={y} className="mb-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{y}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTH_SHORT.map((m, mi) => {
                      const isSel = selected && selected.getMonth() === mi && selected.getFullYear() === y
                      return (
                        <button key={m} type="button" onClick={() => selectMonth(mi, y)}
                          className={`rounded-xl border py-2.5 text-xs font-medium transition-colors hover:bg-accent/60 ${
                            isSel ? "border-foreground/40 bg-foreground/10 text-foreground" : "border-border text-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quarter view — multi-year, 4-col grid */}
          {activeTab === "Quarter" && (
            <div className="max-h-72 overflow-auto px-4 py-3">
              {Array.from({length: 3}, (_, i) => year + i).map((y) => (
                <div key={y} className="mb-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{y}</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1,2,3,4].map((q) => {
                      const isSel = selected && selected.getFullYear() === y &&
                        Math.floor(selected.getMonth() / 3) === q - 1
                      return (
                        <button key={q} type="button"
                          onClick={() => { setSelected(new Date(y, (q-1)*3, 1)); setInputValue(`Q${q} ${y}`); setOpen(false) }}
                          className={`rounded-xl border py-2.5 text-xs font-medium transition-colors hover:bg-accent/60 ${
                            isSel ? "border-foreground/40 bg-foreground/10 text-foreground" : "border-border text-foreground"
                          }`}
                        >
                          Q{q}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Half-year view — multi-year, 2-col grid */}
          {activeTab === "Half-year" && (
            <div className="max-h-72 overflow-auto px-4 py-3">
              {Array.from({length: 3}, (_, i) => year + i).map((y) => (
                <div key={y} className="mb-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{y}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([{label:"H1", start:0},{label:"H2", start:6}] as const).map((h) => {
                      const isSel = selected && selected.getFullYear() === y &&
                        (h.start === 0 ? selected.getMonth() < 6 : selected.getMonth() >= 6)
                      return (
                        <button key={h.label} type="button"
                          onClick={() => { setSelected(new Date(y, h.start, 1)); setInputValue(`${h.label} ${y}`); setOpen(false) }}
                          className={`rounded-xl border py-2.5 text-xs font-medium transition-colors hover:bg-accent/60 ${
                            isSel ? "border-foreground/40 bg-foreground/10 text-foreground" : "border-border text-foreground"
                          }`}
                        >
                          {h.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Year view — single full-width column */}
          {activeTab === "Year" && (
            <div className="max-h-72 overflow-auto px-4 py-3">
              <div className="flex flex-col gap-1.5">
                {Array.from({length: 8}, (_, i) => year + i).map((y) => {
                  const isSel = selected && selected.getFullYear() === y
                  return (
                    <button key={y} type="button"
                      onClick={() => { setSelected(new Date(y, 0, 1)); setInputValue(`${y}`); setOpen(false) }}
                      className={`w-full rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-accent/60 ${
                        isSel ? "border-foreground/40 bg-foreground/10 text-foreground" : "border-border text-foreground"
                      }`}
                    >
                      {y}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

const FILTER_OPTIONS = [
  { label: "Status",   icon: "○" },
  { label: "Priority", icon: "⚑" },
  { label: "Lead",     icon: "◎" },
  { label: "Member",   icon: "◉" },
  { label: "Label",    icon: "⬡" },
  { label: "Target date", icon: "▦" },
  { label: "Health",   icon: "♡" },
]

function FilterPopover() {
  const [search, setSearch] = useState("")
  const [active, setActive] = useState<string[]>([])

  const filtered = FILTER_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          />
        }
      >
        <HugeiconsIcon icon={FilterHorizontalIcon} className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={6} className="w-64 gap-0 p-0">
        {active.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5 px-2.5 pt-2.5">
              {active.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => setActive((p) => p.filter((x) => x !== a))}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 border-t border-border/60" />
          </>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 px-2.5 py-2">
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-muted-foreground" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="border-t border-border/60" />

        {/* Filter options */}
        <div className="py-1">
          {filtered.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() =>
                setActive((p) =>
                  p.includes(opt.label) ? p.filter((x) => x !== opt.label) : [...p, opt.label]
                )
              }
              className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors hover:bg-accent ${
                active.includes(opt.label) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="text-sm">{opt.icon}</span>
              <span>{opt.label}</span>
              {active.includes(opt.label) && (
                <svg viewBox="0 0 16 16" className="ml-auto size-3 text-foreground" fill="currentColor">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">No filters found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const GROUPING_OPTIONS = [
  "No grouping", "Lead", "Member", "Status", "Priority",
  "Label", "Team", "Health", "Start date", "Target date",
]
const ORDERING_OPTIONS = [
  "Manual", "Name", "Status", "Priority",
  "Updated", "Created", "Health updated", "Start date", "Target date",
]
const SHOW_CLOSED_OPTIONS = [
  "None", "Past week", "Past month",
  "Past 3 months", "Past 6 months", "All",
]

function InlineSelectPopover({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button
          type="button"
          className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
        />
      }>
        {value}
        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={4} className="w-52 gap-0 p-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => { onChange(opt); setOpen(false) }}
            className="flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <span>{opt}</span>
            {value === opt && (
              <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-foreground" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

const ALL_DISPLAY_PROPS = [
  "Milestones", "Description", "Priority", "Status",
  "Health", "Teams", "Lead", "Members",
  "Dependencies", "Start date", "Target date", "Created",
  "Updated", "Completed", "Labels",
]
const DEFAULT_ACTIVE = new Set(["Milestones", "Priority", "Status", "Health", "Lead", "Target date"])

const TIMELINE_PROPS = ["Milestones", "Priority", "Status", "Health", "Lead", "Members", "Dependencies", "Predictions"]
const DEFAULT_TIMELINE_ACTIVE = new Set(["Milestones", "Priority", "Status", "Health", "Lead", "Dependencies", "Predictions"])
const COLUMNS_OPTIONS = ["Status", "Priority", "Lead", "Label"]

function SimpleToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-muted-foreground/30"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`}
      />
    </button>
  )
}

function DisplayPopover({ viewType, setViewType }: { viewType: "list" | "board" | "timeline"; setViewType: (v: "list" | "board" | "timeline") => void }) {
  const [grouping, setGrouping] = useState("No grouping")
  const [ordering, setOrdering] = useState("Manual")
  const [showClosed, setShowClosed] = useState("All")
  const [activeProps, setActiveProps] = useState<Set<string>>(new Set(DEFAULT_ACTIVE))
  const [showProjectList, setShowProjectList] = useState(true)
  const [showWeekNumbers, setShowWeekNumbers] = useState(false)
  const [timelineProps, setTimelineProps] = useState<Set<string>>(new Set(DEFAULT_TIMELINE_ACTIVE))
  // Board-specific
  const [columns, setColumns] = useState("Status")
  const [boardRows, setBoardRows] = useState("No grouping")
  const [showEmptyColumns, setShowEmptyColumns] = useState(true)

  function toggleProp(prop: string) {
    setActiveProps((prev) => {
      const next = new Set(prev)
      next.has(prop) ? next.delete(prop) : next.add(prop)
      return next
    })
  }

  function toggleTimelineProp(prop: string) {
    setTimelineProps((prev) => {
      const next = new Set(prev)
      next.has(prop) ? next.delete(prop) : next.add(prop)
      return next
    })
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          />
        }
      >
        <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={6} className="w-80 gap-0 p-0">

        {/* View type tabs */}
        <div className="flex gap-1.5 p-2.5 pb-2">
          {(["list", "board", "timeline"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewType(v)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors ${
                viewType === v ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {v === "list" && <svg viewBox="0 0 16 16" className="size-3.5" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>}
              {v === "board" && <svg viewBox="0 0 16 16" className="size-3.5" fill="none"><rect x="2" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="7" y="2" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="12" y="2" width="2" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>}
              {v === "timeline" && <svg viewBox="0 0 16 16" className="size-3.5" fill="none"><path d="M2 5h5M2 8h9M2 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><rect x="8" y="3.5" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="border-t border-border/60" />

        {/* Grouping / Ordering rows — differ by view */}
        <div className="flex flex-col px-2.5 py-2">
          {viewType === "board" ? (
            <>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-muted-foreground">Columns</span>
                <InlineSelectPopover value={columns} options={COLUMNS_OPTIONS} onChange={setColumns} />
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-muted-foreground">Rows</span>
                <InlineSelectPopover value={boardRows} options={GROUPING_OPTIONS} onChange={setBoardRows} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Grouping</span>
              <InlineSelectPopover value={grouping} options={GROUPING_OPTIONS} onChange={setGrouping} />
            </div>
          )}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">Ordering</span>
            <div className="flex items-center gap-1.5">
              <button type="button" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <path d="M5 3v10M2 10l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 6h5M9 9h4M9 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
              <InlineSelectPopover value={ordering} options={ORDERING_OPTIONS} onChange={setOrdering} />
            </div>
          </div>
        </div>

        <div className="border-t border-border/60" />

        <div className="flex items-center justify-between px-2.5 py-2.5">
          <span className="text-xs text-muted-foreground">Show closed projects</span>
          <InlineSelectPopover value={showClosed} options={SHOW_CLOSED_OPTIONS} onChange={setShowClosed} />
        </div>

        <div className="border-t border-border/60" />

        {viewType === "timeline" ? (
          <>
            <div className="px-2.5 py-3">
              <p className="mb-3 text-[11px] font-medium text-muted-foreground">Timeline options</p>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Show project list</span>
                  <SimpleToggle checked={showProjectList} onChange={setShowProjectList} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Show week numbers</span>
                  <SimpleToggle checked={showWeekNumbers} onChange={setShowWeekNumbers} />
                </div>
              </div>
            </div>
            <div className="border-t border-border/60" />
            <div className="px-2.5 py-2.5">
              <p className="mb-2 text-[11px] text-muted-foreground">Display properties</p>
              <div className="flex flex-wrap gap-1.5">
                {TIMELINE_PROPS.map((prop) => (
                  <button key={prop} type="button" onClick={() => toggleTimelineProp(prop)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      timelineProps.has(prop) ? "bg-muted text-foreground" : "bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted/40"
                    }`}>{prop}</button>
                ))}
              </div>
            </div>
          </>
        ) : viewType === "board" ? (
          <>
            {/* Board options */}
            <div className="px-2.5 py-3">
              <p className="mb-3 text-[11px] font-medium text-muted-foreground">Board options</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Show empty columns</span>
                <SimpleToggle checked={showEmptyColumns} onChange={setShowEmptyColumns} />
              </div>
            </div>
            <div className="border-t border-border/60" />
            <div className="px-2.5 py-2.5">
              <p className="mb-2 text-[11px] text-muted-foreground">Display properties</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DISPLAY_PROPS.map((prop) => (
                  <button key={prop} type="button" onClick={() => toggleProp(prop)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      activeProps.has(prop) ? "bg-muted text-foreground" : "bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted/40"
                    }`}>{prop}</button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* List options */
          <div className="px-2.5 py-2.5">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">List options</p>
            <p className="mb-2 text-[11px] text-muted-foreground">Display properties</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DISPLAY_PROPS.map((prop) => (
                <button key={prop} type="button" onClick={() => toggleProp(prop)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    activeProps.has(prop) ? "bg-muted text-foreground" : "bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted/40"
                  }`}>{prop}</button>
              ))}
              <button type="button" className="rounded-full px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-dashed ring-border hover:bg-muted/40">
                Add label group...
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-5 border-t border-border/60 px-3 py-2.5">
          <button type="button" className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors">
            Reset
          </button>
          <button type="button" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
            Set default for everyone
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
