"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  {
    name: "Abhishek Sharma",
    initials: "AS",
    jobTitle: "Engineering Manager",
    manager: "",
    department: "Engineering",
    location: "Bangalore, India",
    teams: ["Platform", "Infrastructure"],
    projects: ["My Scrum Project", "Kanban Project"],
    goals: ["Ship v2.0", "Improve reliability"],
  },
  {
    name: "Sam Williams",
    initials: "SW",
    jobTitle: "Senior Developer",
    manager: "Abhishek Sharma",
    department: "Engineering",
    location: "San Francisco, USA",
    teams: ["Platform"],
    projects: ["My Scrum Project"],
    goals: ["Ship v2.0"],
  },
  {
    name: "Priya Patel",
    initials: "PP",
    jobTitle: "Product Designer",
    manager: "Abhishek Sharma",
    department: "Design",
    location: "Bangalore, India",
    teams: ["Design System"],
    projects: ["My Scrum Project", "Kanban Project"],
    goals: ["Design system v3"],
  },
  {
    name: "Alex Chen",
    initials: "AC",
    jobTitle: "Frontend Developer",
    manager: "Sam Williams",
    department: "Engineering",
    location: "Toronto, Canada",
    teams: ["Platform", "Design System"],
    projects: ["Kanban Project"],
    goals: ["Ship v2.0"],
  },
  {
    name: "Maria Garcia",
    initials: "MG",
    jobTitle: "Backend Developer",
    manager: "Abhishek Sharma",
    department: "Engineering",
    location: "Madrid, Spain",
    teams: ["Infrastructure"],
    projects: ["My Scrum Project"],
    goals: ["Improve reliability"],
  },
  {
    name: "James Wilson",
    initials: "JW",
    jobTitle: "QA Engineer",
    manager: "Sam Williams",
    department: "Quality",
    location: "London, UK",
    teams: ["Platform"],
    projects: ["My Scrum Project", "Kanban Project"],
    goals: ["Ship v2.0"],
  },
  {
    name: "Riya Gupta",
    initials: "RG",
    jobTitle: "Data Analyst",
    manager: "Abhishek Sharma",
    department: "Analytics",
    location: "Bangalore, India",
    teams: ["Analytics"],
    projects: ["Kanban Project"],
    goals: ["Data-driven decisions"],
  },
  {
    name: "Tom Baker",
    initials: "TB",
    jobTitle: "DevOps Engineer",
    manager: "Sam Williams",
    department: "Engineering",
    location: "Sydney, Australia",
    teams: ["Infrastructure"],
    projects: ["My Scrum Project"],
    goals: ["Improve reliability"],
  },
  {
    name: "Emily Davis",
    initials: "ED",
    jobTitle: "Product Manager",
    manager: "",
    department: "Product",
    location: "New York, USA",
    teams: ["Platform", "Analytics"],
    projects: ["My Scrum Project", "Kanban Project"],
    goals: ["Ship v2.0", "Data-driven decisions"],
  },
  {
    name: "Raj Mehta",
    initials: "RM",
    jobTitle: "Senior Developer",
    manager: "Abhishek Sharma",
    department: "Engineering",
    location: "Mumbai, India",
    teams: ["Infrastructure", "Platform"],
    projects: ["My Scrum Project"],
    goals: ["Ship v2.0", "Improve reliability"],
  },
  {
    name: "Sophie Turner",
    initials: "ST",
    jobTitle: "UX Researcher",
    manager: "Emily Davis",
    department: "Design",
    location: "London, UK",
    teams: ["Design System"],
    projects: ["Kanban Project"],
    goals: ["Design system v3"],
  },
  {
    name: "Kevin Park",
    initials: "KP",
    jobTitle: "Full Stack Developer",
    manager: "Sam Williams",
    department: "Engineering",
    location: "Seoul, South Korea",
    teams: ["Platform"],
    projects: ["My Scrum Project", "Kanban Project"],
    goals: ["Ship v2.0"],
  },
]

// ─── Filter definitions ──────────────────────────────────────────────────────

function deriveOptions(people: Person[], field: keyof Person): string[] {
  const set = new Set<string>()
  for (const p of people) {
    const val = p[field]
    if (Array.isArray(val))
      val.forEach((v) => {
        if (v) set.add(v)
      })
    else if (val) set.add(val)
  }
  return [...set].sort()
}

