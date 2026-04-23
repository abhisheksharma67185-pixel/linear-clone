"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

const LS_KEY = "pd_followed_keys"
const defaultFollowedKeys = ["SCRUM", "MOB", "PLAT"]

function readFollowedKeys(): string[] {
  if (typeof window === "undefined") return defaultFollowedKeys
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (raw === null) return defaultFollowedKeys
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultFollowedKeys
  } catch {
    return defaultFollowedKeys
  }
}

function writeFollowedKeys(keys: string[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(keys))
  } catch {}
}

interface FollowedProject {
  id: number
  name: string
  key: string
  type: "kanban" | "scrum"
  lead: string
  href: string
  icon: string
  status: string
  targetDate: string | null
  lastUpdated: string | null
}

const projectCatalog: Record<string, FollowedProject> = {
  SCRUM: {
    id: 1,
    name: "SCRUM Project",
    key: "SCRUM",
    type: "scrum",
    lead: "Abhishek Sharma",
    href: "/projects/SCRUM/board",
    icon: "S",
    status: "ON TRACK",
    targetDate: null,
    lastUpdated: null,
  },
  MOB: {
    id: 2,
    name: "Mobile App",
    key: "MOB",
    type: "kanban",
    lead: "Priya Patel",
    href: "/projects/MOB/board",
    icon: "M",
    status: "AT RISK",
    targetDate: null,
    lastUpdated: null,
  },
  PLAT: {
    id: 3,
    name: "Platform Core",
    key: "PLAT",
    type: "scrum",
    lead: "James Chen",
    href: "/projects/PLAT/board",
    icon: "P",
    status: "ON TRACK",
    targetDate: null,
    lastUpdated: null,
  },
  KANB: {
    id: 4,
    name: "Cloud migration phase 2",
    key: "KANB",
    type: "kanban",
    lead: "Sam Williams",
    href: "/projects/KANB/board",
    icon: "C",
    status: "OFF TRACK",
    targetDate: null,
    lastUpdated: null,
  },
  FAPP: {
    id: 5,
    name: "Frontend App",
    key: "FAPP",
    type: "scrum",
    lead: "Abhishek Sharma",
    href: "/projects/FAPP/board",
    icon: "F",
    status: "PENDING",
    targetDate: null,
    lastUpdated: null,
  },
}

const STATUS_BADGE: Record<string, string> = {
  "OFF TRACK": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "AT RISK":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700",
  "ON TRACK":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  PAUSED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
}

const STATUS_BORDER: Record<string, string> = {
  "ON TRACK":
    "border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  "AT RISK":
    "border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  "OFF TRACK":
    "border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  PENDING:
    "border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-800/30 dark:text-gray-400",
}

interface FilterConfig {
  id: string
  label: string
  buttonLabel?: string
  placeholder: string
  options: string[]
  isStatus?: boolean
  icon: React.ReactNode
}

