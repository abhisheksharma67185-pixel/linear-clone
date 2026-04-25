"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Issue, Member, Team } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import {
  NotificationsPopover,
  type NotificationItem,
} from "@/components/notifications-popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  SlidersHorizontalIcon,
  PanelRightIcon,
  Layers01Icon,
  PlusSignIcon,
  UserIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons"
import { statusStyle, priorityStyle } from "@/lib/status-styles"
import {
  filterIssuesByTab,
  groupIssuesByType,
  STATUS_TO_TYPE,
  type IssueStatus,
  type IssueStatusType,
  type IssueTab,
} from "@/lib/issue-status-types"

const TAB_LABELS: Record<IssueTab, string> = {
  all: "All issues",
  active: "Active",
  backlog: "Backlog",
}

/**
 * Per-status section labels rendered within an active tab. Order is
 * Backlog → Started → Completed → Canceled, matching Linear's
 * grouping order.
 */
const TYPE_ORDER: readonly IssueStatusType[] = [
  "backlog",
  "started",
  "completed",
  "canceled",
] as const

const TYPE_LABELS: Record<IssueStatusType, string> = {
  backlog: "Backlog",
  started: "In progress",
  completed: "Completed",
  canceled: "Canceled",
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

export default function TeamIssuesPage() {
  const params = useParams<{ key: string }>()
  const teamKeyParam = (params?.key ?? "").toUpperCase()

  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<IssueTab>("active")
  const [createOpen, setCreateOpen] = useState(false)

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

  // Resolve the team from the URL key. We match case-insensitive
  // because the route param can be lower- or upper-case depending
  // on how the team was linked from elsewhere in the app.
  const team = useMemo(
    () => teams.find((t) => t.key.toUpperCase() === teamKeyParam) ?? null,
    [teams, teamKeyParam]
  )

  // The visible issue list is: this team only, then filtered by tab.
  // Filtering by tab uses the shared `filterIssuesByTab` helper that
  // reads status-type rules — so the "Active" tab can never include
  // a Backlog row (the spec's filter-logic regression).
  const teamIssues = useMemo(
    () => (team ? issues.filter((i) => i.teamId === team.id) : []),
    [issues, team]
  )
  const filtered = useMemo(
    () => filterIssuesByTab(teamIssues, activeTab),
    [teamIssues, activeTab]
  )
  const grouped = useMemo(() => groupIssuesByType(filtered), [filtered])

  // Global "c" hotkey for the create-issue modal. Matches Linear's
  // production shortcut; ignored while typing in inputs/textareas
  // and while another overlay is open.
  const openCreate = useCallback(() => setCreateOpen(true), [])
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
          <h1 className="text-sm font-medium">
            {team ? `${team.key} · Issues` : "Issues"}
          </h1>
        </div>
        <div className="text-muted-foreground flex items-center gap-1">
          {/* Header-level Create button. Wired to the same dialog
              the in-list "+" buttons open AND the "c" hotkey above
              triggers. defaultTeamId pre-selects this team. */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-testid="header-create-issue"
            aria-label="Create new issue"
            onClick={openCreate}
            className="size-7"
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
          <button
            type="button"
            aria-label="Add view"
            className="text-muted-foreground hover:bg-accent hover:text-foreground ml-1 flex size-6 items-center justify-center rounded"
          >
            <HugeiconsIcon icon={Layers01Icon} className="size-3" />
          </button>
        </div>
        <div className="text-muted-foreground flex items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Filter" className="size-7">
            <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Display options"
            className="size-7"
          >
            <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open right panel"
            className="size-7"
          >
            <HugeiconsIcon icon={PanelRightIcon} className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
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
        ) : filtered.length === 0 ? (
          <div
            data-testid="team-issues-empty"
            className="text-muted-foreground py-16 text-center text-sm"
          >
            No issues in this view.
          </div>
        ) : (
          TYPE_ORDER.map((type) => {
            const items = grouped[type]
            if (items.length === 0) return null
            return (
              <IssueTypeSection
                key={type}
                type={type}
                items={items}
                memberById={memberById}
              />
            )
          })
        )}
      </div>

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultTeamId={team?.id}
      />
    </div>
  )
}

function IssueTypeSection({
  type,
  items,
  memberById,
}: {
  type: IssueStatusType
  items: Issue[]
  memberById: Map<string, Member>
}) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div data-testid={`team-issues-section-${type}`}>
      {/* Group header */}
      <div className="group hover:bg-accent/30 flex items-center gap-2 px-5 py-2">
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
          <span>{TYPE_LABELS[type]}</span>
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Add issue to ${TYPE_LABELS[type]}`}
          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
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
      className="group hover:bg-accent/40 flex items-center gap-2 border-b border-transparent px-5 py-2 transition-colors"
    >
      {/* Priority */}
      <Badge
        variant="secondary"
        className={`min-w-12 justify-center text-[9px] ${priorityStyle[issue.priority]}`}
      >
        {issue.priority}
      </Badge>
      {/* Identifier */}
      <span className="text-muted-foreground w-16 font-mono text-[11px]">
        {issue.identifier}
      </span>
      {/* Status badge */}
      <Badge
        variant="secondary"
        data-status-type={STATUS_TO_TYPE[issue.status as IssueStatus]}
        className={`text-[10px] ${statusStyle[issue.status]}`}
      >
        {issue.status.replace("_", " ")}
      </Badge>
      {/* Title */}
      <span className="flex-1 truncate text-sm">{issue.title}</span>
      {/* Assignee */}
      {assignee && (
        <Avatar className="size-5">
          <AvatarImage src={assignee.avatar} alt={assignee.name} />
          <AvatarFallback className="bg-violet-600 text-[9px] text-white">
            {assignee.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </Link>
  )
}
