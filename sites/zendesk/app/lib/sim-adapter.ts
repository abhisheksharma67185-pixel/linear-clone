/**
 * Zendesk site adapter — wires @thetabench/core engine to Zendesk's store.
 * This file is the bridge between the generic engine and Zendesk-specific data.
 *
 * Import this once at app startup to register the adapter + tasks + predicates.
 */

import {
  registerSiteAdapter,
  registerTasks,
  registerPredicate,
  type SiteAdapter,
  type GenericSnapshot,
  type EvalCheck,
} from "@thetabench/core"

import * as store from "./store"

import { navigationTasks } from "./tasks/navigation"
import { ticketTasks } from "./tasks/tickets"
import { agentTasks } from "./tasks/agents"
import { viewTasks } from "./tasks/views"
import { macroTasks } from "./tasks/macros"
import { searchTasks } from "./tasks/search"
import { retrievalTasks } from "./tasks/retrieval"
import { impossibleTasks } from "./tasks/impossible"

// ---------------------------------------------------------------------------
// 1. Register site adapter
// ---------------------------------------------------------------------------

const zendeskAdapter: SiteAdapter = {
  getState: () => ({
    tickets: store.getTickets(),
    users: store.getUsers(),
    groups: store.getGroups(),
    brands: store.getBrands(),
    macros: store.getMacros(),
    views: store.getViews(),
    // Comments are flattened across all tickets so predicates can scan them.
    comments: store
      .getTickets()
      .flatMap((t) => store.getCommentsByTicket(t.id)),
  }),

  reset: (seed?: number) => store.reset(seed),

  executeMutation: (name: string, args: unknown[]) => {
    const MUTATION_ALLOWLIST = new Set([
      "createTicket",
      "updateTicket",
      "deleteTicket",
      "transitionTicket",
      "assignTicket",
      "mergeTickets",
      "addTag",
      "removeTag",
      "addComment",
      "createMacro",
      "updateMacro",
      "createGroup",
      "createUser",
    ])
    if (!MUTATION_ALLOWLIST.has(name)) {
      return { success: false, error: `Unknown mutation: ${name}` }
    }
    const fn = (
      store as unknown as Record<string, (...a: unknown[]) => unknown>
    )[name]
    if (fn) return fn(...args)
    return { success: false, error: `Mutation not found: ${name}` }
  },

  collections: [
    "tickets",
    "users",
    "groups",
    "brands",
    "macros",
    "views",
    "comments",
  ],
  singletons: [],
}

registerSiteAdapter(zendeskAdapter)

// ---------------------------------------------------------------------------
// 2. Register all tasks
// ---------------------------------------------------------------------------

registerTasks([
  ...navigationTasks,
  ...ticketTasks,
  ...agentTasks,
  ...viewTasks,
  ...macroTasks,
  ...searchTasks,
  ...retrievalTasks,
  ...impossibleTasks,
])

// ---------------------------------------------------------------------------
// 3. Register Zendesk-specific predicates
// ---------------------------------------------------------------------------

interface SnapshotTicket {
  id: string
  number?: number
  subject?: string
  status?: string
  priority?: string
  channel?: string
  assigneeId?: string | null
  groupId?: string | null
  tags?: string[]
}

interface SnapshotComment {
  id: string
  ticketId: string
  authorId: string
  body: string
  public: boolean
}

interface SnapshotMacro {
  id: string
  title?: string
  active?: boolean
}

interface SnapshotGroup {
  id: string
  name?: string
}

interface SnapshotUser {
  id: string
  email?: string
}

function tickets(snapshot: GenericSnapshot): SnapshotTicket[] {
  return (snapshot.tickets as SnapshotTicket[]) ?? []
}

function commentsList(snapshot: GenericSnapshot): SnapshotComment[] {
  return (snapshot.comments as SnapshotComment[]) ?? []
}

registerPredicate(
  "ticket_has_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticket = tickets(snapshot).find((t) => t.id === check.id)
    return ticket?.status === check.expected
  }
)

registerPredicate(
  "ticket_has_priority",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticket = tickets(snapshot).find((t) => t.id === check.id)
    return ticket?.priority === check.expected
  }
)

registerPredicate(
  "ticket_has_assignee",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticket = tickets(snapshot).find((t) => t.id === check.id)
    return ticket?.assigneeId === check.expected
  }
)

registerPredicate(
  "ticket_has_tag",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticket = tickets(snapshot).find((t) => t.id === check.id)
    return ticket?.tags?.includes(String(check.expected ?? "")) ?? false
  }
)

registerPredicate(
  "ticket_lacks_tag",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticket = tickets(snapshot).find((t) => t.id === check.id)
    if (!ticket) return false
    return !(ticket.tags ?? []).includes(String(check.expected ?? ""))
  }
)

registerPredicate(
  "ticket_exists_with_subject",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const target = String(check.expected ?? "").toLowerCase()
    return tickets(snapshot).some((t) => t.subject?.toLowerCase() === target)
  }
)

registerPredicate(
  "ticket_has_public_comment_from",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticketId = check.id
    const expectedAuthor = String(check.expected ?? "")
    return commentsList(snapshot).some(
      (c) =>
        c.ticketId === ticketId &&
        c.authorId === expectedAuthor &&
        c.public === true
    )
  }
)

registerPredicate(
  "ticket_has_internal_comment_from",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const ticketId = check.id
    const expectedAuthor = String(check.expected ?? "")
    return commentsList(snapshot).some(
      (c) =>
        c.ticketId === ticketId &&
        c.authorId === expectedAuthor &&
        c.public === false
    )
  }
)

registerPredicate(
  "macro_exists_with_title",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const target = String(check.expected ?? "").toLowerCase()
    const macros = (snapshot.macros as SnapshotMacro[]) ?? []
    return macros.some((m) => m.title?.toLowerCase() === target)
  }
)

registerPredicate(
  "macro_active",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const macros = (snapshot.macros as SnapshotMacro[]) ?? []
    const macro = macros.find((m) => m.id === check.id)
    return macro?.active === Boolean(check.expected)
  }
)

registerPredicate(
  "macro_has_title",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const macros = (snapshot.macros as SnapshotMacro[]) ?? []
    const macro = macros.find((m) => m.id === check.id)
    return macro?.title === check.expected
  }
)

registerPredicate(
  "group_exists_with_name",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const target = String(check.expected ?? "").toLowerCase()
    const groups = (snapshot.groups as SnapshotGroup[]) ?? []
    return groups.some((g) => g.name?.toLowerCase() === target)
  }
)

registerPredicate(
  "user_exists_with_email",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const target = String(check.expected ?? "").toLowerCase()
    const users = (snapshot.users as SnapshotUser[]) ?? []
    return users.some((u) => u.email?.toLowerCase() === target)
  }
)

registerPredicate(
  "ticket_count_with_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const status = String(check.expected ?? "")
    const count = tickets(snapshot).filter((t) => t.status === status).length
    return count === Number(check.id ?? 0)
  }
)

// ---------------------------------------------------------------------------
// Export for use in API routes
// ---------------------------------------------------------------------------

export { zendeskAdapter }
