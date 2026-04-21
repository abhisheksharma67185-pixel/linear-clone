import type { Cycle, Issue, Label, View } from "@/app/lib/mock-data"

export const CURRENT_USER = "usr-1"

interface Clause {
  field: string
  op: "=" | "is"
  value: string
}

export function parseFilter(query: string): Clause[] {
  return query
    .split(/\s+AND\s+/i)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw): Clause => {
      const isMatch = raw.match(/^(\w+)\s+is\s+(\w+)$/i)
      if (isMatch) {
        return { field: isMatch[1], op: "is", value: isMatch[2].toUpperCase() }
      }
      const eqMatch = raw.match(/^(\w+)\s*=\s*(.+)$/)
      if (eqMatch) {
        const value = eqMatch[2].trim().replace(/^["']|["']$/g, "")
        return { field: eqMatch[1], op: "=", value }
      }
      return { field: "", op: "=", value: "" }
    })
    .filter((c) => c.field)
}

export interface FilterContext {
  labels: Label[]
  cycles: Cycle[]
  viewTeamId: string
}

export function issueMatches(
  issue: Issue,
  clauses: Clause[],
  ctx: FilterContext,
): boolean {
  const labelsByName = new Map(ctx.labels.map((l) => [l.name, l.id]))
  const activeCycleId = (teamId: string) =>
    ctx.cycles.find((c) => c.teamId === teamId && c.state === "active")?.id ??
    null

  return clauses.every((clause) => {
    const { field, op, value } = clause
    if (field === "assignee") {
      if (op === "is" && value === "EMPTY") return issue.assigneeId === null
      if (value === "currentUser()") return issue.assigneeId === CURRENT_USER
      return issue.assigneeId === value
    }
    if (field === "status") return issue.status === value
    if (field === "priority") return issue.priority === value
    if (field === "label") {
      const id = labelsByName.get(value)
      return id ? issue.labelIds.includes(id) : false
    }
    if (field === "cycle") {
      if (value === "activeCycle()") {
        const id = activeCycleId(ctx.viewTeamId)
        return id != null && issue.cycleId === id
      }
      return issue.cycleId === value
    }
    if (field === "team") return issue.teamId === value
    return true
  })
}

export function filterIssuesForView(
  view: View,
  issues: Issue[],
  ctx: Omit<FilterContext, "viewTeamId">,
): Issue[] {
  const clauses = parseFilter(view.filterQuery)
  return issues.filter((issue) =>
    issueMatches(issue, clauses, { ...ctx, viewTeamId: view.teamId }),
  )
}
