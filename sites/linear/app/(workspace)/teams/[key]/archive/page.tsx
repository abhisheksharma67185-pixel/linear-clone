"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import type { Issue, Team } from "@/app/lib/mock-data"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  Cancel01Icon,
  StatusIcon as StatusFilterIcon,
  UserCircleIcon,
  UserIcon,
  PencilEdit01Icon,
  Chart01Icon,
  LabelIcon,
  Flag03Icon,
  MagicWand01Icon,
  Calendar03Icon,
  CubeIcon,
  Settings01Icon,
  Target02Icon,
  Notification01Icon,
  CancelCircleIcon,
  TextFontIcon,
  Link04Icon,
  FileEditIcon,
  BotIcon,
} from "@hugeicons/core-free-icons"
import {
  CircularIconToolbarRoot,
  FilterSortIcon,
} from "@/components/circular-icon-toolbar"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import {
  FilterPopover,
  type FilterOption,
  type FilterSelection,
  parseFilterSelectionKey,
} from "@/components/filter-popover"

/**
 * Archive tabs shown across the top of the archived-issues page.
 * "Issues" is the default. The other tabs are surfaced for parity
 * with Linear's archive page even though their content panes are
 * stubs — the empty-state is the same regardless of selection
 * because the mock data has no archived items in any scope.
 */
const ARCHIVE_TABS = [
  { id: "issues", label: "Issues" },
  { id: "projects", label: "Projects" },
  { id: "cycles", label: "Cycles" },
  { id: "deleted-issues", label: "Recently deleted issues" },
  { id: "deleted-projects", label: "Recently deleted projects" },
  { id: "deleted-initiatives", label: "Recently deleted initiatives" },
  { id: "deleted-documents", label: "Recently deleted documents" },
] as const

type ArchiveTab = (typeof ARCHIVE_TABS)[number]["id"]

const TAB_TITLE: Record<ArchiveTab, string> = {
  issues: "Archived issues",
  projects: "Archived projects",
  cycles: "Archived cycles",
  "deleted-issues": "Recently deleted issues",
  "deleted-projects": "Recently deleted projects",
  "deleted-initiatives": "Recently deleted initiatives",
  "deleted-documents": "Recently deleted documents",
}

const TAB_EMPTY_COPY: Record<ArchiveTab, string> = {
  issues: "No matching issues",
  projects: "No matching projects",
  cycles: "No matching cycles",
  "deleted-issues": "No recently deleted issues",
  "deleted-projects": "No recently deleted projects",
  "deleted-initiatives": "No recently deleted initiatives",
  "deleted-documents": "No recently deleted documents",
}

