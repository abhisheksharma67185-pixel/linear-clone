// In-memory mock store for the Security & access page demo.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type {
  Session,
  Passkey,
  ApiKey,
  IntegrationState,
  IntegrationStatus,
} from "@/app/lib/state"

export type { Session, Passkey, ApiKey, IntegrationState, IntegrationStatus }

const now = () => new Date().toISOString()

function arrayProxy<T>(getArr: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_t, prop) {
      const arr = getArr()
      const value = (arr as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === "function"
        ? (value as (...a: unknown[]) => unknown).bind(arr)
        : value
    },
    set(_t, prop, value) {
      const arr = getArr() as unknown as Record<string | symbol, unknown>
      arr[prop] = value
      return true
    },
    has: (_t, prop) => prop in getArr(),
    ownKeys: () => Object.keys(getArr()),
    getOwnPropertyDescriptor: (_t, prop) =>
      Object.getOwnPropertyDescriptor(getArr(), prop),
  })
}

export const sessions: Session[] = arrayProxy(() => _state().sessions)
export const passkeys: Passkey[] = arrayProxy(() => _state().passkeys)
export const apiKeys: ApiKey[] = arrayProxy(() => _state().apiKeys)

// `integrations` is exposed as a Record<string, IntegrationState>. Like
// `workspace`, we expose it as a Proxy so direct property access targets the
// live session.
export const integrations: Record<string, IntegrationState> = new Proxy(
  {} as Record<string, IntegrationState>,
  {
    get: (_t, prop) =>
      (_state().integrations as Record<string | symbol, unknown>)[prop],
    set: (_t, prop, value) => {
      const map = _state().integrations as unknown as Record<
        string | symbol,
        unknown
      >
      map[prop] = value
      return true
    },
    has: (_t, prop) => prop in _state().integrations,
    ownKeys: () => Object.keys(_state().integrations),
    getOwnPropertyDescriptor: (_t, prop) =>
      Object.getOwnPropertyDescriptor(_state().integrations, prop),
    deleteProperty: (_t, prop) => {
      const map = _state().integrations as Record<string, IntegrationState>
      delete map[prop as string]
      return true
    },
  }
)

export function deleteSession(id: string): boolean {
  const arr = _state().sessions
  const idx = arr.findIndex((s) => s.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}

export function addPasskey(name: string): Passkey {
  const pk: Passkey = {
    id: `pk_${Math.random().toString(36).slice(2, 10)}`,
    name,
    createdAt: now(),
  }
  _state().passkeys.push(pk)
  return pk
}

export function deletePasskey(id: string): boolean {
  const arr = _state().passkeys
  const idx = arr.findIndex((p) => p.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}

export function addApiKey(name: string, expiresAt: string | null): ApiKey {
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
  _state().apiKeys.push(key)
  return key
}

export function deleteApiKey(id: string): boolean {
  const arr = _state().apiKeys
  const idx = arr.findIndex((k) => k.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}

export function disconnectIntegration(provider: string): boolean {
  const map = _state().integrations
  const current = map[provider]
  if (!current) return false
  current.status = "disconnected"
  current.accountHandle = null
  current.connectedAt = null
  return true
}
