// ---------------------------------------------------------------------------
// Plain — module-level mutable store, CRUD per entity.
// Mirrors the pattern used by sites/jira/app/lib/store.ts.
// ---------------------------------------------------------------------------

import {
  agents as initialAgents,
  customers as initialCustomers,
  labels as initialLabels,
  messages as initialMessages,
  tenants as initialTenants,
  threads as initialThreads,
  type Agent,
  type Customer,
  type Label,
  type Message,
  type Tenant,
  type Thread,
  type ThreadPriority,
  type ThreadStatus,
} from "./mock-data"

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// deepClone — shallow JSON snapshot (no Dates / Maps in the data)
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ---------------------------------------------------------------------------
// Deterministic timestamps when seed is provided
// ---------------------------------------------------------------------------

let _dateOverride: string | null = null
let _dateCounter = 0

function now(): string {
  if (_dateOverride) {
    const base = new Date(_dateOverride)
    base.setSeconds(base.getSeconds() + _dateCounter++)
    return base.toISOString()
  }
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_STATUS = new Set<ThreadStatus>(["open", "snoozed", "done"])
const VALID_PRIORITY = new Set<ThreadPriority>([
  "urgent",
  "high",
  "normal",
  "low",
])

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let _tenants: Tenant[] = deepClone(initialTenants)
let _customers: Customer[] = deepClone(initialCustomers)
let _agents: Agent[] = deepClone(initialAgents)
let _labels: Label[] = deepClone(initialLabels)
let _threads: Thread[] = deepClone(initialThreads)
let _messages: Message[] = deepClone(initialMessages)

// ---------------------------------------------------------------------------
// id counters — derived from existing items so newly created records never
// collide with seeds, regardless of seed order or partial mutations.
// ---------------------------------------------------------------------------

function deriveNextId(
  items: { id: string }[],
  prefix: string,
  floor: number
): number {
  let max = 0
  const re = new RegExp(`^${prefix}-(\\d+)$`)
  for (const item of items) {
    const m = re.exec(item.id)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return Math.max(max + 1, floor)
}

let _nextThreadId = deriveNextId(_threads, "thr", _threads.length + 1)
let _nextMessageId = deriveNextId(_messages, "msg", _messages.length + 1)
let _nextLabelId = deriveNextId(_labels, "lbl", _labels.length + 1)
let _nextCustomerId = deriveNextId(_customers, "cus", _customers.length + 1)

// ---------------------------------------------------------------------------
// Tenants — read-only
// ---------------------------------------------------------------------------

export function getTenants(): Tenant[] {
  return deepClone(_tenants)
}

export function getTenantById(id: string): Tenant | undefined {
  const t = _tenants.find((x) => x.id === id)
  return t ? deepClone(t) : undefined
}

// ---------------------------------------------------------------------------
// Agents — read-only
// ---------------------------------------------------------------------------

export function getAgents(): Agent[] {
  return deepClone(_agents)
}

export function getAgentById(id: string): Agent | undefined {
  const a = _agents.find((x) => x.id === id)
  return a ? deepClone(a) : undefined
}

export function getCurrentAgent(): Agent {
  const me = _agents.find((a) => a.isCurrentUser) ?? _agents[0]
  return deepClone(me)
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export function getLabels(): Label[] {
  return deepClone(_labels)
}

export function getLabelById(id: string): Label | undefined {
  const l = _labels.find((x) => x.id === id)
  return l ? deepClone(l) : undefined
}

export function createLabel(fields: {
  name?: string
  color?: string
  description?: string
}): Result<Label> {
  if (!fields.name?.trim()) {
    return { success: false, error: "Label name is required" }
  }
  if (
    _labels.some(
      (l) => l.name.toLowerCase() === fields.name!.trim().toLowerCase()
    )
  ) {
    return { success: false, error: `Label "${fields.name}" already exists` }
  }
  while (_labels.some((l) => l.id === `lbl-${_nextLabelId}`)) _nextLabelId++
  const label: Label = {
    id: `lbl-${_nextLabelId++}`,
    name: fields.name.trim(),
    color: fields.color ?? "slate",
    description: fields.description ?? "",
  }
  _labels.push(label)
  return { success: true, data: deepClone(label) }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export function getCustomers(): Customer[] {
  return deepClone(_customers)
}

export function getCustomerById(id: string): Customer | undefined {
  const c = _customers.find((x) => x.id === id)
  return c ? deepClone(c) : undefined
}

export function getCustomerByEmail(email: string): Customer | undefined {
  const norm = email.trim().toLowerCase()
  const c = _customers.find((x) => x.email.toLowerCase() === norm)
  return c ? deepClone(c) : undefined
}

export function updateCustomer(
  id: string,
  fields: Partial<Omit<Customer, "id" | "createdAt">>
): Result<Customer> {
  const cust = _customers.find((c) => c.id === id)
  if (!cust) return { success: false, error: "Customer not found" }

  if (fields.fullName !== undefined) {
    if (!fields.fullName.trim()) {
      return { success: false, error: "fullName cannot be empty" }
    }
    cust.fullName = fields.fullName.trim()
  }
  if (fields.email !== undefined) cust.email = fields.email
  if (fields.role !== undefined) cust.role = fields.role
  if (fields.tenantId !== undefined) {
    if (!_tenants.some((t) => t.id === fields.tenantId)) {
      return { success: false, error: `Tenant not found: ${fields.tenantId}` }
    }
    cust.tenantId = fields.tenantId
  }
  if (fields.plan !== undefined) cust.plan = fields.plan
  if (fields.lifecycleStage !== undefined)
    cust.lifecycleStage = fields.lifecycleStage
  if (fields.externalId !== undefined) cust.externalId = fields.externalId
  if (fields.customAttributes !== undefined) {
    cust.customAttributes = {
      ...cust.customAttributes,
      ...fields.customAttributes,
    }
  }
  return { success: true, data: deepClone(cust) }
}

export function mergeCustomers(
  primaryId: string,
  duplicateId: string
): Result<Customer> {
  if (primaryId === duplicateId) {
    return { success: false, error: "Cannot merge a customer with itself" }
  }
  const primary = _customers.find((c) => c.id === primaryId)
  const dup = _customers.find((c) => c.id === duplicateId)
  if (!primary) return { success: false, error: "Primary customer not found" }
  if (!dup) return { success: false, error: "Duplicate customer not found" }

  // Reassign all of dup's threads and messages to primary
  for (const t of _threads) {
    if (t.customerId === duplicateId) {
      t.customerId = primaryId
      t.updatedAt = now()
    }
  }
  for (const m of _messages) {
    if (m.role === "customer" && m.authorId === duplicateId) {
      m.authorId = primaryId
    }
  }

  // Merge custom attributes (primary wins on conflict)
  primary.customAttributes = {
    ...dup.customAttributes,
    ...primary.customAttributes,
  }

  // Remove duplicate
  _customers = _customers.filter((c) => c.id !== duplicateId)
  return { success: true, data: deepClone(primary) }
}

// ---------------------------------------------------------------------------
// Threads — read
// ---------------------------------------------------------------------------

export function getThreads(): Thread[] {
  return deepClone(_threads)
}

export function getThreadById(id: string): Thread | undefined {
  const t = _threads.find((x) => x.id === id)
  return t ? deepClone(t) : undefined
}

export function getThreadsByCustomer(customerId: string): Thread[] {
  return deepClone(_threads.filter((t) => t.customerId === customerId))
}

export function getThreadsByTenant(tenantId: string): Thread[] {
  return deepClone(_threads.filter((t) => t.tenantId === tenantId))
}

export function getThreadsByLabel(labelId: string): Thread[] {
  return deepClone(_threads.filter((t) => t.labelIds.includes(labelId)))
}

// ---------------------------------------------------------------------------
// Threads — mutations
// ---------------------------------------------------------------------------

export function createThread(fields: {
  title?: string
  customerId?: string
  body?: string
  priority?: ThreadPriority
  labelIds?: string[]
  assigneeId?: string | null
}): Result<Thread> {
  if (!fields.title?.trim()) {
    return { success: false, error: "Title is required" }
  }
  if (!fields.customerId) {
    return { success: false, error: "customerId is required" }
  }
  const customer = _customers.find((c) => c.id === fields.customerId)
  if (!customer) {
    return { success: false, error: `Customer not found: ${fields.customerId}` }
  }
  if (fields.priority && !VALID_PRIORITY.has(fields.priority)) {
    return { success: false, error: `Invalid priority: ${fields.priority}` }
  }
  if (fields.labelIds) {
    for (const lid of fields.labelIds) {
      if (!_labels.some((l) => l.id === lid)) {
        return { success: false, error: `Label not found: ${lid}` }
      }
    }
  }
  if (fields.assigneeId && !_agents.some((a) => a.id === fields.assigneeId)) {
    return { success: false, error: `Agent not found: ${fields.assigneeId}` }
  }

  while (_threads.some((t) => t.id === `thr-${_nextThreadId}`)) _nextThreadId++
  const id = `thr-${_nextThreadId++}`
  const ts = now()

  const body = fields.body?.trim() ?? ""
  const thread: Thread = {
    id,
    title: fields.title.trim(),
    customerId: fields.customerId,
    tenantId: customer.tenantId,
    status: "open",
    priority: fields.priority ?? "normal",
    labelIds: fields.labelIds ?? [],
    assigneeId: fields.assigneeId ?? null,
    snoozedUntil: null,
    doneAt: null,
    createdAt: ts,
    updatedAt: ts,
    preview: body ? body.slice(0, 120) : "",
  }
  _threads.push(thread)

  if (body) {
    while (_messages.some((m) => m.id === `msg-${_nextMessageId}`))
      _nextMessageId++
    _messages.push({
      id: `msg-${_nextMessageId++}`,
      threadId: id,
      role: "customer",
      authorId: customer.id,
      body,
      createdAt: ts,
    })
  }

  return { success: true, data: deepClone(thread) }
}

export function replyThread(
  threadId: string,
  fields: { body?: string; authorId?: string; role?: "customer" | "agent" }
): Result<Message> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (!fields.body?.trim()) {
    return { success: false, error: "Reply body is required" }
  }
  const role = fields.role ?? "agent"
  let authorId = fields.authorId
  if (!authorId) {
    authorId = role === "agent" ? getCurrentAgent().id : thread.customerId
  }
  if (role === "agent" && !_agents.some((a) => a.id === authorId)) {
    return { success: false, error: `Agent not found: ${authorId}` }
  }
  if (role === "customer" && !_customers.some((c) => c.id === authorId)) {
    return { success: false, error: `Customer not found: ${authorId}` }
  }

  while (_messages.some((m) => m.id === `msg-${_nextMessageId}`))
    _nextMessageId++
  const ts = now()
  const message: Message = {
    id: `msg-${_nextMessageId++}`,
    threadId,
    role,
    authorId,
    body: fields.body.trim(),
    createdAt: ts,
  }
  _messages.push(message)

  // Replying re-opens snoozed threads, and updates preview/timestamp
  if (thread.status === "snoozed") {
    thread.status = "open"
    thread.snoozedUntil = null
  }
  thread.preview = fields.body.trim().slice(0, 120)
  thread.updatedAt = ts

  return { success: true, data: deepClone(message) }
}

export function snoozeThread(threadId: string, until: string): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (thread.status === "done") {
    return { success: false, error: "Cannot snooze a done thread" }
  }
  const date = new Date(until)
  if (isNaN(date.getTime())) {
    return { success: false, error: `Invalid snooze date: ${until}` }
  }
  thread.status = "snoozed"
  thread.snoozedUntil = date.toISOString()
  thread.updatedAt = now()
  return { success: true, data: deepClone(thread) }
}

export function doneThread(threadId: string): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  const ts = now()
  thread.status = "done"
  thread.doneAt = ts
  thread.snoozedUntil = null
  thread.updatedAt = ts
  return { success: true, data: deepClone(thread) }
}

export function reopenThread(threadId: string): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (thread.status === "open") {
    return { success: false, error: "Thread is already open" }
  }
  thread.status = "open"
  thread.doneAt = null
  thread.snoozedUntil = null
  thread.updatedAt = now()
  return { success: true, data: deepClone(thread) }
}

