"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserProfileCard } from "@/components/user-profile-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ArchivedGoal {
  id: string
  name: string
  description: string
  status: string
  progress: number
  targetDate: string
  owner: { name: string; initials: string }
  following: boolean
  archivedDate: string
}

const statusColors: Record<string, string> = {
  "ON TRACK": "bg-green-400 text-white",
  "AT RISK": "bg-yellow-300 text-yellow-900",
  "OFF TRACK": "bg-red-400 text-white",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
}

// Static archived goals (these represent goals that were moved to archive)
const initialArchivedGoals: ArchivedGoal[] = [
  { id: "arch-1", name: "Reduce customer churn by 15%", description: "Focus on improving retention through better onboarding flows and proactive support outreach.", status: "AT RISK", progress: 72, targetDate: "Sep 2026", owner: { name: "Abhishek Sharma", initials: "AS" }, following: true, archivedDate: "Mar 12, 2026" },
  { id: "arch-2", name: "Complete infrastructure migration to AWS", description: "Migrate all legacy on-prem services to AWS EKS with zero downtime.", status: "COMPLETED", progress: 100, targetDate: "Feb 2026", owner: { name: "Priya Patel", initials: "PP" }, following: true, archivedDate: "Feb 28, 2026" },
  { id: "arch-3", name: "Launch mobile app v2.0", description: "Ship redesigned mobile experience with offline mode and push notifications.", status: "CANCELLED", progress: 45, targetDate: "Jan 2026", owner: { name: "James Chen", initials: "JC" }, following: false, archivedDate: "Jan 15, 2026" },
]

// ─── Filter definitions ──────────────────────────────────────────────────────

