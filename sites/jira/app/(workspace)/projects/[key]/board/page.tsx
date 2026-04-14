"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Issue, User, Project, Epic } from "@/app/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
import { priorityVariant, typeVariant, typeLabel, projectTypeVariant } from "@/lib/badge-styles"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon, ArrowRight01Icon, FilterIcon } from "@hugeicons/core-free-icons"
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
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Map each spec workflow state to an icon + color. Unknown states fall through
// to a neutral default so agents can add custom workflow states and still get
// a sensible column visualization.
const STATUS_DISPLAY: Record<string, { icon: string; color: string }> = {
  // Open / not-started family
  "Open":             { icon: "○", color: "text-gray-400" },
  "Backlog":          { icon: "○", color: "text-gray-400" },
  "To Do":            { icon: "○", color: "text-gray-400" },
  "Ready":            { icon: "○", color: "text-gray-400" },
  "Intake":           { icon: "○", color: "text-gray-400" },
  // In progress family
  "In Development":   { icon: "◐", color: "text-blue-500" },
  "In Progress":      { icon: "◐", color: "text-blue-500" },
  "Doing":            { icon: "◐", color: "text-blue-500" },
  "Triage":           { icon: "◐", color: "text-blue-500" },
  "Investigation":    { icon: "◐", color: "text-blue-500" },
  "Fix in Progress":  { icon: "◐", color: "text-blue-500" },
  // Review family
  "Code Review":      { icon: "◑", color: "text-yellow-500" },
  "In Review":        { icon: "◑", color: "text-yellow-500" },
  "Review":           { icon: "◑", color: "text-yellow-500" },
  "Peer Review":      { icon: "◑", color: "text-yellow-500" },
  // QA / validation family
  "QA":               { icon: "◨", color: "text-purple-500" },
  "Testing":          { icon: "◨", color: "text-purple-500" },
  "Validation":       { icon: "◨", color: "text-purple-500" },
  // Staging / deploy family
  "Staging":          { icon: "◧", color: "text-orange-500" },
  "Deploying":        { icon: "◧", color: "text-orange-500" },
  "Monitoring":       { icon: "◓", color: "text-cyan-500" },
  // Done family
  "Done":             { icon: "●", color: "text-green-500" },
  "Deployed":         { icon: "●", color: "text-green-500" },
  "Closed":           { icon: "●", color: "text-green-500" },
  // Terminal-negative family
  "Won't Fix":        { icon: "✕", color: "text-red-500" },
  "Rejected":         { icon: "✕", color: "text-red-500" },
  "Cancelled":        { icon: "✕", color: "text-red-500" },
}

function getStatusDisplay(status: string): { icon: string; color: string; label: string } {
  const entry = STATUS_DISPLAY[status] ?? { icon: "□", color: "text-muted-foreground" }
  return { ...entry, label: status.toUpperCase() }
}

