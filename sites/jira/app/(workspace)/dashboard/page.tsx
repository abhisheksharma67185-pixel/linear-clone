"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Issue, User, Project } from "@/app/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const statusStyle: Record<string, string> = {
  to_do: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

const priorityStyle: Record<string, string> = {
  highest: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  lowest: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
}

const typeLabel: Record<string, string> = {
  story: "Story",
  task: "Task",
  bug: "Bug",
  subtask: "Sub-task",
}

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ]).then(([i, u, p]) => {
      setIssues(i)
      setUsers(u)
      setProjects(p)
      setLoading(false)
    })
  }, [])

  const userName = (id: string | null) =>
    users.find((u) => u.id === id)?.name ?? "Unassigned"

  const myIssues = issues.filter(
    (i) => i.assigneeId === "usr-1" && i.status !== "done"
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Your Work</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your assigned issues and recent projects.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned to Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myIssues.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {issues.filter((i) => i.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {issues.filter((i) => i.status === "in_review").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {issues.filter((i) => i.status === "done").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned to me */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned to Me</CardTitle>
        </CardHeader>
        <CardContent>
          {myIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open issues assigned to you.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Key</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="w-[90px]">Priority</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Link
                        href={`/issue/${issue.key}`}
                        className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {issue.key}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {issue.summary}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{typeLabel[issue.type]}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={priorityStyle[issue.priority]}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusStyle[issue.status]}>
                        {issue.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const lead = users.find((u) => u.id === project.lead)
            return (
              <Link key={project.id} href={`/projects/${project.key}/board`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {project.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          project.type === "scrum"
                            ? "border-blue-300 text-blue-700 dark:text-blue-400"
                            : "border-purple-300 text-purple-700 dark:text-purple-400"
                        }
                      >
                        {project.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{project.key}</span>
                      {lead && (
                        <>
                          <span>-</span>
                          <Avatar className="size-4">
                            <AvatarImage src={lead.avatar} />
                            <AvatarFallback className="text-[8px]">
                              {lead.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{lead.name}</span>
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
