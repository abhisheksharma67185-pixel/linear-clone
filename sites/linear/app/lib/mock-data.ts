// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Member {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "member";
}

export interface Team {
  [key: string]: unknown;
  id: string;
  name: string;
  key: string;
  description: string;
  leadId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Project {
  [key: string]: unknown;
  id: string;
  name: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  leadId: string;
  teamId: string;
  targetDate: string | null;
  createdAt: string;
}

export interface Issue {
  [key: string]: unknown;
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in_progress" | "done" | "cancelled";
  priority: "urgent" | "high" | "medium" | "low" | "none";
  assigneeId: string | null;
  creatorId: string;
  teamId: string;
  projectId: string | null;
  cycleId: string | null;
  labelIds: string[];
  estimate: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Cycle {
  [key: string]: unknown;
  id: string;
  name: string;
  description: string;
  teamId: string;
  startDate: string;
  endDate: string;
  state: "active" | "upcoming" | "completed";
}

export interface Label {
  [key: string]: unknown;
  id: string;
  name: string;
  color: string;
  teamId: string;
}

export interface View {
  [key: string]: unknown;
  id: string;
  name: string;
  description: string;
  filterQuery: string;
  ownerId: string;
  teamId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const members: Member[] = [
  {
    id: "usr-1",
    name: "Alex Johnson",
    email: "alex@company.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
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

export const teams: Team[] = [
  {
    id: "team-1",
    name: "Engineering",
    key: "ENG",
    description: "Core engineering team building the platform.",
    leadId: "usr-1",
    memberIds: ["usr-1", "usr-2", "usr-3", "usr-4"],
    createdAt: "2025-01-10T09:00:00.000Z",
  },
  {
    id: "team-2",
    name: "Design",
    key: "DES",
    description: "Product design and user experience team.",
    leadId: "usr-2",
    memberIds: ["usr-2", "usr-4"],
    createdAt: "2025-01-15T10:00:00.000Z",
  },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Auth System",
    description: "Complete authentication and authorization system with SSO and MFA.",
    status: "in_progress",
    leadId: "usr-1",
    teamId: "team-1",
    targetDate: "2025-06-30",
    createdAt: "2025-02-01T09:00:00.000Z",
  },
  {
    id: "proj-2",
    name: "Design System",
    description: "Unified component library and design tokens for all products.",
    status: "planned",
    leadId: "usr-2",
    teamId: "team-2",
    targetDate: "2025-09-01",
    createdAt: "2025-03-01T10:00:00.000Z",
  },
];

export const cycles: Cycle[] = [
  {
    id: "cycle-1",
    name: "Cycle 12",
    description: "Wrap up user profile features",
    teamId: "team-1",
    startDate: "2025-04-01",
    endDate: "2025-04-14",
    state: "completed",
  },
  {
    id: "cycle-2",
    name: "Cycle 13",
    description: "Complete auth module",
    teamId: "team-1",
    startDate: "2025-04-15",
    endDate: "2025-04-28",
    state: "active",
  },
  {
    id: "cycle-3",
    name: "Cycle 14",
    description: "Dashboard improvements",
    teamId: "team-1",
    startDate: "2025-04-29",
    endDate: "2025-05-12",
    state: "upcoming",
  },
];

export const labels: Label[] = [
  { id: "label-1", name: "bug", color: "#ef4444", teamId: "team-1" },
  { id: "label-2", name: "feature", color: "#3b82f6", teamId: "team-1" },
  { id: "label-3", name: "improvement", color: "#22c55e", teamId: "team-1" },
  { id: "label-4", name: "documentation", color: "#eab308", teamId: "team-2" },
  { id: "label-5", name: "design", color: "#a855f7", teamId: "team-2" },
  { id: "label-6", name: "performance", color: "#f97316", teamId: "team-1" },
];

export const issues: Issue[] = [
  // ENG issues (ENG-1 to ENG-18)
  {
    id: "iss-1",
    identifier: "ENG-1",
    title: "Implement login page",
    description: "Create the main login page with email/password form.",
    status: "done",
    priority: "high",
    assigneeId: "usr-1",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-1",
    labelIds: ["label-2"],
    estimate: 5,
    dueDate: null,
    createdAt: "2025-03-01T10:00:00.000Z",
    updatedAt: "2025-04-10T15:30:00.000Z",
  },
  {
    id: "iss-2",
    identifier: "ENG-2",
    title: "Add OAuth2 integration",
    description: "Integrate Google and GitHub OAuth2 providers.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-3",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: ["label-2"],
    estimate: 8,
    dueDate: "2025-04-25",
    createdAt: "2025-03-05T11:00:00.000Z",
    updatedAt: "2025-04-16T09:00:00.000Z",
  },
  {
    id: "iss-3",
    identifier: "ENG-3",
    title: "Fix password reset email",
    description: "Password reset emails are not being sent to some users.",
    status: "in_progress",
    priority: "urgent",
    assigneeId: "usr-2",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: ["label-1"],
    estimate: 3,
    dueDate: "2025-04-20",
    createdAt: "2025-03-10T14:00:00.000Z",
    updatedAt: "2025-04-18T11:00:00.000Z",
  },
  {
    id: "iss-4",
    identifier: "ENG-4",
    title: "Create session management service",
    description: "Build a service to handle user sessions and token refresh.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-1",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: ["label-2"],
    estimate: 5,
    dueDate: null,
    createdAt: "2025-03-12T09:00:00.000Z",
    updatedAt: "2025-03-12T09:00:00.000Z",
  },
  {
    id: "iss-5",
    identifier: "ENG-5",
    title: "Add MFA support",
    description: "Implement multi-factor authentication with TOTP.",
    status: "todo",
    priority: "high",
    assigneeId: null,
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: ["label-2"],
    estimate: 8,
    dueDate: null,
    createdAt: "2025-03-15T10:00:00.000Z",
    updatedAt: "2025-03-15T10:00:00.000Z",
  },
  {
    id: "iss-6",
    identifier: "ENG-6",
    title: "Write auth API documentation",
    description: "Document all authentication API endpoints.",
    status: "backlog",
    priority: "low",
    assigneeId: "usr-4",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: ["label-4"],
    estimate: 2,
    dueDate: null,
    createdAt: "2025-03-18T08:00:00.000Z",
    updatedAt: "2025-03-18T08:00:00.000Z",
  },
  {
    id: "iss-7",
    identifier: "ENG-7",
    title: "Design dashboard wireframes",
    description: "Create wireframes for the new dashboard layout.",
    status: "done",
    priority: "medium",
    assigneeId: "usr-4",
    creatorId: "usr-2",
    teamId: "team-1",
    projectId: null,
    cycleId: "cycle-1",
    labelIds: ["label-5"],
    estimate: 3,
    dueDate: null,
    createdAt: "2025-03-20T09:00:00.000Z",
    updatedAt: "2025-04-12T16:00:00.000Z",
  },
  {
    id: "iss-8",
    identifier: "ENG-8",
    title: "Implement dashboard widget framework",
    description: "Build the framework for pluggable dashboard widgets.",
    status: "backlog",
    priority: "medium",
    assigneeId: "usr-3",
    creatorId: "usr-2",
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds: ["label-2"],
    estimate: 13,
    dueDate: null,
    createdAt: "2025-03-22T10:00:00.000Z",
    updatedAt: "2025-03-22T10:00:00.000Z",
  },
  {
    id: "iss-9",
    identifier: "ENG-9",
    title: "Fix navigation breadcrumb bug",
    description: "Breadcrumbs show wrong path on nested pages.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "usr-2",
    creatorId: "usr-4",
    teamId: "team-1",
    projectId: null,
    cycleId: "cycle-2",
    labelIds: ["label-1"],
    estimate: 2,
    dueDate: null,
    createdAt: "2025-03-25T11:00:00.000Z",
    updatedAt: "2025-04-17T14:00:00.000Z",
  },
  {
    id: "iss-10",
    identifier: "ENG-10",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment.",
    status: "done",
    priority: "high",
    assigneeId: "usr-1",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: null,
    cycleId: "cycle-1",
    labelIds: ["label-3"],
    estimate: 5,
    dueDate: null,
    createdAt: "2025-03-28T09:00:00.000Z",
    updatedAt: "2025-04-08T12:00:00.000Z",
  },
  {
    id: "iss-11",
    identifier: "ENG-11",
    title: "Add unit tests for auth module",
    description: "Write comprehensive unit tests for the authentication module.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "usr-3",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: ["label-3"],
    estimate: 5,
    dueDate: null,
    createdAt: "2025-04-01T10:00:00.000Z",
    updatedAt: "2025-04-16T10:00:00.000Z",
  },
  {
    id: "iss-12",
    identifier: "ENG-12",
    title: "Database migration for user roles",
    description: "Add role column to users table and migrate existing data.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-1",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: ["label-2"],
    estimate: 3,
    dueDate: "2025-04-22",
    createdAt: "2025-04-03T09:00:00.000Z",
    updatedAt: "2025-04-19T08:00:00.000Z",
  },
  {
    id: "iss-13",
    identifier: "ENG-13",
    title: "Refactor API error handling",
    description: "Standardize error responses across all API endpoints.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-2",
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds: ["label-3"],
    estimate: null,
    dueDate: null,
    createdAt: "2025-04-05T11:00:00.000Z",
    updatedAt: "2025-04-05T11:00:00.000Z",
  },
  {
    id: "iss-14",
    identifier: "ENG-14",
    title: "Implement rate limiting",
    description: "Add rate limiting middleware to protect API endpoints.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds: ["label-6"],
    estimate: null,
    dueDate: null,
    createdAt: "2025-04-07T10:00:00.000Z",
    updatedAt: "2025-04-07T10:00:00.000Z",
  },
  {
    id: "iss-15",
    identifier: "ENG-15",
    title: "Fix login button alignment",
    description: "Login button is misaligned on mobile devices.",
    status: "todo",
    priority: "low",
    assigneeId: "usr-4",
    creatorId: "usr-2",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: ["label-1"],
    estimate: 1,
    dueDate: null,
    createdAt: "2025-04-09T15:00:00.000Z",
    updatedAt: "2025-04-09T15:00:00.000Z",
  },
  {
    id: "iss-16",
    identifier: "ENG-16",
    title: "Add loading skeletons",
    description: "Add skeleton loading states to dashboard components.",
    status: "backlog",
    priority: "none",
    assigneeId: "usr-4",
    creatorId: "usr-2",
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds: ["label-3"],
    estimate: 2,
    dueDate: null,
    createdAt: "2025-04-10T09:00:00.000Z",
    updatedAt: "2025-04-10T09:00:00.000Z",
  },
  {
    id: "iss-17",
    identifier: "ENG-17",
    title: "Security audit prep",
    description: "Prepare documentation and code for upcoming security audit.",
    status: "todo",
    priority: "high",
    assigneeId: "usr-1",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: null,
    cycleId: "cycle-3",
    labelIds: ["label-2"],
    estimate: 5,
    dueDate: "2025-05-10",
    createdAt: "2025-04-12T08:00:00.000Z",
    updatedAt: "2025-04-12T08:00:00.000Z",
  },
  {
    id: "iss-18",
    identifier: "ENG-18",
    title: "Optimize database queries",
    description: "Profile and optimize slow database queries in the dashboard.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-2",
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds: ["label-6"],
    estimate: null,
    dueDate: null,
    createdAt: "2025-04-14T10:00:00.000Z",
    updatedAt: "2025-04-14T10:00:00.000Z",
  },
  // DES issues (DES-1 to DES-7)
  {
    id: "iss-19",
    identifier: "DES-1",
    title: "Create color palette",
    description: "Define the primary and secondary color palettes for the design system.",
    status: "done",
    priority: "high",
    assigneeId: "usr-2",
    creatorId: "usr-2",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: ["label-5"],
    estimate: 3,
    dueDate: null,
    createdAt: "2025-03-01T09:00:00.000Z",
    updatedAt: "2025-03-20T14:00:00.000Z",
  },
  {
    id: "iss-20",
    identifier: "DES-2",
    title: "Design button components",
    description: "Create button component variants: primary, secondary, ghost, destructive.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-2",
    creatorId: "usr-2",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: ["label-5"],
    estimate: 5,
    dueDate: "2025-04-30",
    createdAt: "2025-03-05T10:00:00.000Z",
    updatedAt: "2025-04-15T11:00:00.000Z",
  },
  {
    id: "iss-21",
    identifier: "DES-3",
    title: "Typography scale",
    description: "Define typography scale and font families for the design system.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-4",
    creatorId: "usr-2",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: ["label-5"],
    estimate: 3,
    dueDate: null,
    createdAt: "2025-03-10T09:00:00.000Z",
    updatedAt: "2025-03-10T09:00:00.000Z",
  },
  {
    id: "iss-22",
    identifier: "DES-4",
    title: "Icon library audit",
    description: "Audit existing icons and plan the unified icon set.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-4",
    creatorId: "usr-2",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: ["label-4"],
    estimate: 2,
    dueDate: null,
    createdAt: "2025-03-15T11:00:00.000Z",
    updatedAt: "2025-03-15T11:00:00.000Z",
  },
  {
    id: "iss-23",
    identifier: "DES-5",
    title: "Fix icon alignment in sidebar",
    description: "Icons in the sidebar navigation are not vertically centered.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: null,
    cycleId: null,
    labelIds: ["label-1"],
    estimate: 1,
    dueDate: null,
    createdAt: "2025-03-20T14:00:00.000Z",
    updatedAt: "2025-03-20T14:00:00.000Z",
  },
  {
    id: "iss-24",
    identifier: "DES-6",
    title: "Spacing and layout tokens",
    description: "Define spacing scale and layout grid tokens.",
    status: "backlog",
    priority: "medium",
    assigneeId: "usr-2",
    creatorId: "usr-2",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: ["label-5"],
    estimate: 5,
    dueDate: null,
    createdAt: "2025-03-25T10:00:00.000Z",
    updatedAt: "2025-03-25T10:00:00.000Z",
  },
  {
    id: "iss-25",
    identifier: "DES-7",
    title: "Document design principles",
    description: "Write documentation for core design principles and usage guidelines.",
    status: "cancelled",
    priority: "low",
    assigneeId: "usr-4",
    creatorId: "usr-2",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: ["label-4"],
    estimate: 3,
    dueDate: null,
    createdAt: "2025-04-01T09:00:00.000Z",
    updatedAt: "2025-04-10T13:00:00.000Z",
  },
];

export const views: View[] = [
  {
    id: "view-1",
    name: "My Active Issues",
    description: "All issues assigned to me that are in progress.",
    filterQuery: "assignee = currentUser() AND status = in_progress",
    ownerId: "usr-1",
    teamId: "team-1",
    createdAt: "2025-03-01T09:00:00.000Z",
  },
  {
    id: "view-2",
    name: "Current Cycle Bugs",
    description: "All bug issues in the active cycle.",
    filterQuery: "label = bug AND cycle = activeCycle()",
    ownerId: "usr-1",
    teamId: "team-1",
    createdAt: "2025-03-10T10:00:00.000Z",
  },
  {
    id: "view-3",
    name: "Unassigned Issues",
    description: "All issues without an assignee.",
    filterQuery: "assignee is EMPTY",
    ownerId: "usr-2",
    teamId: "team-1",
    createdAt: "2025-03-15T11:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export const dashboardStats = {
  totalIssues: issues.length,
  backlogIssues: issues.filter((i) => i.status === "backlog").length,
  todoIssues: issues.filter((i) => i.status === "todo").length,
  inProgressIssues: issues.filter((i) => i.status === "in_progress").length,
  doneIssues: issues.filter((i) => i.status === "done").length,
  cancelledIssues: issues.filter((i) => i.status === "cancelled").length,
  unassignedIssues: issues.filter((i) => i.assigneeId === null).length,
  activeCycles: cycles.filter((c) => c.state === "active").length,
  totalProjects: projects.length,
  totalTeams: teams.length,
};
