import {
  users as initialUsers,
  projects as initialProjects,
  sprints as initialSprints,
  epics as initialEpics,
  issues as initialIssues,
  boards as initialBoards,
  filters as initialFilters,
  type User,
  type Project,
  type Sprint,
  type Epic,
  type Issue,
  type Board,
  type SavedFilter,
  type Plan,
} from "./mock-data";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type Result<T = void> = { success: true; data: T } | { success: false; error: string };

// ---------------------------------------------------------------------------
// Singleton store — deep-cloned from initial data, shared across API routes
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Deterministic timestamps — use dateOverride when set (seeded episodes)
// ---------------------------------------------------------------------------

let _dateOverride: string | null = null;
let _dateCounter = 0;

export function setDateOverride(date: string | null): void {
  _dateOverride = date;
  _dateCounter = 0;
}

function now(): string {
  if (_dateOverride) {
    const base = new Date(_dateOverride);
    base.setSeconds(base.getSeconds() + _dateCounter++);
    return base.toISOString();
  }
  return new Date().toISOString();
}

function today(): string {
  return now().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Enum validators
// ---------------------------------------------------------------------------

const VALID_ISSUE_TYPE = new Set<string>(["story", "task", "bug", "subtask"]);
const VALID_ISSUE_STATUS = new Set<string>(["to_do", "in_progress", "in_review", "done"]);
const VALID_ISSUE_PRIORITY = new Set<string>(["highest", "high", "medium", "low", "lowest"]);
const VALID_PROJECT_TYPE = new Set<string>(["scrum", "kanban"]);
const VALID_SPRINT_STATE = new Set<string>(["active", "closed", "future"]);
const VALID_EPIC_STATUS = new Set<string>(["to_do", "in_progress", "done"]);

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  to_do: ["in_progress"],
  in_progress: ["in_review", "to_do", "done"],
  in_review: ["done", "in_progress"],
  done: ["to_do"],
};

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let _users: User[] = deepClone(initialUsers);
let _projects: Project[] = deepClone(initialProjects);
let _sprints: Sprint[] = deepClone(initialSprints);
let _epics: Epic[] = deepClone(initialEpics);
let _issues: Issue[] = deepClone(initialIssues);
let _boards: Board[] = deepClone(initialBoards);
let _filters: SavedFilter[] = deepClone(initialFilters);
let _plans: Plan[] = [];

// Auto-increment counters per project key
let _nextIssueCounters: Record<string, number> = { PROJ: 19, KANB: 8 };
let _nextIssueId = 26;
let _nextProjectId = 3;
let _nextSprintId = 4;
let _nextEpicId = 4;
let _nextFilterId = 4;
let _nextPlanId = 1;

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export function getIssues(): Issue[] {
  return deepClone(_issues);
}

export function getIssueById(id: string): Issue | undefined {
  const issue = _issues.find((i) => i.id === id);
  return issue ? deepClone(issue) : undefined;
}

export function getIssueByKey(key: string): Issue | undefined {
  const issue = _issues.find((i) => i.key === key);
  return issue ? deepClone(issue) : undefined;
}

