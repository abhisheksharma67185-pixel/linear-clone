/**
 * Plain site adapter — wires @thetabench/core engine to Plain's store.
 *
 * Imported once at app startup (via init-sim.ts) to register the adapter,
 * task catalog, and Plain-specific evaluation predicates with the engine.
 */

import {
  registerSiteAdapter,
  registerTasks,
  registerPredicate,
  getNestedField,
  type SiteAdapter,
  type GenericSnapshot,
  type EvalCheck,
} from "@thetabench/core"

import * as store from "./store"

import { navigationTasks } from "./tasks/navigation"
import { threadTasks } from "./tasks/threads"
import { labelTasks } from "./tasks/labels"
import { customerTasks } from "./tasks/customers"
import { tenantTasks } from "./tasks/tenants"
import { searchTasks } from "./tasks/search"
import { retrievalTasks } from "./tasks/retrieval"
import { impossibleTasks } from "./tasks/impossible"

// ---------------------------------------------------------------------------
// 1. Register site adapter
// ---------------------------------------------------------------------------

const plainAdapter: SiteAdapter = {
  getState: () => ({
    threads: store.getThreads(),
    messages: store.getMessages(),
    customers: store.getCustomers(),
    tenants: store.getTenants(),
    labels: store.getLabels(),
    agents: store.getAgents(),
  }),

  reset: (seed?: number) => store.reset(seed),

  executeMutation: (name: string, args: unknown[]) => {
    const MUTATION_ALLOWLIST = new Set([
      "createThread",
      "replyThread",
      "snoozeThread",
      "doneThread",
      "reopenThread",
      "assignThread",
      "addLabel",
      "removeLabel",
      "setPriority",
      "setStatus",
      "updateThread",
      "updateCustomer",
      "mergeCustomers",
      "addInternalNote",
      "createLabel",
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
    "threads",
    "messages",
    "customers",
    "tenants",
    "labels",
    "agents",
  ],
  singletons: [],
}

registerSiteAdapter(plainAdapter)

// ---------------------------------------------------------------------------
// 2. Register all tasks
// ---------------------------------------------------------------------------

registerTasks([
  ...navigationTasks,
  ...threadTasks,
  ...labelTasks,
  ...customerTasks,
  ...tenantTasks,
  ...searchTasks,
  ...retrievalTasks,
  ...impossibleTasks,
])

// ---------------------------------------------------------------------------
// 3. Register Plain-specific predicates
// ---------------------------------------------------------------------------

interface ThreadShape {
  id: string
  title: string
  status: string
  priority: string
  labelIds: string[]
  assigneeId: string | null
  customerId: string
}

interface MessageShape {
  id: string
  threadId: string
  body: string
  role: string
}

interface CustomerShape {
  id: string
  fullName: string
  customAttributes: Record<string, unknown>
}

registerPredicate(
  "thread_has_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    const t = threads?.find((x) => x.id === check.id)
    return t?.status === check.expected
  }
)

registerPredicate(
  "thread_has_priority",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    const t = threads?.find((x) => x.id === check.id)
    return t?.priority === check.expected
  }
)

registerPredicate(
  "thread_has_assignee",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    const t = threads?.find((x) => x.id === check.id)
    return t?.assigneeId === check.expected
  }
)

registerPredicate(
  "thread_has_label",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    const t = threads?.find((x) => x.id === check.id)
    if (!t) return false
    return t.labelIds.includes(String(check.expected))
  }
)

registerPredicate(
  "thread_lacks_label",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    const t = threads?.find((x) => x.id === check.id)
    if (!t) return false
    return !t.labelIds.includes(String(check.expected))
  }
)

registerPredicate(
  "thread_label_set_equals",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    const t = threads?.find((x) => x.id === check.id)
    if (!t) return false
    const expected = (check.expected as string[]) ?? []
    if (t.labelIds.length !== expected.length) return false
    const got = new Set(t.labelIds)
    return expected.every((l) => got.has(l))
  }
)

registerPredicate(
  "thread_has_message",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const messages = snapshot.messages as MessageShape[]
    const expected = String(check.expected ?? "").trim()
    if (!expected) return false
    return (
      messages?.some(
        (m) => m.threadId === check.id && m.body.includes(expected)
      ) ?? false
    )
  }
)

registerPredicate(
  "thread_has_fields",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as Record<string, unknown> | undefined
    if (!expected) return false
    const threads = snapshot.threads as ThreadShape[]
    let thread = check.id ? threads?.find((t) => t.id === check.id) : undefined
    if (!thread && expected.title) {
      thread = threads?.find(
        (t) => t.title.toLowerCase() === String(expected.title).toLowerCase()
      )
    }
    if (!thread) return false
    return Object.entries(expected).every(
      ([key, val]) =>
        JSON.stringify(getNestedField(thread, key)) === JSON.stringify(val)
    )
  }
)

registerPredicate(
  "customer_has_fields",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as Record<string, unknown> | undefined
    if (!expected) return false
    const customers = snapshot.customers as CustomerShape[]
    const c = customers?.find((x) => x.id === check.id)
    if (!c) return false
    return Object.entries(expected).every(
      ([key, val]) =>
        JSON.stringify(getNestedField(c, key)) === JSON.stringify(val)
    )
  }
)

registerPredicate(
  "customer_has_attribute",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const customers = snapshot.customers as CustomerShape[]
    const c = customers?.find((x) => x.id === check.id)
    if (!c || !check.field) return false
    return c.customAttributes?.[check.field] === check.expected
  }
)

registerPredicate(
  "customer_does_not_exist",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const customers = snapshot.customers as CustomerShape[]
    return !customers?.some((c) => c.id === check.id)
  }
)

registerPredicate(
  "thread_count_equals",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const threads = snapshot.threads as ThreadShape[]
    return (threads?.length ?? 0) === Number(check.expected)
  }
)

// ---------------------------------------------------------------------------
// Export for use in API routes
// ---------------------------------------------------------------------------

export { plainAdapter }
