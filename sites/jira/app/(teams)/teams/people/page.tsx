"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserProfileCard } from "@/components/user-profile-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// ─── People data ─────────────────────────────────────────────────────────────

interface Person {
  name: string
  initials: string
  jobTitle: string
  manager: string
  department: string
  location: string
  teams: string[]
  projects: string[]
  goals: string[]
}

const hardcodedPeople: Person[] = [
  { name: "Abhishek Sharma", initials: "AS", jobTitle: "Engineering Manager", manager: "", department: "Engineering", location: "Bangalore, India", teams: ["Platform", "Infrastructure"], projects: ["My Scrum Project", "Kanban Project"], goals: ["Ship v2.0", "Improve reliability"] },
  { name: "Sam Williams", initials: "SW", jobTitle: "Senior Developer", manager: "Abhishek Sharma", department: "Engineering", location: "San Francisco, USA", teams: ["Platform"], projects: ["My Scrum Project"], goals: ["Ship v2.0"] },
  { name: "Priya Patel", initials: "PP", jobTitle: "Product Designer", manager: "Abhishek Sharma", department: "Design", location: "Bangalore, India", teams: ["Design System"], projects: ["My Scrum Project", "Kanban Project"], goals: ["Design system v3"] },
  { name: "Alex Chen", initials: "AC", jobTitle: "Frontend Developer", manager: "Sam Williams", department: "Engineering", location: "Toronto, Canada", teams: ["Platform", "Design System"], projects: ["Kanban Project"], goals: ["Ship v2.0"] },
  { name: "Maria Garcia", initials: "MG", jobTitle: "Backend Developer", manager: "Abhishek Sharma", department: "Engineering", location: "Madrid, Spain", teams: ["Infrastructure"], projects: ["My Scrum Project"], goals: ["Improve reliability"] },
  { name: "James Wilson", initials: "JW", jobTitle: "QA Engineer", manager: "Sam Williams", department: "Quality", location: "London, UK", teams: ["Platform"], projects: ["My Scrum Project", "Kanban Project"], goals: ["Ship v2.0"] },
  { name: "Riya Gupta", initials: "RG", jobTitle: "Data Analyst", manager: "Abhishek Sharma", department: "Analytics", location: "Bangalore, India", teams: ["Analytics"], projects: ["Kanban Project"], goals: ["Data-driven decisions"] },
  { name: "Tom Baker", initials: "TB", jobTitle: "DevOps Engineer", manager: "Sam Williams", department: "Engineering", location: "Sydney, Australia", teams: ["Infrastructure"], projects: ["My Scrum Project"], goals: ["Improve reliability"] },
  { name: "Emily Davis", initials: "ED", jobTitle: "Product Manager", manager: "", department: "Product", location: "New York, USA", teams: ["Platform", "Analytics"], projects: ["My Scrum Project", "Kanban Project"], goals: ["Ship v2.0", "Data-driven decisions"] },
  { name: "Raj Mehta", initials: "RM", jobTitle: "Senior Developer", manager: "Abhishek Sharma", department: "Engineering", location: "Mumbai, India", teams: ["Infrastructure", "Platform"], projects: ["My Scrum Project"], goals: ["Ship v2.0", "Improve reliability"] },
  { name: "Sophie Turner", initials: "ST", jobTitle: "UX Researcher", manager: "Emily Davis", department: "Design", location: "London, UK", teams: ["Design System"], projects: ["Kanban Project"], goals: ["Design system v3"] },
  { name: "Kevin Park", initials: "KP", jobTitle: "Full Stack Developer", manager: "Sam Williams", department: "Engineering", location: "Seoul, South Korea", teams: ["Platform"], projects: ["My Scrum Project", "Kanban Project"], goals: ["Ship v2.0"] },
]

// ─── Filter definitions ──────────────────────────────────────────────────────

function deriveOptions(people: Person[], field: keyof Person): string[] {
  const set = new Set<string>()
  for (const p of people) {
    const val = p[field]
    if (Array.isArray(val)) val.forEach((v) => { if (v) set.add(v) })
    else if (val) set.add(val)
  }
  return [...set].sort()
}

interface FilterDef {
  key: string
  field: keyof Person
  label: string
  activeLabel: string
  placeholder: string
  icon: React.ReactNode
}

