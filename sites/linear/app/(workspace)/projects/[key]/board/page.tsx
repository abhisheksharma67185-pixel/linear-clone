"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, Member, Team, Label } from "@/app/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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

const STATUS_COLUMNS = [
  {
    key: "backlog",
    label: "Backlog",
    icon: "○",
    color: "text-gray-400",
    dotColor: "bg-gray-400",
  },
  {
    key: "todo",
    label: "Todo",
    icon: "◉",
    color: "text-blue-500",
    dotColor: "bg-blue-500",
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: "◐",
    color: "text-yellow-500",
    dotColor: "bg-yellow-500",
  },
  {
    key: "done",
    label: "Done",
    icon: "●",
    color: "text-green-500",
    dotColor: "bg-green-500",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: "⊘",
    color: "text-red-400",
    dotColor: "bg-red-400",
  },
] as const

const PRIORITY_CONFIG: Record<
  string,
  { label: string; icon: string; style: string }
> = {
  urgent: {
    label: "Urgent",
    icon: "⚡",
    style:
      "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400",
  },
  high: {
    label: "High",
    icon: "↑",
    style:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-400",
  },
  medium: {
    label: "Medium",
    icon: "→",
    style:
      "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400",
  },
  low: {
    label: "Low",
    icon: "↓",
    style:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400",
  },
  none: {
    label: "None",
    icon: "—",
    style:
      "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400",
  },
}

type StatusKey = (typeof STATUS_COLUMNS)[number]["key"]