export function assignThread(
  threadId: string,
  assigneeId: string | null
): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (assigneeId !== null && !_agents.some((a) => a.id === assigneeId)) {
    return { success: false, error: `Agent not found: ${assigneeId}` }
  }
  thread.assigneeId = assigneeId
  thread.updatedAt = now()
  return { success: true, data: deepClone(thread) }
}

export function addLabel(threadId: string, labelId: string): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (!_labels.some((l) => l.id === labelId)) {
    return { success: false, error: `Label not found: ${labelId}` }
  }
  if (!thread.labelIds.includes(labelId)) {
    thread.labelIds.push(labelId)
    thread.updatedAt = now()
  }
  return { success: true, data: deepClone(thread) }
}

export function removeLabel(threadId: string, labelId: string): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  const before = thread.labelIds.length
  thread.labelIds = thread.labelIds.filter((id) => id !== labelId)
  if (thread.labelIds.length !== before) {
    thread.updatedAt = now()
  }
  return { success: true, data: deepClone(thread) }
}

export function setPriority(
  threadId: string,
  priority: ThreadPriority
): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (!VALID_PRIORITY.has(priority)) {
    return { success: false, error: `Invalid priority: ${priority}` }
  }
  thread.priority = priority
  thread.updatedAt = now()
  return { success: true, data: deepClone(thread) }
}

