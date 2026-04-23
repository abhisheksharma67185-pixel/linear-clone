"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, User, Project, Sprint, Epic } from "@/app/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserProfileCard } from "@/components/user-profile-card"
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
import {
  statusVariant,
  priorityVariant,
  priorityDisplayLabel,
  typeLabel,
  sprintStateVariant,
  sprintStateLabel,
  statusDisplayLabel,
} from "@/lib/badge-styles"
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.()
      }}
      className="flex w-full cursor-pointer items-center gap-3 border-b px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-accent/50"
    >
      <span className="w-[80px] shrink-0 font-mono text-xs text-blue-600 dark:text-blue-400">
        {issue.key}
      </span>
      <span className="w-[50px] shrink-0 text-xs text-muted-foreground">
        {typeLabel[issue.type]}
      </span>
      <span className="flex-1 truncate">{issue.summary}</span>
      {epic && (
        <span className="max-w-[120px] shrink-0 truncate text-xs text-purple-600 dark:text-purple-400">
          {epic.name}
        </span>
      )}
      <Badge
        variant="secondary"
        className={`shrink-0 text-[10px] ${priorityVariant[issue.priority]}`}
      >
        {priorityDisplayLabel[issue.priority] ?? issue.priority}
      </Badge>
      <Badge
        variant="secondary"
        className={`shrink-0 text-[10px] ${statusVariant[issue.status]}`}
      >
        {statusDisplayLabel[issue.status] ?? issue.status.replace(/_/g, " ")}
      </Badge>
      {issue.storyPoints != null && (
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {issue.storyPoints}
        </span>
      )}
      <div className="w-6 shrink-0" onClick={(e) => e.stopPropagation()}>
        {assignee && (
          <UserProfileCard
            name={assignee.displayName ?? assignee.name}
            email={assignee.email}
            size="sm"
          />
        )}
      </div>
    </div>
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
  const [startDialogSprint, setStartDialogSprint] = useState<Sprint | null>(
    null
  )
  const [startName, setStartName] = useState("")
  const [startDuration, setStartDuration] = useState("2")
  const [startGoal, setStartGoal] = useState("")

  // Complete sprint dialog state
  const [completeDialogSprint, setCompleteDialogSprint] =
    useState<Sprint | null>(null)

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    const durationWeeks = startDuration === "custom" ? 2 : Number(startDuration)
    const res = await fetch(`/api/data/sprints/${id}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: startName, goal: startGoal, durationWeeks }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSprints((prev) => prev.map((s) => (s.id === id ? updated : s)))
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
    const res = await fetch(`/api/data/sprints/${id}/complete`, {
      method: "POST",
    })
    if (res.ok) {
      setSprints((prev) =>
        prev.map((s) => (s.id === id ? { ...s, state: "closed" as const } : s))
      )
      // Incomplete issues were moved to backlog on the server — re-fetch issues
      const updatedIssues = await fetch("/api/data/issues").then((r) =>
        r.json()
      )
      setIssues(updatedIssues)
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
  const hasActiveSprint = activeSprints.length > 0
  const backlogIssues = projectIssues.filter((i) => i.sprintId === null)

  const sprintIssues = (sprintId: string) =>
    projectIssues.filter((i) => i.sprintId === sprintId)

  const totalPoints = (issueList: Issue[]) =>
    issueList.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)

  return (
    <div className="flex h-full flex-col">
      {/* Project header */}
      <div className="px-6 pt-4 pb-1">
        <p className="mb-1 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Spaces
          </Link>
        </p>
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
              active: true,
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

      {/* Backlog content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Active sprints */}
        {activeSprints.map((sprint) => {
          const sIssues = sprintIssues(sprint.id)
          const doneCount = sIssues.filter(
            (i) =>
              i.status.toLowerCase() === "done" ||
              i.status.toLowerCase() === "closed" ||
              i.status.toLowerCase() === "deployed"
          ).length
          return (
            <Collapsible key={sprint.id} defaultOpen>
              <div className="rounded-lg border">
                <div className="flex items-center gap-3 px-4 py-3">
                  <CollapsibleTrigger className="-mx-1 flex flex-1 items-center gap-3 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/50">
                    <span className="text-sm font-medium">{sprint.name}</span>
                    <Badge
                      variant="secondary"
                      className={sprintStateVariant[sprint.state]}
                    >
                      {sprintStateLabel[sprint.state] ?? sprint.state}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {sprint.startDate} - {sprint.endDate}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {doneCount}/{sIssues.length} done &middot;{" "}
                      {totalPoints(sIssues)} pts
                    </span>
                  </CollapsibleTrigger>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openCompleteDialog(sprint)
                    }}
                  >
                    Complete sprint
                  </Button>
                </div>
                <CollapsibleContent>
                  {sprint.goal && (
                    <p className="px-4 pb-2 text-xs text-muted-foreground italic">
                      Goal: {sprint.goal}
                    </p>
                  )}
                  <div className="border-t">
                    {sIssues.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
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
          return (
            <Collapsible key={sprint.id} defaultOpen>
              <div className="rounded-lg border">
                <div className="flex items-center gap-3 px-4 py-3">
                  <CollapsibleTrigger className="-mx-1 flex flex-1 items-center gap-3 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/50">
                    <span className="text-sm font-medium">{sprint.name}</span>
                    <Badge
                      variant="secondary"
                      className={sprintStateVariant[sprint.state]}
                    >
                      {sprintStateLabel[sprint.state] ?? sprint.state}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {sprint.startDate} - {sprint.endDate}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {sIssues.length} issues - {totalPoints(sIssues)} pts
                    </span>
                  </CollapsibleTrigger>
                  <button
                    type="button"
                    className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openStartDialog(sprint)
                    }}
                  >
                    Start sprint
                  </button>
                </div>
                <CollapsibleContent>
                  {sprint.goal && (
                    <p className="px-4 pb-2 text-xs text-muted-foreground italic">
                      Goal: {sprint.goal}
                    </p>
                  )}
                  <div className="border-t">
                    {sIssues.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
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
          <div className="rounded-lg border">
            <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50">
              <span className="text-sm font-medium">Backlog</span>
              <Badge
                variant="secondary"
                className={sprintStateVariant["closed"]}
              >
                unscheduled
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {backlogIssues.length} issues - {totalPoints(backlogIssues)} pts
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t">
                {backlogIssues.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
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
      </div>
      {/* end scrollable content */}

      {/* ── Start Sprint Dialog ── */}
      <Dialog
        open={startDialogSprint !== null}
        onOpenChange={(o) => {
          if (!o) setStartDialogSprint(null)
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Start sprint</DialogTitle>
            <DialogDescription>
              {startDialogSprint &&
                (() => {
                  const si = sprintIssues(startDialogSprint.id)
                  return `${si.length} issue${si.length !== 1 ? "s" : ""} will be included in this sprint.`
                })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {hasActiveSprint && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Another sprint is currently active. Complete it first before
                  starting a new one.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sprint name</Label>
              <Input
                value={startName}
                onChange={(e) => setStartName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Duration</Label>
                <select
                  value={startDuration}
                  onChange={(e) => setStartDuration(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
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
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">End date</Label>
              <Input
                type="date"
                defaultValue={(() => {
                  const weeks =
                    startDuration === "custom" ? 2 : Number(startDuration)
                  const end = new Date()
                  end.setDate(end.getDate() + weeks * 7)
                  return end.toISOString().slice(0, 10)
                })()}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Sprint goal{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                value={startGoal}
                onChange={(e) => setStartGoal(e.target.value)}
                placeholder="What is the goal of this sprint?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStartDialogSprint(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={
                !startName.trim() || sprintAction !== null || hasActiveSprint
              }
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                confirmStartSprint()
              }}
            >
              {sprintAction ? "Starting..." : "Start"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complete Sprint Dialog ── */}
      <Dialog
        open={completeDialogSprint !== null}
        onOpenChange={(o) => {
          if (!o) setCompleteDialogSprint(null)
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Complete {completeDialogSprint?.name}</DialogTitle>
            <DialogDescription>
              This sprint will be marked as complete.
            </DialogDescription>
          </DialogHeader>

          {completeDialogSprint &&
            (() => {
              const si = sprintIssues(completeDialogSprint.id)
              const done = si.filter(
                (i) =>
                  i.status.toLowerCase() === "done" ||
                  i.status.toLowerCase() === "closed" ||
                  i.status.toLowerCase() === "deployed"
              ).length
              const incomplete = si.length - done
              return (
                <div className="space-y-4 py-2">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {si.length}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Total issues
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {done}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Completed
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {incomplete}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Incomplete
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Sprint progress</span>
                      <span>
                        {si.length > 0
                          ? Math.round((done / si.length) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${si.length > 0 ? (done / si.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {incomplete > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <div className="flex items-start gap-2">
                        <svg
                          className="mt-0.5 size-4 shrink-0 text-amber-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            {incomplete} incomplete issue
                            {incomplete !== 1 ? "s" : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompleteDialogSprint(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={sprintAction !== null}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                confirmCompleteSprint()
              }}
            >
              {sprintAction ? "Completing..." : "Complete sprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
