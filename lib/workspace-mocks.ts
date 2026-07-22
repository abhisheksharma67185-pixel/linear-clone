// In-memory mock state for the Workspace settings page.
// State now lives on the per-session LinearStoreState (see app/lib/state.ts);
// this module is a thin facade that preserves the original public shape.

import { _state } from "@/app/lib/session"
import type { WorkspaceState } from "@/app/lib/state"

export type { WorkspaceState }

// Lowercase letters, numbers, hyphens; no leading/trailing hyphen; 2-32 chars.
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/

export const DELETION_CODE_TTL_MS = 10 * 60 * 1000

type Result<T> = { success: true; data: T } | { success: false; error: string }

// ---------------------------------------------------------------------------
// Proxy over the current session's workspace slot. Every read and write hits
// `_state().workspace`, so callers that hold the `workspace` reference and
// mutate fields directly (incl. the existing tests) still target the right
// rollout's state.
// ---------------------------------------------------------------------------

export const workspace: WorkspaceState = new Proxy({} as WorkspaceState, {
  get: (_t, prop) =>
    (_state().workspace as unknown as Record<string | symbol, unknown>)[prop],
  set: (_t, prop, value) => {
    const ws = _state().workspace as unknown as Record<string | symbol, unknown>
    ws[prop] = value
    return true
  },
  has: (_t, prop) => prop in _state().workspace,
  ownKeys: () => Object.keys(_state().workspace),
  getOwnPropertyDescriptor: (_t, prop) =>
    Object.getOwnPropertyDescriptor(_state().workspace, prop),
})

export function validateName(raw: unknown): Result<string> {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { success: false, error: "Name is required" }
  }
  const n = raw.trim()
  if (n.length > 64) {
    return { success: false, error: "Name is too long (max 64)" }
  }
  return { success: true, data: n }
}

export function validateSlug(raw: unknown): Result<string> {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { success: false, error: "URL is required" }
  }
  const s = raw.trim().toLowerCase()
  if (!SLUG_PATTERN.test(s)) {
    return {
      success: false,
      error: "URL can only contain lowercase letters, numbers, and hyphens",
    }
  }
  return { success: true, data: s }
}

export function updateWorkspace(
  patch: Partial<
    Pick<
      WorkspaceState,
      "name" | "slug" | "logoDataUrl" | "fiscalYearStartMonth"
    >
  >
): Result<WorkspaceState> {
  const ws = _state().workspace
  if (patch.name !== undefined) {
    const n = validateName(patch.name)
    if (!n.success) return n
    ws.name = n.data
  }
  if (patch.slug !== undefined) {
    const s = validateSlug(patch.slug)
    if (!s.success) return s
    ws.slug = s.data
  }
  if (patch.logoDataUrl !== undefined) {
    ws.logoDataUrl = patch.logoDataUrl
  }
  if (patch.fiscalYearStartMonth !== undefined) {
    ws.fiscalYearStartMonth = String(patch.fiscalYearStartMonth).toLowerCase()
  }
  return { success: true, data: { ...ws } }
}

// ---------------------------------------------------------------------------
// Deletion flow — mock email-based code verification.
// ---------------------------------------------------------------------------

export function sendDeletionCode(): { code: string; expiresAt: number } {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const entry = { code, expiresAt: Date.now() + DELETION_CODE_TTL_MS }
  _state().pendingDeletionCode = entry
  return entry
}

export function peekDeletionCode(): { code: string; expiresAt: number } | null {
  return _state().pendingDeletionCode
}

export function resetDeletionCode(): void {
  _state().pendingDeletionCode = null
}

export function verifyDeletion(input: {
  code?: unknown
  acknowledged?: unknown
}): Result<{ ok: true }> {
  if (input.acknowledged !== true) {
    return {
      success: false,
      error: "You must acknowledge that workspace data will be deleted",
    }
  }
  if (typeof input.code !== "string" || input.code.trim().length === 0) {
    return { success: false, error: "Deletion code is required" }
  }
  const pending = _state().pendingDeletionCode
  if (!pending) {
    return { success: false, error: "Request a deletion code first" }
  }
  if (Date.now() > pending.expiresAt) {
    return { success: false, error: "Deletion code has expired" }
  }
  if (input.code.trim() !== pending.code) {
    return { success: false, error: "Deletion code is incorrect" }
  }
  return { success: true, data: { ok: true } }
}
