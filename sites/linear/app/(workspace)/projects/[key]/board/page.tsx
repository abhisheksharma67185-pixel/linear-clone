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

const STATUS_COLUMNS = [
  { key: "backlog", label: "Backlog", icon: "○", color: "text-gray-400", dotColor: "bg-gray-400" },
  { key: "todo", label: "Todo", icon: "◉", color: "text-blue-500", dotColor: "bg-blue-500" },
  { key: "in_progress", label: "In Progress", icon: "◐", color: "text-yellow-500", dotColor: "bg-yellow-500" },
  { key: "done", label: "Done", icon: "●", color: "text-green-500", dotColor: "bg-green-500" },
  { key: "cancelled", label: "Cancelled", icon: "⊘", color: "text-red-400", dotColor: "bg-red-400" },
] as const

const PRIORITY_CONFIG: Record<string, { label: string; icon: string; style: string }> = {
  urgent: { label: "Urgent", icon: "⚡", style: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400" },
  high: { label: "High", icon: "↑", style: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-400" },
  medium: { label: "Medium", icon: "→", style: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400" },
  low: { label: "Low", icon: "↓", style: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400" },
  none: { label: "None", icon: "—", style: "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400" },
}

type StatusKey = typeof STATUS_COLUMNS[number]["key"]

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
      fetch(`/api/data/issues/${issues.find((i) => i.id === issueId)?.identifier}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
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

  if (!team || (team as Record<string, unknown>).error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Team not found.
      </div>
    )
  }

  const teamIssues = issues
    .filter((i) => i.teamId === team.id)
    .filter((i) => !filterPriority || i.priority === filterPriority)
    .filter((i) => !filterAssignee || i.assigneeId === filterAssignee)

  const hasFilters = filterPriority || filterAssignee
  const teamMembers = members.filter((m) => team.memberIds.includes(m.id))

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold">{team.name}</h1>
            <Badge variant="outline" className="text-[10px] font-mono">
              {team.key}
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground">
              {teamIssues.length} issues
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Priority filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={filterPriority ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                  />
                }
              >
                <HugeiconsIcon icon={FilterIcon} className="size-3" />
                {filterPriority ? PRIORITY_CONFIG[filterPriority].label : "Priority"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                  All priorities
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <DropdownMenuItem key={key} onClick={() => setFilterPriority(key)}>
                    <span className="mr-1">{cfg.icon}</span> {cfg.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assignee filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={filterAssignee ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                  />
                }
              >
                {filterAssignee
                  ? members.find((m) => m.id === filterAssignee)?.name ?? "Assignee"
                  : "Assignee"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterAssignee(null)}>
                  All members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {teamMembers.map((m) => (
                  <DropdownMenuItem key={m.id} onClick={() => setFilterAssignee(m.id)}>
                    <Avatar className="size-4 mr-1.5">
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="text-[7px]">{m.name.charAt(0)}</AvatarFallback>
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
                className="h-7 text-xs text-muted-foreground"
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

        {/* Board columns */}
        <div className="flex flex-1 min-h-0 overflow-x-auto">
          {STATUS_COLUMNS.map((col, colIdx) => {
            const colIssues = teamIssues.filter((i) => i.status === col.key)
            return (
              <div
                key={col.key}
                className={`flex flex-col min-w-[260px] w-[260px] flex-shrink-0 ${
                  colIdx < STATUS_COLUMNS.length - 1 ? "border-r" : ""
                }`}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/30">
                  <span className={`text-sm ${col.color}`}>{col.icon}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto font-mono">
                    {colIssues.length}
                  </span>
                </div>

                {/* Issue cards */}
                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-1.5 p-2">
                    {colIssues.map((issue) => {
                      const assignee = members.find((m) => m.id === issue.assigneeId)
                      const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id))
                      const priority = PRIORITY_CONFIG[issue.priority]

                      return (
                        <Card
                          key={issue.id}
                          className="group hover:border-primary/30 transition-colors shadow-none"
                        >
                          <CardContent className="p-2.5">
                            {/* Top row: identifier + actions */}
                            <div className="flex items-center justify-between mb-1">
                              <Link
                                href={`/issues/${issue.identifier}`}
                                className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
                              >
                                {issue.identifier}
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted" />
                                  }
                                >
                                  <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {STATUS_COLUMNS.filter((s) => s.key !== col.key).map((s) => (
                                    <DropdownMenuItem
                                      key={s.key}
                                      onClick={() => moveIssue(issue.id, s.key)}
                                    >
                                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 mr-1.5" />
                                      Move to {s.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Title */}
                            <Link href={`/issues/${issue.identifier}`}>
                              <p className="text-sm font-medium leading-snug mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                {issue.title}
                              </p>
                            </Link>

                            {/* Labels */}
                            {issueLabels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
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

                            {/* Bottom row: priority + estimate + assignee */}
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
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums" />
                                      }
                                    >
                                      {issue.estimate}
                                    </TooltipTrigger>
                                    <TooltipContent>{issue.estimate} points</TooltipContent>
                                  </Tooltip>
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
                      )
                    })}
                    {colIssues.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
                        <span className={`text-2xl mb-1 ${col.color}`}>{col.icon}</span>
                        <span className="text-xs">No issues</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
