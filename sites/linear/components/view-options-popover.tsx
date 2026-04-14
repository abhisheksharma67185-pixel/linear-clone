"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, Menu01Icon, Grid02Icon } from "@hugeicons/core-free-icons"

const DISPLAY_PROPERTIES = [
  "ID",
  "Status",
  "Assignee",
  "Priority",
  "Project",
  "Due date",
  "Milestone",
  "Cycle",
  "Estimate",
  "Labels",
  "Links",
  "Time in status",
  "Created",
  "Updated",
  "Pull requests and commits",
  "Sentry issues",
] as const

const DEFAULT_ACTIVE = new Set<string>([
  "ID",
  "Status",
  "Assignee",
  "Priority",
  "Project",
  "Due date",
  "Cycle",
  "Labels",
  "Links",
  "Created",
])

export function ViewOptionsPopover() {
  const [layout, setLayout] = useState<"list" | "board">("list")
  const [grouping, setGrouping] = useState("focus")
  const [subGrouping, setSubGrouping] = useState("none")
  const [ordering] = useState("importance")
  const [orderByRecency, setOrderByRecency] = useState(false)
  const [completedIssues, setCompletedIssues] = useState("past_day")
  const [showSubIssues, setShowSubIssues] = useState(true)
  const [nestedSubIssues, setNestedSubIssues] = useState(false)
  const [activeProps, setActiveProps] = useState<Set<string>>(DEFAULT_ACTIVE)

  const toggleProp = (prop: string) => {
    setActiveProps((prev) => {
      const next = new Set(prev)
      if (next.has(prop)) next.delete(prop)
      else next.add(prop)
      return next
    })
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" />
        }
      >
        <HugeiconsIcon icon={Settings02Icon} className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-md border p-1">
          <button
            type="button"
            onClick={() => setLayout("list")}
            className={`flex items-center justify-center gap-1.5 rounded py-1 text-xs font-medium transition-colors ${
              layout === "list" ? "bg-muted" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-3.5" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setLayout("board")}
            className={`flex items-center justify-center gap-1.5 rounded py-1 text-xs font-medium transition-colors ${
              layout === "board" ? "bg-muted" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <HugeiconsIcon icon={Grid02Icon} className="size-3.5" />
            <span>Board</span>
          </button>
        </div>

        <Row label="Grouping">
          <MiniSelect
            value={grouping}
            onValueChange={setGrouping}
            options={[
              { value: "focus", label: "Focus" },
              { value: "status", label: "Status" },
              { value: "assignee", label: "Assignee" },
              { value: "priority", label: "Priority" },
              { value: "project", label: "Project" },
            ]}
          />
        </Row>
        <Row label="Sub-grouping">
          <MiniSelect
            value={subGrouping}
            onValueChange={setSubGrouping}
            options={[
              { value: "none", label: "No grouping" },
              { value: "status", label: "Status" },
              { value: "assignee", label: "Assignee" },
            ]}
          />
        </Row>
        <Row label="Ordering">
          <span className="text-xs text-muted-foreground">
            {ordering === "importance" ? "Importance" : ordering}
          </span>
        </Row>
        <Row label="Order completed by recency">
          <Switch
            checked={orderByRecency}
            onCheckedChange={setOrderByRecency}
            className="scale-75"
          />
        </Row>

        <div className="my-3 border-t" />

        <Row label="Completed issues">
          <MiniSelect
            value={completedIssues}
            onValueChange={setCompletedIssues}
            options={[
              { value: "none", label: "None" },
              { value: "past_day", label: "Past day" },
              { value: "past_week", label: "Past week" },
              { value: "past_month", label: "Past month" },
              { value: "all", label: "All" },
            ]}
          />
        </Row>
        <Row label="Show sub-issues">
          <Switch
            checked={showSubIssues}
            onCheckedChange={setShowSubIssues}
            className="scale-75"
          />
        </Row>

        <div className="my-3 border-t" />

        <div className="mb-2 text-xs font-medium">List options</div>
        <Row label="Nested sub-issues">
          <Switch
            checked={nestedSubIssues}
            onCheckedChange={setNestedSubIssues}
            className="scale-75"
          />
        </Row>

        <div className="mt-3">
          <div className="mb-2 text-xs text-muted-foreground">Display properties</div>
          <div className="flex flex-wrap gap-1.5">
            {DISPLAY_PROPERTIES.map((p) => {
              const active = activeProps.has(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleProp(p)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                    active
                      ? "border-foreground/20 bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span>{label}</span>
      {children}
    </div>
  )
}

function MiniSelect({
  value,
  onValueChange,
  options,
}: {
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger className="h-6 w-auto min-w-24 gap-1 px-2 py-0 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
