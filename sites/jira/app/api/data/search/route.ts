import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

function parseSearchQuery(raw: string): {
  text: string
  filters: Record<string, string>
} {
  const filters: Record<string, string> = {}
  // Extract qualifier:"value" or qualifier:'value' patterns
  const qualifierRe =
    /\b(status|assignee|priority|type|project|sprint|epic):\s*"([^"]+)"/gi
  const text = raw
    .replace(qualifierRe, (_, key, value) => {
      filters[key.toLowerCase()] = value
      return ""
    })
    .trim()
  return { text, filters }
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim()
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

  const { text, filters } = parseSearchQuery(q)
  const lowerText = text.toLowerCase()

  const rawIssues = store
    .getIssues()
    .filter((i) => {
      const issue = i as unknown as Record<string, unknown>

      // Text search: if text portion exists, match against summary/key
      if (lowerText) {
        const matchesText =
          (issue.summary as string).toLowerCase().includes(lowerText) ||
          (issue.key as string).toLowerCase().includes(lowerText)
        if (!matchesText) return false
      }

      // Filter by status qualifier
      if (filters.status) {
        const issueStatus = (issue.status as string)
          .toLowerCase()
          .replace(/_/g, " ")
        if (issueStatus !== filters.status.toLowerCase()) return false
      }

      // Filter by assignee qualifier (match by display name)
      if (filters.assignee) {
        const assignee = issue.assigneeId
          ? userMap.get(issue.assigneeId as string)
          : null
        if (!assignee) return false
        const assigneeName = ((assignee as Record<string, unknown>)
          .displayName ?? (assignee as Record<string, unknown>).name) as string
        if (assigneeName.toLowerCase() !== filters.assignee.toLowerCase())
          return false
      }

      // Filter by priority qualifier
      if (filters.priority) {
        if (
          (issue.priority as string).toLowerCase() !==
          filters.priority.toLowerCase()
        )
          return false
      }

      // Filter by type qualifier
      if (filters.type) {
        if ((issue.type as string).toLowerCase() !== filters.type.toLowerCase())
          return false
      }

      // Filter by project qualifier (match by key or name)
      if (filters.project) {
        const project = projectMap.get(issue.projectId as string)
        if (!project) return false
        const proj = project as unknown as Record<string, unknown>
        const matchesProject =
          (proj.key as string).toLowerCase() ===
            filters.project.toLowerCase() ||
          (proj.name as string)
            .toLowerCase()
            .includes(filters.project.toLowerCase())
        if (!matchesProject) return false
      }

      // Filter by sprint qualifier
      if (filters.sprint) {
        const sprint = issue.sprintId
          ? sprintMap.get(issue.sprintId as string)
          : null
        if (!sprint) return false
        if (
          !(sprint as unknown as Record<string, unknown>).name
            ?.toString()
            .toLowerCase()
            .includes(filters.sprint.toLowerCase())
        )
          return false
      }

      // Filter by epic qualifier
      if (filters.epic) {
        const epic = issue.epicId ? epicMap.get(issue.epicId as string) : null
        if (!epic) return false
        if (
          !(epic as unknown as Record<string, unknown>).name
            ?.toString()
            .toLowerCase()
            .includes(filters.epic.toLowerCase())
        )
          return false
      }

      return true
    })
    .slice(0, issueLimit)

  const issues = rawIssues.map((i) => {
    const issue = i as unknown as Record<string, unknown>
    return {
      ...issue,
      assignee: issue.assigneeId
        ? (userMap.get(issue.assigneeId as string) ?? null)
        : null,
      reporter: userMap.get(issue.reporterId as string) ?? null,
      project: projectMap.get(issue.projectId as string) ?? null,
      sprint: issue.sprintId
        ? (sprintMap.get(issue.sprintId as string) ?? null)
        : null,
      epic: issue.epicId ? (epicMap.get(issue.epicId as string) ?? null) : null,
    }
  })

  const projects = lowerText
    ? allProjects
        .filter((p) => {
          const proj = p as unknown as Record<string, unknown>
          return (
            (proj.name as string).toLowerCase().includes(lowerText) ||
            (proj.key as string).toLowerCase().includes(lowerText)
          )
        })
        .slice(0, 4)
    : []

  const users = lowerText
    ? allUsers
        .filter((u) => {
          const user = u as unknown as Record<string, unknown>
          return (
            (user.name as string).toLowerCase().includes(lowerText) ||
            (user.email as string).toLowerCase().includes(lowerText)
          )
        })
        .slice(0, 4)
    : []

  return NextResponse.json({ issues, projects, users })
}
