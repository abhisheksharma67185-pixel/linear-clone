"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const goalStatuses = [
  { value: "OFF TRACK", color: "bg-red-400 text-white" },
  { value: "AT RISK", color: "bg-yellow-300 text-yellow-900" },
  { value: "ON TRACK", color: "bg-green-400 text-white" },
  { value: "PENDING", color: "bg-gray-200 text-gray-700" },
  { value: "PAUSED", color: "bg-gray-200 text-gray-700" },
  { value: "COMPLETED", color: "bg-gray-200 text-gray-700" },
  { value: "CANCELLED", color: "bg-gray-200 text-gray-700" },
]

const owners = [
  { id: "1", name: "Abhishek Sharma", initials: "AS" },
]

const mockGoals = [
  {
    id: 1,
    name: "Increase platform uptime to 99.9%",
    status: "ON TRACK",
    progress: 72,
    targetDate: "Jun 2026",
    owner: { name: "Abhishek Sharma", initials: "AS" },
    following: true,
  },
  {
    id: 2,
    name: "Reduce customer churn by 15%",
    status: "AT RISK",
    progress: 38,
    targetDate: "Sep 2026",
    owner: { name: "Sam Williams", initials: "SW" },
    following: true,
  },
  {
    id: 3,
    name: "Launch mobile app v2.0",
    status: "ON TRACK",
    progress: 55,
    targetDate: "Jul 2026",
    owner: { name: "Jordan Lee", initials: "JL" },
    following: false,
  },
  {
    id: 4,
    name: "Migrate infrastructure to Kubernetes",
    status: "PENDING",
    progress: 10,
    targetDate: "Dec 2026",
    owner: { name: "Taylor Brown", initials: "TB" },
    following: false,
  },
  {
    id: 5,
    name: "Achieve SOC 2 Type II compliance",
    status: "AT RISK",
    progress: 45,
    targetDate: "Aug 2026",
    owner: { name: "Abhishek Sharma", initials: "AS" },
    following: true,
  },
  {
    id: 6,
    name: "Grow monthly active users to 50K",
    status: "OFF TRACK",
    progress: 22,
    targetDate: "Oct 2026",
    owner: { name: "Sam Williams", initials: "SW" },
    following: false,
  },
  {
    id: 7,
    name: "Reduce average API response time below 200ms",
    status: "DONE",
    progress: 100,
    targetDate: "Apr 2026",
    owner: { name: "Jordan Lee", initials: "JL" },
    following: true,
  },
  {
    id: 8,
    name: "Ship redesigned onboarding flow",
    status: "ON TRACK",
    progress: 68,
    targetDate: "May 2026",
    owner: { name: "Taylor Brown", initials: "TB" },
    following: true,
  },
]

type FilterType = "tag" | "status" | "owner" | "team" | "starred" | "metric" | "reporting" | null

