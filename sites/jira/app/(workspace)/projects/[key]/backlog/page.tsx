"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, User, Project, Sprint, Epic } from "@/app/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { statusVariant, priorityVariant, typeLabel, sprintStateVariant } from "@/lib/badge-styles"

function IssueRow({
  issue,
  users,
  epics,
}: {
  issue: Issue
  users: User[]
  epics: Epic[]
}) {
  const assignee = users.find((u) => u.id === issue.assigneeId)
  const epic = epics.find((e) => e.id === issue.epicId)

  return (
    <Link
      href={`/issue/${issue.key}`}
      className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition-colors border-b last:border-b-0 text-sm"
    >
      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 w-[80px] shrink-0">
        {issue.key}
      </span>
      <span className="text-xs text-muted-foreground w-[50px] shrink-0">
        {typeLabel[issue.type]}
      </span>
      <span className="flex-1 truncate">{issue.summary}</span>
      {epic && (
        <span className="text-xs text-purple-600 dark:text-purple-400 max-w-[120px] truncate shrink-0">
          {epic.name}
        </span>
      )}
      <Badge variant="secondary" className={`text-[10px] shrink-0 ${priorityVariant[issue.priority]}`}>
        {issue.priority}
      </Badge>
      <Badge variant="secondary" className={`text-[10px] shrink-0 ${statusVariant[issue.status]}`}>
        {issue.status.replace(/_/g, " ")}
      </Badge>
      {issue.storyPoints != null && (
        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 shrink-0">
          {issue.storyPoints}
        </span>
      )}
      <div className="w-6 shrink-0">
        {assignee && (
          <Avatar className="size-5">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback className="text-[8px]">
              {assignee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Link>
  )
}

export default function BacklogPage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectKey}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([p, i, s, u, e]) => {
      setProject(p)
      setIssues(i)
      setSprints(s)
      setUsers(u)
      setEpics(e)
      setLoading(false)
    })
  }, [projectKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!project || project.error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Project not found.
      </div>
    )
  }

  const projectIssues = issues.filter((i) => i.projectId === project.id)
  const projectSprints = sprints.filter((s) => s.projectId === project.id)

  const activeSprints = projectSprints.filter((s) => s.state === "active")
  const futureSprints = projectSprints.filter((s) => s.state === "future")
  const backlogIssues = projectIssues.filter((i) => i.sprintId === null)

  const sprintIssues = (sprintId: string) =>
    projectIssues.filter((i) => i.sprintId === sprintId)

  const totalPoints = (issueList: Issue[]) =>
    issueList.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">
          Backlog - {project.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage sprints and backlog items.
        </p>
      </div>

      {/* Active sprints */}
      {activeSprints.map((sprint) => {
        const sIssues = sprintIssues(sprint.id)
        return (
          <Collapsible key={sprint.id} defaultOpen>
            <div className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors">
                <span className="font-medium text-sm">{sprint.name}</span>
                <Badge variant="secondary" className={sprintStateVariant[sprint.state]}>
                  {sprint.state}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {sprint.startDate} - {sprint.endDate}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {sIssues.length} issues - {totalPoints(sIssues)} pts
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {sprint.goal && (
                  <p className="text-xs text-muted-foreground px-4 pb-2 italic">
                    Goal: {sprint.goal}
                  </p>
                )}
                <div className="border-t">
                  {sIssues.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No issues in this sprint.
                    </p>
                  ) : (
                    sIssues.map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        users={users}
                        epics={epics}
                      />
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}

      {/* Future sprints */}
      {futureSprints.map((sprint) => {
        const sIssues = sprintIssues(sprint.id)
        return (
          <Collapsible key={sprint.id} defaultOpen>
            <div className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors">
                <span className="font-medium text-sm">{sprint.name}</span>
                <Badge variant="secondary" className={sprintStateVariant[sprint.state]}>
                  {sprint.state}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {sprint.startDate} - {sprint.endDate}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {sIssues.length} issues - {totalPoints(sIssues)} pts
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {sprint.goal && (
                  <p className="text-xs text-muted-foreground px-4 pb-2 italic">
                    Goal: {sprint.goal}
                  </p>
                )}
                <div className="border-t">
                  {sIssues.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No issues in this sprint.
                    </p>
                  ) : (
                    sIssues.map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        users={users}
                        epics={epics}
                      />
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}

      {/* Backlog (no sprint) */}
      <Collapsible defaultOpen>
        <div className="border rounded-lg">
          <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors">
            <span className="font-medium text-sm">Backlog</span>
            <Badge variant="secondary" className={sprintStateVariant["closed"]}>
              unscheduled
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {backlogIssues.length} issues - {totalPoints(backlogIssues)} pts
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t">
              {backlogIssues.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Backlog is empty.
                </p>
              ) : (
                backlogIssues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    users={users}
                    epics={epics}
                  />
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