export function createIssue(fields: {
  summary?: string;
  description?: string;
  type?: Issue["type"];
  status?: Issue["status"];
  priority?: Issue["priority"];
  assigneeId?: string | null;
  reporterId?: string;
  sprintId?: string | null;
  epicId?: string | null;
  projectId?: string;
  storyPoints?: number | null;
  labels?: string[];
}): Result<Issue> {
  if (!fields.summary || String(fields.summary).trim() === "") {
    return { success: false, error: "Summary is required" };
  }
  if (fields.type !== undefined && !VALID_ISSUE_TYPE.has(fields.type)) {
    return { success: false, error: `Invalid type: ${fields.type}` };
  }
  if (fields.status !== undefined && !VALID_ISSUE_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` };
  }
  if (fields.priority !== undefined && !VALID_ISSUE_PRIORITY.has(fields.priority)) {
    return { success: false, error: `Invalid priority: ${fields.priority}` };
  }

  // Determine project key for issue key generation
  const projectId = fields.projectId ?? "proj-1";
  const project = _projects.find((p) => p.id === projectId);
  if (!project) {
    return { success: false, error: `Project not found: ${projectId}` };
  }

  const projectKey = project.key;
  if (!_nextIssueCounters[projectKey]) {
    _nextIssueCounters[projectKey] = 1;
  }
  const issueKey = `${projectKey}-${_nextIssueCounters[projectKey]++}`;
  const timestamp = now();

  const issue: Issue = {
    id: `iss-${_nextIssueId++}`,
    key: issueKey,
    summary: fields.summary.trim(),
    description: fields.description ?? "",
    type: fields.type ?? "task",
    status: fields.status ?? "to_do",
    priority: fields.priority ?? "medium",
    assigneeId: fields.assigneeId ?? null,
    reporterId: fields.reporterId ?? "usr-1",
    sprintId: fields.sprintId ?? null,
    epicId: fields.epicId ?? null,
    projectId,
    storyPoints: fields.storyPoints ?? null,
    labels: fields.labels ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  _issues.push(issue);
  return { success: true, data: deepClone(issue) };
}

export function updateIssue(
  id: string,
  fields: {
    summary?: string;
    description?: string;
    type?: Issue["type"];
    status?: Issue["status"];
    priority?: Issue["priority"];
    assigneeId?: string | null;
    reporterId?: string;
    sprintId?: string | null;
    epicId?: string | null;
    projectId?: string;
    storyPoints?: number | null;
    labels?: string[];
  },
): Result<Issue> {
  const issue = _issues.find((i) => i.id === id);
  if (!issue) return { success: false, error: "Issue not found" };

  if (fields.summary !== undefined) {
    if (String(fields.summary).trim() === "") {
      return { success: false, error: "Summary cannot be empty" };
    }
    issue.summary = fields.summary.trim();
  }
  if (fields.description !== undefined) issue.description = fields.description;
  if (fields.type !== undefined) {
    if (!VALID_ISSUE_TYPE.has(fields.type)) {
      return { success: false, error: `Invalid type: ${fields.type}` };
    }
    issue.type = fields.type;
  }
  if (fields.status !== undefined) {
    if (!VALID_ISSUE_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` };
    }
    issue.status = fields.status;
  }
  if (fields.priority !== undefined) {
    if (!VALID_ISSUE_PRIORITY.has(fields.priority)) {
      return { success: false, error: `Invalid priority: ${fields.priority}` };
    }
    issue.priority = fields.priority;
  }
  if (fields.assigneeId !== undefined) issue.assigneeId = fields.assigneeId;
  if (fields.reporterId !== undefined) issue.reporterId = fields.reporterId;
  if (fields.sprintId !== undefined) issue.sprintId = fields.sprintId;
  if (fields.epicId !== undefined) issue.epicId = fields.epicId;
  if (fields.projectId !== undefined) issue.projectId = fields.projectId;
  if (fields.storyPoints !== undefined) issue.storyPoints = fields.storyPoints;
  if (fields.labels !== undefined) issue.labels = fields.labels;

  issue.updatedAt = now();
  return { success: true, data: deepClone(issue) };
}

export function deleteIssue(id: string): Result {
  const idx = _issues.findIndex((i) => i.id === id);
  if (idx === -1) return { success: false, error: "Issue not found" };
  _issues.splice(idx, 1);
  return { success: true, data: undefined };
}

export function transitionIssue(id: string, newStatus: string): Result<Issue> {
  const issue = _issues.find((i) => i.id === id);
  if (!issue) return { success: false, error: "Issue not found" };

  if (!VALID_ISSUE_STATUS.has(newStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}` };
  }

  const allowed = VALID_TRANSITIONS[issue.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${issue.status} -> ${newStatus}. Allowed: ${allowed?.join(", ") ?? "none"}`,
    };
  }

  issue.status = newStatus as Issue["status"];
  issue.updatedAt = now();
  return { success: true, data: deepClone(issue) };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function getProjects(): Project[] {
  return deepClone(_projects);
}

export function getProjectById(id: string): Project | undefined {
  const project = _projects.find((p) => p.id === id);
  return project ? deepClone(project) : undefined;
}

export function getProjectByKey(key: string): Project | undefined {
  const project = _projects.find((p) => p.key === key);
  return project ? deepClone(project) : undefined;
}

export function createProject(fields: {
  key?: string;
  name?: string;
  description?: string;
  type?: Project["type"];
  lead?: string;
}): Result<Project> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" };
  }
  if (!fields.key || String(fields.key).trim() === "") {
    return { success: false, error: "Key is required" };
  }
  if (fields.type !== undefined && !VALID_PROJECT_TYPE.has(fields.type)) {
    return { success: false, error: `Invalid type: ${fields.type}` };
  }
  // Check for duplicate key
  if (_projects.some((p) => p.key === fields.key)) {
    return { success: false, error: `Project key already exists: ${fields.key}` };
  }

  const project: Project = {
    id: `proj-${_nextProjectId++}`,
    key: fields.key.trim().toUpperCase(),
    name: fields.name.trim(),
    lead: fields.lead ?? "usr-1",
    type: fields.type ?? "scrum",
    description: fields.description ?? "",
    createdAt: now(),
  };

  _projects.push(project);
  // Initialize issue counter for new project key
  _nextIssueCounters[project.key] = 1;
  return { success: true, data: deepClone(project) };
}

