"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, User, Project, Epic } from "@/app/lib/mock-data"
import { useIssueDrawer } from "@/components/issue-drawer-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { priorityVariant, typeVariant, typeLabel } from "@/lib/badge-styles"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalIcon,
  ArrowRight01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Map each spec workflow state to an icon + color. Unknown states fall through
// to a neutral default so agents can add custom workflow states and still get
// a sensible column visualization.
const STATUS_DISPLAY: Record<string, { icon: string; color: string }> = {
  // Open / not-started family
  Open: { icon: "○", color: "text-gray-400" },
  Backlog: { icon: "○", color: "text-gray-400" },
  "To Do": { icon: "○", color: "text-gray-400" },
  Ready: { icon: "○", color: "text-gray-400" },
  Intake: { icon: "○", color: "text-gray-400" },
  // In progress family
  "In Development": { icon: "◐", color: "text-blue-500" },
  "In Progress": { icon: "◐", color: "text-blue-500" },
  Doing: { icon: "◐", color: "text-blue-500" },
  Triage: { icon: "◐", color: "text-blue-500" },
  Investigation: { icon: "◐", color: "text-blue-500" },
  "Fix in Progress": { icon: "◐", color: "text-blue-500" },
  // Review family
  "Code Review": { icon: "◑", color: "text-yellow-500" },
  "In Review": { icon: "◑", color: "text-yellow-500" },
  Review: { icon: "◑", color: "text-yellow-500" },
  "Peer Review": { icon: "◑", color: "text-yellow-500" },
  // QA / validation family
  QA: { icon: "◨", color: "text-purple-500" },
  Testing: { icon: "◨", color: "text-purple-500" },
  Validation: { icon: "◨", color: "text-purple-500" },
  // Staging / deploy family
  Staging: { icon: "◧", color: "text-orange-500" },
  Deploying: { icon: "◧", color: "text-orange-500" },
  Monitoring: { icon: "◓", color: "text-cyan-500" },
  // Done family
  Done: { icon: "●", color: "text-green-500" },
  Deployed: { icon: "●", color: "text-green-500" },
  Closed: { icon: "●", color: "text-green-500" },
  // Terminal-negative family
  "Won't Fix": { icon: "✕", color: "text-red-500" },
  Rejected: { icon: "✕", color: "text-red-500" },
  Cancelled: { icon: "✕", color: "text-red-500" },
}

function getStatusDisplay(status: string): {
  icon: string
  color: string
  label: string
} {
  const entry = STATUS_DISPLAY[status] ?? {
    icon: "□",
    color: "text-muted-foreground",
  }
  return { ...entry, label: status.toUpperCase() }
}

type WorkflowColumn = {
  key: string
  label: string
  icon: string
  color: string
}

const PRIORITY_ICON: Record<string, string> = {
  highest: "⬆⬆",
  high: "⬆",
  medium: "→",
  low: "⬇",
  lowest: "⬇⬇",
}

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  story: { icon: "⚡", color: "text-green-600" },
  task: { icon: "☑", color: "text-blue-600" },
  bug: { icon: "●", color: "text-red-600" },
  subtask: { icon: "◦", color: "text-cyan-600" },
}

type StatusKey = string

