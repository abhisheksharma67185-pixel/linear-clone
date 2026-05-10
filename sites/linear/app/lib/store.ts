// ---------------------------------------------------------------------------
// Linear store — public API for issue / project / cycle / label / team / view
// CRUD against the in-memory simulator.
//
// State now lives on the per-session `LinearStoreState` (see ./state.ts and
// ./session.ts). Every function below reads + mutates through `_state()`,
// which resolves to the rollout-scoped store when called inside a request
// wrapped with `withSession`, and to the shared "default" session otherwise
// (RSC pages, vitest, etc).
//
// The free-function shape of the public API is preserved so existing call
// sites in components, API routes, and tests keep working unchanged.
// ---------------------------------------------------------------------------

import {
  type Member,
  type Team,
  type Project,
  type Cycle,
  type Issue,
  type Label,
  type View,
} from "./mock-data"
import { _state } from "./session"
import { resetState } from "./state"

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
// Deterministic timestamps — use dateOverride when set (seeded episodes)
// ---------------------------------------------------------------------------

export function setDateOverride(date: string | null): void {
  const s = _state()
  s.dateOverride = date
  s.dateCounter = 0
}

function now(): string {
  const s = _state()
  if (s.dateOverride) {
    const base = new Date(s.dateOverride)
    base.setSeconds(base.getSeconds() + s.dateCounter++)
    return base.toISOString()
  }
  return new Date().toISOString()
}

