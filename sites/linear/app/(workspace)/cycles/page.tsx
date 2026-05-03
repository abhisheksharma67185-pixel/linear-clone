"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Cycle, Issue, Member, Team } from "@/app/lib/mock-data"
import {
  statusStyle,
  priorityStyle,
  cycleStateStyle,
} from "@/lib/status-styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

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

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const activeCycles = cycles.filter((c) => c.state === "active")
  const upcomingCycles = cycles.filter((c) => c.state === "upcoming")
  const completedCycles = cycles.filter((c) => c.state === "completed")

  const renderCycleGroup = (groupLabel: string, groupCycles: Cycle[]) => {
    if (groupCycles.length === 0) return null
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{groupLabel}</h2>
        {groupCycles.map((cycle) => {
          const cycleIssues = issues.filter((i) => i.cycleId === cycle.id)
          const totalEstimate = cycleIssues.reduce(
            (sum, i) => sum + (i.estimate || 0),
            0
          )
          const team = teams.find((t) => t.id === cycle.teamId)
          return (
            <Collapsible key={cycle.id}>
              <Card>
                {/* Splitting the trigger from the action buttons fixes
                 * the React hydration error: `<CollapsibleTrigger>`
                 * renders as a native <button>, and the previous code
                 * nested <Button> children inside it (Complete /
                 * Start Cycle), which is invalid HTML and triggered
                 * the Next.js dev error indicator (the "N Issues"
                 * badge in the bottom-right). The trigger now wraps
                 * only the title row; action buttons sit beside the
                 * trigger as siblings so each button has a clean
                 * single-button DOM ancestry. */}
                <CollapsibleTrigger className="block w-full text-left">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base font-medium">
                        {cycle.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${cycleStateStyle[cycle.state]}`}
                      >
                        {cycle.state}
                      </Badge>
                      {team && (
                        <span className="text-muted-foreground text-xs">
                          {team.name}
                        </span>
                      )}
                      <span className="text-muted-foreground ml-auto text-xs">
                        {cycle.startDate} - {cycle.endDate}
                      </span>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CardContent className="pb-3">
                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    <span>{cycleIssues.length} issues</span>
                    <span>{totalEstimate} points</span>
                    {cycle.state === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-6 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleComplete(cycle.id)
                        }}
                      >
                        Complete Cycle
                      </Button>
                    )}
                    {cycle.state === "upcoming" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-6 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStart(cycle.id)
                        }}
                      >
                        Start Cycle
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-1 border-t pt-3">
                      {cycleIssues.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No issues in this cycle.
                        </p>
                      ) : (
                        cycleIssues.map((issue) => {
                          const assignee = members.find(
                            (m) => m.id === issue.assigneeId
                          )
                          return (
                            <Link
                              key={issue.id}
                              href={`/issues/${issue.identifier}`}
                              className="hover:bg-accent/50 flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors"
                            >
                              <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
                                {issue.identifier}
                              </span>
                              <span className="flex-1 truncate">
                                {issue.title}
                              </span>
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
                              {assignee ? (
                                <Tooltip>
                                  <TooltipTrigger
                                    render={<span className="shrink-0" />}
                                  >
                                    <Avatar className="size-5">
                                      <AvatarImage src={assignee.avatar} />
                                      <AvatarFallback className="text-[8px]">
                                        {assignee.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {assignee.name}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <div className="size-5 shrink-0" />
                              )}
                            </Link>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Cycles</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              All cycles across your teams.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button />}>New Cycle</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Cycle</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cycle-name">Name</Label>
                  <Input
                    id="cycle-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Cycle 15"
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
                    <Label htmlFor="cycle-start">Start Date</Label>
                    <Input
                      id="cycle-start"
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cycle-end">End Date</Label>
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
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
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

        {cycles.length === 0 ? (
          <p className="text-muted-foreground text-sm">No cycles found.</p>
        ) : (
          <>
            {renderCycleGroup("Active", activeCycles)}
            {renderCycleGroup("Upcoming", upcomingCycles)}
            {renderCycleGroup("Completed", completedCycles)}
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
