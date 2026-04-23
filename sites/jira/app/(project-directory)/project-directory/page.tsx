"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const projectStatusStyle: Record<string, string> = {
  "ON TRACK":
    "border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  "AT RISK":
    "border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  "OFF TRACK":
    "border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  PENDING:
    "border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-800/30 dark:text-gray-400",
}

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
const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
function fmtDate(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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

const defaultEmojis = [
  "📋",
  "🚀",
  "💻",
  "🎯",
  "📊",
  "🔧",
  "📦",
  "🌟",
  "🎨",
  "☁️",
  "🤝",
  "🌱",
]

const mockProjects = [
  {
    id: 1,
    key: "SCRUM",
    name: "New employee onboarding update",
    status: "ON TRACK",
    icon: "🎨",
    lastUpdated: "1 day ago",
    tag: "onboarding",
    goal: "Employee experience",
    team: "HR",
    owner: "Abhishek Sharma",
    projectType: "scrum",
  },
  {
    id: 2,
    key: "KANB",
    name: "Cloud migration phase 2",
    status: "AT RISK",
    icon: "☁️",
    lastUpdated: "3 days ago",
    tag: "infrastructure",
    goal: "Platform reliability",
    team: "Engineering",
    owner: "Sam Williams",
    projectType: "kanban",
  },
  {
    id: 3,
    key: "SCRUM",
    name: "Customer portal redesign",
    status: "AT RISK",
    icon: "🤝",
    lastUpdated: "5 days ago",
    tag: "design",
    goal: "Customer experience",
    team: "Design",
    owner: "Jordan Lee",
    projectType: "scrum",
  },
  {
    id: 4,
    key: "SCRUM",
    name: "Mobile app performance optimization",
    status: "ON TRACK",
    icon: "🌱",
    lastUpdated: "1 week ago",
    tag: "performance",
    goal: "Platform reliability",
    team: "Engineering",
    owner: "Taylor Brown",
    projectType: "scrum",
  },
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

const allStatuses = [
  "OFF TRACK",
  "AT RISK",
  "ON TRACK",
  "PENDING",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]
const allGoals = [
  "Employee experience",
  "Platform reliability",
  "Customer experience",
]
const allTags = ["onboarding", "infrastructure", "design", "performance"]
const allTeams = ["HR", "Engineering", "Design", "QA", "Product"]
const allOwners = [
  "Abhishek Sharma",
  "Sam Williams",
  "Jordan Lee",
  "Taylor Brown",
]

type FilterKey =
  | "status"
  | "goal"
  | "tag"
  | "team"
  | "owner"
  | "projectType"
  | "contributor"
  | "following"

interface FilterConfig {
  key: FilterKey
  label: string
  options: string[]
  icon: React.ReactNode
}

const filterConfigs: FilterConfig[] = [
  {
    key: "tag",
    label: "Filter by Tag",
    options: allTags,
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    key: "status",
    label: "Status",
    options: allStatuses,
    icon: (
      <svg
        className="size-3.5"
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
    key: "goal",
    label: "Goal",
    options: allGoals,
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    key: "team",
    label: "Team",
    options: allTeams,
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
    key: "owner",
    label: "Owner",
    options: allOwners,
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
  {
    key: "contributor",
    label: "Contributor",
    options: allOwners,
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
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    key: "following",
    label: "Following",
    options: ["Following", "Not following"],
    icon: (
      <svg
        className="size-3.5"
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
]

function ProjectRowMenu({
  project,
  onArchive,
  onToast,
  starred,
  onToggleStar,
}: {
  project: { id: number; key: string; name: string }
  onArchive: (id: number) => void
  onToast: (msg: string) => void
  starred: boolean
  onToggleStar: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (open) {
      setOpen(false)
      return
    }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right - 176 })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (btnRef.current?.contains(target)) return
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
        className={`rounded p-1 transition-colors ${open ? "border border-blue-500 bg-blue-50 text-blue-600" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
      >
        <svg
          className="pointer-events-none size-4"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="z-[9999] w-44 rounded-lg border bg-popover py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onToggleStar(project.id)
              onToast(
                starred
                  ? `Unstarred ${project.name}`
                  : `Starred ${project.name}`
              )
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
          >
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill={starred ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {starred ? "Unstar" : "Star"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onArchive(project.id)
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
          >
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            Archive project
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onToast(`"${project.name}" copied`)
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
          >
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy project
          </button>
        </div>
      )}
    </>
  )
}

const STATUS_BADGE_STYLE: Record<string, string> = {
  "OFF TRACK": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "AT RISK":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700",
  "ON TRACK":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

function FilterChipDropdown({
  config,
  onSelect,
}: {
  config: FilterConfig
  onSelect: (value: string) => void
}) {
  const [search, setSearch] = useState("")
  const filtered = config.options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )
  const isStatus = config.key === "status"
  return (
    <div
      data-testid={`filter-dropdown-${config.key}`}
      className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border bg-popover shadow-lg"
    >
      <div className="border-b p-2">
        <div className="relative">
          <input
            type="text"
            placeholder={`Choose a ${config.label.toLowerCase()}`}
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
      <div className="max-h-48 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">No matches</p>
        )}
        {filtered.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="flex w-full items-center px-3 py-1.5 text-left transition-colors hover:bg-accent"
          >
            {isStatus && STATUS_BADGE_STYLE[option] ? (
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${STATUS_BADGE_STYLE[option]}`}
              >
                {option}
              </span>
            ) : (
              <span className="text-sm font-medium text-foreground">
                {option === "COMPLETED" ? "COMPLETED 🎉" : option}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function SortByDropdown({
  sortBy,
  sortAsc,
  onSelect,
  onReverse,
}: {
  sortBy: string
  sortAsc: boolean
  onSelect: (s: string) => void
  onReverse: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])
  const options = ["following", "name", "status", "updated", "target date"]
  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-l-lg border border-r-0 px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent"
      >
        Sort by {sortBy}
      </button>
      <div className="group/rev relative">
        <button
          onClick={onReverse}
          className="flex items-center justify-center rounded-r-lg border px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Reverse sort order"
        >
          <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
            <path d={sortAsc ? "M8 11L4 6h8z" : "M8 5l4 5H4z"} />
          </svg>
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/rev:opacity-100">
          Reverse sort order
        </span>
      </div>
      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg"
        >
          {options.map((opt) => (
            <button
              key={opt}
              role="menuitem"
              onClick={() => {
                onSelect(opt)
                setOpen(false)
              }}
              className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent ${sortBy === opt ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : ""}`}
            >
              Sort by {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ALL_COLUMNS = [
  {
    id: "name",
    label: "Name",
    locked: true,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    id: "status",
    label: "Status",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    id: "start_date",
    label: "Start date",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    ),
  },
  {
    id: "target_date",
    label: "Target date",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    ),
  },
  {
    id: "owner",
    label: "Owner",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    id: "following",
    label: "Following",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    id: "last_updated",
    label: "Last updated",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    ),
  },
  {
    id: "goal",
    label: "Goal",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: "tags",
    label: "Tags",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    id: "team",
    label: "Team",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
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
    id: "contributors",
    label: "Contributors",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    id: "related_projects",
    label: "Related projects",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: "follower_count",
    label: "Follower count",
    locked: false,
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

function ColToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${on ? "bg-green-500" : "bg-gray-800 dark:bg-gray-700"}`}
    >
      {/* circle knob */}
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[calc(100%-1.5rem)]" : "left-1"}`}
      />
      {/* icon inside knob */}
      {on ? (
        <svg
          className="absolute top-1 left-[calc(100%-1.5rem)] size-5 p-1 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="absolute top-1 left-1 size-5 p-1 text-gray-800"
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
  )
}

function ColumnsPopover({
  open,
  setOpen,
  visibleColumns,
  setVisibleColumns,
  customColumns,
  onAddColumn,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  visibleColumns: Record<string, boolean>
  setVisibleColumns: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  customColumns: { id: string; label: string; type: string }[]
  onAddColumn: (col: { id: string; label: string; type: string }) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [colSearch, setColSearch] = useState("")
  const [createFieldOpen, setCreateFieldOpen] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState("text")

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, setOpen])

  const allCols = [
    ...ALL_COLUMNS,
    ...customColumns.map((c) => ({
      ...c,
      locked: false,
      icon: (
        <svg
          className="size-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    })),
  ]
  const filtered = allCols.filter((c) =>
    c.label.toLowerCase().includes(colSearch.toLowerCase())
  )

  const handleCreateField = () => {
    if (!newFieldName.trim()) return
    const id = `custom_${newFieldName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`
    onAddColumn({ id, label: newFieldName.trim(), type: newFieldType })
    setVisibleColumns((prev) => ({ ...prev, [id]: true }))
    setNewFieldName("")
    setNewFieldType("text")
    setCreateFieldOpen(false)
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${open ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
        >
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <rect x="1" y="1" width="7" height="18" rx="1.5" />
            <rect x="10" y="1" width="4" height="18" rx="1.5" />
            <rect x="16" y="1" width="3" height="18" rx="1.5" />
          </svg>
          Columns
        </button>

        {open && (
          <div
            role="dialog"
            className="absolute top-full right-0 z-50 mt-1 w-72 rounded-lg border bg-popover shadow-xl"
          >
            {/* Search */}
            <div className="border-b p-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={colSearch}
                  onChange={(e) => setColSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-md border bg-background py-1.5 pr-8 pl-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <svg
                  className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
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
            {/* Column list */}
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent"
                >
                  <span className="text-muted-foreground">{col.icon}</span>
                  <span className="flex-1 text-sm">{col.label}</span>
                  {"type" in col && !!col.type && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 capitalize dark:bg-blue-900/20 dark:text-blue-400">
                      {String(col.type)}
                    </span>
                  )}
                  {col.locked ? (
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
                    <ColToggle
                      on={!!visibleColumns[col.id]}
                      onClick={() =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col.id]: !prev[col.id],
                        }))
                      }
                    />
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No columns match.
                </p>
              )}
            </div>
            {/* Footer */}
            <div className="border-t p-2">
              <button
                type="button"
                data-testid="create-new-field-btn"
                onClick={() => {
                  setOpen(false)
                  setCreateFieldOpen(true)
                }}
                className="w-full rounded-md border py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
              >
                Create a new field
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create new field modal */}
      {createFieldOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setCreateFieldOpen(false)}
        >
          <div
            data-testid="create-field-modal"
            className="w-full max-w-[440px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">Create a new field</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Field name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="field-name-input"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  autoFocus
                  placeholder="e.g. Budget, Priority, Region"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Field type
                </label>
                <select
                  data-testid="field-type-select"
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="text">Short text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                data-testid="cancel-create-field-btn"
                onClick={() => setCreateFieldOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                data-testid="submit-create-field-btn"
                onClick={handleCreateField}
                disabled={!newFieldName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create field
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MoreMenu({
  open,
  setOpen,
  onExport,
  onCopyLink,
  wrapText,
  onToggleWrapText,
  isTimeline,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  onExport: () => void
  onCopyLink: () => void
  wrapText: boolean
  onToggleWrapText: () => void
  isTimeline: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open, setOpen])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${open ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
      >
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg"
        >
          <button
            role="menuitem"
            onClick={() => {
              onCopyLink()
              setOpen(false)
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
          >
            Copy link
          </button>
          <button
            role="menuitem"
            onClick={() => {
              onExport()
              setOpen(false)
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
          >
            Export CSV
          </button>
          {!isTimeline && (
            <div
              role="menuitem"
              onClick={onToggleWrapText}
              className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-accent"
            >
              <span>Wrap text</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWrapText()
                }}
                className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${wrapText ? "bg-green-500" : "bg-gray-800 dark:bg-gray-700"}`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${wrapText ? "left-[calc(100%-1.25rem)]" : "left-0.5"}`}
                />
                {wrapText ? (
                  <svg
                    className="absolute right-1 size-2.5 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    className="absolute left-1 size-2.5 text-gray-800"
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
          )}
        </div>
      )}
    </div>
  )
}

function renderCalendarPanel(
  viewDate: Date,
  setViewDate: (d: Date) => void,
  selected: Date,
  onSelect: (d: Date) => void,
  label: string
) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  return (
    <div className="flex w-[260px] flex-col gap-2">
      <p className="text-center text-sm font-semibold">{label}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setViewDate(addMonths(viewDate, -12))}
            className="rounded p-1 text-sm leading-none text-muted-foreground hover:bg-accent"
          >
            «
          </button>
          <button
            onClick={() => setViewDate(addMonths(viewDate, -1))}
            className="rounded p-1 text-sm leading-none text-muted-foreground hover:bg-accent"
          >
            ‹
          </button>
        </div>
        <span className="text-sm font-medium">
          {MONTHS_LONG[month]} {year}
        </span>
        <div className="flex items-center">
          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="rounded p-1 text-sm leading-none text-muted-foreground hover:bg-accent"
          >
            ›
          </button>
          <button
            onClick={() => setViewDate(addMonths(viewDate, 12))}
            className="rounded p-1 text-sm leading-none text-muted-foreground hover:bg-accent"
          >
            »
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {DOW_SHORT.map((d) => (
          <span
            key={d}
            className="py-1 text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />
          const thisDate = new Date(year, month, day)
          const isSel = sameDay(thisDate, selected)
          return (
            <button
              key={day}
              onClick={() => onSelect(thisDate)}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${isSel ? "bg-blue-600 font-semibold text-white" : "hover:bg-accent"}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DateRangePicker({
  start,
  end,
  onConfirm,
}: {
  start: Date
  end: Date
  onConfirm: (s: Date, e: Date) => void
}) {
  const [selStart, setSelStart] = useState(start)
  const [selEnd, setSelEnd] = useState(end)
  const [startView, setStartView] = useState(
    new Date(start.getFullYear(), start.getMonth(), 1)
  )
  const [endView, setEndView] = useState(
    new Date(end.getFullYear(), end.getMonth(), 1)
  )
  return (
    <div className="absolute top-full left-0 z-50 mt-1 flex flex-col gap-4 rounded-xl border bg-popover p-5 shadow-xl">
      <div className="flex gap-8">
        {renderCalendarPanel(
          startView,
          setStartView,
          selStart,
          setSelStart,
          "Start"
        )}
        <div className="w-px self-stretch bg-border" />
        {renderCalendarPanel(endView, setEndView, selEnd, setSelEnd, "End")}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => onConfirm(selStart, selEnd)}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {fmtDate(selStart)} - {fmtDate(selEnd)}
        </button>
      </div>
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
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      name: true,
      status: true,
      start_date: false,
      target_date: true,
      owner: true,
      following: true,
      last_updated: true,
      goal: false,
      tags: false,
      team: false,
      contributors: false,
      related_projects: false,
      follower_count: false,
    }
  )
  const [customColumns, setCustomColumns] = useState<
    { id: string; label: string; type: string }[]
  >([])
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [wrapText, setWrapText] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const moreFiltersRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!moreFiltersOpen) return
    const h = (e: MouseEvent) => {
      if (
        moreFiltersRef.current &&
        !moreFiltersRef.current.contains(e.target as Node)
      )
        setMoreFiltersOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreFiltersOpen(false)
    }
    document.addEventListener("mousedown", h)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", h)
      document.removeEventListener("keydown", esc)
    }
  }, [moreFiltersOpen])
  const [starredChipActive, setStarredChipActive] = useState(false)
  const [reportingLineChipActive, setReportingLineChipActive] = useState(false)
  const [reportingLinePopoverOpen, setReportingLinePopoverOpen] =
    useState(false)
  const reportingLineRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!reportingLinePopoverOpen) return
    const h = (e: MouseEvent) => {
      if (
        reportingLineRef.current &&
        !reportingLineRef.current.contains(e.target as Node)
      )
        setReportingLinePopoverOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [reportingLinePopoverOpen])
  const [createViewOpen, setCreateViewOpen] = useState(false)
  const [viewName, setViewName] = useState("")
  const [viewNameError, setViewNameError] = useState<string | null>(null)
  const [starredProjects, setStarredProjects] = useState<Set<number>>(new Set())
  const [addTabOpen, setAddTabOpen] = useState(false)
  const [viewSearch, setViewSearch] = useState("")
  const addTabRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!addTabOpen) return
    const h = (e: MouseEvent) => {
      if (addTabRef.current && !addTabRef.current.contains(e.target as Node))
        setAddTabOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddTabOpen(false)
    }
    document.addEventListener("mousedown", h)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", h)
      document.removeEventListener("keydown", esc)
    }
  }, [addTabOpen])

  interface SavedView {
    id: string
    name: string
    chips: FilterKey[]
    chipValues: Partial<Record<FilterKey, string>>
    starredChipActive: boolean
    reportingLineChipActive: boolean
  }
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [tabContextMenu, setTabContextMenu] = useState<{
    id: string
    x: number
    y: number
  } | null>(null)
  const tabContextRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!tabContextMenu) return
    const h = (e: MouseEvent) => {
      if (
        tabContextRef.current &&
        !tabContextRef.current.contains(e.target as Node)
      )
        setTabContextMenu(null)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [tabContextMenu])

  useEffect(() => {
    if (!createViewOpen) return
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateViewOpen(false)
        setViewName("")
        setViewNameError(null)
      }
    }
    document.addEventListener("keydown", esc)
    return () => document.removeEventListener("keydown", esc)
  }, [createViewOpen])

  const handleCreateView = () => {
    const name = viewName.trim()
    if (!name) return
    const duplicate = savedViews.find(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    )
    if (duplicate) {
      setViewNameError("A view with this name already exists")
      return
    }
    // handler runs from user events (Enter / button click), not during render.
    const newView: SavedView = {
      // eslint-disable-next-line react-hooks/purity
      id: `view_${Date.now()}`,
      name,
      chips: Array.from(activeChips),
      chipValues: { ...chipValues },
      starredChipActive,
      reportingLineChipActive,
    }
    setSavedViews((prev) => [...prev, newView])
    setActiveViewId(newView.id)
    setActiveTab("all")
    setCreateViewOpen(false)
    setViewName("")
    setViewNameError(null)
    showToast(`View "${name}" created`)
  }

  const switchToView = (view: SavedView) => {
    setActiveChips(new Set(view.chips as FilterKey[]))
    setChipValues(view.chipValues)
    setStarredChipActive(view.starredChipActive)
    setReportingLineChipActive(view.reportingLineChipActive)
    setActiveViewId(view.id)
    setActiveTab("all")
    setAddTabOpen(false)
  }

  const deleteView = (id: string) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== id))
    if (activeViewId === id) {
      setActiveViewId(null)
      clearAllFilters()
    }
    setTabContextMenu(null)
  }

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) return
    const key =
      name
        .slice(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "") || "NEW"
    const id = Date.now()
    setProjects((prev) => [
      ...prev,
      {
        id,
        key,
        name,
        status: "PENDING",
        icon: "📋",
        lastUpdated: "just now",
        tag: "",
        goal: "",
        team: "",
        owner: "Abhishek Sharma",
        projectType: newProjectType,
      },
    ])
    setCreateOpen(false)
    setNewProjectName("")
    setNewProjectType("scrum")
    setToast("Project created")
    setTimeout(() => setToast(null), 3000)
  }

  const commitEdit = () => {
    if (editProjectId === null) return
    const newName = editProjectName.trim()
    if (!newName) return
    setProjects((prev) =>
      prev.map((x) => (x.id === editProjectId ? { ...x, name: newName } : x))
    )
    setEditOpen(false)
    setEditProjectId(null)
    setToast("Project updated")
    setTimeout(() => setToast(null), 3000)
  }
  const [activeChips, setActiveChips] = useState<Set<FilterKey>>(new Set())
  const [chipValues, setChipValues] = useState<
    Partial<Record<FilterKey, string>>
  >({})
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const filterBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openFilter) return
    const handler = (e: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      )
        setOpenFilter(null)
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFilter(null)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", escHandler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", escHandler)
    }
  }, [openFilter])

  const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
  const [tlRangeStart, setTlRangeStart] = useState(new Date(2025, 11, 17))
  const [tlRangeEnd, setTlRangeEnd] = useState(new Date(2027, 5, 17))
  const [tlRangePickerOpen, setTlRangePickerOpen] = useState(false)
  const tlRangePickerRef = useRef<HTMLDivElement>(null)
  const [tlViewBy, setTlViewBy] = useState("Months")
  const [tlViewByOpen, setTlViewByOpen] = useState(false)
  const tlViewByRef = useRef<HTMLDivElement>(null)
  const [tlSortBy, setTlSortBy] = useState<"start date" | "target date">(
    "start date"
  )
  const [tlSortOpen, setTlSortOpen] = useState(false)
  const tlSortRef = useRef<HTMLDivElement>(null)
  const [tlSortAsc, setTlSortAsc] = useState(true)
  useEffect(() => {
    if (!tlViewByOpen) return
    const h = (e: MouseEvent) => {
      if (
        tlViewByRef.current &&
        !tlViewByRef.current.contains(e.target as Node)
      )
        setTlViewByOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [tlViewByOpen])
  useEffect(() => {
    if (!tlRangePickerOpen) return
    const h = (e: MouseEvent) => {
      if (
        tlRangePickerRef.current &&
        !tlRangePickerRef.current.contains(e.target as Node)
      )
        setTlRangePickerOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [tlRangePickerOpen])
  useEffect(() => {
    if (!tlSortOpen) return
    const h = (e: MouseEvent) => {
      if (tlSortRef.current && !tlSortRef.current.contains(e.target as Node))
        setTlSortOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [tlSortOpen])
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")
  const [followedProjects, setFollowedProjects] = useState<Set<number>>(
    new Set()
  )

  // Fetch projects from API and merge with mock data
  useEffect(() => {
    fetch("/api/data/projects")
      .then((r) => r.json())
      .then(
        (
          apiProjects: {
            id: string
            key: string
            name: string
            type: string
            lead: string
            createdAt: string
          }[]
        ) => {
          const existingKeys = new Set(mockProjects.map((p) => p.key))
          const newProjects: ProjectItem[] = apiProjects
            .filter((p) => !existingKeys.has(p.key))
            .map((p, i) => ({
              id: 1000 + i,
              key: p.key,
              name: p.name,
              status: "PENDING",
              icon: defaultEmojis[
                Math.floor(Math.random() * defaultEmojis.length)
              ],
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
        }
      )
      .catch(() => {})
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }
  const handleArchive = (id: number) => {
    setArchiveConfirmId(id)
  }
  const confirmArchive = () => {
    if (archiveConfirmId === null) return
    setProjects((p) => p.filter((x) => x.id !== archiveConfirmId))
    setArchiveConfirmId(null)
    showToast("Project archived")
  }
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
      const current: string[] =
        raw === null ? ["SCRUM", "MOB", "PLAT"] : JSON.parse(raw)
      const idx = current.indexOf(proj.key)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(proj.key)
      window.localStorage.setItem("pd_followed_keys", JSON.stringify(current))
    } catch {}
  }

  const activateChip = (key: FilterKey) => {
    setActiveChips((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    setOpenFilter(key)
  }

  const setChip = (key: FilterKey, value: string) => {
    setChipValues((prev) => ({ ...prev, [key]: value }))
    setOpenFilter(null)
  }

  const removeChip = (key: FilterKey) => {
    setActiveChips((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    setChipValues((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setOpenFilter(null)
  }

  const clearAllFilters = () => {
    setActiveChips(new Set())
    setChipValues({})
    setOpenFilter(null)
    setStarredChipActive(false)
    setReportingLineChipActive(false)
    setReportingLinePopoverOpen(false)
    setSortBy("following")
    setSortAsc(true)
    setSearch("")
  }

  const filteredProjects = projects
    .filter((p) => {
      if (activeTab === "my" && p.owner !== "Abhishek Sharma") return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false
      if (chipValues.status && p.status !== chipValues.status) return false
      if (chipValues.goal && p.goal !== chipValues.goal) return false
      if (chipValues.tag && p.tag !== chipValues.tag) return false
      if (chipValues.team && p.team !== chipValues.team) return false
      if (chipValues.owner && p.owner !== chipValues.owner) return false
      if (
        chipValues.projectType &&
        (!p.projectType ||
          p.projectType.toLowerCase() !== chipValues.projectType.toLowerCase())
      )
        return false
      if (chipValues.following === "Following" && !followedProjects.has(p.id))
        return false
      if (
        chipValues.following === "Not following" &&
        followedProjects.has(p.id)
      )
        return false
      if (starredChipActive && !starredProjects.has(p.id)) return false
      return true
    })
    .slice()
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir
      if (sortBy === "status") return a.status.localeCompare(b.status) * dir
      if (sortBy === "updated")
        return a.lastUpdated.localeCompare(b.lastUpdated) * dir
      if (sortBy === "target date") return 0
      if (sortBy === "following") {
        const aF = followedProjects.has(a.id) ? 1 : 0
        const bF = followedProjects.has(b.id) ? 1 : 0
        if (aF !== bF) return (bF - aF) * dir
        return a.name.localeCompare(b.name) * dir
      }
      return a.name.localeCompare(b.name) * dir
    })

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          <svg
            className="size-4 shrink-0 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}
      {/* Create Project modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold">Create project</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
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
                <label className="mb-1.5 block text-sm font-medium">Type</label>
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
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold">Edit project</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                autoFocus
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={commitEdit}
                disabled={!editProjectName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      {archiveConfirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setArchiveConfirmId(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-lg border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Archive project</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to archive this project? You can restore it
              later from the Archived view.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setArchiveConfirmId(null)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={confirmArchive}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title + Create project */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Create project
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b">
        <div className="flex items-center">
          {[
            { key: "all" as const, label: "All projects" },
            { key: "my" as const, label: "Your projects" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setActiveViewId(null)
              }}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeViewId === null && activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Saved view tabs */}
          {savedViews.map((view) => (
            <div
              key={view.id}
              className="group relative -mb-px"
              onContextMenu={(e) => {
                e.preventDefault()
                setTabContextMenu({ id: view.id, x: e.clientX, y: e.clientY })
              }}
              data-testid={`view-tab-${view.id}`}
            >
              <button
                type="button"
                onClick={() => switchToView(view)}
                className={`flex max-w-[160px] items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeViewId === view.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                }`}
              >
                <span className="truncate">{view.name}</span>
              </button>
              <span
                role="button"
                aria-label="close-tab"
                data-testid={`close-tab-${view.id}`}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteView(view.id)
                }}
                className="absolute top-1/2 right-1 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
              >
                <svg
                  className="pointer-events-none size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            </div>
          ))}

          {/* "+" add tab dropdown */}
          <div ref={addTabRef} className="relative -mb-px">
            <button
              type="button"
              data-testid="add-tab-btn"
              onClick={() => {
                setAddTabOpen((v) => !v)
                setViewSearch("")
              }}
              className="flex items-center justify-center border-b-2 border-transparent px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              title="Add tab"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {addTabOpen && (
              <div
                data-testid="add-tab-dropdown"
                className="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border bg-popover shadow-xl"
              >
                <div className="border-b p-2">
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
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
                      data-testid="view-search-input"
                      value={viewSearch}
                      onChange={(e) => setViewSearch(e.target.value)}
                      placeholder="Search for views"
                      autoFocus
                      className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="py-1">
                  {/* Saved views list */}
                  {savedViews
                    .filter((v) =>
                      v.name.toLowerCase().includes(viewSearch.toLowerCase())
                    )
                    .map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        data-testid={`view-option-${view.name.replace(/\s+/g, "-").toLowerCase()}`}
                        onClick={() => switchToView(view)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                      >
                        <svg
                          className="size-4 shrink-0 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18M3 15h18M9 3v18" />
                        </svg>
                        {view.name}
                      </button>
                    ))}
                  {/* Create view option */}
                  {"Create view"
                    .toLowerCase()
                    .includes(viewSearch.toLowerCase()) && (
                    <button
                      type="button"
                      data-testid="dropdown-create-view-btn"
                      onClick={() => {
                        setAddTabOpen(false)
                        setCreateViewOpen(true)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <svg
                        className="size-4 shrink-0 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18M9 3v18" />
                      </svg>
                      Create view
                    </button>
                  )}
                  {viewSearch &&
                    !savedViews.some((v) =>
                      v.name.toLowerCase().includes(viewSearch.toLowerCase())
                    ) &&
                    !"Create view"
                      .toLowerCase()
                      .includes(viewSearch.toLowerCase()) && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No views found
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab right-click context menu */}
      {tabContextMenu && (
        <div
          ref={tabContextRef}
          style={{
            position: "fixed",
            top: tabContextMenu.y,
            left: tabContextMenu.x,
          }}
          className="z-[9999] w-44 rounded-lg border bg-popover py-1 shadow-lg"
        >
          {(() => {
            const view = savedViews.find((v) => v.id === tabContextMenu.id)
            if (!view) return null
            return (
              <>
                <button
                  type="button"
                  onClick={() => {
                    switchToView(view)
                    setTabContextMenu(null)
                  }}
                  className="flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-accent"
                >
                  Switch to view
                </button>
                <button
                  type="button"
                  onClick={() => deleteView(tabContextMenu.id)}
                  className="flex w-full items-center px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete view
                </button>
              </>
            )
          })()}
        </div>
      )}

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
          placeholder="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter bar — chips/buttons left, Reset + Create view always right */}
      <div ref={filterBarRef} className="mb-4 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {filterConfigs.map((config) => {
            const value = chipValues[config.key]
            const isChip = activeChips.has(config.key)
            if (activeChips.size > 0 && !isChip) return null
            return (
              <div key={config.key} className="relative">
                {isChip ? (
                  <button
                    type="button"
                    data-testid={`filter-chip-${config.key}`}
                    onClick={() =>
                      setOpenFilter(
                        openFilter === config.key ? null : config.key
                      )
                    }
                    className="flex items-center gap-1.5 rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {config.icon}
                    <span>
                      {config.label} is{value ? ` ${value}` : ""}
                    </span>
                    <span
                      role="button"
                      aria-label={`Remove ${config.label} filter`}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeChip(config.key)
                      }}
                      className="ml-0.5 flex size-4 cursor-pointer items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <svg
                        className="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid={`filter-btn-${config.key}`}
                    onClick={() => activateChip(config.key)}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent dark:border-gray-700"
                  >
                    {config.icon}
                    {config.label}
                  </button>
                )}
                {openFilter === config.key && (
                  <FilterChipDropdown
                    config={config}
                    onSelect={(v) => setChip(config.key, v)}
                  />
                )}
              </div>
            )
          })}
          {/* Starred chip */}
          {starredChipActive && (
            <button
              type="button"
              data-testid="filter-chip-starred"
              className="flex items-center gap-1.5 rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Starred</span>
              <span
                role="button"
                aria-label="Remove Starred filter"
                onClick={(e) => {
                  e.stopPropagation()
                  setStarredChipActive(false)
                }}
                className="ml-0.5 flex size-4 cursor-pointer items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <svg
                  className="size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            </button>
          )}
          {/* Reporting line chip + popover */}
          {reportingLineChipActive && (
            <div ref={reportingLineRef} className="relative">
              <button
                type="button"
                data-testid="reporting-filter-chip"
                onClick={() => setReportingLinePopoverOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
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
                <span>Reporting line</span>
                <span
                  role="button"
                  aria-label="Remove Reporting line filter"
                  onClick={(e) => {
                    e.stopPropagation()
                    setReportingLineChipActive(false)
                    setReportingLinePopoverOpen(false)
                  }}
                  className="ml-0.5 flex size-4 cursor-pointer items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <svg
                    className="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
              </button>
              {reportingLinePopoverOpen && (
                <div
                  data-testid="reporting-popover"
                  className="absolute top-full left-0 z-50 mt-2 w-72 rounded-lg border bg-popover p-4 shadow-xl"
                >
                  <h3 className="mb-1 text-sm font-semibold">
                    Stay across the projects your reports work on
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Connect your identity provider to get started
                  </p>
                  <a
                    href="https://support.atlassian.com/platform-experiences/docs/sync-the-manager-attribute-into-atlassian-home/"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="show-me-how-btn"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700"
                  >
                    Show me how
                    <svg
                      className="size-3"
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
              )}
            </div>
          )}
          {/* "..." more filters button */}
          <div ref={moreFiltersRef} className="relative">
            <button
              type="button"
              data-testid="more-filters-btn"
              onClick={() => setMoreFiltersOpen((v) => !v)}
              className={`flex items-center justify-center rounded-full border px-2.5 py-1.5 text-sm transition-colors ${moreFiltersOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-gray-200 text-muted-foreground hover:bg-accent dark:border-gray-700"}`}
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              </svg>
            </button>
            {moreFiltersOpen && (
              <div
                data-testid="more-filters-dropdown"
                className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border bg-popover py-1 shadow-lg"
              >
                {!starredChipActive && (
                  <button
                    type="button"
                    data-testid="more-filter-starred"
                    onClick={() => {
                      setStarredChipActive(true)
                      setMoreFiltersOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Starred
                  </button>
                )}
                {!reportingLineChipActive && (
                  <button
                    type="button"
                    data-testid="more-filter-reporting-line"
                    onClick={() => {
                      setReportingLineChipActive(true)
                      setReportingLinePopoverOpen(true)
                      setMoreFiltersOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
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
                    Reporting line
                  </button>
                )}
                {starredChipActive && reportingLineChipActive && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No more filters
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Always-visible right side */}
        <div className="ml-2 flex shrink-0 items-center gap-2">
          <button
            data-testid="reset-btn"
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
          <button
            data-testid="create-view-btn"
            onClick={() => setCreateViewOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18" />
            </svg>
            Create view
          </button>
        </div>
      </div>

      {/* Count + controls row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="shrink-0 text-sm font-medium">
          Showing {filteredProjects.length} project
          {filteredProjects.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {/* Timeline-only: date range + view by */}
          {viewMode === "timeline" && (
            <>
              <div ref={tlRangePickerRef} className="relative">
                <button
                  onClick={() => setTlRangePickerOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent"
                >
                  {fmtDate(tlRangeStart)} - {fmtDate(tlRangeEnd)}
                </button>
                {tlRangePickerOpen && (
                  <DateRangePicker
                    start={tlRangeStart}
                    end={tlRangeEnd}
                    onConfirm={(s, e) => {
                      setTlRangeStart(s)
                      setTlRangeEnd(e)
                      setTlRangePickerOpen(false)
                    }}
                  />
                )}
              </div>
              <div ref={tlViewByRef} className="relative">
                <button
                  title="Change date range format"
                  onClick={() => setTlViewByOpen((v) => !v)}
                  className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${tlViewByOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
                >
                  View by {tlViewBy}
                  <svg
                    className="size-3.5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                {tlViewByOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-36 rounded-lg border bg-popover py-1 shadow-lg">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      View by
                    </p>
                    {["Months", "Weeks"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTlViewBy(opt)
                          setTlViewByOpen(false)
                        }}
                        className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent ${tlViewBy === opt ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20" : ""}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {/* View toggle — separate bordered buttons */}
          <div className="flex items-center gap-0.5">
            <button
              title="Display as list"
              onClick={() => setViewMode("list")}
              className={`rounded-lg border p-2 transition-colors ${viewMode === "list" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              {/* Bullet list: small dot + line × 3 rows */}
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="2.2" cy="3.8" r="1" />
                <rect x="4.5" y="3" width="10" height="1.6" rx="0.8" />
                <circle cx="2.2" cy="8" r="1" />
                <rect x="4.5" y="7.2" width="10" height="1.6" rx="0.8" />
                <circle cx="2.2" cy="12.2" r="1" />
                <rect x="4.5" y="11.4" width="10" height="1.6" rx="0.8" />
              </svg>
            </button>
            <button
              title="Display as timeline"
              onClick={() => setViewMode("timeline")}
              className={`rounded-lg border p-2 transition-colors ${viewMode === "timeline" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              {/* Three equal horizontal lines (hamburger/outline style) */}
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="3" width="14" height="1.8" rx="0.9" />
                <rect x="1" y="7.1" width="14" height="1.8" rx="0.9" />
                <rect x="1" y="11.2" width="14" height="1.8" rx="0.9" />
              </svg>
            </button>
          </div>
          {/* List-only controls */}
          {viewMode === "list" && (
            <>
              <SortByDropdown
                sortBy={sortBy}
                sortAsc={sortAsc}
                onSelect={(s) => {
                  setSortBy(s)
                  setSortAsc(true)
                }}
                onReverse={() => setSortAsc((v) => !v)}
              />
              <ColumnsPopover
                open={columnsOpen}
                setOpen={setColumnsOpen}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                customColumns={customColumns}
                onAddColumn={(col) =>
                  setCustomColumns((prev) => [...prev, col])
                }
              />
            </>
          )}
          {/* Timeline-only: sort by split button */}
          {viewMode === "timeline" && (
            <div ref={tlSortRef} className="relative flex items-center">
              <button
                onClick={() => setTlSortOpen((v) => !v)}
                className={`flex items-center gap-1 rounded-l-lg border border-r-0 px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${tlSortOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              >
                Sort by {tlSortBy}
              </button>
              <button
                onClick={() => setTlSortAsc((v) => !v)}
                className={`flex items-center justify-center rounded-r-lg border px-2 py-1.5 transition-colors ${tlSortOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d={tlSortAsc ? "M8 4l-4 4h8z" : "M8 12l-4-4h8z"} />
                </svg>
              </button>
              {tlSortOpen && (
                <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-lg border bg-popover py-1 shadow-lg">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Sort by
                  </p>
                  {(["start date", "target date"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTlSortBy(opt)
                        setTlSortOpen(false)
                      }}
                      className={`flex w-full items-center px-3 py-1.5 text-left text-sm capitalize transition-colors hover:bg-accent ${tlSortBy === opt ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20" : ""}`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <MoreMenu
            open={moreMenuOpen}
            setOpen={setMoreMenuOpen}
            onCopyLink={() => {
              navigator.clipboard
                ?.writeText(window.location.href)
                .catch(() => {})
              showToast("Link copied")
            }}
            onExport={() => showToast("Export started")}
            wrapText={wrapText}
            onToggleWrapText={() => setWrapText((v) => !v)}
            isTimeline={viewMode === "timeline"}
          />
        </div>
      </div>

      {/* Table (list view) */}
      {viewMode === "list" && (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_110px_110px_90px_100px_110px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            {visibleColumns.status && <span>Status</span>}
            {visibleColumns.target_date && <span>Target date</span>}
            {visibleColumns.owner && <span>Owner</span>}
            {visibleColumns.following && <span>Following</span>}
            {visibleColumns.last_updated && <span>Last updated</span>}
          </div>
          {filteredProjects.map((project) => {
            const isFollowing = followedProjects.has(project.id)
            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.key}/board`)}
                className="group grid cursor-pointer grid-cols-[1fr_110px_110px_90px_100px_110px] items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/50"
              >
                <Link
                  href={`/projects/${project.key}/board`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <span className="text-base">{project.icon}</span>
                  <span
                    className={`text-sm ${wrapText ? "break-words whitespace-normal" : "truncate"}`}
                  >
                    {project.name}
                  </span>
                </Link>
                {visibleColumns.status && (
                  <div>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${projectStatusStyle[project.status] ?? "border-gray-300 bg-gray-50 text-gray-600"}`}
                    >
                      {project.status}
                    </span>
                  </div>
                )}
                {visibleColumns.target_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                    <span>No date</span>
                  </div>
                )}
                {visibleColumns.owner && (
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white uppercase">
                      {project.owner
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {project.owner.split(" ")[0]}
                    </span>
                  </div>
                )}
                {visibleColumns.following && (
                  <div
                    className="relative flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isFollowing ? (
                      <div className="group/unfollow relative">
                        <span className="text-xs text-muted-foreground group-hover/unfollow:hidden">
                          Following
                        </span>
                        <div className="relative hidden group-hover/unfollow:block">
                          <button
                            type="button"
                            onClick={() => {
                              toggleFollow(project.id)
                              showToast(`Unfollowed ${project.name}`)
                            }}
                            className="peer rounded bg-red-500 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-red-600"
                          >
                            Unfollow
                          </button>
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-[200px] -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity peer-hover:opacity-100">
                            Unfollow to stop receiving notifications
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          toggleFollow(project.id)
                          showToast(`Now following ${project.name}`)
                        }}
                        className="rounded border border-blue-500 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  {visibleColumns.last_updated && (
                    <span className="text-xs text-muted-foreground">
                      {project.lastUpdated}
                    </span>
                  )}
                  <ProjectRowMenu
                    project={project}
                    onArchive={handleArchive}
                    onToast={showToast}
                    starred={starredProjects.has(project.id)}
                    onToggleStar={(id) => {
                      setStarredProjects((prev) => {
                        const next = new Set(prev)
                        if (next.has(id)) next.delete(id)
                        else next.add(id)
                        return next
                      })
                    }}
                  />
                </div>
              </div>
            )
          })}
          {filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <svg className="mb-5 h-28 w-32" viewBox="0 0 160 140" fill="none">
                <circle cx="30" cy="30" r="3" fill="#CBD5E1" opacity="0.7" />
                <circle cx="130" cy="25" r="2.5" fill="#CBD5E1" opacity="0.6" />
                <circle cx="18" cy="75" r="2" fill="#CBD5E1" opacity="0.5" />
                <circle cx="142" cy="80" r="3" fill="#CBD5E1" opacity="0.5" />
                <circle cx="50" cy="118" r="2.5" fill="#CBD5E1" opacity="0.6" />
                <circle cx="110" cy="122" r="2" fill="#CBD5E1" opacity="0.5" />
                <circle
                  cx="70"
                  cy="62"
                  r="38"
                  fill="white"
                  stroke="#CBD5E1"
                  strokeWidth="5"
                />
                <circle
                  cx="70"
                  cy="62"
                  r="26"
                  fill="#F1F5F9"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                />
                <line
                  x1="58"
                  y1="50"
                  x2="82"
                  y2="74"
                  stroke="#94A3B8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="82"
                  y1="50"
                  x2="58"
                  y2="74"
                  stroke="#94A3B8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="100"
                  y1="92"
                  x2="124"
                  y2="118"
                  stroke="#CBD5E1"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              <p className="max-w-xs text-sm text-muted-foreground">
                We couldn&apos;t find any projects matching your search. Try
                changing your search criteria or{" "}
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:underline"
                >
                  clear all filters
                </button>
                .
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create view modal */}
      {createViewOpen && (
        <div
          data-testid="create-view-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={() => {
            setCreateViewOpen(false)
            setViewName("")
            setViewNameError(null)
          }}
        >
          <div
            className="w-full max-w-[480px] rounded-lg bg-white shadow-2xl dark:bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="mb-1 text-xl font-semibold text-foreground">
                Create view
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                A view saves your search, filter, sort, and display options so
                you can quickly return to it later
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  View name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="view-name-input"
                  value={viewName}
                  onChange={(e) => {
                    setViewName(e.target.value)
                    setViewNameError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateView()
                  }}
                  autoFocus
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors outline-none ${
                    viewNameError || (!viewName.trim() && viewName !== "")
                      ? "border-red-500 focus:ring-2 focus:ring-red-400"
                      : viewName.trim()
                        ? "border-input focus:ring-2 focus:ring-blue-500"
                        : "border-red-500 focus:ring-2 focus:ring-red-400"
                  }`}
                />
                {!viewName.trim() && (
                  <p
                    data-testid="view-name-error"
                    className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"
                  >
                    <svg
                      className="size-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    Give your view a name so everyone knows what it&apos;s about
                  </p>
                )}
                {viewNameError && (
                  <p
                    data-testid="view-name-error"
                    className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"
                  >
                    <svg
                      className="size-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {viewNameError}
                  </p>
                )}
              </div>
              <div
                className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
                data-testid="visibility-note"
              >
                <svg
                  className="size-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Everyone at theta.computer01 can see this view
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button
                data-testid="cancel-create-view-btn"
                onClick={() => {
                  setCreateViewOpen(false)
                  setViewName("")
                  setViewNameError(null)
                }}
                className="px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
              >
                Cancel
              </button>
              <button
                data-testid="submit-create-view-btn"
                disabled={!viewName.trim()}
                onClick={handleCreateView}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create view
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline view */}
      {viewMode === "timeline" && (
        <div className="rounded-lg border">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <svg className="mb-5 h-28 w-32" viewBox="0 0 160 140" fill="none">
                {/* outer glow dots */}
                <circle cx="30" cy="30" r="3" fill="#CBD5E1" opacity="0.7" />
                <circle cx="130" cy="25" r="2.5" fill="#CBD5E1" opacity="0.6" />
                <circle cx="18" cy="75" r="2" fill="#CBD5E1" opacity="0.5" />
                <circle cx="142" cy="80" r="3" fill="#CBD5E1" opacity="0.5" />
                <circle cx="50" cy="118" r="2.5" fill="#CBD5E1" opacity="0.6" />
                <circle cx="110" cy="122" r="2" fill="#CBD5E1" opacity="0.5" />
                {/* magnifying glass lens */}
                <circle
                  cx="70"
                  cy="62"
                  r="38"
                  fill="white"
                  stroke="#CBD5E1"
                  strokeWidth="5"
                />
                <circle
                  cx="70"
                  cy="62"
                  r="26"
                  fill="#F1F5F9"
                  stroke="#CBD5E1"
                  strokeWidth="3"
                />
                {/* X inside lens */}
                <line
                  x1="58"
                  y1="50"
                  x2="82"
                  y2="74"
                  stroke="#94A3B8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="82"
                  y1="50"
                  x2="58"
                  y2="74"
                  stroke="#94A3B8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* handle */}
                <line
                  x1="100"
                  y1="92"
                  x2="124"
                  y2="118"
                  stroke="#CBD5E1"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              <p className="max-w-xs text-sm text-muted-foreground">
                We couldn&apos;t find any projects matching your search. Try
                changing your search criteria or{" "}
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:underline"
                >
                  clear all filters
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              Timeline view — {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
