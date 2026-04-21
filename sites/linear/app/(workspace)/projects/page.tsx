"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Project, Member, Team, Issue } from "@/app/lib/mock-data"
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
  return (
    <Suspense fallback={null}>
      <ProjectsPageInner />
    </Suspense>
  )
}

function ProjectsPageInner() {
  const searchParams = useSearchParams()
  const teamKey = searchParams.get("team")

  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
    ]).then(([p, m, t, i]) => {
      setProjects(p)
      setMembers(m)
      setTeams(t)
      setIssues(i)
      setLoading(false)
    })
  }, [])

  const statsByProject = useMemo(() => {
    const map = new Map<string, { total: number; done: number; pct: number }>()
    for (const project of projects) {
      const projectIssues = issues.filter((i) => i.projectId === project.id)
      const total = projectIssues.length
      const done = projectIssues.filter(
        (i) => i.status === "done" || i.status === "cancelled",
      ).length
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      map.set(project.id, { total, done, pct })
    }
    return map
  }, [projects, issues])

  const activeTeam = useMemo(
    () => (teamKey ? teams.find((t) => t.key === teamKey) ?? null : null),
    [teamKey, teams],
  )

  const visibleProjects = useMemo(
    () =>
      activeTeam
        ? projects.filter((p) => p.teamId === activeTeam.id)
        : projects,
    [projects, activeTeam],
  )

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
        <h1 className="text-2xl font-semibold">
          {activeTeam ? `${activeTeam.name} · Projects` : "Projects"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeTeam
            ? `Projects owned by the ${activeTeam.name} team.`
            : "All projects in your organization."}
        </p>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-xs text-muted-foreground">
            {activeTeam
              ? `The ${activeTeam.name} team doesn't have any projects.`
              : "Create a project to get started."}
          </p>
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => {
          const lead = members.find((m) => m.id === project.leadId)
          const team = teams.find((t) => t.id === project.teamId)
          const stats = statsByProject.get(project.id) ?? { total: 0, done: 0, pct: 0 }
          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <ProjectIcon name={project.name} />
                      <CardTitle className="truncate text-base font-medium">
                        {project.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 text-[10px] ${projectStatusStyle[project.status]}`}
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>
                  <div className="mb-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {stats.done}/{stats.total} done
                      </span>
                      <span className="tabular-nums">{stats.pct}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div className="flex min-w-0 items-center gap-2">
                      {team && (
                        <span className="truncate font-medium">{team.name}</span>
                      )}
                      {project.targetDate && (
                        <>
                          <span className="text-border">·</span>
                          <span className="shrink-0">
                            {formatDate(project.targetDate)}
                          </span>
                        </>
                      )}
                    </div>
                    {lead && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="shrink-0" />}>
                          <Avatar className="size-5 ring-2 ring-card">
                            <AvatarImage src={lead.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {lead.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>Lead: {lead.name}</TooltipContent>
                      </Tooltip>
                    )}
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

function ProjectIcon({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-sky-500 to-cyan-500 text-[10px] font-semibold text-white">
      {initials}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
