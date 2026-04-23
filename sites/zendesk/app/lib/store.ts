// ---------------------------------------------------------------------------
// Zendesk in-memory store — module-level singleton mutated by API handlers
// and reset by the engine between episodes.
// ---------------------------------------------------------------------------

import {
  users as initialUsers,
  groups as initialGroups,
  brands as initialBrands,
  tickets as initialTickets,
  comments as initialComments,
  macros as initialMacros,
  views as initialViews,
  type User,
  type Group,
  type Brand,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type TicketChannel,
  type Comment,
  type Macro,
  type View,
} from "./mock-data"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ---------------------------------------------------------------------------
// Deterministic timestamps when seed is provided
// ---------------------------------------------------------------------------

let _dateOverride: string | null = null
let _dateCounter = 0

export function setDateOverride(date: string | null): void {
  _dateOverride = date
  _dateCounter = 0
}

function now(): string {
  if (_dateOverride) {
    const base = new Date(_dateOverride)
    base.setSeconds(base.getSeconds() + _dateCounter++)
    return base.toISOString()
  }
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// Enum validators
// ---------------------------------------------------------------------------

const VALID_STATUS: ReadonlySet<TicketStatus> = new Set([
  "new",
  "open",
  "pending",
  "on-hold",
  "solved",
  "closed",
])
const VALID_PRIORITY: ReadonlySet<TicketPriority> = new Set([
  "urgent",
  "high",
  "normal",
  "low",
])
const VALID_CHANNEL: ReadonlySet<TicketChannel> = new Set([
  "email",
  "web",
  "chat",
  "api",
  "phone",
])

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let _users: User[] = deepClone(initialUsers)
let _groups: Group[] = deepClone(initialGroups)
let _brands: Brand[] = deepClone(initialBrands)
let _tickets: Ticket[] = deepClone(initialTickets)
let _comments: Comment[] = deepClone(initialComments)
let _macros: Macro[] = deepClone(initialMacros)
let _views: View[] = deepClone(initialViews)

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

function deriveNextTicketNumber(tickets: Ticket[]): number {
  let max = 0
  for (const t of tickets) if (t.number > max) max = t.number
  return max + 1
}

let _nextTicketId = deriveNextId(_tickets, "tic", 31)
let _nextTicketNumber = deriveNextTicketNumber(_tickets)
let _nextCommentId = deriveNextId(_comments, "cmt", 6)
let _nextMacroId = deriveNextId(_macros, "mac", 6)
let _nextGroupId = deriveNextId(_groups, "grp", 4)
let _nextUserId = deriveNextId(_users, "usr", 21)

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export function getTickets(): Ticket[] {
  return deepClone(_tickets)
}

export function getTicketById(id: string): Ticket | undefined {
  const ticket = _tickets.find((t) => t.id === id)
  return ticket ? deepClone(ticket) : undefined
}

export function getTicketByNumber(num: number): Ticket | undefined {
  const ticket = _tickets.find((t) => t.number === num)
  return ticket ? deepClone(ticket) : undefined
}

export function createTicket(fields: {
  subject?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  channel?: TicketChannel
  requesterId?: string
  assigneeId?: string | null
  groupId?: string | null
  brandId?: string
  tags?: string[]
}): Result<Ticket> {
  if (!fields.subject || String(fields.subject).trim() === "") {
    return { success: false, error: "Subject is required" }
  }
  if (fields.status !== undefined && !VALID_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` }
  }
  if (fields.priority !== undefined && !VALID_PRIORITY.has(fields.priority)) {
    return { success: false, error: `Invalid priority: ${fields.priority}` }
  }
  if (fields.channel !== undefined && !VALID_CHANNEL.has(fields.channel)) {
    return { success: false, error: `Invalid channel: ${fields.channel}` }
  }
  const requesterId = fields.requesterId ?? "usr-16"
  if (!_users.some((u) => u.id === requesterId)) {
    return { success: false, error: `Requester not found: ${requesterId}` }
  }
  if (
    fields.assigneeId !== undefined &&
    fields.assigneeId !== null &&
    !_users.some((u) => u.id === fields.assigneeId)
  ) {
    return { success: false, error: `Assignee not found: ${fields.assigneeId}` }
  }
  if (
    fields.groupId !== undefined &&
    fields.groupId !== null &&
    !_groups.some((g) => g.id === fields.groupId)
  ) {
    return { success: false, error: `Group not found: ${fields.groupId}` }
  }

  while (_tickets.some((t) => t.id === `tic-${_nextTicketId}`)) _nextTicketId++
  while (_tickets.some((t) => t.number === _nextTicketNumber))
    _nextTicketNumber++

  const ts = now()
  const ticket: Ticket = {
    id: `tic-${_nextTicketId++}`,
    number: _nextTicketNumber++,
    subject: fields.subject.trim(),
    description: fields.description ?? "",
    status: fields.status ?? "new",
    priority: fields.priority ?? "normal",
    channel: fields.channel ?? "web",
    requesterId,
    assigneeId: fields.assigneeId ?? null,
    groupId: fields.groupId ?? null,
    brandId: fields.brandId ?? "brand-1",
    tags: fields.tags ?? [],
    createdAt: ts,
    updatedAt: ts,
  }

  _tickets.push(ticket)
  return { success: true, data: deepClone(ticket) }
}

export function updateTicket(
  id: string,
  fields: {
    subject?: string
    description?: string
    status?: TicketStatus
    priority?: TicketPriority
    channel?: TicketChannel
    assigneeId?: string | null
    groupId?: string | null
    tags?: string[]
  }
): Result<Ticket> {
  const ticket = _tickets.find((t) => t.id === id)
  if (!ticket) return { success: false, error: "Ticket not found" }

  if (fields.subject !== undefined) {
    if (String(fields.subject).trim() === "") {
      return { success: false, error: "Subject cannot be empty" }
    }
    ticket.subject = fields.subject.trim()
  }
  if (fields.description !== undefined) ticket.description = fields.description
  if (fields.status !== undefined) {
    if (!VALID_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` }
    }
    ticket.status = fields.status
  }
  if (fields.priority !== undefined) {
    if (!VALID_PRIORITY.has(fields.priority)) {
      return { success: false, error: `Invalid priority: ${fields.priority}` }
    }
    ticket.priority = fields.priority
  }
  if (fields.channel !== undefined) {
    if (!VALID_CHANNEL.has(fields.channel)) {
      return { success: false, error: `Invalid channel: ${fields.channel}` }
    }
    ticket.channel = fields.channel
  }
  if (fields.assigneeId !== undefined) {
    if (
      fields.assigneeId !== null &&
      !_users.some((u) => u.id === fields.assigneeId)
    ) {
      return {
        success: false,
        error: `Assignee not found: ${fields.assigneeId}`,
      }
    }
    ticket.assigneeId = fields.assigneeId
  }
  if (fields.groupId !== undefined) {
    if (
      fields.groupId !== null &&
      !_groups.some((g) => g.id === fields.groupId)
    ) {
      return { success: false, error: `Group not found: ${fields.groupId}` }
    }
    ticket.groupId = fields.groupId
  }
  if (fields.tags !== undefined) ticket.tags = [...fields.tags]

  ticket.updatedAt = now()
  return { success: true, data: deepClone(ticket) }
}

