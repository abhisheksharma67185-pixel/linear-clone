"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
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
import { useCustomFields } from "@/hooks/use-custom-fields"
import { CustomFieldCell } from "@/components/custom-field-cell"
import {
  BASE_COLUMNS_DEF,
  COL_WIDTHS,
  RESERVED_LABELS,
  customColWidth,
  type ColumnDef,
} from "@/lib/columns-def"

// ─── Types ───────────────────────────────────────────────────────────────────

interface GoalRow {
  id: string
  name: string
  status: string
  progress: number
  targetDate: string
  owner: { name: string; initials: string }
  following: boolean
  fieldValues: Record<string, unknown>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const addFilterOptions = [
  {
    id: "tag",
    label: "Tag",
    icon: (
      <svg
        className="size-4"
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
    icon: (
      <svg
        className="size-4"
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
    icon: (
      <svg
        className="size-4"
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
    icon: (
      <svg
        className="size-4"
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
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "starred",
    label: "Starred",
    icon: (
      <svg
        className="size-4"
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
    icon: (
      <svg
        className="size-4"
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
    icon: (
      <svg
        className="size-4"
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

// ─── Timeline helpers ─────────────────────────────────────────────────────────

const VIEW_BY_OPTIONS = ["Days", "Weeks", "Months", "Quarters"] as const
type ViewBy = (typeof VIEW_BY_OPTIONS)[number]

function getTimelineRange(viewBy: ViewBy) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  let end: Date
  if (viewBy === "Days")
    end = new Date(start.getFullYear(), start.getMonth() + 3, 0)
  else if (viewBy === "Weeks")
    end = new Date(start.getFullYear(), start.getMonth() + 6, 0)
  else if (viewBy === "Quarters")
    end = new Date(start.getFullYear() + 2, start.getMonth(), 0)
  else end = new Date(start.getFullYear() + 1, start.getMonth() + 4, 0)
  return { start, end }
}

function getMonthColumns(start: Date, end: Date) {
  const cols: { year: number; month: number; label: string }[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    cols.push({
      year: cur.getFullYear(),
      month: cur.getMonth(),
      label: cur.toLocaleString("default", { month: "short" }),
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return cols
}

function parseTargetDate(td: string): Date | null {
  if (!td || td === "No date") return null
  const parsed = new Date(td)
  if (!isNaN(parsed.getTime())) return parsed
  const monthOnly = new Date(`${td} ${new Date().getFullYear()}`)
  if (!isNaN(monthOnly.getTime())) return monthOnly
  return null
}

const STATUS_BAR_COLOR: Record<string, string> = {
  "ON TRACK": "#36b37e",
  "AT RISK": "#ffab00",
  "OFF TRACK": "#ff5630",
  DONE: "#0052cc",
  PENDING: "#8993a4",
}

function formatRangeLabel(start: Date, end: Date) {
  const fmt = (d: Date) =>
    d.toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  return `${fmt(start)} – ${fmt(end)}`
}

function TimelineView({ goals, viewBy }: { goals: GoalRow[]; viewBy: ViewBy }) {
  const { start, end } = getTimelineRange(viewBy)
  const today = new Date()
  const goalsWithDates = goals.filter(
    (g) => parseTargetDate(g.targetDate) !== null
  )
  if (goalsWithDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg
          className="mb-4 size-20 text-muted-foreground/30"
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="36"
            cy="36"
            r="26"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="4 3"
          />
          <circle
            cx="36"
            cy="36"
            r="14"
            stroke="currentColor"
            strokeWidth="3"
          />
          <line
            x1="56"
            y1="56"
            x2="72"
            y2="72"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="28"
            y1="36"
            x2="44"
            y2="36"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="36"
            y1="28"
            x2="36"
            y2="44"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm text-muted-foreground">
          No goals with target dates found.
        </p>
      </div>
    )
  }
  if (viewBy === "Months") {
    const cols = getMonthColumns(start, end)
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const colWidth = 80
    const getBarStyle = (goal: GoalRow) => {
      const td = parseTargetDate(goal.targetDate)
      if (!td) return null
      const barStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const barEnd = new Date(td.getFullYear(), td.getMonth() + 1, 0)
      const startOffset = Math.max(
        0,
        (barStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
      const endOffset = Math.min(
        totalDays,
        (barEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
      const leftPct = (startOffset / totalDays) * 100
      const widthPct = Math.max(
        1,
        ((endOffset - startOffset) / totalDays) * 100
      )
      return { left: `${leftPct}%`, width: `${widthPct}%` }
    }
    const todayOffset =
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const todayPct = Math.min(100, Math.max(0, (todayOffset / totalDays) * 100))
    return (
      <div className="overflow-hidden rounded-lg border">
        <div className="flex">
          <div className="w-52 shrink-0 border-r">
            <div className="flex h-10 items-center border-b bg-muted/30 px-4 text-xs font-medium text-muted-foreground">
              Name
            </div>
            {goalsWithDates.map((goal) => (
              <div
                key={goal.id}
                className="flex h-12 cursor-pointer items-center gap-2 border-b px-4 last:border-b-0 hover:bg-accent/40"
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
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto">
            <div
              className="relative flex border-b bg-muted/30"
              style={{ minWidth: cols.length * colWidth }}
            >
              {cols.map((col) => (
                <div
                  key={`${col.year}-${col.month}`}
                  className="flex h-10 shrink-0 items-center justify-center border-r text-xs font-medium text-muted-foreground last:border-r-0"
                  style={{ width: colWidth }}
                >
                  {col.label}
                </div>
              ))}
            </div>
            <div
              className="relative"
              style={{ minWidth: cols.length * colWidth }}
            >
              <div
                className="absolute top-0 bottom-0 z-10 w-px bg-blue-500 opacity-70"
                style={{ left: `${todayPct}%` }}
              />
              {goalsWithDates.map((goal) => {
                const barStyle = getBarStyle(goal)
                return (
                  <div
                    key={goal.id}
                    className="relative flex h-12 items-center border-b last:border-b-0"
                  >
                    {cols.map((col, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-[#f4f5f7] dark:border-border"
                        style={{ left: `${((i + 1) / cols.length) * 100}%` }}
                      />
                    ))}
                    {barStyle && (
                      <div
                        className="absolute flex h-6 items-center rounded-full px-3"
                        style={{
                          left: barStyle.left,
                          width: barStyle.width,
                          backgroundColor:
                            STATUS_BAR_COLOR[goal.status] ?? "#8993a4",
                        }}
                      >
                        <span className="truncate text-[11px] font-medium text-white">
                          {goal.name}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm text-muted-foreground">
        Switch to Months view for timeline rendering.
      </p>
    </div>
  )
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

function DateRangePicker({
  startDate,
  endDate,
  onConfirm,
  onClose,
}: {
  startDate: Date
  endDate: Date
  onConfirm: (s: Date, e: Date) => void
  onClose: () => void
}) {
  const [selStart, setSelStart] = useState(new Date(startDate))
  const [selEnd, setSelEnd] = useState(new Date(endDate))
  const [startMonth, setStartMonth] = useState(
    new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  )
  const [endMonth, setEndMonth] = useState(
    new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  )
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  function getDaysInMonth(year: number, month: number) {
    const first = new Date(year, month, 1)
    const rows: (number | null)[] = Array(first.getDay()).fill(null)
    for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++)
      rows.push(d)
    return rows
  }
  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }
  function inRange(d: Date) {
    return d > selStart && d < selEnd
  }
  function navigate(which: "start" | "end", delta: number, years = false) {
    const setter = which === "start" ? setStartMonth : setEndMonth
    setter((m) => {
      const n = new Date(m)
      if (years) n.setFullYear(n.getFullYear() + delta)
      else n.setMonth(n.getMonth() + delta)
      return n
    })
  }
  function handleDayClick(year: number, month: number, day: number) {
    const clicked = new Date(year, month, day)
    if (clicked <= selStart || (clicked < selEnd && clicked > selStart))
      setSelStart(clicked)
    else setSelEnd(clicked)
  }
  function renderCalendar(month: Date, which: "start" | "end") {
    const days = getDaysInMonth(month.getFullYear(), month.getMonth())
    const label = month.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })
    return (
      <div className="w-[280px]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-0.5">
            <button
              onClick={() => navigate(which, -1, true)}
              className="rounded p-1 text-[#626f86] hover:bg-[#f4f5f7]"
            >
              <svg
                className="size-3.5"
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
              onClick={() => navigate(which, -1)}
              className="rounded p-1 text-[#626f86] hover:bg-[#f4f5f7]"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
          <span className="text-[14px] font-semibold text-[#172b4d]">
            {label}
          </span>
          <div className="flex gap-0.5">
            <button
              onClick={() => navigate(which, 1)}
              className="rounded p-1 text-[#626f86] hover:bg-[#f4f5f7]"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              onClick={() => navigate(which, 1, true)}
              className="rounded p-1 text-[#626f86] hover:bg-[#f4f5f7]"
            >
              <svg
                className="size-3.5"
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
        <div className="mb-1 grid grid-cols-7">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[11px] font-medium text-[#626f86]"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day, i) => {
            if (!day) return <div key={i} />
            const d = new Date(month.getFullYear(), month.getMonth(), day)
            const isStart = isSameDay(d, selStart)
            const isEnd = isSameDay(d, selEnd)
            const between = inRange(d)
            return (
              <button
                key={i}
                onClick={() =>
                  handleDayClick(month.getFullYear(), month.getMonth(), day)
                }
                className={`relative h-8 w-full rounded-full text-[13px] transition-colors ${isStart || isEnd ? "bg-[#0052cc] font-semibold text-white" : ""} ${between ? "rounded-none bg-[#e9f2ff] text-[#172b4d]" : ""} ${!isStart && !isEnd && !between ? "text-[#172b4d] hover:bg-[#f4f5f7]" : ""}`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  const fmt = (d: Date) =>
    d.toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full left-0 z-50 mt-2 rounded-lg border border-[#dfe1e6] bg-white p-5 shadow-[0_8px_24px_rgba(9,30,66,0.15)]">
        <div className="mb-3 flex gap-8">
          <p className="w-[280px] text-center text-[15px] font-bold text-[#172b4d]">
            Start
          </p>
          <p className="w-[280px] text-center text-[15px] font-bold text-[#172b4d]">
            End
          </p>
        </div>
        <div className="flex gap-8">
          {renderCalendar(startMonth, "start")}
          {renderCalendar(endMonth, "end")}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onConfirm(selStart, selEnd)}
            className="rounded-md bg-[#0052cc] px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0747a6]"
          >
            {fmt(selStart)} - {fmt(selEnd)}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Validate new field name ──────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FollowingPage() {
  const router = useRouter()
  const { fields: customFields, renameField, deleteField } = useCustomFields()

  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [followingFilter, setFollowingFilter] = useState("Following")
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [addFilterSearch, setAddFilterSearch] = useState("")
  const [showColumns, setShowColumns] = useState(false)
  const [colSearch, setColSearch] = useState("")

  // Base column toggles (enabled/disabled per session)
  const [baseColState, setBaseColState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(BASE_COLUMNS_DEF.map((c) => [c.id, c.enabled]))
  )
  // Custom column enablement
  const [customColEnabled, setCustomColEnabled] = useState<
    Record<string, boolean>
  >({})

  const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
  const [viewBy, setViewBy] = useState<ViewBy>("Months")
  const [showViewBy, setShowViewBy] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customStart, setCustomStart] = useState<Date | null>(null)
  const [customEnd, setCustomEnd] = useState<Date | null>(null)
  const [timelineSortBy, setTimelineSortBy] = useState("Name")
  const [timelineSortAsc, setTimelineSortAsc] = useState(true)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [sortSearch, setSortSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [wrapText, setWrapText] = useState(false)

  // Rename field modal
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameFieldId, setRenameFieldId] = useState("")
  const [renameValue, setRenameValue] = useState("")
  const [renameError, setRenameError] = useState<string | null>(null)

  // Delete field confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteConfirmLabel, setDeleteConfirmLabel] = useState("")

  // Create goal modal
  const [createOpen, setCreateOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [goalTeam, setGoalTeam] = useState("Engineering")
  const [goalOwner, setGoalOwner] = useState("Abhishek Sharma")
  const goalNameRef = useRef<HTMLInputElement>(null)

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
              },
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
      // Optimistic update
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
    if (goalNameRef.current) goalNameRef.current.value = ""
    fetchGoals()
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const existingNames = customFields.map((f) => f.name)

  const handleRenameField = async () => {
    if (!renameFieldId) return
    const err = validateFieldName(
      renameValue,
      existingNames.filter((_, i) => customFields[i]?.id !== renameFieldId)
    )
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

  const filteredGoals = goals.filter((g) => {
    if (followingFilter === "Following" && !g.following) return false
    if (followingFilter === "Not following" && g.following) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()))
      return false
    return true
  })

  const defaultRange = getTimelineRange(viewBy)
  const tlStart = customStart ?? defaultRange.start
  const tlEnd = customEnd ?? defaultRange.end

  const SORT_OPTIONS = [
    "Name",
    "Status",
    "Target date",
    "Following",
    "Last updated",
    "Follower count",
  ]

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    let cmp = 0
    if (timelineSortBy === "Name") cmp = a.name.localeCompare(b.name)
    else if (timelineSortBy === "Status") cmp = a.status.localeCompare(b.status)
    else if (timelineSortBy === "Target date")
      cmp = a.targetDate.localeCompare(b.targetDate)
    else if (timelineSortBy === "Following")
      cmp = Number(b.following) - Number(a.following)
    else cmp = a.name.localeCompare(b.name)
    return timelineSortAsc ? cmp : -cmp
  })

  // Build combined columns list
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
      custom: true,
      fieldType: cf.type,
      options: cf.options,
      multi: cf.multi,
    })),
  ]

  const enabledCols = allColumns.filter((c) => c.enabled)
  const gridTemplate = enabledCols
    .map((c) =>
      c.custom ? customColWidth(c.fieldType) : (COL_WIDTHS[c.id] ?? "100px")
    )
    .join(" ")

  const filteredDisplayCols = allColumns.filter(
    (c) => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase())
  )

  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )

  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => showToast("Link copied to clipboard"))
  }
  const exportCSV = () => {
    const headers = [
      "Name",
      "Status",
      "Progress",
      "Target Date",
      "Owner",
      "Following",
    ]
    const rows = sortedGoals.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      g.status,
      `${g.progress}%`,
      g.targetDate,
      `"${g.owner.name.replace(/"/g, '""')}"`,
      g.following ? "Following" : "Not following",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "following-goals.csv"
    a.click()
    URL.revokeObjectURL(url)
    showToast("CSV exported")
  }

  return (
    <div className="p-6">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Following</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Create goal
        </button>
      </div>

      {/* Create goal modal */}
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
                  Owner
                </label>
                <select
                  value={goalOwner}
                  onChange={(e) => setGoalOwner(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option>Abhishek Sharma</option>
                  <option>Sam Williams</option>
                  <option>Jordan Lee</option>
                  <option>Taylor Brown</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Team</label>
                <select
                  value={goalTeam}
                  onChange={(e) => setGoalTeam(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                >
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Marketing</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t px-6 py-5">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
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
        <Input
          placeholder="Search goals"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm">
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-1 text-sm">
                  {followingFilter}
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
                onClick={() => setFollowingFilter("Following")}
                className={
                  followingFilter === "Following"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                    : ""
                }
              >
                Following
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFollowingFilter("Not following")}
                className={
                  followingFilter === "Not following"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                    : ""
                }
              >
                Not following
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground">
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
        <div className="relative">
          <button
            onClick={() => setShowAddFilter(!showAddFilter)}
            className={`flex items-center gap-1 text-sm transition-colors ${showAddFilter ? "font-medium text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            Add filter{" "}
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
          {showAddFilter && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setShowAddFilter(false)
                  setAddFilterSearch("")
                }}
              />
              <div className="absolute top-full left-0 z-50 mt-2 w-56 rounded-lg border bg-popover shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <Input
                      placeholder="Select..."
                      value={addFilterSearch}
                      onChange={(e) => setAddFilterSearch(e.target.value)}
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
                <div className="max-h-64 overflow-y-auto px-1 pb-1">
                  {addFilterOptions
                    .filter(
                      (o) =>
                        !addFilterSearch ||
                        o.label
                          .toLowerCase()
                          .includes(addFilterSearch.toLowerCase())
                    )
                    .map((opt) => (
                      <button
                        key={opt.id}
                        disabled={opt.disabled}
                        onClick={() => {
                          setShowAddFilter(false)
                          setAddFilterSearch("")
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${opt.disabled ? "cursor-not-allowed text-muted-foreground/40" : "hover:bg-accent"}`}
                      >
                        <span
                          className={
                            opt.disabled
                              ? "text-muted-foreground/40"
                              : "text-muted-foreground"
                          }
                        >
                          {opt.icon}
                        </span>
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
        <p className="text-sm font-medium">
          {filteredGoals.length} goal{filteredGoals.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {viewMode === "timeline" && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm transition-colors ${showDatePicker ? "border-blue-500 text-blue-600" : "text-muted-foreground hover:bg-accent"}`}
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
                  {formatRangeLabel(tlStart, tlEnd)}
                </button>
                {showDatePicker && (
                  <DateRangePicker
                    startDate={tlStart}
                    endDate={tlEnd}
                    onConfirm={(s, e) => {
                      setCustomStart(s)
                      setCustomEnd(e)
                      setShowDatePicker(false)
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowViewBy((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
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
                {showViewBy && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowViewBy(false)}
                    />
                    <div className="absolute top-full right-0 z-50 mt-1 w-36 rounded-md border bg-popover py-1 shadow-md">
                      {VIEW_BY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setViewBy(opt)
                            setShowViewBy(false)
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent ${viewBy === opt ? "font-medium text-blue-600" : "text-foreground"}`}
                        >
                          {viewBy === opt && (
                            <svg
                              className="size-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {viewBy !== opt && <span className="size-3.5" />}
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* View toggle */}
          <div className="flex rounded-md border">
            <button
              title="Display as list"
              onClick={() => setViewMode("list")}
              className={`rounded-l-md border-r px-2 py-1 transition-colors ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
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
              title="Display as timeline"
              onClick={() => setViewMode("timeline")}
              className={`rounded-r-md px-2 py-1 transition-colors ${viewMode === "timeline" ? "bg-blue-50 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg
                className={`size-4 ${viewMode === "timeline" ? "text-blue-600" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="10" x2="16" y2="10" />
                <line x1="3" y1="14" x2="21" y2="14" />
                <line x1="3" y1="18" x2="13" y2="18" />
              </svg>
            </button>
          </div>

          {/* Sort */}
          {viewMode === "list" ? (
            <button className="flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent">
              Sort by following{" "}
              <svg
                className="ml-0.5 size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-0">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortMenu((v) => !v)
                    setSortSearch("")
                  }}
                  className={`flex items-center gap-1.5 rounded-l-md border border-r-0 px-3 py-1 text-sm transition-colors ${showSortMenu ? "border-blue-500 bg-blue-50 text-blue-600" : "text-muted-foreground hover:bg-accent"}`}
                >
                  Sort by {timelineSortBy}
                </button>
                {showSortMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <div className="absolute top-full right-0 z-50 mt-1 w-52 rounded-md border border-[#dfe1e6] bg-white shadow-[0_8px_24px_rgba(9,30,66,0.15)] dark:bg-popover">
                      <div className="relative border-b border-[#dfe1e6] px-3 py-2">
                        <input
                          autoFocus
                          value={sortSearch}
                          onChange={(e) => setSortSearch(e.target.value)}
                          placeholder="Select..."
                          className="w-full bg-transparent text-[13px] text-[#172b4d] outline-none placeholder:text-[#626f86]"
                        />
                        <svg
                          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#626f86]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <div className="px-3 py-1.5">
                        <p className="text-[11px] font-semibold tracking-wider text-[#626f86] uppercase">
                          Sort by
                        </p>
                      </div>
                      <div className="pb-1">
                        {SORT_OPTIONS.filter(
                          (o) =>
                            !sortSearch ||
                            o.toLowerCase().includes(sortSearch.toLowerCase())
                        ).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setTimelineSortBy(opt)
                              setShowSortMenu(false)
                            }}
                            className={`flex w-full items-center px-3 py-2 text-[13px] transition-colors hover:bg-[#f4f5f7] ${timelineSortBy === opt ? "bg-[#e9f2ff] font-medium text-[#0052cc]" : "text-[#172b4d]"}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setTimelineSortAsc((v) => !v)}
                title="Reverse sort order"
                className="group/rsort relative rounded-r-md border px-2 py-1 text-muted-foreground transition-colors hover:bg-accent"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {timelineSortAsc ? (
                    <polyline points="6 9 12 15 18 9" />
                  ) : (
                    <polyline points="18 15 12 9 6 15" />
                  )}
                </svg>
              </button>
            </div>
          )}

          {/* Columns (list only) */}
          {viewMode === "list" && (
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
                      className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50"
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
                        {col.custom && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
                                  <svg
                                    className="size-3.5"
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
                                  setRenameFieldId(col.id)
                                  setRenameValue(col.label)
                                  setRenameError(null)
                                  setRenameOpen(true)
                                  setShowColumns(false)
                                }}
                              >
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteConfirmId(col.id)
                                  setDeleteConfirmLabel(col.label ?? "")
                                  setShowColumns(false)
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                              if (col.custom) {
                                setCustomColEnabled((prev) => ({
                                  ...prev,
                                  [col.id]: !col.enabled,
                                }))
                              } else {
                                setBaseColState((prev) => ({
                                  ...prev,
                                  [col.id]: !col.enabled,
                                }))
                              }
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
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="rounded-md border px-1.5 py-1 text-muted-foreground hover:bg-accent">
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={copyLink}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportCSV}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  setWrapText((v) => !v)
                }}
                className="flex cursor-pointer items-center justify-between gap-2.5"
              >
                <span className="flex items-center gap-2.5">
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M3 6h18" />
                    <path d="M3 12h15a3 3 0 0 1 0 6h-4" />
                    <polyline points="14 15 11 18 14 21" />
                    <path d="M3 18h5" />
                  </svg>
                  Wrap text
                </span>
                <div
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${wrapText ? "bg-[#36b37e]" : "bg-[#97a0af]"}`}
                >
                  <span
                    className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${wrapText ? "translate-x-[18px]" : "translate-x-[3px]"}`}
                  />
                  {!wrapText && (
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
                  {wrapText && (
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
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="overflow-x-auto rounded-lg border">
          {/* Header */}
          <div
            className="grid min-w-0 gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {enabledCols.map((col) => (
              <span
                key={col.id}
                className={`truncate ${col.custom && col.fieldType === "Number" ? "text-right" : ""}`}
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
              className={`grid min-w-0 cursor-pointer gap-4 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/50 ${wrapText ? "items-start" : "items-center"}`}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {enabledCols.map((col) => {
                if (col.id === "name")
                  return (
                    <div
                      key="name"
                      className="flex min-w-0 items-start gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="mt-0.5 size-4 shrink-0 cursor-pointer text-muted-foreground/50"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        onClick={() => router.push(`/goals/${goal.id}`)}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span
                        className={`cursor-pointer text-sm hover:underline ${wrapText ? "break-words whitespace-normal" : "truncate"}`}
                        onClick={() => router.push(`/goals/${goal.id}`)}
                      >
                        {goal.name}
                      </span>
                    </div>
                  )
                if (col.id === "status")
                  return (
                    <div key="status" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          goal.status === "ON TRACK"
                            ? "bg-green-400 text-white"
                            : goal.status === "AT RISK"
                              ? "bg-yellow-300 text-yellow-900"
                              : goal.status === "OFF TRACK"
                                ? "bg-red-400 text-white"
                                : goal.status === "DONE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                  )
                if (col.id === "progress")
                  return (
                    <div
                      key="progress"
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
                  )
                if (col.id === "target_date")
                  return (
                    <div
                      key="target_date"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                  )
                if (col.id === "owner")
                  return (
                    <div key="owner" onClick={(e) => e.stopPropagation()}>
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">
                          {goal.owner.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )
                if (col.id === "following")
                  return (
                    <div key="following" onClick={(e) => e.stopPropagation()}>
                      {goal.following ? (
                        <span className="text-xs text-muted-foreground">
                          Following
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  )
                if (col.custom)
                  return (
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
                  )
                return (
                  <div
                    key={col.id}
                    className="text-xs text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    —
                  </div>
                )
              })}
            </div>
          ))}
          {filteredGoals.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No goals found.
            </div>
          )}
        </div>
      ) : (
        <TimelineView goals={sortedGoals} viewBy={viewBy} />
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
                className={`w-full rounded-[3px] border bg-background px-3 py-2 text-[13px] outline-none ${renameError ? "border-red-400 focus:ring-red-200" : "border-[#dfe1e6] focus:border-[#0052cc]"} focus:ring-1`}
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
                className="rounded-[3px] bg-[#0052cc] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0747a6] disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete field confirm */}
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-2 rounded-lg bg-[#172b4d] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg fade-in slide-in-from-bottom-2">
          <svg
            className="size-4 text-green-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  )
}