export function updateProject(
  id: string,
  fields: {
    name?: string;
    description?: string;
    type?: Project["type"];
    lead?: string;
  },
): Result<Project> {
  const project = _projects.find((p) => p.id === id);
  if (!project) return { success: false, error: "Project not found" };

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" };
    }
    project.name = fields.name.trim();
  }
  if (fields.description !== undefined) project.description = fields.description;
  if (fields.type !== undefined) {
    if (!VALID_PROJECT_TYPE.has(fields.type)) {
      return { success: false, error: `Invalid type: ${fields.type}` };
    }
    project.type = fields.type;
  }
  if (fields.lead !== undefined) project.lead = fields.lead;

  return { success: true, data: deepClone(project) };
}

// ---------------------------------------------------------------------------
// Sprints
// ---------------------------------------------------------------------------

export function getSprints(): Sprint[] {
  return deepClone(_sprints);
}

export function getSprintById(id: string): Sprint | undefined {
  const sprint = _sprints.find((s) => s.id === id);
  return sprint ? deepClone(sprint) : undefined;
}

export function createSprint(fields: {
  name?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
}): Result<Sprint> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" };
  }

  const projectId = fields.projectId ?? "proj-1";
  const project = _projects.find((p) => p.id === projectId);
  if (!project) return { success: false, error: `Project not found: ${projectId}` };

  const sprint: Sprint = {
    id: `sprint-${_nextSprintId++}`,
    name: fields.name.trim(),
    projectId,
    startDate: fields.startDate ?? today(),
    endDate: fields.endDate ?? "",
    goal: fields.goal ?? "",
    state: "future",
  };

  _sprints.push(sprint);
  return { success: true, data: deepClone(sprint) };
}

export function startSprint(id: string): Result<Sprint> {
  const sprint = _sprints.find((s) => s.id === id);
  if (!sprint) return { success: false, error: "Sprint not found" };

  if (sprint.state === "closed") {
    return { success: false, error: "Cannot start a closed sprint" };
  }
  if (sprint.state === "active") {
    return { success: false, error: "Sprint is already active" };
  }

  // Check only 1 active sprint per project
  const activeInProject = _sprints.find(
    (s) => s.projectId === sprint.projectId && s.state === "active",
  );
  if (activeInProject) {
    return {
      success: false,
      error: `Project already has an active sprint: ${activeInProject.name}`,
    };
  }

  sprint.state = "active";
  sprint.startDate = today();
  return { success: true, data: deepClone(sprint) };
}

export function completeSprint(id: string): Result<Sprint> {
  const sprint = _sprints.find((s) => s.id === id);
  if (!sprint) return { success: false, error: "Sprint not found" };

  if (sprint.state === "closed") {
    return { success: false, error: "Sprint is already closed" };
  }
  if (sprint.state === "future") {
    return { success: false, error: "Cannot complete a sprint that has not started" };
  }

  sprint.state = "closed";
  sprint.endDate = today();
  return { success: true, data: deepClone(sprint) };
}

export function moveIssueToSprint(issueId: string, sprintId: string | null): Result<Issue> {
  const issue = _issues.find((i) => i.id === issueId);
  if (!issue) return { success: false, error: "Issue not found" };

  if (sprintId !== null) {
    const sprint = _sprints.find((s) => s.id === sprintId);
    if (!sprint) return { success: false, error: "Sprint not found" };
  }

  issue.sprintId = sprintId;
  issue.updatedAt = now();
  return { success: true, data: deepClone(issue) };
}

// ---------------------------------------------------------------------------
// Epics
// ---------------------------------------------------------------------------

export function getEpics(): Epic[] {
  return deepClone(_epics);
}

export function getEpicById(id: string): Epic | undefined {
  const epic = _epics.find((e) => e.id === id);
  return epic ? deepClone(epic) : undefined;
}

