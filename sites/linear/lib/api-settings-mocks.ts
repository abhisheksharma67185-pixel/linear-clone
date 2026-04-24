// In-memory mocks for the API settings page (OAuth applications + webhooks).

export type OAuthApp = {
  id: string
  name: string
  description: string
  redirectUris: string[]
  scopes: string[]
  iconDataUrl: string | null
  clientId: string
  clientSecret: string
  createdAt: string
}

export type WebhookResource =
  | "issues"
  | "comments"
  | "projects"
  | "cycles"
  | "labels"
  | "reactions"
  | "initiatives"
  | "documents"
  | "customer-requests"
  | "issue-attachments"
  | "project-updates"

export const WEBHOOK_RESOURCES: {
  value: WebhookResource
  label: string
}[] = [
  { value: "issues", label: "Issues" },
  { value: "comments", label: "Comments" },
  { value: "projects", label: "Projects" },
  { value: "project-updates", label: "Project updates" },
  { value: "cycles", label: "Cycles" },
  { value: "labels", label: "Labels" },
  { value: "reactions", label: "Reactions" },
  { value: "initiatives", label: "Initiatives" },
  { value: "documents", label: "Documents" },
  { value: "customer-requests", label: "Customer requests" },
  { value: "issue-attachments", label: "Issue attachments" },
]

export const OAUTH_SCOPES = [
  "read",
  "write",
  "admin",
  "issues:create",
  "comments:create",
] as const
export type OAuthScope = (typeof OAUTH_SCOPES)[number]

// Cryptographically-random secret, base64 encoded (~32 bytes of entropy).
export function generateSecret(): string {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  if (typeof btoa === "function") return btoa(binary)
  // Node.js fallback (test environment)
  return Buffer.from(bytes).toString("base64")
}

function generateClientId(): string {
  return `lin_oauth_${Math.random().toString(36).slice(2, 10)}${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

export type Webhook = {
  id: string
  url: string
  resources: WebhookResource[]
  teamId: string | null
  secret: string
  createdAt: string
}

// Store the arrays on `globalThis` so they survive Next.js dev's per-route
// module re-evaluation. Without this, the list and [id] routes can end up
// with separate module instances and appear to "lose" records between calls.
type Global = typeof globalThis & {
  __linearMock_oauthApps?: OAuthApp[]
  __linearMock_webhooks?: Webhook[]
}
const g = globalThis as Global
if (!g.__linearMock_oauthApps) g.__linearMock_oauthApps = []
if (!g.__linearMock_webhooks) g.__linearMock_webhooks = []

export const oauthApps: OAuthApp[] = g.__linearMock_oauthApps
export const webhooks: Webhook[] = g.__linearMock_webhooks

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const now = () => new Date().toISOString()

// ---------------------------------------------------------------------------
// OAuth apps
// ---------------------------------------------------------------------------

export function validateRedirectUri(raw: unknown): Result<string> {
  if (typeof raw !== "string") {
    return { success: false, error: "Redirect URI is required" }
  }
  const s = raw.trim()
  if (!s) return { success: false, error: "Redirect URI is required" }
  try {
    const u = new URL(s)
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { success: false, error: "Use http(s) URLs only" }
    }
    return { success: true, data: s }
  } catch {
    return { success: false, error: "Enter a valid URL" }
  }
}

export function parseRedirectUris(raw: unknown): Result<string[]> {
  if (typeof raw !== "string") {
    return { success: false, error: "At least one redirect URI is required" }
  }
  const parts = raw
    .split(/[\s,;\n]+/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) {
    return { success: false, error: "At least one redirect URI is required" }
  }
  const normalised: string[] = []
  for (const p of parts) {
    const v = validateRedirectUri(p)
    if (!v.success) return v
    normalised.push(v.data)
  }
  return { success: true, data: [...new Set(normalised)] }
}

type CreateOAuthAppInput = {
  name?: unknown
  description?: unknown
  redirectUris?: unknown
  scopes?: unknown
  iconDataUrl?: unknown
}

export function createOAuthApp(input: CreateOAuthAppInput): Result<OAuthApp> {
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return { success: false, error: "Name is required" }
  }
  const uris = parseRedirectUris(input.redirectUris)
  if (!uris.success) return uris
  const scopes = Array.isArray(input.scopes)
    ? input.scopes.filter(
        (s): s is string =>
          typeof s === "string" &&
          (OAUTH_SCOPES as readonly string[]).includes(s)
      )
    : []
  const app: OAuthApp = {
    id: `oauth_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    description:
      typeof input.description === "string" ? input.description.trim() : "",
    redirectUris: uris.data,
    scopes,
    iconDataUrl:
      typeof input.iconDataUrl === "string" &&
      input.iconDataUrl.startsWith("data:")
        ? input.iconDataUrl
        : null,
    clientId: generateClientId(),
    clientSecret: generateSecret(),
    createdAt: now(),
  }
  oauthApps.push(app)
  return { success: true, data: app }
}

