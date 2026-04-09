"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Issue, Member, Project, Team } from "@/app/lib/mock-data"
import { statusStyle, priorityStyle, projectStatusStyle } from "@/lib/status-styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([i, m, p, t]) => {
      setIssues(i)
      setMembers(m)
      setProjects(p)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  const myIssues = issues.filter((i) => i.assigneeId === "usr-1")
  const myActiveIssues = myIssues.filter((i) => i.status !== "done" && i.status !== "cancelled")
  const assignedCount = myIssues.filter((i) => i.status !== "done").length
  const inProgressCount = myIssues.filter((i) => i.status === "in_progress").length
  const doneCount = myIssues.filter((i) => i.status === "done").length
  const totalCount = myIssues.length

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My Issues</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your assigned issues and recent projects.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned to Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doneCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active issues table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Active Issues</h2>
        {myActiveIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active issues assigned to you.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Identifier</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myActiveIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Link
                        href={`/issues/${issue.identifier}`}
                        className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {issue.identifier}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{issue.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${priorityStyle[issue.priority]}`}
                      >
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${statusStyle[issue.status]}`}
                      >
                        {issue.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Recent projects */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Projects</h2>
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
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {team && <span>{team.name}</span>}
                      {lead && (
                        <>
                          <span className="text-border">|</span>
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
    </div>
  )
}
