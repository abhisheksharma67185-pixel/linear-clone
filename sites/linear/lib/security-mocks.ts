// In-memory mock store for the Security & access page demo.
// State resets on server restart; that's acceptable for a prototype.

export type Session = {
  id: string
  userAgent: string
  city: string
  countryCode: string
  isCurrent: boolean
  lastSeenAt: string
}

export type Passkey = {
  id: string
  name: string
  createdAt: string
}

export type ApiKey = {
  id: string
  name: string
  token: string
  lastFour: string
  expiresAt: string | null
  createdAt: string
}

const now = () => new Date().toISOString()

export const sessions: Session[] = [
  {
    id: "sess_current",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    city: "San Francisco",
    countryCode: "US",
    isCurrent: true,
    lastSeenAt: now(),
  },
  {
    id: "sess_mobile",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    city: "San Francisco",
    countryCode: "US",
    isCurrent: false,
    lastSeenAt: "2026-04-22T08:14:00Z",
  },
]

export const passkeys: Passkey[] = []
export const apiKeys: ApiKey[] = []

export function deleteSession(id: string): boolean {
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx === -1) return false
  sessions.splice(idx, 1)
  return true
}

export function addPasskey(name: string): Passkey {
  const pk: Passkey = {
    id: `pk_${Math.random().toString(36).slice(2, 10)}`,
    name,
    createdAt: now(),
  }
  passkeys.push(pk)
  return pk
}

export function deletePasskey(id: string): boolean {
  const idx = passkeys.findIndex((p) => p.id === id)
  if (idx === -1) return false
  passkeys.splice(idx, 1)
  return true
}

export function addApiKey(name: string, expiresAt: string | null): ApiKey {
  // Generate a realistic-looking token: lin_api_<40 hex chars>
  const rand = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")
  const token = `lin_api_${rand}`
  const key: ApiKey = {
    id: `key_${Math.random().toString(36).slice(2, 10)}`,
    name,
    token,
    lastFour: rand.slice(-4),
    expiresAt,
    createdAt: now(),
  }
  apiKeys.push(key)
  return key
}

export function deleteApiKey(id: string): boolean {
  const idx = apiKeys.findIndex((k) => k.id === id)
  if (idx === -1) return false
  apiKeys.splice(idx, 1)
  return true
}

// Personal connected accounts / integrations.

export type IntegrationStatus = "disconnected" | "connected"

export type IntegrationState = {
  provider: string
  status: IntegrationStatus
  accountHandle: string | null
  connectedAt: string | null
}

export const integrations: Record<string, IntegrationState> = {
  slack: {
    provider: "slack",
    status: "disconnected",
    accountHandle: null,
    connectedAt: null,
  },
  github: {
    provider: "github",
    status: "disconnected",
    accountHandle: null,
    connectedAt: null,
  },
  gcal: {
    provider: "gcal",
    status: "disconnected",
    accountHandle: null,
    connectedAt: null,
  },
  notion: {
    provider: "notion",
    status: "disconnected",
    accountHandle: null,
    connectedAt: null,
  },
}

export function disconnectIntegration(provider: string): boolean {
  const current = integrations[provider]
  if (!current) return false
  current.status = "disconnected"
  current.accountHandle = null
  current.connectedAt = null
  return true
}
