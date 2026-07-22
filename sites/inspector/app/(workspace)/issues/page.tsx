"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Issue, Label, Member, Team } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  UserCircleIcon,
  SlidersHorizontalIcon,
  Layers01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"
import {
  filterIssuesByTab,
  type IssueStatus,
  type IssueTab,
} from "@/lib/issue-status-types"
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

const TAB_LABELS: Record<IssueTab, string> = {
  all: "All issues",
  active: "Active",
  backlog: "Backlog",
}

const STATUS_ORDER: readonly IssueStatus[] = [
  "in_progress",
  "todo",
  "backlog",
  "done",
  "cancelled",
] as const

const STATUS_LABEL: Record<IssueStatus, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Done",
  cancelled: "Canceled",
}

const PRIORITY_ORDER: Array<Issue["priority"]> = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
]

const PRIORITY_LABEL: Record<Issue["priority"], string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
}

type GroupBy = "status" | "team" | "assignee" | "priority"
type OrderBy = "priority" | "status" | "updated" | "created" | "title"

interface Filters {
  priorities: string[]
  assigneeIds: string[]
  labelIds: string[]
}

function formatShortDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function prioritySortValue(p: Issue["priority"]): number {
  return PRIORITY_ORDER.indexOf(p)
}

function statusSortValue(s: IssueStatus): number {
  return STATUS_ORDER.indexOf(s)
}

