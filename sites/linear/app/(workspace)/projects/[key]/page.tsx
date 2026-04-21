"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Project, Issue, Member, Team } from "@/app/lib/mock-data"
import { statusStyle, priorityStyle, projectStatusStyle } from "@/lib/status-styles"
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
  Calendar03Icon,
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

function isProject(r: unknown): r is Project {
  return !!r && typeof r === "object" && "leadId" in (r as Record<string, unknown>)
}

export default function ProjectDetailPage() {
  const params = useParams<{ key: string }>()
  const key = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${key}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([p, i, m, t]) => {
      if (isProject(p)) {
        setProject(p)
      } else {
        setNotFound(true)
      }
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [key])

  const lead = useMemo(
    () => (project ? members.find((m) => m.id === project.leadId) : null),
    [project, members],
  )
  const team = useMemo(
    () => (project ? teams.find((t) => t.id === project.teamId) : null),
    [project, teams],
  )

  const projectIssues = useMemo(
    () => (project ? issues.filter((i) => i.projectId === project.id) : []),
    [project, issues],
  )

  const grouped = useMemo(() => {
    const map = new Map<IssueStatus, Issue[]>()
    for (const s of STATUS_ORDER) map.set(s, [])
    for (const issue of projectIssues) map.get(issue.status)?.push(issue)
    return map
  }, [projectIssues])

  const counts = useMemo(() => {
    const total = projectIssues.length
    const done = projectIssues.filter(
      (i) => i.status === "done" || i.status === "cancelled",
    ).length
    const inProgress = projectIssues.filter((i) => i.status === "in_progress").length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, pct }
  }, [projectIssues])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-sm text-muted-foreground">
        <p>Project not found.</p>
        <Link href="/projects" className="text-xs underline">
          Back to projects
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
              <Link href="/projects" aria-label="Back to projects">
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
              </Link>
            </Button>
            <ProjectIcon name={project.name} />
            <h1 className="truncate text-sm font-medium">{project.name}</h1>
            <Badge
              variant="secondary"
              className={`shrink-0 text-[10px] ${projectStatusStyle[project.status]}`}
            >
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-0.5 text-muted-foreground">
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

        <div className="flex flex-col gap-3 border-b px-6 pb-4">
          <p className="text-sm text-muted-foreground">{project.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {lead && (
              <span className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarImage src={lead.avatar} alt={lead.name} />
                  <AvatarFallback className="text-[9px]">
                    {lead.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>Lead: {lead.name}</span>
              </span>
            )}
            {team && (
              <Link
                href={`/projects/${team.key}/board`}
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  {team.key}
                </span>
                <span>{team.name}</span>
              </Link>
            )}
            {project.targetDate && (
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                <span>Target {formatDate(project.targetDate)}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {counts.done} of {counts.total} done · {counts.inProgress} in progress
              </span>
              <span className="tabular-nums">{counts.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${counts.pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {projectIssues.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
              <p>No issues in this project yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {STATUS_ORDER.map((status) => {
                const items = grouped.get(status) ?? []
                if (items.length === 0) return null
                return (
                  <Collapsible key={status} defaultOpen>
                    <CollapsibleTrigger className="sticky top-0 z-10 flex w-full items-center gap-2 border-b bg-muted/50 px-6 py-1.5 text-left text-xs font-medium backdrop-blur">
                      <StatusDot status={status} />
                      <span>{STATUS_LABEL[status]}</span>
                      <span className="text-muted-foreground">{items.length}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="divide-y">
                        {items.map((issue) => (
                          <IssueRow
                            key={issue.id}
                            issue={issue}
                            members={members}
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
        className="flex items-center gap-3 px-6 py-2 text-sm transition-colors hover:bg-accent/50"
      >
        <Badge
          variant="secondary"
          className={`min-w-14 justify-center text-[10px] shrink-0 ${priorityStyle[issue.priority]}`}
        >
          {issue.priority}
        </Badge>
        <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
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

function ProjectIcon({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="flex size-5 shrink-0 items-center justify-center rounded bg-gradient-to-br from-sky-500 to-cyan-500 text-[9px] font-semibold text-white">
      {initials}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