const ARCHIVE_FILTER_OPTIONS: FilterOption[] = [
  {
    label: "Status",
    icon: StatusFilterIcon,
    kind: "checkbox",
    submenu: [
      { label: "Backlog", icon: <StatusIcon status="backlog" /> },
      { label: "Todo", icon: <StatusIcon status="todo" /> },
      { label: "In Progress", icon: <StatusIcon status="in_progress" /> },
      { label: "Done", icon: <StatusIcon status="done" /> },
      { label: "Cancelled", icon: <StatusIcon status="cancelled" /> },
    ],
  },
  {
    label: "Assignee",
    icon: UserCircleIcon,
    kind: "checkbox",
    submenu: [{ label: "Abhishek" }, { label: "No assignee" }],
  },
  {
    label: "Agent",
    icon: BotIcon,
    kind: "checkbox",
    submenu: [],
  },
  {
    label: "Creator",
    icon: PencilEdit01Icon,
    kind: "checkbox",
    submenu: [{ label: "Abhishek" }],
  },
  {
    label: "Priority",
    icon: Chart01Icon,
    kind: "checkbox",
    submenu: [
      { label: "No priority", icon: <PriorityIcon priority="none" /> },
      { label: "Urgent", icon: <PriorityIcon priority="urgent" /> },
      { label: "High", icon: <PriorityIcon priority="high" /> },
      { label: "Medium", icon: <PriorityIcon priority="medium" /> },
      { label: "Low", icon: <PriorityIcon priority="low" /> },
    ],
  },
  {
    label: "Labels",
    icon: LabelIcon,
    kind: "checkbox",
    submenu: [],
  },
  {
    label: "Relations",
    icon: Flag03Icon,
    kind: "click",
    submenu: [
      {
        label: "Parent issue",
        icon: <HugeiconsIcon icon={Flag03Icon} className="size-3.5" />,
      },
      {
        label: "Sub-issues",
        icon: <HugeiconsIcon icon={Flag03Icon} className="size-3.5" />,
      },
      {
        label: "Blocking issues",
        icon: <HugeiconsIcon icon={Flag03Icon} className="size-3.5" />,
      },
      {
        label: "Blocked issues",
        icon: <HugeiconsIcon icon={Flag03Icon} className="size-3.5" />,
      },
    ],
  },
  {
    label: "Suggested label",
    icon: MagicWand01Icon,
    kind: "checkbox",
    submenu: [],
  },
  {
    label: "Dates",
    icon: Calendar03Icon,
    kind: "nested",
    submenu: [
      {
        label: "Archived date",
        icon: <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />,
      },
      {
        label: "Created date",
        icon: <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />,
      },
      {
        label: "Updated date",
        icon: <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />,
      },
      {
        label: "Due date",
        icon: <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />,
      },
      {
        label: "Completed date",
        icon: <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />,
      },
    ],
  },
  {
    label: "Project",
    icon: CubeIcon,
    kind: "checkbox",
    submenu: [],
    groupBreakBefore: true,
  },
  {
    label: "Project properties",
    icon: Settings01Icon,
    kind: "nested",
    submenu: [
      {
        label: "Project status",
        icon: <HugeiconsIcon icon={StatusFilterIcon} className="size-3.5" />,
      },
      {
        label: "Project priority",
        icon: <HugeiconsIcon icon={Chart01Icon} className="size-3.5" />,
      },
      {
        label: "Project lead",
        icon: <HugeiconsIcon icon={UserIcon} className="size-3.5" />,
      },
    ],
  },
  {
    label: "Initiative",
    icon: Target02Icon,
    kind: "checkbox",
    submenu: [],
  },
  {
    label: "Subscribers",
    icon: Notification01Icon,
    kind: "checkbox",
    submenu: [{ label: "Abhishek" }],
    groupBreakBefore: true,
  },
  {
    label: "Auto-closed",
    icon: CancelCircleIcon,
    kind: "click",
    submenu: [
      {
        label: "Auto-closed",
        icon: <HugeiconsIcon icon={CancelCircleIcon} className="size-3.5" />,
      },
    ],
  },
  {
    label: "Content",
    icon: TextFontIcon,
    kind: "search",
    searchPlaceholder: "Filter by content...",
  },
  {
    label: "Links",
    icon: Link04Icon,
    kind: "click",
    submenu: [
      {
        label: "Has links",
        icon: <HugeiconsIcon icon={Link04Icon} className="size-3.5" />,
      },
      {
        label: "No links",
        icon: <HugeiconsIcon icon={Link04Icon} className="size-3.5" />,
      },
    ],
  },
  {
    label: "Template",
    icon: FileEditIcon,
    kind: "checkbox",
    submenu: [{ label: "No template" }],
  },
]

const ARCHIVE_AI_SUGGESTIONS = [
  "archived this month",
  "completed and archived",
  "archived by me",
]

const STATUS_LABEL_TO_KEY: Record<string, Issue["status"]> = {
  Backlog: "backlog",
  Todo: "todo",
  "In Progress": "in_progress",
  Done: "done",
  Cancelled: "cancelled",
}

const PRIORITY_LABEL_TO_KEY: Record<string, Issue["priority"]> = {
  Urgent: "urgent",
  High: "high",
  Medium: "medium",
  Low: "low",
  "No priority": "none",
}

