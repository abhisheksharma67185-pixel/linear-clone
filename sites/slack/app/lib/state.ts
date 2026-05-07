// ---------------------------------------------------------------------------
// SlackStoreState — the per-session state container.
//
// Everything that used to live as module-level `let`s in `app/lib/store.ts`
// (and the small RL bookkeeping in `app/api/rl/route.ts`) now lives on this
// object, one instance per rollout session. The session layer (./session.ts)
// owns the registry + AsyncLocalStorage; consumers read state via `_state()`.
// ---------------------------------------------------------------------------

import {
  workspace as initialWorkspace,
  preferences as initialPreferences,
  users as initialUsers,
  channels as initialChannels,
  directMessages as initialDirectMessages,
  messages as initialMessages,
  notifications as initialNotifications,
  readStates as initialReadStates,
  userGroups as initialUserGroups,
  savedItems as initialSavedItems,
  bookmarks as initialBookmarks,
  canvases as initialCanvases,
  lists as initialLists,
  workflows as initialWorkflows,
  huddles as initialHuddles,
  callHistory as initialCallHistory,
  type User,
  type Channel,
  type DirectMessage,
  type Message,
  type Notification,
  type ReadState,
  type UserGroup,
  type SavedItem,
  type Bookmark,
  type Canvas,
  type SlackList,
  type Workflow,
  type Huddle,
  type Call,
  type Preferences,
} from "./mock-data"

// ---------------------------------------------------------------------------
// Workspace type — the original mock-data exports `workspace` as a value but
// not as a named type, so re-derive it from the seed.
// ---------------------------------------------------------------------------

export type Workspace = typeof initialWorkspace

// ---------------------------------------------------------------------------
// RL session state — was module-level in app/api/rl/route.ts. Per-session so
// concurrent rollouts don't clobber each other's currentPage / step counter.
// ---------------------------------------------------------------------------

export interface RLState {
  currentPage: string
  lastAction: string | null
  stepCount: number
}

// ---------------------------------------------------------------------------
// Chaos config — mirrors @thetabench/core's UniversalConfig and lives on the
// per-session state so a future chaos middleware can read it on the hot path
// without crossing the core boundary on every request. Currently written by
// `slackAdapter.applyConfig` but not yet enforced by middleware.
// ---------------------------------------------------------------------------

export interface ChaosState {
  latencyMs: number
  errorRate: number
  rateLimitPerMinute: number | null
  rateLimitWindowStartMs: number
  rateLimitCount: number
}

// ---------------------------------------------------------------------------
// SlackStoreState
// ---------------------------------------------------------------------------

export interface SlackStoreState {
  workspace: Workspace
  preferences: Preferences
  users: User[]
  channels: Channel[]
  directMessages: DirectMessage[]
  messages: Message[]
  notifications: Notification[]
  readStates: ReadState[]
  userGroups: UserGroup[]
  savedItems: SavedItem[]
  bookmarks: Bookmark[]
  canvases: Canvas[]
  lists: SlackList[]
  workflows: Workflow[]
  huddles: Huddle[]
  callHistory: Call[]

  nextChannelId: number
  nextDmId: number
  nextMessageId: number
  nextNotificationId: number
  nextReadStateId: number
  nextUserGroupId: number
  nextSavedId: number
  nextBookmarkId: number
  nextCanvasId: number
  nextListId: number
  nextListItemId: number
  nextWorkflowId: number
  nextHuddleId: number
  nextCallId: number

  dateOverride: string | null
  dateCounter: number

  rl: RLState
  chaos: ChaosState
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

const INITIAL_RL: RLState = {
  currentPage: "/c/general",
  lastAction: null,
  stepCount: 0,
}

const INITIAL_CHAOS: ChaosState = {
  latencyMs: 0,
  errorRate: 0,
  rateLimitPerMinute: null,
  rateLimitWindowStartMs: 0,
  rateLimitCount: 0,
}

export function createInitialState(): SlackStoreState {
  return {
    workspace: deepClone(initialWorkspace),
    preferences: deepClone(initialPreferences),
    users: deepClone(initialUsers),
    channels: deepClone(initialChannels),
    directMessages: deepClone(initialDirectMessages),
    messages: deepClone(initialMessages),
    notifications: deepClone(initialNotifications),
    readStates: deepClone(initialReadStates),
    userGroups: deepClone(initialUserGroups),
    savedItems: deepClone(initialSavedItems),
    bookmarks: deepClone(initialBookmarks),
    canvases: deepClone(initialCanvases),
    lists: deepClone(initialLists),
    workflows: deepClone(initialWorkflows),
    huddles: deepClone(initialHuddles),
    callHistory: deepClone(initialCallHistory),

    nextChannelId: 20,
    nextDmId: 12,
    nextMessageId: 200,
    nextNotificationId: 20,
    nextReadStateId: 100,
    nextUserGroupId: 10,
    nextSavedId: 10,
    nextBookmarkId: 10,
    nextCanvasId: 10,
    nextListId: 10,
    nextListItemId: 20,
    nextWorkflowId: 10,
    nextHuddleId: 10,
    nextCallId: 10,

    dateOverride: null,
    dateCounter: 0,

    rl: { ...INITIAL_RL },
    chaos: { ...INITIAL_CHAOS },
  }
}

// ---------------------------------------------------------------------------
// In-place reset — same `state` reference is preserved (so any cached
// references keep targeting the right slot); only the field values are
// replaced.
// ---------------------------------------------------------------------------

export function resetState(state: SlackStoreState, seed?: number): void {
  const fresh = createInitialState()
  Object.assign(state, fresh)
  // Replace nested objects too so callers that captured `state.workspace`
  // (or `.preferences`, `.rl`, `.chaos`) don't keep mutating the old slot.
  state.workspace = fresh.workspace
  state.preferences = fresh.preferences
  state.rl = fresh.rl
  state.chaos = fresh.chaos

  // Match the original store.ts behavior: when a seed is provided, pin the
  // anchor date so reactions / message timestamps are reproducible.
  if (seed !== undefined) {
    state.dateOverride = "2026-04-13T12:00:00.000Z"
    state.dateCounter = 0
  }
}
