// Admin-only view state for the Members settings page.
// Layers on top of the shared member store (app/lib/store.ts + mock-data.ts)
// to add workspace-level concerns that don't belong on the core Member type:
// lifecycle status, invitations, suspension, "last seen", and application bots.

import type { Member } from "@/app/lib/mock-data"

export type MemberRole = "admin" | "member" | "guest"
export type MemberStatus =
  | "active"
  | "invited"
  | "suspended"
  | "application"

// Shadow state — keeps base member data untouched while letting the page
// change roles, suspend/resend, etc.
const _roleOverrides = new Map<string, MemberRole>()
const _statusOverrides = new Map<string, MemberStatus>()
const _lastSeenOverrides = new Map<string, string | null>()

// Synthetic records (invites + application bots) live outside the base list.
type ExtraMember = {
  id: string
  name: string
  email: string
  avatar: string
  role: MemberRole
  status: MemberStatus
  joinedAt: string
  lastSeenAt: string | null
  username: string
  teamCount?: number
}

const _extras: ExtraMember[] = []

let _seeded = false

function now(): string {
  return new Date().toISOString()
}

export function resetMembersAdminState(): void {
  _roleOverrides.clear()
  _statusOverrides.clear()
  _lastSeenOverrides.clear()
  _extras.length = 0
  _seeded = false
}

// ---------------------------------------------------------------------------
// Seed realistic data on first read. Members are pinned by id so the
// assignment is deterministic across reloads.
// ---------------------------------------------------------------------------

const DEFAULT_ROLE: Record<string, MemberRole> = {
  "usr-1": "admin",
  "usr-2": "admin",
  // usr-3..usr-13 → members
  "usr-14": "guest",
  "usr-15": "guest",
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 3600_000).toISOString()
}

const DEFAULT_LAST_SEEN: Record<string, string | null> = {
  "usr-1": hoursAgo(0.02), // ~1 min ago → Online
  "usr-2": hoursAgo(2),
  "usr-3": hoursAgo(0.02),
  "usr-4": daysAgo(1),
  "usr-5": hoursAgo(6),
  "usr-6": daysAgo(3),
  "usr-7": hoursAgo(0.05),
  "usr-8": daysAgo(7),
  "usr-9": daysAgo(14),
  "usr-10": daysAgo(2),
  "usr-11": null, // Never
  "usr-12": daysAgo(30),
  "usr-13": hoursAgo(18),
  "usr-14": hoursAgo(0.03),
  "usr-15": daysAgo(5),
}

const DEFAULT_STATUS: Record<string, MemberStatus> = {
  "usr-8": "suspended",
  "usr-11": "invited",
}

function seed(): void {
  if (_seeded) return
  _seeded = true
  // A single Application bot to satisfy the spec.
  _extras.push({
    id: "app-linear",
    name: "Linear",
    email: "linear@theta.internal",
    avatar: "",
    role: "member",
    status: "application",
    joinedAt: "2025-09-12T09:00:00.000Z",
    lastSeenAt: hoursAgo(0.1),
    username: "linear",
    teamCount: 0,
  })
}

// ---------------------------------------------------------------------------
// Summary projection
// ---------------------------------------------------------------------------

export type MemberSummary = {
  id: string
  name: string
  email: string
  avatar: string
  username: string
  role: MemberRole
  status: MemberStatus
  joinedAt: string
  lastSeenAt: string | null
  teamCount: number
  isApplication: boolean
  isInvite: boolean
}

export function summarizeMembers(args: {
  members: Member[]
  teamMemberIdsByMember: Record<string, number>
}): MemberSummary[] {
  seed()

  const baseSummaries: MemberSummary[] = args.members.map((m) => {
    const role: MemberRole =
      _roleOverrides.get(m.id) ?? DEFAULT_ROLE[m.id] ?? "member"
    const status: MemberStatus =
      _statusOverrides.get(m.id) ?? DEFAULT_STATUS[m.id] ?? "active"
    const lastSeenAt = _lastSeenOverrides.has(m.id)
      ? (_lastSeenOverrides.get(m.id) ?? null)
      : (DEFAULT_LAST_SEEN[m.id] ?? null)
    const joinedAt = "2025-09-01T09:00:00.000Z"
    const username = m.email.split("@")[0].toLowerCase()
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      username,
      role,
      status,
      joinedAt,
      lastSeenAt,
      teamCount: args.teamMemberIdsByMember[m.id] ?? 0,
      isApplication: false,
      isInvite: status === "invited",
    }
  })

  const extras: MemberSummary[] = _extras.map((x) => ({
    id: x.id,
    name: x.name,
    email: x.email,
    avatar: x.avatar,
    username: x.username,
    role: x.role,
    status: x.status,
    joinedAt: x.joinedAt,
    lastSeenAt: x.lastSeenAt,
    teamCount: x.teamCount ?? 0,
    isApplication: x.status === "application",
    isInvite: x.status === "invited",
  }))

  return [...baseSummaries, ...extras]
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateInviteEmails(raw: unknown): Result<string[]> {
  if (typeof raw !== "string") {
    return { success: false, error: "Invalid email list" }
  }
  const parts = raw
    .split(/[\s,;\n]+/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) {
    return { success: false, error: "Enter at least one email" }
  }
  const invalid = parts.filter((p) => !EMAIL_PATTERN.test(p))
  if (invalid.length > 0) {
    return {
      success: false,
      error: `Invalid email${invalid.length === 1 ? "" : "s"}: ${invalid.join(", ")}`,
    }
  }
  // De-dupe
  return { success: true, data: [...new Set(parts.map((p) => p.toLowerCase()))] }
}