export function setStatus(
  threadId: string,
  status: ThreadStatus
): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (!VALID_STATUS.has(status)) {
    return { success: false, error: `Invalid status: ${status}` }
  }
  thread.status = status
  if (status === "done") thread.doneAt = now()
  if (status === "open") {
    thread.snoozedUntil = null
    thread.doneAt = null
  }
  thread.updatedAt = now()
  return { success: true, data: deepClone(thread) }
}

export function updateThread(
  threadId: string,
  fields: {
    title?: string
    priority?: ThreadPriority
    assigneeId?: string | null
    labelIds?: string[]
  }
): Result<Thread> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (fields.title !== undefined) {
    if (!fields.title.trim()) {
      return { success: false, error: "Title cannot be empty" }
    }
    thread.title = fields.title.trim()
  }
  if (fields.priority !== undefined) {
    if (!VALID_PRIORITY.has(fields.priority)) {
      return { success: false, error: `Invalid priority: ${fields.priority}` }
    }
    thread.priority = fields.priority
  }
  if (fields.assigneeId !== undefined) {
    if (
      fields.assigneeId !== null &&
      !_agents.some((a) => a.id === fields.assigneeId)
    ) {
      return { success: false, error: `Agent not found: ${fields.assigneeId}` }
    }
    thread.assigneeId = fields.assigneeId
  }
  if (fields.labelIds !== undefined) {
    for (const lid of fields.labelIds) {
      if (!_labels.some((l) => l.id === lid)) {
        return { success: false, error: `Label not found: ${lid}` }
      }
    }
    thread.labelIds = fields.labelIds
  }
  thread.updatedAt = now()
  return { success: true, data: deepClone(thread) }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function getMessages(): Message[] {
  return deepClone(_messages)
}