function sortIssues(issues: Issue[], orderBy: OrderBy): Issue[] {
  return [...issues].sort((a, b) => {
    switch (orderBy) {
      case "priority":
        return prioritySortValue(a.priority) - prioritySortValue(b.priority)
      case "status":
        return statusSortValue(a.status) - statusSortValue(b.status)
      case "updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })
}

function IssueRow({
  issue,
  assignee,
  teamKey,
}: {
  issue: Issue
  assignee: Member | null
  teamKey?: string
}) {
  return (
    <Link
      href={`/issues/${issue.identifier}`}
      className="group hover:bg-accent/40 flex items-center gap-3 border-b border-transparent px-5 py-2 transition-colors"
    >
      <span
        aria-hidden="true"
        className="border-muted-foreground/40 size-3.5 shrink-0 rounded-[3px] border opacity-0 transition-opacity group-hover:opacity-100"
      />
      <PriorityIcon priority={issue.priority} className="size-3.5 shrink-0" />
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
        {issue.identifier}
      </span>
      <StatusIcon status={issue.status} className="size-3.5 shrink-0" />
      <span className="flex-1 truncate text-sm">{issue.title}</span>
      {teamKey && (
        <span className="text-muted-foreground/70 ring-border/60 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] ring-1">
          {teamKey}
        </span>
      )}
      {assignee ? (
        <Avatar className="size-5 shrink-0">
          <AvatarImage src={assignee.avatar} alt={assignee.name} />
          <AvatarFallback className="bg-violet-600 text-[9px] text-white">
            {assignee.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span
          aria-label="Unassigned"
          className="text-muted-foreground/60 flex size-5 shrink-0 items-center justify-center"
        >
          <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
        </span>
      )}
      <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-xs">
        {formatShortDate(issue.createdAt)}
      </span>
    </Link>
  )
}

function StatusSection({
  status,
  items,
  memberById,
  teamById,
  showTeam,
  orderBy,
}: {
  status: IssueStatus
  items: Issue[]
  memberById: Map<string, Member>
  teamById: Map<string, Team>
  showTeam: boolean
  orderBy: OrderBy
}) {
  const [collapsed, setCollapsed] = useState(false)
  const sorted = useMemo(() => sortIssues(items, orderBy), [items, orderBy])
  if (items.length === 0) return null
  return (
    <div>
      <div className="group bg-muted/30 flex items-center gap-2 px-5 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          <StatusIcon status={status} className="size-3.5" />
          <span>{STATUS_LABEL[status]}</span>
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
      </div>
      {!collapsed &&
        sorted.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
            teamKey={showTeam ? teamById.get(issue.teamId)?.key : undefined}
          />
        ))}
    </div>
  )
}

function TeamSection({
  team,
  items,
  memberById,
  tab,
  filters,
  orderBy,
}: {
  team: Team
  items: Issue[]
  memberById: Map<string, Member>
  tab: IssueTab
  filters: Filters
  orderBy: OrderBy
}) {
  const [collapsed, setCollapsed] = useState(false)
  const filtered = useMemo(() => {
    let result = filterIssuesByTab(items, tab)
    if (filters.priorities.length > 0) {
      result = result.filter((i) => filters.priorities.includes(i.priority))
    }
    if (filters.assigneeIds.length > 0) {
      result = result.filter(
        (i) => i.assigneeId && filters.assigneeIds.includes(i.assigneeId)
      )
    }
    if (filters.labelIds.length > 0) {
      result = result.filter((i) =>
        i.labelIds.some((lid) => filters.labelIds.includes(lid))
      )
    }
    return result
  }, [items, tab, filters])

  const grouped = useMemo(() => {
    const out = {} as Record<IssueStatus, Issue[]>
    for (const s of STATUS_ORDER) out[s] = []
    for (const issue of filtered) out[issue.status].push(issue)
    return out
  }, [filtered])

  if (filtered.length === 0) return null

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 border-b px-5 py-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          {team.name}
          <span className="text-muted-foreground ml-0.5 font-mono text-xs font-normal">
            {team.key}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            {filtered.length}
          </span>
        </button>
      </div>
      {!collapsed &&
        STATUS_ORDER.map((s) =>
          grouped[s].length > 0 ? (
            <StatusSection
              key={s}
              status={s}
              items={grouped[s]}
              memberById={memberById}
              teamById={new Map([[team.id, team]])}
              showTeam={false}
              orderBy={orderBy}
            />
          ) : null
        )}
    </div>
  )
}

function AssigneeSection({
  assignee,
  items,
  memberById,
  teamById,
  orderBy,
}: {
  assignee: Member | null
  items: Issue[]
  memberById: Map<string, Member>
  teamById: Map<string, Team>
  orderBy: OrderBy
}) {
  const [collapsed, setCollapsed] = useState(false)
  const sorted = useMemo(() => sortIssues(items, orderBy), [items, orderBy])
  if (items.length === 0) return null
  return (
    <div>
      <div className="group bg-muted/30 flex items-center gap-2 px-5 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          {assignee ? (
            <>
              <Avatar className="size-4 shrink-0">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="bg-violet-600 text-[8px] text-white">
                  {assignee.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{assignee.name}</span>
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={UserCircleIcon}
                className="text-muted-foreground/60 size-4 shrink-0"
              />
              <span>Unassigned</span>
            </>
          )}
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
      </div>
      {!collapsed &&
        sorted.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
            teamKey={teamById.get(issue.teamId)?.key}
          />
        ))}
    </div>
  )
}

function PrioritySection({
  priority,
  items,
  memberById,
  teamById,
  orderBy,
}: {
  priority: Issue["priority"]
  items: Issue[]
  memberById: Map<string, Member>
  teamById: Map<string, Team>
  orderBy: OrderBy
}) {
  const [collapsed, setCollapsed] = useState(false)
  const sorted = useMemo(() => sortIssues(items, orderBy), [items, orderBy])
  if (items.length === 0) return null
  return (
    <div>
      <div className="group bg-muted/30 flex items-center gap-2 px-5 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          <PriorityIcon priority={priority} className="size-3.5 shrink-0" />
          <span>{PRIORITY_LABEL[priority]}</span>
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
      </div>
      {!collapsed &&
        sorted.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
            teamKey={teamById.get(issue.teamId)?.key}
          />
        ))}
    </div>
  )
}

