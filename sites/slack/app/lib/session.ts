// ---------------------------------------------------------------------------
// Per-rollout state isolation for the Slack site.
//
// Same shape as sites/linear/app/lib/session.ts:
//   1. AsyncLocalStorage when running inside an API route handler wrapped
//      with `withSession` (the agent / orchestrator path).
//   2. The "default" session fallback when running outside a request — RSC
//      pages, vitest tests, and any direct callers that haven't been migrated.
//
// Sessions are keyed by the `x-tbench-session` header (or `tbench_session`
// cookie). The orchestrator (inspector) supplies a fresh ID per rollout.
// ---------------------------------------------------------------------------

import { AsyncLocalStorage } from "node:async_hooks"

import { createInitialState, resetState, type SlackStoreState } from "./state"

const SESSION_HEADER = "x-tbench-session"
const SESSION_COOKIE = "tbench_session"
const DEFAULT_SESSION = "default"

// ---------------------------------------------------------------------------
// Registry + ALS
// ---------------------------------------------------------------------------

interface SessionContext {
  id: string
  state: SlackStoreState
}

const registry = new Map<string, SlackStoreState>()
const als = new AsyncLocalStorage<SessionContext>()

function getOrCreate(id: string): SlackStoreState {
  let s = registry.get(id)
  if (!s) {
    s = createInitialState()
    registry.set(id, s)
  }
  return s
}

// ---------------------------------------------------------------------------
// Public state access — sync, callable from anywhere on the server side.
// ---------------------------------------------------------------------------

export function _state(): SlackStoreState {
  const ctx = als.getStore()
  if (ctx) return ctx.state
  return getOrCreate(DEFAULT_SESSION)
}

export function getCurrentSessionId(): string {
  return als.getStore()?.id ?? DEFAULT_SESSION
}

// ---------------------------------------------------------------------------
// Orchestrator-facing helpers
// ---------------------------------------------------------------------------

export function resetSession(id: string, seed?: number): void {
  const existing = registry.get(id)
  if (existing) {
    resetState(existing, seed)
    return
  }
  const fresh = createInitialState()
  if (seed !== undefined) {
    resetState(fresh, seed)
  }
  registry.set(id, fresh)
}

export function deleteSession(id: string): boolean {
  return registry.delete(id)
}

export function listSessions(): string[] {
  return Array.from(registry.keys())
}

export function snapshotSession(id: string): SlackStoreState | undefined {
  const state = registry.get(id)
  if (!state) return undefined
  return JSON.parse(JSON.stringify(state)) as SlackStoreState
}

export function getStateForSession(id: string): SlackStoreState {
  return getOrCreate(id)
}

// ---------------------------------------------------------------------------
// Resolution from a Next.js Request
// ---------------------------------------------------------------------------

function resolveSessionId(request: Request): string {
  const headerValue = request.headers.get(SESSION_HEADER)
  if (headerValue && headerValue.trim()) {
    return headerValue.trim()
  }

  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    for (const part of cookieHeader.split(";")) {
      const eq = part.indexOf("=")
      if (eq === -1) continue
      const name = part.slice(0, eq).trim()
      if (name === SESSION_COOKIE) {
        return decodeURIComponent(part.slice(eq + 1).trim()) || DEFAULT_SESSION
      }
    }
  }

  return DEFAULT_SESSION
}

// ---------------------------------------------------------------------------
// withSession — wrap a route handler so it runs inside an ALS-bound context.
// ---------------------------------------------------------------------------

// Generic over the request type so handlers can declare `NextRequest`
// (or any subtype of Request) without TS contravariance complaints.
type RouteHandler<TCtx = unknown, TReq extends Request = Request> = (
  request: TReq,
  context: TCtx
) => Response | Promise<Response>

export function withSession<TCtx = unknown, TReq extends Request = Request>(
  handler: RouteHandler<TCtx, TReq>
): RouteHandler<TCtx, TReq> {
  return (request, context) => {
    const id = resolveSessionId(request)
    const state = getOrCreate(id)
    return als.run({ id, state }, () => handler(request, context))
  }
}

// ---------------------------------------------------------------------------
// runWithSession — primarily for tests and scripts that drive the store
// from outside a real request.
// ---------------------------------------------------------------------------

export function runWithSession<T>(id: string, fn: () => T): T {
  const state = getOrCreate(id)
  return als.run({ id, state }, fn)
}
