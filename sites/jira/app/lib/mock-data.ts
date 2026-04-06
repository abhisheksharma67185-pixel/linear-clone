// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "member";
}

export interface Project {
  [key: string]: unknown;
  id: string;
  key: string;
  name: string;
  lead: string;
  type: "scrum" | "kanban";
  description: string;
  createdAt: string;
}

export interface Sprint {
  [key: string]: unknown;
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  goal: string;
  state: "active" | "closed" | "future";
}

export interface Epic {
  [key: string]: unknown;
  id: string;
  name: string;
  summary: string;
  projectId: string;
  status: "to_do" | "in_progress" | "done";
}

export interface Issue {
  [key: string]: unknown;
  id: string;
  key: string;
  summary: string;
  description: string;
  type: "story" | "task" | "bug" | "subtask";
  status: "to_do" | "in_progress" | "in_review" | "done";
  priority: "highest" | "high" | "medium" | "low" | "lowest";
  assigneeId: string | null;
  reporterId: string;
  sprintId: string | null;
  epicId: string | null;
  projectId: string;
  storyPoints: number | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  [key: string]: unknown;
  id: string;
  name: string;
  projectId: string;
  type: "scrum" | "kanban";
  columns: { name: string; statuses: string[] }[];
}

export interface SavedFilter {
  [key: string]: unknown;
  id: string;
  name: string;
  jql: string;
  owner: string;
  createdAt: string;
}

export interface Plan {
  [key: string]: unknown;
  id: string;
  name: string;
  access: "open" | "private" | "team";
  workSources: { type: "space" | "board" | "filter"; name: string }[];
  owner: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const users: User[] = [
  {
    id: "usr-1",
    name: "Abhishek Sharma",
    email: "abhishek@company.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=abhishek",
    role: "admin",
  },
  {
    id: "usr-2",
    name: "Sam Williams",
    email: "sam@company.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    role: "member",
  },
  {
    id: "usr-3",
    name: "Jordan Lee",
    email: "jordan@company.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    role: "member",
  },
  {
    id: "usr-4",
    name: "Taylor Brown",
    email: "taylor@company.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
    role: "member",
  },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    key: "SCRUM",
    name: "My Scrum Project",
    lead: "usr-1",
    type: "scrum",
    description: "Your first project",
    createdAt: "2025-01-15T09:00:00.000Z",
  },
];

export const sprints: Sprint[] = [
  {
    id: "sprint-1",
    name: "Sprint 12",
    projectId: "proj-1",
    startDate: "2025-04-01",
    endDate: "2025-04-14",
    goal: "Wrap up user profile features",
    state: "closed",
  },
  {
    id: "sprint-2",
    name: "Sprint 13",
    projectId: "proj-1",
    startDate: "2025-04-15",
    endDate: "2025-04-28",
    goal: "Complete auth module",
    state: "active",
  },
  {
    id: "sprint-3",
    name: "Sprint 14",
    projectId: "proj-1",
    startDate: "2025-04-29",
    endDate: "2025-05-12",
    goal: "Dashboard improvements",
    state: "future",
  },
];

export const epics: Epic[] = [
  {
    id: "epic-1",
    name: "User Authentication",
    summary: "Implement full authentication flow including SSO, MFA, and password reset.",
    projectId: "proj-1",
    status: "in_progress",
  },
  {
    id: "epic-2",
    name: "Dashboard Redesign",
    summary: "Redesign the main dashboard with new widgets and analytics.",
    projectId: "proj-1",
    status: "to_do",
  },
];