export default function TeamArchivePage() {
  const params = useParams<{ key: string }>()
  const teamKeyParam = (params?.key ?? "").toUpperCase()

  const [teams, setTeams] = useState<Team[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [activeTab, setActiveTab] = useState<ArchiveTab>("issues")
  const [filterKeys, setFilterKeys] = useState<FilterSelection>(() => new Set())

  useEffect(() => {
    Promise.all([
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
    ]).then(([t, i]) => {
      setTeams(t)
      setIssues(i)
    })
  }, [])

  const team = useMemo(
    () => teams.find((t) => t.key.toUpperCase() === teamKeyParam) ?? null,
    [teams, teamKeyParam]
  )

  // Resets selected filters whenever the active tab changes — filters
  // are scoped to the issue lists and shouldn't carry over to the
  // project / cycle / document panes (where they aren't visible).
  // Done inline in the click handler rather than as a useEffect to
  // keep state changes in event handlers (avoids cascading renders).
  const handleTabChange = (next: ArchiveTab) => {
    if (next === activeTab) return
    setActiveTab(next)
    setFilterKeys(new Set())
  }

  // The mock backend has no archive flag on issues yet, so this is
  // always an empty list. Computed for completeness so when the
  // schema grows an `archivedAt` field, the count and list will
  // reconcile without further changes.
  const archivedTeamIssues = useMemo(() => {
    if (!team) return []
    return issues.filter((i) => {
      if (i.teamId !== team.id) return false
      // `archivedAt` is forward-compatible — the mock data type
      // doesn't expose it yet, but reading it through an index
      // signature keeps the filter ready for when it does.
      const archivedAt = (i as unknown as Record<string, unknown>).archivedAt
      return Boolean(archivedAt)
    })
  }, [issues, team])

  // Group selected filter keys back by their parent filter label so
  // we can build pill chips and apply per-filter predicates.
  const selectedByFilter = useMemo(() => {
    const out = new Map<string, string[]>()
    for (const key of filterKeys) {
      const { filter, item } = parseFilterSelectionKey(key)
      if (!out.has(filter)) out.set(filter, [])
      out.get(filter)!.push(item)
    }
    return out
  }, [filterKeys])

  // Apply the active filters. Each predicate short-circuits to `true`
  // when its filter has no selections, so an empty filter set passes
  // every issue through.
  const filteredArchive = useMemo(() => {
    const statuses = selectedByFilter.get("Status") ?? []
    const assignees = selectedByFilter.get("Assignee") ?? []
    const priorities = selectedByFilter.get("Priority") ?? []
    const wantStatuses = new Set(
      statuses.map((s) => STATUS_LABEL_TO_KEY[s]).filter(Boolean)
    )
    const wantPriorities = new Set(
      priorities.map((p) => PRIORITY_LABEL_TO_KEY[p]).filter(Boolean)
    )
    return archivedTeamIssues.filter((issue) => {
      if (wantStatuses.size > 0 && !wantStatuses.has(issue.status)) return false
      if (wantPriorities.size > 0 && !wantPriorities.has(issue.priority))
        return false
      if (assignees.length > 0) {
        const wantNoAssignee = assignees.includes("No assignee")
        if (!issue.assigneeId && !wantNoAssignee) return false
        // Other assignee names aren't resolvable to an id without
        // members data; this branch is intentionally permissive so
        // the popover stays usable.
      }
      return true
    })
  }, [archivedTeamIssues, selectedByFilter])

  const count = activeTab === "issues" ? filteredArchive.length : 0
  const filterPills = useMemo(
    () => Array.from(selectedByFilter.entries()),
    [selectedByFilter]
  )
  const removeFilter = (filterLabel: string) => {
    setFilterKeys((prev) => {
      const next = new Set(prev)
      for (const key of prev) {
        if (parseFilterSelectionKey(key).filter === filterLabel)
          next.delete(key)
      }
      return next
    })
  }

  const showFilter = activeTab === "issues" || activeTab === "deleted-issues"

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header — title with a faint count beside it. */}
      <header className="flex items-center justify-between px-6 py-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-medium" data-testid="archive-title">
            {TAB_TITLE[activeTab]}
          </h1>
          <span
            className="text-muted-foreground/70 text-xs tabular-nums"
            data-testid="archive-count"
          >
            {count}
          </span>
        </div>
      </header>

      {/* Tab pills + filter button row. */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3">
        <div
          role="tablist"
          aria-label="Archive section"
          data-testid="archive-tabs"
          className="flex flex-wrap items-center gap-2"
        >
          {ARCHIVE_TABS.map((tab) => {
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                data-testid={`archive-tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-accent text-foreground ring-border ring-1"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground ring-border/60 ring-1"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        {/* Filter only makes sense on the issue lists — Issues and
            Recently deleted issues. The other tabs are project /
            cycle / document scopes that don't have an issue filter
            popover wired up, so the icon is hidden there. */}
        {showFilter && (
          <CircularIconToolbarRoot>
            <FilterPopover
              options={ARCHIVE_FILTER_OPTIONS}
              aiSuggestions={ARCHIVE_AI_SUGGESTIONS}
              countNoun="issue"
              selectedKeys={filterKeys}
              onSelectedKeysChange={setFilterKeys}
              triggerRender={
                <button
                  type="button"
                  aria-label="Filter"
                  data-testid="archive-filter"
                  className="bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 data-[popup-open]:text-foreground flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <FilterSortIcon />
                </button>
              }
            />
          </CircularIconToolbarRoot>
        )}
      </div>

      {/* Active filter chips — only render when the user has actually
          chosen something. Each chip removes its whole filter group on
          click; a "+ Add filter" trigger reopens the same popover so
          users can stack more options without going back to the
          toolbar icon. */}
      {showFilter && filterPills.length > 0 && (
        <div
          data-testid="archive-filter-pillbar"
          className="flex flex-wrap items-center gap-1.5 px-4 pb-3"
        >
          {filterPills.map(([filter, items]) => (
            <div
              key={filter}
              data-testid={`archive-filter-pill-${filter
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="bg-muted text-foreground flex items-stretch overflow-hidden rounded text-xs"
            >
              <span className="text-muted-foreground px-2 py-1">{filter}</span>
              <span className="border-border/60 text-muted-foreground border-x px-2 py-1">
                is
              </span>
              <span className="max-w-[140px] truncate px-2 py-1">
                {items.length === 1
                  ? items[0]
                  : `${items[0]} +${items.length - 1}`}
              </span>
              <button
                type="button"
                aria-label={`Remove ${filter} filter`}
                onClick={() => removeFilter(filter)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground border-border/60 flex items-center justify-center border-l px-1.5 transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </div>
          ))}
          <FilterPopover
            options={ARCHIVE_FILTER_OPTIONS}
            aiSuggestions={ARCHIVE_AI_SUGGESTIONS}
            countNoun="issue"
            selectedKeys={filterKeys}
            onSelectedKeysChange={setFilterKeys}
            triggerRender={
              <button
                type="button"
                aria-label="Add filter"
                data-testid="archive-filter-pill-add"
                className="bg-muted text-muted-foreground hover:text-foreground flex size-6 items-center justify-center rounded transition-colors"
              >
                <span aria-hidden="true" className="text-sm leading-none">
                  +
                </span>
              </button>
            }
          />
        </div>
      )}

      {/* Empty state — centered stack icon + copy. */}
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4"
        data-testid="archive-empty-state"
      >
        <div className="border-border/60 flex size-16 items-center justify-center rounded-md border border-dashed">
          <HugeiconsIcon
            icon={Layers01Icon}
            className="text-muted-foreground/70 size-7"
          />
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          {TAB_EMPTY_COPY[activeTab]}
        </p>
      </div>
    </div>
  )
}
