"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Issue, Member, Team, Label } from "@/app/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const STATUS_COLUMNS = [
  { key: "backlog", label: "Backlog", color: "bg-gray-400" },
  { key: "todo", label: "Todo", color: "bg-blue-500" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { key: "done", label: "Done", color: "bg-green-500" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
] as const

const priorityStyle: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

export default function BoardPage() {
  const params = useParams<{ key: string }>()
  const teamKey = params.key

  const [team, setTeam] = useState<Team | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${teamKey}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([t, i, m, l]) => {
      setTeam(t)
      setIssues(i)
      setMembers(m)
      setLabels(l)
      setLoading(false)
    })
  }, [teamKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!team || (team as Record<string, unknown>).error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Team not found.
      </div>
    )
  }

  const teamIssues = issues.filter((i) => i.teamId === team.id)

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">{team.name}</h1>
        <Badge variant="outline">{team.key} board</Badge>
      </div>

      <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
        {STATUS_COLUMNS.map((col) => {
          const colIssues = teamIssues.filter((i) => i.status === col.key)
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
                  const assignee = members.find(
                    (m) => m.id === issue.assigneeId
                  )
                  const issueLabels = labels.filter((l) =>
                    issue.labelIds.includes(l.id)
                  )
                  return (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.identifier}`}
                    >
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium mb-2 leading-snug">
                            {issue.title}
                          </p>
                          {issueLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {issueLabels.map((label) => (
                                <span
                                  key={label.id}
                                  className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                                  style={{ backgroundColor: label.color }}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-1.5 py-0 ${priorityStyle[issue.priority]}`}
                              >
                                {issue.priority}
                              </Badge>
                              {issue.estimate != null && (
                                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                                  {issue.estimate}
                                </span>
                              )}
                            </div>
                            {assignee && (
                              <Avatar className="size-5">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                            {issue.identifier}
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
