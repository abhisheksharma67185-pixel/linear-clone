"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserProfileCard } from "@/components/user-profile-card"
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
import { useCustomFields } from "@/hooks/use-custom-fields"
import { CustomFieldCell } from "@/components/custom-field-cell"
import {
  BASE_COLUMNS_DEF,
  COL_WIDTHS,
  RESERVED_LABELS,
  customColWidth,
  type ColumnDef,
} from "@/lib/columns-def"

// ─── Types ────────────────────────────────────────────────────────────────────

const goalStatuses = [
  { value: "OFF TRACK", color: "bg-red-400 text-white" },
  { value: "AT RISK", color: "bg-yellow-300 text-yellow-900" },
  { value: "ON TRACK", color: "bg-green-400 text-white" },
  { value: "PENDING", color: "bg-gray-200 text-gray-700" },
  { value: "PAUSED", color: "bg-gray-200 text-gray-700" },
  { value: "COMPLETED", color: "bg-gray-200 text-gray-700" },
  { value: "CANCELLED", color: "bg-gray-200 text-gray-700" },
]

const owners = [{ id: "1", name: "Abhishek Sharma", initials: "AS" }]

interface GoalRow {
  id: string
  name: string
  status: string
  progress: number
  targetDate: string
  owner: { name: string; initials: string; email?: string }
  team: string
  following: boolean
  fieldValues: Record<string, unknown>
}

type FilterType =
  | "tag"
  | "status"
  | "owner"
  | "team"
  | "starred"
  | "metric"
  | "reporting"
  | null

