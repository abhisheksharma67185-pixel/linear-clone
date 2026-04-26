"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Issue, Member, Team } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import {
  NotificationsPopover,
  type NotificationItem,
} from "@/components/notifications-popover"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import {
  CircularIconToolbarRoot,
  FilterSortIcon,
  VerticalAdjustmentsIcon,
} from "@/components/circular-icon-toolbar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SlidersHorizontalIcon,
  Layers01Icon,
  PlusSignIcon,
  UserIcon,
  PencilEdit01Icon,
  UserCircleIcon,
  StatusIcon as StatusFilterIcon,
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
  PanelRightIcon,
} from "@hugeicons/core-free-icons"
import {
  FilterPopover,
  type FilterOption,
} from "@/components/filter-popover"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import {
  filterIssuesByTab,
  STATUS_TO_TYPE,
  type IssueStatus,
  type IssueTab,
} from "@/lib/issue-status-types"
import { toggleFavorite, useIsFavorite } from "@/lib/view-favorites"

const TAB_LABELS: Record<IssueTab, string> = {
  all: "All issues",
  active: "Active",
  backlog: "Backlog",
}

/**
 * Status order shown on a team's Issues page. Matches Linear's
 * convention: active work (in-progress, todo) before queued
 * (backlog), then completed and canceled at the bottom.
 */
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

// Static seed for the notifications popover. A real implementation
// would derive this from /api/notifications; the mock keeps it
// deterministic for the e2e to assert against.
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "New issue assigned: Improve onboarding flow",
    meta: "ABH-12 · 5m ago",
    read: false,
  },
  {
    id: "n2",
    title: "Mention from Priya in PLT-87",
    meta: "PLT-87 · 1h ago",
    read: false,
  },
  {
    id: "n3",
    title: "Cycle 14 has started",
    meta: "Cycle · Yesterday",
    read: true,
  },
]

