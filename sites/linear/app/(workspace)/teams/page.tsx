"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Team, Member } from "@/app/lib/mock-data"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ]).then(([t, m]) => {
      setTeams(t)
      setMembers(m)
      setLoading(false)
    })
  }, [])

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
            const lead = members.find((m) => m.id === team.leadId)
            const memberCount = team.memberIds.length
            return (
              <Link key={team.id} href={`/projects/${team.key}/board`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">
                        {team.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {team.key}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {team.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
