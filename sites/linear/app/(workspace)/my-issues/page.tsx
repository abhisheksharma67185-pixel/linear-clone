"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import type {
  Issue,
  Member,
  Label,
  Project,
} from "@/app/lib/mock-data"
import { CURRENT_USER_ID } from "@/app/lib/current-user"
import {
  assignedQuery,
  createdQuery,
  subscribedQuery,
} from "@/app/lib/my-issues-filters"
import {
  parseFilters,
  serializeFilters,
  applyFilters,
  countActiveFilters,
  setFilterValues,
  type FilterKind,
  type FilterState,
} from "@/app/lib/my-issues-filter-state"
import {
  DEFAULT_DISPLAY,
  loadDisplay,
  saveDisplay,
  type DisplayState,
  type GroupingKind,
  type DisplayProperty,
} from "@/app/lib/my-issues-display-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import {
  CircularIconButton,
  CircularIconToolbarRoot,
  FilterSortIcon,
  AdjustmentsIcon,
  CardViewIcon,
} from "@/components/circular-icon-toolbar"
import {
  MyIssuesFilterPopover,
  type FilterPopoverHandle,
} from "@/components/my-issues-filter-popover"
import { MyIssuesDisplayPopover } from "@/components/my-issues-display-popover"
import { MyIssuesFilterChips } from "@/components/my-issues-filter-chips"

type IssueStatus = Issue["status"]
type IssuePriority = Issue["priority"]

const PRIORITY_ORDER_INDEX: Record<IssuePriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}

const STATUS_GROUP_ORDER: readonly IssueStatus[] = [
  "in_progress",
  "todo",
  "backlog",
  "done",
  "cancelled",
] as const

const PRIORITY_OPTIONS: {
  value: IssuePriority
  label: string
  shortcut: string
}[] = [
  { value: "none", label: "No priority", shortcut: "0" },
  { value: "urgent", label: "Urgent", shortcut: "1" },
  { value: "high", label: "High", shortcut: "2" },
  { value: "medium", label: "Medium", shortcut: "3" },
  { value: "low", label: "Low", shortcut: "4" },
]

const STATUS_OPTIONS: {
  value: IssueStatus
  label: string
  shortcut: string
}[] = [
  { value: "backlog", label: "Backlog", shortcut: "1" },
  { value: "todo", label: "Todo", shortcut: "2" },
  { value: "in_progress", label: "In Progress", shortcut: "3" },
  { value: "done", label: "Completed", shortcut: "4" },
  { value: "cancelled", label: "Canceled", shortcut: "5" },
]

const STATUS_GROUP_LABEL: Record<IssueStatus, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Completed",
  cancelled: "Canceled",
}