export function getMessagesByThread(threadId: string): Message[] {
  return deepClone(
    _messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) =>
        new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()
          ? -1
          : 1
      )
  )
}

export function addInternalNote(
  threadId: string,
  fields: { body?: string; authorId?: string }
): Result<Message> {
  const thread = _threads.find((t) => t.id === threadId)
  if (!thread) return { success: false, error: "Thread not found" }
  if (!fields.body?.trim()) {
    return { success: false, error: "Note body is required" }
  }
  const authorId = fields.authorId ?? getCurrentAgent().id
  while (_messages.some((m) => m.id === `msg-${_nextMessageId}`))
    _nextMessageId++
  const ts = now()
  const message: Message = {
    id: `msg-${_nextMessageId++}`,
    threadId,
    role: "system",
    authorId: "system",
    body: `Internal note from ${getAgentById(authorId)?.fullName ?? "agent"}: ${fields.body.trim()}`,
    createdAt: ts,
  }
  _messages.push(message)
  thread.updatedAt = ts
  return { success: true, data: deepClone(message) }
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  _tenants = deepClone(initialTenants)
  _customers = deepClone(initialCustomers)
  _agents = deepClone(initialAgents)
  _labels = deepClone(initialLabels)
  _threads = deepClone(initialThreads)
  _messages = deepClone(initialMessages)

  _nextThreadId = deriveNextId(_threads, "thr", _threads.length + 1)
  _nextMessageId = deriveNextId(_messages, "msg", _messages.length + 1)
  _nextLabelId = deriveNextId(_labels, "lbl", _labels.length + 1)
  _nextCustomerId = deriveNextId(_customers, "cus", _customers.length + 1)

  if (seed !== undefined) {
    const base = new Date("2026-04-23T12:00:00.000Z")
    base.setMinutes(base.getMinutes() + (seed % 1440))
    _dateOverride = base.toISOString()
  } else {
    _dateOverride = null
  }
  _dateCounter = 0
}
