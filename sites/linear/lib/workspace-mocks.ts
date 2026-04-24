// In-memory mock state for the Workspace settings page.

export type WorkspaceState = {
  name: string
  slug: string
  logoDataUrl: string | null
  fiscalYearStartMonth: string // "january".."december"
  region: "us" | "eu"
}

export const workspace: WorkspaceState = {
  name: "Abhishek",
  slug: "abhishek2007",
  logoDataUrl: null,
  fiscalYearStartMonth: "january",
  region: "us",
}

// Lowercase letters, numbers, hyphens; no leading/trailing hyphen; 2-32 chars.
// Matches Linear's slug rules closely enough for the mock.
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

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
    Pick<WorkspaceState, "name" | "slug" | "logoDataUrl" | "fiscalYearStartMonth">
  >
): Result<WorkspaceState> {
  if (patch.name !== undefined) {
    const n = validateName(patch.name)
    if (!n.success) return n
    workspace.name = n.data
  }
  if (patch.slug !== undefined) {
    const s = validateSlug(patch.slug)
    if (!s.success) return s
    workspace.slug = s.data
  }
  if (patch.logoDataUrl !== undefined) {
    workspace.logoDataUrl = patch.logoDataUrl
  }
  if (patch.fiscalYearStartMonth !== undefined) {
    workspace.fiscalYearStartMonth = String(
      patch.fiscalYearStartMonth
    ).toLowerCase()
  }
  return { success: true, data: { ...workspace } }
}

// ---------------------------------------------------------------------------
// Deletion flow — mock email-based code verification.
// ---------------------------------------------------------------------------

type PendingCode = {
  code: string
  expiresAt: number
}

let pendingCode: PendingCode | null = null

export const DELETION_CODE_TTL_MS = 10 * 60 * 1000

export function sendDeletionCode(): { code: string; expiresAt: number } {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  pendingCode = { code, expiresAt: Date.now() + DELETION_CODE_TTL_MS }
  return pendingCode
}

export function peekDeletionCode(): PendingCode | null {
  return pendingCode
}

export function resetDeletionCode() {
  pendingCode = null
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
  if (!pendingCode) {
    return { success: false, error: "Request a deletion code first" }
  }
  if (Date.now() > pendingCode.expiresAt) {
    return { success: false, error: "Deletion code has expired" }
  }
  if (input.code.trim() !== pendingCode.code) {
    return { success: false, error: "Deletion code is incorrect" }
  }
  return { success: true, data: { ok: true } }
}
