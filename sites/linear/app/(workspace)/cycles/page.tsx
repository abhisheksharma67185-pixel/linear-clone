"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Cycle, Issue, Member, Team } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const cycleStateStyle: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

const statusStyle: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  todo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

const priorityStyle: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
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
                <CollapsibleTrigger className="w-full text-left">
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
                        <span className="text-xs text-muted-foreground">
                          {team.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {cycle.startDate} - {cycle.endDate}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{cycleIssues.length} issues</span>
                      <span>{totalEstimate} points</span>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-3 flex flex-col gap-1">
                      {cycleIssues.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
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
                              className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors text-sm"
                            >
                              <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
                                {issue.identifier}
                              </span>
                              <span className="flex-1 truncate">
                                {issue.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] shrink-0 ${priorityStyle[issue.priority]}`}
                              >
                                {issue.priority}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] shrink-0 ${statusStyle[issue.status]}`}
                              >
                                {issue.status.replace("_", " ")}
                              </Badge>
                              {assignee && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {assignee.name}
                                </span>
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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Cycles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All cycles across your teams.
        </p>
      </div>

      {cycles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cycles found.</p>
      ) : (
        <>
          {renderCycleGroup("Active", activeCycles)}
          {renderCycleGroup("Upcoming", upcomingCycles)}
          {renderCycleGroup("Completed", completedCycles)}
        </>
      )}
    </div>
  )
}