export function createEpic(fields: {
  name?: string;
  summary?: string;
  projectId?: string;
  status?: Epic["status"];
}): Result<Epic> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" };
  }

  const projectId = fields.projectId ?? "proj-1";
  const project = _projects.find((p) => p.id === projectId);
  if (!project) return { success: false, error: `Project not found: ${projectId}` };

  if (fields.status !== undefined && !VALID_EPIC_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` };
  }

  const epic: Epic = {
    id: `epic-${_nextEpicId++}`,
    name: fields.name.trim(),
    summary: fields.summary ?? "",
    projectId,
    status: fields.status ?? "to_do",
  };

  _epics.push(epic);
  return { success: true, data: deepClone(epic) };
}

export function updateEpic(
  id: string,
  fields: {
    name?: string;
    summary?: string;
    status?: Epic["status"];
  },
): Result<Epic> {
  const epic = _epics.find((e) => e.id === id);
  if (!epic) return { success: false, error: "Epic not found" };

  if (fields.name !== undefined) {
    if (String(fields.name).trim() === "") {
      return { success: false, error: "Name cannot be empty" };
    }
    epic.name = fields.name.trim();
  }
  if (fields.summary !== undefined) epic.summary = fields.summary;
  if (fields.status !== undefined) {
    if (!VALID_EPIC_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` };
    }
    epic.status = fields.status;
  }

  return { success: true, data: deepClone(epic) };
}

// ---------------------------------------------------------------------------
// Boards (read-only)
// ---------------------------------------------------------------------------

export function getBoards(): Board[] {
  return deepClone(_boards);
}

export function getBoardById(id: string): Board | undefined {
  const board = _boards.find((b) => b.id === id);
  return board ? deepClone(board) : undefined;
}

// ---------------------------------------------------------------------------
// Users (read-only)
// ---------------------------------------------------------------------------

export function getUsers(): User[] {
  return deepClone(_users);
}

export function getUserById(id: string): User | undefined {
  const user = _users.find((u) => u.id === id);
  return user ? deepClone(user) : undefined;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export function getFilters(): SavedFilter[] {
  return deepClone(_filters);
}

export function getFilterById(id: string): SavedFilter | undefined {
  const filter = _filters.find((f) => f.id === id);
  return filter ? deepClone(filter) : undefined;
}

export function createFilter(fields: {
  name?: string;
  jql?: string;
  owner?: string;
}): Result<SavedFilter> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" };
  }
  if (!fields.jql || String(fields.jql).trim() === "") {
    return { success: false, error: "JQL is required" };
  }

  const filter: SavedFilter = {
    id: `filter-${_nextFilterId++}`,
    name: fields.name.trim(),
    jql: fields.jql.trim(),
    owner: fields.owner ?? "usr-1",
    createdAt: now(),
  };

  _filters.push(filter);
  return { success: true, data: deepClone(filter) };
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export function getPlans(): Plan[] {
  return deepClone(_plans);
}

export function getPlan(id: string): Plan | undefined {
  const plan = _plans.find((p) => p.id === id);
  return plan ? deepClone(plan) : undefined;
}

export function createPlan(fields: {
  name?: string;
  access?: Plan["access"];
  workSources?: { type: "space" | "board" | "filter"; name: string }[];
  owner?: string;
}): Result<Plan> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" };
  }

  const plan: Plan = {
    id: `plan-${_nextPlanId++}`,
    name: fields.name.trim(),
    access: fields.access ?? "open",
    workSources: fields.workSources ?? [],
    owner: fields.owner ?? "usr-1",
    createdAt: now(),
  };

  _plans.push(plan);
  return { success: true, data: deepClone(plan) };
}

export function deletePlan(id: string): Result<void> {
  const idx = _plans.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: "Plan not found" };
  _plans.splice(idx, 1);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Reset — restores everything to initial state
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  _users = deepClone(initialUsers);
  _projects = deepClone(initialProjects);
  _sprints = deepClone(initialSprints);
  _epics = deepClone(initialEpics);
  _issues = deepClone(initialIssues);
  _boards = deepClone(initialBoards);
  _filters = deepClone(initialFilters);
  _plans = [];

  _nextIssueCounters = { PROJ: 19, KANB: 8 };
  _nextIssueId = 26;
  _nextProjectId = 3;
  _nextSprintId = 4;
  _nextEpicId = 4;
  _nextFilterId = 4;
  _nextPlanId = 1;

  // Deterministic timestamps when seed is provided
  if (seed !== undefined) {
    const base = new Date("2025-06-01T12:00:00.000Z");
    base.setMinutes(base.getMinutes() + (seed % 1440));
    _dateOverride = base.toISOString();
  } else {
    _dateOverride = null;
  }
  _dateCounter = 0;
}
