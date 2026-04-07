"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, User, Project, Epic } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { priorityVariant, typeVariant, projectTypeVariant } from "@/lib/badge-styles"

const STATUS_COLUMNS = [
  { key: "to_do", label: "To Do", color: "bg-gray-400" },
  { key: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { key: "in_review", label: "In Review", color: "bg-yellow-500" },
  { key: "done", label: "Done", color: "bg-green-500" },
] as const


export default function BoardPage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectKey}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([p, i, u, e]) => {
      setProject(p)
      setIssues(i)
      setUsers(u)
      setEpics(e)
      setLoading(false)
    })
  }, [projectKey])

  const userName = (id: string | null) =>
    users.find((u) => u.id === id)

  const projectIssues = issues.filter(
    (i) => project && i.projectId === project.id
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!project || project.error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Project not found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <Badge
          variant="outline"
          className={projectTypeVariant[project.type]}
        >
          {project.type} board
        </Badge>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {STATUS_COLUMNS.map((col) => {
          const colIssues = projectIssues.filter(
            (i) => i.status === col.key
          )
          return (
            <div key={col.key} className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`size-2 rounded-full ${col.color}`} />
                <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {col.label}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {colIssues.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                {colIssues.map((issue) => {
                  const assignee = userName(issue.assigneeId)
                  const epic = epics.find((e) => e.id === issue.epicId)
                  return (
                    <Link key={issue.id} href={`/issue/${issue.key}`}>
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium mb-2 leading-snug">
                            {issue.summary}
                          </p>
                          {epic && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                              {epic.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${typeVariant[issue.type]}`}>
                                {issue.type}
                              </Badge>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${priorityVariant[issue.priority]}`}>
                                {issue.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {issue.storyPoints != null && (
                                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                                  {issue.storyPoints}
                                </span>
                              )}
                              {assignee && (
                                <Avatar className="size-5">
                                  <AvatarImage src={assignee.avatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {assignee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                            {issue.key}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
                {colIssues.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-md">
                    No issues
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