// ── Draggable Issue Card ─────────────────────────────────────────────
function SortableIssueCard({
  issue,
  members,
  labels: allLabels,
  colKey,
  moveIssue,
}: {
  issue: Issue
  members: Member[]
  labels: Label[]
  colKey: StatusKey
  moveIssue: (id: string, status: StatusKey) => void
}) {
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

  const assignee = members.find((m) => m.id === issue.assigneeId)
  const issueLabels = allLabels.filter((l) => issue.labelIds.includes(l.id))
  const priority = PRIORITY_CONFIG[issue.priority]

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className="group hover:border-primary/30 cursor-grab shadow-none transition-colors active:cursor-grabbing"
        {...listeners}
      >
        <CardContent className="p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <Link
              href={`/issues/${issue.identifier}`}
              className="text-muted-foreground hover:text-primary font-mono text-[10px] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {issue.identifier}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="text-muted-foreground size-3.5"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUS_COLUMNS.filter((s) => s.key !== colKey).map((s) => (
                  <DropdownMenuItem
                    key={s.key}
                    onClick={() => moveIssue(issue.id, s.key)}
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
            href={`/issues/${issue.identifier}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <p className="hover:text-primary mb-2 line-clamp-2 cursor-pointer text-sm leading-snug font-medium transition-colors">
              {issue.title}
            </p>
          </Link>

          {issueLabels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {issueLabels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span
                      className={`inline-flex items-center rounded border px-1 py-0.5 text-[9px] font-medium ${priority.style}`}
                    />
                  }
                >
                  {priority.icon}
                </TooltipTrigger>
                <TooltipContent>{priority.label} priority</TooltipContent>
              </Tooltip>
              {issue.estimate != null && (
                <span className="text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 text-[10px] tabular-nums">
                  {issue.estimate}
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

// ── Drag Overlay Card (ghost shown while dragging) ───────────────────
function DragOverlayCard({
  issue,
  members,
  labels: allLabels,
}: {
  issue: Issue
  members: Member[]
  labels: Label[]
}) {
  const assignee = members.find((m) => m.id === issue.assigneeId)
  const priority = PRIORITY_CONFIG[issue.priority]
  const issueLabels = allLabels.filter((l) => issue.labelIds.includes(l.id))

  return (
    <Card className="border-primary/40 w-[244px] rotate-2 shadow-lg">
      <CardContent className="p-2.5">
        <p className="text-muted-foreground mb-1 font-mono text-[10px]">
          {issue.identifier}
        </p>
        <p className="mb-2 line-clamp-2 text-sm leading-snug font-medium">
          {issue.title}
        </p>
        {issueLabels.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {issueLabels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded border px-1 py-0.5 text-[9px] font-medium ${priority.style}`}
          >
            {priority.icon}
          </span>
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
  issues: colIssues,
  members,
  labels,
  moveIssue,
  isLast,
}: {
  col: (typeof STATUS_COLUMNS)[number]
  issues: Issue[]
  members: Member[]
  labels: Label[]
  moveIssue: (id: string, status: StatusKey) => void
  isLast: boolean
}) {
  return (
    <div
      className={`flex w-[260px] min-w-[260px] flex-shrink-0 flex-col ${!isLast ? "border-r" : ""}`}
    >
      <div className="bg-muted/30 flex items-center gap-2 border-b px-3 py-2.5">
        <span className={`text-sm ${col.color}`}>{col.icon}</span>
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {col.label}
        </span>
        <span className="text-muted-foreground/60 ml-auto font-mono text-[10px] tabular-nums">
          {colIssues.length}
        </span>
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
                members={members}
                labels={labels}
                colKey={col.key}
                moveIssue={moveIssue}
              />
            ))}
            {colIssues.length === 0 && (
              <div className="text-muted-foreground/50 flex flex-col items-center justify-center py-12">
                <span className={`mb-1 text-2xl ${col.color}`}>{col.icon}</span>
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
  const teamKey = params.key

  const [team, setTeam] = useState<Team | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${teamKey}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([t, i, m, l]) => {
      setTeam(t)
      setIssues(i)
      setMembers(m)
      setLabels(l)
      setLoading(false)
    })
  }, [teamKey])

  const moveIssue = useCallback(
    (issueId: string, newStatus: StatusKey) => {
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
      )
      const issue = issues.find((i) => i.id === issueId)
      if (issue) {
        fetch(`/api/data/issues/${issue.identifier}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      }
    },
    [issues]
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
        if (issue && issue.status !== overStatus) {
          // already moved in handleDragOver, just persist
          fetch(`/api/data/issues/${issue.identifier}`, {
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
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b px-6 py-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex flex-1 gap-2 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!team || (team as Record<string, unknown>).error) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-sm text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Team not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const teamIssues = issues
    .filter((i) => i.teamId === team.id)
    .filter((i) => !filterPriority || i.priority === filterPriority)
    .filter((i) => !filterAssignee || i.assigneeId === filterAssignee)

  const hasFilters = filterPriority || filterAssignee
  const teamMembers = members.filter((m) => team.memberIds.includes(m.id))
  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold">{team.name}</h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {team.key}
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground text-xs">
              {teamIssues.length} issues
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={filterPriority ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 gap-1 text-xs"
                  />
                }
              >
                <HugeiconsIcon icon={FilterIcon} className="size-3" />
                {filterPriority
                  ? PRIORITY_CONFIG[filterPriority].label
                  : "Priority"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                  All priorities
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setFilterPriority(key)}
                  >
                    <span className="mr-1">{cfg.icon}</span> {cfg.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={filterAssignee ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 gap-1 text-xs"
                  />
                }
              >
                {filterAssignee
                  ? (members.find((m) => m.id === filterAssignee)?.name ??
                    "Assignee")
                  : "Assignee"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterAssignee(null)}>
                  All members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {teamMembers.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => setFilterAssignee(m.id)}
                  >
                    <Avatar className="mr-1.5 size-4">
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="text-[7px]">
                        {m.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {m.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-7 text-xs"
                onClick={() => {
                  setFilterPriority(null)
                  setFilterAssignee(null)
                }}
              >
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
          <div className="flex min-h-0 flex-1 overflow-x-auto">
            {STATUS_COLUMNS.map((col, colIdx) => {
              const colIssues = teamIssues.filter((i) => i.status === col.key)
              return (
                <DroppableColumn
                  key={col.key}
                  col={col}
                  issues={colIssues}
                  members={members}
                  labels={labels}
                  moveIssue={moveIssue}
                  isLast={colIdx === STATUS_COLUMNS.length - 1}
                />
              )
            })}
          </div>

          <DragOverlay>
            {activeIssue ? (
              <DragOverlayCard
                issue={activeIssue}
                members={members}
                labels={labels}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  )
}
