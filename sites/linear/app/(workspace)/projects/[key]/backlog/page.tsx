"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, Member, Team, Cycle, Project } from "@/app/lib/mock-data"
import { useDocumentTitle } from "@/lib/use-document-title"
import {
  statusStyle,
  priorityStyle,
  cycleStateStyle,
} from "@/lib/status-styles"
import { Badge } from "@/components/ui/badge"
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

function IssueRow({ issue, members }: { issue: Issue; members: Member[] }) {
  const assignee = members.find((m) => m.id === issue.assigneeId)
  return (
    <Link
      href={`/issues/${issue.identifier}`}
      className="hover:bg-accent/50 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
    >
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
        {issue.identifier}
      </span>
      <span className="flex-1 truncate font-medium">{issue.title}</span>
      <Badge
        variant="secondary"
        className={`shrink-0 text-[10px] ${priorityStyle[issue.priority]}`}
      >
        {issue.priority}
      </Badge>
      <Badge
        variant="secondary"
        className={`shrink-0 text-[10px] ${statusStyle[issue.status]}`}
      >
        {issue.status.replace("_", " ")}
      </Badge>
      {issue.estimate != null && (
        <span className="text-muted-foreground bg-muted shrink-0 rounded-full px-1.5 py-0.5 text-[10px]">
          {issue.estimate}
        </span>
      )}
      {assignee ? (
        <Tooltip>
          <TooltipTrigger render={<span className="shrink-0" />}>
            <Avatar className="size-5">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-[8px]">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{assignee.name}</TooltipContent>
        </Tooltip>
      ) : (
        <div className="size-5 shrink-0" />
      )}
    </Link>
  )
}

export default function BacklogPage() {
  const params = useParams<{ key: string }>()
  const projectId = params.key

  // The URL slug here is a project id (e.g. "proj-1"). The earlier
  // version stored the project response in `team` state and then
  // filtered issues by `i.teamId === team.id` — wrong scope (showed
  // every team issue, not project issues) and never resolved when
  // team-shaped fields were missing. We now keep both: `project` is
  // the page subject, `team` (resolved via project.teamId) supplies
  // the cycle list, since cycles are owned by teams in the schema.
  const [project, setProject] = useState<Project | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useDocumentTitle(project ? `${project.name} backlog` : null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectId}`).then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ])
      .then(([p, ts, i, c, m]) => {
        setProject(p)
        if (p && !(p as Record<string, unknown>).error && Array.isArray(ts)) {
          setTeam(
            (ts as Team[]).find((t) => t.id === (p as Project).teamId) ?? null
          )
        }
        setIssues(i)
        setCycles(c)
        setMembers(m)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!project || (project as Record<string, unknown>).error) {
    return (
      <div className="text-muted-foreground flex items-center justify-center p-12 text-sm">
        Project not found.
      </div>
    )
  }

  // Issues are scoped to the project; cycles belong to its team
  // (and we only render this section when we resolved the team).
  const projectIssues = issues.filter((i) => i.projectId === project.id)
  const teamCycles = team ? cycles.filter((c) => c.teamId === team.id) : []

  const activeCycles = teamCycles.filter((c) => c.state === "active")
  const upcomingCycles = teamCycles.filter((c) => c.state === "upcoming")

  const scheduledIssueIds = new Set(
    projectIssues.filter((i) => i.cycleId != null).map((i) => i.id)
  )
  const unscheduledIssues = projectIssues.filter(
    (i) => !scheduledIssueIds.has(i.id)
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-xl font-semibold">{project.name} Backlog</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Cycles and unscheduled issues for {project.name}.
          </p>
        </div>

        {/* Active Cycles */}
        {activeCycles.map((cycle) => {
          const cycleIssues = projectIssues.filter(
            (i) => i.cycleId === cycle.id
          )
          return (
            <Collapsible key={cycle.id} defaultOpen>
              <CollapsibleTrigger className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors">
                <span className="font-semibold">{cycle.name}</span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${cycleStateStyle[cycle.state]}`}
                >
                  {cycle.state}
                </Badge>
                <span className="text-muted-foreground ml-auto text-xs">
                  {cycle.startDate} - {cycle.endDate}
                </span>
                <span className="text-muted-foreground text-xs">
                  {cycleIssues.length} issues
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 ml-2 border-l pl-2">
                  {cycleIssues.length === 0 ? (
                    <p className="text-muted-foreground px-3 py-2 text-sm">
                      No issues in this cycle.
                    </p>
                  ) : (
                    cycleIssues.map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        members={members}
                      />
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        {/* Upcoming Cycles */}
        {upcomingCycles.map((cycle) => {
          const cycleIssues = projectIssues.filter(
            (i) => i.cycleId === cycle.id
          )
          return (
            <Collapsible key={cycle.id} defaultOpen>
              <CollapsibleTrigger className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors">
                <span className="font-semibold">{cycle.name}</span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${cycleStateStyle[cycle.state]}`}
                >
                  {cycle.state}
                </Badge>
                <span className="text-muted-foreground ml-auto text-xs">
                  {cycle.startDate} - {cycle.endDate}
                </span>
                <span className="text-muted-foreground text-xs">
                  {cycleIssues.length} issues
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 ml-2 border-l pl-2">
                  {cycleIssues.length === 0 ? (
                    <p className="text-muted-foreground px-3 py-2 text-sm">
                      No issues in this cycle.
                    </p>
                  ) : (
                    cycleIssues.map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        members={members}
                      />
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        {/* Unscheduled Backlog */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors">
            <span className="font-semibold">Backlog</span>
            <Badge variant="secondary" className="text-[10px]">
              unscheduled
            </Badge>
            <span className="text-muted-foreground ml-auto text-xs">
              {unscheduledIssues.length} issues
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 ml-2 border-l pl-2">
              {unscheduledIssues.length === 0 ? (
                <p className="text-muted-foreground px-3 py-2 text-sm">
                  No unscheduled issues.
                </p>
              ) : (
                unscheduledIssues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} members={members} />
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  )
}