interface FilterDef {
  key: string
  field: keyof Person
  label: string
  chipLabel: string
  placeholder: string
  icon: React.ReactNode
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-red-500",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-orange-500",
  "bg-teal-600",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-600",
  "bg-amber-600",
  "bg-lime-600",
  "bg-fuchsia-600",
]

const filterDefs: FilterDef[] = [
  {
    key: "project",
    field: "projects",
    label: "Filter by Project",
    chipLabel: "Project is",
    placeholder: "Search projects...",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
  },
  {
    key: "goal",
    field: "goals",
    label: "Goal",
    chipLabel: "Goal is",
    placeholder: "Search goals...",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    key: "team",
    field: "teams",
    label: "Team",
    chipLabel: "Team is",
    placeholder: "Search teams...",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    key: "jobtitle",
    field: "jobTitle",
    label: "Job title",
    chipLabel: "Job title is",
    placeholder: "Search job titles...",
    icon: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </>
    ),
  },
  {
    key: "manager",
    field: "manager",
    label: "Manager",
    chipLabel: "Manager is",
    placeholder: "Search managers...",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </>
    ),
  },
  {
    key: "department",
    field: "department",
    label: "Department",
    chipLabel: "Department is",
    placeholder: "Search departments...",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    key: "location",
    field: "location",
    label: "Location",
    chipLabel: "Location is",
    placeholder: "Search locations...",
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
]

// ─── Filter dropdown component ───────────────────────────────────────────────

