"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function fmtDate(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

function calGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay()
  const count = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(first).fill(null)
  for (let i = 1; i <= count; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function addYears(d: Date, n: number) {
  return new Date(d.getFullYear() + n, d.getMonth(), 1)
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArchivedGoal {
  id: string
  name: string
  description: string
  status: string
  progress: number
  targetDate: string
  owner: { name: string; initials: string; color: string }
  following: boolean
  archivedDate: string
}

// ─── Static option data ───────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "OFF TRACK", badgeClass: "bg-[#ff5630] text-white" },
  { value: "AT RISK", badgeClass: "bg-[#ffc400] text-[#172b4d]" },
  { value: "ON TRACK", badgeClass: "bg-[#36b37e] text-white" },
  { value: "PENDING", badgeClass: "" },
  { value: "PAUSED", badgeClass: "" },
  { value: "COMPLETED", badgeClass: "" },
  { value: "CANCELLED", badgeClass: "" },
]

const OWNER_OPTIONS = [
  { name: "Theta Computer", initials: "TC", color: "bg-teal-500" },
  { name: "vijay2", initials: "V2", color: "bg-red-500" },
]

const TEAM_OPTIONS = [
  { id: "t1", name: "geeta", color: "bg-pink-300" },
  { id: "t2", name: "geeta", color: "bg-pink-400" },
  { id: "t3", name: "geeta2", color: "bg-pink-500" },
  { id: "t4", name: "vijay", color: "bg-yellow-400" },
  { id: "t5", name: "vijay", color: "bg-orange-400" },
]

const statusColors: Record<string, string> = {
  "ON TRACK": "bg-[#36b37e] text-white",
  "AT RISK": "bg-[#ffc400] text-[#172b4d]",
  "OFF TRACK": "bg-[#ff5630] text-white",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  PENDING: "bg-gray-200 text-gray-700",
  PAUSED: "bg-gray-200 text-gray-700",
}

const initialArchivedGoals: ArchivedGoal[] = [
  {
    id: "arch-1",
    name: "Reduce customer churn by 15%",
    description: "Focus on improving retention through better onboarding.",
    status: "AT RISK",
    progress: 72,
    targetDate: "Sep 2026",
    owner: { name: "Theta Computer", initials: "TC", color: "bg-teal-500" },
    following: true,
    archivedDate: "Mar 12, 2026",
  },
  {
    id: "arch-2",
    name: "Complete infrastructure migration to AWS",
    description: "Migrate all legacy on-prem services to AWS EKS.",
    status: "COMPLETED",
    progress: 100,
    targetDate: "Feb 2026",
    owner: { name: "vijay2", initials: "V2", color: "bg-red-500" },
    following: true,
    archivedDate: "Feb 28, 2026",
  },
  {
    id: "arch-3",
    name: "Launch mobile app v2.0",
    description: "Ship redesigned mobile experience with offline mode.",
    status: "CANCELLED",
    progress: 45,
    targetDate: "Jan 2026",
    owner: { name: "Theta Computer", initials: "TC", color: "bg-teal-500" },
    following: false,
    archivedDate: "Jan 15, 2026",
  },
]

// ─── Filter definitions ───────────────────────────────────────────────────────

interface FilterDef {
  id: string
  label: string
  chipLabel: string
  placeholder: string
  icon: React.ReactNode
}

const filterDefs: FilterDef[] = [
  {
    id: "tag",
    label: "Filter by Tag",
    chipLabel: "Tag",
    placeholder: "Choose a tag",
    icon: (
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
  },
  {
    id: "status",
    label: "Status",
    chipLabel: "Status",
    placeholder: "Choose a status",
    icon: (
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    id: "owner",
    label: "Owner",
    chipLabel: "Owner",
    placeholder: "Choose an owner",
    icon: (
      <svg
        className="size-3.5 shrink-0"
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
  {
    id: "team",
    label: "Team",
    chipLabel: "Team",
    placeholder: "Choose a team",
    icon: (
      <svg
        className="size-3.5 shrink-0"
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
    id: "following",
    label: "Following",
    chipLabel: "Following",
    placeholder: "",
    icon: (
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: "starred",
    label: "Starred",
    chipLabel: "Starred",
    placeholder: "",
    icon: (
      <svg
        className="size-3.5 shrink-0"
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
    id: "metric",
    label: "Metric",
    chipLabel: "Metric",
    placeholder: "Choose a metric",
    icon: (
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "reporting",
    label: "Reporting line",
    chipLabel: "Reporting line",
    placeholder: "",
    icon: (
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
]

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
  { id: "target date", label: "Target date" },
  { id: "following", label: "Following" },
  { id: "last updated", label: "Last updated" },
  { id: "follower count", label: "Follower count" },
]

// ─── Calendar panel sub-component ────────────────────────────────────────────

function CalendarPanel({
  label,
  month,
  selected,
  onNavigate,
  onSelect,
}: {
  label: string
  month: Date
  selected: Date
  onNavigate: (d: Date) => void
  onSelect: (d: Date) => void
}) {
  const grid = calGrid(month.getFullYear(), month.getMonth())
  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-[13px] font-semibold text-[#172b4d]">
        {label}
      </p>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          <button
            onClick={() => onNavigate(addYears(month, -1))}
            className="rounded p-1 text-xs text-[#626f86] hover:bg-[#f4f5f7]"
            title="Previous year"
          >
            {"<<"}
          </button>
          <button
            onClick={() => onNavigate(addMonths(month, -1))}
            className="rounded p-1 text-xs text-[#626f86] hover:bg-[#f4f5f7]"
            title="Previous month"
          >
            {"<"}
          </button>
        </div>
        <span className="text-[13px] font-semibold text-[#172b4d]">
          {MONTHS_LONG[month.getMonth()]} {month.getFullYear()}
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => onNavigate(addMonths(month, 1))}
            className="rounded p-1 text-xs text-[#626f86] hover:bg-[#f4f5f7]"
            title="Next month"
          >
            {">"}
          </button>
          <button
            onClick={() => onNavigate(addYears(month, 1))}
            className="rounded p-1 text-xs text-[#626f86] hover:bg-[#f4f5f7]"
            title="Next year"
          >
            {">>"}
          </button>
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="py-0.5 text-center text-[11px] font-medium text-[#626f86]"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {grid.map((day, i) => {
          if (!day) return <div key={i} />
          const thisDate = new Date(month.getFullYear(), month.getMonth(), day)
          const isSelected = isSameDay(thisDate, selected)
          return (
            <button
              key={i}
              onClick={() => onSelect(thisDate)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition-colors ${
                isSelected
                  ? "bg-[#0052cc] font-semibold text-white"
                  : "text-[#172b4d] hover:bg-[#f4f5f7]"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ArchivedGoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<ArchivedGoal[]>(initialArchivedGoals)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "timeline">("timeline")
  const [columns, setColumns] = useState([
    { id: "status", label: "Status", enabled: true },
    { id: "progress", label: "Progress", enabled: true },
    { id: "target_date", label: "Target date", enabled: true },
    { id: "owner", label: "Owner", enabled: true },
    { id: "following", label: "Following", enabled: true },
  ])

  // Filter values
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null)
  const [teamFilter, setTeamFilter] = useState<string | null>(null)
  const [followingFilter, setFollowingFilter] = useState(false)
  const [starredFilter, setStarredFilter] = useState(false)
  const [reportingFilter, setReportingFilter] = useState(false) // inactive by default
  const [tagChipActive, setTagChipActive] = useState(false)
  const [metricChipActive, setMetricChipActive] = useState(false)

  // Which filter dropdown is open
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [filterSearch, setFilterSearch] = useState("")

  // Timeline controls
  const [rangeStart, setRangeStart] = useState(new Date(2025, 11, 16)) // Dec 16 2025
  const [rangeEnd, setRangeEnd] = useState(new Date(2027, 5, 16)) // Jun 16 2027
  const [leftCalMonth, setLeftCalMonth] = useState(new Date(2025, 11, 1))
  const [rightCalMonth, setRightCalMonth] = useState(new Date(2027, 5, 1))
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [viewBy, setViewBy] = useState("Months")
  const [viewByOpen, setViewByOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sortSearch, setSortSearch] = useState("")

  const filterBarRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)

  // Close filter dropdowns on outside click or Escape
  useEffect(() => {
    if (!openFilter) return
    const mouseHandler = (e: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      ) {
        setOpenFilter(null)
        setFilterSearch("")
      }
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenFilter(null)
        setFilterSearch("")
      }
    }
    document.addEventListener("mousedown", mouseHandler)
    document.addEventListener("keydown", keyHandler)
    return () => {
      document.removeEventListener("mousedown", mouseHandler)
      document.removeEventListener("keydown", keyHandler)
    }
  }, [openFilter])

  // Close controls dropdowns on outside click
  useEffect(() => {
    if (!datePickerOpen && !viewByOpen && !sortOpen) return
    const handler = (e: MouseEvent) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(e.target as Node)
      ) {
        setDatePickerOpen(false)
        setViewByOpen(false)
        setSortOpen(false)
        setSortSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [datePickerOpen, viewByOpen, sortOpen])

  // ── Filter helpers ────────────────────────────────────────────────────────

  const getFilterValue = (id: string): string | null => {
    if (id === "status") return statusFilter
    if (id === "owner") return ownerFilter
    if (id === "team") return teamFilter
    return null
  }

  const isFilterActive = (id: string): boolean => {
    if (id === "status") return statusFilter !== null
    if (id === "owner") return ownerFilter !== null
    if (id === "team") return teamFilter !== null
    if (id === "following") return followingFilter
    if (id === "starred") return starredFilter
    if (id === "reporting") return reportingFilter
    if (id === "tag") return tagChipActive
    if (id === "metric") return metricChipActive
    return false
  }

  const isChipShown = (id: string) => isFilterActive(id) || openFilter === id
  const anyChipActive = filterDefs.some((f) => isChipShown(f.id))

  const handleFilterBtn = (id: string) => {
    if (id === "following") {
      setFollowingFilter((v) => !v)
      return
    }
    if (id === "starred") {
      setStarredFilter((v) => !v)
      return
    }
    if (id === "reporting") {
      if (!reportingFilter) {
        setReportingFilter(true)
        setOpenFilter("reporting")
        setFilterSearch("")
        return
      }
      if (openFilter === "reporting") {
        setOpenFilter(null)
        setFilterSearch("")
      } else {
        setOpenFilter("reporting")
        setFilterSearch("")
      }
      return
    }
    if (id === "tag") {
      if (!tagChipActive) {
        setTagChipActive(true)
        setOpenFilter("tag")
        setFilterSearch("")
        return
      }
      if (openFilter === "tag") {
        setOpenFilter(null)
        setFilterSearch("")
      } else {
        setOpenFilter("tag")
        setFilterSearch("")
      }
      return
    }
    if (id === "metric") {
      if (!metricChipActive) {
        setMetricChipActive(true)
        setOpenFilter("metric")
        setFilterSearch("")
        return
      }
      if (openFilter === "metric") {
        setOpenFilter(null)
        setFilterSearch("")
      } else {
        setOpenFilter("metric")
        setFilterSearch("")
      }
      return
    }
    if (openFilter === id) {
      setOpenFilter(null)
      setFilterSearch("")
    } else {
      setOpenFilter(id)
      setFilterSearch("")
    }
  }

  const clearFilter = (id: string) => {
    if (id === "status") setStatusFilter(null)
    else if (id === "owner") setOwnerFilter(null)
    else if (id === "team") setTeamFilter(null)
    else if (id === "following") setFollowingFilter(false)
    else if (id === "starred") setStarredFilter(false)
    else if (id === "reporting") setReportingFilter(false)
    else if (id === "tag") setTagChipActive(false)
    else if (id === "metric") setMetricChipActive(false)
    if (openFilter === id) {
      setOpenFilter(null)
      setFilterSearch("")
    }
  }

  const clearFilters = () => {
    setStatusFilter(null)
    setOwnerFilter(null)
    setTeamFilter(null)
    setFollowingFilter(false)
    setStarredFilter(false)
    setReportingFilter(false)
    setTagChipActive(false)
    setMetricChipActive(false)
    setSearch("")
    setOpenFilter(null)
  }

  // ── Filtered / sorted goals ───────────────────────────────────────────────

  const filteredGoals = goals
    .filter(
      (g) =>
        !search ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.owner.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((g) => !statusFilter || g.status === statusFilter)
    .filter((g) => !ownerFilter || g.owner.name === ownerFilter)
    .filter(() => !teamFilter)
    .filter((g) => !followingFilter || g.following)
    .filter(() => !tagChipActive)
    .filter(() => !metricChipActive)
    .filter(() => !reportingFilter)
    .slice()
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir
      if (sortBy === "status") return a.status.localeCompare(b.status) * dir
      if (sortBy === "target date")
        return a.targetDate.localeCompare(b.targetDate) * dir
      if (sortBy === "following")
        return (a.following === b.following ? 0 : a.following ? -1 : 1) * dir
      return 0
    })

  // ── Actions ───────────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleRestore = (id: string) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      showToast(`"${goal.name}" has been restored`)
    }
  }

  const handleDelete = (id: string) => {
    const goal = goals.find((g) => g.id === id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setDeleteConfirmId(null)
    if (goal) showToast(`"${goal.name}" has been permanently deleted`)
  }

  const toggleFollow = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, following: !g.following } : g))
    )
  }

  // ── Filter dropdown content ───────────────────────────────────────────────

  function renderDropdown(id: string) {
    const def = filterDefs.find((f) => f.id === id)
    if (!def) return null
    const lc = filterSearch.toLowerCase()
    const panelClass =
      "absolute left-0 top-full z-50 mt-1 w-64 rounded-[3px] border border-[#dfe1e6] bg-white dark:bg-popover shadow-[0_4px_16px_rgba(9,30,66,0.18)]"
    const searchInput = (
      <div className="flex items-center gap-2 border-b border-[#dfe1e6] px-3 py-2">
        <input
          autoFocus
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder={def.placeholder}
          className="flex-1 bg-transparent text-[13px] text-[#172b4d] outline-none placeholder:text-[#626f86] dark:text-foreground"
        />
        <svg
          className="size-4 shrink-0 text-[#626f86]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    )

    if (id === "tag" || id === "metric") {
      return (
        <div className={panelClass}>
          {searchInput}
          <div className="px-3 py-3 text-[13px] text-[#626f86]">No options</div>
        </div>
      )
    }

    if (id === "reporting") {
      return (
        <div
          data-testid="reporting-popover"
          className="absolute top-full left-0 z-50 mt-1 w-72 rounded-[3px] border border-[#dfe1e6] bg-white p-5 text-center shadow-[0_4px_16px_rgba(9,30,66,0.18)] dark:bg-popover"
        >
          <div
            data-testid="reporting-org-chart"
            className="mb-4 flex flex-col items-center"
          >
            <div className="mb-2">
              <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="22" cy="22" r="22" fill="#f4bfb6" />
                <circle cx="22" cy="19" r="9" fill="#f4a98f" />
                <ellipse cx="22" cy="12" rx="9" ry="6" fill="#e05c3a" />
                <path
                  d="M8 44c0-7.732 6.268-14 14-14s14 6.268 14 14"
                  fill="#e8734a"
                />
              </svg>
            </div>
            <svg
              width="120"
              height="28"
              viewBox="0 0 120 28"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="60"
                y1="0"
                x2="60"
                y2="10"
                stroke="#c1c7d0"
                strokeWidth="2"
              />
              <line
                x1="20"
                y1="10"
                x2="100"
                y2="10"
                stroke="#c1c7d0"
                strokeWidth="2"
              />
              <line
                x1="20"
                y1="10"
                x2="20"
                y2="28"
                stroke="#c1c7d0"
                strokeWidth="2"
              />
              <line
                x1="60"
                y1="10"
                x2="60"
                y2="28"
                stroke="#c1c7d0"
                strokeWidth="2"
              />
              <line
                x1="100"
                y1="10"
                x2="100"
                y2="28"
                stroke="#c1c7d0"
                strokeWidth="2"
              />
            </svg>
            <div className="flex items-center gap-2">
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="19" cy="19" r="19" fill="#5d4037" />
                <circle cx="19" cy="16" r="7" fill="#8d6e63" />
                <ellipse cx="19" cy="11" rx="7" ry="4.5" fill="#3e2723" />
                <path
                  d="M6 38c0-7.18 5.82-13 13-13s13 5.82 13 13"
                  fill="#6d4c41"
                />
              </svg>
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="19" cy="19" r="19" fill="#f4d9b0" />
                <circle cx="19" cy="16" r="7" fill="#e8b88a" />
                <ellipse cx="19" cy="11" rx="7" ry="5" fill="#6d4c41" />
                <path
                  d="M6 38c0-7.18 5.82-13 13-13s13 5.82 13 13"
                  fill="#9e6b3e"
                />
              </svg>
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="19" cy="19" r="19" fill="#e8d5f5" />
                <circle cx="19" cy="16" r="7" fill="#f5cba7" />
                <ellipse cx="19" cy="11" rx="7.5" ry="5" fill="#7c3aed" />
                <path
                  d="M6 38c0-7.18 5.82-13 13-13s13 5.82 13 13"
                  fill="#8b5cf6"
                />
              </svg>
            </div>
          </div>
          <p
            data-testid="reporting-popover-heading"
            className="mb-2 text-[14px] leading-snug font-semibold text-[#172b4d] dark:text-foreground"
          >
            Stay across the projects your reports work on
          </p>
          <p
            data-testid="reporting-popover-body"
            className="mb-4 text-[13px] leading-snug text-[#626f86]"
          >
            Connect your identity provider to get started
          </p>
          <a
            data-testid="show-me-how-btn"
            href="https://support.atlassian.com/platform-experiences/docs/sync-the-manager-attribute-into-atlassian-home/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Show me how to connect an identity provider"
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] focus:ring-2 focus:ring-[#0052cc] focus:ring-offset-1 focus:outline-none dark:text-foreground"
          >
            Show me how
            <svg
              aria-hidden="true"
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      )
    }

    if (id === "status") {
      const opts = STATUS_OPTIONS.filter(
        (o) => !lc || o.value.toLowerCase().includes(lc)
      )
      return (
        <div className={panelClass}>
          {searchInput}
          <div className="max-h-64 overflow-y-auto py-1">
            {opts.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-[#626f86]">
                No options
              </div>
            ) : (
              opts.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setOpenFilter(null)
                    setFilterSearch("")
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    statusFilter === opt.value
                      ? "bg-[#e9f2ff]"
                      : i === 0
                        ? "bg-[#f4f5f7] hover:bg-[#ebecf0]"
                        : "hover:bg-[#f4f5f7]"
                  }`}
                >
                  {opt.badgeClass ? (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${opt.badgeClass}`}
                    >
                      {opt.value}
                    </span>
                  ) : (
                    <span className="text-[13px] font-bold text-[#172b4d] uppercase dark:text-foreground">
                      {opt.value}
                    </span>
                  )}
                  {statusFilter === opt.value && (
                    <svg
                      className="ml-auto size-3.5 text-[#0052cc]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )
    }

    if (id === "owner") {
      const opts = OWNER_OPTIONS.filter(
        (o) => !lc || o.name.toLowerCase().includes(lc)
      )
      return (
        <div className={panelClass}>
          {searchInput}
          <div className="max-h-64 overflow-y-auto py-1">
            {opts.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-[#626f86]">
                No options
              </div>
            ) : (
              opts.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => {
                    setOwnerFilter(opt.name)
                    setOpenFilter(null)
                    setFilterSearch("")
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${ownerFilter === opt.name ? "bg-[#e9f2ff]" : "hover:bg-[#f4f5f7]"}`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${opt.color}`}
                  >
                    {opt.initials}
                  </span>
                  <span className="text-[13px] text-[#172b4d] dark:text-foreground">
                    {opt.name}
                  </span>
                  {ownerFilter === opt.name && (
                    <svg
                      className="ml-auto size-3.5 text-[#0052cc]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )
    }

    if (id === "team") {
      const opts = TEAM_OPTIONS.filter(
        (o) => !lc || o.name.toLowerCase().includes(lc)
      )
      return (
        <div className={panelClass}>
          {searchInput}
          <div className="max-h-64 overflow-y-auto py-1">
            {opts.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setTeamFilter(opt.name)
                  setOpenFilter(null)
                  setFilterSearch("")
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${teamFilter === opt.name ? "bg-[#e9f2ff]" : "hover:bg-[#f4f5f7]"}`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded ${opt.color}`}
                >
                  <svg
                    className="size-3.5 text-white"
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
                </span>
                <span className="text-[13px] text-[#172b4d] dark:text-foreground">
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? sortBy
  const filteredSortOptions = SORT_OPTIONS.filter(
    (o) =>
      !sortSearch || o.label.toLowerCase().includes(sortSearch.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-2 rounded-lg border bg-background px-5 py-3 text-sm font-medium shadow-lg fade-in slide-in-from-bottom-2">
          <svg
            className="size-4 shrink-0 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}

      {/* Title + Create goal */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#172b4d] dark:text-foreground">
          Archived
        </h1>
        <button
          onClick={() => router.push("/goals")}
          className="rounded-[3px] border border-[#dfe1e6] px-3 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
        >
          Create goal
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#626f86]"
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
          placeholder="Search goals"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[3px] border border-[#dfe1e6] bg-background py-2 pr-3 pl-9 text-[13px] text-[#172b4d] transition-shadow outline-none placeholder:text-[#626f86] focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/20 dark:text-foreground"
        />
      </div>

      {/* Filter row */}
      <div
        ref={filterBarRef}
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        {filterDefs.map((f) => {
          const chipShown = isChipShown(f.id)
          const filterVal = getFilterValue(f.id)

          if (chipShown) {
            return (
              <div key={f.id} className="relative">
                <div className="flex items-center gap-1">
                  <button
                    data-testid={
                      f.id === "reporting"
                        ? "reporting-filter-chip"
                        : `${f.id}-filter-chip`
                    }
                    onClick={() => handleFilterBtn(f.id)}
                    className="flex items-center gap-1 rounded-l-[3px] border border-[#0052cc] bg-[#e9f2ff] px-2.5 py-1.5 text-[13px] font-medium text-[#0052cc] transition-colors hover:bg-[#cce0ff]"
                  >
                    {f.icon}
                    <span className="ml-0.5">
                      {f.chipLabel}
                      {f.id === "reporting" ? " for" : " is"}
                      {filterVal ? ` ${filterVal}` : ""}
                    </span>
                  </button>
                  <button
                    data-testid={
                      f.id === "reporting"
                        ? "reporting-filter-x"
                        : `${f.id}-filter-x`
                    }
                    onClick={() => clearFilter(f.id)}
                    aria-label={`Remove ${f.chipLabel} filter`}
                    className="flex items-center justify-center rounded-r-[3px] border border-l-0 border-[#0052cc] bg-[#0052cc] px-1.5 py-1.5 text-white transition-colors hover:bg-[#0747a6]"
                  >
                    <svg
                      aria-hidden="true"
                      className="size-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                {openFilter === f.id && renderDropdown(f.id)}
              </div>
            )
          }

          // Inactive button — hide when any chip is active
          if (anyChipActive) return null
          const isActiveToggle = isFilterActive(f.id)
          return (
            <button
              key={f.id}
              data-testid={`filter-btn-${f.id}`}
              onClick={() => handleFilterBtn(f.id)}
              className={`flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-[13px] transition-colors ${
                isActiveToggle
                  ? "border-[#0052cc] bg-[#e9f2ff] text-[#0052cc]"
                  : "border-[#dfe1e6] text-[#626f86] hover:bg-[#f4f5f7] hover:text-[#172b4d]"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          )
        })}

        {/* Reset — always shown (plain text button) */}
        {!anyChipActive && (
          <button
            onClick={clearFilters}
            className="px-1 py-1.5 text-[13px] text-[#626f86] transition-colors hover:text-[#172b4d]"
          >
            Reset
          </button>
        )}
      </div>

      {/* Controls row */}
      <div ref={controlsRef} className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#172b4d] dark:text-foreground">
          {filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-2">
          {/* ── Timeline-only controls ── */}
          {viewMode === "timeline" && (
            <>
              {/* Date range button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setDatePickerOpen((v) => !v)
                    setViewByOpen(false)
                    setSortOpen(false)
                  }}
                  className={`rounded-[3px] border px-3 py-1.5 text-[13px] text-[#172b4d] transition-colors dark:text-foreground ${
                    datePickerOpen
                      ? "border-[#0052cc] bg-[#e9f2ff] text-[#0052cc]"
                      : "border-[#dfe1e6] hover:bg-[#f4f5f7]"
                  }`}
                >
                  {fmtDate(rangeStart)} - {fmtDate(rangeEnd)}
                </button>
                {datePickerOpen && (
                  <div className="absolute top-full right-0 z-50 mt-1 rounded-[3px] border border-[#dfe1e6] bg-white p-5 shadow-[0_4px_16px_rgba(9,30,66,0.18)] dark:bg-popover">
                    <div className="flex gap-10">
                      <CalendarPanel
                        label="Start"
                        month={leftCalMonth}
                        selected={rangeStart}
                        onNavigate={setLeftCalMonth}
                        onSelect={(d) => {
                          setRangeStart(d)
                          setLeftCalMonth(
                            new Date(d.getFullYear(), d.getMonth(), 1)
                          )
                        }}
                      />
                      <CalendarPanel
                        label="End"
                        month={rightCalMonth}
                        selected={rangeEnd}
                        onNavigate={setRightCalMonth}
                        onSelect={(d) => {
                          setRangeEnd(d)
                          setRightCalMonth(
                            new Date(d.getFullYear(), d.getMonth(), 1)
                          )
                        }}
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setDatePickerOpen(false)}
                        className="w-full rounded-[3px] bg-[#0052cc] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0747a6]"
                      >
                        {fmtDate(rangeStart)} - {fmtDate(rangeEnd)}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* View by dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setViewByOpen((v) => !v)
                    setDatePickerOpen(false)
                    setSortOpen(false)
                  }}
                  className={`flex items-center gap-1 rounded-[3px] border px-3 py-1.5 text-[13px] transition-colors ${
                    viewByOpen
                      ? "border-[#0052cc] bg-[#e9f2ff] text-[#0052cc]"
                      : "border-[#dfe1e6] text-[#626f86] hover:bg-[#f4f5f7]"
                  }`}
                >
                  View by {viewBy}
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {viewByOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-36 rounded-[3px] border border-[#dfe1e6] bg-white py-1 shadow-[0_4px_16px_rgba(9,30,66,0.18)] dark:bg-popover">
                    {["Months", "Quarters", "Years"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setViewBy(opt)
                          setViewByOpen(false)
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition-colors ${viewBy === opt ? "bg-[#e9f2ff] text-[#0052cc]" : "text-[#172b4d] hover:bg-[#f4f5f7]"}`}
                      >
                        {opt}
                        {viewBy === opt && (
                          <svg
                            className="size-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* View toggle: list | timeline (always shown) */}
          <div className="flex rounded-[3px] border border-[#dfe1e6]">
            <button
              onClick={() => setViewMode("list")}
              title="Display as list"
              className={`rounded-l-[3px] border-r border-[#dfe1e6] px-2 py-1.5 transition-colors ${viewMode === "list" ? "bg-[#e9f2ff]" : "text-[#626f86] hover:bg-[#f4f5f7]"}`}
            >
              <svg
                className={`size-4 ${viewMode === "list" ? "text-[#0052cc]" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="9" y1="6" x2="21" y2="6" />
                <line x1="9" y1="12" x2="21" y2="12" />
                <line x1="9" y1="18" x2="21" y2="18" />
                <circle cx="5" cy="6" r="1" fill="currentColor" />
                <circle cx="5" cy="12" r="1" fill="currentColor" />
                <circle cx="5" cy="18" r="1" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              title="Display as timeline"
              className={`rounded-r-[3px] px-2 py-1.5 transition-colors ${viewMode === "timeline" ? "bg-[#e9f2ff]" : "text-[#626f86] hover:bg-[#f4f5f7]"}`}
            >
              <svg
                className={`size-4 ${viewMode === "timeline" ? "text-[#0052cc]" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="7" y1="12" x2="21" y2="12" />
                <line x1="11" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── List view: single-button sort with DropdownMenu ── */}
          {viewMode === "list" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-1.5 rounded-[3px] border border-[#dfe1e6] px-3 py-1.5 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground">
                    Sort by {currentSortLabel}
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={
                      sortBy === opt.id
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                        : ""
                    }
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* ── Timeline view: split sort button + arrow ── */}
          {viewMode === "timeline" && (
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  setSortOpen((v) => !v)
                  setDatePickerOpen(false)
                  setViewByOpen(false)
                }}
                className={`rounded-l-[3px] border px-3 py-1.5 text-[13px] transition-colors ${
                  sortOpen
                    ? "border-[#0052cc] bg-[#e9f2ff] text-[#0052cc]"
                    : "border-[#dfe1e6] text-[#172b4d] hover:bg-[#f4f5f7] dark:text-foreground"
                }`}
              >
                Sort by {currentSortLabel}
              </button>
              <button
                onClick={() => setSortAsc((v) => !v)}
                className="rounded-r-[3px] border border-l-0 border-[#dfe1e6] px-2 py-1.5 text-[#626f86] transition-colors hover:bg-[#f4f5f7]"
                title={sortAsc ? "Ascending" : "Descending"}
              >
                {sortAsc ? (
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

              {/* Sort dropdown */}
              {sortOpen && (
                <div className="absolute top-full right-0 z-50 mt-1 w-52 rounded-[3px] border border-[#dfe1e6] bg-white shadow-[0_4px_16px_rgba(9,30,66,0.18)] dark:bg-popover">
                  <div className="flex items-center gap-2 border-b border-[#dfe1e6] px-3 py-2">
                    <input
                      autoFocus
                      type="text"
                      value={sortSearch}
                      onChange={(e) => setSortSearch(e.target.value)}
                      placeholder="Select..."
                      className="flex-1 bg-transparent text-[13px] text-[#172b4d] outline-none placeholder:text-[#626f86] dark:text-foreground"
                    />
                    <svg
                      className="size-4 shrink-0 text-[#626f86]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-[#626f86] uppercase">
                    Sort by
                  </div>
                  <div className="pb-1">
                    {filteredSortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id)
                          setSortOpen(false)
                          setSortSearch("")
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-[13px] transition-colors ${
                          sortBy === opt.id
                            ? "bg-[#e9f2ff] text-[#0052cc]"
                            : "text-[#172b4d] hover:bg-[#f4f5f7]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── List view: Columns popover ── */}
          {viewMode === "list" && (
            <Popover>
              <PopoverTrigger
                render={
                  <button className="flex items-center gap-1.5 rounded-[3px] border border-[#dfe1e6] px-2.5 py-1.5 text-[13px] text-[#626f86] transition-colors hover:bg-[#f4f5f7]">
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="1" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                    Columns
                  </button>
                }
              />
              <PopoverContent align="end" className="w-56 p-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Columns
                </div>
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between px-2 py-1.5 text-sm"
                  >
                    <span>{col.label}</span>
                    <button
                      onClick={() =>
                        setColumns((prev) =>
                          prev.map((c) =>
                            c.id === col.id ? { ...c, enabled: !c.enabled } : c
                          )
                        )
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${col.enabled ? "bg-[#0052cc]" : "bg-muted"}`}
                    >
                      <span
                        className={`size-4 rounded-full bg-white shadow-sm transition-transform ${col.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* More menu — Copy link + Export CSV */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="rounded-[3px] border border-[#dfe1e6] px-1.5 py-1.5 text-[#626f86] transition-colors hover:bg-[#f4f5f7]">
                  <svg
                    className="size-4"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  </svg>
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  showToast("Link copied to clipboard")
                }}
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const headers = [
                    "Name",
                    "Status",
                    "Progress",
                    "Target date",
                    "Owner",
                    "Archived date",
                  ]
                  const rows = filteredGoals.map((g) => [
                    `"${g.name.replace(/"/g, '""')}"`,
                    g.status,
                    `${g.progress}%`,
                    g.targetDate,
                    `"${g.owner.name}"`,
                    g.archivedDate,
                  ])
                  const csv = [
                    headers.join(","),
                    ...rows.map((r) => r.join(",")),
                  ].join("\n")
                  const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "archived-goals.csv"
                  a.click()
                  URL.revokeObjectURL(url)
                  showToast("Exported archived-goals.csv")
                }}
              >
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#dfe1e6]">
        <div className="grid grid-cols-[1fr_110px_120px_110px_80px_80px_auto] gap-4 border-b border-[#dfe1e6] bg-[#fafbfc] px-4 py-2.5 text-xs font-medium text-[#626f86] dark:bg-muted/20">
          <span>Name</span>
          <span>Status</span>
          <span>Progress</span>
          <span>Target date</span>
          <span>Owner</span>
          <span>Following</span>
          <span />
        </div>

        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => router.push(`/goals/${goal.id}`)}
              className="group grid cursor-pointer grid-cols-[1fr_110px_120px_110px_80px_80px_auto] items-center gap-4 border-b border-[#dfe1e6] px-4 py-3 transition-colors last:border-b-0 hover:bg-[#f4f5f7] dark:hover:bg-muted/30"
            >
              <div className="flex min-w-0 items-center gap-2">
                <svg
                  className="size-4 shrink-0 text-[#626f86]/50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="truncate text-[13px] text-[#172b4d] hover:text-[#0052cc] dark:text-foreground">
                  {goal.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 uppercase dark:bg-gray-700 dark:text-gray-300">
                  ARCHIVED
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColors[goal.status] ?? "bg-gray-200 text-gray-600"}`}
                >
                  {goal.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-[#dfe1e6]">
                  <div
                    className="h-full rounded-full bg-[#0052cc]"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-[12px] text-[#626f86]">
                  {goal.progress}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#626f86]">
                <svg
                  className="size-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {goal.targetDate}
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${goal.owner.color}`}
                >
                  {goal.owner.initials}
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleFollow(goal.id)}
                  className="text-[12px] text-[#626f86] transition-colors hover:text-[#0052cc]"
                  title={goal.following ? "Unfollow" : "Follow"}
                >
                  {goal.following ? "Following" : "—"}
                </button>
              </div>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <button
                  onClick={() => handleRestore(goal.id)}
                  className="rounded-[3px] border border-[#dfe1e6] px-2 py-1 text-[12px] text-[#626f86] transition-colors hover:bg-[#f4f5f7] hover:text-[#172b4d]"
                >
                  Restore
                </button>
                <button
                  onClick={() => setDeleteConfirmId(goal.id)}
                  className="rounded-[3px] border border-red-200 px-2 py-1 text-[12px] text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6">
              <svg
                className="size-24 text-[#c1c7d0]"
                viewBox="0 0 120 120"
                fill="none"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <line
                  x1="76"
                  y1="76"
                  x2="100"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1="38"
                  y1="38"
                  x2="62"
                  y2="62"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="62"
                  y1="38"
                  x2="38"
                  y2="62"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text
                  x="18"
                  y="20"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.5"
                >
                  ?
                </text>
                <text
                  x="72"
                  y="24"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.5"
                >
                  ?
                </text>
                <text
                  x="5"
                  y="72"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.5"
                >
                  ?
                </text>
              </svg>
            </div>
            <p className="max-w-md text-[13px] text-[#626f86]">
              We couldn&apos;t find any goals matching your search. Try changing
              your search criteria or{" "}
              <button
                onClick={clearFilters}
                className="text-[#0052cc] hover:underline"
              >
                clear all filters
              </button>
              .
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete goal permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The goal and all its associated data
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() =>
                deleteConfirmId !== null && handleDelete(deleteConfirmId)
              }
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
