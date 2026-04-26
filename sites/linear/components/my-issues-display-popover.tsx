"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon, Grid02Icon } from "@hugeicons/core-free-icons"
import {
  DISPLAY_PROPERTIES,
  type DisplayProperty,
  type DisplayState,
  type GroupingKind,
  type Layout,
  type Ordering,
  type SubGroupingKind,
  type CompletedIssues,
} from "@/app/lib/my-issues-display-state"

interface Props {
  value: DisplayState
  onChange: (next: DisplayState) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: React.ReactElement
}

export function MyIssuesDisplayPopover({
  value,
  onChange,
  open,
  onOpenChange,
  trigger,
}: Props) {
  const set = <K extends keyof DisplayState>(key: K, v: DisplayState[K]) =>
    onChange({ ...value, [key]: v })

  const toggleProp = (prop: DisplayProperty) => {
    const has = value.displayProperties.includes(prop)
    onChange({
      ...value,
      displayProperties: has
        ? value.displayProperties.filter((p) => p !== prop)
        : [...value.displayProperties, prop],
    })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="end" sideOffset={6} className="w-80 p-3">
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-md border p-1">
          <LayoutButton
            active={value.layout === "list"}
            onClick={() => set("layout", "list" as Layout)}
            label="List"
            icon={Menu01Icon}
          />
          <LayoutButton
            active={value.layout === "board"}
            onClick={() => set("layout", "board" as Layout)}
            label="Board"
            icon={Grid02Icon}
          />
        </div>

        <div className="border-border/50 mb-2 rounded-md border px-2.5 py-1">
          <Row label="Grouping">
            <MiniSelect<GroupingKind>
              value={value.grouping}
              onValueChange={(v) => set("grouping", v)}
              options={[
                { value: "none", label: "No grouping" },
                { value: "focus", label: "Focus" },
                { value: "status", label: "Status" },
                { value: "agent", label: "Agent" },
                { value: "project", label: "Project" },
                { value: "priority", label: "Priority" },
                { value: "cycle", label: "Cycle" },
                { value: "labels", label: "Label" },
                { value: "team", label: "Team" },
              ]}
            />
          </Row>
          <Row label="Sub-grouping">
            <MiniSelect<SubGroupingKind>
              value={value.subGrouping}
              onValueChange={(v) => set("subGrouping", v)}
              options={[
                { value: "none", label: "No grouping" },
                { value: "status", label: "Status" },
                { value: "agent", label: "Agent" },
                { value: "project", label: "Project" },
                { value: "priority", label: "Priority" },
                { value: "cycle", label: "Cycle" },
                { value: "labels", label: "Label" },
                { value: "team", label: "Team" },
              ]}
            />
          </Row>
          <Row label="Ordering">
            <MiniSelect<Ordering>
              value={value.ordering}
              onValueChange={(v) => set("ordering", v)}
              options={[
                { value: "priority", label: "Priority" },
                { value: "lastUpdated", label: "Last updated" },
                { value: "lastCreated", label: "Last created" },
                { value: "manual", label: "Manual" },
                { value: "importance", label: "Importance" },
              ]}
            />
          </Row>
          <Row label="Order completed by recency">
            <Switch
              checked={value.orderCompletedByRecency}
              onCheckedChange={(v) => set("orderCompletedByRecency", v)}
              className="scale-75"
            />
          </Row>
        </div>

        <div className="border-border/50 mb-3 rounded-md border px-2.5 py-1">
          <Row label="Completed issues">
            <MiniSelect<CompletedIssues>
              value={value.completedIssues}
              onValueChange={(v) => set("completedIssues", v)}
              options={[
                { value: "all", label: "All" },
                { value: "pastDay", label: "Past day" },
                { value: "pastWeek", label: "Past week" },
                { value: "pastMonth", label: "Past month" },
                { value: "none", label: "None" },
              ]}
            />
          </Row>
          <Row label="Show sub-issues">
            <Switch
              checked={value.showSubIssues}
              onCheckedChange={(v) => set("showSubIssues", v)}
              className="scale-75"
            />
          </Row>
        </div>

        <div className="text-muted-foreground mt-1 mb-2 text-[11px] font-medium tracking-wide uppercase">
          List options
        </div>
        <div className="border-border/50 mb-3 rounded-md border px-2.5 py-1">
          <Row label="Nested sub-issues">
            <Switch
              checked={value.nestedSubIssues}
              onCheckedChange={(v) => set("nestedSubIssues", v)}
              className="scale-75"
            />
          </Row>
        </div>

        <div className="text-muted-foreground mb-2 text-[11px] font-medium tracking-wide uppercase">
          Display properties
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DISPLAY_PROPERTIES.map((p) => {
            const active = value.displayProperties.includes(p)
            return (
              <button
                key={p}
                type="button"
                onClick={() => toggleProp(p)}
                aria-pressed={active}
                className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                  active
                    ? "border-foreground/20 bg-muted text-foreground"
                    : "border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function LayoutButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: unknown
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-1.5 rounded py-1 text-xs font-medium transition-colors ${
        active ? "bg-muted" : "text-muted-foreground hover:bg-muted/50"
      }`}
    >
      <HugeiconsIcon
        icon={icon as Parameters<typeof HugeiconsIcon>[0]["icon"]}
        className="size-3.5"
      />
      <span>{label}</span>
    </button>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span>{label}</span>
      {children}
    </div>
  )
}

function MiniSelect<T extends string>({
  value,
  onValueChange,
  options,
}: {
  value: T
  onValueChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
    >
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
