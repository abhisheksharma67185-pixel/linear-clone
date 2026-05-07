// Admin-only view-state for the Teams settings page.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import type { Team } from "@/app/lib/mock-data"
import { _state } from "@/app/lib/session"
import type { TeamAdminStatus } from "@/app/lib/state"

export type { TeamAdminStatus }

export function getTeamStatus(id: string): TeamAdminStatus {
  return _state().teamsAdmin.status.get(id) ?? "active"
}

export function setTeamStatus(id: string, status: TeamAdminStatus): void {
  const map = _state().teamsAdmin.status
  if (status === "active") {
    map.delete(id)
  } else {
    map.set(id, status)
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
  _state().teamsAdmin.leftByCurrentUser.add(id)
}

export function hasLeftTeam(id: string): boolean {
  return _state().teamsAdmin.leftByCurrentUser.has(id)
}

export function resetTeamsAdminState(): void {
  const t = _state().teamsAdmin
  t.status.clear()
  t.leftByCurrentUser.clear()
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
// Filter + sort helpers
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
