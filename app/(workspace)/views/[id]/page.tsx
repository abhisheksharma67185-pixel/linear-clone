"use client"

/**
 * View detail route — `/views/[id]`.
 *
 * Renders a saved view as a fully-interactive issue list, matching the
 * layout of the team-issues page (compact breadcrumb header + circular
 * toolbar + status-grouped collapsible sections + per-issue rows). The
 * earlier rendition of this route used a stripped-down `Badge`-based
 * row layout that didn't match the rest of the app and gave the view
 * detail page a "demo screen" feel — this version brings it in line so
 * a view click feels like opening any other issue list in Linear.
 *
 * The data layer (filterIssuesForView + grouping) is unchanged; only
 * the presentation is refreshed.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import type {
  View,
  Issue,
  Member,
  Team,
  Cycle,
  Label,
  Project,
} from "@/app/lib/mock-data"
import { filterIssuesForView } from "@/lib/view-filter"
import { toggleFavorite, useIsFavorite } from "@/lib/view-favorites"
import { cn } from "@/lib/utils"
import { CURRENT_USER_ID } from "@/app/lib/current-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { InvitePeopleDialog } from "@/components/invite-people-dialog"
import { CreateTeamDialog } from "@/components/create-team-dialog"
import { OPEN_HELP_EVENT } from "@/components/help-popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  FilterPopover,
  type FilterOption,
  type FilterSelection,
  parseFilterSelectionKey,
} from "@/components/filter-popover"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PanelRightIcon,
  MoreHorizontalIcon,
  ArrowDown01Icon,
  UserIcon,
  ArrowRight01Icon,
  UserCircleIcon,
  Calendar03Icon,
  CubeIcon,
  TaskEdit01Icon,
  Tag01Icon,
  CopyIcon,
  Link01Icon,
  GitBranchIcon,
  AiContentGenerator02Icon,
  NotificationOff03Icon,
  Notification02Icon,
  PlayCircleIcon,
  FileExportIcon,
  Sun01Icon,
  Layers01Icon,
  UserAdd01Icon,
  UserGroupIcon,
  MessageQuestionIcon,
  Comment01Icon,
  Book01Icon,
  CodeSquareIcon,
  AlertCircleIcon,
  DashboardSpeed02Icon,
  KeyboardIcon,
  Building02Icon,
  Logout01Icon,
  StatusIcon as StatusFilterIcon,
  Chart01Icon,
  LabelIcon,
  Flag03Icon,
  MagicWand01Icon,
  Settings01Icon,
  Target02Icon,
  Notification01Icon,
  CancelCircleIcon,
  TextFontIcon,
  Link04Icon,
  FileEditIcon,
  BotIcon,
  PencilEdit01Icon,
  SlackIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

type IssueStatus = Issue["status"]
type IssuePriority = Issue["priority"]

const PRIORITY_OPTIONS: { value: IssuePriority; label: string }[] = [
  { value: "none", label: "No priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const STATUS_ORDER: IssueStatus[] = [
  "in_progress",
  "todo",
  "backlog",
  "done",
  "cancelled",
]

const STATUS_LABEL: Record<IssueStatus, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Done",
  cancelled: "Canceled",
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// One row inside the Display options popover. The label hugs the
// left edge with `flex-1` and the control sits flush right — same
// layout Linear uses for every row in its Display panel.
function DisplayRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      {children}
    </div>
  )
}

// Pill chips rendered at the bottom of the Display popover. The
// `value` strings line up with the `DisplayProperty` union, and
// the order matches Linear's row.
const DISPLAY_PROPERTY_OPTIONS: {
  value:
    | "id"
    | "status"
    | "assignee"
    | "priority"
    | "project"
    | "due_date"
    | "milestone"
    | "labels"
    | "links"
    | "time_in_status"
    | "created"
    | "updated"
  label: string
}[] = [
  { value: "id", label: "ID" },
  { value: "status", label: "Status" },
  { value: "assignee", label: "Assignee" },
  { value: "priority", label: "Priority" },
  { value: "project", label: "Project" },
  { value: "due_date", label: "Due date" },
  { value: "milestone", label: "Milestone" },
  { value: "labels", label: "Labels" },
  { value: "links", label: "Links" },
  { value: "time_in_status", label: "Time in status" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
]

export default function ViewDetailPage() {
  const params = useParams<{ id: string }>()
  const viewId = params.id
  const router = useRouter()

  const [views, setViews] = useState<View[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  // Favorite state is sourced from `lib/view-favorites` so toggling
  // here syncs with the workspace sidebar's Favorites section and
  // persists across reloads. Local-state `useState(false)` was
  // strictly visual and dropped the favorite on every navigation.
  const favoriteKey = `view:${viewId}`
  const favorited = useIsFavorite(favoriteKey)
  const [panelOpen, setPanelOpen] = useState(false)

  // Subscribe mode for the view (Notification level the current
  // user has on this saved view). Local-only — there's no view-
  // subscriptions endpoint yet, but the UI tracks the choice so
  // the checkmark in the dropdown reflects the user's selection.
  const [subscribeMode, setSubscribeMode] = useState<
    "all" | "important" | "none"
  >("all")

  // Multi-select state. A Set keeps add/remove O(1) and lets the
  // floating action bar at the bottom render `selected.size selected`
  // without recomputing. `selectionMode` is true the moment any row
  // is selected — it's what causes every other row's checkbox to
  // become persistently visible (instead of hover-only).
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const selectionMode = selected.size > 0
  const toggleSelected = (id: string, next: boolean) => {
    setSelected((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }
  const clearSelection = () => setSelected(new Set())

  // "Create issue" dialog. The per-status `+` button on each group
  // header opens this with `defaultStatus` pre-selected, so a user
  // adding to "In Progress" lands directly in the right column.
  const [createOpen, setCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<IssueStatus>("todo")
  const openCreate = (status: IssueStatus) => {
    setCreateStatus(status)
    setCreateOpen(true)
  }

  // Floating selection-bar "Actions" menu — Linear-style command
  // palette scoped to the currently-selected issue(s).
  const [actionsOpen, setActionsOpen] = useState(false)

  // Display-options popover state. Mirrors Linear's "Display"
  // panel: layout (List/Board), grouping / sub-grouping / ordering
  // selectors, the recency / sub-issue toggles, and the trailing
  // "Display properties" pill row. Wired through to the issue
  // list where it has a meaningful effect:
  //   - `grouping="none"` flattens the per-status groups into a
  //     single list,
  //   - `showEmptyGroups=false` hides 0-item status groups,
  //   - `displayProperties` toggles which column slots render in
  //     each issue row.
  // The remaining controls store user state but are intentionally
  // visual-only for now (Board mode, sub-grouping, ordering, the
  // recency / sub-issue toggles) — they're rendered for layout
  // fidelity with Linear's Display panel.
  type DisplayGrouping =
    | "status"
    | "priority"
    | "assignee"
    | "project"
    | "labels"
    | "none"
  type DisplayOrdering =
    | "priority"
    | "manual"
    | "title"
    | "created"
    | "updated"
    | "due_date"
  type DisplayCompleted = "all" | "active" | "none"
  type DisplayProperty =
    | "id"
    | "status"
    | "assignee"
    | "priority"
    | "project"
    | "due_date"
    | "milestone"
    | "labels"
    | "links"
    | "time_in_status"
    | "created"
    | "updated"

  const [displayLayout, setDisplayLayout] = useState<"list" | "board">("list")
  const [grouping, setGrouping] = useState<DisplayGrouping>("status")
  const [subGrouping, setSubGrouping] = useState<DisplayGrouping>("none")
  const [ordering, setOrdering] = useState<DisplayOrdering>("priority")
  const [orderingDirection, setOrderingDirection] = useState<"asc" | "desc">(
    "desc"
  )
  const [orderCompletedByRecency, setOrderCompletedByRecency] = useState(false)
  const [completedIssues, setCompletedIssues] =
    useState<DisplayCompleted>("all")
  const [showSubIssues, setShowSubIssues] = useState(true)
  const [nestedSubIssues, setNestedSubIssues] = useState(false)
  const [showEmptyGroups, setShowEmptyGroups] = useState(true)
  const [displayProperties, setDisplayProperties] = useState<
    Set<DisplayProperty>
  >(
    () =>
      new Set<DisplayProperty>([
        "id",
        "status",
        "assignee",
        "priority",
        "project",
        "due_date",
        "labels",
        "created",
      ])
  )
  const toggleDisplayProperty = (p: DisplayProperty) =>
    setDisplayProperties((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  // Ad-hoc filter state — layered on top of the saved view's
  // filters. Each Set holds the values the user has *opted in to*;
  // an empty Set means "no constraint on this dimension". Status /
  // priority use the issue field directly; assignee uses the
  // member id with a magic `__unassigned__` sentinel for issues
  // that have no assignee, so users can filter to the unassigned
  // bucket without inventing a separate piece of state.
  const UNASSIGNED = "__unassigned__"

  // Filter popover selection — owned here so the chip count badge,
  // empty-state Clear button, and the filter logic in `displayed`
  // can all read the same source of truth. Keys follow the
  // FilterPopover convention `${filter}::${item}` (see
  // `filterSelectionKey`); we parse them back into typed Sets in
  // the useMemo below so the filter pipeline stays readable.
  const [selectedKeys, setSelectedKeys] = useState<FilterSelection>(
    () => new Set()
  )
  const resetFilters = () => setSelectedKeys(new Set())

  // Generic optimistic issue updater. Patches local state immediately
  // so the row re-renders, then PUTs the same fields to the API. Used
  // by the bulk Actions palette to wire up status / priority / project
  // / labels / due date / assignee / subscriber mutations on the
  // currently-selected issues.
  const mutateIssue = (id: string, fields: Partial<Issue>) => {
    setIssues((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...fields } : it))
    )
    const target = issues.find((it) => it.id === id)
    if (!target) return
    fetch(`/api/data/issues/${target.identifier}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(fields),
    }).catch(() => {})
  }

  const updateIssuePriority = (id: string, priority: IssuePriority) => {
    mutateIssue(id, { priority })
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ]).then(([v, i, m, t, c, l, p]) => {
      setViews(v)
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setCycles(c)
      setLabels(Array.isArray(l) ? l : [])
      setProjects(Array.isArray(p) ? p : [])
      setLoading(false)
    })
  }, [])

  const view = views.find((v) => v.id === viewId) ?? null
  const team = useMemo(
    () => (view ? teams.find((t) => t.id === view.teamId) : null),
    [view, teams]
  )

  const filtered = useMemo(() => {
    if (!view) return []
    return filterIssuesForView(view, issues, { labels, cycles })
  }, [view, issues, labels, cycles])

  // Translate the FilterPopover's flat `${dimension}::${item}` keys
  // into the typed Sets the rest of the page filters with. Done as a
  // pure derivation of `selectedKeys` + `members` so toggling a row
  // in the popover instantly updates the issue list — no effect plumbing.
  const {
    filterStatuses,
    filterPriorities,
    filterAssignees,
    filterLabels,
    filterProjects,
    activeFilterCount,
  } = useMemo(() => {
    const statuses = new Set<IssueStatus>()
    const priorities = new Set<IssuePriority>()
    const assignees = new Set<string>()
    const labelIds = new Set<string>()
    const projectIds = new Set<string>()
    const statusByLabel: Record<string, IssueStatus> = {
      Backlog: "backlog",
      Todo: "todo",
      "In Progress": "in_progress",
      Done: "done",
      Cancelled: "cancelled",
    }
    const priorityByLabel: Record<string, IssuePriority> = {
      Urgent: "urgent",
      High: "high",
      Medium: "medium",
      Low: "low",
      "No priority": "none",
    }
    for (const key of selectedKeys) {
      const { filter, item } = parseFilterSelectionKey(key)
      if (filter === "Status") {
        const v = statusByLabel[item]
        if (v) statuses.add(v)
      } else if (filter === "Priority") {
        const v = priorityByLabel[item]
        if (v) priorities.add(v)
      } else if (filter === "Assignee") {
        if (item === "No assignee") {
          assignees.add(UNASSIGNED)
        } else {
          const m = members.find((mem) => mem.name === item)
          if (m) assignees.add(m.id)
        }
      } else if (filter === "Labels") {
        const l = labels.find((lab) => lab.name === item)
        if (l) labelIds.add(l.id)
      } else if (filter === "Project") {
        const p = projects.find((pr) => pr.name === item)
        if (p) projectIds.add(p.id)
      }
    }
    return {
      filterStatuses: statuses,
      filterPriorities: priorities,
      filterAssignees: assignees,
      filterLabels: labelIds,
      filterProjects: projectIds,
      activeFilterCount:
        statuses.size +
        priorities.size +
        assignees.size +
        labelIds.size +
        projectIds.size,
    }
  }, [selectedKeys, members, labels, projects])

  // `displayed` is `filtered` with the toolbar's ad-hoc filters
  // applied on top. We keep `filtered` as the "selection scope"
  // (so a user's existing selection survives toggling filters) but
  // route the on-screen list, the issue count, and the empty-state
  // check through `displayed`.
  const displayed = useMemo(() => {
    if (activeFilterCount === 0) return filtered
    return filtered.filter((i) => {
      if (filterStatuses.size > 0 && !filterStatuses.has(i.status)) return false
      if (filterPriorities.size > 0 && !filterPriorities.has(i.priority))
        return false
      if (filterAssignees.size > 0) {
        const key = i.assigneeId ?? UNASSIGNED
        if (!filterAssignees.has(key)) return false
      }
      if (filterLabels.size > 0) {
        const ids = Array.isArray(i.labelIds) ? i.labelIds : []
        if (!ids.some((l) => filterLabels.has(l))) return false
      }
      if (filterProjects.size > 0) {
        if (!i.projectId || !filterProjects.has(i.projectId)) return false
      }
      return true
    })
  }, [
    filtered,
    activeFilterCount,
    filterStatuses,
    filterPriorities,
    filterAssignees,
    filterLabels,
    filterProjects,
  ])

  // Build the FilterPopover's options off the live workspace data so
  // the Assignee / Labels / Project / Subscribers submenus reflect
  // who's actually in the workspace (not a hardcoded "Abhishek" row).
  const filterOptions: FilterOption[] = useMemo(() => {
    return [
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
        submenu: [
          { label: "No assignee" },
          ...members.map((m) => ({ label: m.name })),
        ],
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
        submenu: members.map((m) => ({ label: m.name })),
      },
      {
        label: "Priority",
        icon: Chart01Icon,
        kind: "checkbox",
        submenu: [
          { label: "Urgent", icon: <PriorityIcon priority="urgent" /> },
          { label: "High", icon: <PriorityIcon priority="high" /> },
          { label: "Medium", icon: <PriorityIcon priority="medium" /> },
          { label: "Low", icon: <PriorityIcon priority="low" /> },
          { label: "No priority", icon: <PriorityIcon priority="none" /> },
        ],
      },
      {
        label: "Labels",
        icon: LabelIcon,
        kind: "checkbox",
        submenu: labels.map((l) => ({
          label: l.name,
          icon: (
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ backgroundColor: l.color }}
            />
          ),
        })),
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
            label: "Started date",
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
        submenu: projects.map((p) => ({ label: p.name })),
        groupBreakBefore: true,
      },
      {
        label: "Project properties",
        icon: Settings01Icon,
        kind: "nested",
        submenu: [
          {
            label: "Project status",
            icon: (
              <HugeiconsIcon icon={StatusFilterIcon} className="size-3.5" />
            ),
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
        submenu: members.map((m) => ({ label: m.name })),
        groupBreakBefore: true,
      },
      {
        label: "Auto-closed",
        icon: CancelCircleIcon,
        kind: "click",
        submenu: [
          {
            label: "Auto-closed",
            icon: (
              <HugeiconsIcon icon={CancelCircleIcon} className="size-3.5" />
            ),
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
  }, [members, labels, projects])

  const grouped = useMemo(() => {
    const map = new Map<IssueStatus, Issue[]>()
    for (const status of STATUS_ORDER) map.set(status, [])
    for (const issue of displayed) {
      map.get(issue.status)?.push(issue)
    }
    return map
  }, [displayed])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (!view) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 py-24 text-sm">
        <p>View not found.</p>
        <Link href="/views" className="text-xs underline">
          Back to views
        </Link>
      </div>
    )
  }

  return (
    <TooltipProvider>
      {/* Outer flex-row: the existing flex-col stays the main work
          surface, and the optional right-side panel sits next to it
          as a sibling. Using a flex sibling rather than an overlay
          means opening the panel pushes the issue list narrower —
          which matches Linear's behaviour and keeps both regions
          fully clickable at the same time. */}
      <div className="flex h-full min-h-0">
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {/* Compact breadcrumb header — team chip › view chip + favorite + ⋯ */}
          <header className="flex items-center justify-between gap-3 px-6 py-2.5">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-pink-500/15 text-pink-500">
                <HugeiconsIcon icon={UserIcon} className="size-3" />
              </span>
              <span className="truncate font-medium">
                {team?.name ?? "Workspace"}
              </span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="text-muted-foreground/60 size-3 shrink-0"
              />
              <ViewBreadcrumbIcon className="size-3.5 shrink-0 text-pink-500" />
              <span className="truncate font-medium">{view.name}</span>
              <button
                type="button"
                aria-label={
                  favorited ? "Remove from favorites" : "Add to favorites"
                }
                aria-pressed={favorited}
                onClick={() =>
                  view &&
                  toggleFavorite({
                    key: favoriteKey,
                    label: view.name,
                    href: `/views/${view.id}`,
                    icon: "view",
                  })
                }
                data-testid="view-favorite-toggle"
                className="text-muted-foreground hover:text-foreground ml-1 flex size-5 shrink-0 items-center justify-center rounded"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className={`size-3.5 ${favorited ? "fill-amber-400 text-amber-400" : "fill-none"}`}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                >
                  <path d="M8 2 L9.8 6 L14 6.5 L10.8 9.4 L11.7 13.6 L8 11.4 L4.3 13.6 L5.2 9.4 L2 6.5 L6.2 6 Z" />
                </svg>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="More options"
                  data-testid="view-more-menu-trigger"
                  className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center rounded"
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    className="size-3.5"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-72"
                  data-testid="view-more-menu"
                >
                  {/* Edit / Duplicate / Move to — view-level write
                    actions. The destinations sub-menu uses the
                    workspace's teams as targets, the same way
                    Linear's "Move to" does. */}
                  <DropdownMenuItem
                    className="gap-2"
                    data-testid="view-menu-edit"
                    onClick={() => {
                      // Lightweight rename: a native prompt is enough
                      // to give the action real behaviour without
                      // adding a dialog component just for one field.
                      if (typeof window === "undefined" || !view) return
                      const next = window.prompt("Rename view", view.name)
                      if (next === null) return
                      const trimmed = next.trim()
                      if (trimmed === "" || trimmed === view.name) return
                      // Optimistic local update first so the header
                      // reflects the rename immediately, then PUT.
                      setViews((prev) =>
                        prev.map((v) =>
                          v.id === view.id ? { ...v, name: trimmed } : v
                        )
                      )
                      fetch(`/api/data/views/${view.id}`, {
                        method: "PUT",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ name: trimmed }),
                      }).catch(() => {})
                    }}
                  >
                    <HugeiconsIcon
                      icon={PencilEdit01Icon}
                      className="size-4 opacity-70"
                    />
                    <span>Edit…</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    data-testid="view-menu-duplicate"
                    onClick={() => {
                      if (!view) return
                      // POST a copy with a " (Copy)" suffix and route
                      // to the new view on success. Server validates
                      // the body so we just forward the same fields.
                      fetch("/api/data/views", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          name: `${view.name} (Copy)`,
                          description: view.description,
                          filterQuery: view.filterQuery,
                          teamId: view.teamId,
                          ownerId: view.ownerId,
                        }),
                      })
                        .then((r) => (r.ok ? r.json() : null))
                        .then((created: View | null) => {
                          if (created?.id) router.push(`/views/${created.id}`)
                        })
                        .catch(() => {})
                    }}
                  >
                    <HugeiconsIcon
                      icon={CopyIcon}
                      className="size-4 opacity-70"
                    />
                    <span>Duplicate…</span>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="gap-2"
                      data-testid="view-menu-move-to"
                    >
                      <HugeiconsIcon
                        icon={UserGroupIcon}
                        className="size-4 opacity-70"
                      />
                      <span>Move to</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      {teams.length === 0 ? (
                        <DropdownMenuItem
                          disabled
                          className="text-muted-foreground"
                        >
                          No teams available
                        </DropdownMenuItem>
                      ) : (
                        teams.map((t) => {
                          const current = view?.teamId === t.id
                          return (
                            <DropdownMenuItem
                              key={t.id}
                              className="gap-2"
                              data-testid={`view-menu-move-${t.id}`}
                              onClick={() => {
                                if (!view || current) return
                                // Optimistic local update — flip the
                                // teamId on the in-memory view so the
                                // breadcrumb / right-panel reflect the
                                // move immediately.
                                setViews((prev) =>
                                  prev.map((v) =>
                                    v.id === view.id
                                      ? { ...v, teamId: t.id }
                                      : v
                                  )
                                )
                                fetch(`/api/data/views/${view.id}`, {
                                  method: "PUT",
                                  headers: {
                                    "content-type": "application/json",
                                  },
                                  body: JSON.stringify({ teamId: t.id }),
                                }).catch(() => {})
                              }}
                            >
                              <span className="flex size-4 shrink-0 items-center justify-center rounded bg-pink-500/15 text-[10px] font-semibold text-pink-500">
                                {t.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="flex-1 truncate">{t.name}</span>
                              {current && (
                                <span className="text-muted-foreground text-[10px]">
                                  ✓
                                </span>
                              )}
                            </DropdownMenuItem>
                          )
                        })
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  {/* Subscribe / Slack — same notification cluster
                    Linear groups together. The Subscribe submenu
                    intentionally reuses the in-state model the
                    floating actions palette uses for issues; here
                    it's a UI-only toggle since views don't have
                    a backing subscription endpoint yet. */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="gap-2"
                      data-testid="view-menu-subscribe"
                    >
                      <HugeiconsIcon
                        icon={Notification01Icon}
                        className="size-4 opacity-70"
                      />
                      <span>Subscribe</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      {(
                        [
                          { value: "all", label: "All activity" },
                          { value: "important", label: "Important activity" },
                          { value: "none", label: "None" },
                        ] as const
                      ).map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          className="gap-2"
                          data-testid={`view-menu-subscribe-${opt.value}`}
                          onClick={() => setSubscribeMode(opt.value)}
                        >
                          <span className="flex-1">{opt.label}</span>
                          {subscribeMode === opt.value && (
                            <span className="text-muted-foreground text-[10px]">
                              ✓
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    className="gap-2"
                    render={<Link href="/settings?section=integrations" />}
                    data-testid="view-menu-slack"
                  >
                    <HugeiconsIcon
                      icon={SlackIcon}
                      className="size-4 opacity-70"
                    />
                    <span className="flex-1">
                      Configure custom view Slack notifications…
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Copy link / Export — read-only utilities. Both
                    are wired to real implementations: clipboard
                    write for the URL and a CSV download for the
                    currently-displayed slice. */}
                  <DropdownMenuItem
                    className="gap-2"
                    data-testid="view-menu-copy-link"
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        typeof navigator !== "undefined" &&
                        navigator.clipboard
                      ) {
                        navigator.clipboard
                          .writeText(window.location.href)
                          .catch(() => {})
                      }
                    }}
                  >
                    <HugeiconsIcon
                      icon={Link01Icon}
                      className="size-4 opacity-70"
                    />
                    <span>Copy link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    data-testid="view-menu-export"
                    onClick={() => {
                      // Build a CSV off the *displayed* slice so the
                      // export reflects whatever filters/grouping the
                      // user currently has active. Reuses the
                      // module-level `csvEscape` / `downloadFile`
                      // helpers shared with the Actions palette.
                      const memberById = new Map(members.map((m) => [m.id, m]))
                      const projectById = new Map(
                        projects.map((p) => [p.id, p])
                      )
                      const labelById = new Map(labels.map((l) => [l.id, l]))
                      const teamById = new Map(teams.map((t) => [t.id, t]))
                      const header = [
                        "ID",
                        "Title",
                        "Status",
                        "Priority",
                        "Assignee",
                        "Team",
                        "Project",
                        "Labels",
                        "Due date",
                        "Created",
                        "Updated",
                      ].join(",")
                      const rows = displayed.map((i) =>
                        [
                          csvEscape(i.identifier),
                          csvEscape(i.title),
                          csvEscape(i.status),
                          csvEscape(i.priority),
                          csvEscape(
                            i.assigneeId
                              ? (memberById.get(i.assigneeId)?.name ?? "")
                              : ""
                          ),
                          csvEscape(teamById.get(i.teamId)?.name ?? ""),
                          csvEscape(
                            i.projectId
                              ? (projectById.get(i.projectId)?.name ?? "")
                              : ""
                          ),
                          csvEscape(
                            (Array.isArray(i.labelIds) ? i.labelIds : [])
                              .map((id) => labelById.get(id)?.name)
                              .filter(Boolean)
                              .join("; ")
                          ),
                          csvEscape(i.dueDate ?? ""),
                          csvEscape(i.createdAt ?? ""),
                          csvEscape(i.updatedAt ?? ""),
                        ].join(",")
                      )
                      downloadFile(
                        `${view.name.replace(/[^a-z0-9_-]+/gi, "_") || "view"}.csv`,
                        [header, ...rows].join("\n"),
                        "text/csv"
                      )
                    }}
                  >
                    <HugeiconsIcon
                      icon={FileExportIcon}
                      className="size-4 opacity-70"
                    />
                    <span>Export issues as CSV…</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-destructive gap-2"
                    data-testid="view-menu-delete"
                    onClick={() => {
                      if (!view) return
                      if (
                        typeof window !== "undefined" &&
                        !window.confirm(
                          `Delete "${view.name}"? This cannot be undone.`
                        )
                      )
                        return
                      // Navigate away first so the user isn't left
                      // staring at a "View not found" state during the
                      // brief window the DELETE is in flight; the
                      // /views index re-fetches the list on mount.
                      router.push("/views")
                      fetch(`/api/data/views/${view.id}`, {
                        method: "DELETE",
                      }).catch(() => {})
                    }}
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      className="size-4 opacity-70"
                    />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Toolbar — issue count on the left, circular icon controls on the right */}
          <div className="flex items-center justify-between border-b px-6 py-2">
            <span
              data-testid="view-issue-count"
              className="text-muted-foreground text-xs"
            >
              {displayed.length} {displayed.length === 1 ? "issue" : "issues"}
              {activeFilterCount > 0 && filtered.length !== displayed.length
                ? ` of ${filtered.length}`
                : ""}
            </span>
            <div className="flex items-center gap-1.5">
              <FilterPopover
                options={filterOptions}
                countNoun="issue"
                selectedKeys={selectedKeys}
                onSelectedKeysChange={setSelectedKeys}
                triggerRender={
                  <button
                    type="button"
                    aria-label="Filter results"
                    className={cn(
                      "bg-muted hover:text-foreground relative flex size-7 items-center justify-center rounded-full transition-colors",
                      activeFilterCount > 0
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.25 3a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Zm2.75 3.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
                      />
                    </svg>
                    {activeFilterCount > 0 && (
                      <span
                        aria-hidden="true"
                        className="ring-background absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-pink-500 text-[9px] leading-none font-semibold text-white ring-2"
                      >
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                }
              />
              <Popover>
                <PopoverTrigger
                  aria-label="Display options"
                  className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7 2.5C8.11933 2.5 9.06613 3.23584 9.38477 4.25H14.75C15.1642 4.25 15.5 4.58579 15.5 5C15.5 5.41421 15.1642 5.75 14.75 5.75H9.38477C9.06613 6.76416 8.11933 7.5 7 7.5C5.88067 7.5 4.93387 6.76416 4.61523 5.75H2.25C1.83579 5.75 1.5 5.41421 1.5 5C1.5 4.58579 1.83579 4.25 2.25 4.25H4.61523C4.93387 3.23584 5.88067 2.5 7 2.5ZM7 4C6.44772 4 6 4.44772 6 5C6 5.55228 6.44772 6 7 6C7.55228 6 8 5.55228 8 5C8 4.44772 7.55228 4 7 4Z"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 13.5C8.88067 13.5 7.93387 12.7642 7.61523 11.75H2.25C1.83579 11.75 1.5 11.4142 1.5 11C1.5 10.5858 1.83579 10.25 2.25 10.25H7.61523C7.93387 9.23584 8.88067 8.5 10 8.5C11.1193 8.5 12.0661 9.23584 12.3848 10.25H14.75C15.1642 10.25 15.5 10.5858 15.5 11C15.5 11.4142 15.1642 11.75 14.75 11.75H12.3848C12.0661 12.7642 11.1193 13.5 10 13.5ZM10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12Z"
                    />
                  </svg>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={6}
                  className="w-72 gap-0 p-0"
                >
                  {/* Top section — layout tabs + grouping / sub /
                    ordering / completed-recency. Each control is a
                    label-on-the-left + control-on-the-right row, the
                    same shape Linear uses in its Display panel. */}
                  <div className="flex flex-col gap-3 p-3">
                    <Tabs
                      value={displayLayout}
                      onValueChange={(v) =>
                        setDisplayLayout(v as "list" | "board")
                      }
                    >
                      <TabsList className="w-full">
                        <TabsTrigger value="list">
                          <HugeiconsIcon
                            icon={TextFontIcon}
                            className="size-3.5"
                          />
                          List
                        </TabsTrigger>
                        <TabsTrigger value="board">
                          <HugeiconsIcon
                            icon={Layers01Icon}
                            className="size-3.5"
                          />
                          Board
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {/* In board mode the primary axis is "Columns"
                      and the secondary axis is "Rows" — same data,
                      different framing. We mirror Linear's wording
                      here so the panel reads correctly per layout. */}
                    <DisplayRow
                      label={displayLayout === "board" ? "Columns" : "Grouping"}
                    >
                      <Select
                        value={grouping}
                        onValueChange={(v) => setGrouping(v as DisplayGrouping)}
                      >
                        <SelectTrigger size="sm" className="min-w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="assignee">Assignee</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="labels">Labels</SelectItem>
                          {displayLayout !== "board" && (
                            <SelectItem value="none">No grouping</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </DisplayRow>

                    <DisplayRow
                      label={
                        displayLayout === "board" ? "Rows" : "Sub-grouping"
                      }
                    >
                      <Select
                        value={subGrouping}
                        onValueChange={(v) =>
                          setSubGrouping(v as DisplayGrouping)
                        }
                      >
                        <SelectTrigger size="sm" className="min-w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="none">No grouping</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="assignee">Assignee</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </DisplayRow>

                    <DisplayRow label="Ordering">
                      <div className="flex items-center gap-1">
                        <Select
                          value={ordering}
                          onValueChange={(v) =>
                            setOrdering(v as DisplayOrdering)
                          }
                        >
                          <SelectTrigger size="sm" className="min-w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="updated">Updated</SelectItem>
                            <SelectItem value="due_date">Due date</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          aria-label={
                            orderingDirection === "asc"
                              ? "Sort ascending"
                              : "Sort descending"
                          }
                          onClick={() =>
                            setOrderingDirection((d) =>
                              d === "asc" ? "desc" : "asc"
                            )
                          }
                          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded transition-colors"
                        >
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={cn(
                              "size-3.5 transition-transform",
                              orderingDirection === "asc" && "rotate-180"
                            )}
                          />
                        </button>
                      </div>
                    </DisplayRow>

                    <DisplayRow label="Order completed by recency">
                      <Switch
                        size="sm"
                        checked={orderCompletedByRecency}
                        onCheckedChange={setOrderCompletedByRecency}
                      />
                    </DisplayRow>
                  </div>

                  <div className="border-t" />

                  {/* Middle section — completed/sub-issue scope. */}
                  <div className="flex flex-col gap-3 p-3">
                    <DisplayRow label="Completed issues">
                      <Select
                        value={completedIssues}
                        onValueChange={(v) =>
                          setCompletedIssues(v as DisplayCompleted)
                        }
                      >
                        <SelectTrigger size="sm" className="min-w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </DisplayRow>

                    <DisplayRow label="Show sub-issues">
                      <Switch
                        size="sm"
                        checked={showSubIssues}
                        onCheckedChange={setShowSubIssues}
                      />
                    </DisplayRow>
                  </div>

                  <div className="border-t" />

                  {/* Bottom section — list-mode-only options + the
                    "Display properties" toggle group, presented as
                    pill chips that flip between active/inactive on
                    click (the multi-select toggle group from
                    base-ui handles aria + keyboard). */}
                  <div className="flex flex-col gap-3 p-3">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                      {displayLayout === "board"
                        ? "Board options"
                        : "List options"}
                    </span>
                    {displayLayout !== "board" && (
                      <DisplayRow label="Nested sub-issues">
                        <Switch
                          size="sm"
                          checked={nestedSubIssues}
                          onCheckedChange={setNestedSubIssues}
                        />
                      </DisplayRow>
                    )}
                    <DisplayRow
                      label={
                        displayLayout === "board"
                          ? "Show empty columns"
                          : "Show empty groups"
                      }
                    >
                      <Switch
                        size="sm"
                        checked={showEmptyGroups}
                        onCheckedChange={setShowEmptyGroups}
                      />
                    </DisplayRow>
                    <div className="flex flex-col gap-2">
                      <span className="text-muted-foreground text-xs">
                        Display properties
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {DISPLAY_PROPERTY_OPTIONS.map((p) => {
                          const active = displayProperties.has(p.value)
                          return (
                            <button
                              key={p.value}
                              type="button"
                              aria-pressed={active}
                              onClick={() => toggleDisplayProperty(p.value)}
                              className={cn(
                                "border-input rounded border px-1.5 py-0.5 text-[11px] transition-colors",
                                active
                                  ? "bg-accent text-foreground"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )}
                            >
                              {p.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <button
                type="button"
                aria-label="Toggle right panel"
                aria-pressed={panelOpen}
                onClick={() => setPanelOpen((v) => !v)}
                className={`flex size-7 items-center justify-center rounded-full transition-colors ${
                  panelOpen
                    ? "bg-zinc-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <HugeiconsIcon icon={PanelRightIcon} className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Issue list — status-grouped collapsibles */}
          <div className="min-h-0 flex-1 overflow-auto">
            {displayed.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-24 text-sm">
                <p>
                  {activeFilterCount > 0
                    ? "No issues match the active filters."
                    : "No issues match this view."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-foreground hover:bg-accent rounded border px-2 py-1 text-xs"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : displayLayout === "board" ? (
              // Board layout — kanban-style horizontal columns, one
              // per status. Each column stacks issue cards vertically
              // and the whole strip scrolls horizontally if the
              // viewport is too narrow to fit every column. The
              // "Show empty columns" toggle (`showEmptyGroups`)
              // controls whether 0-item columns render at all.
              <div className="flex h-full gap-3 overflow-x-auto p-3">
                {STATUS_ORDER.map((status) => {
                  const items = grouped.get(status) ?? []
                  if (!showEmptyGroups && items.length === 0) return null
                  return (
                    <div
                      key={status}
                      className="flex h-full w-72 shrink-0 flex-col gap-2"
                    >
                      {/* Column header — status icon + name + count
                        on the left, ⋯ menu and quick-add + on the
                        right. Mirrors Linear's board column chrome. */}
                      <div className="flex items-center gap-2 px-1 text-xs font-medium">
                        <StatusIcon status={status} className="size-3.5" />
                        <span>{STATUS_LABEL[status]}</span>
                        <span className="text-muted-foreground">
                          {items.length}
                        </span>
                        <button
                          type="button"
                          aria-label={`More options for ${STATUS_LABEL[status]}`}
                          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            className="size-3.5"
                          />
                        </button>
                        <button
                          type="button"
                          aria-label={`Add ${STATUS_LABEL[status]} issue`}
                          onClick={() => openCreate(status)}
                          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className="size-3.5"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M8.75 4C8.75 3.58579 8.41421 3.25 8 3.25C7.58579 3.25 7.25 3.58579 7.25 4V7.25H4C3.58579 7.25 3.25 7.58579 3.25 8C3.25 8.41421 3.58579 8.75 4 8.75H7.25V12C7.25 12.4142 7.58579 12.75 8 12.75C8.41421 12.75 8.75 12.4142 8.75 12V8.75H12C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25H8.75V4Z" />
                          </svg>
                        </button>
                      </div>
                      {/* Card stack — vertical column of issue cards
                        with internal scroll if a column overflows. */}
                      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                        {items.map((issue) => (
                          <BoardCard
                            key={issue.id}
                            issue={issue}
                            members={members}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : grouping === "none" ? (
              // "No grouping" — render a flat ungrouped list. The
              // status group headers are skipped entirely and every
              // issue lives in a single <ul>.
              <ul>
                {displayed.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    members={members}
                    selected={selected.has(issue.id)}
                    onSelectedChange={(v) => toggleSelected(issue.id, v)}
                    onUpdatePriority={(p) => updateIssuePriority(issue.id, p)}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col">
                {STATUS_ORDER.map((status) => {
                  const items = grouped.get(status) ?? []
                  // `showEmptyGroups=false` (Display popover toggle)
                  // collapses 0-item status sections out of the
                  // rendered list entirely, matching Linear's
                  // behaviour when "Show empty groups" is off.
                  if (!showEmptyGroups && items.length === 0) return null
                  return (
                    <Collapsible key={status} defaultOpen>
                      <CollapsibleTrigger
                        data-status={status}
                        className="bg-muted/40 hover:bg-muted/60 group flex w-full items-center gap-2 border-b px-6 py-2 text-xs font-medium transition-colors"
                      >
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          className="text-muted-foreground/70 size-3 shrink-0 transition-transform group-data-[state=closed]:-rotate-90"
                        />
                        <StatusIcon status={status} className="size-3.5" />
                        <span>{STATUS_LABEL[status]}</span>
                        <span className="text-muted-foreground">
                          {items.length}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Add ${STATUS_LABEL[status]} issue`}
                          // The wrapping <CollapsibleTrigger> is itself a
                          // <button>; clicking the inner +  must NOT
                          // toggle the group, so we swallow the event and
                          // open the create-issue dialog directly.
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            openCreate(status)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation()
                              e.preventDefault()
                              openCreate(status)
                            }
                          }}
                          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          {/* Linear-style filled plus glyph (matches the
                            "Create new issue" button in Linear's UI) */}
                          <svg
                            viewBox="0 0 16 16"
                            className="size-3.5"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M8.75 4C8.75 3.58579 8.41421 3.25 8 3.25C7.58579 3.25 7.25 3.58579 7.25 4V7.25H4C3.58579 7.25 3.25 7.58579 3.25 8C3.25 8.41421 3.58579 8.75 4 8.75H7.25V12C7.25 12.4142 7.58579 12.75 8 12.75C8.41421 12.75 8.75 12.4142 8.75 12V8.75H12C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25H8.75V4Z" />
                          </svg>
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul>
                          {items.map((issue) => (
                            <IssueRow
                              key={issue.id}
                              issue={issue}
                              members={members}
                              selected={selected.has(issue.id)}
                              onSelectedChange={(v) =>
                                toggleSelected(issue.id, v)
                              }
                              onUpdatePriority={(p) =>
                                updateIssuePriority(issue.id, p)
                              }
                            />
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </div>

          {/* Floating selection action bar — Linear-style pill that
            appears at the bottom of the viewport whenever ≥1 row is
            checked. Mirrors Linear's behaviour: shows the count, an
            ✕ to clear selection, and a primary "Actions" affordance.
            The Actions menu itself isn't wired to anything yet — this
            is purely a visual selection bar. */}
          {selectionMode && (
            <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
              <div className="bg-popover text-popover-foreground pointer-events-auto flex items-center gap-1 rounded-full border p-1 pl-4 text-xs shadow-lg">
                <span className="pr-2 font-medium">
                  {selected.size} selected
                </span>
                <button
                  type="button"
                  aria-label="Clear selection"
                  onClick={clearSelection}
                  className="hover:bg-accent flex size-7 items-center justify-center rounded-full"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActionsOpen(true)}
                  aria-haspopup="menu"
                  aria-expanded={actionsOpen}
                  className="hover:bg-accent flex h-7 items-center gap-1.5 rounded-full px-3 font-medium"
                >
                  <span className="text-muted-foreground font-mono text-[10px]">
                    ⌘
                  </span>
                  Actions
                </button>
              </div>
            </div>
          )}

          {/* Bulk-actions command palette — opened from the floating
            selection bar's "Actions" button. Most items are
            placeholders that just close the dialog (the bulk
            mutation flows aren't wired yet); the only fully-working
            action is "Copy issue ID" which copies the selected
            identifiers to the clipboard. The chip at the top mirrors
            Linear's UI, showing the single selected issue or a count. */}
          <ActionsCommand
            open={actionsOpen}
            onOpenChange={setActionsOpen}
            selectedIssues={filtered.filter((i) => selected.has(i.id))}
            allIssues={issues}
            members={members}
            projects={projects}
            labels={labels}
            teams={teams}
            onMutateIssue={mutateIssue}
          />

          {/* Create-issue dialog — opened by the per-status `+` button
            on each group header. `defaultStatus` lands the form in
            the column the user clicked from, and `defaultTeamId`
            scopes it to the view's team when the view is team-scoped. */}
          <CreateIssueDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreated={(created) => {
              // Merge the new issue into local state so it appears in
              // its status group right away. If the API didn't echo a
              // body for some reason, fall back to a refetch.
              if (created && typeof created === "object") {
                setIssues((prev) => [created as Issue, ...prev])
              } else {
                fetch("/api/data/issues")
                  .then((r) => r.json())
                  .then((i: Issue[]) => setIssues(i))
                  .catch(() => {})
              }
            }}
            defaultStatus={createStatus}
            defaultTeamId={view?.teamId}
          />
        </div>
        {panelOpen && (
          <ViewSidePanel
            view={view}
            members={members}
            labels={labels}
            projects={projects}
            displayed={displayed}
            favorited={favorited}
            onToggleFavorite={() =>
              view &&
              toggleFavorite({
                key: favoriteKey,
                label: view.name,
                href: `/views/${view.id}`,
                icon: "view",
              })
            }
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Right-side info panel for the View detail page. Toggled by the
 * "Toggle right panel" button in the toolbar.
 *
 * Layout matches Linear's view inspector: the view name and a
 * favorite/⋯ row at the top, a key-value metadata block
 * (Visibility / Owner), then a tab strip with three breakdowns —
 * Assignees, Labels, Projects — each a sorted list of items with a
 * trailing per-item issue count. The contents are derived from
 * `displayed` so the panel always reflects the current filter
 * slice.
 */
function ViewSidePanel({
  view,
  members,
  labels,
  projects,
  displayed,
  favorited,
  onToggleFavorite,
  onClose,
}: {
  view: View
  members: Member[]
  labels: Label[]
  projects: Project[]
  displayed: Issue[]
  favorited: boolean
  onToggleFavorite: () => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<"assignees" | "labels" | "projects">(
    "assignees"
  )

  // Owner of the saved view. Falls back to a generic placeholder
  // when the owner id doesn't match any loaded member (e.g. a view
  // owned by an external workspace user).
  const owner = members.find((m) => m.id === view.ownerId) ?? null

  // Per-tab buckets, all derived off the same `displayed` slice
  // so toggling filters or grouping in the parent updates this
  // panel in real time. We use a magic UNASSIGNED sentinel for
  // the "No assignee" / "No labels" / "No project" rows so they
  // can sort and render with the same shape as the named rows.
  const NO_ASSIGNEE = "__no_assignee__"
  const NO_LABEL = "__no_label__"
  const NO_PROJECT = "__no_project__"

  const assigneeRows = (() => {
    const counts = new Map<string, number>()
    for (const i of displayed) {
      const key = i.assigneeId ?? NO_ASSIGNEE
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        name:
          id === NO_ASSIGNEE
            ? "No assignee"
            : (members.find((m) => m.id === id)?.name ?? "Unknown"),
        avatar:
          id === NO_ASSIGNEE
            ? null
            : (members.find((m) => m.id === id)?.avatar ?? null),
        count,
      }))
      .sort((a, b) => {
        // Push "No assignee" to the top to match Linear, then sort
        // the rest by count desc so the busiest assignee leads.
        if (a.id === NO_ASSIGNEE) return -1
        if (b.id === NO_ASSIGNEE) return 1
        return b.count - a.count
      })
  })()

  const labelRows = (() => {
    const counts = new Map<string, number>()
    for (const i of displayed) {
      const ids = Array.isArray(i.labelIds) ? i.labelIds : []
      if (ids.length === 0) {
        counts.set(NO_LABEL, (counts.get(NO_LABEL) ?? 0) + 1)
        continue
      }
      for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([id, count]) => {
        const found = labels.find((l) => l.id === id)
        return {
          id,
          name: id === NO_LABEL ? "No labels" : (found?.name ?? "Unknown"),
          color: id === NO_LABEL ? null : (found?.color ?? null),
          count,
        }
      })
      .sort((a, b) => {
        if (a.id === NO_LABEL) return -1
        if (b.id === NO_LABEL) return 1
        return b.count - a.count
      })
  })()

  const projectRows = (() => {
    const counts = new Map<string, number>()
    for (const i of displayed) {
      const key = i.projectId ?? NO_PROJECT
      counts.set(String(key), (counts.get(String(key)) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        name:
          id === NO_PROJECT
            ? "No project"
            : (projects.find((p) => p.id === id)?.name ?? "Unknown"),
        count,
      }))
      .sort((a, b) => {
        if (a.id === NO_PROJECT) return -1
        if (b.id === NO_PROJECT) return 1
        return b.count - a.count
      })
  })()

  return (
    <aside
      data-testid="view-side-panel"
      aria-label="View details"
      className="bg-background flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4 text-xs"
    >
      {/* Top — view icon + name on the left, favorite + ⋯ + close
          on the right. Mirrors the breadcrumb header in the main
          area so users keep their bearings when the panel opens. */}
      <header className="flex items-center gap-2">
        <ViewBreadcrumbIcon className="size-4 shrink-0 text-pink-500" />
        <span className="truncate text-sm font-semibold">{view.name}</span>
        <button
          type="button"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          onClick={onToggleFavorite}
          className="text-muted-foreground hover:text-foreground ml-auto flex size-6 shrink-0 items-center justify-center rounded"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={cn(
              "size-3.5",
              favorited ? "fill-amber-400 text-amber-400" : "fill-none"
            )}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          >
            <path d="M8 2 L9.8 6 L14 6.5 L10.8 9.4 L11.7 13.6 L8 11.4 L4.3 13.6 L5.2 9.4 L2 6.5 L6.2 6 Z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="More options"
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      {/* Metadata grid — two rows of label / value. We use a flex
          row instead of a real <dl> so the trailing avatar lines
          up cleanly with the static lock icon above it. */}
      <dl className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <dt className="text-muted-foreground w-16 shrink-0">Visibility</dt>
          <dd className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 16 16"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3.5" y="7" width="9" height="6" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            <span>Personal</span>
          </dd>
        </div>
        <div className="flex items-center gap-3">
          <dt className="text-muted-foreground w-16 shrink-0">Owner</dt>
          <dd className="flex items-center gap-1.5">
            {owner ? (
              <>
                <Avatar className="size-4">
                  <AvatarImage src={owner.avatar} alt={owner.name} />
                  <AvatarFallback className="text-[8px]">
                    {owner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{owner.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Unknown</span>
            )}
          </dd>
        </div>
      </dl>

      {/* Tabs — Linear groups the breakdowns under three labels.
          We re-use the same Tabs primitive used in the Display
          popover for layout consistency. */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "assignees" | "labels" | "projects")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="assignees">Assignees</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Active-tab content — list of rows with avatar/swatch on
          the left, name in the middle, and the per-item issue
          count tucked tabular-nums on the right. */}
      <ul className="flex flex-col gap-1">
        {tab === "assignees" &&
          assigneeRows.map((row) => (
            <li
              key={row.id}
              className="hover:bg-accent/40 flex items-center gap-2 rounded px-1 py-1"
            >
              {row.avatar ? (
                <Avatar className="size-5">
                  <AvatarImage src={row.avatar} alt={row.name} />
                  <AvatarFallback className="text-[9px]">
                    {row.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span
                  aria-hidden="true"
                  className="bg-muted text-muted-foreground flex size-5 items-center justify-center rounded-full"
                >
                  <HugeiconsIcon icon={UserIcon} className="size-3" />
                </span>
              )}
              <span className="flex-1 truncate">{row.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {row.count}
              </span>
            </li>
          ))}
        {tab === "labels" &&
          (labelRows.length === 0 ? (
            <li className="text-muted-foreground px-1 py-2">
              No labels in the current slice.
            </li>
          ) : (
            labelRows.map((row) => (
              <li
                key={row.id}
                className="hover:bg-accent/40 flex items-center gap-2 rounded px-1 py-1"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    !row.color && "border-muted-foreground/40 border"
                  )}
                  style={row.color ? { backgroundColor: row.color } : undefined}
                />
                <span className="flex-1 truncate">{row.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {row.count}
                </span>
              </li>
            ))
          ))}
        {tab === "projects" &&
          projectRows.map((row) => (
            <li
              key={row.id}
              className="hover:bg-accent/40 flex items-center gap-2 rounded px-1 py-1"
            >
              <HugeiconsIcon
                icon={CubeIcon}
                className="text-muted-foreground size-3.5"
              />
              <span className="flex-1 truncate">{row.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {row.count}
              </span>
            </li>
          ))}
      </ul>
    </aside>
  )
}

function IssueRow({
  issue,
  members,
  selected,
  onSelectedChange,
  onUpdatePriority,
}: {
  issue: Issue
  members: Member[]
  selected: boolean
  onSelectedChange: (next: boolean) => void
  onUpdatePriority: (priority: IssuePriority) => void
}) {
  const assignee = members.find((m) => m.id === issue.assigneeId) ?? null
  return (
    // The row is a flex container with sibling-level interactive
    // elements. Anchors (`<Link className="contents">`) only wrap the
    // *non-interactive* spans (identifier, title, assignee, date) so
    // those navigate to the issue, while the Priority button and the
    // Checkbox are real `<button>`s that handle their own clicks
    // without conflicting with link navigation. (`<button>` inside
    // `<a>` is invalid HTML and Next.js Link uses native click
    // handlers that fire before React's `stopPropagation`, which is
    // why nesting the priority menu in a Link breaks both.)
    <li
      data-selected={selected || undefined}
      className={cn(
        "group flex items-center gap-2.5 border-b px-6 py-2 pl-12 text-sm transition-colors",
        "relative",
        selected ? "bg-accent/60" : "hover:bg-accent/40"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-6 z-10 -translate-y-1/2 transition-opacity",
          "group-focus-within:opacity-100 group-hover:opacity-100",
          selected ? "opacity-100" : "opacity-0"
        )}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelectedChange(v === true)}
          aria-label={`Select ${issue.identifier}`}
        />
      </span>
      <PriorityMenu
        priority={issue.priority}
        onChange={onUpdatePriority}
        issueId={issue.identifier}
      />
      <Link
        href={`/issues/${issue.identifier}`}
        className="contents"
        aria-label={`Open ${issue.identifier}`}
      >
        <span className="text-muted-foreground w-14 shrink-0 cursor-pointer font-mono text-xs">
          {issue.identifier}
        </span>
      </Link>
      <StatusIcon status={issue.status} className="size-3.5 shrink-0" />
      <Link href={`/issues/${issue.identifier}`} className="contents">
        <span className="flex-1 cursor-pointer truncate">{issue.title}</span>
      </Link>
      {assignee ? (
        <Tooltip>
          <TooltipTrigger
            render={<span className="size-5 shrink-0" />}
            aria-label={assignee.name}
          >
            <Avatar className="size-5">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback className="text-[9px]">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{assignee.name}</TooltipContent>
        </Tooltip>
      ) : (
        <span
          aria-hidden="true"
          className="border-muted-foreground/40 size-5 shrink-0 rounded-full border border-dashed"
        />
      )}
      <span className="text-muted-foreground w-12 shrink-0 text-right text-xs">
        {formatDate(issue.updatedAt ?? issue.createdAt)}
      </span>
    </li>
  )
}

/**
 * Single issue card rendered inside a board column. Mirrors the
 * Linear card chrome from the screenshot: identifier + assignee
 * dot at top, status icon + title in the middle, a thin separator
 * line, and a "Created <date>" footer at the bottom. The whole
 * card is a `<Link>` so a click anywhere on the card opens the
 * issue detail page.
 */
function BoardCard({ issue, members }: { issue: Issue; members: Member[] }) {
  const assignee = members.find((m) => m.id === issue.assigneeId) ?? null
  return (
    <Link
      href={`/issues/${issue.identifier}`}
      className="bg-card hover:border-foreground/20 flex flex-col gap-2 rounded-md border p-3 text-xs transition-colors"
    >
      <header className="text-muted-foreground flex items-center justify-between text-[11px]">
        <span className="font-mono">{issue.identifier}</span>
        {assignee ? (
          <Avatar className="size-4">
            <AvatarImage src={assignee.avatar} alt={assignee.name} />
            <AvatarFallback className="text-[8px]">
              {assignee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span
            aria-hidden="true"
            className="border-muted-foreground/40 size-4 rounded-full border border-dashed"
          />
        )}
      </header>
      <div className="text-foreground flex items-start gap-2">
        <StatusIcon
          status={issue.status}
          className="mt-[3px] size-3.5 shrink-0"
        />
        <span className="line-clamp-3">{issue.title}</span>
      </div>
      <span className="text-muted-foreground/60 text-[11px]">---</span>
      <span className="text-muted-foreground text-[11px]">
        Created {formatDate(issue.createdAt)}
      </span>
    </Link>
  )
}

/**
 * Inline priority picker — a real `<button>` (the dropdown trigger)
 * that swaps the issue's priority via `onChange`. Lives outside any
 * row-level `<Link>` so its click is never swallowed by navigation.
 */
function PriorityMenu({
  priority,
  onChange,
  issueId,
}: {
  priority: IssuePriority
  onChange: (next: IssuePriority) => void
  issueId: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Set priority for ${issueId}`}
            className="hover:bg-accent flex size-5 shrink-0 items-center justify-center rounded"
          />
        }
      >
        <PriorityIcon
          priority={priority}
          className="text-muted-foreground/70 size-3.5"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 p-1">
        {PRIORITY_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 text-sm"
          >
            <PriorityIcon
              priority={opt.value}
              className="text-muted-foreground/80 size-3.5"
            />
            <span className="flex-1">{opt.label}</span>
            {opt.value === priority && (
              <span className="text-muted-foreground text-[10px]">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Bulk-actions command palette — opens from the floating selection
 * bar's "Actions" button. The action set mirrors Linear's contextual
 * issue command palette: every item is wired up to either a sub-mode
 * picker (Assign / Status / Priority / Project / Labels / Due date /
 * Subscribers / Mark as / Theme) which mutates the selected issues
 * via `onMutateIssue`, a clipboard write (Copy *), a CSV download
 * (Export *), a dialog open (Invite / Create team), or a navigation /
 * external-link open (Settings, Docs, Help, Logout, etc.).
 */
type ActionsMode =
  | "root"
  | "status"
  | "priority"
  | "project"
  | "labels"
  | "dueDate"
  | "assignee"
  | "subscribers"
  | "markAs"
  | "theme"

const STATUS_PICK_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
]

const MARK_AS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
  { value: "backlog", label: "Backlog" },
]

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

function csvEscape(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadFile(filename: string, contents: string, mime: string) {
  if (typeof document === "undefined") return
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ActionsCommand({
  open,
  onOpenChange,
  selectedIssues,
  allIssues,
  members,
  projects,
  labels,
  teams,
  onMutateIssue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIssues: Issue[]
  allIssues: Issue[]
  members: Member[]
  projects: Project[]
  labels: Label[]
  teams: Team[]
  onMutateIssue: (id: string, fields: Partial<Issue>) => void
}) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mode, setMode] = useState<ActionsMode>("root")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)

  // Reset mode whenever the dialog reopens — opening to a sub-picker
  // because the user closed-and-reopened mid-flow would be confusing.
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setMode("root")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  const single = selectedIssues.length === 1 ? selectedIssues[0] : null

  // Tiny clipboard helper. Absorbs the open/close + permission noise
  // so the action handlers below stay one-liners.
  const writeClipboard = (text: string) => {
    if (text && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    onOpenChange(false)
  }
  const ids = selectedIssues.map((i) => i.identifier)
  const titles = selectedIssues.map((i) => i.title)
  const urls = selectedIssues.map(
    (i) =>
      `${typeof window !== "undefined" ? window.location.origin : ""}/issues/${i.identifier}`
  )

  const handleCopyId = () => writeClipboard(ids.join(", "))
  const handleCopyUrl = () => writeClipboard(urls.join("\n"))
  const handleCopyTitle = () => writeClipboard(titles.join("\n"))
  const handleCopyTitleAsLink = () =>
    writeClipboard(
      selectedIssues.map((i, idx) => `[${i.title}](${urls[idx]})`).join("\n")
    )
  const handleCopyDescriptionMarkdown = () =>
    writeClipboard(selectedIssues.map((i) => i.description ?? "").join("\n\n"))
  const handleCopyContentMarkdown = () =>
    writeClipboard(
      selectedIssues
        .map((i) => `# ${i.title}\n\n${i.description ?? ""}`)
        .join("\n\n---\n\n")
    )
  const handleCopyBranchName = () =>
    writeClipboard(
      selectedIssues
        .map(
          (i) =>
            // Linear-style branch name: lowercased identifier + slug of title.
            `${i.identifier.toLowerCase()}-${i.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
              .slice(0, 60)}`
        )
        .join("\n")
    )
  const handleCopyAsPrompt = () =>
    writeClipboard(
      selectedIssues
        .map((i) => `${i.identifier}: ${i.title}\n\n${i.description ?? ""}`)
        .join("\n\n---\n\n")
    )

  // Mutators — apply the chosen value to every selected issue. Each
  // call goes through the parent's optimistic `onMutateIssue`, which
  // patches local state and PUTs the same fields to the API. The
  // palette closes after the mutation so the user immediately sees
  // the row update; clearing selection is left to the user (matching
  // Linear's behaviour — they can keep iterating on the same set).
  const applyToAll = (fields: Partial<Issue>) => {
    for (const issue of selectedIssues) onMutateIssue(issue.id, fields)
    onOpenChange(false)
  }
  const handleAssignToMe = () => applyToAll({ assigneeId: CURRENT_USER_ID })
  const handlePickAssignee = (id: string | null) =>
    applyToAll({ assigneeId: id })
  const handlePickStatus = (status: IssueStatus) => applyToAll({ status })
  const handlePickPriority = (priority: IssuePriority) =>
    applyToAll({ priority })
  const handlePickProject = (projectId: string | null) =>
    applyToAll({ projectId })
  const handleToggleLabel = (labelId: string) => {
    // For a single issue this is a real toggle; for a multi-select it
    // adds the label to every issue that doesn't yet have it (the
    // common bulk-tagging case).
    for (const issue of selectedIssues) {
      const current = Array.isArray(issue.labelIds) ? issue.labelIds : []
      const has = current.includes(labelId)
      const next = has
        ? current.filter((l) => l !== labelId)
        : [...current, labelId]
      onMutateIssue(issue.id, { labelIds: next })
    }
  }
  const handlePickDueDate = (iso: string | null) => applyToAll({ dueDate: iso })
  const handleUnsubscribe = () => {
    for (const issue of selectedIssues) {
      const current = Array.isArray(issue.subscriberIds)
        ? issue.subscriberIds
        : []
      const next = current.filter((id) => id !== CURRENT_USER_ID)
      onMutateIssue(issue.id, { subscriberIds: next })
    }
    onOpenChange(false)
  }
  const handleToggleSubscriber = (memberId: string) => {
    for (const issue of selectedIssues) {
      const current = Array.isArray(issue.subscriberIds)
        ? issue.subscriberIds
        : []
      const has = current.includes(memberId)
      const next = has
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
      onMutateIssue(issue.id, { subscriberIds: next })
    }
  }

  // Export — build a CSV from local state and trigger a download.
  // Mirrors what the Settings → Import & Export page does, but with
  // one click straight from the command palette.
  const handleExportIssues = () => {
    const memberById = new Map(members.map((m) => [m.id, m]))
    const projectById = new Map(projects.map((p) => [p.id, p]))
    const teamById = new Map(teams.map((t) => [t.id, t]))
    const labelById = new Map(labels.map((l) => [l.id, l]))
    const header = [
      "ID",
      "Title",
      "Status",
      "Priority",
      "Assignee",
      "Team",
      "Project",
      "Labels",
      "Due date",
      "Created",
      "Updated",
    ].join(",")
    const rows = allIssues.map((i) =>
      [
        csvEscape(i.identifier),
        csvEscape(i.title),
        csvEscape(i.status),
        csvEscape(i.priority),
        csvEscape(
          i.assigneeId ? (memberById.get(i.assigneeId)?.name ?? "") : ""
        ),
        csvEscape(teamById.get(i.teamId)?.name ?? ""),
        csvEscape(
          i.projectId ? (projectById.get(i.projectId)?.name ?? "") : ""
        ),
        csvEscape(
          (i.labelIds ?? [])
            .map((id) => labelById.get(id)?.name ?? "")
            .filter(Boolean)
            .join(" | ")
        ),
        csvEscape(i.dueDate ?? ""),
        csvEscape(i.createdAt ?? ""),
        csvEscape(i.updatedAt ?? ""),
      ].join(",")
    )
    downloadFile(
      `issues-${new Date().toISOString().slice(0, 10)}.csv`,
      [header, ...rows].join("\n"),
      "text/csv;charset=utf-8"
    )
    onOpenChange(false)
  }
  const handleExportCustomerRequests = () => {
    // The mock app doesn't model customer requests as a first-class
    // entity yet — emit a header-only CSV so the download still
    // works end-to-end and the user gets the empty template they'd
    // get from Linear when their workspace has no requests.
    const header = [
      "Request ID",
      "Customer",
      "Title",
      "Status",
      "Linked issue",
      "Created",
    ].join(",")
    downloadFile(
      `customer-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      header + "\n",
      "text/csv;charset=utf-8"
    )
    onOpenChange(false)
  }

  // Theme picker — writes to the same `linear:theme` localStorage key
  // the Settings → Preferences page uses, then nudges next-themes so
  // the change applies in this tab without a reload. The Settings
  // page's <LinearThemeSync> picks up other tabs via the storage
  // event.
  const handlePickTheme = (value: string) => {
    try {
      window.localStorage.setItem("linear:theme", JSON.stringify(value))
    } catch {}
    setTheme(value)
    onOpenChange(false)
  }

  // Keyboard shortcuts cheat sheet → Help popover. Already wired to
  // the OPEN_HELP_EVENT dispatched by `?` and `⌘/`.
  const handleKeyboardCheatSheet = () => {
    window.dispatchEvent(new CustomEvent(OPEN_HELP_EVENT))
    onOpenChange(false)
  }

  // Pickers expand inline as a sub-mode rather than spawning a second
  // dialog — Linear's pattern. The user types to filter, hits ↵ to
  // pick, and Esc returns to the root list.
  const renderRootList = () => (
    <>
      <CommandGroup heading="Issue">
        <CommandItem onSelect={() => setMode("assignee")}>
          <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
          <span>Assign to...</span>
          <CommandShortcut>A</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleAssignToMe}>
          <HugeiconsIcon icon={UserIcon} className="size-4" />
          <span>Assign to me</span>
          <CommandShortcut>I</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("status")}>
          <HugeiconsIcon icon={TaskEdit01Icon} className="size-4" />
          <span>Change status...</span>
          <CommandShortcut>S</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("priority")}>
          <PriorityIcon priority="medium" className="size-4" />
          <span>Set priority...</span>
          <CommandShortcut>P</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("project")}>
          <HugeiconsIcon icon={CubeIcon} className="size-4" />
          <span>Add to project...</span>
          <CommandShortcut>⇧ P</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("labels")}>
          <HugeiconsIcon icon={Tag01Icon} className="size-4" />
          <span>Add labels...</span>
          <CommandShortcut>L</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("dueDate")}>
          <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
          <span>Set due date...</span>
          <CommandShortcut>⇧ D</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyId}>
          <HugeiconsIcon icon={CopyIcon} className="size-4" />
          <span>Copy issue ID</span>
          <CommandShortcut>⌘ .</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyUrl}>
          <HugeiconsIcon icon={Link01Icon} className="size-4" />
          <span>Copy issue URL</span>
          <CommandShortcut>⌘ ⇧ ,</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyTitle}>
          <HugeiconsIcon icon={CopyIcon} className="size-4" />
          <span>Copy issue title</span>
          <CommandShortcut>⌘ ⇧ &apos;</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyTitleAsLink}>
          <HugeiconsIcon icon={Link01Icon} className="size-4" />
          <span>Copy title as link</span>
          <CommandShortcut>⌘ C</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyDescriptionMarkdown}>
          <HugeiconsIcon icon={CopyIcon} className="size-4" />
          <span>Copy issue description as Markdown</span>
        </CommandItem>
        <CommandItem onSelect={handleCopyContentMarkdown}>
          <HugeiconsIcon icon={CopyIcon} className="size-4" />
          <span>Copy issue content as Markdown</span>
          <CommandShortcut>⌘ ⌥ C</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyBranchName}>
          <HugeiconsIcon icon={GitBranchIcon} className="size-4" />
          <span>Copy git branch name</span>
          <CommandShortcut>⌘ ⇧ .</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleCopyAsPrompt}>
          <HugeiconsIcon icon={AiContentGenerator02Icon} className="size-4" />
          <span>Copy as prompt</span>
          <CommandShortcut>⌘ ⌥ P</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={handleUnsubscribe}>
          <HugeiconsIcon icon={NotificationOff03Icon} className="size-4" />
          <span>Unsubscribe from issue</span>
          <CommandShortcut>⇧ S</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("subscribers")}>
          <HugeiconsIcon icon={Notification02Icon} className="size-4" />
          <span>Change subscribers...</span>
          <CommandShortcut>⌘ ⇧ S</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => setMode("markAs")}>
          <HugeiconsIcon icon={PlayCircleIcon} className="size-4" />
          <span>Mark issue as...</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Export">
        <CommandItem onSelect={handleExportIssues}>
          <HugeiconsIcon icon={FileExportIcon} className="size-4" />
          <span>Export issues as CSV...</span>
        </CommandItem>
        <CommandItem onSelect={handleExportCustomerRequests}>
          <HugeiconsIcon icon={FileExportIcon} className="size-4" />
          <span>Export customer requests as CSV...</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Settings">
        <CommandItem onSelect={() => setMode("theme")}>
          <HugeiconsIcon icon={Sun01Icon} className="size-4" />
          <span>Change interface theme...</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            router.push("/settings?section=preferences")
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={Layers01Icon} className="size-4" />
          <span>Change default view...</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setInviteOpen(true)
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
          <span>Invite to Abhishek...</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Teams">
        <CommandItem
          onSelect={() => {
            setCreateTeamOpen(true)
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
          <span>Create a team...</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Help">
        <CommandItem
          onSelect={() => {
            window.open(
              "mailto:support@linear.app?subject=Support%20request",
              "_blank",
              "noopener"
            )
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={MessageQuestionIcon} className="size-4" />
          <span>Contact support</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            window.open(
              "mailto:hello@linear.app?subject=Feedback",
              "_blank",
              "noopener"
            )
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={Comment01Icon} className="size-4" />
          <span>Send feedback</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            window.open("https://linear.app/docs", "_blank", "noopener")
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={Book01Icon} className="size-4" />
          <span>Open Linear Documentation</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            window.open("https://linear.app/developers", "_blank", "noopener")
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={CodeSquareIcon} className="size-4" />
          <span>Open API Documentation</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            window.open("https://linearstatus.com", "_blank", "noopener")
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
          <span>Linear status</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            window.open(
              "mailto:support@linear.app?subject=Performance%20problem%20report",
              "_blank",
              "noopener"
            )
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={DashboardSpeed02Icon} className="size-4" />
          <span>Report performance problem</span>
        </CommandItem>
        <CommandItem onSelect={handleKeyboardCheatSheet}>
          <HugeiconsIcon icon={KeyboardIcon} className="size-4" />
          <span>Open Keyboard Shortcuts Cheat Sheet</span>
          <CommandShortcut>⌘ /</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Account">
        <CommandItem
          onSelect={() => {
            router.push("/create-workspace")
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={Building02Icon} className="size-4" />
          <span>Create or join a workspace...</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            router.push("/add-account")
            onOpenChange(false)
          }}
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-4" />
          <span>Log out</span>
          <CommandShortcut>⌥ ⇧ Q</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  )

  // First selected issue's value used as the "current" indicator for
  // single-pick sub-modes; for bulk selections this just lights up
  // the most-common value as a hint (the action still applies to
  // everything).
  const sample = selectedIssues[0]

  const renderStatusList = () => (
    <CommandGroup heading="Change status">
      {STATUS_PICK_OPTIONS.map((opt) => (
        <CommandItem
          key={opt.value}
          onSelect={() => handlePickStatus(opt.value)}
        >
          <StatusIcon status={opt.value} className="size-4" />
          <span>{opt.label}</span>
          {sample?.status === opt.value && (
            <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const renderPriorityList = () => (
    <CommandGroup heading="Set priority">
      {PRIORITY_OPTIONS.map((opt) => (
        <CommandItem
          key={opt.value}
          onSelect={() => handlePickPriority(opt.value)}
        >
          <PriorityIcon priority={opt.value} className="size-4" />
          <span>{opt.label}</span>
          {sample?.priority === opt.value && (
            <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const renderProjectList = () => (
    <CommandGroup heading="Add to project">
      <CommandItem onSelect={() => handlePickProject(null)}>
        <HugeiconsIcon icon={CubeIcon} className="size-4" />
        <span>No project</span>
        {!sample?.projectId && (
          <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
        )}
      </CommandItem>
      {projects.map((p) => (
        <CommandItem key={p.id} onSelect={() => handlePickProject(p.id)}>
          <HugeiconsIcon icon={CubeIcon} className="size-4" />
          <span>{p.name}</span>
          {sample?.projectId === p.id && (
            <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const renderLabelsList = () => {
    const sampleLabelIds = new Set(
      Array.isArray(sample?.labelIds) ? sample.labelIds : []
    )
    return (
      <CommandGroup heading="Toggle labels">
        {labels.map((l) => (
          <CommandItem key={l.id} onSelect={() => handleToggleLabel(l.id)}>
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span>{l.name}</span>
            {sampleLabelIds.has(l.id) && (
              <span className="text-muted-foreground ml-auto text-[10px]">
                ✓
              </span>
            )}
          </CommandItem>
        ))}
      </CommandGroup>
    )
  }

  const renderDueDateList = () => {
    const today = new Date()
    const offsetIso = (days: number) => {
      const d = new Date(today)
      d.setDate(d.getDate() + days)
      return d.toISOString().slice(0, 10)
    }
    const presets = [
      { label: "Today", iso: offsetIso(0) },
      { label: "Tomorrow", iso: offsetIso(1) },
      { label: "In 3 days", iso: offsetIso(3) },
      { label: "Next week", iso: offsetIso(7) },
      { label: "In 2 weeks", iso: offsetIso(14) },
      {
        label: "End of month",
        iso: new Date(today.getFullYear(), today.getMonth() + 1, 0)
          .toISOString()
          .slice(0, 10),
      },
    ]
    return (
      <CommandGroup heading="Set due date">
        <CommandItem onSelect={() => handlePickDueDate(null)}>
          <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
          <span>No due date</span>
        </CommandItem>
        {presets.map((p) => (
          <CommandItem key={p.iso} onSelect={() => handlePickDueDate(p.iso)}>
            <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
            <span>{p.label}</span>
            <span className="text-muted-foreground ml-auto text-[10px]">
              {p.iso}
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    )
  }

  const renderAssigneeList = () => (
    <CommandGroup heading="Assign to">
      <CommandItem onSelect={() => handlePickAssignee(null)}>
        <HugeiconsIcon icon={UserIcon} className="size-4" />
        <span>Unassigned</span>
        {!sample?.assigneeId && (
          <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
        )}
      </CommandItem>
      {members.map((m) => (
        <CommandItem key={m.id} onSelect={() => handlePickAssignee(m.id)}>
          <Avatar className="size-4">
            <AvatarImage src={m.avatar} alt={m.name} />
            <AvatarFallback className="text-[8px]">
              {m.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span>{m.name}</span>
          {sample?.assigneeId === m.id && (
            <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const renderSubscribersList = () => {
    const sampleSubs = new Set(
      Array.isArray(sample?.subscriberIds) ? sample.subscriberIds : []
    )
    return (
      <CommandGroup heading="Toggle subscribers">
        {members.map((m) => (
          <CommandItem key={m.id} onSelect={() => handleToggleSubscriber(m.id)}>
            <Avatar className="size-4">
              <AvatarImage src={m.avatar} alt={m.name} />
              <AvatarFallback className="text-[8px]">
                {m.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{m.name}</span>
            {sampleSubs.has(m.id) && (
              <span className="text-muted-foreground ml-auto text-[10px]">
                ✓
              </span>
            )}
          </CommandItem>
        ))}
      </CommandGroup>
    )
  }

  const renderMarkAsList = () => (
    <CommandGroup heading="Mark as">
      {MARK_AS_OPTIONS.map((opt) => (
        <CommandItem
          key={opt.value}
          onSelect={() => handlePickStatus(opt.value)}
        >
          <StatusIcon status={opt.value} className="size-4" />
          <span>{opt.label}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const renderThemeList = () => (
    <CommandGroup heading="Interface theme">
      {THEME_OPTIONS.map((opt) => (
        <CommandItem
          key={opt.value}
          onSelect={() => handlePickTheme(opt.value)}
        >
          <HugeiconsIcon icon={Sun01Icon} className="size-4" />
          <span>{opt.label}</span>
          {theme === opt.value && (
            <span className="text-muted-foreground ml-auto text-[10px]">✓</span>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const subtitleByMode: Record<ActionsMode, string> = {
    root: "Type a command or search...",
    status: "Pick a status",
    priority: "Pick a priority",
    project: "Pick a project",
    labels: "Toggle a label (selecting again removes it)",
    dueDate: "Pick a due date",
    assignee: "Pick an assignee",
    subscribers: "Toggle a subscriber",
    markAs: "Mark issue as",
    theme: "Pick a theme",
  }

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Issue actions"
        description="Run a command on the selected issues."
        // Override the default `sm:max-w-sm` so the palette feels
        // closer to Linear's 720-px-wide command bar instead of a
        // narrow 384-px modal. `top-[15%]` shifts the dialog higher
        // than the CommandDialog default of `top-1/3` so the long
        // action list has room to breathe without crowding the
        // floating selection bar at the bottom.
        className="top-[15%] sm:max-w-2xl"
      >
        {/* CommandDialog is just a styled <Dialog>; the cmdk primitives
            below (CommandInput / CommandList / CommandItem) need the
            <Command> root to provide their store. */}
        <Command className="rounded-none border-0 p-0">
          {/* Selection-context chip — Linear shows the single selected
              issue's identifier + title with a small bordered back button
              on the far right to clear the selection from inside the
              palette, or just a count when multiple issues are selected. */}
          <div className="flex items-center gap-2 px-3 py-2 text-xs">
            {mode !== "root" && (
              <button
                type="button"
                onClick={() => setMode("root")}
                className="text-muted-foreground hover:text-foreground mr-1 -ml-1 rounded px-1 font-mono text-[10px]"
                aria-label="Back"
              >
                ←
              </button>
            )}
            {single ? (
              <>
                <span className="text-muted-foreground font-mono">
                  {single.identifier}
                </span>
                <span className="text-muted-foreground/60">•</span>
                <span className="min-w-0 flex-1 truncate">{single.title}</span>
              </>
            ) : (
              <span className="flex-1 font-medium">
                {selectedIssues.length} issues selected
              </span>
            )}
          </div>
          <CommandInput placeholder={subtitleByMode[mode]} />
          <CommandList className="max-h-[32rem]">
            <CommandEmpty>No matching command.</CommandEmpty>
            {mode === "root" && renderRootList()}
            {mode === "status" && renderStatusList()}
            {mode === "priority" && renderPriorityList()}
            {mode === "project" && renderProjectList()}
            {mode === "labels" && renderLabelsList()}
            {mode === "dueDate" && renderDueDateList()}
            {mode === "assignee" && renderAssigneeList()}
            {mode === "subscribers" && renderSubscribersList()}
            {mode === "markAs" && renderMarkAsList()}
            {mode === "theme" && renderThemeList()}
          </CommandList>
        </Command>
      </CommandDialog>

      {/* Side dialogs spawned by the palette's "Invite to..." and
          "Create a team..." commands. They live here (not in the
          parent page) so closing them doesn't reopen the palette. */}
      <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <CreateTeamDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
      />
    </>
  )
}

/**
 * Inline copy of the sidebar's `ViewsIcon` glyph — kept here (rather
 * than imported) so this route doesn't take a dependency on the
 * sidebar component file. The two should stay visually identical;
 * if you change one, change the other.
 */
function ViewBreadcrumbIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      role="img"
      focusable="false"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.93213 2.21398C7.66484 1.90793 8.49512 1.93032 9.21389 2.28028L14.28 4.74739C15.2242 5.20709 15.2441 6.55895 14.3138 7.04673L9.2874 9.6826C8.48012 10.1058 7.51988 10.1058 6.7126 9.6826L1.68618 7.04673C0.75589 6.55895 0.775786 5.20709 1.71995 4.74739L6.78611 2.28028L6.93213 2.21398ZM8.55132 3.67054C8.24643 3.52213 7.89768 3.50303 7.58179 3.61428L7.44868 3.67054L2.83947 5.91363L7.41491 8.31243C7.7819 8.50486 8.2181 8.50486 8.58509 8.31243L13.1595 5.91363L8.55132 3.67054Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9045 10.0768C14.272 9.90435 14.7242 10.0333 14.9153 10.365C15.1063 10.6966 14.9634 11.1047 14.5959 11.2772L9.49912 13.6693C8.55934 14.1102 7.44077 14.1102 6.50099 13.6693L1.40417 11.2772L1.33776 11.2428C1.01976 11.0547 0.905685 10.676 1.08483 10.365C1.26402 10.054 1.67295 9.92085 2.02626 10.0477L2.0956 10.0768L7.19241 12.468L7.38675 12.5464C7.84801 12.7022 8.36492 12.6757 8.80769 12.468L13.9045 10.0768Z"
      />
    </svg>
  )
}