type WorkflowColumn = { key: string; label: string; icon: string; color: string }

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
  const router = useRouter()
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

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="group hover:border-primary/30 transition-colors shadow-none cursor-grab active:cursor-grabbing" {...listeners} onClick={() => { if (!isDragging) router.push(`/issue/${issue.key}`) }}>
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger render={<span className={`text-xs ${typeInfo.color}`} />}>
                  {typeInfo.icon}
                </TooltipTrigger>
                <TooltipContent>{typeLabel[issue.type] ?? issue.type}</TooltipContent>
              </Tooltip>
              <Link
                href={`/issue/${issue.key}`}
                className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.filter((s) => s.key !== colKey).map((s) => (
                  <DropdownMenuItem key={s.key} onClick={() => moveIssue(issue.key, s.key)}>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 mr-1.5" />
                    Move to {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link href={`/issue/${issue.key}`} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium leading-snug mb-1.5 hover:text-primary transition-colors cursor-pointer line-clamp-2">
              {issue.summary}
            </p>
          </Link>

          {epic && (
            <p className="text-[10px] text-purple-600 dark:text-purple-400 mb-2 truncate">{epic.name}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${typeVariant[issue.type]}`}>
                {typeLabel[issue.type] ?? issue.type}
              </Badge>
              <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${priorityVariant[issue.priority]}`}>
                {PRIORITY_ICON[issue.priority]} {issue.priority}
              </Badge>
              {issue.storyPoints != null && (
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
                  {issue.storyPoints}
                </span>
              )}
            </div>
            {assignee && (
              <Tooltip>
                <TooltipTrigger render={<span />}>
                  <Avatar className="size-5">
                    <AvatarImage src={assignee.avatar} />
                    <AvatarFallback className="text-[8px]">{assignee.name.charAt(0)}</AvatarFallback>
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
    <Card className="shadow-lg border-primary/40 w-[264px] rotate-2">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-xs ${typeInfo.color}`}>{typeInfo.icon}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{issue.key}</span>
        </div>
        <p className="text-sm font-medium leading-snug mb-2 line-clamp-2">{issue.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${typeVariant[issue.type]}`}>
              {typeLabel[issue.type]}
            </Badge>
            <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${priorityVariant[issue.priority]}`}>
              {issue.priority}
            </Badge>
          </div>
          {assignee && (
            <Avatar className="size-5">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-[8px]">{assignee.name.charAt(0)}</AvatarFallback>
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
}: {
  col: WorkflowColumn
  columns: WorkflowColumn[]
  issues: Issue[]
  users: User[]
  epics: Epic[]
  moveIssue: (key: string, status: StatusKey) => void
  isLast: boolean
}) {
  return (
    <div className={`flex flex-col min-w-[280px] flex-1 ${!isLast ? "border-r" : ""}`}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/30">
        <span className={`text-sm ${col.color}`}>{col.icon}</span>
        <span className="text-[11px] font-semibold text-muted-foreground tracking-wider">{col.label}</span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto font-mono">{colIssues.length}</span>
      </div>

      <ScrollArea className="flex-1">
        <SortableContext items={colIssues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5 p-2 min-h-[100px]" data-column={col.key}>
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
                <span className={`text-2xl mb-1 ${col.color}`}>{col.icon}</span>
                <span className="text-xs">No issues</span>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
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

  const moveIssue = useCallback(
    (issueKey: string, newStatus: StatusKey) => {
      setIssues((prev) =>
        prev.map((i) => (i.key === issueKey ? { ...i, status: newStatus } : i))
      )
      fetch(`/api/data/issues/${issueKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    },
    []
  )

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
  const workflow: string[] = (project.workflow && project.workflow.length > 0)
    ? project.workflow
    : ["to_do", "in_progress", "in_review", "done"]
  const columns: WorkflowColumn[] = workflow.map((status) => {
    const display = getStatusDisplay(status)
    return { key: status, label: display.label, icon: display.icon, color: display.color }
  })

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold">{project.name}</h1>
            <Badge variant="outline" className={`text-[10px] ${projectTypeVariant[project.type]}`}>
              {project.type} board
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground">{projectIssues.length} issues</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant={filterType ? "secondary" : "ghost"} size="sm" className="h-7 text-xs gap-1" />}>
                <HugeiconsIcon icon={FilterIcon} className="size-3" />
                {filterType ? (typeLabel[filterType] ?? filterType) : "Type"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType(null)}>All types</DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(TYPE_ICON).map(([key, cfg]) => (
                  <DropdownMenuItem key={key} onClick={() => setFilterType(key)}>
                    <span className={`mr-1 ${cfg.color}`}>{cfg.icon}</span> {typeLabel[key] ?? key}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant={filterAssignee ? "secondary" : "ghost"} size="sm" className="h-7 text-xs gap-1" />}>
                {filterAssignee ? users.find((u) => u.id === filterAssignee)?.name ?? "Assignee" : "Assignee"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterAssignee(null)}>All members</DropdownMenuItem>
                <DropdownMenuSeparator />
                {projectUsers.map((u) => (
                  <DropdownMenuItem key={u.id} onClick={() => setFilterAssignee(u.id)}>
                    <Avatar className="size-4 mr-1.5">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback className="text-[7px]">{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {u.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { setFilterType(null); setFilterAssignee(null) }}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Board columns with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 min-h-0 overflow-x-auto">
            {columns.map((col, colIdx) => {
              const colIssues = projectIssues.filter((i) => i.status === col.key)
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
                />
              )
            })}
          </div>

          <DragOverlay>
            {activeIssue ? <DragOverlayCard issue={activeIssue} users={users} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  )
}
