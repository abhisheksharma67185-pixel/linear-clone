import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase()
  if (!q) {
    return NextResponse.json({ issues: [], projects: [], users: [] })
  }

  const issueLimit = Number(request.nextUrl.searchParams.get("issueLimit")) || 8

  const allUsers = store.getUsers()
  const userMap = new Map(allUsers.map((u) => [u.id, u]))
  const allProjects = store.getProjects()
  const projectMap = new Map(allProjects.map((p) => [p.id, p]))
  const allSprints = store.getSprints()
  const sprintMap = new Map(allSprints.map((s) => [s.id, s]))
  const allEpics = store.getEpics()
  const epicMap = new Map(allEpics.map((e) => [e.id, e]))

  const rawIssues = store.getIssues().filter((i) => {
    const issue = i as unknown as Record<string, unknown>
    return (
      (issue.summary as string).toLowerCase().includes(q) ||
      (issue.key as string).toLowerCase().includes(q)
    )
  }).slice(0, issueLimit)

  const issues = rawIssues.map((i) => {
    const issue = i as unknown as Record<string, unknown>
    return {
      ...issue,
      assignee: issue.assigneeId ? userMap.get(issue.assigneeId as string) ?? null : null,
      reporter: userMap.get(issue.reporterId as string) ?? null,
      project: projectMap.get(issue.projectId as string) ?? null,
      sprint: issue.sprintId ? sprintMap.get(issue.sprintId as string) ?? null : null,
      epic: issue.epicId ? epicMap.get(issue.epicId as string) ?? null : null,
    }
  })

  const projects = allProjects.filter((p) => {
    const proj = p as unknown as Record<string, unknown>
    return (
      (proj.name as string).toLowerCase().includes(q) ||
      (proj.key as string).toLowerCase().includes(q)
    )
  }).slice(0, 4)

  const users = allUsers.filter((u) => {
    const user = u as unknown as Record<string, unknown>
    return (
      (user.name as string).toLowerCase().includes(q) ||
      (user.email as string).toLowerCase().includes(q)
    )
  }).slice(0, 4)

  return NextResponse.json({ issues, projects, users })
}
