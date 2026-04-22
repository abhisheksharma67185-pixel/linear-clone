"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface TeamData {
  id: string
  name: string
  description: string
  members: number
  color: string
  archived?: boolean
}

const TABS = ["All teams", "Your teams", "Archived"] as const
type Tab = (typeof TABS)[number]

const MOCK_PROJECTS = [
  "SCRUM Project",
  "Mobile App",
  "Platform Core",
  "Frontend App",
  "Cloud Migration",
]

interface FilterBtn {
  id: string
  label: string
  chipLabel: string
  options?: string[]
  icon: React.ReactNode
}

const FILTER_BTNS: FilterBtn[] = [
  {
    id: "project",
    label: "Filter by Project",
    chipLabel: "Project is",
    options: MOCK_PROJECTS,
    // Bug 5: 2×2 grid icon (signals "project view"), not a funnel/layers icon
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color: "#42526E" }}
      >
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    id: "goal",
    label: "Goal",
    chipLabel: "Goal is",
    // Bug 5: target/bullseye icon
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "team-type",
    label: "Team type",
    chipLabel: "Team type is",
    options: ["Official", "Community", "Project"],
    // Bug 5: people-group icon
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "starred",
    label: "Starred",
    chipLabel: "Starred v",
    options: ["Starred", "Not starred"],
    // Bug 5: star icon
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "verified",
    label: "Verified",
    chipLabel: "Verified v",
    options: ["Verified", "Not verified"],
    // Bug 5: check-circle icon
    icon: (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
      </svg>
    ),
  },
  {
    id: "member",
    label: "Team Member",
    chipLabel: "Team Member is",
    // Bug 5: person icon
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
]