const ISSUE_FILTER_OPTIONS: FilterOption[] = [
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

const ISSUE_AI_SUGGESTIONS = [
  "my issues",
  "completed in the last week",
  "in progress",
]

export default function TeamIssuesPage() {
  const params = useParams<{ key: string }>()
  const teamKeyParam = (params?.key ?? "").toUpperCase()

  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<IssueTab>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<IssueStatus | undefined>(
    undefined
  )
  const favoriteKey = `team:${teamKeyParam}:issues`
  const favorited = useIsFavorite(favoriteKey)
  // Inline "New view" editor: opens when the layers + button is
  // clicked next to the tabs. The pencil pill in the tab row toggles
  // it back closed. Save/Cancel sit inside the form panel.
  const [newViewOpen, setNewViewOpen] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [newViewDesc, setNewViewDesc] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<
    "assignees" | "labels" | "priority" | "projects"
  >("assignees")
  const [viewType, setViewType] = useState<"list" | "board">("list")
  const [showEmptyColumns, setShowEmptyColumns] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([i, m, t]) => {
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  const team = useMemo(
    () => teams.find((t) => t.key.toUpperCase() === teamKeyParam) ?? null,
    [teams, teamKeyParam]
  )

  const teamIssues = useMemo(
    () => (team ? issues.filter((i) => i.teamId === team.id) : []),
    [issues, team]
  )
  const filtered = useMemo(
    () => filterIssuesByTab(teamIssues, activeTab),
    [teamIssues, activeTab]
  )
  const grouped = useMemo(() => {
    const out: Record<IssueStatus, Issue[]> = {
      in_progress: [],
      todo: [],
      backlog: [],
      done: [],
      cancelled: [],
    }
    for (const issue of filtered) out[issue.status].push(issue)
    return out
  }, [filtered])

  // Global "c" hotkey for the create-issue modal. Matches Linear's
  // production shortcut; ignored while typing in inputs/textareas
  // and while another overlay is open.
  const openCreate = useCallback(() => {
    setCreateStatus(undefined)
    setCreateOpen(true)
  }, [])
  const openCreateInColumn = useCallback((status: IssueStatus) => {
    setCreateStatus(status)
    setCreateOpen(true)
  }, [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "c" && event.key !== "C") return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName.toLowerCase()
      if (
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return
      }
      if (document.querySelector('[data-state="open"][role="dialog"]')) return
      event.preventDefault()
      openCreate()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openCreate])

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
            <HugeiconsIcon icon={UserIcon} className="size-2.5" />
          </span>
          <h1 className="text-sm font-medium">Issues</h1>
          <button
            type="button"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorited}
            onClick={() =>
              toggleFavorite({
                key: favoriteKey,
                label: "All issues",
                href: `/teams/${teamKeyParam.toLowerCase()}/issues`,
                icon: "issues",
              })
            }
            className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={favorited ? "text-amber-400" : ""}
            >
              <path d="M10.5193 4.98997L9.46118 2.01693C9.34483 1.70806 9.1452 1.45362 8.88451 1.27433C8.62466 1.09562 8.31641 1 8.00081 1C7.68521 1 7.37696 1.09562 7.11712 1.27433C6.85642 1.45362 6.65679 1.70806 6.54528 2.00374L5.48248 4.98997L2.55536 4.98997C2.23765 4.98973 1.92683 5.08675 1.66556 5.26809C1.40342 5.45004 1.20379 5.70812 1.09414 6.00737C0.984248 6.30728 0.970192 6.63372 1.05394 6.94194C1.13753 7.2496 1.31442 7.52386 1.56019 7.7275L4.08545 9.80411L3.02371 12.9604C2.91854 13.2733 2.91647 13.6112 3.01776 13.9252C3.11884 14.2385 3.3175 14.5113 3.58464 14.7044C3.85102 14.8969 4.17178 15.0003 4.50071 14.9996C4.82872 14.9993 5.14907 14.8951 5.41483 14.702L8.00053 12.8223L10.5851 14.7014C10.8496 14.8944 11.17 14.9991 11.4991 15C11.8281 15.0009 12.1491 14.8978 12.4157 14.7054C12.6831 14.5124 12.882 14.2394 12.9833 13.926C13.0848 13.6113 13.0827 13.2731 12.9773 12.9602L11.9156 9.80207L14.444 7.72408C14.695 7.51166 14.8686 7.23684 14.9493 6.92968C15.0168 6.67352 15.0167 6.40505 14.9504 6.15011L14.9022 5.99753C14.791 5.70157 14.5918 5.44667 14.3314 5.26673C14.0718 5.08736 13.7637 4.9909 13.4479 4.98998L10.5193 4.98997ZM13.4986 6.54821C13.4962 6.55733 13.491 6.56562 13.4832 6.57224L10.7049 8.85551C10.546 8.98629 10.4307 9.16168 10.3739 9.35896C10.3168 9.55714 10.3214 9.76807 10.3875 9.96371L11.5556 13.4385C11.5586 13.4474 11.5587 13.4565 11.5559 13.4652C11.553 13.4741 11.5467 13.4827 11.5378 13.4891C11.5281 13.4961 11.5159 13.5 11.503 13.5C11.4902 13.5 11.4779 13.496 11.4683 13.4889L8.60012 11.4036C8.42554 11.2769 8.21577 11.2088 8.00055 11.2088C7.78531 11.2088 7.5755 11.2769 7.40134 11.4034L4.53289 13.4886C4.52321 13.4957 4.511 13.4996 4.49835 13.4996C4.48523 13.4997 4.47312 13.4958 4.46329 13.4887C4.45442 13.4822 4.44826 13.4738 4.4453 13.4646C4.44255 13.4561 4.4426 13.4471 4.44547 13.4386L5.61393 9.96499C5.67961 9.76981 5.68428 9.5592 5.62728 9.3612C5.57043 9.16375 5.45499 8.98835 5.29643 8.85789L2.51507 6.57069C2.50925 6.56586 2.50387 6.55753 2.50146 6.54865C2.49919 6.54032 2.49957 6.53163 2.50257 6.52343C2.50583 6.51453 2.5121 6.50643 2.52085 6.50035C2.53046 6.49368 2.54238 6.48996 2.55479 6.48997H5.8221C6.03248 6.4897 6.23685 6.42501 6.40824 6.30453C6.58053 6.18341 6.71109 6.01179 6.78158 5.81318L7.9609 2.49821C7.95727 2.50944 7.95646 2.51419 7.9574 2.5155C7.97668 2.50367 7.98851 2.5 8.00081 2.5C8.01311 2.5 8.02494 2.50367 8.03451 2.51025C8.04324 2.51625 8.04952 2.52427 8.05284 2.53307L9.22029 5.81379C9.29053 6.01192 9.42137 6.18383 9.59407 6.30503C9.76589 6.4256 9.97082 6.49011 10.1806 6.48997H13.4457C13.4563 6.49001 13.4686 6.49385 13.4786 6.50077L13.4902 6.5114L13.4977 6.52418C13.5004 6.53198 13.5007 6.54022 13.4986 6.54821Z" />
            </svg>
          </button>
        </div>
        <div className="text-muted-foreground flex items-center gap-1">
          {/* Kept as a sr-only-friendly button so the "c" shortcut
              and the e2e header-create test still work, without
              cluttering the visual header. */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-testid="header-create-issue"
            aria-label="Create new issue"
            onClick={openCreate}
            className="sr-only"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
          </Button>
          <NotificationsPopover items={SEED_NOTIFICATIONS} />
        </div>
      </header>

      {/* Tabs + toolbar */}
      <div className="flex items-center justify-between border-b px-4">
        <div
          role="tablist"
          aria-label="Issue type"
          data-testid="team-issues-tabs"
          className="flex items-center gap-0.5"
        >
          {(["all", "active", "backlog"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              data-testid={`team-issues-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
          {newViewOpen ? (
            <div
              data-testid="team-issues-new-view-pill"
              className="border-border/70 text-muted-foreground ml-1 flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs font-medium"
            >
              <HugeiconsIcon icon={Layers01Icon} className="size-3" />
              <span>New view</span>
              <HugeiconsIcon icon={PencilEdit01Icon} className="size-3" />
            </div>
          ) : (
            <button
              type="button"
              aria-label="Add view"
              data-testid="team-issues-add-view"
              onClick={() => setNewViewOpen(true)}
              className="text-muted-foreground hover:bg-accent hover:text-foreground ml-1 flex size-6 items-center justify-center rounded"
            >
              <HugeiconsIcon icon={Layers01Icon} className="size-3" />
            </button>
          )}
        </div>
        <CircularIconToolbarRoot>
          <FilterPopover
            options={ISSUE_FILTER_OPTIONS}
            aiSuggestions={ISSUE_AI_SUGGESTIONS}
            countNoun="issue"
          />
          <IssueDisplayPopover
            viewType={viewType}
            onViewTypeChange={setViewType}
            showEmptyColumns={showEmptyColumns}
            onShowEmptyColumnsChange={setShowEmptyColumns}
          />
          <button
            type="button"
            aria-label="Toggle right panel"
            aria-pressed={panelOpen}
            onClick={() => setPanelOpen((v) => !v)}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
              panelOpen
                ? "bg-zinc-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={PanelRightIcon} className="size-3.5" />
          </button>
        </CircularIconToolbarRoot>
      </div>

      {/* New view editor — appears between the tabs row and the
          issue list when the user clicks the "+" view button. */}
      {newViewOpen && (
        <NewViewEditor
          name={newViewName}
          description={newViewDesc}
          onNameChange={setNewViewName}
          onDescriptionChange={setNewViewDesc}
          onCancel={() => {
            setNewViewOpen(false)
            setNewViewName("")
            setNewViewDesc("")
          }}
          onSave={() => {
            // Persistence isn't wired up yet — this matches the
            // mock's pattern where view CRUD lives in localStorage.
            // For now we just close and clear; the save handler
            // exists so the button has a real onClick.
            setNewViewOpen(false)
            setNewViewName("")
            setNewViewDesc("")
          }}
          viewType={viewType}
          onViewTypeChange={setViewType}
          showEmptyColumns={showEmptyColumns}
          onShowEmptyColumnsChange={setShowEmptyColumns}
        />
      )}

      {/* Content + right panel */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className="flex-1 overflow-auto"
          data-testid={`team-issues-content-${activeTab}`}
        >
          {loading ? (
            <div className="flex flex-col gap-1 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : viewType === "board" ? (
            <BoardView
              grouped={grouped}
              showEmptyColumns={showEmptyColumns}
              memberById={memberById}
              onAddInColumn={openCreateInColumn}
            />
          ) : filtered.length === 0 ? (
            <div
              data-testid="team-issues-empty"
              className="text-muted-foreground py-16 text-center text-sm"
            >
              No issues in this view.
            </div>
          ) : (
            STATUS_ORDER.map((status) => {
              const items = grouped[status]
              if (items.length === 0) return null
              return (
                <StatusSection
                  key={status}
                  status={status}
                  items={items}
                  memberById={memberById}
                />
              )
            })
          )}
        </div>

        {panelOpen && (
          <IssuesRightPanel
            issues={filtered}
            memberById={memberById}
            tab={panelTab}
            onTabChange={setPanelTab}
          />
        )}
      </div>

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultTeamId={team?.id}
        defaultStatus={createStatus}
      />
    </div>
  )
}

function StatusSection({
  status,
  items,
  memberById,
}: {
  status: IssueStatus
  items: Issue[]
  memberById: Map<string, Member>
}) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div data-testid={`team-issues-section-${status}`}>
      {/* Group header */}
      <div className="bg-muted/30 group flex items-center gap-2 px-5 py-1.5">
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
          <StatusIcon status={status} className="size-3.5" />
          <span>{STATUS_LABEL[status]}</span>
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Add issue to ${STATUS_LABEL[status]}`}
          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
        </button>
      </div>

      {/* Issue rows */}
      {!collapsed &&
        items.map((issue) => (
          <IssueRowLink
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
          />
        ))}
    </div>
  )
}

function IssueRowLink({
  issue,
  assignee,
}: {
  issue: Issue
  assignee: Member | null
}) {
  return (
    <Link
      href={`/issues/${issue.identifier}`}
      data-testid="team-issues-row"
      data-issue-identifier={issue.identifier}
      data-status-type={STATUS_TO_TYPE[issue.status]}
      className="group hover:bg-accent/40 flex items-center gap-3 border-b border-transparent px-5 py-2 transition-colors"
    >
      {/* Hover-only checkbox (decorative — wires into row selection
          state in real Linear; we just show the affordance). */}
      <span
        aria-hidden="true"
        className="border-muted-foreground/40 size-3.5 shrink-0 rounded-[3px] border opacity-0 transition-opacity group-hover:opacity-100"
      />
      <PriorityIcon priority={issue.priority} className="size-3.5 shrink-0" />
      <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
        {issue.identifier}
      </span>
      <StatusIcon status={issue.status} className="size-3.5 shrink-0" />
      <span className="flex-1 truncate text-sm">{issue.title}</span>
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

function formatShortDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function NewViewEditor({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onCancel,
  onSave,
  viewType,
  onViewTypeChange,
  showEmptyColumns,
  onShowEmptyColumnsChange,
}: {
  name: string
  description: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onCancel: () => void
  onSave: () => void
  viewType: "list" | "board"
  onViewTypeChange: (v: "list" | "board") => void
  showEmptyColumns: boolean
  onShowEmptyColumnsChange: (v: boolean) => void
}) {
  return (
    <div
      data-testid="team-issues-new-view-editor"
      className="border-b px-6 pt-4 pb-3"
    >
      <div className="flex items-start gap-3">
        <span className="bg-accent text-muted-foreground mt-1 flex size-7 shrink-0 items-center justify-center rounded-md">
          <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="All issues"
              aria-label="View name"
              data-testid="team-issues-new-view-name"
              className="placeholder:text-muted-foreground/70 flex-1 bg-transparent text-base font-medium outline-none"
            />
            <button
              type="button"
              onClick={onCancel}
              data-testid="team-issues-new-view-cancel"
              className="text-muted-foreground hover:text-foreground rounded px-3 py-1 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              data-testid="team-issues-new-view-save"
              className="bg-accent text-foreground hover:bg-accent/80 rounded px-3 py-1 text-xs"
            >
              Save
            </button>
          </div>
          <input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Description (optional)"
            aria-label="View description"
            data-testid="team-issues-new-view-description"
            className="placeholder:text-muted-foreground/70 bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="text-muted-foreground mt-3 flex items-center justify-end gap-1 border-t pt-2">
        <FilterPopover
          options={ISSUE_FILTER_OPTIONS}
          aiSuggestions={ISSUE_AI_SUGGESTIONS}
          countNoun="issue"
          triggerRender={
            <button
              type="button"
              aria-label="Filter view"
              data-testid="team-issues-new-view-filter"
              className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
            >
              <FilterSortIcon />
            </button>
          }
        />
        <IssueDisplayPopover
          viewType={viewType}
          onViewTypeChange={onViewTypeChange}
          showEmptyColumns={showEmptyColumns}
          onShowEmptyColumnsChange={onShowEmptyColumnsChange}
          triggerRender={
            <button
              type="button"
              aria-label="Display options"
              data-testid="team-issues-new-view-display"
              className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
            >
              <VerticalAdjustmentsIcon />
            </button>
          }
        />
      </div>
    </div>
  )
}

const BOARD_COLUMN_ORDER: readonly IssueStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "cancelled",
] as const

function BoardView({
  grouped,
  showEmptyColumns,
  memberById,
  onAddInColumn,
}: {
  grouped: Record<IssueStatus, Issue[]>
  showEmptyColumns: boolean
  memberById: Map<string, Member>
  onAddInColumn?: (status: IssueStatus) => void
}) {
  const [manuallyHidden, setManuallyHidden] = useState<Set<IssueStatus>>(
    () => new Set()
  )
  const visible = BOARD_COLUMN_ORDER.filter(
    (s) =>
      !manuallyHidden.has(s) && (showEmptyColumns || grouped[s].length > 0)
  )
  const hidden = BOARD_COLUMN_ORDER.filter(
    (s) =>
      manuallyHidden.has(s) || (!showEmptyColumns && grouped[s].length === 0)
  )
  const [hiddenOpen, setHiddenOpen] = useState(true)

  const hide = (status: IssueStatus) =>
    setManuallyHidden((prev) => {
      const next = new Set(prev)
      next.add(status)
      return next
    })
  const unhide = (status: IssueStatus) =>
    setManuallyHidden((prev) => {
      const next = new Set(prev)
      next.delete(status)
      return next
    })

  return (
    <div className="flex h-full overflow-x-auto">
      {visible.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          items={grouped[status]}
          memberById={memberById}
          onHide={() => hide(status)}
          onAdd={onAddInColumn ? () => onAddInColumn(status) : undefined}
        />
      ))}
      {hidden.length > 0 && (
        <div className="flex shrink-0 flex-col gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setHiddenOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium"
          >
            <svg
              viewBox="0 0 12 12"
              className={`size-3 transition-transform ${hiddenOpen ? "" : "-rotate-90"}`}
              fill="none"
            >
              <path
                d="M3 4.5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Hidden columns
          </button>
          {hiddenOpen && (
            <div className="flex flex-col gap-1.5">
              {hidden.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => unhide(status)}
                  aria-label={`Show ${STATUS_LABEL[status]} column`}
                  className="bg-muted/30 hover:bg-muted/50 flex w-44 items-center gap-2 rounded-md px-3 py-2 text-left text-xs"
                >
                  <StatusIcon status={status} />
                  <span className="text-foreground flex-1">
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-muted-foreground">
                    {grouped[status].length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BoardColumn({
  status,
  items,
  memberById,
  onHide,
  onAdd,
}: {
  status: IssueStatus
  items: Issue[]
  memberById: Map<string, Member>
  onHide?: () => void
  onAdd?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div
      data-testid={`board-column-${status}`}
      className="flex w-72 shrink-0 flex-col gap-2 px-2 py-3"
    >
      <div className="flex items-center gap-2 px-2 py-1">
        <StatusIcon status={status} />
        <span className="text-foreground text-xs font-medium">
          {STATUS_LABEL[status]}
        </span>
        <span className="text-muted-foreground text-xs">{items.length}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label="Column options"
                  data-testid={`board-column-options-${status}`}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded"
                />
              }
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
                <circle cx="3" cy="8" r="1.2" />
                <circle cx="8" cy="8" r="1.2" />
                <circle cx="13" cy="8" r="1.2" />
              </svg>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-52 rounded-md p-1"
            >
              <button
                type="button"
                data-testid={`board-column-select-all-${status}`}
                onClick={() => setMenuOpen(false)}
                className="hover:bg-accent text-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs"
              >
                Select all in column
              </button>
              <button
                type="button"
                data-testid={`board-column-hide-${status}`}
                onClick={() => {
                  setMenuOpen(false)
                  onHide?.()
                }}
                className="hover:bg-accent text-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs"
              >
                Hide column
              </button>
              {(status === "done" || status === "cancelled") && (
                <>
                  <div className="bg-border my-1 h-px" />
                  <button
                    type="button"
                    data-testid={`board-column-order-recency-${status}`}
                    onClick={() => setMenuOpen(false)}
                    className="hover:bg-accent text-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs"
                  >
                    Order completed by recency
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>
          <button
            type="button"
            aria-label="Add issue"
            data-testid={`board-column-add-${status}`}
            onClick={onAdd}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <BoardCard
            key={item.id}
            item={item}
            memberById={memberById}
          />
        ))}
        <button
          type="button"
          aria-label={`Add issue to ${STATUS_LABEL[status]}`}
          data-testid={`board-column-add-bottom-${status}`}
          onClick={onAdd}
          className="text-muted-foreground hover:bg-accent/40 hover:text-foreground flex h-9 w-full items-center justify-center rounded-md transition-colors"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function BoardCard({
  item,
  memberById,
}: {
  item: Issue
  memberById: Map<string, Member>
}) {
  const assignee = item.assigneeId ? memberById.get(item.assigneeId) : null
  const created = new Date(item.createdAt)
  const createdLabel = `Created ${created.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`
  return (
    <article className="bg-muted/40 hover:bg-muted/60 flex flex-col gap-2 rounded-md px-3 py-3 text-xs transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground">{item.identifier}</span>
        {assignee ? (
          <Avatar className="size-4 shrink-0">
            <AvatarImage src={assignee.avatarUrl as string | undefined} />
            <AvatarFallback className="bg-fuchsia-500 text-[8px] font-medium text-white">
              {assignee.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-muted-foreground/60 flex size-4 shrink-0 items-center justify-center">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
              <circle
                cx="8"
                cy="6"
                r="2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeDasharray="2 1.5"
              />
              <path
                d="M4 13c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeDasharray="2 1.5"
              />
            </svg>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusIcon status={item.status} />
        <span className="text-foreground truncate text-sm">{item.title}</span>
      </div>
      <div className="text-muted-foreground/60 text-xs">---</div>
      <div className="text-muted-foreground text-xs">{createdLabel}</div>
    </article>
  )
}

function IssuesRightPanel({
  issues,
  memberById,
  tab,
  onTabChange,
}: {
  issues: Issue[]
  memberById: Map<string, Member>
  tab: "assignees" | "labels" | "priority" | "projects"
  onTabChange: (
    t: "assignees" | "labels" | "priority" | "projects"
  ) => void
}) {
  const assigneeRows = useMemo(() => {
    const counts = new Map<string | null, number>()
    for (const issue of issues) {
      const k = issue.assigneeId
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort(([a], [b]) => {
      if (a === null) return -1
      if (b === null) return 1
      const an = memberById.get(a)?.name ?? ""
      const bn = memberById.get(b)?.name ?? ""
      return an.localeCompare(bn)
    })
  }, [issues, memberById])

  const priorityRows = useMemo(() => {
    const order: Issue["priority"][] = [
      "urgent",
      "high",
      "medium",
      "low",
      "none",
    ]
    const counts = new Map<Issue["priority"], number>()
    for (const issue of issues) {
      counts.set(issue.priority, (counts.get(issue.priority) ?? 0) + 1)
    }
    return order
      .map((p) => [p, counts.get(p) ?? 0] as const)
      .filter(([, c]) => c > 0)
  }, [issues])

  const PRIORITY_LABEL: Record<Issue["priority"], string> = {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
    none: "No priority",
  }

  return (
    <aside className="bg-background flex w-72 shrink-0 flex-col border-l">
      <div className="flex gap-1 px-3 py-3">
        {(
          [
            ["assignees", "Assignees"],
            ["labels", "Labels"],
            ["priority", "Priority"],
            ["projects", "Projects"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => onTabChange(k)}
            className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors ${
              tab === k
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-2 py-1">
        {tab === "assignees" &&
          assigneeRows.map(([id, count]) => {
            const member = id ? memberById.get(id) : null
            const name = member?.name ?? "No assignee"
            return (
              <button
                key={id ?? "none"}
                type="button"
                className="hover:bg-accent/40 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors"
              >
                {member ? (
                  <Avatar className="size-5 shrink-0">
                    <AvatarImage src={member.avatarUrl as string | undefined} />
                    <AvatarFallback className="bg-fuchsia-500 text-[10px] font-medium text-white">
                      {member.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-muted-foreground/70 flex size-5 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 16 16" className="size-4" fill="none">
                      <circle
                        cx="8"
                        cy="6"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeDasharray="2 1.5"
                      />
                      <path
                        d="M3.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeDasharray="2 1.5"
                      />
                    </svg>
                  </span>
                )}
                <span className="text-foreground flex-1 truncate text-left">
                  {name}
                </span>
                <span className="text-muted-foreground text-xs">{count}</span>
              </button>
            )
          })}

        {tab === "priority" &&
          priorityRows.map(([p, count]) => (
            <button
              key={p}
              type="button"
              className="hover:bg-accent/40 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors"
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <PriorityIcon priority={p} />
              </span>
              <span className="text-foreground flex-1 text-left">
                {PRIORITY_LABEL[p]}
              </span>
              <span className="text-muted-foreground text-xs">{count}</span>
            </button>
          ))}

        {tab === "labels" && (
          <div className="text-muted-foreground py-6 text-center text-xs">
            No labels
          </div>
        )}

        {tab === "projects" && (
          <div className="text-muted-foreground py-6 text-center text-xs">
            No projects
          </div>
        )}
      </div>
    </aside>
  )
}

const ISSUE_GROUPING_OPTIONS = [
  "No grouping",
  "Status",
  "Assignee",
  "Priority",
  "Label",
  "Project",
]
const ISSUE_ORDERING_OPTIONS = [
  "Manual",
  "Priority",
  "Status",
  "Last created",
  "Last updated",
]
const COMPLETED_ISSUE_OPTIONS = [
  "All",
  "None",
  "Past day",
  "Past week",
  "Past month",
]
const ISSUE_DISPLAY_PROPERTIES = [
  "ID",
  "Status",
  "Assignee",
  "Priority",
  "Project",
  "Due date",
  "Milestone",
  "Labels",
  "Links",
  "Time in status",
  "Created",
  "Updated",
] as const
const DEFAULT_ISSUE_DISPLAY_PROPS = new Set([
  "ID",
  "Status",
  "Assignee",
  "Priority",
  "Project",
  "Due date",
  "Labels",
  "Created",
])

function InlineSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="text-foreground hover:bg-accent flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
          />
        }
      >
        {value}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="text-muted-foreground size-3"
        />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={4}
        className="w-48 gap-0 p-1"
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt)
              setOpen(false)
            }}
            className="hover:bg-accent flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors"
          >
            <span>{opt}</span>
            {value === opt && (
              <svg
                viewBox="0 0 12 12"
                className="text-foreground size-3 shrink-0"
                fill="none"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function IssueDisplayPopover({
  viewType,
  onViewTypeChange,
  showEmptyColumns,
  onShowEmptyColumnsChange,
  triggerRender,
}: {
  viewType: "list" | "board"
  onViewTypeChange: (v: "list" | "board") => void
  showEmptyColumns: boolean
  onShowEmptyColumnsChange: (v: boolean) => void
  triggerRender?: React.ReactElement
}) {
  const [grouping, setGrouping] = useState("Status")
  const [subGrouping, setSubGrouping] = useState("No grouping")
  const [ordering, setOrdering] = useState("Priority")
  const [orderByRecency, setOrderByRecency] = useState(false)
  const [completedIssues, setCompletedIssues] = useState("All")
  const [showSubIssues, setShowSubIssues] = useState(true)
  const [nestedSubIssues, setNestedSubIssues] = useState(false)
  const [showEmptyGroups, setShowEmptyGroups] = useState(false)
  const [activeProps, setActiveProps] = useState<Set<string>>(
    new Set(DEFAULT_ISSUE_DISPLAY_PROPS)
  )

  const setViewType = onViewTypeChange

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
      {triggerRender ? (
        <PopoverTrigger render={triggerRender} />
      ) : (
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Display options"
              className="bg-muted text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-full"
            />
          }
        >
          <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
        </PopoverTrigger>
      )}
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        className="w-72 gap-0 p-0"
      >
        <div className="flex gap-1.5 p-2.5 pb-2">
          {(["list", "board"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewType(v)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                viewType === v
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {v === "list" ? (
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="4"
                    height="12"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="7"
                    y="2"
                    width="4"
                    height="8"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="12"
                    y="2"
                    width="2"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              )}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-col px-2.5 py-1">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground text-xs">
              {viewType === "board" ? "Columns" : "Grouping"}
            </span>
            <InlineSelect
              value={grouping}
              options={ISSUE_GROUPING_OPTIONS}
              onChange={setGrouping}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground text-xs">
              {viewType === "board" ? "Rows" : "Sub-grouping"}
            </span>
            <InlineSelect
              value={subGrouping}
              options={ISSUE_GROUPING_OPTIONS}
              onChange={setSubGrouping}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground text-xs">Ordering</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Ordering direction"
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded transition-colors"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <path
                    d="M5 3v10M2 10l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <InlineSelect
                value={ordering}
                options={ISSUE_ORDERING_OPTIONS}
                onChange={setOrdering}
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-xs">
              Order completed by recency
            </span>
            <Switch
              size="sm"
              checked={orderByRecency}
              onCheckedChange={setOrderByRecency}
            />
          </div>
        </div>

        <div className="border-border/60 border-t" />

        <div className="flex flex-col px-2.5 py-1">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground text-xs">
              Completed issues
            </span>
            <InlineSelect
              value={completedIssues}
              options={COMPLETED_ISSUE_OPTIONS}
              onChange={setCompletedIssues}
            />
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-xs">
              Show sub-issues
            </span>
            <Switch
              size="sm"
              checked={showSubIssues}
              onCheckedChange={setShowSubIssues}
            />
          </div>
        </div>

        <div className="border-border/60 border-t" />

        <div className="flex flex-col px-2.5 py-2">
          <span className="text-muted-foreground py-1 text-[11px]">
            {viewType === "board" ? "Board options" : "List options"}
          </span>
          {viewType === "list" ? (
            <>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground text-xs">
                  Nested sub-issues
                </span>
                <Switch
                  size="sm"
                  checked={nestedSubIssues}
                  onCheckedChange={setNestedSubIssues}
                />
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground text-xs">
                  Show empty groups
                </span>
                <Switch
                  size="sm"
                  checked={showEmptyGroups}
                  onCheckedChange={setShowEmptyGroups}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground text-xs">
                Show empty columns
              </span>
              <Switch
                size="sm"
                checked={showEmptyColumns}
                onCheckedChange={onShowEmptyColumnsChange}
              />
            </div>
          )}
        </div>

        <div className="border-border/60 border-t" />

        <div className="px-2.5 py-2">
          <span className="text-muted-foreground py-1 text-[11px]">
            Display properties
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ISSUE_DISPLAY_PROPERTIES.map((prop) => {
              const active = activeProps.has(prop)
              return (
                <button
                  key={prop}
                  type="button"
                  onClick={() => toggleProp(prop)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                    active
                      ? "bg-muted text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground border"
                  }`}
                >
                  {prop}
                </button>
              )
            })}
          </div>
        </div>

        {viewType === "board" && (
          <div className="text-muted-foreground flex items-center justify-end gap-4 px-2.5 py-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setActiveProps(new Set(DEFAULT_ISSUE_DISPLAY_PROPS))
                setGrouping("Status")
                setSubGrouping("No grouping")
                setOrdering("Priority")
                setOrderByRecency(false)
                setCompletedIssues("All")
                setShowSubIssues(true)
                onShowEmptyColumnsChange(false)
              }}
              className="hover:text-foreground"
            >
              Reset
            </button>
            <button
              type="button"
              className="text-primary/80 hover:text-primary"
            >
              Set default for everyone
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