function today(): string {
  return now().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Enum validators
// ---------------------------------------------------------------------------

const VALID_ISSUE_STATUS = new Set<string>([
  "backlog",
  "todo",
  "in_progress",
  "done",
  "cancelled",
])
const VALID_ISSUE_PRIORITY = new Set<string>([
  "urgent",
  "high",
  "medium",
  "low",
  "none",
])
const VALID_PROJECT_STATUS = new Set<string>([
  "planned",
  "in_progress",
  "completed",
  "cancelled",
])
// Valid status transitions for issues
const VALID_TRANSITIONS: Record<string, string[]> = {
  backlog: ["todo", "cancelled"],
  todo: ["in_progress", "cancelled"],
  in_progress: ["done", "todo"],
  done: ["backlog"],
  cancelled: ["backlog"],
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export function getIssues(): Issue[] {
  return deepClone(_state().issues).map(withDerivedSubscribers)
}

/**
 * Deterministic subscriber set per issue. Real Linear stores subscribers
 * as their own table, but for the mock we synthesise a stable list from
 * the issue ID hash so the "Subscribed" filter has data to operate on
 * without exploding fixture size. The current user (`usr-1`) is included
 * for issues where their hash bit is set, plus the assignee and creator
 * are always implicit subscribers.
 */
function withDerivedSubscribers(issue: Issue): Issue {
  if (Array.isArray(issue.subscriberIds)) return issue
  const subs = new Set<string>()
  if (issue.creatorId) subs.add(issue.creatorId)
  if (issue.assigneeId) subs.add(issue.assigneeId)
  let h = 0
  for (let i = 0; i < issue.id.length; i++) {
    h = (h * 31 + issue.id.charCodeAt(i)) | 0
  }
  if (Math.abs(h) % 3 === 0) subs.add("usr-1")
  const extras = ["usr-2", "usr-3", "usr-4", "usr-5", "usr-6"]
  subs.add(extras[Math.abs(h) % extras.length])
  return { ...issue, subscriberIds: Array.from(subs) }
}

export function getIssueById(id: string): Issue | undefined {
  const issue = _state().issues.find((i) => i.id === id)
  return issue ? deepClone(issue) : undefined
}

export function getIssueByIdentifier(identifier: string): Issue | undefined {
  const issue = _state().issues.find((i) => i.identifier === identifier)
  return issue ? deepClone(issue) : undefined
}

export function createIssue(fields: {
  title?: string
  description?: string
  status?: Issue["status"]
  priority?: Issue["priority"]
  assigneeId?: string | null
  creatorId?: string
  teamId?: string
  projectId?: string | null
  cycleId?: string | null
  labelIds?: string[]
  estimate?: number | null
  dueDate?: string | null
}): Result<Issue> {
  const s = _state()

  if (!fields.title || String(fields.title).trim() === "") {
    return { success: false, error: "Title is required" }
  }
  if (fields.status !== undefined && !VALID_ISSUE_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` }
  }
  if (
    fields.priority !== undefined &&
    !VALID_ISSUE_PRIORITY.has(fields.priority)
  ) {
    return { success: false, error: `Invalid priority: ${fields.priority}` }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = s.teams.find((t) => t.id === teamId)
  if (!team) {
    return { success: false, error: `Team not found: ${teamId}` }
  }

  if (fields.assigneeId !== undefined && fields.assigneeId !== null) {
    const assignee = s.members.find((m) => m.id === fields.assigneeId)
    if (!assignee) {
      return { success: false, error: `Member not found: ${fields.assigneeId}` }
    }
  }

  if (fields.projectId !== undefined && fields.projectId !== null) {
    const project = s.projects.find((p) => p.id === fields.projectId)
    if (!project) {
      return { success: false, error: `Project not found: ${fields.projectId}` }
    }
  }

  if (fields.cycleId !== undefined && fields.cycleId !== null) {
    const cycle = s.cycles.find((c) => c.id === fields.cycleId)
    if (!cycle) {
      return { success: false, error: `Cycle not found: ${fields.cycleId}` }
    }
  }

  if (fields.labelIds !== undefined) {
    for (const labelId of fields.labelIds) {
      const label = s.labels.find((l) => l.id === labelId)
      if (!label) {
        return { success: false, error: `Label not found: ${labelId}` }
      }
    }
  }

  const teamKey = team.key
  if (!s.nextIssueCounters[teamKey]) {
    s.nextIssueCounters[teamKey] = 1
  }
  const identifier = `${teamKey}-${s.nextIssueCounters[teamKey]++}`
  const timestamp = now()

  const creatorId = fields.creatorId ?? "usr-1"
  const initialSubscribers = new Set<string>([creatorId])
  if (fields.assigneeId) initialSubscribers.add(fields.assigneeId)

  const issue: Issue = {
    id: `iss-${s.nextIssueId++}`,
    identifier,
    title: fields.title.trim(),
    description: fields.description ?? "",
    status: fields.status ?? "backlog",
    priority: fields.priority ?? "none",
    assigneeId: fields.assigneeId ?? null,
    creatorId,
    subscriberIds: Array.from(initialSubscribers),
    teamId,
    projectId: fields.projectId ?? null,
    cycleId: fields.cycleId ?? null,
    labelIds: fields.labelIds ?? [],
    estimate: fields.estimate ?? null,
    dueDate: fields.dueDate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  s.issues.push(issue)
  return { success: true, data: deepClone(issue) }
}

export function updateIssue(
  id: string,
  fields: {
    title?: string
    description?: string
    status?: Issue["status"]
    priority?: Issue["priority"]
    assigneeId?: string | null
    creatorId?: string
    teamId?: string
    projectId?: string | null
    cycleId?: string | null
    labelIds?: string[]
    estimate?: number | null
    dueDate?: string | null
    subscriberIds?: string[]
  }
): Result<Issue> {
  const s = _state()
  const issue = s.issues.find((i) => i.id === id)
  if (!issue) return { success: false, error: "Issue not found" }

  if (fields.title !== undefined) {
    if (String(fields.title).trim() === "") {
      return { success: false, error: "Title cannot be empty" }
    }
    issue.title = fields.title.trim()
  }
  if (fields.description !== undefined) issue.description = fields.description
  if (fields.status !== undefined) {
    if (!VALID_ISSUE_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` }
    }
    issue.status = fields.status
  }
  if (fields.priority !== undefined) {
    if (!VALID_ISSUE_PRIORITY.has(fields.priority)) {
      return { success: false, error: `Invalid priority: ${fields.priority}` }
    }
    issue.priority = fields.priority
  }
  if (fields.assigneeId !== undefined) {
    if (fields.assigneeId !== null) {
      const assignee = s.members.find((m) => m.id === fields.assigneeId)
      if (!assignee) {
        return {
          success: false,
          error: `Member not found: ${fields.assigneeId}`,
        }
      }
    }
    issue.assigneeId = fields.assigneeId
  }
  if (fields.creatorId !== undefined) issue.creatorId = fields.creatorId
  if (fields.teamId !== undefined) {
    const team = s.teams.find((t) => t.id === fields.teamId)
    if (!team) {
      return { success: false, error: `Team not found: ${fields.teamId}` }
    }
    issue.teamId = fields.teamId
  }
  if (fields.projectId !== undefined) {
    if (fields.projectId !== null) {
      const project = s.projects.find((p) => p.id === fields.projectId)
      if (!project) {
        return {
          success: false,
          error: `Project not found: ${fields.projectId}`,
        }
      }
    }
    issue.projectId = fields.projectId
  }
  if (fields.cycleId !== undefined) {
    if (fields.cycleId !== null) {
      const cycle = s.cycles.find((c) => c.id === fields.cycleId)
      if (!cycle) {
        return { success: false, error: `Cycle not found: ${fields.cycleId}` }
      }
    }
    issue.cycleId = fields.cycleId
  }
  if (fields.labelIds !== undefined) {
    for (const labelId of fields.labelIds) {
      const label = s.labels.find((l) => l.id === labelId)
      if (!label) {
        return { success: false, error: `Label not found: ${labelId}` }
      }
    }
    issue.labelIds = fields.labelIds
  }
  if (fields.estimate !== undefined) issue.estimate = fields.estimate
  if (fields.dueDate !== undefined) issue.dueDate = fields.dueDate
  if (fields.subscriberIds !== undefined) {
    for (const subId of fields.subscriberIds) {
      const m = s.members.find((mem) => mem.id === subId)
      if (!m) {
        return { success: false, error: `Member not found: ${subId}` }
      }
    }
    issue.subscriberIds = fields.subscriberIds
  }

  issue.updatedAt = now()
  return { success: true, data: deepClone(issue) }
}