export function rotateOAuthClientSecret(id: string): Result<OAuthApp> {
  const app = oauthApps.find((a) => a.id === id)
  if (!app) return { success: false, error: "OAuth app not found" }
  app.clientSecret = generateSecret()
  return { success: true, data: app }
}

export function updateOAuthApp(
  id: string,
  patch: {
    name?: string
    description?: string
    redirectUris?: string
    scopes?: string[]
    iconDataUrl?: string | null
  }
): Result<OAuthApp> {
  const app = oauthApps.find((a) => a.id === id)
  if (!app) return { success: false, error: "OAuth app not found" }
  if (patch.name !== undefined) {
    if (patch.name.trim().length === 0) {
      return { success: false, error: "Name cannot be empty" }
    }
    app.name = patch.name.trim()
  }
  if (patch.description !== undefined) {
    app.description = patch.description.trim()
  }
  if (patch.redirectUris !== undefined) {
    const uris = parseRedirectUris(patch.redirectUris)
    if (!uris.success) return uris
    app.redirectUris = uris.data
  }
  if (patch.scopes !== undefined) {
    app.scopes = patch.scopes.filter((s) =>
      (OAUTH_SCOPES as readonly string[]).includes(s)
    )
  }
  if (patch.iconDataUrl !== undefined) {
    app.iconDataUrl =
      typeof patch.iconDataUrl === "string" &&
      patch.iconDataUrl.startsWith("data:")
        ? patch.iconDataUrl
        : patch.iconDataUrl === null
          ? null
          : app.iconDataUrl
  }
  return { success: true, data: app }
}

export function deleteOAuthApp(id: string): Result<{ id: string }> {
  const idx = oauthApps.findIndex((a) => a.id === id)
  if (idx === -1) return { success: false, error: "OAuth app not found" }
  oauthApps.splice(idx, 1)
  return { success: true, data: { id } }
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export function validateWebhookUrl(raw: unknown): Result<string> {
  if (typeof raw !== "string") {
    return { success: false, error: "Webhook URL is required" }
  }
  const s = raw.trim()
  if (!s) return { success: false, error: "Webhook URL is required" }
  try {
    const u = new URL(s)
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { success: false, error: "Use http(s) URLs only" }
    }
    return { success: true, data: s }
  } catch {
    return { success: false, error: "Enter a valid URL" }
  }
}

type CreateWebhookInput = {
  url?: unknown
  resources?: unknown
  teamId?: unknown
  secret?: unknown
}

export function createWebhook(input: CreateWebhookInput): Result<Webhook> {
  const url = validateWebhookUrl(input.url)
  if (!url.success) return url
  const allowed = new Set(WEBHOOK_RESOURCES.map((r) => r.value))
  const resources = Array.isArray(input.resources)
    ? input.resources.filter(
        (r): r is WebhookResource =>
          typeof r === "string" && allowed.has(r as WebhookResource)
      )
    : []
  if (resources.length === 0) {
    return { success: false, error: "Select at least one resource type" }
  }
  const teamId =
    typeof input.teamId === "string" && input.teamId.trim().length > 0
      ? input.teamId.trim()
      : null
  const secret =
    typeof input.secret === "string" && input.secret.trim().length > 0
      ? input.secret.trim()
      : generateSecret()
  const webhook: Webhook = {
    id: `wh_${Math.random().toString(36).slice(2, 10)}`,
    url: url.data,
    resources,
    teamId,
    secret,
    createdAt: now(),
  }
  webhooks.push(webhook)
  return { success: true, data: webhook }
}

export function rotateWebhookSecret(id: string): Result<Webhook> {
  const webhook = webhooks.find((w) => w.id === id)
  if (!webhook) return { success: false, error: "Webhook not found" }
  webhook.secret = generateSecret()
  return { success: true, data: webhook }
}

export function updateWebhook(
  id: string,
  patch: {
    url?: string
    resources?: WebhookResource[]
    teamId?: string | null
    secret?: string
  }
): Result<Webhook> {
  const webhook = webhooks.find((w) => w.id === id)
  if (!webhook) return { success: false, error: "Webhook not found" }
  if (patch.url !== undefined) {
    const url = validateWebhookUrl(patch.url)
    if (!url.success) return url
    webhook.url = url.data
  }
  if (patch.resources !== undefined) {
    const allowed = new Set(WEBHOOK_RESOURCES.map((r) => r.value))
    const filtered = patch.resources.filter((r) => allowed.has(r))
    if (filtered.length === 0) {
      return { success: false, error: "Select at least one resource type" }
    }
    webhook.resources = filtered
  }
  if (patch.teamId !== undefined) {
    webhook.teamId = patch.teamId
  }
  if (patch.secret !== undefined) {
    webhook.secret = patch.secret
  }
  return { success: true, data: webhook }
}

export function deleteWebhook(id: string): Result<{ id: string }> {
  const idx = webhooks.findIndex((w) => w.id === id)
  if (idx === -1) return { success: false, error: "Webhook not found" }
  webhooks.splice(idx, 1)
  return { success: true, data: { id } }
}