export const issues: Issue[] = [
  // SCRUM issues (SCRUM-1 to SCRUM-18)
  {
    id: "iss-1",
    key: "SCRUM-1",
    summary: "Implement login page",
    description: "Create the main login page with email/password form.",
    type: "story",
    status: "done",
    priority: "high",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: "sprint-1",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 5,
    labels: ["frontend"],
    createdAt: "2025-03-01T10:00:00.000Z",
    updatedAt: "2025-04-10T15:30:00.000Z",
  },
  {
    id: "iss-2",
    key: "SCRUM-2",
    summary: "Add OAuth2 integration",
    description: "Integrate Google and GitHub OAuth2 providers.",
    type: "story",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 8,
    labels: ["backend", "auth"],
    createdAt: "2025-03-05T11:00:00.000Z",
    updatedAt: "2025-04-16T09:00:00.000Z",
  },
  {
    id: "iss-3",
    key: "SCRUM-3",
    summary: "Fix password reset email",
    description: "Password reset emails are not being sent to some users.",
    type: "bug",
    status: "in_review",
    priority: "highest",
    assigneeId: "usr-2",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 3,
    labels: ["bug", "auth"],
    createdAt: "2025-03-10T14:00:00.000Z",
    updatedAt: "2025-04-18T11:00:00.000Z",
  },
  {
    id: "iss-4",
    key: "SCRUM-4",
    summary: "Create session management service",
    description: "Build a service to handle user sessions and token refresh.",
    type: "task",
    status: "to_do",
    priority: "medium",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 5,
    labels: ["backend"],
    createdAt: "2025-03-12T09:00:00.000Z",
    updatedAt: "2025-03-12T09:00:00.000Z",
  },
  {
    id: "iss-5",
    key: "SCRUM-5",
    summary: "Add MFA support",
    description: "Implement multi-factor authentication with TOTP.",
    type: "story",
    status: "to_do",
    priority: "high",
    assigneeId: null,
    reporterId: "usr-1",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 8,
    labels: ["backend", "auth"],
    createdAt: "2025-03-15T10:00:00.000Z",
    updatedAt: "2025-03-15T10:00:00.000Z",
  },
  {
    id: "iss-6",
    key: "SCRUM-6",
    summary: "Write auth API documentation",
    description: "Document all authentication API endpoints.",
    type: "task",
    status: "to_do",
    priority: "low",
    assigneeId: "usr-4",
    reporterId: "usr-1",
    sprintId: null,
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 2,
    labels: ["docs"],
    createdAt: "2025-03-18T08:00:00.000Z",
    updatedAt: "2025-03-18T08:00:00.000Z",
  },
  {
    id: "iss-7",
    key: "SCRUM-7",
    summary: "Design dashboard wireframes",
    description: "Create wireframes for the new dashboard layout.",
    type: "task",
    status: "done",
    priority: "medium",
    assigneeId: "usr-4",
    reporterId: "usr-2",
    sprintId: "sprint-1",
    epicId: "epic-2",
    projectId: "proj-1",
    storyPoints: 3,
    labels: ["design"],
    createdAt: "2025-03-20T09:00:00.000Z",
    updatedAt: "2025-04-12T16:00:00.000Z",
  },
  {
    id: "iss-8",
    key: "SCRUM-8",
    summary: "Implement dashboard widget framework",
    description: "Build the framework for pluggable dashboard widgets.",
    type: "story",
    status: "to_do",
    priority: "medium",
    assigneeId: "usr-3",
    reporterId: "usr-2",
    sprintId: null,
    epicId: "epic-2",
    projectId: "proj-1",
    storyPoints: 13,
    labels: ["frontend"],
    createdAt: "2025-03-22T10:00:00.000Z",
    updatedAt: "2025-03-22T10:00:00.000Z",
  },
  {
    id: "iss-9",
    key: "SCRUM-9",
    summary: "Fix navigation breadcrumb bug",
    description: "Breadcrumbs show wrong path on nested pages.",
    type: "bug",
    status: "in_progress",
    priority: "medium",
    assigneeId: "usr-2",
    reporterId: "usr-4",
    sprintId: "sprint-2",
    epicId: null,
    projectId: "proj-1",
    storyPoints: 2,
    labels: ["bug", "frontend"],
    createdAt: "2025-03-25T11:00:00.000Z",
    updatedAt: "2025-04-17T14:00:00.000Z",
  },
  {
    id: "iss-10",
    key: "SCRUM-10",
    summary: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment.",
    type: "task",
    status: "done",
    priority: "high",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: "sprint-1",
    epicId: null,
    projectId: "proj-1",
    storyPoints: 5,
    labels: ["devops"],
    createdAt: "2025-03-28T09:00:00.000Z",
    updatedAt: "2025-04-08T12:00:00.000Z",
  },
  {
    id: "iss-11",
    key: "SCRUM-11",
    summary: "Add unit tests for auth module",
    description: "Write comprehensive unit tests for the authentication module.",
    type: "task",
    status: "in_progress",
    priority: "medium",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 5,
    labels: ["testing"],
    createdAt: "2025-04-01T10:00:00.000Z",
    updatedAt: "2025-04-16T10:00:00.000Z",
  },
  {
    id: "iss-12",
    key: "SCRUM-12",
    summary: "Database migration for user roles",
    description: "Add role column to users table and migrate existing data.",
    type: "task",
    status: "in_review",
    priority: "high",
    assigneeId: "usr-1",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 3,
    labels: ["backend", "database"],
    createdAt: "2025-04-03T09:00:00.000Z",
    updatedAt: "2025-04-19T08:00:00.000Z",
  },
  {
    id: "iss-13",
    key: "SCRUM-13",
    summary: "Refactor API error handling",
    description: "Standardize error responses across all API endpoints.",
    type: "task",
    status: "to_do",
    priority: "low",
    assigneeId: null,
    reporterId: "usr-2",
    sprintId: null,
    epicId: null,
    projectId: "proj-1",
    storyPoints: null,
    labels: ["backend"],
    createdAt: "2025-04-05T11:00:00.000Z",
    updatedAt: "2025-04-05T11:00:00.000Z",
  },
  {
    id: "iss-14",
    key: "SCRUM-14",
    summary: "Implement rate limiting",
    description: "Add rate limiting middleware to protect API endpoints.",
    type: "story",
    status: "to_do",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-1",
    storyPoints: null,
    labels: ["backend", "security"],
    createdAt: "2025-04-07T10:00:00.000Z",
    updatedAt: "2025-04-07T10:00:00.000Z",
  },
  {
    id: "iss-15",
    key: "SCRUM-15",
    summary: "Fix login button alignment",
    description: "Login button is misaligned on mobile devices.",
    type: "bug",
    status: "to_do",
    priority: "low",
    assigneeId: "usr-4",
    reporterId: "usr-2",
    sprintId: null,
    epicId: "epic-1",
    projectId: "proj-1",
    storyPoints: 1,
    labels: ["bug", "frontend"],
    createdAt: "2025-04-09T15:00:00.000Z",
    updatedAt: "2025-04-09T15:00:00.000Z",
  },
  {
    id: "iss-16",
    key: "SCRUM-16",
    summary: "Add loading skeletons",
    description: "Add skeleton loading states to dashboard components.",
    type: "subtask",
    status: "to_do",
    priority: "lowest",
    assigneeId: "usr-4",
    reporterId: "usr-2",
    sprintId: null,
    epicId: "epic-2",
    projectId: "proj-1",
    storyPoints: 2,
    labels: ["frontend"],
    createdAt: "2025-04-10T09:00:00.000Z",
    updatedAt: "2025-04-10T09:00:00.000Z",
  },
  {
    id: "iss-17",
    key: "SCRUM-17",
    summary: "Security audit prep",
    description: "Prepare documentation and code for upcoming security audit.",
    type: "task",
    status: "to_do",
    priority: "high",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: "sprint-3",
    epicId: null,
    projectId: "proj-1",
    storyPoints: 5,
    labels: ["security"],
    createdAt: "2025-04-12T08:00:00.000Z",
    updatedAt: "2025-04-12T08:00:00.000Z",
  },
  {
    id: "iss-18",
    key: "SCRUM-18",
    summary: "Update onboarding flow",
    description: "Revamp the new user onboarding experience.",
    type: "story",
    status: "to_do",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-2",
    sprintId: null,
    epicId: null,
    projectId: "proj-1",
    storyPoints: null,
    labels: ["frontend", "ux"],
    createdAt: "2025-04-14T10:00:00.000Z",
    updatedAt: "2025-04-14T10:00:00.000Z",
  },
];