export function deleteTicket(id: string): Result {
  const idx = _tickets.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false, error: "Ticket not found" }
  _tickets.splice(idx, 1)
  // Orphan comments also removed
  _comments = _comments.filter((c) => c.ticketId !== id)
  return { success: true, data: undefined }
}

export function transitionTicket(
  id: string,
  newStatus: TicketStatus
): Result<Ticket> {
  if (!VALID_STATUS.has(newStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}` }
  }
  const ticket = _tickets.find((t) => t.id === id)
  if (!ticket) return { success: false, error: "Ticket not found" }

  // Closed tickets cannot be reopened (Zendesk-like rule)
  if (ticket.status === "closed" && newStatus !== "closed") {
    return {
      success: false,
      error: "Closed tickets cannot be reopened. Create a follow-up instead.",
    }
  }
  ticket.status = newStatus
  ticket.updatedAt = now()
  return { success: true, data: deepClone(ticket) }
}

export function assignTicket(
  id: string,
  assigneeId: string | null,
  groupId?: string | null
): Result<Ticket> {
  const ticket = _tickets.find((t) => t.id === id)
  if (!ticket) return { success: false, error: "Ticket not found" }
  if (assigneeId !== null && !_users.some((u) => u.id === assigneeId)) {
    return { success: false, error: `Assignee not found: ${assigneeId}` }
  }
  if (
    groupId !== undefined &&
    groupId !== null &&
    !_groups.some((g) => g.id === groupId)
  ) {
    return { success: false, error: `Group not found: ${groupId}` }
  }
  ticket.assigneeId = assigneeId
  if (groupId !== undefined) ticket.groupId = groupId
  ticket.updatedAt = now()
  return { success: true, data: deepClone(ticket) }
}

export function mergeTickets(
  sourceId: string,
  targetId: string
): Result<Ticket> {
  if (sourceId === targetId) {
    return { success: false, error: "Cannot merge a ticket into itself" }
  }
  const source = _tickets.find((t) => t.id === sourceId)
  const target = _tickets.find((t) => t.id === targetId)
  if (!source) return { success: false, error: "Source ticket not found" }
  if (!target) return { success: false, error: "Target ticket not found" }

  // Re-parent comments onto the target
  for (const c of _comments) {
    if (c.ticketId === sourceId) c.ticketId = targetId
  }
  // Merge tags (unique)
  const merged = new Set([...target.tags, ...source.tags])
  target.tags = [...merged]
  target.updatedAt = now()
  // Close the source
  source.status = "closed"
  source.updatedAt = now()
  return { success: true, data: deepClone(target) }
}

export function addTag(id: string, tag: string): Result<Ticket> {
  const ticket = _tickets.find((t) => t.id === id)
  if (!ticket) return { success: false, error: "Ticket not found" }
  const clean = String(tag ?? "").trim()
  if (!clean) return { success: false, error: "Tag cannot be empty" }
  if (!ticket.tags.includes(clean)) ticket.tags.push(clean)
  ticket.updatedAt = now()
  return { success: true, data: deepClone(ticket) }
}

export function removeTag(id: string, tag: string): Result<Ticket> {
  const ticket = _tickets.find((t) => t.id === id)
  if (!ticket) return { success: false, error: "Ticket not found" }
  ticket.tags = ticket.tags.filter((t) => t !== tag)
  ticket.updatedAt = now()
  return { success: true, data: deepClone(ticket) }
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export function getCommentsByTicket(ticketId: string): Comment[] {
  return deepClone(_comments.filter((c) => c.ticketId === ticketId))
}

export function addComment(fields: {
  ticketId: string
  authorId: string
  body: string
  public?: boolean
}): Result<Comment> {
  if (!fields.ticketId || !_tickets.some((t) => t.id === fields.ticketId)) {
    return { success: false, error: "Ticket not found" }
  }
  if (!fields.body || fields.body.trim() === "") {
    return { success: false, error: "Comment body is required" }
  }
  if (!fields.authorId || !_users.some((u) => u.id === fields.authorId)) {
    return { success: false, error: `Author not found: ${fields.authorId}` }
  }
  while (_comments.some((c) => c.id === `cmt-${_nextCommentId}`))
    _nextCommentId++
  const comment: Comment = {
    id: `cmt-${_nextCommentId++}`,
    ticketId: fields.ticketId,
    authorId: fields.authorId,
    body: fields.body.trim(),
    public: fields.public ?? true,
    createdAt: now(),
  }
  _comments.push(comment)
  // Touch ticket updatedAt
  const ticket = _tickets.find((t) => t.id === fields.ticketId)
  if (ticket) ticket.updatedAt = comment.createdAt
  return { success: true, data: deepClone(comment) }
}

// ---------------------------------------------------------------------------
// Macros
// ---------------------------------------------------------------------------

export function getMacros(): Macro[] {
  return deepClone(_macros)
}

export function createMacro(fields: {
  title?: string
  body?: string
  active?: boolean
}): Result<Macro> {
  if (!fields.title || fields.title.trim() === "") {
    return { success: false, error: "Title is required" }
  }
  if (!fields.body || fields.body.trim() === "") {
    return { success: false, error: "Body is required" }
  }
  while (_macros.some((m) => m.id === `mac-${_nextMacroId}`)) _nextMacroId++
  const macro: Macro = {
    id: `mac-${_nextMacroId++}`,
    title: fields.title.trim(),
    body: fields.body.trim(),
    active: fields.active ?? true,
    createdAt: now(),
  }
  _macros.push(macro)
  return { success: true, data: deepClone(macro) }
}

export function updateMacro(
  id: string,
  fields: { title?: string; body?: string; active?: boolean }
): Result<Macro> {
  const macro = _macros.find((m) => m.id === id)
  if (!macro) return { success: false, error: "Macro not found" }
  if (fields.title !== undefined) {
    if (fields.title.trim() === "")
      return { success: false, error: "Title cannot be empty" }
    macro.title = fields.title.trim()
  }
  if (fields.body !== undefined) macro.body = fields.body
  if (fields.active !== undefined) macro.active = fields.active
  return { success: true, data: deepClone(macro) }
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export function getGroups(): Group[] {
  return deepClone(_groups)
}

export function createGroup(fields: {
  name?: string
  description?: string
}): Result<Group> {
  if (!fields.name || fields.name.trim() === "") {
    return { success: false, error: "Name is required" }
  }
  while (_groups.some((g) => g.id === `grp-${_nextGroupId}`)) _nextGroupId++
  const group: Group = {
    id: `grp-${_nextGroupId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    default: false,
    createdAt: now(),
  }
  _groups.push(group)
  return { success: true, data: deepClone(group) }
}

// ---------------------------------------------------------------------------
// Users / brands / views — read-only
// ---------------------------------------------------------------------------

export function getUsers(): User[] {
  return deepClone(_users)
}

export function getUserById(id: string): User | undefined {
  const u = _users.find((u) => u.id === id)
  return u ? deepClone(u) : undefined
}

export function createUser(fields: {
  name?: string
  email?: string
  role?: User["role"]
  organization?: string
}): Result<User> {
  if (!fields.name || fields.name.trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.email || fields.email.trim() === "") {
    return { success: false, error: "Email is required" }
  }
  if (
    _users.some((u) => u.email.toLowerCase() === fields.email!.toLowerCase())
  ) {
    return { success: false, error: `Email already exists: ${fields.email}` }
  }
  while (_users.some((u) => u.id === `usr-${_nextUserId}`)) _nextUserId++
  const user: User = {
    id: `usr-${_nextUserId++}`,
    name: fields.name.trim(),
    email: fields.email.trim(),
    role: fields.role ?? "end-user",
    organization: fields.organization,
    active: true,
    createdAt: now(),
  }
  _users.push(user)
  return { success: true, data: deepClone(user) }
}

export function getBrands(): Brand[] {
  return deepClone(_brands)
}

export function getViews(): View[] {
  return deepClone(_views)
}

// ---------------------------------------------------------------------------
// Derived helpers for the UI (home page initial render)
// ---------------------------------------------------------------------------

export interface HomeInitialData {
  tickets: Ticket[]
  currentAgent: User
  counts: {
    yourOpenTickets: number
    groupOpenTickets: number
    solvedThisWeek: number
  }
}

// Returns the 1 ticket shown on the home screen (SAMPLE ticket — matches the
// reference screenshot) plus overall counts. "Your work" = assigned to usr-1.
export function getHomeInitialData(): HomeInitialData {
  const agent = _users.find((u) => u.id === "usr-1")!
  const yourTickets = _tickets.filter(
    (t) =>
      t.assigneeId === agent.id &&
      t.status !== "solved" &&
      t.status !== "closed"
  )
  // Filter further to just the sample ticket for the home list — the screen
  // shows "1 ticket" so we highlight the SAMPLE welcome ticket.
  const sampleTickets = yourTickets.filter((t) => t.tags.includes("sample"))
  // Match the reference screenshot — "Open tickets / Your groups" counts
  // tickets assigned to the current agent that are currently in the "open"
  // status (a tighter slice than yourOpenTickets, which includes pending/on-hold).
  const groupOpenTickets = _tickets.filter(
    (t) => t.assigneeId === agent.id && t.status === "open"
  ).length
  // "This week" = since the most recent Monday (Zendesk's convention).
  const startOfWeek = new Date()
  startOfWeek.setHours(0, 0, 0, 0)
  const dow = startOfWeek.getDay() // 0 = Sun, 1 = Mon, ...
  const offsetToMonday = dow === 0 ? 6 : dow - 1
  startOfWeek.setDate(startOfWeek.getDate() - offsetToMonday)
  const startOfWeekMs = startOfWeek.getTime()
  const solvedThisWeek = _tickets.filter(
    (t) =>
      t.status === "solved" && new Date(t.updatedAt).getTime() >= startOfWeekMs
  ).length
  return {
    tickets: deepClone(
      sampleTickets.length > 0 ? sampleTickets : yourTickets.slice(0, 1)
    ),
    currentAgent: deepClone(agent),
    counts: {
      yourOpenTickets: yourTickets.length,
      groupOpenTickets,
      solvedThisWeek,
    },
  }
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  _users = deepClone(initialUsers)
  _groups = deepClone(initialGroups)
  _brands = deepClone(initialBrands)
  _tickets = deepClone(initialTickets)
  _comments = deepClone(initialComments)
  _macros = deepClone(initialMacros)
  _views = deepClone(initialViews)

  _nextTicketId = deriveNextId(_tickets, "tic", 31)
  _nextTicketNumber = deriveNextTicketNumber(_tickets)
  _nextCommentId = deriveNextId(_comments, "cmt", 6)
  _nextMacroId = deriveNextId(_macros, "mac", 6)
  _nextGroupId = deriveNextId(_groups, "grp", 4)
  _nextUserId = deriveNextId(_users, "usr", 21)

  if (seed !== undefined) {
    const base = new Date("2026-06-01T12:00:00.000Z")
    base.setMinutes(base.getMinutes() + (seed % 1440))
    _dateOverride = base.toISOString()
  } else {
    _dateOverride = null
  }
  _dateCounter = 0
}
