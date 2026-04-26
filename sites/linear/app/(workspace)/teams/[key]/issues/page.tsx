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
  CircularIconButton,
  CircularIconToolbarRoot,
  AdjustmentsIcon,
  VerticalAdjustmentsIcon,
  CardViewIcon,
} from "@/components/circular-icon-toolbar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  SlidersHorizontalIcon,
  Layers01Icon,
  PlusSignIcon,
  UserIcon,
  StarIcon,
  PencilEdit01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import {
  filterIssuesByTab,
  STATUS_TO_TYPE,
  type IssueStatus,
  type IssueTab,
} from "@/lib/issue-status-types"

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

export default function TeamIssuesPage() {
  const params = useParams<{ key: string }>()
  const teamKeyParam = (params?.key ?? "").toUpperCase()

  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<IssueTab>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [favorited, setFavorited] = useState(false)
  // Inline "New view" editor: opens when the layers + button is
  // clicked next to the tabs. The pencil pill in the tab row toggles
  // it back closed. Save/Cancel sit inside the form panel.
  const [newViewOpen, setNewViewOpen] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [newViewDesc, setNewViewDesc] = useState("")

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
          <h1 className="text-sm font-medium">Issues</h1>
          <button
            type="button"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorited}
            onClick={() => setFavorited((v) => !v)}
            className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded"
          >
            <HugeiconsIcon
              icon={StarIcon}
              className={`size-3.5 ${favorited ? "text-amber-400" : ""}`}
            />
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
          <CircularIconButton label="Filter and sort">
            <AdjustmentsIcon />
          </CircularIconButton>
          <CircularIconButton label="Display">
            <VerticalAdjustmentsIcon />
          </CircularIconButton>
          <CircularIconButton label="Toggle right panel">
            <CardViewIcon />
          </CircularIconButton>
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
        />
      )}

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

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultTeamId={team?.id}
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
}: {
  name: string
  description: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onCancel: () => void
  onSave: () => void
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
        <button
          type="button"
          aria-label="Filter view"
          className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
        >
          <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Display options"
          className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
        >
          <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
