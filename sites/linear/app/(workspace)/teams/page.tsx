"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Team, Member, Issue } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
    ]).then(([t, m, i]) => {
      setTeams(t)
      setMembers(m)
      setIssues(i)
      setLoading(false)
    })
  }, [])

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  )
  const activeByTeam = useMemo(() => {
    const counts = new Map<string, number>()
    for (const issue of issues) {
      if (issue.status === "done" || issue.status === "cancelled") continue
      counts.set(issue.teamId, (counts.get(issue.teamId) ?? 0) + 1)
    }
    return counts
  }, [issues])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Teams</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All teams in your organization.
        </p>
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No teams found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const lead = memberById.get(team.leadId)
            const memberCount = team.memberIds.length
            const active = activeByTeam.get(team.id) ?? 0
            const visibleMembers = team.memberIds
              .slice(0, 4)
              .map((id) => memberById.get(id))
              .filter((m): m is Member => Boolean(m))
            const extra = memberCount - visibleMembers.length
            return (
              <Link key={team.id} href={`/projects/${team.key}/board`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-foreground">
                          {team.key.slice(0, 2)}
                        </div>
                        <CardTitle className="text-base font-medium">
                          {team.name}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {team.key}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {team.description}
                    </p>
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      {lead && (
                        <>
                          <Tooltip>
                            <TooltipTrigger render={<span />}>
                              <Avatar className="size-4">
                                <AvatarImage src={lead.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {lead.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{lead.name}</TooltipContent>
                          </Tooltip>
                          <span>Lead: {lead.name}</span>
                          <span className="text-border">|</span>
                        </>
                      )}
                      <span>
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {visibleMembers.map((m) => (
                          <Tooltip key={m.id}>
                            <TooltipTrigger render={<span />}>
                              <Avatar className="size-5 ring-2 ring-card">
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {m.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{m.name}</TooltipContent>
                          </Tooltip>
                        ))}
                        {extra > 0 && (
                          <span className="z-10 flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground ring-2 ring-card">
                            +{extra}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {active} active {active === 1 ? "issue" : "issues"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
