"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Issue, Member, Team } from "@/app/lib/mock-data"
import { statusStyle, priorityStyle } from "@/lib/status-styles"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AllIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([i, m, t]) => {
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-[140px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  const memberName = (id: string | null) =>
    members.find((m) => m.id === id)?.name ?? "Unassigned"

  const filtered = issues.filter((issue) => {
    if (
      search &&
      !issue.title.toLowerCase().includes(search.toLowerCase()) &&
      !issue.identifier.toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (statusFilter !== "all" && issue.status !== statusFilter) return false
    if (priorityFilter !== "all" && issue.priority !== priorityFilter)
      return false
    return true
  })

  const groupedByTeam = teams.map((team) => ({
    team,
    issues: filtered.filter((i) => i.teamId === team.id),
  }))

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">All Issues</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {filtered.length} of {issues.length} issues
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Filter issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {groupedByTeam.map(({ team, issues: teamIssues }) => {
        if (teamIssues.length === 0) return null
        return (
          <div key={team.id}>
            <h2 className="text-muted-foreground mb-2 text-sm font-semibold">
              {team.key} — {team.name}
              <span className="ml-2 text-xs font-normal">
                {teamIssues.length}
              </span>
            </h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Identifier</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[140px]">Assignee</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <Link
                          href={`/issues/${issue.identifier}`}
                          className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {issue.identifier}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {issue.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {memberName(issue.assigneeId)}
                      </TableCell>
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
          </div>
        )
      })}
    </div>
  )
}
