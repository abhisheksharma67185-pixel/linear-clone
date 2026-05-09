"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Cycle, Issue, Member, Team } from "@/app/lib/mock-data"
import { StatusIcon } from "@/components/status-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${fmt(start)} – ${fmt(end)}`
}

function daysLeft(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  end.setHours(23, 59, 59, 999)
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
}

function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`bg-muted h-1.5 w-full overflow-hidden rounded-full ${className ?? ""}`}
    >
      <div
        className="h-full rounded-full bg-violet-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

interface CycleCardProps {
  cycle: Cycle
  cycleIssues: Issue[]
  memberById: Map<string, Member>
  team: Team | undefined
  onComplete: (id: string) => void
  onStart: (id: string) => void
}

function CycleCard({
  cycle,
  cycleIssues,
  memberById,
  team,
  onComplete,
  onStart,
}: CycleCardProps) {
  const [expanded, setExpanded] = useState(false)

  const total = cycleIssues.length
  const done = cycleIssues.filter(
    (i) => i.status === "done" || i.status === "cancelled"
  ).length
  const inProgress = cycleIssues.filter(
    (i) => i.status === "in_progress"
  ).length
  const pointPct =
    cycle.plannedPoints > 0
      ? (cycle.completedPoints / cycle.plannedPoints) * 100
      : 0
  const issuePct = total > 0 ? (done / total) * 100 : 0
  const remaining = daysLeft(cycle.endDate)

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="border-b last:border-b-0">
        {/* Main row */}
        <div className="hover:bg-accent/30 flex items-start gap-4 px-5 py-3.5 transition-colors">
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center"
              />
            }
          >
            <svg
              viewBox="0 0 8 8"
              aria-hidden="true"
              className={`text-muted-foreground/60 size-2 fill-current transition-transform ${expanded ? "" : "-rotate-90"}`}
            >
              <path d="M1 2 L7 2 L4 6 Z" />
            </svg>
          </CollapsibleTrigger>

          <div className="min-w-0 flex-1 space-y-2">
            {/* Title row */}
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium">{cycle.name}</span>
              {team && (
                <span className="text-muted-foreground/70 ring-border/50 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] ring-1">
                  {team.key}
                </span>
              )}
              {cycle.state === "active" && (
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                  Active
                </span>
              )}
              {cycle.state === "upcoming" && (
                <span className="text-muted-foreground/70 shrink-0 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                  Upcoming
                </span>
              )}
            </div>

            {/* Subtitle row */}
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span>{formatDateRange(cycle.startDate, cycle.endDate)}</span>
              {cycle.state === "active" && remaining > 0 && (
                <>
                  <span className="bg-muted-foreground/30 size-0.5 rounded-full" />
                  <span>{remaining}d left</span>
                </>
              )}
              <span className="bg-muted-foreground/30 size-0.5 rounded-full" />
              <span>{total} issues</span>
              {inProgress > 0 && (
                <>
                  <span className="bg-muted-foreground/30 size-0.5 rounded-full" />
                  <span>{inProgress} in progress</span>
                </>
              )}
            </div>

            {/* Progress bars */}
            {cycle.state !== "upcoming" && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ProgressBar value={issuePct} className="flex-1" />
                  <span className="text-muted-foreground w-8 shrink-0 text-right text-[10px]">
                    {Math.round(issuePct)}%
                  </span>
                </div>
                {cycle.plannedPoints > 0 && (
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={pointPct}
                      className="flex-1 [&>div]:bg-violet-400/60"
                    />
                    <span className="text-muted-foreground w-8 shrink-0 text-right text-[10px]">
                      {cycle.completedPoints}/{cycle.plannedPoints}pt
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {cycle.state === "active" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onComplete(cycle.id)
                }}
              >
                Complete cycle
              </Button>
            )}
            {cycle.state === "upcoming" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-full px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onStart(cycle.id)
                }}
              >
                Start cycle
              </Button>
            )}
            {cycle.state === "completed" && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="size-3.5"
                />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Expanded issue list */}
        <CollapsibleContent>
          <div className="border-t">
            {cycleIssues.length === 0 ? (
              <p className="text-muted-foreground px-14 py-4 text-sm">
                No issues in this cycle.
              </p>
            ) : (
              cycleIssues.map((issue) => {
                const assignee = issue.assigneeId
                  ? memberById.get(issue.assigneeId)
                  : null
                return (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.identifier}`}
                    className="hover:bg-accent/40 flex items-center gap-3 py-2 pr-5 pl-14 transition-colors"
                  >
                    <StatusIcon
                      status={issue.status}
                      className="size-3.5 shrink-0"
                    />
                    <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
                      {issue.identifier}
                    </span>
                    <span className="flex-1 truncate text-sm">
                      {issue.title}
                    </span>
                    {assignee ? (
                      <Avatar className="size-5 shrink-0">
                        <AvatarImage
                          src={assignee.avatar}
                          alt={assignee.name}
                        />
                        <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="size-5 shrink-0" />
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function CycleSection({
  label,
  cycles,
  cycleIssuesMap,
  memberById,
  teamById,
  onComplete,
  onStart,
  defaultOpen = true,
}: {
  label: string
  cycles: Cycle[]
  cycleIssuesMap: Map<string, Issue[]>
  memberById: Map<string, Member>
  teamById: Map<string, Team>
  onComplete: (id: string) => void
  onStart: (id: string) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (cycles.length === 0) return null
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-2">
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium"
            />
          }
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/60 size-2 fill-current transition-transform ${open ? "" : "-rotate-90"}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          <span>{label}</span>
          <span className="text-muted-foreground text-xs font-normal">
            {cycles.length}
          </span>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        {cycles.map((cycle) => (
          <CycleCard
            key={cycle.id}
            cycle={cycle}
            cycleIssues={cycleIssuesMap.get(cycle.id) ?? []}
            memberById={memberById}
            team={teamById.get(cycle.teamId)}
            onComplete={onComplete}
            onStart={onStart}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newTeamId, setNewTeamId] = useState("")
  const [newStartDate, setNewStartDate] = useState("")
  const [newEndDate, setNewEndDate] = useState("")

  const fetchAll = () => {
    Promise.all([
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([c, i, m, t]) => {
      setCycles(c)
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])

  const cycleIssuesMap = useMemo(() => {
    const m = new Map<string, Issue[]>()
    for (const issue of issues) {
      if (!issue.cycleId) continue
      const arr = m.get(issue.cycleId) ?? []
      arr.push(issue)
      m.set(issue.cycleId, arr)
    }
    return m
  }, [issues])

  const handleCreate = async () => {
    const res = await fetch("/api/data/cycles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        description: newDescription,
        teamId: newTeamId,
        startDate: newStartDate,
        endDate: newEndDate,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setCycles((prev) => [...prev, created])
      setNewName("")
      setNewDescription("")
      setNewTeamId("")
      setNewStartDate("")
      setNewEndDate("")
      setCreateOpen(false)
    }
  }

  const handleComplete = async (cycleId: string) => {
    const res = await fetch(`/api/data/cycles/${cycleId}/complete`, {
      method: "POST",
    })
    if (res.ok) {
      setCycles((prev) =>
        prev.map((c) =>
          c.id === cycleId ? { ...c, state: "completed" as const } : c
        )
      )
    }
  }

  const handleStart = async (cycleId: string) => {
    const res = await fetch(`/api/data/cycles/${cycleId}/start`, {
      method: "POST",
    })
    if (res.ok) {
      setCycles((prev) =>
        prev.map((c) =>
          c.id === cycleId ? { ...c, state: "active" as const } : c
        )
      )
    }
  }

  const activeCycles = useMemo(
    () => cycles.filter((c) => c.state === "active"),
    [cycles]
  )
  const upcomingCycles = useMemo(
    () => cycles.filter((c) => c.state === "upcoming"),
    [cycles]
  )
  const completedCycles = useMemo(
    () => cycles.filter((c) => c.state === "completed"),
    [cycles]
  )

  const totalIssues = useMemo(() => {
    let count = 0
    for (const c of cycles) {
      count += cycleIssuesMap.get(c.id)?.length ?? 0
    }
    return count
  }, [cycles, cycleIssuesMap])

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b px-5 py-4">
              <Skeleton className="mb-2 h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">Cycles</h1>
          <span className="text-muted-foreground text-xs">{totalIssues}</span>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors"
              />
            }
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            New cycle
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create cycle</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cycle-name">Name</Label>
                <Input
                  id="cycle-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Sprint 15"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cycle-desc">Description</Label>
                <Textarea
                  id="cycle-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Team</Label>
                <Select
                  value={newTeamId}
                  onValueChange={(v) => v && setNewTeamId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cycle-start">Start date</Label>
                  <Input
                    id="cycle-start"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cycle-end">End date</Label>
                  <Input
                    id="cycle-end"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || !newTeamId}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {cycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              No cycles yet
            </p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              Create a cycle to start tracking sprints.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="bg-primary text-primary-foreground mt-4 flex items-center gap-1.5 rounded px-3 py-1.5 text-xs"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              New cycle
            </button>
          </div>
        ) : (
          <>
            <CycleSection
              label="Active"
              cycles={activeCycles}
              cycleIssuesMap={cycleIssuesMap}
              memberById={memberById}
              teamById={teamById}
              onComplete={handleComplete}
              onStart={handleStart}
              defaultOpen={true}
            />
            <CycleSection
              label="Upcoming"
              cycles={upcomingCycles}
              cycleIssuesMap={cycleIssuesMap}
              memberById={memberById}
              teamById={teamById}
              onComplete={handleComplete}
              onStart={handleStart}
              defaultOpen={true}
            />
            <CycleSection
              label="Completed"
              cycles={completedCycles}
              cycleIssuesMap={cycleIssuesMap}
              memberById={memberById}
              teamById={teamById}
              onComplete={handleComplete}
              onStart={handleStart}
              defaultOpen={false}
            />
          </>
        )}
      </div>
    </div>
  )
}