const filterDefs = [
  { id: "tag", label: "# Filter by Tag", icon: <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></> },
  { id: "status", label: "Status", icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></> },
  { id: "owner", label: "Owner", icon: <><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></> },
  { id: "team", label: "Team", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { id: "following", label: "Following", icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> },
  { id: "starred", label: "Starred", icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></> },
  { id: "metric", label: "Metric", icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></> },
  { id: "reporting", label: "Reporting line", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></> },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ArchivedGoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<ArchivedGoal[]>(initialArchivedGoals)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("following")
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "group">("list")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null)
  const [teamFilter, setTeamFilter] = useState<string | null>(null)
  const [followingFilter, setFollowingFilter] = useState<boolean>(false)
  const [starredFilter, setStarredFilter] = useState<boolean>(false)
  const [reportingFilter, setReportingFilter] = useState<boolean>(true) // screenshot says "currently active"
  const [columns, setColumns] = useState([
    { id: "name", label: "Name", enabled: true, locked: true },
    { id: "status", label: "Status", enabled: true, locked: false },
    { id: "progress", label: "Progress", enabled: true, locked: false },
    { id: "target_date", label: "Target date", enabled: true, locked: false },
    { id: "owner", label: "Owner", enabled: true, locked: false },
    { id: "following", label: "Following", enabled: true, locked: false },
  ])
  const isColEnabled = (id: string) => columns.find(c => c.id === id)?.enabled ?? false

  const filteredGoals = goals
    .filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.owner.name.toLowerCase().includes(search.toLowerCase()))
    .filter((g) => !statusFilter || g.status === statusFilter)
    .filter((g) => !ownerFilter || g.owner.name === ownerFilter)
    .filter((g) => !followingFilter || g.following)
    .slice()
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir
      if (sortBy === "status") return a.status.localeCompare(b.status) * dir
      if (sortBy === "progress") return (a.progress - b.progress) * dir
      if (sortBy === "target date") return a.targetDate.localeCompare(b.targetDate) * dir
      if (sortBy === "following") return ((a.following === b.following) ? 0 : (a.following ? -1 : 1)) * dir
      return 0
    })

  const uniqueStatuses = [...new Set(goals.map(g => g.status))]
  const uniqueOwners = [...new Set(goals.map(g => g.owner.name))]

  const handleRestore = (id: string) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      setToast(`"${goal.name}" has been restored`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleDelete = (id: string) => {
    const goal = goals.find((g) => g.id === id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setDeleteConfirmId(null)
    if (goal) {
      setToast(`"${goal.name}" has been permanently deleted`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const clearFilters = () => {
    setStatusFilter(null)
    setOwnerFilter(null)
    setTeamFilter(null)
    setFollowingFilter(false)
    setStarredFilter(false)
    setSearch("")
  }

  const toggleFollow = (id: string) => {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, following: !g.following } : g))
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-background px-5 py-3 text-sm font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <svg className="size-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}

      {/* Title + Create goal */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Archived</h1>
        <button onClick={() => router.push("/goals")} className="text-sm text-muted-foreground hover:text-foreground">
          Create goal
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input placeholder="Search goals" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filterDefs.map((f) => {
          const icon = <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{f.icon}</svg>
          const baseClass = "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors"
          const activeClass = "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          const inactiveClass = "text-muted-foreground hover:bg-accent"

          if (f.id === "status") {
            return (
              <DropdownMenu key={f.id}>
                <DropdownMenuTrigger render={
                  <button className={`${baseClass} ${statusFilter ? activeClass : inactiveClass}`}>
                    {icon}{statusFilter ? `Status: ${statusFilter}` : "Status"}
                  </button>
                } />
                <DropdownMenuContent align="start" className="w-44">
                  {uniqueStatuses.map((s) => (
                    <DropdownMenuItem key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} className={statusFilter === s ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}>
                      {s}
                    </DropdownMenuItem>
                  ))}
                  {statusFilter && <DropdownMenuItem onClick={() => setStatusFilter(null)}>Clear</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          if (f.id === "owner") {
            return (
              <DropdownMenu key={f.id}>
                <DropdownMenuTrigger render={
                  <button className={`${baseClass} ${ownerFilter ? activeClass : inactiveClass}`}>
                    {icon}{ownerFilter ? `Owner: ${ownerFilter}` : "Owner"}
                  </button>
                } />
                <DropdownMenuContent align="start" className="w-48">
                  {uniqueOwners.map((o) => (
                    <DropdownMenuItem key={o} onClick={() => setOwnerFilter(ownerFilter === o ? null : o)} className={ownerFilter === o ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}>
                      {o}
                    </DropdownMenuItem>
                  ))}
                  {ownerFilter && <DropdownMenuItem onClick={() => setOwnerFilter(null)}>Clear</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          if (f.id === "team") {
            return (
              <button key={f.id} onClick={() => setTeamFilter(teamFilter ? null : "engineering")} className={`${baseClass} ${teamFilter ? activeClass : inactiveClass}`}>
                {icon}{f.label}
              </button>
            )
          }
          if (f.id === "following") {
            return (
              <button key={f.id} onClick={() => setFollowingFilter((v) => !v)} className={`${baseClass} ${followingFilter ? activeClass : inactiveClass}`}>
                {icon}{f.label}
              </button>
            )
          }
          if (f.id === "starred") {
            return (
              <button key={f.id} onClick={() => setStarredFilter((v) => !v)} className={`${baseClass} ${starredFilter ? activeClass : inactiveClass}`}>
                {icon}{f.label}
              </button>
            )
          }
          if (f.id === "reporting") {
            return (
              <button key={f.id} onClick={() => setReportingFilter((v) => !v)} className={`${baseClass} ${reportingFilter ? activeClass : inactiveClass}`}>
                {icon}{f.label}
              </button>
            )
          }
          // Fallback for tag/metric: act as DropdownMenu with "No options"
          return (
            <DropdownMenu key={f.id}>
              <DropdownMenuTrigger render={
                <button className={`${baseClass} ${inactiveClass}`}>
                  {icon}{f.label}
                </button>
              } />
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem disabled>No options</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </div>

      {/* Count + controls */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          {/* List / Group view toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode("list")}
              title="Display as list"
              className={`px-2 py-1 rounded-l-md border-r ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg className={`size-4 ${viewMode === "list" ? "text-blue-600" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="9" y1="18" x2="21" y2="18" /><circle cx="5" cy="6" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="5" cy="18" r="1" fill="currentColor" /></svg>
            </button>
            <button
              onClick={() => setViewMode("group")}
              title="Display as group"
              className={`px-2 py-1 rounded-r-md ${viewMode === "group" ? "bg-blue-50 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg className={`size-4 ${viewMode === "group" ? "text-blue-600" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="7" y1="12" x2="21" y2="12" /><line x1="11" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>

          {/* Sort by */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button
                onClick={() => { /* handled by DropdownMenu; also toggle asc/desc on double-open */ }}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
                title="Change list sorting"
              >
                Sort by {sortBy} <svg className="size-3.5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            } />
            <DropdownMenuContent align="end" className="w-44">
              {["following", "name", "status", "progress", "target date"].map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => { if (sortBy === s) setSortAsc((v) => !v); else { setSortBy(s); setSortAsc(true) } }}
                  className={sortBy === s ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Columns popover */}
          <Popover>
            <PopoverTrigger render={
              <button className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:bg-accent">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
                Columns
              </button>
            } />
            <PopoverContent align="end" className="w-56 p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">Columns</div>
              <div className="max-h-80 overflow-y-auto">
                {columns.map((col) => (
                  <div key={col.id} className="flex items-center justify-between px-2 py-1.5 text-sm">
                    <span>{col.label}</span>
                    {col.locked ? (
                      <svg className="size-4 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    ) : (
                      <button
                        onClick={() => setColumns((prev) => prev.map((c) => c.id === col.id ? { ...c, enabled: !c.enabled } : c))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${col.enabled ? "bg-blue-600" : "bg-muted"}`}
                      >
                        <span className={`size-4 rounded-full bg-white shadow-sm transition-transform ${col.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="rounded-md border px-1.5 py-1 text-muted-foreground hover:bg-accent">
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
              </button>
            } />
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/goals/settings")}>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      {filteredGoals.length > 0 ? (
        <div className="rounded-lg border">
          {/* Header */}
          <div className="grid grid-cols-[1fr_90px_120px_110px_70px_80px_auto] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            {isColEnabled("status") && <span>Status</span>}
            {isColEnabled("progress") && <span>Progress</span>}
            {isColEnabled("target_date") && <span>Target date</span>}
            {isColEnabled("owner") && <span>Owner</span>}
            {isColEnabled("following") && <span>Following</span>}
            <span />
          </div>

          {/* Rows */}
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => router.push(`/goals/${goal.id}`)}
              className="grid grid-cols-[1fr_90px_120px_110px_70px_80px_auto] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors group cursor-pointer"
            >
              {/* Name */}
              <div className="flex items-center gap-2 min-w-0">
                <svg className="size-4 text-muted-foreground/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="text-sm truncate hover:text-blue-600">{goal.name}</span>
              </div>
              {/* Status */}
              {isColEnabled("status") && (
                <div className="flex items-center gap-1">
                  <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">ARCHIVED</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColors[goal.status] ?? "bg-gray-200 text-gray-600"}`}>{goal.status}</span>
                </div>
              )}
              {/* Progress */}
              {isColEnabled("progress") && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-muted"><div className="h-full rounded-full bg-blue-500" style={{ width: `${goal.progress}%` }} /></div>
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                </div>
              )}
              {/* Target date */}
              {isColEnabled("target_date") && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {goal.targetDate}
                </div>
              )}
              {/* Owner */}
              {isColEnabled("owner") && (
                <div onClick={(e) => e.stopPropagation()}>
                  <UserProfileCard name={goal.owner.name} initials={goal.owner.initials} />
                </div>
              )}
              {/* Following */}
              {isColEnabled("following") && (
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFollow(goal.id)}
                    className="text-xs text-muted-foreground hover:text-blue-600 transition-colors"
                    title={goal.following ? "Unfollow" : "Follow"}
                  >
                    {goal.following ? "Following" : "—"}
                  </button>
                </div>
              )}
              {/* Actions — visible on hover */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button onClick={() => handleRestore(goal.id)} className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Restore goal">
                  Restore
                </button>
                <button onClick={() => setDeleteConfirmId(goal.id)} className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:hover:bg-red-900/20" title="Delete permanently">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state — matches real Jira */
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_90px_120px_110px_70px_80px] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Name</span><span>Status</span><span>Progress</span><span>Target date</span><span>Owner</span><span>Following</span>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Magnifying glass with X */}
            <div className="mb-6 rounded-lg border p-6">
              <svg className="size-20 text-muted-foreground/20" viewBox="0 0 100 100" fill="none">
                <circle cx="42" cy="42" r="28" stroke="currentColor" strokeWidth="4" />
                <line x1="62" y1="62" x2="85" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <line x1="32" y1="32" x2="52" y2="52" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="52" y1="32" x2="32" y2="52" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              We couldn&apos;t find any goals matching your search. Try changing your search criteria or{" "}
              <button onClick={clearFilters} className="text-blue-600 hover:underline">clear all filters</button>.
            </p>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete goal permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The goal and all its associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