const MONTHS_SHORT_F = [
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
const MONTHS_LONG_F = [
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
const DOW_F = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
function fmtDateF(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT_F[d.getMonth()]} ${d.getFullYear()}`
}
function addMonthsF(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function sameDayF(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function renderCalF(
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
        <div className="flex">
          <button
            onClick={() => setViewDate(addMonthsF(viewDate, -12))}
            className="rounded p-1 text-sm text-muted-foreground hover:bg-accent"
          >
            «
          </button>
          <button
            onClick={() => setViewDate(addMonthsF(viewDate, -1))}
            className="rounded p-1 text-sm text-muted-foreground hover:bg-accent"
          >
            ‹
          </button>
        </div>
        <span className="text-sm font-medium">
          {MONTHS_LONG_F[month]} {year}
        </span>
        <div className="flex">
          <button
            onClick={() => setViewDate(addMonthsF(viewDate, 1))}
            className="rounded p-1 text-sm text-muted-foreground hover:bg-accent"
          >
            ›
          </button>
          <button
            onClick={() => setViewDate(addMonthsF(viewDate, 12))}
            className="rounded p-1 text-sm text-muted-foreground hover:bg-accent"
          >
            »
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {DOW_F.map((d) => (
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
          const isSel = sameDayF(thisDate, selected)
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

function FDateRangePicker({
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
        {renderCalF(startView, setStartView, selStart, setSelStart, "Start")}
        <div className="w-px self-stretch bg-border" />
        {renderCalF(endView, setEndView, selEnd, setSelEnd, "End")}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => onConfirm(selStart, selEnd)}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {fmtDateF(selStart)} - {fmtDateF(selEnd)}
        </button>
      </div>
    </div>
  )
}

const FILTER_CONFIGS: FilterConfig[] = [
  {
    id: "tag",
    label: "Tag",
    buttonLabel: "Filter by Tag",
    placeholder: "Choose a tag",
    options: [],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 4h3M2 8h7M2 12h5" />
        <path d="M8 2l5 5-5 5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "status",
    label: "Status",
    placeholder: "Choose a status",
    options: [
      "OFF TRACK",
      "AT RISK",
      "ON TRACK",
      "PENDING",
      "PAUSED",
      "COMPLETED",
      "CANCELLED",
    ],
    isStatus: true,
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <path d="M2 6h12" />
      </svg>
    ),
  },
  {
    id: "goal",
    label: "Goal",
    placeholder: "Choose a goal",
    options: [],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6" />
        <circle cx="8" cy="8" r="2" />
      </svg>
    ),
  },
  {
    id: "team",
    label: "Team",
    placeholder: "Choose a team",
    options: ["Engineering", "Design", "Product"],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="5.5" cy="5" r="2.5" />
        <path d="M1 13a4.5 4.5 0 0 1 9 0" />
        <circle cx="11" cy="5" r="2" />
        <path d="M13.5 13a3.5 3.5 0 0 0-3.5-3" />
      </svg>
    ),
  },
  {
    id: "owner",
    label: "Owner",
    placeholder: "Choose an owner",
    options: ["Abhishek Sharma", "Priya Patel", "James Chen", "Sam Williams"],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="5.5" r="3" />
        <path d="M2 14a6 6 0 0 1 12 0" />
      </svg>
    ),
  },
  {
    id: "contributor",
    label: "Contributor",
    placeholder: "Choose a contributor",
    options: ["Abhishek Sharma", "Priya Patel", "James Chen"],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="6" cy="5.5" r="2.5" />
        <path d="M1 13.5a5 5 0 0 1 10 0" />
        <path d="M12 8v4M14 10h-4" />
      </svg>
    ),
  },
  {
    id: "following",
    label: "Following",
    placeholder: "Choose following state",
    options: ["Following", "Not following"],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="5.5" r="3" />
        <path d="M2 14a6 6 0 0 1 12 0" />
      </svg>
    ),
  },
  {
    id: "starred",
    label: "Starred",
    placeholder: "Choose starred state",
    options: ["Starred", "Not starred"],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5z" />
      </svg>
    ),
  },
  {
    id: "reporting",
    label: "Reporting line",
    placeholder: "Choose reporting line",
    options: [],
    icon: (
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="3" r="1.5" />
        <circle cx="3.5" cy="12" r="1.5" />
        <circle cx="12.5" cy="12" r="1.5" />
        <path d="M8 4.5v3M8 7.5L3.5 10.5M8 7.5L12.5 10.5" />
      </svg>
    ),
  },
]

const SORT_OPTIONS = ["following", "name", "status", "last updated"]

function FilterDropdown({
  config,
  onSelect,
}: {
  config: FilterConfig
  onSelect: (v: string) => void
}) {
  const [search, setSearch] = useState("")
  const filtered = config.options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-lg border bg-popover shadow-lg">
      <div className="border-b p-2">
        <div className="relative">
          <input
            type="text"
            placeholder={config.placeholder}
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
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
        )}
        {filtered.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="flex w-full items-center px-3 py-1.5 text-left transition-colors hover:bg-accent"
          >
            {config.isStatus && STATUS_BADGE[opt] ? (
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${STATUS_BADGE[opt]}`}
              >
                {opt === "COMPLETED" ? "COMPLETED 🎉" : opt}
              </span>
            ) : (
              <span className="text-sm text-foreground">{opt}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

const VISIBLE_COLS_DEFAULT: Record<string, boolean> = {
  status: true,
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

const ALL_FOLLOWING_COLS = [
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
        <circle cx="12" cy="12" r="9" />
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
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
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
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <circle cx="17" cy="7" r="2" />
        <path d="M23 21v-2a2 2 0 0 0-2-2h-1" />
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
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M19 8v6M22 11h-6" />
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
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
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

function ColToggleSmall({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-green-500" : "bg-gray-800 dark:bg-gray-700"}`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`}
      />
      {on ? (
        <svg
          className="absolute right-1 size-2.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="absolute left-1 size-2.5 text-gray-400"
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

function FollowingColumnsPanel({
  open,
  setOpen,
  visibleCols,
  setVisibleCols,
  customCols,
  onAddColumn,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  visibleCols: Record<string, boolean>
  setVisibleCols: (v: Record<string, boolean>) => void
  customCols: { id: string; label: string; type: string }[]
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

  const handleCreateField = () => {
    if (!newFieldName.trim()) return
    const id = `custom_${newFieldName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`
    onAddColumn({ id, label: newFieldName.trim(), type: newFieldType })
    setVisibleCols({ ...visibleCols, [id]: true })
    setNewFieldName("")
    setNewFieldType("text")
    setCreateFieldOpen(false)
  }

  const allCols = [
    ...ALL_FOLLOWING_COLS,
    ...customCols.map((c) => ({
      id: c.id,
      label: c.label,
      locked: false,
      type: c.type,
      icon: (
        <svg
          className="size-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      ),
    })),
  ]
  const filtered = allCols.filter((c) =>
    c.label.toLowerCase().includes(colSearch.toLowerCase())
  )

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${open ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
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
          Columns
        </button>
        {open && (
          <div className="absolute top-full right-0 z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg">
            <div className="border-b p-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={colSearch}
                  onChange={(e) => setColSearch(e.target.value)}
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
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent"
                >
                  <span className="text-muted-foreground">{col.icon}</span>
                  <span className="flex-1 text-sm">{col.label}</span>
                  {"type" in col && (col as { type?: string }).type && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 capitalize dark:bg-blue-900/20">
                      {(col as { type?: string }).type}
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
                    <ColToggleSmall
                      on={!!visibleCols[col.id]}
                      onClick={() =>
                        setVisibleCols({
                          ...visibleCols,
                          [col.id]: !visibleCols[col.id],
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="border-t p-2">
              <button
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
                onClick={() => setCreateFieldOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
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

function FollowingMoreMenu({
  open,
  setOpen,
  onCopyLink,
  onExport,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  onCopyLink: () => void
  onExport: () => void
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
        className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${open ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
      >
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-lg border bg-popover py-1 shadow-lg">
          <button
            onClick={() => {
              onCopyLink()
              setOpen(false)
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
          >
            Copy link
          </button>
          <button
            onClick={() => {
              onExport()
              setOpen(false)
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
          >
            Export CSV
          </button>
        </div>
      )}
    </div>
  )
}

// Filters shown as inline buttons; the rest go behind "..."
const INLINE_FILTER_IDS = [
  "tag",
  "status",
  "goal",
  "team",
  "owner",
  "contributor",
  "following",
]
const EXTRA_FILTER_IDS = ["starred", "reporting"]

export default function ProjectFollowingPage() {
  const [followedKeys, setFollowedKeys] =
    useState<string[]>(defaultFollowedKeys)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list")

  // List sort
  const [sortBy, setSortBy] = useState("following")
  const [sortAsc, setSortAsc] = useState(true)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Timeline state
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

  // Columns & more
  const filterBarRef = useRef<HTMLDivElement>(null)
  const [visibleCols, setVisibleCols] =
    useState<Record<string, boolean>>(VISIBLE_COLS_DEFAULT)
  const [customCols, setCustomCols] = useState<
    { id: string; label: string; type: string }[]
  >([])
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const moreFiltersRef = useRef<HTMLDivElement>(null)

  // Filters
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  // Row context menu
  const [openRowMenu, setOpenRowMenu] = useState<number | null>(null)
  const rowMenuRef = useRef<HTMLDivElement>(null)
  const [starredProjects, setStarredProjects] = useState<Set<number>>(new Set())
  const [archivedIds, setArchivedIds] = useState<Set<number>>(new Set())
  const [copyModal, setCopyModal] = useState<FollowedProject | null>(null)
  const [copyName, setCopyName] = useState("")
  const [copyLinks, setCopyLinks] = useState(false)
  const [copyFollowers, setCopyFollowers] = useState(false)

  // Create project / view
  const [createOpen, setCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [createViewOpen, setCreateViewOpen] = useState(false)
  const [viewName, setViewName] = useState("")
  const [toast, setToast] = useState<{
    msg: string
    link?: { label: string; href: string }
  } | null>(null)

  // Mount-only sync from localStorage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFollowedKeys(readFollowedKeys())
  }, [])

  useEffect(() => {
    if (openRowMenu === null) return
    const h = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node))
        setOpenRowMenu(null)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [openRowMenu])

  useEffect(() => {
    if (!sortOpen) return
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [sortOpen])

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
    if (!tlSortOpen) return
    const h = (e: MouseEvent) => {
      if (tlSortRef.current && !tlSortRef.current.contains(e.target as Node))
        setTlSortOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [tlSortOpen])

  useEffect(() => {
    if (!moreFiltersOpen) return
    const h = (e: MouseEvent) => {
      if (
        moreFiltersRef.current &&
        !moreFiltersRef.current.contains(e.target as Node)
      )
        setMoreFiltersOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [moreFiltersOpen])

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

  const projects: FollowedProject[] = followedKeys
    .map((k) => projectCatalog[k])
    .filter((p): p is FollowedProject => Boolean(p))

  const showToast = (msg: string, link?: { label: string; href: string }) => {
    setToast({ msg, link })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) return
    const key =
      name
        .slice(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "") || "NEW"
    projectCatalog[key] = {
      id: Date.now(),
      name,
      key,
      type: "scrum",
      lead: "Abhishek Sharma",
      href: `/projects/${key}/board`,
      icon: name.charAt(0).toUpperCase(),
      status: "PENDING",
      targetDate: null,
      lastUpdated: null,
    }
    const next = [...followedKeys, key]
    setFollowedKeys(next)
    writeFollowedKeys(next)
    setCreateOpen(false)
    setNewProjectName("")
    showToast("Project created")
  }

  function handleUnfollow(id: number) {
    const proj = projects.find((p) => p.id === id)
    if (!proj) return
    const next = followedKeys.filter((k) => k !== proj.key)
    setFollowedKeys(next)
    writeFollowedKeys(next)
  }

  function handleFilterClick(filterId: string) {
    if (activeFilters.has(filterId)) {
      setOpenFilter(openFilter === filterId ? null : filterId)
    } else {
      setActiveFilters((prev) => new Set([...prev, filterId]))
      setOpenFilter(filterId)
    }
  }

  function handleRemoveFilter(filterId: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.delete(filterId)
      return next
    })
    setFilterValues((prev) => {
      const next = { ...prev }
      delete next[filterId]
      return next
    })
    setOpenFilter(null)
  }

  function handleSelectFilterValue(filterId: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }))
    setOpenFilter(null)
  }

  const filteredProjects = projects.filter((p) => {
    if (archivedIds.has(p.id)) return false
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.lead.toLowerCase().includes(q)
    )
  })

  const sortedProjects = filteredProjects.slice().sort((a, b) => {
    const dir = sortAsc ? 1 : -1
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir
    if (sortBy === "status") return a.status.localeCompare(b.status) * dir
    return a.name.localeCompare(b.name) * dir
  })

  // Filters that are active (chip shown) or inactive (button shown)
  const activeFilterIds = Array.from(activeFilters)

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex max-w-[340px] items-start gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-xl">
          <svg
            className="mt-0.5 size-5 shrink-0 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{toast.msg}</p>
            {toast.link && (
              <Link
                href={toast.link.href}
                className="text-sm text-blue-600 hover:underline"
              >
                {toast.link.label}
              </Link>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>
      )}

      {/* Create view modal */}
      {createViewOpen && (
        <div
          data-testid="create-view-modal"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => {
            setCreateViewOpen(false)
            setViewName("")
          }}
        >
          <div
            className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-semibold">Create view</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Save your current filters, sort order and columns as a view.
            </p>
            <label className="mb-1.5 block text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              autoFocus
              placeholder="e.g. My team's projects"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setCreateViewOpen(false)
                  setViewName("")
                }}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (viewName.trim()) {
                    showToast(`View "${viewName.trim()}" created`)
                    setCreateViewOpen(false)
                    setViewName("")
                  }
                }}
                disabled={!viewName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create view
              </button>
            </div>
          </div>
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
            <label className="mb-1.5 block text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
              placeholder="e.g. Mobile App"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
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

      {/* Copy project modal */}
      {copyModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setCopyModal(null)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Copy project</h2>
              <button
                onClick={() => setCopyModal(null)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <label className="mb-1.5 block text-sm font-medium">
              Project name
            </label>
            <input
              type="text"
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              autoFocus
              className="mb-4 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <p className="mb-2 text-sm font-medium">Include</p>
            <label className="mb-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={copyLinks}
                onChange={(e) => setCopyLinks(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Links</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={copyFollowers}
                onChange={(e) => setCopyFollowers(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Followers</span>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setCopyModal(null)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (copyModal) {
                    const newKey = `COPY_${Date.now()}`
                    projectCatalog[newKey] = {
                      ...copyModal,
                      id: Date.now(),
                      name: copyName,
                      key: newKey,
                      href: `/projects/${newKey}/board`,
                    }
                    const next = [...followedKeys, newKey]
                    setFollowedKeys(next)
                    writeFollowedKeys(next)
                    showToast(`"${copyName}" created`)
                  }
                  setCopyModal(null)
                  setCopyLinks(false)
                  setCopyFollowers(false)
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Following</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Create project
        </button>
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
          placeholder="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pr-4 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter bar */}
      <div
        ref={filterBarRef}
        className="mb-4 flex items-center justify-between gap-2"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {/* Active filter chips */}
          {activeFilterIds.map((filterId) => {
            const config = FILTER_CONFIGS.find((f) => f.id === filterId)!
            const value = filterValues[filterId]
            const chipLabel = value
              ? `${config.label} is ${value}`
              : `${config.label} is`
            return (
              <div
                key={filterId}
                data-testid={`filter-chip-${filterId}`}
                className="relative"
              >
                <div className="flex items-center">
                  <div
                    onClick={() => handleFilterClick(filterId)}
                    role="presentation"
                    className="flex cursor-pointer items-center gap-1.5 rounded-l-full border border-r-0 border-blue-500 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 transition-colors dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {config.icon}
                    {chipLabel}
                  </div>
                  <button
                    onClick={() => handleRemoveFilter(filterId)}
                    aria-label={`Remove ${config.label} filter`}
                    className="flex items-center justify-center rounded-r-full border border-blue-500 bg-blue-50 px-2 py-1.5 text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
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
                {openFilter === filterId && (
                  <FilterDropdown
                    config={config}
                    onSelect={(v) => handleSelectFilterValue(filterId, v)}
                  />
                )}
              </div>
            )
          })}

          {/* Inactive inline filter buttons — hidden when any chip is active */}
          {activeFilters.size === 0 &&
            FILTER_CONFIGS.filter((f) => INLINE_FILTER_IDS.includes(f.id)).map(
              (f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterClick(f.id)}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent dark:border-gray-700"
                >
                  {f.icon}
                  {f.buttonLabel ?? f.label}
                </button>
              )
            )}

          {/* "..." more-filters for Starred + Reporting line — hidden when any chip is active */}
          {activeFilters.size === 0 &&
            FILTER_CONFIGS.some(
              (f) => EXTRA_FILTER_IDS.includes(f.id) && !activeFilters.has(f.id)
            ) && (
              <div ref={moreFiltersRef} className="relative">
                <button
                  data-testid="more-filters-btn"
                  onClick={() => setMoreFiltersOpen((v) => !v)}
                  className={`flex items-center justify-center rounded-lg border px-2 py-1.5 transition-colors ${moreFiltersOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  </svg>
                </button>
                {moreFiltersOpen && (
                  <div
                    data-testid="more-filters-dropdown"
                    className="absolute top-full left-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg"
                  >
                    {FILTER_CONFIGS.filter(
                      (f) =>
                        EXTRA_FILTER_IDS.includes(f.id) &&
                        !activeFilters.has(f.id)
                    ).map((f) => (
                      <button
                        key={f.id}
                        data-testid={
                          f.id === "starred"
                            ? "more-filter-starred"
                            : f.id === "reporting"
                              ? "more-filter-reporting-line"
                              : undefined
                        }
                        onClick={() => {
                          setActiveFilters((prev) => new Set([...prev, f.id]))
                          setMoreFiltersOpen(false)
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
        </div>

        {/* Right: Reset + Create view */}
        <div className="ml-2 flex shrink-0 items-center gap-2">
          <button
            data-testid="reset-btn"
            onClick={() => {
              setActiveFilters(new Set())
              setFilterValues({})
              setOpenFilter(null)
              setMoreFiltersOpen(false)
              setSearch("")
              setSortBy("following")
              setSortAsc(true)
              setTlSortBy("start date")
              setTlSortAsc(true)
              setTlViewBy("Months")
              setTlRangeStart(new Date(2025, 11, 17))
              setTlRangeEnd(new Date(2027, 5, 17))
              setArchivedIds(new Set())
              setFollowedKeys(readFollowedKeys())
            }}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
          <button
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
          Showing {sortedProjects.length} project
          {sortedProjects.length !== 1 ? "s" : ""}
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
                  {fmtDateF(tlRangeStart)} - {fmtDateF(tlRangeEnd)}
                </button>
                {tlRangePickerOpen && (
                  <FDateRangePicker
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

          {/* View toggles */}
          <div className="flex items-center gap-0.5">
            <button
              title="Display as list"
              onClick={() => setViewMode("list")}
              className={`rounded-l-lg border border-r-0 p-2 transition-colors ${viewMode === "list" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
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
              className={`rounded-r-lg border p-2 transition-colors ${viewMode === "timeline" ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "border-border text-muted-foreground hover:bg-accent"}`}
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="3" width="14" height="1.8" rx="0.9" />
                <rect x="1" y="7.1" width="14" height="1.8" rx="0.9" />
                <rect x="1" y="11.2" width="14" height="1.8" rx="0.9" />
              </svg>
            </button>
          </div>

          {/* List-only: sort + columns */}
          {viewMode === "list" && (
            <>
              <div ref={sortRef} className="relative flex items-center">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className={`flex items-center gap-1 rounded-l-lg border border-r-0 px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${sortOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
                >
                  Sort by {sortBy}
                </button>
                <div className="group/rev relative">
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className={`flex items-center justify-center rounded-r-lg border px-2 py-1.5 transition-colors ${sortOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d={sortAsc ? "M8 11L4 6h8z" : "M8 5l4 5H4z"} />
                    </svg>
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/rev:opacity-100">
                    Reverse sort order
                  </span>
                </div>
                {sortOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Sort by
                    </p>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt)
                          setSortOpen(false)
                        }}
                        className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent ${sortBy === opt ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20" : ""}`}
                      >
                        Sort by {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <FollowingColumnsPanel
                open={columnsOpen}
                setOpen={setColumnsOpen}
                visibleCols={visibleCols}
                setVisibleCols={setVisibleCols}
                customCols={customCols}
                onAddColumn={(col) => setCustomCols((prev) => [...prev, col])}
              />
            </>
          )}

          {/* Timeline-only: sort by start/target date */}
          {viewMode === "timeline" && (
            <div ref={tlSortRef} className="relative flex items-center">
              <button
                onClick={() => setTlSortOpen((v) => !v)}
                className={`flex items-center gap-1 rounded-l-lg border border-r-0 px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${tlSortOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              >
                Sort by {tlSortBy}
              </button>
              <div className="group/tlrev relative">
                <button
                  onClick={() => setTlSortAsc((v) => !v)}
                  className={`flex items-center justify-center rounded-r-lg border px-2 py-1.5 transition-colors ${tlSortOpen ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
                >
                  <svg
                    className="size-3.5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d={tlSortAsc ? "M8 11L4 6h8z" : "M8 5l4 5H4z"} />
                  </svg>
                </button>
                <span className="pointer-events-none absolute right-0 bottom-full z-50 mb-1.5 rounded bg-gray-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tlrev:opacity-100">
                  Reverse sort order
                </span>
              </div>
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

          {/* More menu */}
          <FollowingMoreMenu
            open={moreMenuOpen}
            setOpen={setMoreMenuOpen}
            onCopyLink={() => {
              navigator.clipboard
                ?.writeText(window.location.href)
                .catch(() => {})
              showToast("Link copied")
            }}
            onExport={() => showToast("Export started")}
          />
        </div>
      </div>

      {/* Table (list view) */}
      {viewMode === "list" && sortedProjects.length > 0 && (
        <div className="rounded-lg border">
          <div className="flex gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
            <span className="min-w-0 flex-1">Name</span>
            {visibleCols.status && (
              <span className="w-[110px] shrink-0">Status</span>
            )}
            {visibleCols.target_date && (
              <span className="w-[120px] shrink-0">Target date</span>
            )}
            {visibleCols.owner && (
              <span className="w-[80px] shrink-0">Owner</span>
            )}
            {visibleCols.following && (
              <span className="w-[120px] shrink-0">Following</span>
            )}
            {visibleCols.last_updated && (
              <span className="w-[120px] shrink-0">Last updated</span>
            )}
            <span className="w-8 shrink-0" />
          </div>
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              data-testid="project-row"
              className="group flex items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/50"
            >
              {/* Name */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {project.icon}
                </div>
                <Link
                  href={project.href}
                  className="truncate text-sm font-medium hover:text-blue-600 hover:underline"
                >
                  {project.name}
                </Link>
              </div>
              {/* Status */}
              {visibleCols.status && (
                <div className="w-[110px] shrink-0">
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_BORDER[project.status] ?? STATUS_BORDER["PENDING"]}`}
                  >
                    {project.status}
                  </span>
                </div>
              )}
              {/* Target date */}
              {visibleCols.target_date && (
                <div className="w-[120px] shrink-0">
                  <button className="flex items-center gap-1.5 rounded border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent">
                    <svg
                      className="size-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="2" width="12" height="12" rx="1.5" />
                      <path d="M2 6h12M5 2v2M11 2v2" />
                    </svg>
                    No date
                  </button>
                </div>
              )}
              {/* Owner */}
              {visibleCols.owner && (
                <div className="w-[80px] shrink-0">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white uppercase">
                    {project.lead
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                </div>
              )}
              {/* Following */}
              {visibleCols.following && (
                <div className="w-[120px] shrink-0">
                  <button
                    onClick={() => handleUnfollow(project.id)}
                    className="text-xs text-muted-foreground transition-colors hover:text-red-600"
                  >
                    Following
                  </button>
                </div>
              )}
              {/* Last updated */}
              {visibleCols.last_updated && (
                <div className="w-[120px] shrink-0">
                  <span className="text-xs text-muted-foreground">-</span>
                </div>
              )}
              {/* Row menu */}
              <div className="flex w-8 shrink-0 items-center justify-end">
                <div
                  ref={openRowMenu === project.id ? rowMenuRef : undefined}
                  className="relative"
                >
                  <button
                    data-testid="row-menu-btn"
                    onClick={() =>
                      setOpenRowMenu(
                        openRowMenu === project.id ? null : project.id
                      )
                    }
                    className={`rounded p-1 text-muted-foreground transition-colors hover:bg-accent ${openRowMenu === project.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                  </button>
                  {openRowMenu === project.id && (
                    <div
                      data-testid="row-menu-dropdown"
                      className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border bg-popover py-1 shadow-lg"
                    >
                      {starredProjects.has(project.id) ? (
                        <button
                          data-testid="row-action-star"
                          onClick={() => {
                            setStarredProjects((prev) => {
                              const next = new Set(prev)
                              next.delete(project.id)
                              return next
                            })
                            showToast(`"${project.name}" removed from starred`)
                            setOpenRowMenu(null)
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          <svg
                            className="size-4 shrink-0 text-orange-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          Unstar
                        </button>
                      ) : (
                        <button
                          data-testid="row-action-star"
                          onClick={() => {
                            setStarredProjects(
                              (prev) => new Set([...prev, project.id])
                            )
                            showToast(
                              "This project has been added to your starred list",
                              {
                                label: "Go to Starred",
                                href: "/project-directory",
                              }
                            )
                            setOpenRowMenu(null)
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
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
                          Star
                        </button>
                      )}
                      <button
                        data-testid="row-action-archive"
                        onClick={() => {
                          setArchivedIds(
                            (prev) => new Set([...prev, project.id])
                          )
                          showToast(`"${project.name}" archived`)
                          setOpenRowMenu(null)
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <svg
                          className="size-4 shrink-0 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="21 8 21 21 3 21 3 8" />
                          <rect x="1" y="3" width="22" height="5" />
                          <line x1="10" y1="12" x2="14" y2="12" />
                        </svg>
                        Archive project
                      </button>
                      <button
                        data-testid="row-action-copy"
                        onClick={() => {
                          setCopyModal(project)
                          setCopyName(`${project.name} (copy)`)
                          setOpenRowMenu(null)
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <svg
                          className="size-4 shrink-0 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline view */}
      {viewMode === "timeline" && (
        <div className="rounded-lg border">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="mb-4 size-16 text-muted-foreground/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="mb-1 text-sm font-medium">
              We couldn&apos;t find any projects matching your search.
            </p>
            <p className="text-sm text-muted-foreground">
              Try changing your search criteria or{" "}
              <button
                onClick={() => {
                  setActiveFilters(new Set())
                  setFilterValues({})
                  setOpenFilter(null)
                  setSearch("")
                }}
                className="text-blue-600 hover:underline"
              >
                clear all filters
              </button>
              .
            </p>
          </div>
        </div>
      )}

      {/* Empty state (list view, no results) */}
      {viewMode === "list" && sortedProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="mb-4 size-16 text-muted-foreground/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="mb-1 text-sm font-medium">No followed projects</p>
          <p className="text-sm text-muted-foreground">
            Follow projects from the{" "}
            <Link
              href="/project-directory"
              className="text-blue-600 hover:underline"
            >
              project directory
            </Link>{" "}
            to see them here.
          </p>
        </div>
      )}
    </div>
  )
}