export function deleteIssue(id: string): Result {
  const s = _state()
  const idx = s.issues.findIndex((i) => i.id === id)
  if (idx === -1) return { success: false, error: "Issue not found" }
  s.issues.splice(idx, 1)
  return { success: true, data: undefined }
}

export function transitionIssue(id: string, newStatus: string): Result<Issue> {
  const s = _state()
  const issue = s.issues.find((i) => i.id === id)
  if (!issue) return { success: false, error: "Issue not found" }

  if (!VALID_ISSUE_STATUS.has(newStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}` }
  }

  const allowed = VALID_TRANSITIONS[issue.status]
  if (!allowed || !allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${issue.status} -> ${newStatus}. Allowed: ${allowed?.join(", ") ?? "none"}`,
    }
  }

  issue.status = newStatus as Issue["status"]
  issue.updatedAt = now()
  return { success: true, data: deepClone(issue) }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function getProjects(): Project[] {
  return deepClone(_state().projects)
}

export function getProjectById(id: string): Project | undefined {
  const project = _state().projects.find((p) => p.id === id)
  return project ? deepClone(project) : undefined
}

export function createProject(fields: {
  name?: string
  description?: string
  status?: Project["status"]
  leadId?: string
  teamId?: string
  targetDate?: string | null
}): Result<Project> {
  const s = _state()

  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (fields.status !== undefined && !VALID_PROJECT_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = s.teams.find((t) => t.id === teamId)
  if (!team) {
    return { success: false, error: `Team not found: ${teamId}` }
  }

  if (fields.leadId !== undefined) {
    const lead = s.members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
  }

  const project: Project = {
    id: `proj-${s.nextProjectId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    status: fields.status ?? "planned",
    leadId: fields.leadId ?? "usr-1",
    teamId,
    targetDate: fields.targetDate ?? null,
    createdAt: now(),
  }

  s.projects.push(project)
  return { success: true, data: deepClone(project) }
}

export function updateProject(
  id: string,
  fields: {
    name?: string
    description?: string
    status?: Project["status"]
    leadId?: string
    targetDate?: string | null
  }
): Result<Project> {
  const s = _state()
  const project = s.projects.find((p) => p.id === id)
  if (!project) return { success: false, error: "Project not found" }

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    project.name = fields.name.trim()
  }
  if (fields.description !== undefined) project.description = fields.description
  if (fields.status !== undefined) {
    if (!VALID_PROJECT_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` }
    }
    project.status = fields.status
  }
  if (fields.leadId !== undefined) {
    const lead = s.members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
    project.leadId = fields.leadId
  }
  if (fields.targetDate !== undefined) project.targetDate = fields.targetDate

  return { success: true, data: deepClone(project) }
}

// ---------------------------------------------------------------------------
// Cycles
// ---------------------------------------------------------------------------

export function getCycles(): Cycle[] {
  return deepClone(_state().cycles)
}

export function getCycleById(id: string): Cycle | undefined {
  const cycle = _state().cycles.find((c) => c.id === id)
  return cycle ? deepClone(cycle) : undefined
}