export default function AllIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<IssueTab>("all")
  const [groupBy, setGroupBy] = useState<GroupBy>("status")
  const [orderBy, setOrderBy] = useState<OrderBy>("priority")
  const [filters, setFilters] = useState<Filters>({
    priorities: [],
    assigneeIds: [],
    labelIds: [],
  })
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([i, m, t, l]) => {
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLabels(l)
      setLoading(false)
    })
  }, [])

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])

  const filtered = useMemo(() => {
    let result = filterIssuesByTab(issues, activeTab)
    if (filters.priorities.length > 0) {
      result = result.filter((i) => filters.priorities.includes(i.priority))
    }
    if (filters.assigneeIds.length > 0) {
      result = result.filter(
        (i) => i.assigneeId && filters.assigneeIds.includes(i.assigneeId)
      )
    }
    if (filters.labelIds.length > 0) {
      result = result.filter((i) =>
        i.labelIds.some((lid) => filters.labelIds.includes(lid))
      )
    }
    return result
  }, [issues, activeTab, filters])

  const grouped = useMemo(() => {
    const out = {} as Record<IssueStatus, Issue[]>
    for (const s of STATUS_ORDER) out[s] = []
    for (const issue of filtered) out[issue.status].push(issue)
    return out
  }, [filtered])

  const groupedByAssignee = useMemo(() => {
    const out = new Map<string | null, Issue[]>()
    out.set(null, [])
    for (const m of members) out.set(m.id, [])
    for (const issue of filtered) {
      const key = issue.assigneeId ?? null
      if (!out.has(key)) out.set(key, [])
      out.get(key)!.push(issue)
    }
    return out
  }, [filtered, members])

  const groupedByPriority = useMemo(() => {
    const out = {} as Record<Issue["priority"], Issue[]>
    for (const p of PRIORITY_ORDER) out[p] = []
    for (const issue of filtered) out[issue.priority].push(issue)
    return out
  }, [filtered])

  const activeFilterCount = useMemo(
    () =>
      filters.priorities.length +
      filters.assigneeIds.length +
      filters.labelIds.length,
    [filters]
  )

  const openCreate = useCallback(() => setCreateOpen(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" && e.key !== "C") return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea") return
      if (document.querySelector('[data-state="open"][role="dialog"]')) return
      e.preventDefault()
      openCreate()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openCreate])

  function toggleFilter<K extends keyof Filters>(
    key: K,
    value: string,
    current: string[]
  ): void {
    setFilters((prev) => ({
      ...prev,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    }))
  }

  const GROUP_LABEL: Record<GroupBy, string> = {
    status: "Status",
    team: "Team",
    assignee: "Assignee",
    priority: "Priority",
  }

  const ORDER_LABEL: Record<OrderBy, string> = {
    priority: "Priority",
    status: "Status",
    updated: "Updated date",
    created: "Created date",
    title: "Title (A→Z)",
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex h-9 items-center gap-3 border-b px-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        <div className="space-y-2 p-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold">All Issues</h1>
            <span className="text-muted-foreground text-xs">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Group by toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
                  />
                }
              >
                <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
                Group: {GROUP_LABEL[groupBy]}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setGroupBy("status")}>
                  By status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("team")}>
                  By team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("assignee")}>
                  By assignee
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("priority")}>
                  By priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Order by dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
                  />
                }
              >
                <HugeiconsIcon icon={ArrowUpDownIcon} className="size-3.5" />
                Order: {ORDER_LABEL[orderBy]}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setOrderBy("priority")}>
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrderBy("status")}>
                  Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrderBy("updated")}>
                  Updated date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrderBy("created")}>
                  Created date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrderBy("title")}>
                  Title (A→Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter popover */}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
                  />
                }
              >
                <HugeiconsIcon
                  icon={SlidersHorizontalIcon}
                  className="size-3.5"
                />
                {activeFilterCount > 0
                  ? `Filter · ${activeFilterCount}`
                  : "Filter"}
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="bottom"
                className="w-64 gap-0 p-3"
              >
                {/* Priority */}
                <div className="mb-3">
                  <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wide uppercase">
                    Priority
                  </p>
                  <div className="space-y-1">
                    {PRIORITY_ORDER.map((p) => (
                      <label
                        key={p}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary size-3.5 shrink-0"
                          checked={filters.priorities.includes(p)}
                          onChange={() =>
                            toggleFilter("priorities", p, filters.priorities)
                          }
                        />
                        <PriorityIcon priority={p} className="size-3.5" />
                        <span>{PRIORITY_LABEL[p]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div className="mb-3">
                  <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wide uppercase">
                    Assignee
                  </p>
                  <div className="space-y-1">
                    {members.map((m) => (
                      <label
                        key={m.id}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary size-3.5 shrink-0"
                          checked={filters.assigneeIds.includes(m.id)}
                          onChange={() =>
                            toggleFilter(
                              "assigneeIds",
                              m.id,
                              filters.assigneeIds
                            )
                          }
                        />
                        <Avatar className="size-4 shrink-0">
                          <AvatarImage src={m.avatar} alt={m.name} />
                          <AvatarFallback className="bg-violet-600 text-[8px] text-white">
                            {m.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Labels */}
                <div className="mb-2">
                  <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wide uppercase">
                    Labels
                  </p>
                  <div className="space-y-1">
                    {labels.map((lbl) => (
                      <label
                        key={lbl.id}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary size-3.5 shrink-0"
                          checked={filters.labelIds.includes(lbl.id)}
                          onChange={() =>
                            toggleFilter("labelIds", lbl.id, filters.labelIds)
                          }
                        />
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: lbl.color }}
                        />
                        <span className="truncate">{lbl.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <div className="border-t pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          priorities: [],
                          assigneeIds: [],
                          labelIds: [],
                        })
                      }
                      className="text-muted-foreground hover:text-foreground w-full text-left text-xs"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={openCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              New issue
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex h-9 shrink-0 items-center border-b px-5">
          {(["all", "active", "backlog"] as IssueTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`mr-4 border-b-2 py-2 text-xs transition-colors ${
                activeTab === tab
                  ? "border-foreground text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-muted-foreground text-sm font-medium">
                No issues
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                {activeTab === "active"
                  ? "No active issues at the moment."
                  : activeTab === "backlog"
                    ? "The backlog is clear."
                    : "Create your first issue."}
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="bg-primary text-primary-foreground mt-4 flex items-center gap-1.5 rounded px-3 py-1.5 text-xs"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                New issue
              </button>
            </div>
          ) : groupBy === "status" ? (
            STATUS_ORDER.map((s) => (
              <StatusSection
                key={s}
                status={s}
                items={grouped[s]}
                memberById={memberById}
                teamById={teamById}
                showTeam
                orderBy={orderBy}
              />
            ))
          ) : groupBy === "team" ? (
            teams.map((team) => (
              <TeamSection
                key={team.id}
                team={team}
                items={issues.filter((i) => i.teamId === team.id)}
                memberById={memberById}
                tab={activeTab}
                filters={filters}
                orderBy={orderBy}
              />
            ))
          ) : groupBy === "assignee" ? (
            <>
              {members
                .filter((m) => (groupedByAssignee.get(m.id)?.length ?? 0) > 0)
                .map((m) => (
                  <AssigneeSection
                    key={m.id}
                    assignee={m}
                    items={groupedByAssignee.get(m.id) ?? []}
                    memberById={memberById}
                    teamById={teamById}
                    orderBy={orderBy}
                  />
                ))}
              {(groupedByAssignee.get(null)?.length ?? 0) > 0 && (
                <AssigneeSection
                  key="unassigned"
                  assignee={null}
                  items={groupedByAssignee.get(null) ?? []}
                  memberById={memberById}
                  teamById={teamById}
                  orderBy={orderBy}
                />
              )}
            </>
          ) : (
            PRIORITY_ORDER.map((p) => (
              <PrioritySection
                key={p}
                priority={p}
                items={groupedByPriority[p]}
                memberById={memberById}
                teamById={teamById}
                orderBy={orderBy}
              />
            ))
          )}
        </div>
      </div>

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            // Refresh issues after creating
            fetch("/api/data/issues")
              .then((r) => r.json())
              .then(setIssues)
          }
        }}
      />
    </>
  )
}
