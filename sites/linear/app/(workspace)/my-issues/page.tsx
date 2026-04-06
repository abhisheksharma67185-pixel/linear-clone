"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Issue, Member, Project, Team } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

const projectStatusStyle: Record<string, string> = {
  planned: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

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
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  const myIssues = issues.filter((i) => i.assigneeId === "usr-1")
  const myActiveIssues = myIssues.filter((i) => i.status !== "done" && i.status !== "cancelled")
  const assignedCount = myIssues.filter((i) => i.status !== "done").length
  const inProgressCount = myIssues.filter((i) => i.status === "in_progress").length
  const doneCount = myIssues.filter((i) => i.status === "done").length
  const totalCount = myIssues.length

  const teamKeyById = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    return team ? team.key : ""
  }

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