function FilterDropdown({
  filter,
  onSelect,
}: {
  filter: FilterBtn
  onSelect: (v: string) => void
}) {
  const [search, setSearch] = useState("")
  const options = (filter.options ?? []).filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-lg border bg-popover shadow-lg">
      <div className="border-b p-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Choose a project"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full rounded-md border bg-background py-1.5 pr-8 pl-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <svg
            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto py-1">
        {options.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
        )}
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TeamsDirectoryPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("All teams")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"none" | "name" | "members">("none")
  const [moreOpen, setMoreOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")

  // Filter state
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [addFilterOpen, setAddFilterOpen] = useState(false)
  const filterBarRef = useRef<HTMLDivElement>(null)
  const addFilterRef = useRef<HTMLDivElement>(null)

  const fetchTeams = () => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => {})
  }

  useEffect(() => {
    fetchTeams()
    const onCreated = () => fetchTeams()
    window.addEventListener("team-created", onCreated)
    return () => window.removeEventListener("team-created", onCreated)
  }, [])

  function handleTabClick(tab: Tab) {
    setActiveTab(tab)
    setActiveFilters(new Set())
    setFilterValues({})
    setOpenFilter(null)
    setAddFilterOpen(false)
    if (tab === "Your teams") {
      setActiveFilters(new Set(["member"]))
      setFilterValues({ member: "Abhishek Sharma" })
    }
  }

  function clearAllFilters() {
    setActiveTab("All teams")
    setActiveFilters(new Set())
    setFilterValues({})
    setOpenFilter(null)
    setAddFilterOpen(false)
    setSearch("")
  }

  useEffect(() => {
    if (!openFilter) return
    const h = (e: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      )
        setOpenFilter(null)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [openFilter])

  useEffect(() => {
    if (!addFilterOpen) return
    const h = (e: MouseEvent) => {
      if (
        addFilterRef.current &&
        !addFilterRef.current.contains(e.target as Node)
      )
        setAddFilterOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [addFilterOpen])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await fetch("/api/data/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        description: newDesc.trim(),
      }),
    })
    if (res.ok) {
      const t = await res.json()
      setTeams((prev) => [...prev, t])
      setCreateOpen(false)
      setNewName("")
      setNewDesc("")
    }
  }

  function handleFilterClick(id: string) {
    if (activeFilters.has(id)) {
      setOpenFilter(openFilter === id ? null : id)
    } else {
      setActiveFilters((prev) => new Set([...prev, id]))
      setOpenFilter(id)
    }
  }

  function handleRemoveFilter(id: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setFilterValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setOpenFilter(null)
  }

  function handleSelectValue(id: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [id]: value }))
    setOpenFilter(null)
  }

  function resetFilters() {
    setActiveFilters(new Set())
    setFilterValues({})
    setOpenFilter(null)
    setAddFilterOpen(false)
  }

  const filteredTeams = teams
    .filter((team) => {
      if (activeTab === "Archived") return team.archived === true
      if (
        !team.name.toLowerCase().includes(search.toLowerCase()) &&
        !team.description.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "members") return b.members - a.members
      return 0
    })

  const activeFilterIds = Array.from(activeFilters)
  const inactiveFilters = FILTER_BTNS.filter((f) => !activeFilters.has(f.id))
  const hasActiveFilters = activeFilters.size > 0

  return (
    <div className="max-w-5xl p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 data-testid="teams-heading" className="text-2xl font-semibold">
          Teams
        </h1>
        <Button variant="outline" onClick={() => setCreateOpen(true)}>
          Create team
        </Button>
      </div>

      {/* Tabs */}
      <div data-testid="teams-tabs" className="mb-5 flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            data-testid={`tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => handleTabClick(tab)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
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
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2 pr-4 pl-10 text-sm placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Filter bar */}
      <div
        ref={filterBarRef}
        className="mb-5 flex flex-wrap items-center gap-2"
      >
        {!hasActiveFilters ? (
          /* Default state — all filter buttons */
          FILTER_BTNS.map((f) => (
            <button
              key={f.id}
              data-testid={`filter-btn-${f.id}`}
              onClick={() => handleFilterClick(f.id)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent dark:border-gray-700"
            >
              {f.icon}
              {f.label}
            </button>
          ))
        ) : (
          /* Active state — chips + Add filter + Reset */
          <>
            {activeFilterIds.map((id) => {
              const f = FILTER_BTNS.find((fb) => fb.id === id)!
              const val = filterValues[id]
              return (
                <div key={id} className="relative flex items-center gap-1.5">
                  {/* testid wraps only the label + pill (one button: ×) */}
                  <div
                    data-testid={`filter-chip-${id}`}
                    className="flex items-center gap-1.5"
                  >
                    <span className="flex items-center gap-1.5 text-sm text-foreground select-none">
                      {f.icon}
                      {f.chipLabel}
                    </span>
                    <div className="flex items-center gap-1.5 rounded-full border border-blue-500 px-3 py-1">
                      <span
                        onClick={() => handleFilterClick(id)}
                        className="cursor-pointer text-sm leading-none text-blue-600 select-none dark:text-blue-400"
                      >
                        {val ?? "…"}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter(id)}
                        className="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400"
                      >
                        <svg
                          className="size-3"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* + outside the testid div — opens dropdown to change value */}
                  <button
                    onClick={() => handleFilterClick(id)}
                    className="text-sm leading-none text-muted-foreground transition-colors hover:text-foreground"
                  >
                    +
                  </button>
                  {openFilter === id && (
                    <FilterDropdown
                      filter={f}
                      onSelect={(v) => handleSelectValue(id, v)}
                    />
                  )}
                </div>
              )
            })}

            {/* Add filter + */}
            {inactiveFilters.length > 0 && (
              <div ref={addFilterRef} className="relative">
                <button
                  data-testid="add-filter-btn"
                  onClick={() => setAddFilterOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-gray-400 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                  Add filter
                  <svg
                    className="size-3.5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
                  </svg>
                </button>
                {addFilterOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
                    {inactiveFilters.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          handleFilterClick(f.id)
                          setAddFilterOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        {f.icon}
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reset */}
            <button
              data-testid="teams-reset-btn"
              onClick={resetFilters}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Count + view toggles */}
      <div className="mb-4 flex items-center justify-between">
        <p data-testid="teams-count" className="text-sm text-muted-foreground">
          {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center">
          <button
            data-testid="view-grid-btn"
            onClick={() => setViewMode("grid")}
            title="Grid view"
            className={`rounded-l-lg border border-r-0 p-2 transition-colors ${viewMode === "grid" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            data-testid="view-list-btn"
            onClick={() => setViewMode("list")}
            title="List view"
            className={`border border-r-0 p-2 transition-colors ${viewMode === "list" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="2.5" cy="4.5" r="1.5" />
              <rect x="6" y="3.5" width="16" height="2" rx="1" />
              <circle cx="2.5" cy="12" r="1.5" />
              <rect x="6" y="11" width="16" height="2" rx="1" />
              <circle cx="2.5" cy="19.5" r="1.5" />
              <rect x="6" y="18.5" width="16" height="2" rx="1" />
            </svg>
          </button>
          <div className="relative">
            <button
              data-testid="view-more-btn"
              onClick={() => setMoreOpen((v) => !v)}
              className={`rounded-r-lg border p-2 transition-colors ${moreOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
                <button
                  data-testid="sort-by-name"
                  onClick={() => {
                    setSortBy("name")
                    setMoreOpen(false)
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent ${sortBy === "name" ? "font-medium text-blue-600" : ""}`}
                >
                  Sort by name
                  {sortBy === "name" && (
                    <svg
                      className="ml-auto size-3.5 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <button
                  data-testid="sort-by-members"
                  onClick={() => {
                    setSortBy("members")
                    setMoreOpen(false)
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent ${sortBy === "members" ? "font-medium text-blue-600" : ""}`}
                >
                  Sort by members
                  {sortBy === "members" && (
                    <svg
                      className="ml-auto size-3.5 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && filteredTeams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="team-card group flex flex-col rounded-xl border bg-background p-4 transition-all hover:shadow-md"
              style={{
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                overflow: "visible",
                border: "1px solid #DFE1E6",
                borderRadius: 3,
                padding: 16,
              }}
            >
              {/* Bug 6: owner avatar absolutely positioned top-right, overlaps border */}
              <div
                className="owner-avatar"
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#36B37E",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                AS
              </div>
              <div className="mb-5">
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl ${team.color} shadow-sm`}
                >
                  <svg
                    className="size-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
              </div>
              <h3
                data-testid="team-name"
                className="team-name mb-1"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#172B4D",
                  textDecoration: "none",
                }}
              >
                {team.name}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Official team
                </span>
                <svg
                  className="size-3.5 shrink-0 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                </svg>
                <span className="text-xs text-muted-foreground">
                  • {team.members} member{team.members !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && filteredTeams.length > 0 && (
        <div className="divide-y rounded-xl border">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="team-card group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-accent/50"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${team.color}`}
              >
                <svg
                  className="size-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  data-testid="team-name"
                  className="team-name"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#172B4D",
                    textDecoration: "none",
                  }}
                >
                  {team.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    Official team
                  </span>
                  <svg
                    className="size-3 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                  </svg>
                  <span className="text-xs text-muted-foreground">
                    • {team.members} member{team.members !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-teal-500 text-[10px] font-bold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredTeams.length === 0 && (
        <div
          data-testid="teams-empty-state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          {/* Magnifying glass with X */}
          <svg
            className="mb-5 size-20 text-muted-foreground/40"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="34"
              cy="34"
              r="22"
              stroke="currentColor"
              strokeWidth="4"
            />
            <line
              x1="50"
              y1="50"
              x2="70"
              y2="70"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="27"
              y1="27"
              x2="41"
              y2="41"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="41"
              y1="27"
              x2="27"
              y2="41"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t find any teams matching your search. Try changing
            your search criteria or clear your filters.
          </p>
          <button
            data-testid="clear-all-filters-btn"
            onClick={clearAllFilters}
            className="mb-6 rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent dark:border-gray-600"
          >
            Clear all filters
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <svg
              className="size-3.5 shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-5h1.5v5zm0-6.5h-1.5V3.5h1.5V5z" />
            </svg>
            Some teams may not be found on this site due to changes in team
            visibility.
          </div>
        </div>
      )}

      {/* Create team modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setCreateOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">Create a team</h3>
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Team name <span className="text-red-500">*</span>
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Marketing"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newName.trim()) handleCreate()
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What does this team work on?"
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!newName.trim()}
                onClick={handleCreate}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
