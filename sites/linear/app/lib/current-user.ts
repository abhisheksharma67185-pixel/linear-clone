/**
 * Single source of truth for the signed-in user.
 *
 * The mock app does not have real auth — but every screen that says
 * "you", "my", "assigned to me", "created by me", or seeds form fields
 * needs to agree on who the current user is. Putting this in one module
 * means a future swap to real session/cookie-based auth is a single-file
 * change, and prevents drift like the bug where the New Issue modal
 * defaulted Assignee to a hardcoded `usr-1` even though that was a
 * different person ("Priya Sharma") than the profile page showed.
 */

import type { Member } from "@/app/lib/mock-data"

/** Stable ID of the signed-in user. Maps to a row in `members`. */
export const CURRENT_USER_ID = "usr-1"

/**
 * Resolve the current user's `Member` record from a roster you've
 * already loaded (e.g. from `/api/data/members`). Returns `null` if
 * the roster hasn't loaded yet — callers should treat that as "not
 * yet known" and avoid rendering personalised UI until it resolves.
 */
export function resolveCurrentUser(members: Member[]): Member | null {
  return members.find((m) => m.id === CURRENT_USER_ID) ?? null
}