// ── Draggable Issue Card ─────────────────────────────────────────────
function SortableIssueCard({
  issue,
  users,
  epics,
  colKey,
  columns,
  moveIssue,
}: {
  issue: Issue
  users: User[]
  epics: Epic[]
  colKey: StatusKey
  columns: WorkflowColumn[]
  moveIssue: (key: string, status: StatusKey) => void
}) {
  const { openIssue } = useIssueDrawer()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id, data: { status: colKey } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const assignee = users.find((u) => u.id === issue.assigneeId)
  const epic = epics.find((e) => e.id === issue.epicId)
  const typeInfo = TYPE_ICON[issue.type]

  const handleCardClick = () => {
    if (!isDragging) openIssue(issue.key)
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="group cursor-pointer shadow-none transition-colors hover:border-primary/30"
        onClick={handleCardClick}
      >
        <CardContent className="p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger
                  render={<span className={`text-xs ${typeInfo.color}`} />}
                >
                  {typeInfo.icon}
                </TooltipTrigger>
                <TooltipContent>
                  {typeLabel[issue.type] ?? issue.type}
                </TooltipContent>
              </Tooltip>
              <Link
                href={`/issue/${issue.key}`}
                className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-primary"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {issue.key}
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="size-3.5 text-muted-foreground"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns
                  .filter((s) => s.key !== colKey)
                  .map((s) => (
                    <DropdownMenuItem
                      key={s.key}
                      onClick={() => moveIssue(issue.key, s.key)}
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="mr-1.5 size-3"
                      />
                      Move to {s.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link
            href={`/issue/${issue.key}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <p className="mb-1.5 line-clamp-2 cursor-pointer text-sm leading-snug font-medium transition-colors hover:text-primary">
              {issue.summary}
            </p>
          </Link>

          {epic && (
            <p className="mb-2 truncate text-[10px] text-purple-600 dark:text-purple-400">
              {epic.name}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className={`px-1 py-0 text-[9px] ${typeVariant[issue.type]}`}
              >
                {typeLabel[issue.type] ?? issue.type}
              </Badge>
              <Badge
                variant="secondary"
                className={`px-1 py-0 text-[9px] ${priorityVariant[issue.priority]}`}
              >
                {PRIORITY_ICON[issue.priority]} {issue.priority}
              </Badge>
              {issue.storyPoints != null && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                  {issue.storyPoints}
                </span>
              )}
            </div>
            {assignee && (
              <Tooltip>
                <TooltipTrigger render={<span />}>
                  <Avatar className="size-5">
                    <AvatarImage src={assignee.avatar} />
                    <AvatarFallback className="text-[8px]">
                      {assignee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{assignee.name}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Drag Overlay Card ────────────────────────────────────────────────
function DragOverlayCard({ issue, users }: { issue: Issue; users: User[] }) {
  const assignee = users.find((u) => u.id === issue.assigneeId)
  const typeInfo = TYPE_ICON[issue.type]

  return (
    <Card className="w-[264px] rotate-2 border-primary/40 shadow-lg">
      <CardContent className="p-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          <span className={`text-xs ${typeInfo.color}`}>{typeInfo.icon}</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {issue.key}
          </span>
        </div>
        <p className="mb-2 line-clamp-2 text-sm leading-snug font-medium">
          {issue.summary}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className={`px-1 py-0 text-[9px] ${typeVariant[issue.type]}`}
            >
              {typeLabel[issue.type]}
            </Badge>
            <Badge
              variant="secondary"
              className={`px-1 py-0 text-[9px] ${priorityVariant[issue.priority]}`}
            >
              {issue.priority}
            </Badge>
          </div>
          {assignee && (
            <Avatar className="size-5">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-[8px]">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Droppable Column ─────────────────────────────────────────────────
function DroppableColumn({
  col,
  columns,
  issues: colIssues,
  users,
  epics,
  moveIssue,
  isLast,
  onCreateInColumn,
}: {
  col: WorkflowColumn
  columns: WorkflowColumn[]
  issues: Issue[]
  users: User[]
  epics: Epic[]
  moveIssue: (key: string, status: StatusKey) => void
  isLast: boolean
  onCreateInColumn: (status: string) => void
}) {
  return (
    <div
      className={`group/col flex min-w-[280px] flex-1 flex-col ${!isLast ? "border-r" : ""}`}
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2.5">
        <span className={`text-sm ${col.color}`}>{col.icon}</span>
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">
          {col.label}
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/60 tabular-nums">
          {colIssues.length}
        </span>
        <button
          aria-label={`Create issue in ${col.label}`}
          title={`Create issue in ${col.label}`}
          className="flex size-6 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-accent hover:text-muted-foreground"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onCreateInColumn(col.key)
          }}
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <ScrollArea className="flex-1">
        <SortableContext
          items={colIssues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="flex min-h-[100px] flex-col gap-1.5 p-2"
            data-column={col.key}
          >
            {colIssues.map((issue) => (
              <SortableIssueCard
                key={issue.id}
                issue={issue}
                users={users}
                epics={epics}
                colKey={col.key}
                columns={columns}
                moveIssue={moveIssue}
              />
            ))}
            {colIssues.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
                <span className={`mb-1 text-2xl ${col.color}`}>{col.icon}</span>
                <span className="text-xs">No issues</span>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>

      {/* + Create button at bottom of column */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onCreateInColumn(col.key)
        }}
        className="flex items-center gap-1.5 border-t px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create
      </button>
    </div>
  )
}

// ── Main Board ───────────────────────────────────────────────────────
export default function BoardPage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [inlineCreateStatus, setInlineCreateStatus] = useState<string | null>(
    null
  )
  const [inlineCreateText, setInlineCreateText] = useState("")
  const [searchBoard, setSearchBoard] = useState("")
  const [groupBy, setGroupBy] = useState<string>("none")
  const [sprintCompleteOpen, setSprintCompleteOpen] = useState(false)
  const [starred, setStarred] = useState(false)
  const [addPeopleOpen, setAddPeopleOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectKey}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([p, i, u, e]) => {
      setProject(p)
      setIssues(i)
      setUsers(u)
      setEpics(e)
      setLoading(false)
    })
  }, [projectKey])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const moveIssue = useCallback((issueKey: string, newStatus: StatusKey) => {
    setIssues((prev) =>
      prev.map((i) => (i.key === issueKey ? { ...i, status: newStatus } : i))
    )
    fetch(`/api/data/issues/${issueKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeStatus = active.data.current?.status as StatusKey | undefined
    const overStatus = over.data.current?.status as StatusKey | undefined

    if (activeStatus && overStatus && activeStatus !== overStatus) {
      setIssues((prev) =>
        prev.map((i) => (i.id === active.id ? { ...i, status: overStatus } : i))
      )
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      if (!over) return

      const overStatus = over.data.current?.status as StatusKey | undefined
      if (overStatus) {
        const issue = issues.find((i) => i.id === active.id)
        if (issue) {
          fetch(`/api/data/issues/${issue.key}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: overStatus }),
          })
        }
      }
    },
    [issues]
  )

  const handleInlineCreate = useCallback(
    async (status: string, summary: string) => {
      if (!summary.trim() || !project) return
      try {
        const res = await fetch("/api/data/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: summary.trim(),
            type: "task",
            status,
            priority: "medium",
            projectId: project.id,
            reporterId: "usr-1",
          }),
        })
        if (res.ok) {
          const issue = await res.json()
          setIssues((prev) => [...prev, issue])
        }
      } catch {
        /* ignore */
      }
      setInlineCreateStatus(null)
      setInlineCreateText("")
    },
    [project]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!project || (project as Record<string, unknown>).error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Project not found.
      </div>
    )
  }

  const projectIssues = issues
    .filter((i) => i.projectId === project.id)
    .filter((i) => !filterType || i.type === filterType)
    .filter((i) => !filterAssignee || i.assigneeId === filterAssignee)

  const hasFilters = filterType || filterAssignee
  const projectUsers = users.filter((u) =>
    issues.some((i) => i.projectId === project.id && i.assigneeId === u.id)
  )
  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null

  // Derive board columns from the project's workflow. Fallback to the legacy
  // 4-state workflow if the project predates custom workflows.
  const workflow: string[] =
    project.workflow && project.workflow.length > 0
      ? project.workflow
      : ["to_do", "in_progress", "in_review", "done"]
  const columns: WorkflowColumn[] = workflow.map((status) => {
    const display = getStatusDisplay(status)
    return {
      key: status,
      label: display.label,
      icon: display.icon,
      color: display.color,
    }
  })

  // Filter by search
  const searchFiltered = searchBoard.trim()
    ? projectIssues.filter(
        (i) =>
          i.summary.toLowerCase().includes(searchBoard.toLowerCase()) ||
          i.key.toLowerCase().includes(searchBoard.toLowerCase())
      )
    : projectIssues

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Breadcrumb + Project name + action icons */}
        <div className="px-6 pt-4 pb-1">
          <p className="mb-1 text-xs text-muted-foreground">
            <Link href="/projects" className="hover:underline">
              Spaces
            </Link>
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78m0 0L12 8l7-7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold">{project.name}</h1>
              {/* Team members button */}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      aria-label="Team members"
                      className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                    />
                  }
                >
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>Team members</TooltipContent>
              </Tooltip>
              {/* Three dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      aria-label="More actions"
                      className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    className="size-4 text-muted-foreground"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 py-2">
                  <DropdownMenuItem
                    onClick={() => {
                      setStarred(!starred)
                      setToast(
                        starred ? "Removed from starred" : "Project starred"
                      )
                    }}
                    className="gap-3 px-4 py-2.5"
                  >
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill={starred ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-sm">
                      {starred ? "Remove from starred" : "Add to starred"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setAddPeopleOpen(true)}
                    className="gap-3 px-4 py-2.5"
                  >
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span className="text-sm">Add people</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setToast("Available on Enterprise plan")}
                    className="gap-3 px-4 py-2.5"
                  >
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span className="text-sm">Save as template</span>
                    <span className="ml-auto rounded border border-purple-300 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-purple-600 dark:border-purple-700 dark:text-purple-400">
                      ENTERPRISE
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setToast("Background picker coming soon")}
                    className="gap-3 px-4 py-2.5"
                  >
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                    </svg>
                    <span className="flex-1 text-sm">Set space background</span>
                    <svg
                      className="size-4 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      (window.location.href = `/projects/${project.key}/settings`)
                    }
                    className="gap-3 px-4 py-2.5"
                  >
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span className="text-sm">Space settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setArchiveConfirmOpen(true)}
                    className="gap-3 px-4 py-2.5"
                  >
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="3" width="20" height="5" rx="1" />
                      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                      <path d="M10 12h4" />
                    </svg>
                    <span className="text-sm">Archive space</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="gap-3 px-4 py-2.5 text-red-500 focus:text-red-500"
                  >
                    <svg
                      className="size-5 shrink-0 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="text-sm">Delete space</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Footer: project type badge */}
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <svg
                      className="size-5 shrink-0 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M22 2L13.8 22l-2.6-8.2L3 11.2 22 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Software space</p>
                      <p className="text-xs text-muted-foreground">
                        {project.teamManaged
                          ? "Team-managed"
                          : "Company-managed"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right action icons */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      aria-label="Share"
                      className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                    />
                  }
                >
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      aria-label="Automation"
                      className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                    />
                  }
                >
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>Automation</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      aria-label="Board settings"
                      className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                    />
                  }
                >
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>Board settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      aria-label="Full screen"
                      className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                    />
                  }
                >
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>Full screen</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="border-b px-6">
          <div className="flex items-center gap-0">
            {[
              {
                label: "Summary",
                href: `/projects/${project.key}/summary`,
                icon: (
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ),
              },
              {
                label: "Backlog",
                href: `/projects/${project.key}/backlog`,
                icon: (
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M7 7h10M7 12h10M7 17h6" />
                  </svg>
                ),
              },
              {
                label: "Board",
                href: `/projects/${project.key}/board`,
                active: true,
                icon: (
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="5" height="18" rx="1" />
                    <rect x="10" y="3" width="5" height="18" rx="1" />
                    <rect x="17" y="3" width="5" height="18" rx="1" />
                  </svg>
                ),
              },
              {
                label: "Code",
                href: `/projects/${project.key}/code`,
                icon: (
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                ),
              },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab.active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            ))}
            {/* Add tab button */}
            <button className="ml-1 flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-2">
            {/* Search board */}
            <div className="relative">
              <svg
                className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={searchBoard}
                onChange={(e) => setSearchBoard(e.target.value)}
                placeholder="Search board"
                className="h-8 w-[160px] rounded-md border bg-background pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* User avatar */}
            <Avatar className="size-7 cursor-pointer">
              <AvatarFallback className="bg-blue-500 text-[10px] text-white">
                AS
              </AvatarFallback>
            </Avatar>

            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={hasFilters ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  />
                }
              >
                <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
                Filter
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setFilterType(null)
                    setFilterAssignee(null)
                  }}
                >
                  Clear all
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs font-semibold text-muted-foreground"
                  disabled
                >
                  Type
                </DropdownMenuItem>
                {Object.entries(TYPE_ICON).map(([key, cfg]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() =>
                      setFilterType(filterType === key ? null : key)
                    }
                  >
                    <span className={`mr-1 ${cfg.color}`}>{cfg.icon}</span>{" "}
                    {typeLabel[key] ?? key}
                    {filterType === key && (
                      <svg
                        className="ml-auto size-3 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs font-semibold text-muted-foreground"
                  disabled
                >
                  Assignee
                </DropdownMenuItem>
                {projectUsers.map((u) => (
                  <DropdownMenuItem
                    key={u.id}
                    onClick={() =>
                      setFilterAssignee(filterAssignee === u.id ? null : u.id)
                    }
                  >
                    <Avatar className="mr-1.5 size-4">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback className="text-[7px]">
                        {u.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {u.name}
                    {filterAssignee === u.id && (
                      <svg
                        className="ml-auto size-3 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Complete sprint */}
            {project.type === "scrum" && (
              <Button
                size="sm"
                className="h-8 bg-blue-600 text-xs font-medium text-white hover:bg-blue-700"
                onClick={() => setSprintCompleteOpen(true)}
              >
                Complete sprint
              </Button>
            )}

            {/* Refresh */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    aria-label="Refresh"
                    className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                  />
                }
                onClick={() => {
                  setLoading(true)
                  Promise.all([
                    fetch(`/api/data/projects/${projectKey}`).then((r) =>
                      r.json()
                    ),
                    fetch("/api/data/issues").then((r) => r.json()),
                    fetch("/api/data/users").then((r) => r.json()),
                    fetch("/api/data/epics").then((r) => r.json()),
                  ]).then(([p, i, u, e]) => {
                    setProject(p)
                    setIssues(i)
                    setUsers(u)
                    setEpics(e)
                    setLoading(false)
                  })
                }}
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            {/* Group dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    aria-label="Group by"
                    className="flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  />
                }
              >
                Group
                <svg
                  className="size-3 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[
                  { value: "none", label: "None" },
                  { value: "assignee", label: "Assignee" },
                  { value: "priority", label: "Priority" },
                  { value: "type", label: "Type" },
                ].map((g) => (
                  <DropdownMenuItem
                    key={g.value}
                    onClick={() => setGroupBy(g.value)}
                  >
                    {g.label}
                    {groupBy === g.value && (
                      <svg
                        className="ml-auto size-3 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Insights */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    aria-label="Insights"
                    className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                  />
                }
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </TooltipTrigger>
              <TooltipContent>Insights</TooltipContent>
            </Tooltip>

            {/* Board settings */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    aria-label="Board settings"
                    className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                  />
                }
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.64-6.36l-.7.7M6.34 17.66l-.7.7m0-12.72l.7.7m11.32 11.32l.7.7" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </TooltipTrigger>
              <TooltipContent>Board settings</TooltipContent>
            </Tooltip>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    aria-label="More options"
                    className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                  />
                }
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="size-4 text-muted-foreground"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export board</DropdownMenuItem>
                <DropdownMenuItem>Print board</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Configure board</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sprint complete confirmation */}
        {sprintCompleteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setSprintCompleteOpen(false)}
          >
            <div className="fixed inset-0 bg-black/50" />
            <div
              className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-base font-semibold">Complete sprint</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {
                  projectIssues.filter(
                    (i) => i.status === workflow[workflow.length - 1]
                  ).length
                }{" "}
                of {projectIssues.length} issues are done. Incomplete issues
                will be moved to the backlog.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSprintCompleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setSprintCompleteOpen(false)}
                >
                  Complete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Board columns with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 overflow-x-auto">
            {columns.map((col, colIdx) => {
              const colIssues = searchFiltered.filter(
                (i) => i.status === col.key
              )
              return (
                <DroppableColumn
                  key={col.key}
                  col={col}
                  columns={columns}
                  issues={colIssues}
                  users={users}
                  epics={epics}
                  moveIssue={moveIssue}
                  isLast={colIdx === columns.length - 1}
                  onCreateInColumn={(status) => {
                    setInlineCreateStatus(status)
                    setInlineCreateText("")
                  }}
                />
              )
            })}
            {/* Add column / create issue button */}
            <div className="flex shrink-0 items-start px-2 pt-2.5">
              <button
                aria-label="Create issue"
                title="Create issue"
                className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
                onClick={() => {
                  setInlineCreateStatus(workflow[workflow.length - 1])
                  setInlineCreateText("")
                }}
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeIssue ? (
              <DragOverlayCard issue={activeIssue} users={users} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Inline create input */}
        {inlineCreateStatus && (
          <div
            className="fixed inset-0 z-50"
            onClick={() => setInlineCreateStatus(null)}
          >
            <div className="fixed inset-0 bg-black/30" />
            <div
              className="fixed top-1/3 left-1/2 z-10 w-full max-w-[400px] -translate-x-1/2 rounded-lg border bg-popover p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-2 text-sm font-medium">
                Create issue in &quot;{inlineCreateStatus}&quot;
              </p>
              <input
                value={inlineCreateText}
                onChange={(e) => setInlineCreateText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inlineCreateText.trim())
                    handleInlineCreate(inlineCreateStatus, inlineCreateText)
                  if (e.key === "Escape") setInlineCreateStatus(null)
                }}
                autoFocus
                placeholder="What needs to be done?"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInlineCreateStatus(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!inlineCreateText.trim()}
                  onClick={() =>
                    handleInlineCreate(inlineCreateStatus, inlineCreateText)
                  }
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add people modal */}
      {addPeopleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setAddPeopleOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">
                Add people to {project.name}
              </h3>
              <button
                onClick={() => setAddPeopleOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Invite team members by email address.
              </p>
              <input
                placeholder="Enter email addresses"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddPeopleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setAddPeopleOpen(false)
                  setToast("Invitations sent")
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      {archiveConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setArchiveConfirmOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-semibold">
              Archive this space?
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Archived spaces can be restored later from the project directory.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setArchiveConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setArchiveConfirmOpen(false)
                  setToast("Space archived")
                }}
              >
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-5 py-4">
              <h3 className="text-base font-semibold text-red-600">
                Delete {project.name}?
              </h3>
            </div>
            <div className="px-5 py-4">
              <p className="mb-3 text-sm text-muted-foreground">
                This action cannot be undone. All issues, sprints, and project
                data will be permanently deleted.
              </p>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Warning: This will permanently delete all{" "}
                  {projectIssues.length} issues in this project.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setToast("Space deleted")
                  window.location.href = "/projects"
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 rounded-lg border bg-popover px-4 py-2.5 shadow-lg">
            <svg
              className="size-4 shrink-0 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