const PRIORITY_LABEL: Record<IssuePriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
}

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: FilterState = useMemo(
    () => parseFilters(searchParams.get("filter")),
    [searchParams]
  )
  const setFilters = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams(searchParams.toString())
      const serialized = serializeFilters(next)
      if (serialized) params.set("filter", serialized)
      else params.delete("filter")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const [display, setDisplay] = useState<DisplayState>(DEFAULT_DISPLAY)
  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    setDisplay(loadDisplay())
  }, [])
  const updateDisplay = useCallback((next: DisplayState) => {
    setDisplay(next)
    saveDisplay(next)
  }, [])

  const [filterOpen, setFilterOpen] = useState(false)
  const [displayOpen, setDisplayOpen] = useState(false)
  const [filterInitialKind, setFilterInitialKind] = useState<FilterKind | null>(
    null
  )
  const filterRef = useRef<FilterPopoverHandle>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ]).then(([i, m, l, p]) => {
      setIssues(i)
      setMembers(m)
      setLabels(l)
      setProjects(p)
      setLoading(false)
    })
  }, [])

  const openCreate = useCallback(() => setCreateOpen(true), [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return
      }
      if (document.querySelector('[data-state="open"][role="dialog"]')) return
      if (document.querySelector('[data-slot="popover-content"]')) return
      if (event.key === "c" || event.key === "C") {
        event.preventDefault()
        openCreate()
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault()
        setFilterInitialKind(null)
        setFilterOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openCreate])

  const assigned = useMemo(
    () => issues.filter(assignedQuery(CURRENT_USER_ID).predicate),
    [issues]
  )
  const created = useMemo(
    () => issues.filter(createdQuery(CURRENT_USER_ID).predicate),
    [issues]
  )
  const subscribed = useMemo(
    () => issues.filter(subscribedQuery(CURRENT_USER_ID).predicate),
    [issues]
  )

  const filteredAssigned = useMemo(
    () => applyFilters(assigned, filters),
    [assigned, filters]
  )
  const filteredCreated = useMemo(
    () => applyFilters(created, filters),
    [created, filters]
  )
  const filteredSubscribed = useMemo(
    () => applyFilters(subscribed, filters),
    [subscribed, filters]
  )

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )
  const labelById = useMemo(
    () => new Map(labels.map((l) => [l.id, l])),
    [labels]
  )
  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  )

  const updatePriority = useCallback(
    (id: string, priority: IssuePriority) => {
      setIssues((prev) =>
        prev.map((it) => (it.id === id ? { ...it, priority } : it))
      )
      const target = issues.find((it) => it.id === id)
      if (!target) return
      fetch(`/api/data/issues/${target.identifier}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ priority }),
      }).catch(() => {})
    },
    [issues]
  )

  const updateStatus = useCallback(
    (id: string, status: IssueStatus) => {
      setIssues((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status } : it))
      )
      const target = issues.find((it) => it.id === id)
      if (!target) return
      fetch(`/api/data/issues/${target.identifier}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(() => {})
    },
    [issues]
  )

  const filterCount = countActiveFilters(filters)

  const removeFilter = (kind: FilterKind) => {
    const next = setFilterValues(filters, kind, [])
    setFilters(next)
  }
  const editFilter = (kind: FilterKind) => {
    setFilterInitialKind(kind)
    setFilterOpen(true)
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center justify-between px-6 py-3">
          <h1 className="text-sm font-medium">My issues</h1>
          <CircularIconToolbarRoot>
            <MyIssuesFilterPopover
              ref={filterRef}
              filters={filters}
              onChange={setFilters}
              issues={assigned}
              members={members}
              labels={labels}
              projects={projects}
              open={filterOpen}
              onOpenChange={(o) => {
                setFilterOpen(o)
                if (!o) setFilterInitialKind(null)
              }}
              initialKind={filterInitialKind}
              trigger={
                <CircularIconButton
                  label="Filter and sort"
                  aria-haspopup="dialog"
                >
                  <FilterSortIcon />
                  {filterCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="ring-background absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-violet-500 ring-2"
                    />
                  )}
                </CircularIconButton>
              }
            />
            <MyIssuesDisplayPopover
              value={display}
              onChange={updateDisplay}
              open={displayOpen}
              onOpenChange={setDisplayOpen}
              trigger={
                <CircularIconButton
                  label="Display"
                  aria-haspopup="dialog"
                >
                  <AdjustmentsIcon />
                </CircularIconButton>
              }
            />
            <CircularIconButton
              label="Toggle right panel"
              aria-pressed={panelOpen}
              onClick={() => setPanelOpen((v) => !v)}
            >
              <CardViewIcon />
            </CircularIconButton>
          </CircularIconToolbarRoot>
        </header>

        <MyIssuesFilterChips
          filters={filters}
          members={members}
          labels={labels}
          projects={projects}
          onRemove={removeFilter}
          onEdit={editFilter}
        />

        <div className="flex min-h-0 flex-1">
          <Tabs
            defaultValue="assigned"
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="px-4">
              <TabsList className="h-10 gap-1 bg-transparent p-0">
                <TabPill value="assigned">Assigned</TabPill>
                <TabPill value="created">Created</TabPill>
                <TabPill value="subscribed">Subscribed</TabPill>
                <TabPill value="activity">Activity</TabPill>
              </TabsList>
            </div>

            <TabsContent value="assigned" className="m-0 flex-1 overflow-auto">
              {loading ? (
                <LoadingRows />
              ) : filteredAssigned.length === 0 ? (
                <EmptyState
                  label={
                    filterCount > 0
                      ? "No issues match the current filters"
                      : "No issues assigned to you"
                  }
                  onCreate={openCreate}
                />
              ) : (
                <IssueListView
                  issues={filteredAssigned}
                  display={display}
                  memberById={memberById}
                  labelById={labelById}
                  projectById={projectById}
                  onUpdatePriority={updatePriority}
                  onUpdateStatus={updateStatus}
                />
              )}
            </TabsContent>

            <TabsContent value="created" className="m-0 flex-1 overflow-auto">
              {loading ? (
                <LoadingRows />
              ) : filteredCreated.length === 0 ? (
                <EmptyState
                  label={
                    filterCount > 0
                      ? "No issues match the current filters"
                      : "You haven't created any issues"
                  }
                  onCreate={openCreate}
                />
              ) : (
                <IssueListView
                  issues={filteredCreated}
                  display={display}
                  memberById={memberById}
                  labelById={labelById}
                  projectById={projectById}
                  onUpdatePriority={updatePriority}
                  onUpdateStatus={updateStatus}
                />
              )}
            </TabsContent>

            <TabsContent
              value="subscribed"
              className="m-0 flex-1 overflow-auto"
            >
              {loading ? (
                <LoadingRows />
              ) : filteredSubscribed.length === 0 ? (
                <EmptyState
                  label={
                    filterCount > 0
                      ? "No issues match the current filters"
                      : "You're not subscribed to any issues"
                  }
                  onCreate={openCreate}
                />
              ) : (
                <IssueListView
                  issues={filteredSubscribed}
                  display={display}
                  memberById={memberById}
                  labelById={labelById}
                  projectById={projectById}
                  onUpdatePriority={updatePriority}
                  onUpdateStatus={updateStatus}
                />
              )}
            </TabsContent>

            <TabsContent value="activity" className="m-0 flex-1 overflow-auto">
              <EmptyState label="No recent activity" onCreate={openCreate} />
            </TabsContent>
          </Tabs>

          {panelOpen && <SummaryPanel issues={filteredAssigned} />}
        </div>
      </div>

      <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function IssueListView({
  issues,
  display,
  memberById,
  labelById,
  projectById,
  onUpdatePriority,
  onUpdateStatus,
}: {
  issues: Issue[]
  display: DisplayState
  memberById: Map<string, Member>
  labelById: Map<string, Label>
  projectById: Map<string, Project>
  onUpdatePriority: (id: string, priority: IssuePriority) => void
  onUpdateStatus: (id: string, status: IssueStatus) => void
}) {
  if (display.layout === "board") {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        Board layout coming soon
      </div>
    )
  }

  const sorted = useMemo(() => sortIssues(issues, display.ordering), [issues, display.ordering])
  const groups = useMemo(
    () => buildGroups(sorted, display.grouping, { memberById, labelById, projectById }),
    [sorted, display.grouping, memberById, labelById, projectById]
  )

  if (display.grouping === "none") {
    return (
      <ul className="m-0 list-none p-0">
        {sorted.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
            project={
              issue.projectId ? projectById.get(issue.projectId) ?? null : null
            }
            issueLabels={
              issue.labelIds
                ?.map((id) => labelById.get(id))
                .filter((l): l is Label => Boolean(l)) ?? []
            }
            visibleProperties={display.displayProperties}
            onUpdatePriority={onUpdatePriority}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </ul>
    )
  }

  return (
    <ul className="m-0 list-none p-0">
      {groups.map((g) => (
        <Group
          key={g.key}
          group={g}
          memberById={memberById}
          labelById={labelById}
          projectById={projectById}
          visibleProperties={display.displayProperties}
          onUpdatePriority={onUpdatePriority}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </ul>
  )
}

function sortIssues(issues: Issue[], ordering: DisplayState["ordering"]): Issue[] {
  const out = issues.slice()
  if (ordering === "priority") {
    out.sort((a, b) => PRIORITY_ORDER_INDEX[a.priority] - PRIORITY_ORDER_INDEX[b.priority])
  } else if (ordering === "lastUpdated") {
    out.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  } else if (ordering === "lastCreated") {
    out.sort(
      (a, b) =>
        +new Date(((b as unknown as { createdAt: string }).createdAt ?? b.updatedAt)) -
        +new Date(((a as unknown as { createdAt: string }).createdAt ?? a.updatedAt))
    )
  }
  // "manual" and "importance" fall through to original order
  return out
}

interface GroupSpec {
  key: string
  label: string
  icon?: React.ReactNode
  items: Issue[]
}

function buildGroups(
  issues: Issue[],
  grouping: GroupingKind,
  ctx: {
    memberById: Map<string, Member>
    labelById: Map<string, Label>
    projectById: Map<string, Project>
  }
): GroupSpec[] {
  if (grouping === "status") {
    const buckets: Record<IssueStatus, Issue[]> = {
      in_progress: [],
      todo: [],
      backlog: [],
      done: [],
      cancelled: [],
    }
    for (const issue of issues) buckets[issue.status].push(issue)
    return STATUS_GROUP_ORDER.filter((s) => buckets[s].length > 0).map((s) => ({
      key: s,
      label: STATUS_GROUP_LABEL[s],
      icon: <StatusIcon status={s} className="size-3.5" />,
      items: buckets[s],
    }))
  }
  if (grouping === "priority") {
    const order: IssuePriority[] = ["urgent", "high", "medium", "low", "none"]
    const buckets = new Map<IssuePriority, Issue[]>()
    for (const p of order) buckets.set(p, [])
    for (const issue of issues) buckets.get(issue.priority)!.push(issue)
    return order
      .filter((p) => (buckets.get(p) ?? []).length > 0)
      .map((p) => ({
        key: p,
        label: PRIORITY_LABEL[p],
        icon: <PriorityIcon priority={p} className="size-3.5" />,
        items: buckets.get(p)!,
      }))
  }
  if (grouping === "assignee") {
    const buckets = new Map<string, Issue[]>()
    for (const issue of issues) {
      const key = issue.assigneeId ?? "unassigned"
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(issue)
    }
    return Array.from(buckets.entries()).map(([key, items]) => {
      const member = key === "unassigned" ? null : ctx.memberById.get(key)
      return {
        key,
        label: member?.name ?? "No assignee",
        icon: member ? (
          <Avatar className="size-4">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="text-[8px]">
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="border-muted-foreground/40 size-3.5 rounded-full border border-dashed" />
        ),
        items,
      }
    })
  }
  if (grouping === "project") {
    const buckets = new Map<string, Issue[]>()
    for (const issue of issues) {
      const key = issue.projectId ?? "none"
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(issue)
    }
    return Array.from(buckets.entries()).map(([key, items]) => {
      const project = key === "none" ? null : ctx.projectById.get(key)
      return {
        key,
        label: project?.name ?? "No project",
        items,
      }
    })
  }
  if (grouping === "labels") {
    const buckets = new Map<string, Issue[]>()
    const NO_LABEL = "__no_label__"
    for (const issue of issues) {
      const ids = issue.labelIds ?? []
      if (ids.length === 0) {
        if (!buckets.has(NO_LABEL)) buckets.set(NO_LABEL, [])
        buckets.get(NO_LABEL)!.push(issue)
        continue
      }
      for (const id of ids) {
        if (!buckets.has(id)) buckets.set(id, [])
        buckets.get(id)!.push(issue)
      }
    }
    return Array.from(buckets.entries()).map(([key, items]) => {
      if (key === NO_LABEL) return { key, label: "No label", items }
      const label = ctx.labelById.get(key)
      return {
        key,
        label: label?.name ?? key,
        icon: label ? (
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: label.color }}
          />
        ) : null,
        items,
      }
    })
  }
  return [{ key: "all", label: "All", items: issues }]
}

function Group({
  group,
  memberById,
  labelById,
  projectById,
  visibleProperties,
  onUpdatePriority,
  onUpdateStatus,
}: {
  group: GroupSpec
  memberById: Map<string, Member>
  labelById: Map<string, Label>
  projectById: Map<string, Project>
  visibleProperties: DisplayProperty[]
  onUpdatePriority: (id: string, priority: IssuePriority) => void
  onUpdateStatus: (id: string, status: IssueStatus) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <li data-group={group.key} className="list-none">
      <div className="bg-muted/30 flex items-center gap-2 px-5 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${
              collapsed ? "-rotate-90" : ""
            }`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          {group.icon}
          <span>{group.label}</span>
          <span className="text-muted-foreground ml-1 text-xs font-normal">
            {group.items.length}
          </span>
        </button>
      </div>
      {!collapsed && (
        <ul className="m-0 list-none p-0">
          {group.items.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              assignee={memberById.get(issue.assigneeId ?? "") ?? null}
              project={
                issue.projectId
                  ? projectById.get(issue.projectId) ?? null
                  : null
              }
              issueLabels={
                issue.labelIds
                  ?.map((id) => labelById.get(id))
                  .filter((l): l is Label => Boolean(l)) ?? []
              }
              visibleProperties={visibleProperties}
              onUpdatePriority={onUpdatePriority}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function IssueRow({
  issue,
  assignee,
  project,
  issueLabels,
  visibleProperties,
  onUpdatePriority,
  onUpdateStatus,
}: {
  issue: Issue
  assignee: Member | null
  project: Project | null
  issueLabels: Label[]
  visibleProperties: DisplayProperty[]
  onUpdatePriority: (id: string, priority: IssuePriority) => void
  onUpdateStatus: (id: string, status: IssueStatus) => void
}) {
  const has = (p: DisplayProperty) => visibleProperties.includes(p)

  return (
    <li className="hover:bg-accent/40 flex items-center gap-3 border-b px-6 py-2 transition-colors">
      {has("Priority") && (
        <PriorityMenu
          priority={issue.priority}
          onChange={(p) => onUpdatePriority(issue.id, p)}
        />
      )}
      {has("ID") && (
        <Link href={`/issues/${issue.identifier}`} className="contents">
          <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
            {issue.identifier}
          </span>
        </Link>
      )}
      {has("Status") && (
        <StatusMenu
          status={issue.status}
          onChange={(s) => onUpdateStatus(issue.id, s)}
        />
      )}
      <Link href={`/issues/${issue.identifier}`} className="contents">
        <span className="flex-1 truncate text-sm">{issue.title}</span>
      </Link>
      {has("Project") && project && (
        <span className="text-muted-foreground hidden max-w-32 shrink-0 truncate text-xs sm:inline">
          {project.name}
        </span>
      )}
      {has("Labels") && issueLabels.length > 0 && (
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          {issueLabels.slice(0, 3).map((l) => (
            <span
              key={l.id}
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: l.color }}
            />
          ))}
        </span>
      )}
      <Link href={`/issues/${issue.identifier}`} className="contents">
        {has("Assignee") &&
          (assignee ? (
            <Avatar className="size-5 shrink-0">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                {assignee.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="size-5 shrink-0" />
          ))}
        {has("Updated") && (
          <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-xs">
            {formatShortDate(issue.updatedAt)}
          </span>
        )}
        {has("Created") && (
          <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-xs">
            {formatShortDate(
              (issue as unknown as { createdAt?: string }).createdAt ??
                issue.updatedAt
            )}
          </span>
        )}
      </Link>
    </li>
  )
}

function StatusMenu({
  status,
  onChange,
}: {
  status: IssueStatus
  onChange: (next: IssueStatus) => void
}) {
  return (
    <OptionMenu
      ariaLabel="Change status"
      placeholder="Change status..."
      hotkey="S"
      trigger={<StatusIcon status={status} className="size-3.5" />}
      options={STATUS_OPTIONS}
      currentValue={status}
      renderIcon={(value) => (
        <StatusIcon status={value} className="size-3.5" />
      )}
      onSelect={onChange}
    />
  )
}

function PriorityMenu({
  priority,
  onChange,
}: {
  priority: IssuePriority
  onChange: (next: IssuePriority) => void
}) {
  return (
    <OptionMenu
      ariaLabel="Set priority"
      placeholder="Set priority to..."
      hotkey="P"
      trigger={<PriorityIcon priority={priority} className="size-3.5" />}
      options={PRIORITY_OPTIONS}
      currentValue={priority}
      renderIcon={(value) => (
        <PriorityIcon priority={value} className="size-3.5" />
      )}
      onSelect={onChange}
    />
  )
}

function OptionMenu<T extends string>({
  ariaLabel,
  placeholder,
  hotkey,
  trigger,
  options,
  currentValue,
  renderIcon,
  onSelect,
}: {
  ariaLabel: string
  placeholder: string
  hotkey: string
  trigger: React.ReactNode
  options: { value: T; label: string; shortcut: string }[]
  currentValue: T
  renderIcon: (value: T) => React.ReactNode
  onSelect: (next: T) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className="hover:bg-accent flex size-5 shrink-0 items-center justify-center rounded"
          />
        }
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const first = filtered[0]
                if (first) {
                  onSelect(first.value)
                  setOpen(false)
                }
              }
            }}
            placeholder={placeholder}
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-xs outline-none"
          />
          <span className="text-muted-foreground rounded border px-1 font-mono text-[10px]">
            {hotkey}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-muted-foreground px-2 py-2 text-center text-xs">
            No matches
          </div>
        ) : (
          filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onSelect(o.value)
                setOpen(false)
              }}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs"
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {renderIcon(o.value)}
              </span>
              <span className="flex-1 truncate">{o.label}</span>
              {o.value === currentValue && <span className="text-[10px]">✓</span>}
              <span className="text-muted-foreground text-[10px]">
                {o.shortcut}
              </span>
            </button>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatShortDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function TabPill({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className="text-muted-foreground border-border/50 hover:bg-muted/50 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:border-transparent rounded-full border bg-transparent px-3 py-1 text-xs font-medium shadow-none transition-colors data-[state=active]:shadow-none"
    >
      {children}
    </TabsTrigger>
  )
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-2 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 rounded-md" />
      ))}
    </div>
  )
}

function EmptyState({
  label,
  onCreate,
}: {
  label: string
  onCreate: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 py-24">
      <EmptyIllustration />
      <p className="text-muted-foreground text-sm">{label}</p>
      <Button
        onClick={onCreate}
        className="h-8 rounded-full bg-violet-600 px-4 text-xs font-medium text-white hover:bg-violet-700"
      >
        Create new issue
      </Button>
    </div>
  )
}

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="text-muted-foreground h-24 w-32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g opacity="0.35">
        <ellipse cx="80" cy="38" rx="22" ry="6" />
        <path d="M52 34 Q40 38 40 46" />
        <path d="M108 34 Q120 38 120 46" />
      </g>
      <g opacity="0.9">
        <ellipse cx="80" cy="60" rx="22" ry="6" />
        <path d="M52 56 Q36 60 36 70" />
        <path d="M108 56 Q124 60 124 70" />
        <path d="M30 58 Q16 62 16 74" opacity="0.5" />
        <path d="M130 58 Q144 62 144 74" opacity="0.5" />
      </g>
      <g opacity="0.5">
        <path d="M58 82 Q80 92 102 82" />
        <path d="M48 86 Q80 100 112 86" opacity="0.5" />
      </g>
    </svg>
  )
}

type SummaryTab = "labels" | "priority" | "projects"

const PRIORITY_ORDER: Issue["priority"][] = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
]

function SummaryPanel({ issues }: { issues: Issue[] }) {
  const [tab, setTab] = useState<SummaryTab>("labels")

  const labelCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const i of issues) {
      for (const id of i.labelIds ?? []) m.set(id, (m.get(id) ?? 0) + 1)
    }
    return m
  }, [issues])

  const priorityCounts = useMemo(() => {
    const m = new Map<Issue["priority"], number>()
    for (const i of issues) m.set(i.priority, (m.get(i.priority) ?? 0) + 1)
    return m
  }, [issues])

  const projectCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const i of issues) {
      const key = i.projectId ?? "none"
      m.set(key, (m.get(key) ?? 0) + 1)
    }
    return m
  }, [issues])

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l">
      <div className="flex items-center gap-1.5 px-3 py-3">
        <PanelPill active={tab === "labels"} onClick={() => setTab("labels")}>
          Labels
        </PanelPill>
        <PanelPill
          active={tab === "priority"}
          onClick={() => setTab("priority")}
        >
          Priority
        </PanelPill>
        <PanelPill
          active={tab === "projects"}
          onClick={() => setTab("projects")}
        >
          Projects
        </PanelPill>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {tab === "labels" &&
          (labelCounts.size === 0 ? (
            <EmptyPanel label="No labels used" />
          ) : (
            <ul className="m-0 list-none p-0">
              {Array.from(labelCounts.entries()).map(([id, count]) => (
                <li
                  key={id}
                  className="flex items-center justify-between py-1.5 text-xs"
                >
                  <span className="text-muted-foreground truncate">{id}</span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          ))}

        {tab === "priority" && (
          <ul className="m-0 list-none p-0">
            {PRIORITY_ORDER.filter((p) => (priorityCounts.get(p) ?? 0) > 0).map(
              (p) => (
                <li
                  key={p}
                  className="flex items-center justify-between gap-2 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-2">
                    <PriorityIcon priority={p} className="size-3" />
                    <span>{PRIORITY_LABEL[p]}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {priorityCounts.get(p) ?? 0}
                  </span>
                </li>
              )
            )}
            {priorityCounts.size === 0 && (
              <EmptyPanel label="No priority set" />
            )}
          </ul>
        )}

        {tab === "projects" &&
          (projectCounts.size === 0 ? (
            <EmptyPanel label="No projects" />
          ) : (
            <ul className="m-0 list-none p-0">
              {Array.from(projectCounts.entries()).map(([id, count]) => (
                <li
                  key={id}
                  className="flex items-center justify-between py-1.5 text-xs"
                >
                  <span className="text-muted-foreground truncate">
                    {id === "none" ? "No project" : id}
                  </span>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </aside>
  )
}

function PanelPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground py-6 text-center text-xs">
      {label}
    </div>
  )
}