export const boards: Board[] = [
  {
    id: "board-1",
    name: "SCRUM Board",
    projectId: "proj-1",
    type: "scrum",
    columns: [
      { name: "Backlog", statuses: ["to_do"] },
      { name: "To Do", statuses: ["to_do"] },
      { name: "In Progress", statuses: ["in_progress"] },
      { name: "In Review", statuses: ["in_review"] },
      { name: "Done", statuses: ["done"] },
    ],
  },
];

export const filters: SavedFilter[] = [
  {
    id: "filter-1",
    name: "My Open Issues",
    jql: "assignee = currentUser() AND status != Done",
    owner: "usr-1",
    createdAt: "2025-03-01T09:00:00.000Z",
  },
  {
    id: "filter-2",
    name: "Sprint Bugs",
    jql: "type = Bug AND sprint in openSprints()",
    owner: "usr-1",
    createdAt: "2025-03-10T10:00:00.000Z",
  },
  {
    id: "filter-3",
    name: "Unassigned Tasks",
    jql: "assignee is EMPTY AND type = Task",
    owner: "usr-2",
    createdAt: "2025-03-15T11:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export const dashboardStats = {
  totalIssues: issues.length,
  openIssues: issues.filter((i) => i.status !== "done").length,
  inProgressIssues: issues.filter((i) => i.status === "in_progress").length,
  inReviewIssues: issues.filter((i) => i.status === "in_review").length,
  doneIssues: issues.filter((i) => i.status === "done").length,
  unassignedIssues: issues.filter((i) => i.assigneeId === null).length,
  activeSprints: sprints.filter((s) => s.state === "active").length,
  totalProjects: projects.length,
};
