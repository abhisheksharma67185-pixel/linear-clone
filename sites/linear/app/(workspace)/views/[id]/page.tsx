"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type {
  View,
  Issue,
  Member,
  Team,
  Cycle,
  Label,
} from "@/app/lib/mock-data"
import { statusStyle, priorityStyle } from "@/lib/status-styles"
import { filterIssuesForView } from "@/lib/view-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  PanelRightIcon,
  BarChartIcon,
  ArrowLeft02Icon,
} from "@hugeicons/core-free-icons"

type IssueStatus = Issue["status"]

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
  cancelled: "Cancelled",
}

export default function ViewDetailPage() {
  const params = useParams<{ id: string }>()
  const viewId = params.id

  const [views, setViews] = useState<View[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([v, i, m, t, c, l]) => {
      setViews(v)
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setCycles(c)
      setLabels(Array.isArray(l) ? l : [])
      setLoading(false)
    })
  }, [])

  const view = views.find((v) => v.id === viewId) ?? null
  const owner = useMemo(
    () => (view ? members.find((m) => m.id === view.ownerId) : null),
    [view, members]
  )
  const team = useMemo(
    () => (view ? teams.find((t) => t.id === view.teamId) : null),
    [view, teams]
  )

  const filtered = useMemo(() => {
    if (!view) return []
    return filterIssuesForView(view, issues, { labels, cycles })
  }, [view, issues, labels, cycles])

  const grouped = useMemo(() => {
    const map = new Map<IssueStatus, Issue[]>()
    for (const status of STATUS_ORDER) map.set(status, [])
    for (const issue of filtered) {
      map.get(issue.status)?.push(issue)
    }
    return map
  }, [filtered])

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
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center justify-between gap-3 px-6 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              asChild
            >
              <Link href="/views" aria-label="Back to views">
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
              </Link>
            </Button>
            <ViewIcon name={view.name} />
            <h1 className="truncate text-sm font-medium">{view.name}</h1>
            <span className="text-muted-foreground shrink-0 text-xs">
              {filtered.length}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={FilterIcon} className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={BarChartIcon} className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={PanelRightIcon} className="size-4" />
            </Button>
          </div>
        </header>

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 px-6 pb-3 text-xs">
          {owner && (
            <span className="flex items-center gap-1.5">
              <Avatar className="size-4">
                <AvatarImage src={owner.avatar} alt={owner.name} />
                <AvatarFallback className="text-[8px]">
                  {owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{owner.name}</span>
            </span>
          )}
          {team && (
            <>
              <span className="text-border">·</span>
              <span className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-[10px]">
                {team.key}
              </span>
            </>
          )}
          <span className="text-border">·</span>
          <code className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-[10px]">
            {view.filterQuery}
          </code>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-24 text-sm">
              <p>No issues match this view.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/*
                Render every workflow state, even when its bucket is
                empty. The previous implementation skipped empty
                statuses (`if (items.length === 0) return null`), which
                meant a board-style view of "Backlog (5)" and four
                empty statuses collapsed visually to a single column.
                Hiding empty columns is a per-user "Display options"
                preference, not the renderer's default.
              */}
              {STATUS_ORDER.map((status) => {
                const items = grouped.get(status) ?? []
                return (
                  <Collapsible key={status} defaultOpen>
                    <CollapsibleTrigger
                      data-status={status}
                      className="bg-muted/50 sticky top-0 z-10 flex w-full items-center gap-2 border-b px-6 py-1.5 text-left text-xs font-medium backdrop-blur"
                    >
                      <StatusDot status={status} />
                      <span>{STATUS_LABEL[status]}</span>
                      <span className="text-muted-foreground">
                        {items.length}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {items.length === 0 ? (
                        <p className="text-muted-foreground/70 px-6 py-3 text-xs italic">
                          No issues
                        </p>
                      ) : (
                        <ul className="divide-y">
                          {items.map((issue) => (
                            <IssueRow
                              key={issue.id}
                              issue={issue}
                              members={members}
                            />
                          ))}
                        </ul>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

function IssueRow({ issue, members }: { issue: Issue; members: Member[] }) {
  const assignee = members.find((m) => m.id === issue.assigneeId)
  return (
    <li>
      <Link
        href={`/issues/${issue.identifier}`}
        className="hover:bg-accent/50 flex items-center gap-3 px-6 py-2 text-sm transition-colors"
      >
        <Badge
          variant="secondary"
          className={`min-w-14 shrink-0 justify-center text-[10px] ${priorityStyle[issue.priority]}`}
        >
          {issue.priority}
        </Badge>
        <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
          {issue.identifier}
        </span>
        <span className="flex-1 truncate">{issue.title}</span>
        <Badge
          variant="secondary"
          className={`shrink-0 text-[10px] ${statusStyle[issue.status]}`}
        >
          {STATUS_LABEL[issue.status]}
        </Badge>
        {assignee ? (
          <Tooltip>
            <TooltipTrigger render={<span className="shrink-0" />}>
              <Avatar className="size-6">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="text-[10px]">
                  {assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{assignee.name}</TooltipContent>
          </Tooltip>
        ) : (
          <div className="size-6 shrink-0 rounded-full border border-dashed" />
        )}
      </Link>
    </li>
  )
}

function StatusDot({ status }: { status: IssueStatus }) {
  const color: Record<IssueStatus, string> = {
    in_progress: "bg-amber-500",
    todo: "bg-muted-foreground/60",
    backlog: "bg-muted-foreground/30",
    done: "bg-emerald-500",
    cancelled: "bg-zinc-500",
  }
  return <span className={`size-2 rounded-full ${color[status]}`} />
}

function ViewIcon({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="flex size-5 shrink-0 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-indigo-500 text-[9px] font-semibold text-white">
      {initials}
    </div>
  )
}
