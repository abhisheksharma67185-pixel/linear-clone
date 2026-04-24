import {
  members as initialMembers,
  teams as initialTeams,
  projects as initialProjects,
  cycles as initialCycles,
  issues as initialIssues,
  labels as initialLabels,
  views as initialViews,
  type Member,
  type Team,
  type Project,
  type Cycle,
  type Issue,
  type Label,
  type View,
} from "./mock-data"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Singleton store — deep-cloned from initial data, shared across API routes
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ---------------------------------------------------------------------------
// Deterministic timestamps — use dateOverride when set (seeded episodes)
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
// Module-level state
// ---------------------------------------------------------------------------

let _members: Member[] = deepClone(initialMembers)
let _teams: Team[] = deepClone(initialTeams)
let _projects: Project[] = deepClone(initialProjects)
let _cycles: Cycle[] = deepClone(initialCycles)
let _issues: Issue[] = deepClone(initialIssues)
let _labels: Label[] = deepClone(initialLabels)
let _views: View[] = deepClone(initialViews)

// Auto-increment counters per team key. Start above spec-defined ranges so
// newly-created issues don't collide with seed data.
// Platform uses 3 discrete ranges (100s, 200s, 300s) — new issues go in 400s.
let _nextIssueCounters: Record<string, number> = {
  PLT: 400,
  FE: 55,
  INF: 1,
  LEG: 86,
}
let _nextIssueId = 181
let _nextProjectId = 4
let _nextCycleId = 15
let _nextLabelId = 13
let _nextTeamId = 5
let _nextViewId = 5

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export function getIssues(): Issue[] {
  return deepClone(_issues)
}

export function getIssueById(id: string): Issue | undefined {
  const issue = _issues.find((i) => i.id === id)
  return issue ? deepClone(issue) : undefined
}

export function getIssueByIdentifier(identifier: string): Issue | undefined {
  const issue = _issues.find((i) => i.identifier === identifier)
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

  // Determine team key for identifier generation
  const teamId = fields.teamId ?? "team-1"
  const team = _teams.find((t) => t.id === teamId)
  if (!team) {
    return { success: false, error: `Team not found: ${teamId}` }
  }

  // Validate assignee exists if provided
  if (fields.assigneeId !== undefined && fields.assigneeId !== null) {
    const assignee = _members.find((m) => m.id === fields.assigneeId)
    if (!assignee) {
      return { success: false, error: `Member not found: ${fields.assigneeId}` }
    }
  }

  // Validate project exists if provided
  if (fields.projectId !== undefined && fields.projectId !== null) {
    const project = _projects.find((p) => p.id === fields.projectId)
    if (!project) {
      return { success: false, error: `Project not found: ${fields.projectId}` }
    }
  }

  // Validate cycle exists if provided
  if (fields.cycleId !== undefined && fields.cycleId !== null) {
    const cycle = _cycles.find((c) => c.id === fields.cycleId)
    if (!cycle) {
      return { success: false, error: `Cycle not found: ${fields.cycleId}` }
    }
  }

  // Validate label IDs if provided
  if (fields.labelIds !== undefined) {
    for (const labelId of fields.labelIds) {
      const label = _labels.find((l) => l.id === labelId)
      if (!label) {
        return { success: false, error: `Label not found: ${labelId}` }
      }
    }
  }

  const teamKey = team.key
  if (!_nextIssueCounters[teamKey]) {
    _nextIssueCounters[teamKey] = 1
  }
  const identifier = `${teamKey}-${_nextIssueCounters[teamKey]++}`
  const timestamp = now()

  const issue: Issue = {
    id: `iss-${_nextIssueId++}`,
    identifier,
    title: fields.title.trim(),
    description: fields.description ?? "",
    status: fields.status ?? "backlog",
    priority: fields.priority ?? "none",
    assigneeId: fields.assigneeId ?? null,
    creatorId: fields.creatorId ?? "usr-1",
    teamId,
    projectId: fields.projectId ?? null,
    cycleId: fields.cycleId ?? null,
    labelIds: fields.labelIds ?? [],
    estimate: fields.estimate ?? null,
    dueDate: fields.dueDate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  _issues.push(issue)
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
  }
): Result<Issue> {
  const issue = _issues.find((i) => i.id === id)
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
      const assignee = _members.find((m) => m.id === fields.assigneeId)
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
    const team = _teams.find((t) => t.id === fields.teamId)
    if (!team) {
      return { success: false, error: `Team not found: ${fields.teamId}` }
    }
    issue.teamId = fields.teamId
  }
  if (fields.projectId !== undefined) {
    if (fields.projectId !== null) {
      const project = _projects.find((p) => p.id === fields.projectId)
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
      const cycle = _cycles.find((c) => c.id === fields.cycleId)
      if (!cycle) {
        return { success: false, error: `Cycle not found: ${fields.cycleId}` }
      }
    }
    issue.cycleId = fields.cycleId
  }
  if (fields.labelIds !== undefined) {
    for (const labelId of fields.labelIds) {
      const label = _labels.find((l) => l.id === labelId)
      if (!label) {
        return { success: false, error: `Label not found: ${labelId}` }
      }
    }
    issue.labelIds = fields.labelIds
  }
  if (fields.estimate !== undefined) issue.estimate = fields.estimate
  if (fields.dueDate !== undefined) issue.dueDate = fields.dueDate

  issue.updatedAt = now()
  return { success: true, data: deepClone(issue) }
}

