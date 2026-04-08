"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dropdown-menu"

const mockGoals = [
  {
    id: 1,
    name: "uvvigigi",
    status: "PENDING",
    progress: 0,
    targetDate: "April",
    owner: { name: "Abhishek Sharma", initials: "AS" },
    following: true,
  },
]

const addFilterOptions = [
  { id: "tag", label: "Tag", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg> },
  { id: "status", label: "Status", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg> },
  { id: "owner", label: "Owner", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg> },
  { id: "team", label: "Team", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { id: "following", label: "Following", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>, disabled: true },
  { id: "starred", label: "Starred", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
  { id: "metric", label: "Metric", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { id: "reporting", label: "Reporting line", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg> },
]

const columnsDef = [
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
]

function ColIcon({ icon }: { icon: string }) {
  return (
    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {icon === "type" && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>}
      {icon === "status" && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></>}
      {icon === "activity" && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
      {icon === "calendar" && <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
      {icon === "user" && <><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>}
      {icon === "eye" && <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
      {icon === "hash" && <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>}
      {icon === "team" && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
      {icon === "link" && <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>}
      {icon === "bar" && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
    </svg>
  )
}

export default function FollowingPage() {
  const [search, setSearch] = useState("")
  const [followingFilter, setFollowingFilter] = useState("Following")
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [addFilterSearch, setAddFilterSearch] = useState("")
  const [showColumns, setShowColumns] = useState(false)
  const [colSearch, setColSearch] = useState("")
  const [columns, setColumns] = useState(columnsDef)
  const [wrapText, setWrapText] = useState(false)

  const filteredGoals = mockGoals.filter((g) =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Following</h1>
        <Button variant="outline">Create goal</Button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input placeholder="Search goals" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex items-center gap-2">
        {/* Following chip */}
        <div className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm">
          <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-1 text-sm">
                {followingFilter}
                <svg className="size-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            } />
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => setFollowingFilter("Following")} className={followingFilter === "Following" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}>
                Following
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFollowingFilter("Not following")} className={followingFilter === "Not following" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}>
                Not following
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Add filter + */}
        <div className="relative">
          <button
            onClick={() => setShowAddFilter(!showAddFilter)}
            className={`flex items-center gap-1 text-sm transition-colors ${showAddFilter ? "text-blue-600 font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Add filter
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
          {showAddFilter && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setShowAddFilter(false); setAddFilterSearch("") }} />
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <Input
                      placeholder="Select..."
                      value={addFilterSearch}
                      onChange={(e) => setAddFilterSearch(e.target.value)}
                      className="h-8 pr-8 text-xs"
                      autoFocus
                    />
                    <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto px-1 pb-1">
                  {addFilterOptions
                    .filter((o) => !addFilterSearch || o.label.toLowerCase().includes(addFilterSearch.toLowerCase()))
                    .map((opt) => (
                      <button
                        key={opt.id}
                        disabled={opt.disabled}
                        onClick={() => { setShowAddFilter(false); setAddFilterSearch("") }}
                        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors ${opt.disabled ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-accent"}`}
                      >
                        <span className={opt.disabled ? "text-muted-foreground/40" : "text-muted-foreground"}>{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Count + controls */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          {/* List/hierarchy toggle */}
          <div className="flex rounded-md border">
            <button className="bg-accent px-2 py-1 rounded-l-md">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
            <button className="px-2 py-1 text-muted-foreground hover:bg-accent rounded-r-md">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
            </button>
          </div>

          {/* Sort by */}
          <button className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent">
            Sort by following
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>

          {/* Columns */}
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
                  <Input placeholder="Search" value={colSearch} onChange={(e) => setColSearch(e.target.value)} className="h-8 pr-8 text-xs" autoFocus />
                  <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto px-1 pb-1">
                {columns.filter((c) => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase())).map((col) => (
                  <div key={col.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50">
                    <div className="flex items-center gap-2.5">
                      <ColIcon icon={col.icon} />
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
                        {!col.enabled && <svg className="absolute right-1 size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                        {col.enabled && <svg className="absolute left-1.5 size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t p-2">
                <button className="w-full rounded-md px-3 py-2 text-center text-sm text-muted-foreground hover:bg-accent">Create a new field</button>
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setWrapText(!wrapText)} className="flex items-center justify-between">
                <span>Wrap text</span>
                <div className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${wrapText ? "bg-green-500" : "bg-muted-foreground/30"}`}>
                  <span className={`inline-block size-2.5 rounded-full bg-white transition-transform ${wrapText ? "translate-x-3.5" : "translate-x-0.5"}`} />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr_90px_120px_110px_70px_80px] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Name</span>
          <span>Status</span>
          <span>Progress</span>
          <span>Target date</span>
          <span>Owner</span>
          <span>Following</span>
        </div>
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="grid grid-cols-[1fr_90px_120px_110px_70px_80px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <svg className="size-4 text-muted-foreground/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
              <span className="text-sm truncate">{goal.name}</span>
            </div>
            <div>
              <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{goal.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-muted"><div className="h-full rounded-full bg-blue-500" style={{ width: `${goal.progress}%` }} /></div>
              <span className="text-xs text-muted-foreground">{goal.progress}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {goal.targetDate}
            </div>
            <div>
              <Avatar className="size-7"><AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">{goal.owner.initials}</AvatarFallback></Avatar>
            </div>
            <div>
              {goal.following && <span className="text-xs text-muted-foreground">Following</span>}
            </div>
          </div>
        ))}
        {filteredGoals.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No goals found.</div>
        )}
      </div>
    </div>
  )
}