const filterDefs: FilterDef[] = [
  { key: "project", field: "projects", label: "Filter by Project", activeLabel: "Project", placeholder: "Search projects...", icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></> },
  { key: "goal", field: "goals", label: "Goal", activeLabel: "Goal", placeholder: "Search goals...", icon: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></> },
  { key: "team", field: "teams", label: "Team", activeLabel: "Team", placeholder: "Search teams...", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { key: "jobtitle", field: "jobTitle", label: "Job title", activeLabel: "Job title", placeholder: "Search job titles...", icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></> },
  { key: "manager", field: "manager", label: "Manager", activeLabel: "Manager", placeholder: "Search managers...", icon: <><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></> },
  { key: "department", field: "department", label: "Department", activeLabel: "Department", placeholder: "Search departments...", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { key: "location", field: "location", label: "Location", activeLabel: "Location", placeholder: "Search locations...", icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></> },
]

// ─── Filter dropdown component ───────────────────────────────────────────────

function FilterDropdown({
  def,
  options,
  selectedValues,
  onToggleValue,
  onRemoveFilter,
}: {
  def: FilterDef
  options: string[]
  selectedValues: Set<string>
  onToggleValue: (key: string, value: string) => void
  onRemoveFilter: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const hasSelection = selectedValues.size > 0
  const filteredOptions = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
          hasSelection
            ? "border-blue-600 bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{def.icon}</svg>
        {hasSelection ? (
          <>
            {def.activeLabel}: {[...selectedValues].join(", ")}
            <button
              onClick={(e) => { e.stopPropagation(); onRemoveFilter(def.key) }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </>
        ) : (
          def.label
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg">
          <div className="flex items-center border-b px-3 py-2">
            <svg className="size-4 text-muted-foreground mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={def.placeholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.has(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => onToggleValue(def.key, opt)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? "border-blue-600 bg-blue-600" : "border-muted-foreground/40"}`}>
                      {isSelected && (
                        <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <span className={isSelected ? "font-medium" : ""}>{opt}</span>
                  </button>
                )
              })
            ) : (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">No results found</p>
            )}
          </div>
          {selectedValues.size > 0 && (
            <div className="border-t px-3 py-2">
              <button onClick={() => onRemoveFilter(def.key)} className="text-xs text-blue-600 hover:underline">
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Add People Dialog ───────────────────────────────────────────────────────

function AddPeopleDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string) => void }) {
  const [input, setInput] = useState("")

  if (!open) return null

  const handleAdd = () => {
    if (input.trim()) {
      input.split(",").forEach((entry) => {
        const name = entry.trim()
        if (name) onAdd(name)
      })
      setInput("")
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add people to Jira</DialogTitle>
        </DialogHeader>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Names or emails <span className="text-red-500">*</span>
          </label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g., Maria, maria@company.com"
            autoFocus
          />

          <p className="mt-3 text-[11px] text-muted-foreground">
            This site is protected by reCAPTCHA and the Google{" "}
            <span className="text-blue-600 underline">Privacy Policy</span> and{" "}
            <span className="text-blue-600 underline">Terms of Service</span> apply.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleAdd} disabled={!input.trim()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [people, setPeople] = useState(hardcodedPeople)

  // Also load users from the API and merge (dedup by name)
  useEffect(() => {
    fetch("/api/data/users").then((r) => r.json()).then((apiUsers: Array<{ name: string; displayName?: string; email?: string; role?: string }>) => {
      const existingNames = new Set(hardcodedPeople.map((p) => p.name.toLowerCase()))
      const newPeople: Person[] = apiUsers
        .filter((u) => !existingNames.has((u.displayName ?? u.name).toLowerCase()))
        .map((u) => ({
          name: u.displayName ?? u.name,
          initials: (u.displayName ?? u.name).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
          jobTitle: u.role ?? "Team Member",
          manager: "",
          department: "General",
          location: "",
          teams: [],
          projects: [],
          goals: [],
        }))
      if (newPeople.length > 0) setPeople((prev) => [...prev, ...newPeople])
    }).catch(() => {})
  }, [])
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [colSearch, setColSearch] = useState("")
  const [wrapText, setWrapText] = useState(false)
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    name: true, jobTitle: true, manager: true, department: true, location: false, teams: false,
  })

  // Multi-filter state: { filterKey -> Set of selected values }
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({})

  const toggleFilterValue = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      const set = new Set(next[key] ?? [])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      if (set.size === 0) delete next[key]
      else next[key] = set
      return next
    })
  }

  const removeFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const clearAllFilters = () => setActiveFilters({})

  const toggleCol = (key: string) => {
    if (key === "name") return
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const columnDefs = [
    { key: "name", label: "Name", alwaysOn: true },
    { key: "jobTitle", label: "Job title" },
    { key: "manager", label: "Manager" },
    { key: "department", label: "Department" },
    { key: "location", label: "Location" },
    { key: "teams", label: "Teams" },
  ]

  const addPerson = (name: string) => {
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    setPeople((prev) => [...prev, { name, initials, jobTitle: "", manager: "", department: "", location: "", teams: [], projects: [], goals: [] }])
  }

  // Apply search + all active filters
  const filtered = people.filter((p) => {
    if (search) {
      const q = search.toLowerCase()
      const matchesAny = p.name.toLowerCase().includes(q) || p.jobTitle.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.teams.some((t) => t.toLowerCase().includes(q))
      if (!matchesAny) return false
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (values.size === 0) continue
      const def = filterDefs.find((f) => f.key === key)
      if (!def) continue
      const personVal = p[def.field]
      if (Array.isArray(personVal)) {
        if (!personVal.some((v) => values.has(v))) return false
      } else {
        if (!values.has(personVal as string)) return false
      }
    }
    return true
  })

  const activeFilterCount = Object.keys(activeFilters).length

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => { setCopied(false); setMenuOpen(false) }, 1000)
  }

  const handleExportCSV = () => {
    const csv = "Name,Job title,Manager,Department,Location,Teams\n" + filtered.map((p) =>
      `"${p.name}","${p.jobTitle}","${p.manager}","${p.department}","${p.location}","${p.teams.join("; ")}"`
    ).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "people.csv"
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  // Derive options from current people data
  const optionsMap: Record<string, string[]> = {}
  for (const def of filterDefs) {
    optionsMap[def.key] = deriveOptions(people, def.field)
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">People</h1>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          Add people
        </Button>
      </div>

      <AddPeopleDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addPerson} />

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people" className="pl-9" />
      </div>

      {/* Filters — all shown at once, each independently toggleable */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filterDefs.map((def) => (
          <FilterDropdown
            key={def.key}
            def={def}
            options={optionsMap[def.key]}
            selectedValues={activeFilters[def.key] ?? new Set()}
            onToggleValue={toggleFilterValue}
            onRemoveFilter={removeFilter}
          />
        ))}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:underline ml-1"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
          {activeFilterCount > 0 && <span className="text-muted-foreground font-normal"> (filtered)</span>}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("grid")}
            className={`rounded p-1.5 transition-colors ${view === "grid" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded p-1.5 transition-colors ${view === "list" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </button>
          {/* Columns dropdown (list view only) */}
          {view === "list" && (
            <div className="relative">
              <button
                onClick={() => { setColumnsOpen(!columnsOpen); setMenuOpen(false) }}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${columnsOpen ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                Columns
              </button>
              {columnsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setColumnsOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover shadow-lg">
                    <div className="flex items-center border-b px-3 py-2">
                      <input value={colSearch} onChange={(e) => setColSearch(e.target.value)} placeholder="Search" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
                      <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {columnDefs.filter((c) => c.label.toLowerCase().includes(colSearch.toLowerCase())).map((col) => (
                        <button
                          key={col.key}
                          onClick={() => { if (!col.alwaysOn) toggleCol(col.key) }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                        >
                          <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                          <span className="flex-1">{col.label}</span>
                          {col.alwaysOn ? (
                            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <div
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${visibleCols[col.key] ? "bg-green-500" : "bg-muted-foreground/30"}`}
                            >
                              <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${visibleCols[col.key] ? "translate-x-4.5" : "translate-x-1"}`} />
                              {visibleCols[col.key] ? (
                                <svg className="absolute left-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                              ) : (
                                <svg className="absolute right-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              )}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => { setMenuOpen(!menuOpen); setColumnsOpen(false) }}
              className={`rounded p-1.5 transition-colors ${menuOpen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border bg-popover py-1 shadow-lg">
                  <button onClick={handleCopyLink} className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors">
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button onClick={handleExportCSV} className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors">
                    Export CSV
                  </button>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Wrap text</span>
                    <button
                      onClick={() => setWrapText(!wrapText)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${wrapText ? "bg-green-500" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${wrapText ? "translate-x-4.5" : "translate-x-1"}`} />
                      {wrapText ? (
                        <svg className="absolute left-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg className="absolute right-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length > 0 ? (
            filtered.map((person, i) => (
              <div key={`grid-${i}-${person.name}`} className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 cursor-pointer">
                <Avatar className="size-14 rounded-md">
                  <AvatarFallback className="rounded-md bg-blue-600 text-lg font-semibold text-white">{person.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{person.name}</p>
                  {person.jobTitle && <p className="text-xs text-muted-foreground truncate">{person.jobTitle}</p>}
                  {person.department && <p className="text-xs text-muted-foreground truncate">{person.department}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-muted-foreground">No people match the current filters.</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="mt-2 text-sm text-blue-600 hover:underline">Clear all filters</button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                {visibleCols.name && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>}
                {visibleCols.jobTitle && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Job title</th>}
                {visibleCols.manager && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Manager</th>}
                {visibleCols.department && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Department</th>}
                {visibleCols.location && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Location</th>}
                {visibleCols.teams && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Teams</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((person, i) => (
                  <tr key={`list-${i}-${person.name}`} className="border-b last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors">
                    {visibleCols.name && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserProfileCard
                            name={person.name}
                            initials={person.initials}
                            size="sm"
                          />
                          <span className={`text-sm ${wrapText ? "" : "truncate max-w-[200px]"}`}>{person.name}</span>
                        </div>
                      </td>
                    )}
                    {visibleCols.jobTitle && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.jobTitle || "—"}</td>}
                    {visibleCols.manager && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.manager || "—"}</td>}
                    {visibleCols.department && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.department || "—"}</td>}
                    {visibleCols.location && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.location || "—"}</td>}
                    {visibleCols.teams && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.teams.length > 0 ? person.teams.join(", ") : "—"}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No people match the current filters.
                    {activeFilterCount > 0 && (
                      <button onClick={clearAllFilters} className="ml-1 text-blue-600 hover:underline">Clear all filters</button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