export function inviteMembers(raw: unknown): Result<MemberSummary[]> {
  const result = validateInviteEmails(raw)
  if (!result.success) return result
  seed()
  const created: MemberSummary[] = []
  for (const email of result.data) {
    const id = `inv-${Math.random().toString(36).slice(2, 10)}`
    const username = email.split("@")[0].toLowerCase()
    const extra: ExtraMember = {
      id,
      name: email,
      email,
      avatar: "",
      role: "admin",
      status: "invited",
      joinedAt: now(),
      lastSeenAt: null,
      username,
      teamCount: 0,
    }
    _extras.push(extra)
    created.push({
      id,
      name: extra.name,
      email: extra.email,
      avatar: extra.avatar,
      username: extra.username,
      role: extra.role,
      status: extra.status,
      joinedAt: extra.joinedAt,
      lastSeenAt: extra.lastSeenAt,
      teamCount: 0,
      isApplication: false,
      isInvite: true,
    })
  }
  return { success: true, data: created }
}

export function setMemberRole(id: string, role: MemberRole): Result<{ id: string; role: MemberRole }> {
  if (!["admin", "member", "guest"].includes(role)) {
    return { success: false, error: "Invalid role" }
  }
  _roleOverrides.set(id, role)
  // Reflect the role change on extras too (invites keep their synthetic role).
  const extra = _extras.find((x) => x.id === id)
  if (extra) extra.role = role
  return { success: true, data: { id, role } }
}

export function suspendMember(id: string): Result<{ id: string }> {
  _statusOverrides.set(id, "suspended")
  return { success: true, data: { id } }
}

export function unsuspendMember(id: string): Result<{ id: string }> {
  _statusOverrides.set(id, "active")
  return { success: true, data: { id } }
}

export function removeMember(id: string): Result<{ id: string }> {
  // For base members we mark as suspended (mock: no hard delete); for synthetic
  // extras we actually remove them.
  const extraIdx = _extras.findIndex((x) => x.id === id)
  if (extraIdx !== -1) {
    _extras.splice(extraIdx, 1)
    return { success: true, data: { id } }
  }
  _statusOverrides.set(id, "suspended")
  return { success: true, data: { id } }
}

export function resendInvite(id: string): Result<{ id: string; sentAt: string }> {
  const extra = _extras.find((x) => x.id === id)
  if (!extra || extra.status !== "invited") {
    // Base members flagged as invited in DEFAULT_STATUS also qualify.
    if (_statusOverrides.get(id) !== "invited" && DEFAULT_STATUS[id] !== "invited") {
      return { success: false, error: "Member is not invited" }
    }
  }
  return { success: true, data: { id, sentAt: now() } }
}

// ---------------------------------------------------------------------------
// Filter + sort helpers
// ---------------------------------------------------------------------------

export type MembersSortKey =
  | "name"
  | "email"
  | "status"
  | "teamCount"
  | "joinedAt"
  | "lastSeenAt"
export type MembersSortDir = "asc" | "desc"

export function sortMemberSummaries(
  items: MemberSummary[],
  key: MembersSortKey,
  dir: MembersSortDir
): MemberSummary[] {
  const direction = dir === "asc" ? 1 : -1
  return [...items].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    // Nulls sort last regardless of direction.
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * direction
    }
    return String(av).localeCompare(String(bv)) * direction
  })
}

export function filterMemberSummaries(
  items: MemberSummary[],
  query: string,
  status: MemberStatus | "all"
): MemberSummary[] {
  const q = query.trim().toLowerCase()
  return items.filter((m) => {
    if (status !== "all" && m.status !== status) return false
    if (!q) return true
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q)
    )
  })
}

// ---------------------------------------------------------------------------
// Last-seen formatting
// ---------------------------------------------------------------------------

export function formatLastSeen(
  lastSeenAt: string | null,
  nowDate: Date = new Date()
): { label: string; online: boolean } {
  if (!lastSeenAt) return { label: "Never", online: false }
  const d = new Date(lastSeenAt)
  const diffMs = nowDate.getTime() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 5) return { label: "Online", online: true }
  if (minutes < 60) return { label: `${minutes}m ago`, online: false }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return { label: `${hours}h ago`, online: false }
  const days = Math.floor(hours / 24)
  if (days === 1) return { label: "Yesterday", online: false }
  if (days < 7) return { label: `${days}d ago`, online: false }
  return {
    label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    online: false,
  }
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

function csvEscape(v: string | number): string {
  const s = String(v)
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCsv(members: MemberSummary[]): string {
  const header = [
    "Name",
    "Email",
    "Role",
    "Status",
    "Teams",
    "Joined",
    "Last seen",
  ].join(",")
  const rows = members.map((m) =>
    [
      csvEscape(m.name),
      csvEscape(m.email),
      csvEscape(m.role),
      csvEscape(m.status),
      csvEscape(m.teamCount),
      csvEscape(m.joinedAt),
      csvEscape(m.lastSeenAt ?? ""),
    ].join(",")
  )
  return [header, ...rows].join("\n")
}
