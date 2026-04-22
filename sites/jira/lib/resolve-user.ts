import type { User, Sprint, Epic } from "@/app/lib/mock-data"

/**
 * Build a lookup map from an array of users, keyed by user ID.
 */
export function buildUserMap(users: User[]): Map<string, User> {
  return new Map(users.map((u) => [u.id, u]))
}

/**
 * Resolve a user ID to a User object.
 * Returns undefined if not found.
 */
export function resolveUser(
  userId: string | null | undefined,
  users: User[] | Map<string, User>
): User | undefined {
  if (!userId) return undefined
  if (users instanceof Map) return users.get(userId)
  return users.find((u) => u.id === userId)
}

/**
 * Resolve a user ID to a display name string.
 * Returns the fallback if the user is not found.
 */
export function resolveUserName(
  userId: string | null | undefined,
  users: User[] | Map<string, User>,
  fallback = "Unassigned"
): string {
  const user = resolveUser(userId, users)
  return user?.displayName ?? user?.name ?? fallback
}

// ─── Sprint resolution ───────────────────────────────────────────────────────

/**
 * Build a lookup map from an array of sprints, keyed by sprint ID.
 */
export function buildSprintMap(sprints: Sprint[]): Map<string, Sprint> {
  return new Map(sprints.map((s) => [s.id, s]))
}

/**
 * Resolve a sprint ID to a Sprint object.
 * Returns undefined if not found.
 */
export function resolveSprint(
  sprintId: string | null | undefined,
  sprints: Sprint[] | Map<string, Sprint>
): Sprint | undefined {
  if (!sprintId) return undefined
  if (sprints instanceof Map) return sprints.get(sprintId)
  return sprints.find((s) => s.id === sprintId)
}

/**
 * Resolve a sprint ID to a display name string.
 * Returns the fallback if the sprint is not found.
 */
export function resolveSprintName(
  sprintId: string | null | undefined,
  sprints: Sprint[] | Map<string, Sprint>,
  fallback = "Backlog"
): string {
  return resolveSprint(sprintId, sprints)?.name ?? fallback
}

// ─── Epic resolution ─────────────────────────────────────────────────────────

/**
 * Resolve an epic ID to an Epic object.
 */
export function resolveEpic(
  epicId: string | null | undefined,
  epics: Epic[] | Map<string, Epic>
): Epic | undefined {
  if (!epicId) return undefined
  if (epics instanceof Map) return epics.get(epicId)
  return epics.find((e) => e.id === epicId)
}

/**
 * Resolve an epic ID to a display name string.
 */
export function resolveEpicName(
  epicId: string | null | undefined,
  epics: Epic[] | Map<string, Epic>,
  fallback = "None"
): string {
  return resolveEpic(epicId, epics)?.name ?? fallback
}
