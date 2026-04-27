// Admin-only view-state for the Teams settings page. The underlying Team
// records live in app/lib/store.ts; this file only tracks lifecycle state
// (active / retired / recently-deleted) and per-user membership mutations
// that don't warrant changing the shared mock data.

import type { Team } from "@/app/lib/mock-data"

export type TeamAdminStatus = "active" | "retired" | "recently-deleted"

const _status = new Map<string, TeamAdminStatus>()
const _leftByCurrentUser = new Set<string>()

export function getTeamStatus(id: string): TeamAdminStatus {
  return _status.get(id) ?? "active"
}

export function setTeamStatus(id: string, status: TeamAdminStatus): void {
  if (status === "active") {
    _status.delete(id)
  } else {
    _status.set(id, status)
  }
}

export function archiveTeam(id: string) {
  setTeamStatus(id, "retired")
}

export function deleteTeam(id: string) {
  setTeamStatus(id, "recently-deleted")
}

export function restoreTeam(id: string) {
  setTeamStatus(id, "active")
}

export function leaveTeam(id: string) {
  _leftByCurrentUser.add(id)
}

export function hasLeftTeam(id: string): boolean {
  return _leftByCurrentUser.has(id)
}

export function resetTeamsAdminState(): void {
  _status.clear()
  _leftByCurrentUser.clear()
}

// ---------------------------------------------------------------------------
// Summary projection
// ---------------------------------------------------------------------------

export type TeamSummary = {
  id: string
  key: string
  name: string
  description: string
  visibility: "workspace" | "private"
  createdAt: string
  memberCount: number
  issueCount: number
  status: TeamAdminStatus
  currentUserIsMember: boolean
}

export function summarizeTeams(args: {
  teams: Team[]
  issuesByTeamId: Record<string, number>
  currentUserId: string
}): TeamSummary[] {
  return args.teams.map((t) => {
    const issueCount = args.issuesByTeamId[t.id] ?? 0
    const memberCount = t.memberIds.length
    const left = hasLeftTeam(t.id)
    return {
      id: t.id,
      key: t.key,
      name: t.name,
      description: t.description,
      visibility: "workspace",
      createdAt: t.createdAt,
      memberCount: left ? Math.max(0, memberCount - 1) : memberCount,
      issueCount,
      status: getTeamStatus(t.id),
      currentUserIsMember: !left && t.memberIds.includes(args.currentUserId),
    }
  })
}

// ---------------------------------------------------------------------------
// Filter + sort helpers (exported for testing + reuse)
// ---------------------------------------------------------------------------

export type TeamsSortKey =
  | "name"
  | "visibility"
  | "memberCount"
  | "issueCount"
  | "createdAt"

export type TeamsSortDir = "asc" | "desc"

export function sortTeamSummaries(
  teams: TeamSummary[],
  key: TeamsSortKey,
  dir: TeamsSortDir
): TeamSummary[] {
  const direction = dir === "asc" ? 1 : -1
  return [...teams].sort((a, b) => {
    const av = a[key] as string | number
    const bv = b[key] as string | number
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * direction
    }
    return String(av).localeCompare(String(bv)) * direction
  })
}

export function filterTeamSummaries(
  teams: TeamSummary[],
  query: string,
  status: TeamAdminStatus | "all"
): TeamSummary[] {
  const q = query.trim().toLowerCase()
  return teams.filter((t) => {
    if (status !== "all" && t.status !== status) return false
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.key.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
  })
}