function FilterDropdown({
  def,
  options,
  selectedValue,
  onSelectValue,
  onRemoveFilter,
  isOpen,
  onToggleOpen,
}: {
  def: FilterDef
  options: string[]
  selectedValue: string | undefined
  onSelectValue: (key: string, value: string) => void
  onRemoveFilter: (key: string) => void
  isOpen: boolean
  onToggleOpen: (key: string | null) => void
}) {
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        onToggleOpen(null)
    }
    if (isOpen) document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [isOpen, onToggleOpen])

  // Form-reset on close (external sync: open/close → UI).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isOpen) setSearch("")
  }, [isOpen])

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )
  const hasValue = !!selectedValue

  return (
    <div className="relative" ref={ref}>
      {hasValue ? (
        /* Active chip: light-blue label part + solid-blue square X */
        <div
          data-testid={`filter-chip-${def.key}`}
          className="flex items-center text-sm"
        >
          <button
            onClick={() => onToggleOpen(def.key)}
            className="flex items-center gap-1.5 rounded-l-md border border-r-0 border-blue-500 bg-blue-50 px-3 py-1.5 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <svg
              className="size-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {def.icon}
            </svg>
            <span className="select-none">
              {def.chipLabel}
              {selectedValue ? ` ${selectedValue}` : ""}
            </span>
          </button>
          <button
            onClick={() => onRemoveFilter(def.key)}
            className="flex items-center justify-center rounded-r-md border border-blue-600 bg-blue-600 px-2 py-1.5 text-white transition-colors hover:bg-blue-700"
          >
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>
      ) : (
        /* Default rectangular outline button */
        <button
          data-testid={`filter-btn-${def.key}`}
          onClick={() => onToggleOpen(def.key)}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent dark:border-gray-700"
        >
          <svg
            className="size-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {def.icon}
          </svg>
          {def.label}
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-lg border bg-popover shadow-lg">
          <div className="border-b p-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={def.placeholder}
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
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No options
              </p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelectValue(def.key, opt)
                  onToggleOpen(null)
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent ${opt === selectedValue ? "font-medium text-blue-600" : ""}`}
              >
                {opt === selectedValue && (
                  <svg
                    className="mr-2 size-3.5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add People Dialog ───────────────────────────────────────────────────────

function AddPeopleDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (name: string) => void
}) {
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
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
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
            <span className="text-blue-600 underline">Terms of Service</span>{" "}
            apply.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAdd}
            disabled={!input.trim()}
          >
            Add
          </Button>
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
    fetch("/api/data/users")
      .then((r) => r.json())
      .then(
        (
          apiUsers: Array<{
            name: string
            displayName?: string
            email?: string
            role?: string
          }>
        ) => {
          const existingNames = new Set(
            hardcodedPeople.map((p) => p.name.toLowerCase())
          )
          const newPeople: Person[] = apiUsers
            .filter(
              (u) => !existingNames.has((u.displayName ?? u.name).toLowerCase())
            )
            .map((u) => ({
              name: u.displayName ?? u.name,
              initials: (u.displayName ?? u.name)
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              jobTitle: u.role ?? "Team Member",
              manager: "",
              department: "General",
              location: "",
              teams: [],
              projects: [],
              goals: [],
            }))
          if (newPeople.length > 0) setPeople((prev) => [...prev, ...newPeople])
        }
      )
      .catch(() => {})
  }, [])
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [colSearch, setColSearch] = useState("")
  const [wrapText, setWrapText] = useState(false)
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    name: true,
    jobTitle: true,
    manager: true,
    department: true,
    location: false,
    teams: false,
  })

  // Single-select filter state: { filterKey -> selected value }
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const selectFilterValue = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
  }

  const removeFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setOpenFilter(null)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setOpenFilter(null)
  }

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
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    setPeople((prev) => [
      ...prev,
      {
        name,
        initials,
        jobTitle: "",
        manager: "",
        department: "",
        location: "",
        teams: [],
        projects: [],
        goals: [],
      },
    ])
  }

  // Apply search + all active filters (single-select)
  const filtered = people.filter((p) => {
    if (search) {
      const q = search.toLowerCase()
      const matchesAny =
        p.name.toLowerCase().includes(q) ||
        p.jobTitle.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.teams.some((t) => t.toLowerCase().includes(q))
      if (!matchesAny) return false
    }
    for (const [key, value] of Object.entries(activeFilters)) {
      if (!value) continue
      const def = filterDefs.find((f) => f.key === key)
      if (!def) continue
      const personVal = p[def.field]
      if (Array.isArray(personVal)) {
        if (!personVal.includes(value)) return false
      } else {
        if (personVal !== value) return false
      }
    }
    return true
  })

  const activeFilterCount = Object.keys(activeFilters).length

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setMenuOpen(false)
    }, 1000)
  }

  const handleExportCSV = () => {
    const csv =
      "Name,Job title,Manager,Department,Location,Teams\n" +
      filtered
        .map(
          (p) =>
            `"${p.name}","${p.jobTitle}","${p.manager}","${p.department}","${p.location}","${p.teams.join("; ")}"`
        )
        .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "people.csv"
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  const optionsMap: Record<string, string[]> = {}
  for (const def of filterDefs) {
    optionsMap[def.key] = deriveOptions(people, def.field)
  }

  return (
    <div className="max-w-5xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">People</h1>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          Add people
        </Button>
      </div>

      <AddPeopleDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addPerson}
      />

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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people"
          className="pl-9"
        />
      </div>

      {/* Filters — default: all buttons; active: only chips for applied filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {activeFilterCount === 0
          ? filterDefs.map((def) => (
              <FilterDropdown
                key={def.key}
                def={def}
                options={optionsMap[def.key]}
                selectedValue={undefined}
                onSelectValue={selectFilterValue}
                onRemoveFilter={removeFilter}
                isOpen={openFilter === def.key}
                onToggleOpen={setOpenFilter}
              />
            ))
          : filterDefs
              .filter((def) => activeFilters[def.key])
              .map((def) => (
                <FilterDropdown
                  key={def.key}
                  def={def}
                  options={optionsMap[def.key]}
                  selectedValue={activeFilters[def.key]}
                  onSelectValue={selectFilterValue}
                  onRemoveFilter={removeFilter}
                  isOpen={openFilter === def.key}
                  onToggleOpen={setOpenFilter}
                />
              ))}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
          {activeFilterCount > 0 && (
            <span className="font-normal text-muted-foreground">
              {" "}
              (filtered)
            </span>
          )}
        </p>
        <div className="flex items-center">
          <button
            onClick={() => setView("grid")}
            className={`rounded-l-lg border border-r-0 p-2 transition-colors ${view === "grid" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`border border-r-0 p-2 transition-colors ${view === "list" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
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
          {/* Columns dropdown (list view only) */}
          {view === "list" && (
            <div className="relative">
              <button
                onClick={() => {
                  setColumnsOpen(!columnsOpen)
                  setMenuOpen(false)
                }}
                className={`flex items-center gap-1 border border-r-0 p-2 text-xs transition-colors ${columnsOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                Columns
              </button>
              {columnsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setColumnsOpen(false)}
                  />
                  <div className="absolute top-full right-0 z-50 mt-1 w-56 rounded-lg border bg-popover shadow-lg">
                    <div className="flex items-center border-b px-3 py-2">
                      <input
                        value={colSearch}
                        onChange={(e) => setColSearch(e.target.value)}
                        placeholder="Search"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        autoFocus
                      />
                      <svg
                        className="size-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {columnDefs
                        .filter((c) =>
                          c.label
                            .toLowerCase()
                            .includes(colSearch.toLowerCase())
                        )
                        .map((col) => (
                          <button
                            key={col.key}
                            onClick={() => {
                              if (!col.alwaysOn) toggleCol(col.key)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                          >
                            <svg
                              className="size-4 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span className="flex-1">{col.label}</span>
                            {col.alwaysOn ? (
                              <svg
                                className="size-4 text-muted-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <div
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${visibleCols[col.key] ? "bg-green-500" : "bg-muted-foreground/30"}`}
                              >
                                <span
                                  className={`inline-block size-3.5 rounded-full bg-white transition-transform ${visibleCols[col.key] ? "translate-x-4.5" : "translate-x-1"}`}
                                />
                                {visibleCols[col.key] ? (
                                  <svg
                                    className="absolute left-0.5 size-3 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="absolute right-0.5 size-3 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
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
              onClick={() => {
                setMenuOpen(!menuOpen)
                setColumnsOpen(false)
              }}
              className={`rounded-r-lg border p-2 transition-colors ${menuOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute top-full right-0 z-50 mt-1 w-44 rounded-md border bg-popover py-1 shadow-lg">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    Export CSV
                  </button>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Wrap text</span>
                    <button
                      onClick={() => setWrapText(!wrapText)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${wrapText ? "bg-green-500" : "bg-muted-foreground/30"}`}
                    >
                      <span
                        className={`inline-block size-3.5 rounded-full bg-white transition-transform ${wrapText ? "translate-x-4.5" : "translate-x-1"}`}
                      />
                      {wrapText ? (
                        <svg
                          className="absolute left-0.5 size-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          className="absolute right-0.5 size-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map((person, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <div
                  key={`grid-${i}-${person.name}`}
                  data-testid="person-card"
                  className="flex cursor-pointer overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-sm"
                >
                  {/* Left: full-height color block */}
                  <div
                    data-testid="person-card-avatar-block"
                    className={`flex w-20 shrink-0 items-center justify-center ${color}`}
                  >
                    <span className="text-xl font-bold text-white select-none">
                      {person.initials}
                    </span>
                  </div>
                  {/* Right: details vertically centered */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                    <p className="truncate text-sm font-semibold">
                      {person.name}
                    </p>
                    {person.jobTitle && (
                      <p className="truncate text-xs text-muted-foreground">
                        {person.jobTitle}
                      </p>
                    )}
                    {person.department && (
                      <p className="truncate text-xs text-muted-foreground">
                        {person.department}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No people match the current filters.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                {visibleCols.name && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                )}
                {visibleCols.jobTitle && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    Job title
                  </th>
                )}
                {visibleCols.manager && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    Manager
                  </th>
                )}
                {visibleCols.department && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    Department
                  </th>
                )}
                {visibleCols.location && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    Location
                  </th>
                )}
                {visibleCols.teams && (
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    Teams
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((person, i) => (
                  <tr
                    key={`list-${i}-${person.name}`}
                    className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-accent/50"
                  >
                    {visibleCols.name && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserProfileCard
                            name={person.name}
                            initials={person.initials}
                            size="sm"
                          />
                          <span
                            className={`text-sm ${wrapText ? "" : "max-w-[200px] truncate"}`}
                          >
                            {person.name}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleCols.jobTitle && (
                      <td
                        className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "max-w-[150px] truncate"}`}
                      >
                        {person.jobTitle || "—"}
                      </td>
                    )}
                    {visibleCols.manager && (
                      <td
                        className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "max-w-[150px] truncate"}`}
                      >
                        {person.manager || "—"}
                      </td>
                    )}
                    {visibleCols.department && (
                      <td
                        className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "max-w-[150px] truncate"}`}
                      >
                        {person.department || "—"}
                      </td>
                    )}
                    {visibleCols.location && (
                      <td
                        className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "max-w-[150px] truncate"}`}
                      >
                        {person.location || "—"}
                      </td>
                    )}
                    {visibleCols.teams && (
                      <td
                        className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "max-w-[150px] truncate"}`}
                      >
                        {person.teams.length > 0
                          ? person.teams.join(", ")
                          : "—"}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No people match the current filters.
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="ml-1 text-blue-600 hover:underline"
                      >
                        Clear all filters
                      </button>
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
