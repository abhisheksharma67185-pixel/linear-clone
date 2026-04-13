"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, User, Project, Sprint, Epic } from "@/app/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { statusVariant, priorityVariant, priorityDisplayLabel, typeLabel, sprintStateVariant, sprintStateLabel, statusDisplayLabel } from "@/lib/badge-styles"
import { resolveUser, resolveEpic } from "@/lib/resolve-user"
import { useIssueDrawer } from "@/components/issue-drawer-provider"

function IssueRow({
  issue,
  users,
  epics,
  onClick,
}: {
  issue: Issue
  users: User[]
  epics: Epic[]
  onClick?: () => void
}) {
  const assignee = resolveUser(issue.assigneeId, users)
  const epic = resolveEpic(issue.epicId, epics)

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition-colors border-b last:border-b-0 text-sm w-full text-left"
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
        {priorityDisplayLabel[issue.priority] ?? issue.priority}
      </Badge>
      <Badge variant="secondary" className={`text-[10px] shrink-0 ${statusVariant[issue.status]}`}>
        {statusDisplayLabel[issue.status] ?? issue.status.replace(/_/g, " ")}
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
              {(assignee.displayName ?? assignee.name).charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </button>
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
  const [sprintAction, setSprintAction] = useState<string | null>(null)
  const { openIssue } = useIssueDrawer()

  // Start sprint dialog state
  const [startDialogSprint, setStartDialogSprint] = useState<Sprint | null>(null)
  const [startName, setStartName] = useState("")
  const [startDuration, setStartDuration] = useState("2")
  const [startGoal, setStartGoal] = useState("")

  // Complete sprint dialog state
  const [completeDialogSprint, setCompleteDialogSprint] = useState<Sprint | null>(null)

  const fetchData = useCallback(() => {
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

  useEffect(() => { fetchData() }, [fetchData])

  const openStartDialog = (sprint: Sprint) => {
    setStartName(sprint.name)
    setStartDuration("2")
    setStartGoal(sprint.goal ?? "")
    setStartDialogSprint(sprint)
  }

  const confirmStartSprint = async () => {
    if (!startDialogSprint) return
    const id = startDialogSprint.id
    setSprintAction(id)
    const res = await fetch(`/api/data/sprints/${id}/start`, { method: "POST" })
    if (res.ok) {
      setSprints((prev) => prev.map((s) => s.id === id ? { ...s, state: "active" as const, name: startName || s.name, goal: startGoal } : s))
    }
    setSprintAction(null)
    setStartDialogSprint(null)
  }

  const openCompleteDialog = (sprint: Sprint) => {
    setCompleteDialogSprint(sprint)
  }

  const confirmCompleteSprint = async () => {
    if (!completeDialogSprint) return
    const id = completeDialogSprint.id
    setSprintAction(id)
    const res = await fetch(`/api/data/sprints/${id}/complete`, { method: "POST" })
    if (res.ok) {
      setSprints((prev) => prev.map((s) => s.id === id ? { ...s, state: "closed" as const } : s))
    }
    setSprintAction(null)
    setCompleteDialogSprint(null)
  }

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
        const doneCount = sIssues.filter((i) => i.status === "done").length
        return (
          <Collapsible key={sprint.id} defaultOpen>
            <div className="border rounded-lg">
              <div className="flex items-center gap-3 px-4 py-3">
                <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left hover:bg-accent/50 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                  <span className="font-medium text-sm">{sprint.name}</span>
                  <Badge variant="secondary" className={sprintStateVariant[sprint.state]}>
                    {sprintStateLabel[sprint.state] ?? sprint.state}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {sprint.startDate} - {sprint.endDate}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {doneCount}/{sIssues.length} done &middot; {totalPoints(sIssues)} pts
                  </span>
                </CollapsibleTrigger>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCompleteDialog(sprint) }}
                >
                  Complete sprint
                </Button>
              </div>
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
                        onClick={() => openIssue(issue.key)}
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
        const hasActiveSprint = activeSprints.length > 0
        return (
          <Collapsible key={sprint.id} defaultOpen>
            <div className="border rounded-lg">
              <div className="flex items-center gap-3 px-4 py-3">
                <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left hover:bg-accent/50 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                  <span className="font-medium text-sm">{sprint.name}</span>
                  <Badge variant="secondary" className={sprintStateVariant[sprint.state]}>
                    {sprintStateLabel[sprint.state] ?? sprint.state}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {sprint.startDate} - {sprint.endDate}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {sIssues.length} issues - {totalPoints(sIssues)} pts
                  </span>
                </CollapsibleTrigger>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={hasActiveSprint}
                  title={hasActiveSprint ? "Complete the active sprint first" : undefined}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openStartDialog(sprint) }}
                >
                  Start sprint
                </Button>
              </div>
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
                        onClick={() => openIssue(issue.key)}
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
                    onClick={() => openIssue(issue.key)}
                  />
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* ── Start Sprint Dialog ── */}
      <Dialog open={startDialogSprint !== null} onOpenChange={(o) => { if (!o) setStartDialogSprint(null) }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Start sprint</DialogTitle>
            <DialogDescription>
              {startDialogSprint && (() => {
                const si = sprintIssues(startDialogSprint.id)
                return `${si.length} issue${si.length !== 1 ? "s" : ""} will be included in this sprint.`
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sprint name</Label>
              <Input value={startName} onChange={(e) => setStartName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Duration</Label>
                <select
                  value={startDuration}
                  onChange={(e) => setStartDuration(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="1">1 week</option>
                  <option value="2">2 weeks</option>
                  <option value="3">3 weeks</option>
                  <option value="4">4 weeks</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Start date</Label>
                <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} disabled className="text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sprint goal <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input value={startGoal} onChange={(e) => setStartGoal(e.target.value)} placeholder="What is the goal of this sprint?" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStartDialogSprint(null)}>Cancel</Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!startName.trim() || sprintAction !== null}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmStartSprint() }}
            >
              {sprintAction ? "Starting..." : "Start"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complete Sprint Dialog ── */}
      <Dialog open={completeDialogSprint !== null} onOpenChange={(o) => { if (!o) setCompleteDialogSprint(null) }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Complete {completeDialogSprint?.name}</DialogTitle>
            <DialogDescription>This sprint will be marked as complete.</DialogDescription>
          </DialogHeader>

          {completeDialogSprint && (() => {
            const si = sprintIssues(completeDialogSprint.id)
            const done = si.filter((i) => i.status === "done").length
            const incomplete = si.length - done
            return (
              <div className="space-y-4 py-2">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">{si.length}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Total issues</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{done}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Completed</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">{incomplete}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Incomplete</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Sprint progress</span>
                    <span>{si.length > 0 ? Math.round((done / si.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${si.length > 0 ? (done / si.length) * 100 : 0}%` }} />
                  </div>
                </div>

                {incomplete > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3">
                    <div className="flex items-start gap-2">
                      <svg className="size-4 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {incomplete} incomplete issue{incomplete !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          Incomplete issues will be moved to the backlog.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCompleteDialogSprint(null)}>Cancel</Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={sprintAction !== null}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmCompleteSprint() }}
            >
              {sprintAction ? "Completing..." : "Complete sprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
