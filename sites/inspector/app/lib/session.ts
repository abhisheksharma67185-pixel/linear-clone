/**
 * Per-session state management using AsyncLocalStorage.
 * Provides isolated state for each request/session.
 */

import { AsyncLocalStorage } from "async_hooks"
import { LinearStoreState, createInitialState } from "./state"

// AsyncLocalStorage for per-request state isolation
const sessionStorage = new AsyncLocalStorage<LinearStoreState>()

// Fallback default state for non-request contexts (RSC pages, tests, etc)
let defaultState: LinearStoreState | null = null

/**
 * Get the current session state.
 * In request context: returns the per-request state
 * Otherwise: returns the shared default state
 */
export function _state(): LinearStoreState {
  const store = sessionStorage.getStore()
  if (store) return store

  if (!defaultState) {
    defaultState = createInitialState()
  }
  return defaultState
}

/**
 * Wraps a route handler with session isolation.
 * Creates a new isolated state for each request.
 */
export function withSession(
  handler: () => Promise<Response>
): Promise<Response> {
  const state = createInitialState()
  return sessionStorage.run(state, () => handler())
}