const filterConfig = [
  {
    id: "tag" as const,
    label: "Tag is",
    btnLabel: "# Tag",
    placeholder: "Choose a tag",
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
    id: "status" as const,
    label: "Status is",
    btnLabel: "Status",
    placeholder: "Choose a status",
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
    id: "owner" as const,
    label: "Owner is",
    btnLabel: "Owner",
    placeholder: "Choose an owner",
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
    id: "team" as const,
    label: "Team is",
    btnLabel: "Team",
    placeholder: "Choose a team",
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
    id: "starred" as const,
    label: "Starred",
    btnLabel: "Starred",
    placeholder: "",
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
    id: "metric" as const,
    label: "Metric is",
    btnLabel: "Metric",
    placeholder: "Choose a metric",
    icon: (
      <svg
        className="size-3.5"
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
    id: "reporting" as const,
    label: "Reporting line for",
    btnLabel: "Reporting line",
    placeholder: "",
    icon: (
      <svg
        className="size-3.5"
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

function InlineFilterDropdown({
  filter,
  onClose,
  onSelect,
}: {
  filter: (typeof filterConfig)[0]
  onClose: () => void
  onSelect: (label: string) => void
}) {
  const [search, setSearch] = useState("")
  if (filter.id === "reporting") {
    return (
      <div className="mt-2 w-[320px] rounded-lg border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400">
            <svg
              className="size-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="my-1 h-6 w-px bg-muted-foreground/30" />
          <div className="flex items-end gap-6">
            <div className="size-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500" />
            <div className="size-8 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700" />
            <div className="size-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" />
          </div>
        </div>
        <h3 className="mb-1 text-sm font-semibold">
          Stay across the projects your reports work on
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Connect your identity provider to get started
        </p>
        <Button variant="outline" size="sm" className="gap-1.5">
          Show me how
          <svg
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
        </Button>
      </div>
    )
  }
  if (filter.id === "starred") return null
  return (
    <div className="mt-2 w-[260px] rounded-lg border bg-background p-3 shadow-sm">
      <div className="relative mb-2">
        <Input
          placeholder={filter.placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 border-2 border-blue-500 pr-9"
          autoFocus
        />
        <svg
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filter.id === "status" ? (
          <div className="space-y-1">
            {goalStatuses
              .filter(
                (s) =>
                  !search ||
                  s.value.toLowerCase().includes(search.toLowerCase())
              )
              .map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    onSelect(status.value)
                    onClose()
                  }}
                  className="flex w-full items-center rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
                >
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${status.color}`}
                  >
                    {status.value}
                  </span>
                </button>
              ))}
          </div>
        ) : filter.id === "owner" ? (
          <div className="space-y-1">
            {owners
              .filter(
                (o) =>
                  !search || o.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((owner) => (
                <button
                  key={owner.id}
                  onClick={() => {
                    onSelect(owner.name)
                    onClose()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
                >
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">
                      {owner.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{owner.name}</span>
                </button>
              ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No options
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ColIcon ──────────────────────────────────────────────────────────────────

function ColIcon({ icon }: { icon: string }) {
  return (
    <svg
      className="size-4 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {icon === "type" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </>
      )}
      {icon === "status" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
        </>
      )}
      {icon === "activity" && (
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      )}
      {icon === "calendar" && (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      )}
      {icon === "user" && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </>
      )}
      {icon === "eye" && (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {icon === "hash" && (
        <>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </>
      )}
      {icon === "team" && (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {icon === "link" && (
        <>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </>
      )}
      {icon === "bar" && (
        <>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </>
      )}
      {icon === "custom" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </>
      )}
    </svg>
  )
}

// ─── Validate field name ──────────────────────────────────────────────────────

function validateFieldName(
  name: string,
  existingNames: string[]
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return "Field name is required"
  if (trimmed.length > 50) return "Field name must be 50 characters or fewer"
  const lc = trimmed.toLowerCase()
  if (RESERVED_LABELS.some((r) => r.toLowerCase() === lc))
    return `"${trimmed}" is a reserved column name`
  if (existingNames.some((l) => l.toLowerCase() === lc))
    return `A field named "${trimmed}" already exists`
  return null
}

// ─── Calendar components (for date range picker) ──────────────────────────────

const CAL_MONTHS = [
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
const CAL_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getDaysInMonth(m: number, y: number) {
  return new Date(y, m + 1, 0).getDate()
}
function getFirstDay(m: number, y: number) {
  return new Date(y, m, 1).getDay()
}

function CalMonth({
  month,
  year,
  onPrev,
  onNext,
  onPrevY,
  onNextY,
}: {
  month: number
  year: number
  onPrev: () => void
  onNext: () => void
  onPrevY: () => void
  onNextY: () => void
}) {
  const dim = getDaysInMonth(month, year)
  const fd = getFirstDay(month, year)
  const prevDim = getDaysInMonth(
    month === 0 ? 11 : month - 1,
    month === 0 ? year - 1 : year
  )
  const today = new Date()
  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  const cells = []
  for (let i = fd - 1; i >= 0; i--)
    cells.push(
      <span
        key={`p${i}`}
        className="flex size-8 items-center justify-center text-xs text-muted-foreground/40"
      >
        {prevDim - i}
      </span>
    )
  for (let d = 1; d <= dim; d++)
    cells.push(
      <button
        key={d}
        className={`flex size-8 items-center justify-center rounded-full text-xs transition-colors hover:bg-accent ${isToday(d) ? "bg-blue-600 font-semibold text-white hover:bg-blue-700" : ""}`}
      >
        {d}
      </button>
    )
  const rem = 42 - cells.length
  for (let d = 1; d <= rem; d++)
    cells.push(
      <span
        key={`n${d}`}
        className="flex size-8 items-center justify-center text-xs text-muted-foreground/40"
      >
        {d}
      </span>
    )
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            onClick={onPrevY}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
          <button
            onClick={onPrev}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <span className="text-sm font-medium">
          {CAL_MONTHS[month]} {year}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onNext}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            onClick={onNextY}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {CAL_DAY_LABELS.map((d) => (
          <span
            key={d}
            className="flex size-8 items-center justify-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {cells}
      </div>
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
          <CalMonth
            month={startMonth}
            year={startYear}
            onPrev={() => {
              const [m, y] = nav(startMonth, startYear, -1)
              setStartMonth(m)
              setStartYear(y)
            }}
            onNext={() => {
              const [m, y] = nav(startMonth, startYear, 1)
              setStartMonth(m)
              setStartYear(y)
            }}
            onPrevY={() => setStartYear(startYear - 1)}
            onNextY={() => setStartYear(startYear + 1)}
          />
        </div>
        <div>
          <p className="mb-2 text-center text-sm font-medium">End</p>
          <CalMonth
            month={endMonth}
            year={endYear}
            onPrev={() => {
              const [m, y] = nav(endMonth, endYear, -1)
              setEndMonth(m)
              setEndYear(y)
            }}
            onNext={() => {
              const [m, y] = nav(endMonth, endYear, 1)
              setEndMonth(m)
              setEndYear(y)
            }}
            onPrevY={() => setEndYear(endYear - 1)}
            onNextY={() => setEndYear(endYear + 1)}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <span className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
          7 Dec 2025 - 7 Jun 2027
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const router = useRouter()
  const { fields: customFields, renameField, deleteField } = useCustomFields()

  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [goalDesc, setGoalDesc] = useState("")
  const [goalType, setGoalType] = useState("Objective")
  const [goalTeam, setGoalTeam] = useState("Engineering")
  const [goalOwner, setGoalOwner] = useState("Abhishek Sharma")
  const [toast, setToast] = useState<string | null>(null)
  const goalNameRef = useRef<HTMLInputElement>(null)

  // Column toggles
  const [baseColState, setBaseColState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(BASE_COLUMNS_DEF.map((c) => [c.id, c.enabled]))
  )
  const [customColEnabled, setCustomColEnabled] = useState<
    Record<string, boolean>
  >({})
  const [showColumns, setShowColumns] = useState(false)
  const [colSearch, setColSearch] = useState("")

  // Rename/delete
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameFieldId, setRenameFieldId] = useState("")
  const [renameValue, setRenameValue] = useState("")
  const [renameError, setRenameError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const deleteConfirmLabel = ""

  const [openFilter, setOpenFilter] = useState<FilterType>(null)
  const [activeFilters, setActiveFilters] = useState<
    { type: string; label: string }[]
  >([])
  const [sortBy, setSortBy] = useState("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "timeline">("timeline")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange] = useState("7 Dec 2025 - 7 Jun 2027")
  const [viewBy, setViewBy] = useState<"Months" | "Weeks">("Months")
  const [showCreateView, setShowCreateView] = useState(false)
  const [viewName, setViewName] = useState("")
  const [customViews, setCustomViews] = useState<
    { name: string; starred: boolean }[]
  >([])
  const [activeTab, setActiveTab] = useState("all")
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [viewSearch, setViewSearch] = useState("")
  const [moreViewsOpen, setMoreViewsOpen] = useState(false)

  // Auto-enable newly created custom fields (external sync: customFields → UI).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomColEnabled((prev) => {
      const next = { ...prev }
      let changed = false
      for (const cf of customFields) {
        if (!(cf.id in next)) {
          next[cf.id] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [customFields])

  const fetchGoals = useCallback(() => {
    fetch("/api/data/goals")
      .then((r) => r.json())
      .then(async (data: Record<string, unknown>[]) => {
        const rows: GoalRow[] = await Promise.all(
          data.map(async (g) => {
            const ou = g.ownerUser as {
              displayName?: string
              name?: string
              email?: string
            } | null
            const ownerName = ou?.displayName ?? ou?.name ?? "Unknown"
            let fieldValues: Record<string, unknown> = {}
            try {
              const fvRes = await fetch(`/api/data/goals/${g.id}/field-values`)
              if (fvRes.ok) fieldValues = await fvRes.json()
            } catch {
              /* silent */
            }
            return {
              id: g.id as string,
              name: g.name as string,
              status: g.status as string,
              progress: g.progress as number,
              targetDate: (g.targetDate as string) || "No date",
              owner: {
                name: ownerName,
                initials: ownerName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2),
                email: ou?.email,
              },
              team: (g.team as string) || "",
              following: g.following as boolean,
              fieldValues,
            }
          })
        )
        setGoals(rows)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleSaveFieldValue = useCallback(
    async (goalId: string, fieldId: string, value: unknown) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, fieldValues: { ...g.fieldValues, [fieldId]: value } }
            : g
        )
      )
      await fetch(`/api/data/goals/${goalId}/field-values`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldId]: value }),
      }).catch(() => null)
    },
    []
  )

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateGoal = async () => {
    const nameFromDOM = goalNameRef.current?.value?.trim() ?? ""
    const name = nameFromDOM || goalName.trim()
    if (!name) return
    const ownerMap: Record<string, string> = {
      "Abhishek Sharma": "usr-1",
      "Sam Williams": "usr-2",
      "Jordan Lee": "usr-3",
      "Taylor Brown": "usr-4",
    }
    await fetch("/api/data/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        owner: ownerMap[goalOwner] ?? "usr-1",
        team: goalTeam,
      }),
    }).catch(() => null)
    setCreateOpen(false)
    setGoalName("")
    setGoalDesc("")
    setGoalType("Objective")
    setGoalTeam("Engineering")
    setGoalOwner("Abhishek Sharma")
    if (goalNameRef.current) goalNameRef.current.value = ""
    showToast("Goal created")
    fetchGoals()
  }

  const existingNames = customFields.map((f) => f.name)

  const handleRenameField = async () => {
    if (!renameFieldId) return
    const otherNames = existingNames.filter(
      (_, i) => customFields[i]?.id !== renameFieldId
    )
    const err = validateFieldName(renameValue, otherNames)
    if (err) {
      setRenameError(err)
      return
    }
    try {
      await renameField(renameFieldId, renameValue.trim())
      showToast("Field renamed")
      setRenameOpen(false)
      setRenameFieldId("")
      setRenameValue("")
      setRenameError(null)
    } catch (e: unknown) {
      setRenameError(e instanceof Error ? e.message : "Failed to rename field")
    }
  }

  const handleDeleteField = async (id: string) => {
    try {
      await deleteField(id)
      showToast("Field deleted")
    } catch {
      showToast("Failed to delete field")
    }
    setDeleteConfirmId(null)
  }

  const removeFilter = (type: string) =>
    setActiveFilters((prev) => prev.filter((f) => f.type !== type))
  const resetFilters = () => {
    setActiveFilters([])
    setOpenFilter(null)
    setSearch("")
    setActiveTab("all")
  }
  const addActiveFilter = (type: string, label: string) =>
    setActiveFilters((prev) => [
      ...prev.filter((f) => f.type !== type),
      { type, label },
    ])

  const filteredGoals = goals
    .filter((g) => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()))
        return false
      if (activeTab === "my" && g.owner.name !== "Abhishek Sharma") return false
      if (activeTab === "archived" && g.status !== "DONE") return false
      if (activeTab === "following" && !g.following) return false
      if (activeTab === "off-track" && g.status !== "OFF TRACK") return false
      if (activeTab === "at-risk" && g.status !== "AT RISK") return false
      for (const f of activeFilters) {
        if (f.type === "status" && g.status !== f.label) return false
        if (f.type === "owner" && g.owner.name !== f.label) return false
        if (f.type === "team" && g.team !== f.label) return false
        if (f.type === "following") {
          if (f.label === "Following" && !g.following) return false
          if (f.label === "Not following" && g.following) return false
        }
      }
      return true
    })
    .slice()
    .sort((a, b) => {
      const direction = sortAsc ? 1 : -1
      const cmpString = (x: string, y: string) => x.localeCompare(y) * direction
      if (sortBy === "name") return cmpString(a.name, b.name)
      if (sortBy === "status") return cmpString(a.status, b.status)
      if (sortBy === "target date") return cmpString(a.targetDate, b.targetDate)
      if (sortBy === "following")
        return (
          (a.following === b.following ? 0 : a.following ? -1 : 1) * direction
        )
      return 0
    })

  // Build combined columns
  const allColumns: ColumnDef[] = [
    ...BASE_COLUMNS_DEF.map((c) => ({
      ...c,
      enabled: baseColState[c.id] ?? c.enabled,
    })),
    ...customFields.map((cf) => ({
      id: cf.id,
      label: cf.name,
      icon: "custom",
      enabled: customColEnabled[cf.id] ?? true,
      locked: false,
      custom: true as const,
      fieldType: cf.type,
      options: cf.options,
      multi: cf.multi,
    })),
  ]

  const isEnabled = (id: string) =>
    allColumns.find((c) => c.id === id)?.enabled ?? false

  const enabledCols = allColumns.filter((c) => c.enabled)
  const enabledBuiltin = enabledCols.filter((c) => !c.custom)
  const enabledCustom = enabledCols.filter((c) => c.custom)

  // Build grid template for list view
  const builtinWidths = enabledBuiltin.map((c) => COL_WIDTHS[c.id] ?? "100px")
  const customWidths = enabledCustom.map((c) => customColWidth(c.fieldType))
  const gridTemplate = [...builtinWidths, ...customWidths].join(" ")

  const filteredDisplayCols = allColumns.filter(
    (c) => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase())
  )

  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading goals...
      </div>
    )

  return (
    <div className="p-6">
      {/* Title + Create */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Goals</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setCreateOpen(true)}
        >
          Create goal
        </Button>
      </div>

      {/* Create Goal modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          onClick={() => setCreateOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[480px] rounded-lg border bg-popover shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-6 pt-6 pb-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <svg
                className="size-5 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-lg font-semibold">Goal</span>
            </div>
            <p className="mb-3 px-6 text-xs text-muted-foreground">
              Required fields are marked with an asterisk{" "}
              <span className="text-red-500">*</span>
            </p>
            <div className="space-y-4 px-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
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
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="What is this goal about?"
                  className="min-h-[72px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="Objective">Objective</option>
                  <option value="Key Result">Key Result</option>
                  <option value="Project">Project</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Owner <span className="text-red-500">*</span>
                </label>
                <select
                  value={goalOwner}
                  onChange={(e) => setGoalOwner(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="Abhishek Sharma">Abhishek Sharma</option>
                  <option value="Sam Williams">Sam Williams</option>
                  <option value="Jordan Lee">Jordan Lee</option>
                  <option value="Taylor Brown">Taylor Brown</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Team <span className="text-red-500">*</span>
                </label>
                <select
                  value={goalTeam}
                  onChange={(e) => setGoalTeam(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="QA">QA</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t px-6 py-5">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGoal}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-1 border-b">
        {[
          { key: "all", label: "All goals" },
          { key: "my", label: "My goals" },
          { key: "archived", label: "Archived" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-2 pb-2 text-sm font-medium transition-colors ${activeTab === t.key ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
        <div className="relative">
          <button
            onClick={() => setMoreViewsOpen(!moreViewsOpen)}
            className={`flex items-center gap-1 px-2 pb-2 text-sm font-medium transition-colors ${["following", "off-track", "at-risk"].includes(activeTab) ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {activeTab === "following"
              ? "Following"
              : activeTab === "off-track"
                ? "Off track"
                : activeTab === "at-risk"
                  ? "At risk"
                  : "More views"}
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {moreViewsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMoreViewsOpen(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
                {[
                  { key: "following", label: "Following" },
                  { key: "off-track", label: "Off track" },
                  { key: "at-risk", label: "At risk" },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => {
                      setActiveTab(v.key)
                      setMoreViewsOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors ${activeTab === v.key ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "hover:bg-accent"}`}
                  >
                    {activeTab === v.key && (
                      <svg
                        className="size-3.5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {v.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {customViews.map((v) => (
          <div key={v.name} className="relative flex items-center">
            <button
              onClick={() => setActiveTab(v.name)}
              className={`flex items-center gap-1.5 px-2 pb-2 text-sm font-medium transition-colors ${activeTab === v.name ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              {v.name}
              {v.starred && (
                <svg
                  className="size-3.5 fill-orange-400 text-orange-400"
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )}
            </button>
            {activeTab === v.name && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="px-0.5 pb-2 text-muted-foreground hover:text-foreground">
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
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem
                    onClick={() =>
                      setCustomViews((prev) =>
                        prev.map((cv) =>
                          cv.name === v.name
                            ? { ...cv, starred: !cv.starred }
                            : cv
                        )
                      )
                    }
                  >
                    {v.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setCustomViews((prev) =>
                        prev.filter((cv) => cv.name !== v.name)
                      )
                      setActiveTab("all")
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-2 pb-2 text-sm text-muted-foreground hover:text-foreground"
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
          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setShowAddMenu(false)
                  setViewSearch("")
                }}
              />
              <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <svg
                      className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
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
                    onClick={() => {
                      setShowAddMenu(false)
                      setViewSearch("")
                      setShowCreateView(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
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
            <>
              {(() => {
                const filter = filterConfig.find((f) => f.id === openFilter)!
                return (
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-600">{filter.icon}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {filter.label}
                    </span>
                    <button
                      onClick={() => setOpenFilter(null)}
                      className="rounded-full bg-blue-600 p-0.5 text-white hover:bg-blue-700"
                    >
                      <svg
                        className="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )
              })()}
              <button
                onClick={resetFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowCreateView(true)}
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
                </svg>
                Create view
              </Button>
            </>
          ) : activeFilters.length > 0 ? (
            <>
              {activeFilters.map((f) => (
                <div
                  key={f.type}
                  className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm"
                >
                  <svg
                    className="size-3.5 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {f.type === "following" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="flex items-center gap-1 text-sm">
                            {f.label}
                            <svg
                              className="size-3 text-muted-foreground"
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
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem
                          onClick={() =>
                            setActiveFilters((prev) =>
                              prev.map((af) =>
                                af.type === "following"
                                  ? { ...af, label: "Following" }
                                  : af
                              )
                            )
                          }
                          className={
                            f.label === "Following"
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          }
                        >
                          Following
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setActiveFilters((prev) =>
                              prev.map((af) =>
                                af.type === "following"
                                  ? { ...af, label: "Not following" }
                                  : af
                              )
                            )
                          }
                          className={
                            f.label === "Not following"
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          }
                        >
                          Not following
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <span>{f.label}</span>
                      <svg
                        className="size-3 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </>
                  )}
                  <button
                    onClick={() => removeFilter(f.type)}
                    className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="size-3.5"
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
              ))}
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                Add filter
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                onClick={resetFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowCreateView(true)}
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
                </svg>
                Create view
              </Button>
            </>
          ) : (
            <>
              {filterConfig.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setOpenFilter(filter.id)}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                  {filter.icon}
                  {filter.btnLabel}
                </button>
              ))}
              <button
                onClick={resetFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowCreateView(true)}
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
                </svg>
                Create view
              </Button>
            </>
          )}
        </div>
        {openFilter && (
          <InlineFilterDropdown
            filter={filterConfig.find((f) => f.id === openFilter)!}
            onClose={() => setOpenFilter(null)}
            onSelect={(label) => addActiveFilter(openFilter as string, label)}
          />
        )}
      </div>

      {/* Count + view controls */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""}
          </p>
          {activeTab !== "all" && (
            <button
              onClick={() => router.push("/goals/status-updates")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Read updates
              <svg
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
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {viewMode === "timeline" && (
            <>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger
                  render={
                    <button className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent">
                      {dateRange}
                    </button>
                  }
                />
                <PopoverContent align="end" className="w-auto p-4">
                  <DateRangePicker />
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent">
                      View by {viewBy}
                      <svg
                        className="size-3"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>
                  }
                />
                <DropdownMenuContent align="start" className="w-36">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>View by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setViewBy("Months")}>
                      Months
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setViewBy("Weeks")}
                      className={viewBy === "Weeks" ? "text-blue-600" : ""}
                    >
                      Weeks
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <div className="flex rounded-md border">
            <button
              onClick={() => {
                setViewMode("list")
                setSortBy("following")
              }}
              className={`rounded-l-md border-r px-2 py-1 transition-colors ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              title="Display as list"
            >
              <svg
                className={`size-4 ${viewMode === "list" ? "text-blue-600" : ""}`}
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
              onClick={() => {
                setViewMode("timeline")
                setSortBy("name")
              }}
              className={`rounded-r-md px-2 py-1 transition-colors ${viewMode === "timeline" ? "bg-blue-50 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              title="Display as timeline"
            >
              <svg
                className={`size-4 ${viewMode === "timeline" ? "text-blue-600" : ""}`}
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

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent">
                  Sort by {sortBy}
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <div className="relative px-2 py-1.5">
                <Input placeholder="Select..." className="h-7 pr-7 text-xs" />
                <svg
                  className="absolute top-1/2 right-4 size-3.5 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                {[
                  "Name",
                  "Status",
                  "Target date",
                  "Following",
                  "Last updated",
                  "Follower count",
                ].map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => setSortBy(opt.toLowerCase())}
                    className={
                      sortBy === opt.toLowerCase()
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                        : ""
                    }
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="rounded-md border px-1.5 py-1 text-muted-foreground transition-colors hover:bg-accent"
            title="Reverse sort order"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {sortAsc ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          </button>

          {/* Columns button */}
          <Popover
            open={showColumns}
            onOpenChange={(open) => {
              setShowColumns(open)
              if (!open) setColSearch("")
            }}
          >
            <PopoverTrigger
              render={
                <button
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors ${showColumns ? "border-blue-500 text-blue-600" : "text-muted-foreground hover:bg-accent"}`}
                >
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
                  <svg
                    className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
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
              <div className="max-h-80 overflow-y-auto px-1 pb-1">
                {filteredDisplayCols.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <ColIcon icon={col.icon} />
                      <span className="truncate text-sm">{col.label}</span>
                      {col.custom && (
                        <span className="ml-1 shrink-0 rounded bg-[#e9f2ff] px-1.5 py-0.5 text-[10px] font-medium text-[#0052cc]">
                          {col.fieldType}
                        </span>
                      )}
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                      {col.locked ? (
                        <svg
                          className="size-4 text-muted-foreground/40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <button
                          onClick={() => {
                            if (col.custom)
                              setCustomColEnabled((prev) => ({
                                ...prev,
                                [col.id]: !col.enabled,
                              }))
                            else
                              setBaseColState((prev) => ({
                                ...prev,
                                [col.id]: !col.enabled,
                              }))
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${col.enabled ? "bg-green-500" : "bg-muted-foreground/30"}`}
                        >
                          <span
                            className={`inline-block size-3.5 rounded-full bg-white transition-transform ${col.enabled ? "translate-x-[18px]" : "translate-x-1"}`}
                          />
                          {!col.enabled && (
                            <svg
                              className="absolute right-1 size-2.5 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                          {col.enabled && (
                            <svg
                              className="absolute left-1.5 size-2.5 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-2">
                <Link
                  href="/goals/settings?tab=fields"
                  onClick={() => setShowColumns(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#dfe1e6] px-3 py-2 text-sm text-[#626f86] transition-colors hover:border-solid hover:bg-accent"
                >
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add a new field
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="rounded-md border px-1.5 py-1 text-muted-foreground transition-colors hover:bg-accent">
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
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Goals table */}
      {filteredGoals.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          {/* Header */}
          <div
            className="grid gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {enabledBuiltin.map((col) => (
              <span key={col.id} className="truncate">
                {col.label}
              </span>
            ))}
            {enabledCustom.map((col) => (
              <span
                key={col.id}
                className={`truncate ${col.fieldType === "Number" ? "text-right" : ""}`}
              >
                {col.label}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => router.push(`/goals/${goal.id}`)}
              className="group/row relative grid cursor-pointer items-center gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/50"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {/* Built-in columns */}
              <Link
                href={`/goals/${goal.id}`}
                className="flex items-center gap-2 transition-colors hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="size-4 shrink-0 text-muted-foreground/50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="truncate text-sm">{goal.name}</span>
              </Link>
              {isEnabled("status") && (
                <div onClick={(e) => e.stopPropagation()}>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${goal.status === "ON TRACK" ? "bg-green-400 text-white" : goal.status === "AT RISK" ? "bg-yellow-300 text-yellow-900" : goal.status === "OFF TRACK" ? "bg-red-400 text-white" : goal.status === "DONE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}
                  >
                    {goal.status}
                  </span>
                </div>
              )}
              {isEnabled("progress") && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-1.5 w-16 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {goal.progress}%
                  </span>
                </div>
              )}
              {isEnabled("target_date") && (
                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="size-3.5"
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
              )}
              {isEnabled("owner") && (
                <div onClick={(e) => e.stopPropagation()}>
                  <UserProfileCard
                    name={goal.owner.name}
                    email={goal.owner.email}
                    initials={goal.owner.initials}
                  />
                </div>
              )}
              {isEnabled("following") && (
                <div onClick={(e) => e.stopPropagation()}>
                  {goal.following ? (
                    <div className="group/follow relative">
                      <span className="text-xs text-muted-foreground group-hover/follow:hidden">
                        Following
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setGoals((prev) =>
                            prev.map((g) =>
                              g.id === goal.id ? { ...g, following: false } : g
                            )
                          )
                        }}
                        className="hidden rounded-md bg-red-500 px-3 py-1 text-[11px] font-medium text-white group-hover/follow:inline-flex hover:bg-red-600"
                      >
                        Unfollow
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setGoals((prev) =>
                          prev.map((g) =>
                            g.id === goal.id ? { ...g, following: true } : g
                          )
                        )
                      }}
                      className="text-xs text-muted-foreground transition-colors hover:text-blue-600"
                    >
                      Follow
                    </button>
                  )}
                </div>
              )}
              {/* Custom columns */}
              {enabledCustom.map((col) => (
                <div key={col.id} onClick={(e) => e.stopPropagation()}>
                  <CustomFieldCell
                    fieldId={col.id}
                    goalId={goal.id}
                    type={col.fieldType ?? "Text"}
                    options={col.options}
                    multi={col.multi}
                    value={goal.fieldValues[col.id]}
                    onSave={(fieldId, value) =>
                      handleSaveFieldValue(goal.id, fieldId, value)
                    }
                  />
                </div>
              ))}
              {/* Row more menu */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover/row:opacity-100"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        title="More actions"
                        className="rounded-md border bg-background p-1 text-muted-foreground transition-colors hover:bg-accent"
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => router.push(`/goals/${goal.id}`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        showToast(`Archived ${goal.name}`)
                      }}
                    >
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        showToast(`Deleted ${goal.name}`)
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-lg border p-8">
            <svg className="mx-auto size-28" viewBox="0 0 150 150" fill="none">
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="currentColor"
                className="text-muted-foreground/20"
                strokeWidth="3"
                strokeDasharray="8 6"
                fill="none"
              />
              <circle
                cx="70"
                cy="70"
                r="25"
                stroke="currentColor"
                className="text-muted-foreground/15"
                strokeWidth="2"
                fill="none"
              />
              <line
                x1="57"
                y1="57"
                x2="83"
                y2="83"
                stroke="currentColor"
                className="text-muted-foreground/25"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1="83"
                y1="57"
                x2="57"
                y2="83"
                stroke="currentColor"
                className="text-muted-foreground/25"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              We couldn&apos;t find any goals matching your search.
            </p>
            <p className="text-sm text-muted-foreground">
              Try changing your search criteria or{" "}
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-blue-600 hover:underline"
              >
                clear all filters
              </button>
              .
            </p>
          </div>
        </div>
      )}

      {/* Rename field modal */}
      {renameOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            setRenameOpen(false)
            setRenameError(null)
          }}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-[360px] rounded-lg border bg-popover shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-[15px] font-semibold text-[#172b4d] dark:text-foreground">
                Rename field
              </h3>
              <button
                onClick={() => {
                  setRenameOpen(false)
                  setRenameError(null)
                }}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <svg
                  className="size-4"
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
            <div className="px-5 pb-2">
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value)
                  setRenameError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameField()
                  if (e.key === "Escape") {
                    setRenameOpen(false)
                    setRenameError(null)
                  }
                }}
                className={`w-full rounded-[3px] border bg-background px-3 py-2 text-[13px] outline-none ${renameError ? "border-red-400" : "border-[#dfe1e6] focus:border-[#0052cc]"} focus:ring-1`}
              />
              {renameError && (
                <p className="mt-1 text-[11px] text-red-500">{renameError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <button
                onClick={() => {
                  setRenameOpen(false)
                  setRenameError(null)
                }}
                className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameField}
                disabled={!renameValue.trim()}
                className="rounded-[3px] bg-[#0052cc] px-4 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-[360px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-[15px] font-semibold text-[#172b4d] dark:text-foreground">
              Delete field
            </h3>
            <p className="mb-4 text-[13px] text-[#626f86]">
              Are you sure you want to delete{" "}
              <strong className="text-[#172b4d] dark:text-foreground">
                {deleteConfirmLabel}
              </strong>
              ? All stored values for this field will be removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteField(deleteConfirmId)}
                className="rounded-[3px] bg-red-500 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create view dialog */}
      <Dialog
        open={showCreateView}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateView(false)
            setViewName("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create view</DialogTitle>
            <DialogDescription>
              A view saves your search, filter, sort, and display options so you
              can quickly return to it later
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
            <svg
              className="mt-0.5 size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Everyone at abhisheksharma67185 can see this view</span>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateView(false)
                setViewName("")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!viewName.trim()}
              onClick={() => {
                const name = viewName.trim()
                setCustomViews((prev) => [...prev, { name, starred: false }])
                setActiveTab(name)
                setShowCreateView(false)
                setViewName("")
              }}
            >
              Create view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