export function createCycle(fields: {
  name?: string
  description?: string
  teamId?: string
  startDate?: string
  endDate?: string
}): Result<Cycle> {
  const s = _state()

  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = s.teams.find((t) => t.id === teamId)
  if (!team) return { success: false, error: `Team not found: ${teamId}` }

  const cycle: Cycle = {
    id: `cycle-${s.nextCycleId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    teamId,
    startDate: fields.startDate ?? today(),
    endDate: fields.endDate ?? "",
    state: "upcoming",
    plannedPoints: 0,
    completedPoints: 0,
  }

  s.cycles.push(cycle)
  return { success: true, data: deepClone(cycle) }
}

export function startCycle(id: string): Result<Cycle> {
  const s = _state()
  const cycle = s.cycles.find((c) => c.id === id)
  if (!cycle) return { success: false, error: "Cycle not found" }

  if (cycle.state === "completed") {
    return { success: false, error: "Cannot start a completed cycle" }
  }
  if (cycle.state === "active") {
    return { success: false, error: "Cycle is already active" }
  }

  const activeInTeam = s.cycles.find(
    (c) => c.teamId === cycle.teamId && c.state === "active"
  )
  if (activeInTeam) {
    return {
      success: false,
      error: `Team already has an active cycle: ${activeInTeam.name}`,
    }
  }

  cycle.state = "active"
  cycle.startDate = today()
  return { success: true, data: deepClone(cycle) }
}

export function completeCycle(id: string): Result<Cycle> {
  const s = _state()
  const cycle = s.cycles.find((c) => c.id === id)
  if (!cycle) return { success: false, error: "Cycle not found" }

  if (cycle.state === "completed") {
    return { success: false, error: "Cycle is already completed" }
  }
  if (cycle.state === "upcoming") {
    return {
      success: false,
      error: "Cannot complete a cycle that has not started",
    }
  }

  cycle.state = "completed"
  cycle.endDate = today()
  return { success: true, data: deepClone(cycle) }
}

export function moveIssueToCycle(
  issueId: string,
  cycleId: string | null
): Result<Issue> {
  const s = _state()
  const issue = s.issues.find((i) => i.id === issueId)
  if (!issue) return { success: false, error: "Issue not found" }

  if (cycleId !== null) {
    const cycle = s.cycles.find((c) => c.id === cycleId)
    if (!cycle) return { success: false, error: "Cycle not found" }
  }

  issue.cycleId = cycleId
  issue.updatedAt = now()
  return { success: true, data: deepClone(issue) }
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export function getLabels(): Label[] {
  return deepClone(_state().labels)
}

export function getLabelById(id: string): Label | undefined {
  const label = _state().labels.find((l) => l.id === id)
  return label ? deepClone(label) : undefined
}

export function createLabel(fields: {
  name?: string
  color?: string
  teamId?: string | null
  description?: string
}): Result<Label> {
  const s = _state()

  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.color || String(fields.color).trim() === "") {
    return { success: false, error: "Color is required" }
  }

  const teamId = fields.teamId === undefined ? "team-1" : fields.teamId
  if (teamId !== null) {
    const team = s.teams.find((t) => t.id === teamId)
    if (!team) return { success: false, error: `Team not found: ${teamId}` }
  }

  if (
    s.labels.some((l) => l.teamId === teamId && l.name === fields.name!.trim())
  ) {
    return {
      success: false,
      error: `Label already exists: ${fields.name}`,
    }
  }

  const label: Label = {
    id: `label-${s.nextLabelId++}`,
    name: fields.name.trim(),
    description: fields.description?.trim() ?? "",
    color: fields.color.trim(),
    teamId,
    group: "Type",
    archivedAt: null,
  }

  s.labels.push(label)
  return { success: true, data: deepClone(label) }
}

export function updateLabel(
  id: string,
  fields: {
    name?: string
    color?: string
    description?: string
    archivedAt?: string | null
  }
): Result<Label> {
  const s = _state()
  const label = s.labels.find((l) => l.id === id)
  if (!label) return { success: false, error: "Label not found" }

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    if (
      s.labels.some(
        (l) =>
          l.id !== id &&
          l.teamId === label.teamId &&
          l.name === fields.name!.trim()
      )
    ) {
      return {
        success: false,
        error: `Label already exists: ${fields.name}`,
      }
    }
    label.name = fields.name.trim()
  }
  if (fields.color !== undefined) {
    if (String(fields.color).trim() === "") {
      return { success: false, error: "Color cannot be empty" }
    }
    label.color = fields.color.trim()
  }
  if (fields.description !== undefined) {
    label.description = String(fields.description).trim()
  }
  if (fields.archivedAt !== undefined) {
    label.archivedAt = fields.archivedAt
  }

  return { success: true, data: deepClone(label) }
}

export function deleteLabel(id: string): Result<{ id: string }> {
  const s = _state()
  const idx = s.labels.findIndex((l) => l.id === id)
  if (idx === -1) return { success: false, error: "Label not found" }
  s.labels.splice(idx, 1)
  return { success: true, data: { id } }
}

export function archiveLabel(id: string): Result<Label> {
  return updateLabel(id, { archivedAt: new Date().toISOString() })
}

export function restoreLabel(id: string): Result<Label> {
  return updateLabel(id, { archivedAt: null })
}

// ---------------------------------------------------------------------------
// Project labels (parallel CRUD on a separate array — issue labels live in
// `_state().labels`; project labels start empty per session).
// ---------------------------------------------------------------------------

export function getProjectLabels(): Label[] {
  return deepClone(_state().projectLabels)
}

export function getProjectLabelById(id: string): Label | undefined {
  const label = _state().projectLabels.find((l) => l.id === id)
  return label ? deepClone(label) : undefined
}

export function createProjectLabel(fields: {
  name?: string
  color?: string
  description?: string
}): Result<Label> {
  const s = _state()

  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.color || String(fields.color).trim() === "") {
    return { success: false, error: "Color is required" }
  }
  if (s.projectLabels.some((l) => l.name === fields.name!.trim())) {
    return { success: false, error: `Label already exists: ${fields.name}` }
  }
  const label: Label = {
    id: `project-label-${s.nextProjectLabelId++}`,
    name: fields.name.trim(),
    description: fields.description?.trim() ?? "",
    color: fields.color.trim(),
    teamId: null,
    group: "Type",
    archivedAt: null,
  }
  s.projectLabels.push(label)
  return { success: true, data: deepClone(label) }
}

export function updateProjectLabel(
  id: string,
  fields: {
    name?: string
    color?: string
    description?: string
    archivedAt?: string | null
  }
): Result<Label> {
  const s = _state()
  const label = s.projectLabels.find((l) => l.id === id)
  if (!label) return { success: false, error: "Label not found" }

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    if (
      s.projectLabels.some((l) => l.id !== id && l.name === fields.name!.trim())
    ) {
      return { success: false, error: `Label already exists: ${fields.name}` }
    }
    label.name = fields.name.trim()
  }
  if (fields.color !== undefined) {
    if (String(fields.color).trim() === "") {
      return { success: false, error: "Color cannot be empty" }
    }
    label.color = fields.color.trim()
  }
  if (fields.description !== undefined) {
    label.description = String(fields.description).trim()
  }
  if (fields.archivedAt !== undefined) {
    label.archivedAt = fields.archivedAt
  }
  return { success: true, data: deepClone(label) }
}

export function deleteProjectLabel(id: string): Result<{ id: string }> {
  const s = _state()
  const idx = s.projectLabels.findIndex((l) => l.id === id)
  if (idx === -1) return { success: false, error: "Label not found" }
  s.projectLabels.splice(idx, 1)
  return { success: true, data: { id } }
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export function getTeams(): Team[] {
  return deepClone(_state().teams)
}

export function getTeamById(id: string): Team | undefined {
  const team = _state().teams.find((t) => t.id === id)
  return team ? deepClone(team) : undefined
}

export function getTeamByKey(key: string): Team | undefined {
  const team = _state().teams.find((t) => t.key === key)
  return team ? deepClone(team) : undefined
}

export function createTeam(fields: {
  name?: string
  key?: string
  description?: string
  leadId?: string
  memberIds?: string[]
}): Result<Team> {
  const s = _state()

  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.key || String(fields.key).trim() === "") {
    return { success: false, error: "Key is required" }
  }

  const normalizedKey = fields.key.trim().toUpperCase()
  if (s.teams.some((t) => t.key === normalizedKey)) {
    return {
      success: false,
      error: `Team key already exists: ${normalizedKey}`,
    }
  }

  const trimmedName = fields.name.trim()
  if (s.teams.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
    return {
      success: false,
      error: `Team name already exists: ${trimmedName}`,
    }
  }

  if (fields.leadId !== undefined) {
    const lead = s.members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
  }

  if (fields.memberIds !== undefined) {
    for (const memberId of fields.memberIds) {
      const member = s.members.find((m) => m.id === memberId)
      if (!member) {
        return { success: false, error: `Member not found: ${memberId}` }
      }
    }
  }

  const team: Team = {
    id: `team-${s.nextTeamId++}`,
    name: fields.name.trim(),
    key: normalizedKey,
    description: fields.description ?? "",
    leadId: fields.leadId ?? "usr-1",
    memberIds: fields.memberIds ?? [],
    createdAt: now(),
  }

  s.teams.push(team)
  s.nextIssueCounters[team.key] = 1
  return { success: true, data: deepClone(team) }
}

export function updateTeam(
  id: string,
  fields: {
    name?: string
    description?: string
    leadId?: string
    memberIds?: string[]
  }
): Result<Team> {
  const s = _state()
  const team = s.teams.find((t) => t.id === id)
  if (!team) return { success: false, error: "Team not found" }

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    team.name = fields.name.trim()
  }
  if (fields.description !== undefined) team.description = fields.description
  if (fields.leadId !== undefined) {
    const lead = s.members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
    team.leadId = fields.leadId
  }
  if (fields.memberIds !== undefined) {
    for (const memberId of fields.memberIds) {
      const member = s.members.find((m) => m.id === memberId)
      if (!member) {
        return { success: false, error: `Member not found: ${memberId}` }
      }
    }
    team.memberIds = fields.memberIds
  }

  return { success: true, data: deepClone(team) }
}

// ---------------------------------------------------------------------------
// Members (read-only)
// ---------------------------------------------------------------------------

export function getMembers(): Member[] {
  return deepClone(_state().members)
}

export function getMemberById(id: string): Member | undefined {
  const member = _state().members.find((m) => m.id === id)
  return member ? deepClone(member) : undefined
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export function getViews(): View[] {
  return deepClone(_state().views)
}

export function getViewById(id: string): View | undefined {
  const view = _state().views.find((v) => v.id === id)
  return view ? deepClone(view) : undefined
}

export function createView(fields: {
  name?: string
  description?: string
  filterQuery?: string
  ownerId?: string
  teamId?: string
}): Result<View> {
  const s = _state()

  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.filterQuery || String(fields.filterQuery).trim() === "") {
    return { success: false, error: "Filter query is required" }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = s.teams.find((t) => t.id === teamId)
  if (!team) return { success: false, error: `Team not found: ${teamId}` }

  if (fields.ownerId !== undefined) {
    const owner = s.members.find((m) => m.id === fields.ownerId)
    if (!owner) {
      return { success: false, error: `Member not found: ${fields.ownerId}` }
    }
  }

  const view: View = {
    id: `view-${s.nextViewId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    filterQuery: fields.filterQuery.trim(),
    ownerId: fields.ownerId ?? "usr-1",
    teamId,
    createdAt: now(),
  }

  s.views.push(view)
  return { success: true, data: deepClone(view) }
}

// updateView — partial update of an existing view by id. Allowed
// fields mirror the createView body except `createdAt` / `id`,
// which are immutable. Validates ownerId / teamId references when
// they're being changed so a typo can't leave a dangling pointer.
export function updateView(
  id: string,
  fields: {
    name?: string
    description?: string
    filterQuery?: string
    ownerId?: string
    teamId?: string
  }
): Result<View> {
  const s = _state()
  const view = s.views.find((v) => v.id === id)
  if (!view) return { success: false, error: "View not found" }

  if (fields.name !== undefined) {
    if (typeof fields.name !== "string" || fields.name.trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    view.name = fields.name.trim()
  }
  if (fields.description !== undefined) {
    view.description = String(fields.description)
  }
  if (fields.filterQuery !== undefined) {
    if (
      typeof fields.filterQuery !== "string" ||
      fields.filterQuery.trim() === ""
    ) {
      return { success: false, error: "Filter query cannot be empty" }
    }
    view.filterQuery = fields.filterQuery.trim()
  }
  if (fields.ownerId !== undefined) {
    const owner = s.members.find((m) => m.id === fields.ownerId)
    if (!owner) {
      return { success: false, error: `Member not found: ${fields.ownerId}` }
    }
    view.ownerId = fields.ownerId
  }
  if (fields.teamId !== undefined) {
    const team = s.teams.find((t) => t.id === fields.teamId)
    if (!team) {
      return { success: false, error: `Team not found: ${fields.teamId}` }
    }
    view.teamId = fields.teamId
  }
  return { success: true, data: deepClone(view) }
}

export function deleteView(id: string): Result {
  const s = _state()
  const idx = s.views.findIndex((v) => v.id === id)
  if (idx === -1) return { success: false, error: "View not found" }
  s.views.splice(idx, 1)
  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Reset — restores everything in the current session to initial state.
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  resetState(_state(), seed)
}
