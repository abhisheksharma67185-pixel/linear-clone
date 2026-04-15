import {
  users as initialUsers,
  projects as initialProjects,
  sprints as initialSprints,
  epics as initialEpics,
  issues as initialIssues,
  boards as initialBoards,
  filters as initialFilters,
  comments as initialComments,
  issueHistory as initialHistory,
  type User,
  type Project,
  type Sprint,
  type Epic,
  type Issue,
  type Board,
  type SavedFilter,
  type Plan,
  type Goal,
  type Comment,
  type IssueHistoryEntry,
  type Team,
  teams as initialTeams,
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

const VALID_ISSUE_TYPE = new Set<string>(["story", "task", "bug", "subtask", "epic"]);
const VALID_ISSUE_PRIORITY = new Set<string>(["highest", "high", "medium", "low", "lowest"]);
const VALID_PROJECT_TYPE = new Set<string>(["scrum", "kanban"]);

// Issue and epic statuses are validated against the project's workflow list
// (Project.workflow) rather than a global enum, because each project has its
// own workflow (PLAT: Open/In Development/..., LCRM: To Do/Doing/..., etc).
// isValidStatusForProject returns true if `status` is in the project's workflow.
function isValidStatusForProject(projectId: string, status: string): boolean {
  const project = _projects.find((p) => p.id === projectId);
  if (!project) return false;
  return project.workflow.includes(status);
}

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
let _goals: Goal[] = [
  { id: "goal-1", name: "Increase platform uptime to 99.9%", status: "ON TRACK", progress: 72, targetDate: "Jun 2026", owner: "usr-1", team: "Engineering", following: true, createdAt: "2026-01-15T09:00:00.000Z" },
  { id: "goal-2", name: "Reduce customer churn by 15%", status: "AT RISK", progress: 38, targetDate: "Sep 2026", owner: "usr-2", team: "Product", following: true, createdAt: "2026-01-20T09:00:00.000Z" },
  { id: "goal-3", name: "Launch mobile app v2.0", status: "ON TRACK", progress: 55, targetDate: "Jul 2026", owner: "usr-3", team: "Engineering", following: false, createdAt: "2026-02-01T09:00:00.000Z" },
  { id: "goal-4", name: "Migrate infrastructure to Kubernetes", status: "PENDING", progress: 10, targetDate: "Dec 2026", owner: "usr-4", team: "Infrastructure", following: false, createdAt: "2026-02-10T09:00:00.000Z" },
  { id: "goal-5", name: "Achieve SOC 2 Type II compliance", status: "AT RISK", progress: 45, targetDate: "Aug 2026", owner: "usr-1", team: "Security", following: true, createdAt: "2026-02-15T09:00:00.000Z" },
  { id: "goal-6", name: "Grow monthly active users to 50K", status: "OFF TRACK", progress: 22, targetDate: "Oct 2026", owner: "usr-2", team: "Marketing", following: false, createdAt: "2026-03-01T09:00:00.000Z" },
  { id: "goal-7", name: "Reduce average API response time below 200ms", status: "DONE", progress: 100, targetDate: "Apr 2026", owner: "usr-3", team: "Engineering", following: true, createdAt: "2026-01-10T09:00:00.000Z" },
  { id: "goal-8", name: "Ship redesigned onboarding flow", status: "ON TRACK", progress: 68, targetDate: "May 2026", owner: "usr-4", team: "Design", following: true, createdAt: "2026-02-20T09:00:00.000Z" },
];
let _nextGoalId = 9;
let _comments: Comment[] = deepClone(initialComments);
let _history: IssueHistoryEntry[] = deepClone(initialHistory);
let _nextHistoryId = 9;

// Derive next-available issue id and per-project-key counters from existing
// data, so newly created issues never collide with seeded ones. The legacy
// SCRUM/KANB defaults are preserved for episode tooling that injects issues
// under those keys without seeding them first.
function deriveIssueCounters(issues: Issue[]): {
  nextId: number;
  perProjectKey: Record<string, number>;
} {
  let maxIdNum = 0;
  const perProjectKey: Record<string, number> = {};
  for (const issue of issues) {
    const idMatch = /^iss-(\d+)$/.exec(issue.id);
    if (idMatch) {
      const n = parseInt(idMatch[1], 10);
      if (n > maxIdNum) maxIdNum = n;
    }
    const keyMatch = /^([A-Z][A-Z0-9]*)-(\d+)$/.exec(issue.key);
    if (keyMatch) {
      const prefix = keyMatch[1];
      const num = parseInt(keyMatch[2], 10);
      const next = num + 1;
      if (!perProjectKey[prefix] || next > perProjectKey[prefix]) {
        perProjectKey[prefix] = next;
      }
    }
  }
  return { nextId: maxIdNum + 1, perProjectKey };
}

// Auto-increment counters per project key
const _initialIssueCounters = deriveIssueCounters(_issues);
let _nextIssueCounters: Record<string, number> = {
  SCRUM: 9,
  KANB: 9,
  ..._initialIssueCounters.perProjectKey,
};
let _nextIssueId = _initialIssueCounters.nextId;
let _nextProjectId = 9;
let _nextSprintId = 4;
let _nextEpicId = 4;
let _nextFilterId = 4;
let _nextPlanId = 1;
let _nextCommentId = 8;
let _teams: Team[] = deepClone(initialTeams);
let _nextTeamId = 4;

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
  componentIds?: string[];
  fixVersionIds?: string[];
}): Result<Issue> {
  if (!fields.summary || String(fields.summary).trim() === "") {
    return { success: false, error: "Summary is required" };
  }
  if (fields.type !== undefined && !VALID_ISSUE_TYPE.has(fields.type)) {
    return { success: false, error: `Invalid type: ${fields.type}` };
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

  // Status must be a valid workflow state for the chosen project
  if (fields.status !== undefined && !project.workflow.includes(fields.status)) {
    return {
      success: false,
      error: `Invalid status '${fields.status}' for project ${project.key}. Valid workflow states: ${project.workflow.join(", ")}.`,
    };
  }

  const projectKey = project.key;
  if (!_nextIssueCounters[projectKey]) {
    _nextIssueCounters[projectKey] = 1;
  }
  // Skip any per-project key that's already used (defensive — counter
  // should already be ahead, but guard against stale state).
  while (_issues.some((i) => i.key === `${projectKey}-${_nextIssueCounters[projectKey]}`)) {
    _nextIssueCounters[projectKey]++;
  }
  const issueKey = `${projectKey}-${_nextIssueCounters[projectKey]++}`;
  // Same defensive guard for global issue id.
  while (_issues.some((i) => i.id === `iss-${_nextIssueId}`)) {
    _nextIssueId++;
  }
  const issueId = `iss-${_nextIssueId++}`;
  const timestamp = now();

  const issue: Issue = {
    id: issueId,
    key: issueKey,
    summary: fields.summary.trim(),
    description: fields.description ?? "",
    type: fields.type ?? "task",
    status: fields.status ?? "Open",
    priority: fields.priority ?? "medium",
    assigneeId: fields.assigneeId ?? null,
    reporterId: fields.reporterId ?? "usr-1",
    sprintId: fields.sprintId ?? null,
    epicId: fields.epicId ?? null,
    projectId,
    storyPoints: fields.storyPoints ?? null,
    labels: fields.labels ?? [],
    componentIds: fields.componentIds ?? [],
    fixVersionIds: fields.fixVersionIds ?? [],
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
    if (!isValidStatusForProject(issue.projectId, fields.status)) {
      const project = _projects.find((p) => p.id === issue.projectId);
      return {
        success: false,
        error: `Invalid status '${fields.status}' for project ${project?.key ?? issue.projectId}. Valid workflow states: ${project?.workflow.join(", ") ?? "(unknown)"}.`,
      };
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

  if (!isValidStatusForProject(issue.projectId, newStatus)) {
    const project = _projects.find((p) => p.id === issue.projectId);
    return {
      success: false,
      error: `Invalid status '${newStatus}' for project ${project?.key ?? issue.projectId}. Valid workflow states: ${project?.workflow.join(", ") ?? "(unknown)"}.`,
    };
  }

  issue.status = newStatus;
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
    workflow: fields.type === "kanban" ? ["To Do", "In Progress", "Done"] : ["Open", "In Development", "Code Review", "QA", "Done"],
    teamManaged: false,
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

export function startSprint(id: string, opts?: { name?: string; goal?: string; durationWeeks?: number }): Result<Sprint> {
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

  if (opts?.name) sprint.name = opts.name;
  if (opts?.goal !== undefined) sprint.goal = opts.goal;
  sprint.state = "active";
  sprint.startDate = today();
  const weeks = opts?.durationWeeks && opts.durationWeeks > 0 ? opts.durationWeeks : 2;
  const end = new Date();
  end.setDate(end.getDate() + weeks * 7);
  sprint.endDate = end.toISOString().slice(0, 10);
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

  // Move incomplete issues to backlog
  for (const issue of _issues) {
    if (issue.sprintId === id && issue.status !== "done") {
      issue.sprintId = null;
      issue.updatedAt = now();
    }
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
// Goals
// ---------------------------------------------------------------------------

export function getGoals(): Goal[] {
  return deepClone(_goals);
}

export function createGoal(fields: {
  name?: string;
  status?: Goal["status"];
  progress?: number;
  targetDate?: string;
  owner?: string;
  team?: string;
}): Result<Goal> {
  if (!fields.name || String(fields.name).trim() === "") {
    return { success: false, error: "Name is required" };
  }
  const goal: Goal = {
    id: `goal-${_nextGoalId++}`,
    name: String(fields.name).trim(),
    status: fields.status ?? "PENDING",
    progress: fields.progress ?? 0,
    targetDate: fields.targetDate ?? "",
    owner: fields.owner ?? "usr-1",
    team: fields.team ?? "Engineering",
    following: true,
    createdAt: now(),
  };
  _goals.push(goal);
  return { success: true, data: deepClone(goal) };
}

export function updateGoal(id: string, fields: {
  name?: string;
  status?: Goal["status"];
  progress?: number;
  targetDate?: string;
  owner?: string;
  team?: string;
  following?: boolean;
}): Result<Goal> {
  const goal = _goals.find((g) => g.id === id);
  if (!goal) return { success: false, error: "Goal not found" };
  if (fields.name !== undefined) goal.name = fields.name;
  if (fields.status !== undefined) goal.status = fields.status;
  if (fields.progress !== undefined) goal.progress = fields.progress;
  if (fields.targetDate !== undefined) goal.targetDate = fields.targetDate;
  if (fields.owner !== undefined) goal.owner = fields.owner;
  if (fields.team !== undefined) goal.team = fields.team;
  if (fields.following !== undefined) goal.following = fields.following;
  return { success: true, data: deepClone(goal) };
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

  if (fields.status !== undefined && !isValidStatusForProject(projectId, fields.status)) {
    return {
      success: false,
      error: `Invalid status '${fields.status}' for project ${project.key}. Valid workflow states: ${project.workflow.join(", ")}.`,
    };
  }

  const epicId = _nextEpicId++;
  const epic: Epic = {
    id: `epic-${epicId}`,
    key: `${project.key}-E${epicId}`,
    name: fields.name.trim(),
    summary: fields.summary ?? "",
    projectId,
    status: fields.status ?? "Open",
    fixVersionId: null,
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
    if (!isValidStatusForProject(epic.projectId, fields.status)) {
      const project = _projects.find((p) => p.id === epic.projectId);
      return {
        success: false,
        error: `Invalid status '${fields.status}' for project ${project?.key ?? epic.projectId}. Valid workflow states: ${project?.workflow.join(", ") ?? "(unknown)"}.`,
      };
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
    sharedWith: "all",
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
// Comments
// ---------------------------------------------------------------------------

export function getCommentsByIssue(issueId: string): Comment[] {
  return deepClone(_comments.filter((c) => c.issueId === issueId));
}

export function createComment(fields: { issueId: string; authorId: string; body: string }): Result<Comment> {
  if (!fields.body?.trim()) return { success: false, error: "Comment body is required" };
  if (!fields.issueId) return { success: false, error: "issueId is required" };
  const comment: Comment = {
    id: `cmt-${_nextCommentId++}`,
    issueId: fields.issueId,
    authorId: fields.authorId || "usr-1",
    body: fields.body.trim(),
    createdAt: now(),
    updatedAt: now(),
  };
  _comments.push(comment);
  return { success: true, data: deepClone(comment) };
}

export function updateComment(id: string, fields: { body?: string }): Result<Comment> {
  const comment = _comments.find((c) => c.id === id);
  if (!comment) return { success: false, error: "Comment not found" };
  if (fields.body !== undefined) {
    if (!fields.body.trim()) return { success: false, error: "Comment body cannot be empty" };
    comment.body = fields.body.trim();
  }
  comment.updatedAt = now();
  return { success: true, data: deepClone(comment) };
}

export function deleteComment(id: string): Result<void> {
  const idx = _comments.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false, error: "Comment not found" };
  _comments.splice(idx, 1);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Issue History
// ---------------------------------------------------------------------------

export function getHistoryByIssue(issueId: string): IssueHistoryEntry[] {
  return deepClone(_history.filter((h) => h.issueId === issueId));
}

export function addHistoryEntry(fields: {
  issueId: string; authorId: string; field: string; oldValue: string | null; newValue: string | null;
}): IssueHistoryEntry {
  const entry: IssueHistoryEntry = {
    id: `hist-${_nextHistoryId++}`,
    issueId: fields.issueId,
    authorId: fields.authorId,
    field: fields.field,
    oldValue: fields.oldValue,
    newValue: fields.newValue,
    createdAt: now(),
  };
  _history.push(entry);
  return deepClone(entry);
}

// ---------------------------------------------------------------------------
// Reset — restores everything to initial state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Teams CRUD
// ---------------------------------------------------------------------------

export function getTeams(): Team[] { return deepClone(_teams); }

export function createTeam(fields: { name: string; description?: string }): Result<Team> {
  if (!fields.name?.trim()) return { success: false, error: "Team name is required." };
  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-orange-500", "bg-teal-500", "bg-red-500", "bg-indigo-500"];
  const team: Team = {
    id: `team-${_nextTeamId++}`,
    name: fields.name.trim(),
    description: fields.description?.trim() ?? "",
    members: 1,
    color: colors[(_nextTeamId - 1) % colors.length],
    createdAt: now(),
  };
  _teams.push(team);
  return { success: true, data: deepClone(team) };
}

export function reset(seed?: number): void {
  _users = deepClone(initialUsers);
  _projects = deepClone(initialProjects);
  _sprints = deepClone(initialSprints);
  _epics = deepClone(initialEpics);
  _issues = deepClone(initialIssues);
  _boards = deepClone(initialBoards);
  _filters = deepClone(initialFilters);
  _plans = [];
  _teams = deepClone(initialTeams);
  _nextTeamId = 4;
  _comments = deepClone(initialComments);
  _history = deepClone(initialHistory);

  const derived = deriveIssueCounters(_issues);
  _nextIssueCounters = { SCRUM: 19, KANB: 9, ...derived.perProjectKey };
  _nextIssueId = derived.nextId;
  _nextProjectId = 9;
  _nextSprintId = 4;
  _nextEpicId = 4;
  _nextFilterId = 4;
  _nextPlanId = 1;
  _nextCommentId = 8;
  _nextHistoryId = 9;

  // Deterministic timestamps when seed is provided
  if (seed !== undefined) {
    const base = new Date("2026-06-01T12:00:00.000Z");
    base.setMinutes(base.getMinutes() + (seed % 1440));
    _dateOverride = base.toISOString();
  } else {
    _dateOverride = null;
  }
  _dateCounter = 0;
}
