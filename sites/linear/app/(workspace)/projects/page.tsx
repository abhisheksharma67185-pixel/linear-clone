"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Project, Member, Team } from "@/app/lib/mock-data"
import { projectStatusStyle } from "@/lib/status-styles"
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([p, m, t]) => {
      setProjects(p)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-7 w-28" />
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
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All projects in your organization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const lead = members.find((m) => m.id === project.leadId)
          const team = teams.find((t) => t.id === project.teamId)
          return (
            <Link
              key={project.id}
              href={`/projects/${team ? team.key : ""}/board`}
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${projectStatusStyle[project.status]}`}
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {team && (
                      <span className="font-medium">{team.name}</span>
                    )}
                    {lead && (
                      <>
                        <span className="text-border">|</span>
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
    </TooltipProvider>
  )
}
