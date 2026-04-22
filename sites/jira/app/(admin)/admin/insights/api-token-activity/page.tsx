"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type DateFilterMode = "between" | "within" | "more" | "range"

function TokenTypeDropdown({
  isOpen,
  onOpenChange,
  selected,
  onToggle,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selected: Set<string>
  onToggle: (value: string) => void
}) {
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const options = ["With scopes", "Without scopes"]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onOpenChange])

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          onOpenChange(!isOpen)
          setSearch("")
        }}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          isOpen
            ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
            : selected.size > 0
              ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
              : "border-input text-foreground hover:bg-accent"
        }`}
      >
        Token type
        {selected.size > 0 && (
          <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
            {selected.size}
          </span>
        )}
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-2 py-1.5">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-2 text-center text-sm text-muted-foreground">
                No matches found
              </p>
            ) : (
              filtered.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(option)}
                    onChange={() => onToggle(option)}
                    className="size-3.5 rounded border-input accent-blue-600"
                  />
                  {option}
                </label>
              ))
            )}
          </div>
          <div className="border-t px-2 py-1.5 text-right text-xs text-muted-foreground">
            {filtered.length} of {options.length}
          </div>
        </div>
      )}
    </div>
  )
}

function LastUsedDropdown({
  isOpen,
  onOpenChange,
  mode,
  onModeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  withinValue,
  onWithinValueChange,
  withinUnit,
  onWithinUnitChange,
  moreThanValue,
  onMoreThanValueChange,
  moreThanUnit,
  onMoreThanUnitChange,
  rangeFrom,
  rangeTo,
  onRangeFromChange,
  onRangeToChange,
  onUpdate,
  hasFilter,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DateFilterMode
  onModeChange: (mode: DateFilterMode) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  withinValue: string
  onWithinValueChange: (v: string) => void
  withinUnit: string
  onWithinUnitChange: (v: string) => void
  moreThanValue: string
  onMoreThanValueChange: (v: string) => void
  moreThanUnit: string
  onMoreThanUnitChange: (v: string) => void
  rangeFrom: string
  rangeTo: string
  onRangeFromChange: (v: string) => void
  onRangeToChange: (v: string) => void
  onUpdate: () => void
  hasFilter: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onOpenChange])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onOpenChange(!isOpen)}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          isOpen
            ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
            : hasFilter
              ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
              : "border-input text-foreground hover:bg-accent"
        }`}
      >
        Last used
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-md border bg-popover p-4 shadow-md">
          {/* Between */}
          <label className="mb-3 flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="date-mode"
              checked={mode === "between"}
              onChange={() => onModeChange("between")}
              className="size-3.5 accent-blue-600"
            />
            <span className="text-sm font-medium">Between</span>
          </label>
          {mode === "between" && (
            <div className="mb-4 ml-6 flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="w-28 rounded-md border bg-transparent px-2 py-1 pr-7 text-sm"
                />
                <svg
                  className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">and</span>
              <div className="relative">
                <input
                  type="text"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="w-28 rounded-md border bg-transparent px-2 py-1 pr-7 text-sm"
                />
                <svg
                  className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
          )}

          {/* Within the last */}
          <label className="mb-3 flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="date-mode"
              checked={mode === "within"}
              onChange={() => onModeChange("within")}
              className="size-3.5 accent-blue-600"
            />
            <span className="text-sm">Within the last</span>
          </label>
          {mode === "within" && (
            <div className="mb-4 ml-6 flex items-center gap-2">
              <input
                type="number"
                value={withinValue}
                onChange={(e) => onWithinValueChange(e.target.value)}
                className="w-16 rounded-md border bg-transparent px-2 py-1 text-sm"
                min="1"
              />
              <select
                value={withinUnit}
                onChange={(e) => onWithinUnitChange(e.target.value)}
                className="rounded-md border bg-transparent px-2 py-1 text-sm"
              >
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
              </select>
            </div>
          )}

          {/* More than */}
          <label className="mb-3 flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="date-mode"
              checked={mode === "more"}
              onChange={() => onModeChange("more")}
              className="size-3.5 accent-blue-600"
            />
            <span className="text-sm">More than</span>
          </label>
          {mode === "more" && (
            <div className="mb-4 ml-6 flex items-center gap-2">
              <input
                type="number"
                value={moreThanValue}
                onChange={(e) => onMoreThanValueChange(e.target.value)}
                className="w-16 rounded-md border bg-transparent px-2 py-1 text-sm"
                min="1"
              />
              <select
                value={moreThanUnit}
                onChange={(e) => onMoreThanUnitChange(e.target.value)}
                className="rounded-md border bg-transparent px-2 py-1 text-sm"
              >
                <option value="days">days ago</option>
                <option value="weeks">weeks ago</option>
                <option value="months">months ago</option>
              </select>
            </div>
          )}

          {/* In the range */}
          <label className="mb-4 flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="date-mode"
              checked={mode === "range"}
              onChange={() => onModeChange("range")}
              className="size-3.5 accent-blue-600"
            />
            <span className="text-sm">In the range</span>
          </label>
          {mode === "range" && (
            <div className="mb-4 ml-6 flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={rangeFrom}
                  onChange={(e) => onRangeFromChange(e.target.value)}
                  className="w-28 rounded-md border bg-transparent px-2 py-1 pr-7 text-sm"
                />
                <svg
                  className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">to</span>
              <div className="relative">
                <input
                  type="text"
                  value={rangeTo}
                  onChange={(e) => onRangeToChange(e.target.value)}
                  className="w-28 rounded-md border bg-transparent px-2 py-1 pr-7 text-sm"
                />
                <svg
                  className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
          )}

          {/* Update button */}
          <div className="border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onUpdate()
                onOpenChange(false)
              }}
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ApiTokenActivityPage() {
  const [search, setSearch] = useState("")
  const [openFilter, setOpenFilter] = useState<"tokenType" | "lastUsed" | null>(
    null
  )

  // Token type filter
  const [selectedTokenTypes, setSelectedTokenTypes] = useState<Set<string>>(
    new Set()
  )
  const toggleTokenType = (value: string) => {
    const next = new Set(selectedTokenTypes)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setSelectedTokenTypes(next)
  }

  // Last used filter
  const [dateFilterMode, setDateFilterMode] =
    useState<DateFilterMode>("between")
  const [dateFrom, setDateFrom] = useState("2/18/1993")
  const [dateTo, setDateTo] = useState("2/18/1993")
  const [withinValue, setWithinValue] = useState("30")
  const [withinUnit, setWithinUnit] = useState("days")
  const [moreThanValue, setMoreThanValue] = useState("30")
  const [moreThanUnit, setMoreThanUnit] = useState("days")
  const [rangeFrom, setRangeFrom] = useState("")
  const [rangeTo, setRangeTo] = useState("")
  const [lastUsedApplied, setLastUsedApplied] = useState(false)

  // Sort
  const [sortAsc, setSortAsc] = useState(false)

  // Export dialog
  const [exportOpen, setExportOpen] = useState(false)
  const [exportStarted, setExportStarted] = useState(false)

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">API token activity</h1>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          Export token list
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export token list</DialogTitle>
            <DialogDescription>
              Export your API token activity data as a CSV file. The export will
              include all tokens matching your current filters.
            </DialogDescription>
          </DialogHeader>
          {exportStarted ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <svg
                className="size-10 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium">Export started!</p>
              <p className="text-xs text-muted-foreground">
                Your CSV file will be downloaded shortly. If you have a large
                number of tokens, this may take a moment.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span className="text-muted-foreground">
                    0 tokens will be exported based on current filters.
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    setExportStarted(true)
                    setTimeout(() => {
                      setExportOpen(false)
                      setExportStarted(false)
                    }, 2000)
                  }}
                >
                  Export CSV
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="mb-1 text-sm text-muted-foreground">
        Track user API token activity in your organization.
      </p>
      <a
        href="https://support.atlassian.com/organization-administration/docs/track-user-api-token-activity/"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        How to track user API tokens
      </a>

      {/* Filters */}
      <div className="mt-4 mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
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
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <TokenTypeDropdown
          isOpen={openFilter === "tokenType"}
          onOpenChange={(o) => setOpenFilter(o ? "tokenType" : null)}
          selected={selectedTokenTypes}
          onToggle={toggleTokenType}
        />
        <LastUsedDropdown
          isOpen={openFilter === "lastUsed"}
          onOpenChange={(o) => setOpenFilter(o ? "lastUsed" : null)}
          mode={dateFilterMode}
          onModeChange={setDateFilterMode}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          withinValue={withinValue}
          onWithinValueChange={setWithinValue}
          withinUnit={withinUnit}
          onWithinUnitChange={setWithinUnit}
          moreThanValue={moreThanValue}
          onMoreThanValueChange={setMoreThanValue}
          moreThanUnit={moreThanUnit}
          onMoreThanUnitChange={setMoreThanUnit}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          onRangeFromChange={setRangeFrom}
          onRangeToChange={setRangeTo}
          onUpdate={() => setLastUsedApplied(true)}
          hasFilter={lastUsedApplied}
        />
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing 0 results out of 0 items</span>
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Token name</th>
              <th className="px-4 py-2.5 text-left font-medium">Token type</th>
              <th className="px-4 py-2.5 text-left font-medium">Created by</th>
              <th className="px-4 py-2.5 text-left font-medium">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  Last used
                  <svg
                    className={`size-3 transition-transform ${sortAsc ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                  </svg>
                </button>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Expires</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground italic"
              >
                Users have no user API tokens
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