export function deleteIssue(id: string): Result {
  const idx = _issues.findIndex((i) => i.id === id)
  if (idx === -1) return { success: false, error: "Issue not found" }
  _issues.splice(idx, 1)
  return { success: true, data: undefined }
}

export function transitionIssue(id: string, newStatus: string): Result<Issue> {
  const issue = _issues.find((i) => i.id === id)
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
  return deepClone(_projects)
}

export function getProjectById(id: string): Project | undefined {
  const project = _projects.find((p) => p.id === id)
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
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (fields.status !== undefined && !VALID_PROJECT_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = _teams.find((t) => t.id === teamId)
  if (!team) {
    return { success: false, error: `Team not found: ${teamId}` }
  }

  if (fields.leadId !== undefined) {
    const lead = _members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
  }

  const project: Project = {
    id: `proj-${_nextProjectId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    status: fields.status ?? "planned",
    leadId: fields.leadId ?? "usr-1",
    teamId,
    targetDate: fields.targetDate ?? null,
    createdAt: now(),
  }

  _projects.push(project)
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
  const project = _projects.find((p) => p.id === id)
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
    const lead = _members.find((m) => m.id === fields.leadId)
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
  return deepClone(_cycles)
}

export function getCycleById(id: string): Cycle | undefined {
  const cycle = _cycles.find((c) => c.id === id)
  return cycle ? deepClone(cycle) : undefined
}

export function createCycle(fields: {
  name?: string
  description?: string
  teamId?: string
  startDate?: string
  endDate?: string
}): Result<Cycle> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = _teams.find((t) => t.id === teamId)
  if (!team) return { success: false, error: `Team not found: ${teamId}` }

  const cycle: Cycle = {
    id: `cycle-${_nextCycleId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    teamId,
    startDate: fields.startDate ?? today(),
    endDate: fields.endDate ?? "",
    state: "upcoming",
    plannedPoints: 0,
    completedPoints: 0,
  }

  _cycles.push(cycle)
  return { success: true, data: deepClone(cycle) }
}

export function startCycle(id: string): Result<Cycle> {
  const cycle = _cycles.find((c) => c.id === id)
  if (!cycle) return { success: false, error: "Cycle not found" }

  if (cycle.state === "completed") {
    return { success: false, error: "Cannot start a completed cycle" }
  }
  if (cycle.state === "active") {
    return { success: false, error: "Cycle is already active" }
  }

  // Check only 1 active cycle per team
  const activeInTeam = _cycles.find(
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
  const cycle = _cycles.find((c) => c.id === id)
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
  const issue = _issues.find((i) => i.id === issueId)
  if (!issue) return { success: false, error: "Issue not found" }

  if (cycleId !== null) {
    const cycle = _cycles.find((c) => c.id === cycleId)
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
  return deepClone(_labels)
}

export function getLabelById(id: string): Label | undefined {
  const label = _labels.find((l) => l.id === id)
  return label ? deepClone(label) : undefined
}

export function createLabel(fields: {
  name?: string
  color?: string
  teamId?: string | null
  description?: string
}): Result<Label> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.color || String(fields.color).trim() === "") {
    return { success: false, error: "Color is required" }
  }

  // Workspace-level labels (teamId: null) are allowed; only validate team
  // existence when a non-null teamId is provided.
  const teamId = fields.teamId === undefined ? "team-1" : fields.teamId
  if (teamId !== null) {
    const team = _teams.find((t) => t.id === teamId)
    if (!team) return { success: false, error: `Team not found: ${teamId}` }
  }

  // Check for duplicate name within same scope (teamId).
  if (
    _labels.some((l) => l.teamId === teamId && l.name === fields.name!.trim())
  ) {
    return {
      success: false,
      error: `Label already exists: ${fields.name}`,
    }
  }

  const label: Label = {
    id: `label-${_nextLabelId++}`,
    name: fields.name.trim(),
    description: fields.description?.trim() ?? "",
    color: fields.color.trim(),
    teamId,
    group: "Type",
    archivedAt: null,
  }

  _labels.push(label)
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
  const label = _labels.find((l) => l.id === id)
  if (!label) return { success: false, error: "Label not found" }

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    // Check for duplicate name within team (excluding self)
    if (
      _labels.some(
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
  const idx = _labels.findIndex((l) => l.id === id)
  if (idx === -1) return { success: false, error: "Label not found" }
  _labels.splice(idx, 1)
  return { success: true, data: { id } }
}

export function archiveLabel(id: string): Result<Label> {
  return updateLabel(id, { archivedAt: new Date().toISOString() })
}

export function restoreLabel(id: string): Result<Label> {
  return updateLabel(id, { archivedAt: null })
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export function getTeams(): Team[] {
  return deepClone(_teams)
}

export function getTeamById(id: string): Team | undefined {
  const team = _teams.find((t) => t.id === id)
  return team ? deepClone(team) : undefined
}

export function getTeamByKey(key: string): Team | undefined {
  const team = _teams.find((t) => t.key === key)
  return team ? deepClone(team) : undefined
}

export function createTeam(fields: {
  name?: string
  key?: string
  description?: string
  leadId?: string
  memberIds?: string[]
}): Result<Team> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.key || String(fields.key).trim() === "") {
    return { success: false, error: "Key is required" }
  }

  // Check for duplicate key
  const normalizedKey = fields.key.trim().toUpperCase()
  if (_teams.some((t) => t.key === normalizedKey)) {
    return {
      success: false,
      error: `Team key already exists: ${normalizedKey}`,
    }
  }

  if (fields.leadId !== undefined) {
    const lead = _members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
  }

  // Validate member IDs if provided
  if (fields.memberIds !== undefined) {
    for (const memberId of fields.memberIds) {
      const member = _members.find((m) => m.id === memberId)
      if (!member) {
        return { success: false, error: `Member not found: ${memberId}` }
      }
    }
  }

  const team: Team = {
    id: `team-${_nextTeamId++}`,
    name: fields.name.trim(),
    key: normalizedKey,
    description: fields.description ?? "",
    leadId: fields.leadId ?? "usr-1",
    memberIds: fields.memberIds ?? [],
    createdAt: now(),
  }

  _teams.push(team)
  // Initialize issue counter for new team key
  _nextIssueCounters[team.key] = 1
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
  const team = _teams.find((t) => t.id === id)
  if (!team) return { success: false, error: "Team not found" }

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" }
    }
    team.name = fields.name.trim()
  }
  if (fields.description !== undefined) team.description = fields.description
  if (fields.leadId !== undefined) {
    const lead = _members.find((m) => m.id === fields.leadId)
    if (!lead) {
      return { success: false, error: `Member not found: ${fields.leadId}` }
    }
    team.leadId = fields.leadId
  }
  if (fields.memberIds !== undefined) {
    for (const memberId of fields.memberIds) {
      const member = _members.find((m) => m.id === memberId)
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
  return deepClone(_members)
}

export function getMemberById(id: string): Member | undefined {
  const member = _members.find((m) => m.id === id)
  return member ? deepClone(member) : undefined
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export function getViews(): View[] {
  return deepClone(_views)
}

export function getViewById(id: string): View | undefined {
  const view = _views.find((v) => v.id === id)
  return view ? deepClone(view) : undefined
}

export function createView(fields: {
  name?: string
  description?: string
  filterQuery?: string
  ownerId?: string
  teamId?: string
}): Result<View> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" }
  }
  if (!fields.filterQuery || String(fields.filterQuery).trim() === "") {
    return { success: false, error: "Filter query is required" }
  }

  const teamId = fields.teamId ?? "team-1"
  const team = _teams.find((t) => t.id === teamId)
  if (!team) return { success: false, error: `Team not found: ${teamId}` }

  if (fields.ownerId !== undefined) {
    const owner = _members.find((m) => m.id === fields.ownerId)
    if (!owner) {
      return { success: false, error: `Member not found: ${fields.ownerId}` }
    }
  }

  const view: View = {
    id: `view-${_nextViewId++}`,
    name: fields.name.trim(),
    description: fields.description ?? "",
    filterQuery: fields.filterQuery.trim(),
    ownerId: fields.ownerId ?? "usr-1",
    teamId,
    createdAt: now(),
  }

  _views.push(view)
  return { success: true, data: deepClone(view) }
}

// ---------------------------------------------------------------------------
// Reset — restores everything to initial state
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  _members = deepClone(initialMembers)
  _teams = deepClone(initialTeams)
  _projects = deepClone(initialProjects)
  _cycles = deepClone(initialCycles)
  _issues = deepClone(initialIssues)
  _labels = deepClone(initialLabels)
  _views = deepClone(initialViews)

  _nextIssueCounters = { ENG: 19, DES: 8 }
  _nextIssueId = 26
  _nextProjectId = 3
  _nextCycleId = 4
  _nextLabelId = 7
  _nextTeamId = 3
  _nextViewId = 4

  // Deterministic timestamps when seed is provided
  if (seed !== undefined) {
    const base = new Date("2025-06-01T12:00:00.000Z")
    base.setMinutes(base.getMinutes() + (seed % 1440))
    _dateOverride = base.toISOString()
  } else {
    _dateOverride = null
  }
  _dateCounter = 0
}
