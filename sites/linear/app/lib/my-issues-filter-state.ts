import type { Issue } from "@/app/lib/mock-data"

export type FilterKind =
  | "aiFilter"
  | "advancedFilter"
  | "status"
  | "assignee"
  | "agent"
  | "creator"
  | "priority"
  | "labels"
  | "relations"
  | "suggestedLabel"
  | "dates"
  | "project"
  | "projectProperties"
  | "initiative"
  | "subscribers"
  | "autoClosed"
  | "content"
  | "links"
  | "template"

export const FILTER_LABEL: Record<FilterKind, string> = {
  aiFilter: "AI filter",
  advancedFilter: "Advanced filter",
  status: "Status",
  assignee: "Assignee",
  agent: "Agent",
  creator: "Creator",
  priority: "Priority",
  labels: "Labels",
  relations: "Relations",
  suggestedLabel: "Suggested label",
  dates: "Dates",
  project: "Project",
  projectProperties: "Project properties",
  initiative: "Initiative",
  subscribers: "Subscribers",
  autoClosed: "Auto-closed",
  content: "Content",
  links: "Links",
  template: "Template",
}

export const FILTER_GROUPS: { items: FilterKind[] }[] = [
  { items: ["aiFilter", "advancedFilter"] },
  {
    items: [
      "status",
      "assignee",
      "agent",
      "creator",
      "priority",
      "labels",
      "relations",
      "suggestedLabel",
      "dates",
    ],
  },
  { items: ["project", "projectProperties", "initiative"] },
  {
    items: [
      "subscribers",
      "autoClosed",
      "content",
      "links",
      "template",
    ],
  },
]

const ACTIVE_FILTERS: ReadonlySet<FilterKind> = new Set([
  "status",
  "priority",
  "assignee",
  "creator",
  "labels",
  "project",
])

export type FilterState = Partial<Record<FilterKind, string[]>>

export function serializeFilters(filters: FilterState): string {
  const parts: string[] = []
  for (const kind of Object.keys(filters) as FilterKind[]) {
    const values = filters[kind]
    if (!values || values.length === 0) continue
    parts.push(`${kind}:${values.map(encodeURIComponent).join(",")}`)
  }
  return parts.join(";")
}

export function parseFilters(qs: string | null | undefined): FilterState {
  if (!qs) return {}
  const out: FilterState = {}
  for (const segment of qs.split(";")) {
    const [kind, raw] = segment.split(":")
    if (!kind) continue
    const values = (raw ?? "")
      .split(",")
      .map(decodeURIComponent)
      .filter(Boolean)
    out[kind as FilterKind] = values
  }
  return out
}

export function countActiveFilters(filters: FilterState): number {
  return (Object.keys(filters) as FilterKind[]).reduce((n, k) => {
    const v = filters[k]
    return n + (v && v.length > 0 ? 1 : 0)
  }, 0)
}

export function applyFilters(
  issues: Issue[],
  filters: FilterState
): Issue[] {
  return issues.filter((issue) => {
    for (const kind of Object.keys(filters) as FilterKind[]) {
      const values = filters[kind]
      if (!values || values.length === 0) continue
      if (!ACTIVE_FILTERS.has(kind)) continue
      if (kind === "status" && !values.includes(issue.status)) return false
      if (kind === "priority" && !values.includes(issue.priority)) return false
      if (
        kind === "assignee" &&
        !values.includes(issue.assigneeId ?? "unassigned")
      )
        return false
      if (kind === "creator" && !values.includes(issue.creatorId)) return false
      if (kind === "project") {
        const pid = issue.projectId ?? "none"
        if (!values.includes(pid)) return false
      }
      if (kind === "labels") {
        if (!values.some((v) => issue.labelIds?.includes(v))) return false
      }
    }
    return true
  })
}

export function setFilterValues(
  filters: FilterState,
  kind: FilterKind,
  values: string[]
): FilterState {
  const next = { ...filters }
  if (values.length === 0) {
    delete next[kind]
  } else {
    next[kind] = values
  }
  return next
}

export function isInteractiveFilter(kind: FilterKind): boolean {
  return ACTIVE_FILTERS.has(kind)
}