const filterConfig = [
  {
    id: "tag" as const,
    label: "Tag is",
    btnLabel: "# Tag",
    placeholder: "Choose a tag",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  },
  {
    id: "status" as const,
    label: "Status is",
    btnLabel: "Status",
    placeholder: "Choose a status",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>,
  },
  {
    id: "owner" as const,
    label: "Owner is",
    btnLabel: "Owner",
    placeholder: "Choose an owner",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>,
  },
  {
    id: "team" as const,
    label: "Team is",
    btnLabel: "Team",
    placeholder: "Choose a team",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    id: "starred" as const,
    label: "Starred",
    btnLabel: "Starred",
    placeholder: "",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  {
    id: "metric" as const,
    label: "Metric is",
    btnLabel: "Metric",
    placeholder: "Choose a metric",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    id: "reporting" as const,
    label: "Reporting line for",
    btnLabel: "Reporting line",
    placeholder: "",
    icon: <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function InlineFilterDropdown({ filter, onClose }: { filter: typeof filterConfig[0]; onClose: () => void }) {
  const [search, setSearch] = useState("")

  if (filter.id === "reporting") {
    return (
      <div className="mt-2 w-[320px] rounded-lg border bg-background p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400">
            <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div className="my-1 h-6 w-px bg-muted-foreground/30" />
          <div className="flex items-end gap-6">
            <div className="size-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
            <div className="size-8 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700" />
            <div className="size-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" />
          </div>
        </div>
        <h3 className="mb-1 text-sm font-semibold">Stay across the projects your reports work on</h3>
        <p className="mb-4 text-xs text-muted-foreground">Connect your identity provider to get started</p>
        <Button variant="outline" size="sm" className="gap-1.5">
          Show me how
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </Button>
      </div>
    )
  }

  if (filter.id === "starred") {
    return null
  }

  return (
    <div className="mt-2 w-[260px] rounded-lg border bg-background p-3 shadow-sm">
      <div className="relative mb-2">
        <Input
          placeholder={filter.placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pr-9 border-2 border-blue-500"
          autoFocus
        />
        <svg className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filter.id === "status" ? (
          <div className="space-y-1">
            {goalStatuses
              .filter((s) => !search || s.value.toLowerCase().includes(search.toLowerCase()))
              .map((status) => (
                <button key={status.value} className="flex w-full items-center rounded-md px-2 py-1.5 text-left hover:bg-accent transition-colors">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${status.color}`}>{status.value}</span>
                </button>
              ))}
          </div>
        ) : filter.id === "owner" ? (
          <div className="space-y-1">
            {owners
              .filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase()))
              .map((owner) => (
                <button key={owner.id} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-accent transition-colors">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">{owner.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{owner.name}</span>
                </button>
              ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">No options</div>
        )}
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState(mockGoals)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [goalDesc, setGoalDesc] = useState("")
  const [goalType, setGoalType] = useState("Objective")
  const [goalTeam, setGoalTeam] = useState("Engineering")
  const [goalOwner, setGoalOwner] = useState("Abhishek Sharma")
  const [toast, setToast] = useState<string | null>(null)
  const goalNameRef = useRef<HTMLInputElement>(null)

  const handleCreateGoal = () => {
    // Read from DOM directly — bypasses any React state issues
    const nameFromDOM = goalNameRef.current?.value?.trim() ?? ""
    const name = nameFromDOM || goalName.trim()
    if (!name) return

    // 1. Add to state FIRST (synchronous, guaranteed)
    const newGoal = {
      id: goals.length + 1,
      name,
      status: "PENDING",
      progress: 0,
      targetDate: "TBD",
      owner: { name: goalOwner, initials: goalOwner.split(" ").map((n) => n[0]).join("") },
      following: true,
    }
    setGoals((prev) => [...prev, newGoal])

    // 2. Close modal + reset
    setCreateOpen(false)
    setGoalName("")
    setGoalDesc("")
    setGoalType("Objective")
    setGoalTeam("Engineering")
    setGoalOwner("Abhishek Sharma")
    if (goalNameRef.current) goalNameRef.current.value = ""

    // 3. Show toast
    setToast("Goal created")
    setTimeout(() => setToast(null), 3000)

    // 4. Persist to API (fire-and-forget)
    fetch("/api/data/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, access: "open", workSources: [{ type: "space", name: goalTeam }] }),
    }).catch(() => {})
  }
  const [openFilter, setOpenFilter] = useState<FilterType>(null)
  const [activeFilters, setActiveFilters] = useState<{ type: string; label: string }[]>([])
  const [sortBy, setSortBy] = useState("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "timeline">("timeline")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange] = useState("7 Dec 2025 - 7 Jun 2027")
  const [viewBy, setViewBy] = useState<"Months" | "Weeks">("Months")
  const [showCreateView, setShowCreateView] = useState(false)
  const [viewName, setViewName] = useState("")
  const [customViews, setCustomViews] = useState<{ name: string; starred: boolean }[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [viewSearch, setViewSearch] = useState("")
  const [showColumns, setShowColumns] = useState(false)
  const [colSearch, setColSearch] = useState("")
  const [columns, setColumns] = useState([
    { id: "name", label: "Name", icon: "type", enabled: true, locked: true },
    { id: "status", label: "Status", icon: "status", enabled: true, locked: false },
    { id: "progress", label: "Progress", icon: "activity", enabled: true, locked: false },
    { id: "target_date", label: "Target date", icon: "calendar", enabled: true, locked: false },
    { id: "owner", label: "Owner", icon: "user", enabled: true, locked: false },
    { id: "following", label: "Following", icon: "eye", enabled: true, locked: false },
    { id: "last_updated", label: "Last updated", icon: "calendar", enabled: true, locked: false },
    { id: "tags", label: "Tags", icon: "hash", enabled: false, locked: false },
    { id: "team", label: "Team", icon: "team", enabled: false, locked: false },
    { id: "contributing", label: "Contributing projects", icon: "link", enabled: false, locked: false },
    { id: "follower_count", label: "Follower count", icon: "bar", enabled: false, locked: false },
  ])

  const removeFilter = (type: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.type !== type))
  }

  const resetFilters = () => {
    setActiveFilters([])
  }

  const [moreViewsOpen, setMoreViewsOpen] = useState(false)

  const filteredGoals = goals.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    if (activeTab === "my") return g.owner.name === "Abhishek Sharma"
    if (activeTab === "archived") return g.status === "DONE"
    if (activeTab === "following") return g.following
    if (activeTab === "off-track") return g.status === "OFF TRACK"
    if (activeTab === "at-risk") return g.status === "AT RISK"
    return true
  })

  return (
    <div className="p-6">
      {/* Title + Create */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Goals</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setCreateOpen(true)}>Create goal</Button>
      </div>

      {/* Create Goal — manual modal for reliability */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={() => setCreateOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-[480px] rounded-lg border bg-popover shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-6 pt-6 pb-2">
              <button onClick={() => setCreateOpen(false)} className="rounded p-1 hover:bg-accent text-muted-foreground">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
              </button>
              <svg className="size-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
              <span className="text-lg font-semibold">Goal</span>
            </div>
            <p className="px-6 text-xs text-muted-foreground mb-3">Required fields are marked with an asterisk <span className="text-red-500">*</span></p>

            <div className="space-y-4 px-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name <span className="text-red-500">*</span></label>
                <input
                  ref={goalNameRef}
                  type="text"
                  defaultValue=""
                  autoFocus
                  placeholder="e.g. Increase revenue by 20%"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setCreateOpen(false)
                    if (e.key === "Enter") handleCreateGoal()
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <textarea
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="What is this goal about?"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[72px] resize-none outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type <span className="text-red-500">*</span></label>
                <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm bg-background">
                  <option value="Objective">Objective</option>
                  <option value="Key Result">Key Result</option>
                  <option value="Project">Project</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Owner <span className="text-red-500">*</span></label>
                <select value={goalOwner} onChange={(e) => setGoalOwner(e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm bg-background">
                  <option value="Abhishek Sharma">Abhishek Sharma</option>
                  <option value="Sam Williams">Sam Williams</option>
                  <option value="Jordan Lee">Jordan Lee</option>
                  <option value="Taylor Brown">Taylor Brown</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team <span className="text-red-500">*</span></label>
                <select value={goalTeam} onChange={(e) => setGoalTeam(e.target.value)} className="w-full rounded-md border px-3 py-2.5 text-sm bg-background">
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="QA">QA</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-5 border-t mt-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">Cancel</button>
              <button type="button" onClick={handleCreateGoal} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border bg-background px-4 py-3 shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg className="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-1 border-b">
        {/* Fixed tabs */}
        {[
          { key: "all", label: "All goals" },
          { key: "my", label: "My goals" },
          { key: "archived", label: "Archived" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-2 px-2 text-sm font-medium transition-colors ${activeTab === t.key ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}

        {/* More views dropdown */}
        <div className="relative">
          <button
            onClick={() => setMoreViewsOpen(!moreViewsOpen)}
            className={`flex items-center gap-1 pb-2 px-2 text-sm font-medium transition-colors ${
              ["following", "off-track", "at-risk"].includes(activeTab)
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === "following" ? "Following" : activeTab === "off-track" ? "Off track" : activeTab === "at-risk" ? "At risk" : "More views"}
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          {moreViewsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMoreViewsOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
                {[
                  { key: "following", label: "Following" },
                  { key: "off-track", label: "Off track" },
                  { key: "at-risk", label: "At risk" },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => { setActiveTab(v.key); setMoreViewsOpen(false) }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors ${activeTab === v.key ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "hover:bg-accent"}`}
                  >
                    {activeTab === v.key && <svg className="size-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
                    {v.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Custom views */}
        {customViews.map((v) => (
          <div key={v.name} className="relative flex items-center">
            <button
              onClick={() => setActiveTab(v.name)}
              className={`flex items-center gap-1.5 pb-2 px-2 text-sm font-medium transition-colors ${activeTab === v.name ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              {v.name}
              {v.starred && (
                <svg className="size-3.5 text-orange-400 fill-orange-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              )}
            </button>
            {activeTab === v.name && (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="pb-2 px-0.5 text-muted-foreground hover:text-foreground">
                    <svg className="size-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
                  </button>
                } />
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => setCustomViews((prev) => prev.map((cv) => cv.name === v.name ? { ...cv, starred: !cv.starred } : cv))}>
                    {v.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setCustomViews((prev) => prev.filter((cv) => cv.name !== v.name)); setActiveTab("all") }}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
        {/* + button with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="pb-2 px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setShowAddMenu(false); setViewSearch("") }} />
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <Input
                      placeholder="Search for views"
                      value={viewSearch}
                      onChange={(e) => setViewSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="border-t px-2 py-1.5">
                  <button
                    onClick={() => { setShowAddMenu(false); setViewSearch(""); setShowCreateView(true) }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    Create view
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          placeholder="Search goals"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters row */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
        {openFilter ? (
          /* Active filter mode: show chip inline + Reset + Create view */
          <>
            {(() => {
              const filter = filterConfig.find((f) => f.id === openFilter)!
              return (
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-600">{filter.icon}</span>
                  <span className="text-sm font-medium text-blue-600">{filter.label}</span>
                  <button onClick={() => setOpenFilter(null)} className="rounded-full bg-blue-600 p-0.5 text-white hover:bg-blue-700">
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              )
            })()}
            <button onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground">
              Reset
            </button>
            <Button size="sm" className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowCreateView(true)}>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
              Create view
            </Button>
          </>
        ) : activeFilters.length > 0 ? (
          /* Active filters applied */
          <>
            {activeFilters.map((f) => (
              <div key={f.type} className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm">
                <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {f.type === "following" ? (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  ) : f.type === "starred" ? (
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  ) : (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  )}
                </svg>
                {f.type === "following" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <button className="flex items-center gap-1 text-sm">
                        {f.label}
                        <svg className="size-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                    } />
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem
                        onClick={() => setActiveFilters((prev) => prev.map((af) => af.type === "following" ? { ...af, label: "Following" } : af))}
                        className={f.label === "Following" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        Following
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setActiveFilters((prev) => prev.map((af) => af.type === "following" ? { ...af, label: "Not following" } : af))}
                        className={f.label === "Not following" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
                      >
                        Not following
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <span>{f.label}</span>
                    <svg className="size-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                  </>
                )}
                <button onClick={() => removeFilter(f.type)} className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Add filter
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <button onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground">
              Reset
            </button>
            <Button size="sm" className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowCreateView(true)}>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
              Create view
            </Button>
          </>
        ) : (
          /* Default: all filter buttons in one row */
          <>
            {filterConfig.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setOpenFilter(filter.id)}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                {filter.icon}
                {filter.btnLabel}
              </button>
            ))}
            <button onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground">
              Reset
            </button>
            <Button size="sm" className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowCreateView(true)}>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
              Create view
            </Button>
          </>
        )}
        </div>

        {/* Inline filter dropdown - rendered below the filter row */}
        {openFilter && (
          <InlineFilterDropdown
            filter={filterConfig.find((f) => f.id === openFilter)!}
            onClose={() => setOpenFilter(null)}
          />
        )}
      </div>

      {/* Count + view controls */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""}</p>
          {activeTab !== "all" && (
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Read updates
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Timeline-mode controls: date range + view by */}
          {viewMode === "timeline" && (
            <>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger render={
                  <button className="rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors">
                    {dateRange}
                  </button>
                } />
                <PopoverContent align="end" className="w-auto p-4">
                  <DateRangePicker />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors" title="Change date range format">
                    View by {viewBy}
                    <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                  </button>
                } />
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>View by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setViewBy("Months")}>
                      Months
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewBy("Weeks")} className={viewBy === "Weeks" ? "text-blue-600" : ""}>
                      Weeks
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* List / Timeline toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => { setViewMode("list"); setSortBy("following") }}
              className={`px-2 py-1 rounded-l-md transition-colors ${viewMode === "list" ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`}
              title="Display as list"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
            <button
              onClick={() => { setViewMode("timeline"); setSortBy("name") }}
              className={`px-2 py-1 rounded-r-md transition-colors ${viewMode === "timeline" ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`}
              title="Display as timeline"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
            </button>
          </div>

          {/* Sort by dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors" title="Change list sorting">
                Sort by {sortBy}
              </button>
            } />
            <DropdownMenuContent align="end" className="w-48">
              <div className="relative px-2 py-1.5">
                <Input placeholder="Select..." className="h-7 text-xs pr-7" />
                <svg className="absolute right-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                {["Name", "Status", "Target date", "Following", "Last updated", "Follower count"].map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => setSortBy(opt.toLowerCase())}
                    className={sortBy === opt.toLowerCase() ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort direction */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="rounded-md border px-1.5 py-1 text-muted-foreground hover:bg-accent transition-colors"
            title="Reverse sort order"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sortAsc ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
          </button>

          {/* Columns button */}
          <Popover open={showColumns} onOpenChange={(open) => { setShowColumns(open); if (!open) setColSearch("") }}>
            <PopoverTrigger render={
              <button className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors ${showColumns ? "border-blue-500 text-blue-600" : "text-muted-foreground hover:bg-accent"}`}>
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Columns
              </button>
            } />
            <PopoverContent align="end" className="w-72 p-0">
              <div className="p-2">
                <div className="relative">
                  <Input
                    placeholder="Search"
                    value={colSearch}
                    onChange={(e) => setColSearch(e.target.value)}
                    className="h-8 pr-8 text-xs"
                    autoFocus
                  />
                  <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto px-1 pb-1">
                {columns
                  .filter((c) => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase()))
                  .map((col) => (
                    <div key={col.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {col.icon === "type" && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>}
                          {col.icon === "status" && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></>}
                          {col.icon === "activity" && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
                          {col.icon === "calendar" && <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                          {col.icon === "user" && <><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>}
                          {col.icon === "eye" && <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                          {col.icon === "hash" && <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>}
                          {col.icon === "team" && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                          {col.icon === "link" && <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>}
                          {col.icon === "bar" && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
                        </svg>
                        <span className="text-sm">{col.label}</span>
                      </div>
                      {col.locked ? (
                        <svg className="size-4 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <button
                          onClick={() => setColumns((prev) => prev.map((c) => c.id === col.id ? { ...c, enabled: !c.enabled } : c))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${col.enabled ? "bg-green-500" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${col.enabled ? "translate-x-[18px]" : "translate-x-1"}`} />
                          {!col.enabled && (
                            <svg className="absolute right-1 size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          )}
                          {col.enabled && (
                            <svg className="absolute left-1.5 size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
              </div>
              <div className="border-t p-2">
                <button className="w-full rounded-md px-3 py-2 text-center text-sm text-muted-foreground hover:bg-accent transition-colors">
                  Create a new field
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="rounded-md border px-1.5 py-1 text-muted-foreground hover:bg-accent transition-colors">
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
              </button>
            } />
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Goals table or empty state */}
      {filteredGoals.length > 0 ? (
        <div className="rounded-lg border">
          {/* Header */}
          <div className="grid grid-cols-[1fr_90px_120px_110px_70px_80px] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Target date</span>
            <span>Owner</span>
            <span>Following</span>
          </div>

          {/* Rows */}
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => router.push(`/goals/${goal.id}`)}
              className="grid grid-cols-[1fr_90px_120px_110px_70px_80px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors cursor-pointer"
            >
              {/* Name */}
              <Link href={`/goals/${goal.id}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                <svg className="size-4 text-muted-foreground/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-sm truncate">{goal.name}</span>
              </Link>
              {/* Status — clickable, stops propagation */}
              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={goal.status}
                  onChange={() => {}}
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 cursor-pointer"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ON TRACK">On Track</option>
                  <option value="AT RISK">At Risk</option>
                  <option value="OFF TRACK">Off Track</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${goal.progress}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{goal.progress}%</span>
              </div>
              {/* Target date */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {goal.targetDate}
              </div>
              {/* Owner */}
              <div>
                <Avatar className="size-7">
                  <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">{goal.owner.initials}</AvatarFallback>
                </Avatar>
              </div>
              {/* Following — Unfollow button stops propagation */}
              <div onClick={(e) => e.stopPropagation()}>
                {goal.following ? (
                  <div className="group/follow relative">
                    <span className="text-xs text-muted-foreground group-hover/follow:hidden">Following</span>
                    <button
                      onClick={(e) => { e.stopPropagation() }}
                      className="hidden rounded-md bg-red-500 px-3 py-1 text-[11px] font-medium text-white hover:bg-red-600 group-hover/follow:inline-flex"
                      title="Unfollow to stop receiving notifications"
                    >
                      Unfollow
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-lg border p-8">
            <svg className="mx-auto size-28" viewBox="0 0 150 150" fill="none">
              <text x="40" y="30" fill="currentColor" className="text-muted-foreground/15" fontSize="24" fontWeight="bold">?</text>
              <text x="110" y="35" fill="currentColor" className="text-muted-foreground/15" fontSize="18" fontWeight="bold">?</text>
              <text x="25" y="90" fill="currentColor" className="text-muted-foreground/10" fontSize="20" fontWeight="bold">?</text>
              <text x="120" y="100" fill="currentColor" className="text-muted-foreground/15" fontSize="22" fontWeight="bold">?</text>
              <text x="100" y="130" fill="currentColor" className="text-muted-foreground/10" fontSize="16" fontWeight="bold">?</text>
              <circle cx="70" cy="70" r="35" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeDasharray="8 6" fill="none" />
              <circle cx="70" cy="70" r="25" stroke="currentColor" className="text-muted-foreground/15" strokeWidth="2" fill="none" />
              <line x1="57" y1="57" x2="83" y2="83" stroke="currentColor" className="text-muted-foreground/25" strokeWidth="5" strokeLinecap="round" />
              <line x1="83" y1="57" x2="57" y2="83" stroke="currentColor" className="text-muted-foreground/25" strokeWidth="5" strokeLinecap="round" />
              <line x1="95" y1="95" x2="115" y2="115" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="7" strokeLinecap="round" />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              We couldn&apos;t find any goals matching your search.
            </p>
            <p className="text-sm text-muted-foreground">
              Try changing your search criteria or{" "}
              <button type="button" onClick={resetFilters} className="font-medium text-blue-600 hover:underline">clear all filters</button>.
            </p>
          </div>
        </div>
      )}

      {/* Create view dialog */}
      <Dialog open={showCreateView} onOpenChange={(open) => { if (!open) { setShowCreateView(false); setViewName("") } }}>
        <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create view</DialogTitle>
            <DialogDescription>
              A view saves your search, filter, sort, and display options so you can quickly return to it later
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="mb-1.5 text-sm font-medium">
              View name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="border-2 border-blue-500"
              autoFocus
            />
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <svg className="size-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span>Everyone at abhisheksharma67185 can see this view</span>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowCreateView(false); setViewName("") }}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" disabled={!viewName.trim()} onClick={() => {
              const name = viewName.trim()
              setCustomViews((prev) => [...prev, { name, starred: false }])
              setActiveTab(name)
              setShowCreateView(false)
              setViewName("")
            }}>
              Create view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const CAL_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getDaysInMonth(m: number, y: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDay(m: number, y: number) { return new Date(y, m, 1).getDay() }

function CalMonth({ month, year, onPrev, onNext, onPrevY, onNextY }: {
  month: number; year: number; onPrev: () => void; onNext: () => void; onPrevY: () => void; onNextY: () => void
}) {
  const dim = getDaysInMonth(month, year)
  const fd = getFirstDay(month, year)
  const prevDim = getDaysInMonth(month === 0 ? 11 : month - 1, month === 0 ? year - 1 : year)
  const today = new Date()
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const cells = []
  for (let i = fd - 1; i >= 0; i--) cells.push(<span key={`p${i}`} className="flex size-8 items-center justify-center text-xs text-muted-foreground/40">{prevDim - i}</span>)
  for (let d = 1; d <= dim; d++) cells.push(
    <button key={d} className={`flex size-8 items-center justify-center rounded-full text-xs transition-colors hover:bg-accent ${isToday(d) ? "bg-blue-600 text-white font-semibold hover:bg-blue-700" : ""}`}>{d}</button>
  )
  const rem = 42 - cells.length
  for (let d = 1; d <= rem; d++) cells.push(<span key={`n${d}`} className="flex size-8 items-center justify-center text-xs text-muted-foreground/40">{d}</span>)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button onClick={onPrevY} className="rounded p-0.5 text-muted-foreground hover:bg-accent"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg></button>
          <button onClick={onPrev} className="rounded p-0.5 text-muted-foreground hover:bg-accent"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
        </div>
        <span className="text-sm font-medium">{CAL_MONTHS[month]} {year}</span>
        <div className="flex items-center gap-0.5">
          <button onClick={onNext} className="rounded p-0.5 text-muted-foreground hover:bg-accent"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
          <button onClick={onNextY} className="rounded p-0.5 text-muted-foreground hover:bg-accent"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg></button>
        </div>
      </div>
      <div className="grid grid-cols-7">{CAL_DAY_LABELS.map((d) => <span key={d} className="flex size-8 items-center justify-center text-[10px] font-medium text-muted-foreground">{d}</span>)}{cells}</div>
    </div>
  )
}

function DateRangePicker() {
  const [startMonth, setStartMonth] = useState(11)
  const [startYear, setStartYear] = useState(2025)
  const [endMonth, setEndMonth] = useState(5)
  const [endYear, setEndYear] = useState(2027)

  const nav = (cur: number, yCur: number, dir: -1 | 1): [number, number] => {
    const m = cur + dir
    if (m < 0) return [11, yCur - 1]
    if (m > 11) return [0, yCur + 1]
    return [m, yCur]
  }

  return (
    <div>
      <div className="flex gap-8">
        <div>
          <p className="mb-2 text-center text-sm font-medium">Start</p>
          <CalMonth month={startMonth} year={startYear}
            onPrev={() => { const [m, y] = nav(startMonth, startYear, -1); setStartMonth(m); setStartYear(y) }}
            onNext={() => { const [m, y] = nav(startMonth, startYear, 1); setStartMonth(m); setStartYear(y) }}
            onPrevY={() => setStartYear(startYear - 1)} onNextY={() => setStartYear(startYear + 1)} />
        </div>
        <div>
          <p className="mb-2 text-center text-sm font-medium">End</p>
          <CalMonth month={endMonth} year={endYear}
            onPrev={() => { const [m, y] = nav(endMonth, endYear, -1); setEndMonth(m); setEndYear(y) }}
            onNext={() => { const [m, y] = nav(endMonth, endYear, 1); setEndMonth(m); setEndYear(y) }}
            onPrevY={() => setEndYear(endYear - 1)} onNextY={() => setEndYear(endYear + 1)} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <span className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">7 Dec 2025 - 7 Jun 2027</span>
      </div>
    </div>
  )
}
