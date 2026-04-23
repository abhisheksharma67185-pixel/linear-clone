// ---------------------------------------------------------------------------
// CESS Benchmark Seed Data — Jira (theta.atlassian.net)
// Anchor date: 2026-04-13 (benchmark day)
// Identity IDs are internal (usr-N, proj-N, iss-N). Display values (name,
// email, key, identifier) match the CESS spec exactly.
//
// Note: Issue.status is typed as `string` (not a union) to support per-project
// custom workflows (PLAT, LCRM, FAPP, MOB, DEVOPS, and Support projects each
// have their own state set). UI components that only render a fixed 4-state
// subset will still work — unknown statuses fall through badge styling.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  [key: string]: unknown
  id: string
  name: string
  displayName: string
  email: string
  avatar: string
  role: "admin" | "member"
  /** CESS cross-platform identity (JU001, etc.) */
  cessId: string
  groupIds: string[]
}

export interface Group {
  [key: string]: unknown
  id: string
  name: string
  description: string
}

export interface Project {
  [key: string]: unknown
  id: string
  key: string
  name: string
  lead: string
  type: "scrum" | "kanban"
  description: string
  createdAt: string
  /** Ordered list of workflow state names this project uses. */
  workflow: string[]
  /** Whether this project is team-managed (vs company-managed). */
  teamManaged: boolean
}

export interface Component {
  [key: string]: unknown
  id: string
  name: string
  projectId: string
  leadId: string
  defaultAssigneeId: string
}

export interface FixVersion {
  [key: string]: unknown
  id: string
  name: string
  projectId: string
  status: "released" | "unreleased"
  releaseDate: string | null
  description: string
}

export interface Sprint {
  [key: string]: unknown
  id: string
  name: string
  projectId: string
  startDate: string
  endDate: string
  goal: string
  state: "active" | "closed" | "future"
}

export interface Epic {
  [key: string]: unknown
  id: string
  key: string
  name: string
  summary: string
  projectId: string
  status: string
  fixVersionId: string | null
}

export interface Issue {
  [key: string]: unknown
  id: string
  key: string
  summary: string
  description: string
  type: "story" | "task" | "bug" | "subtask" | "epic"
  /** Per-project workflow state. Spec values vary per project. */
  status: string
  priority: "highest" | "high" | "medium" | "low" | "lowest"
  assigneeId: string | null
  reporterId: string
  sprintId: string | null
  epicId: string | null
  projectId: string
  storyPoints: number | null
  labels: string[]
  componentIds: string[]
  fixVersionIds: string[]
  createdAt: string
  updatedAt: string
}

export interface IssueLink {
  [key: string]: unknown
  id: string
  fromIssueId: string
  toIssueId: string
  type:
    | "blocks"
    | "is blocked by"
    | "relates to"
    | "is caused by"
    | "duplicates"
    | "is duplicated by"
}

export interface Board {
  [key: string]: unknown
  id: string
  name: string
  projectId: string
  type: "scrum" | "kanban"
  columns: { name: string; statuses: string[] }[]
}

export interface SavedFilter {
  [key: string]: unknown
  id: string
  name: string
  jql: string
  owner: string
  createdAt: string
  sharedWith: string
}

export interface CustomField {
  [key: string]: unknown
  id: string
  name: string
  type: "number" | "select" | "text" | "user" | "sprint" | "epicLink"
  options?: string[]
  appliedTo: "all" | string[] // "all" or project IDs
}

export interface AutomationRule {
  [key: string]: unknown
  id: string
  name: string
  trigger: string
  condition: string
  action: string
  enabled: boolean
}

export interface Dashboard {
  [key: string]: unknown
  id: string
  name: string
  ownerId: string
  gadgets: string[]
}

export interface Goal {
  [key: string]: unknown
  id: string
  name: string
  status:
    | "ON TRACK"
    | "AT RISK"
    | "OFF TRACK"
    | "PENDING"
    | "DONE"
    | "PAUSED"
    | "CANCELLED"
  progress: number
  targetDate: string
  owner: string
  team: string
  following: boolean
  createdAt: string
}

export interface Team {
  [key: string]: unknown
  id: string
  name: string
  description: string
  members: number
  color: string
  createdAt: string
}

export interface IssueHistoryEntry {
  [key: string]: unknown
  id: string
  issueId: string
  authorId: string
  field: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
}

export interface Comment {
  [key: string]: unknown
  id: string
  issueId: string
  authorId: string
  body: string
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Instance metadata
// ---------------------------------------------------------------------------

export const instance = {
  url: "https://theta.atlassian.net",
  license: "Jira Software Premium",
  defaultLanguage: "English",
}

// ---------------------------------------------------------------------------
// Groups — spec §4.3
// ---------------------------------------------------------------------------

export const groups: Group[] = [
  { id: "grp-1", name: "jira-admins", description: "Full admin access" },
  { id: "grp-2", name: "engineering", description: "Engineering org" },
  { id: "grp-3", name: "backend", description: "Backend engineers" },
  { id: "grp-4", name: "frontend", description: "Frontend engineers" },
  { id: "grp-5", name: "devops", description: "DevOps" },
  { id: "grp-6", name: "qa", description: "QA team" },
  { id: "grp-7", name: "design", description: "Design team" },
  { id: "grp-8", name: "product", description: "Product team" },
  { id: "grp-9", name: "support", description: "Support" },
  { id: "grp-10", name: "cs-team", description: "Customer success" },
  { id: "grp-11", name: "release-managers", description: "Release management" },
]

// ---------------------------------------------------------------------------
// Users — spec §4.2 (20 users, JU001..JU020)
// ---------------------------------------------------------------------------

export const users: User[] = [
  {
    id: "usr-1",
    cessId: "JU001",
    name: "Priya Sharma",
    displayName: "Priya Sharma",
    email: "priya@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    role: "admin",
    groupIds: ["grp-1", "grp-2"],
  },
  {
    id: "usr-2",
    cessId: "JU002",
    name: "Arjun Mehta",
    displayName: "Arjun Mehta",
    email: "arjun@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    role: "admin",
    groupIds: ["grp-1", "grp-2", "grp-11"],
  },
  {
    id: "usr-3",
    cessId: "JU003",
    name: "Ravi Kumar",
    displayName: "Ravi Kumar",
    email: "ravi@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ravi",
    role: "member",
    groupIds: ["grp-2", "grp-3"],
  },
  {
    id: "usr-4",
    cessId: "JU004",
    name: "Sneha Reddy",
    displayName: "Sneha Reddy",
    email: "sneha@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",
    role: "member",
    groupIds: ["grp-2", "grp-4"],
  },
  {
    id: "usr-5",
    cessId: "JU005",
    name: "Kiran Patel",
    displayName: "Kiran Patel",
    email: "kiran@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kiran",
    role: "member",
    groupIds: ["grp-2", "grp-3"],
  },
  {
    id: "usr-6",
    cessId: "JU006",
    name: "Ananya Iyer",
    displayName: "Ananya Iyer",
    email: "ananya@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya",
    role: "member",
    groupIds: ["grp-2", "grp-4"],
  },
  {
    id: "usr-7",
    cessId: "JU007",
    name: "Vikram Singh",
    displayName: "Vikram Singh",
    email: "vikram@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    role: "member",
    groupIds: ["grp-2", "grp-5"],
  },
  {
    id: "usr-8",
    cessId: "JU008",
    name: "Meera Nair",
    displayName: "Meera Nair",
    email: "meera@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=meera",
    role: "member",
    groupIds: ["grp-2", "grp-6"],
  },
  {
    id: "usr-9",
    cessId: "JU009",
    name: "Rohan Das",
    displayName: "Rohan Das",
    email: "rohan@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rohan",
    role: "member",
    groupIds: ["grp-2", "grp-6"],
  },
  {
    id: "usr-10",
    cessId: "JU010",
    name: "Aisha Khan",
    displayName: "Aisha Khan",
    email: "aisha@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha",
    role: "member",
    groupIds: ["grp-8"],
  },
  {
    id: "usr-11",
    cessId: "JU011",
    name: "Nikhil Joshi",
    displayName: "Nikhil Joshi",
    email: "nikhil@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nikhil",
    role: "member",
    groupIds: ["grp-2", "grp-7"],
  },
  {
    id: "usr-12",
    cessId: "JU012",
    name: "Amit Verma",
    displayName: "Amit Verma",
    email: "amit@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    role: "member",
    groupIds: ["grp-2", "grp-3"],
  },
  {
    id: "usr-13",
    cessId: "JU013",
    name: "Lakshmi Rao",
    displayName: "Lakshmi Rao",
    email: "lakshmi@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lakshmi",
    role: "member",
    groupIds: ["grp-2", "grp-3"],
  },
  {
    id: "usr-14",
    cessId: "JU014",
    name: "Sanjay Gupta",
    displayName: "Sanjay Gupta",
    email: "sanjay@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay",
    role: "member",
    groupIds: ["grp-2", "grp-3"],
  },
  {
    id: "usr-15",
    cessId: "JU015",
    name: "Thomas Weber",
    displayName: "Thomas Weber",
    email: "thomas@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas",
    role: "member",
    groupIds: ["grp-2", "grp-3"],
  },
  {
    id: "usr-16",
    cessId: "JU016",
    name: "Deepa Menon",
    displayName: "Deepa Menon",
    email: "deepa@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=deepa",
    role: "member",
    groupIds: ["grp-2", "grp-7"],
  },
  {
    id: "usr-17",
    cessId: "JU017",
    name: "Suresh Pillai",
    displayName: "Suresh Pillai",
    email: "suresh@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=suresh",
    role: "member",
    groupIds: ["grp-2", "grp-4"],
  },
  {
    id: "usr-18",
    cessId: "JU018",
    name: "Nandini Bhat",
    displayName: "Nandini Bhat",
    email: "nandini@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nandini",
    role: "member",
    groupIds: ["grp-1", "grp-2", "grp-11"],
  },
  {
    id: "usr-19",
    cessId: "JU019",
    name: "Sarah Chen",
    displayName: "Sarah Chen",
    email: "sarah@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    role: "member",
    groupIds: ["grp-9", "grp-10"],
  },
  {
    id: "usr-20",
    cessId: "JU020",
    name: "Omar Farooq",
    displayName: "Omar Farooq",
    email: "omar@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=omar",
    role: "member",
    groupIds: ["grp-8"],
  },
]

// ---------------------------------------------------------------------------
// Projects — spec §4.4 (8 projects)
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: "proj-1",
    key: "SUS",
    name: "Support US",
    lead: "usr-3",
    type: "kanban",
    description: "US region support tickets",
    createdAt: "2025-06-01T09:00:00.000Z",
    workflow: [
      "Intake",
      "Triage",
      "Investigation",
      "Fix in Progress",
      "Peer Review",
      "Validation",
      "Deployed",
      "Closed",
    ],
    teamManaged: false,
  },
  {
    id: "proj-2",
    key: "SEU",
    name: "Support EU",
    lead: "usr-15",
    type: "kanban",
    description: "EU region support tickets",
    createdAt: "2025-06-01T09:00:00.000Z",
    workflow: [
      "Intake",
      "Triage",
      "Investigation",
      "Fix in Progress",
      "Peer Review",
      "Validation",
      "Deployed",
      "Closed",
    ],
    teamManaged: false,
  },
  {
    id: "proj-3",
    key: "SAP",
    name: "Support APAC",
    lead: "usr-12",
    type: "kanban",
    description: "APAC region support tickets",
    createdAt: "2025-06-01T09:00:00.000Z",
    workflow: [
      "Intake",
      "Triage",
      "Investigation",
      "Fix in Progress",
      "Peer Review",
      "Validation",
      "Deployed",
      "Closed",
    ],
    teamManaged: false,
  },
  {
    id: "proj-4",
    key: "PLAT",
    name: "Platform Engineering",
    lead: "usr-3",
    type: "scrum",
    description: "Platform backend services",
    createdAt: "2025-09-01T09:00:00.000Z",
    workflow: [
      "Open",
      "In Development",
      "Code Review",
      "QA",
      "Staging",
      "Done",
      "Won't Fix",
    ],
    teamManaged: false,
  },
  {
    id: "proj-5",
    key: "FAPP",
    name: "Frontend App",
    lead: "usr-4",
    type: "scrum",
    description: "Customer-facing web app",
    createdAt: "2025-09-15T09:00:00.000Z",
    workflow: [
      "Backlog",
      "Ready",
      "In Progress",
      "In Review",
      "QA",
      "Done",
      "Won't Fix",
    ],
    teamManaged: false,
  },
  {
    id: "proj-6",
    key: "MOB",
    name: "Mobile App",
    lead: "usr-17",
    type: "scrum",
    description: "iOS and Android apps",
    createdAt: "2025-10-01T09:00:00.000Z",
    workflow: [
      "Backlog",
      "In Progress",
      "In Review",
      "Testing",
      "Done",
      "Won't Fix",
    ],
    teamManaged: false,
  },
  {
    id: "proj-7",
    key: "DEVOPS",
    name: "DevOps",
    lead: "usr-7",
    type: "kanban",
    description: "Infrastructure and tooling",
    createdAt: "2025-06-01T09:00:00.000Z",
    workflow: ["Backlog", "In Progress", "Deploying", "Monitoring", "Done"],
    teamManaged: false,
  },
  {
    id: "proj-8",
    key: "LCRM",
    name: "Legacy CRM",
    lead: "usr-12",
    type: "scrum",
    description: "Legacy CRM to be migrated — non-standard workflow",
    createdAt: "2024-06-01T09:00:00.000Z",
    workflow: ["To Do", "Doing", "Review", "Testing", "Done", "Rejected"],
    teamManaged: true,
  },
  {
    id: "proj-9",
    key: "SCRUM",
    name: "My Scrum Project",
    lead: "usr-1",
    type: "scrum",
    description: "Team scrum project",
    createdAt: "2026-03-01T09:00:00.000Z",
    workflow: ["To Do", "In Progress", "Done"],
    teamManaged: true,
  },
]

// ---------------------------------------------------------------------------
// Components — spec §4.4 (PLAT + LCRM)
// ---------------------------------------------------------------------------

export const components: Component[] = [
  // PLAT components
  {
    id: "cmp-1",
    name: "Payment Service",
    projectId: "proj-4",
    leadId: "usr-3",
    defaultAssigneeId: "usr-3",
  },
  {
    id: "cmp-2",
    name: "Auth Service",
    projectId: "proj-4",
    leadId: "usr-5",
    defaultAssigneeId: "usr-5",
  },
  {
    id: "cmp-3",
    name: "API Gateway",
    projectId: "proj-4",
    leadId: "usr-12",
    defaultAssigneeId: "usr-12",
  },
  {
    id: "cmp-4",
    name: "Database",
    projectId: "proj-4",
    leadId: "usr-13",
    defaultAssigneeId: "usr-13",
  },
  {
    id: "cmp-5",
    name: "Monitoring",
    projectId: "proj-4",
    leadId: "usr-7",
    defaultAssigneeId: "usr-7",
  },
  // LCRM components
  {
    id: "cmp-6",
    name: "Contacts",
    projectId: "proj-8",
    leadId: "usr-12",
    defaultAssigneeId: "usr-12",
  },
  {
    id: "cmp-7",
    name: "Deals",
    projectId: "proj-8",
    leadId: "usr-13",
    defaultAssigneeId: "usr-13",
  },
  {
    id: "cmp-8",
    name: "Reports",
    projectId: "proj-8",
    leadId: "usr-14",
    defaultAssigneeId: "usr-14",
  },
  {
    id: "cmp-9",
    name: "Integrations",
    projectId: "proj-8",
    leadId: "usr-15",
    defaultAssigneeId: "usr-15",
  },
  {
    id: "cmp-10",
    name: "Admin",
    projectId: "proj-8",
    leadId: "usr-12",
    defaultAssigneeId: "usr-12",
  },
]

// ---------------------------------------------------------------------------
// Fix Versions — spec §4.4
// ---------------------------------------------------------------------------

export const fixVersions: FixVersion[] = [
  // PLAT
  {
    id: "ver-1",
    name: "v2.1.0",
    projectId: "proj-4",
    status: "released",
    releaseDate: "2026-01-15",
    description: "Q4 2025 features",
  },
  {
    id: "ver-2",
    name: "v2.2.0",
    projectId: "proj-4",
    status: "released",
    releaseDate: "2026-03-01",
    description: "Q1 2026 features",
  },
  {
    id: "ver-3",
    name: "v2.2.1",
    projectId: "proj-4",
    status: "released",
    releaseDate: "2026-03-20",
    description: "Hotfix release",
  },
  {
    id: "ver-4",
    name: "v2.3.0",
    projectId: "proj-4",
    status: "unreleased",
    releaseDate: "2026-06-01",
    description: "Q2 2026 features",
  },
  {
    id: "ver-5",
    name: "v2.3.1",
    projectId: "proj-4",
    status: "unreleased",
    releaseDate: null,
    description: "Hotfix placeholder",
  },
  // LCRM
  {
    id: "ver-6",
    name: "v1.0",
    projectId: "proj-8",
    status: "released",
    releaseDate: "2024-06-01",
    description: "Initial release",
  },
  {
    id: "ver-7",
    name: "v1.1",
    projectId: "proj-8",
    status: "released",
    releaseDate: "2024-12-01",
    description: "Minor update",
  },
  {
    id: "ver-8",
    name: "v1.2",
    projectId: "proj-8",
    status: "released",
    releaseDate: "2025-06-01",
    description: "Feature update",
  },
  {
    id: "ver-9",
    name: "v2.0",
    projectId: "proj-8",
    status: "unreleased",
    releaseDate: "2026-09-01",
    description: "Major rewrite",
  },
  {
    id: "ver-10",
    name: "v2.1",
    projectId: "proj-8",
    status: "unreleased",
    releaseDate: null,
    description: "Post-migration",
  },
]

// ---------------------------------------------------------------------------
// Sprints — spec §4.4 (PLAT Sprint 10..14)
// ---------------------------------------------------------------------------

export const sprints: Sprint[] = [
  {
    id: "sprint-1",
    name: "PLAT Sprint 10",
    projectId: "proj-4",
    startDate: "2026-02-17",
    endDate: "2026-03-02",
    goal: "Auth service MVP",
    state: "closed",
  },
  {
    id: "sprint-2",
    name: "PLAT Sprint 11",
    projectId: "proj-4",
    startDate: "2026-03-03",
    endDate: "2026-03-16",
    goal: "Payment API foundation",
    state: "closed",
  },
  {
    id: "sprint-3",
    name: "PLAT Sprint 12",
    projectId: "proj-4",
    startDate: "2026-03-17",
    endDate: "2026-03-30",
    goal: "Payment + Auth integration",
    state: "closed",
  },
  {
    id: "sprint-4",
    name: "PLAT Sprint 13",
    projectId: "proj-4",
    startDate: "2026-03-31",
    endDate: "2026-04-13",
    goal: "Pre-release hardening",
    state: "active",
  },
  {
    id: "sprint-5",
    name: "PLAT Sprint 14",
    projectId: "proj-4",
    startDate: "2026-04-14",
    endDate: "2026-04-28",
    goal: "",
    state: "future",
  },
  {
    id: "sprint-6",
    name: "SCRUM Sprint 0",
    projectId: "proj-9",
    startDate: "2026-04-10",
    endDate: "2026-04-24",
    goal: "Initial setup",
    state: "active",
  },
  {
    id: "sprint-7",
    name: "SCRUM Sprint 1",
    projectId: "proj-9",
    startDate: "2026-04-25",
    endDate: "2026-05-08",
    goal: "",
    state: "future",
  },
]

// ---------------------------------------------------------------------------
// Epics — spec §4.5 (5 PLAT epics + others)
// ---------------------------------------------------------------------------

export const epics: Epic[] = [
  {
    id: "epic-1",
    key: "PLAT-1",
    name: "Auth Service Overhaul",
    summary: "Complete rewrite of authentication service with MFA and SSO",
    projectId: "proj-4",
    status: "In Development",
    fixVersionId: "ver-4",
  },
  {
    id: "epic-2",
    key: "PLAT-2",
    name: "Payment API v2",
    summary: "Payment gateway abstraction with Stripe and PayPal",
    projectId: "proj-4",
    status: "In Development",
    fixVersionId: "ver-4",
  },
  {
    id: "epic-3",
    key: "PLAT-3",
    name: "API Gateway Performance",
    summary: "Caching layer and rate limiting for API gateway",
    projectId: "proj-4",
    status: "Done",
    fixVersionId: "ver-2",
  },
  {
    id: "epic-4",
    key: "PLAT-4",
    name: "Monitoring & Observability",
    summary: "Prometheus, Grafana, and distributed tracing",
    projectId: "proj-4",
    status: "In Development",
    fixVersionId: "ver-4",
  },
  {
    id: "epic-5",
    key: "PLAT-5",
    name: "Infrastructure Modernization",
    summary: "K8s migration and CI/CD improvements",
    projectId: "proj-4",
    status: "Open",
    fixVersionId: "ver-4",
  },
  {
    id: "epic-6",
    key: "FAPP-1",
    name: "Checkout Redesign",
    summary: "New mobile-first checkout flow",
    projectId: "proj-5",
    status: "In Progress",
    fixVersionId: null,
  },
]

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

// --- PLAT issues (60: 5 epics above + 30 stories + 15 bugs + 10 tasks) ---

const platStories: Issue[] = [
  {
    id: "iss-1",
    key: "PLAT-10",
    summary: "Implement PKCE auth flow",
    description: "OAuth2 PKCE for public clients.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-5",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-14T15:00:00.000Z",
  },
  {
    id: "iss-2",
    key: "PLAT-11",
    summary: "Refresh token rotation",
    description: "Rotate refresh tokens on every use.",
    type: "story",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-5",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 5,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-3",
    key: "PLAT-12",
    summary: "Session management API",
    description: "Redis-backed session storage.",
    type: "story",
    status: "Code Review",
    priority: "high",
    assigneeId: "usr-12",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 5,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-4",
    key: "PLAT-13",
    summary: "Rate limiting — auth",
    description: "Token bucket for auth endpoints.",
    type: "story",
    status: "QA",
    priority: "medium",
    assigneeId: "usr-14",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-09T16:00:00.000Z",
  },
  {
    id: "iss-5",
    key: "PLAT-14",
    summary: "MFA — TOTP",
    description: "RFC 6238 TOTP enrollment and verification.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-3",
    reporterId: "usr-3",
    sprintId: "sprint-3",
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-17T09:00:00.000Z",
    updatedAt: "2026-03-29T14:00:00.000Z",
  },
  {
    id: "iss-6",
    key: "PLAT-15",
    summary: "MFA — WebAuthn",
    description: "FIDO2 hardware key support.",
    type: "story",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-5",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 13,
    labels: [],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "iss-7",
    key: "PLAT-16",
    summary: "SSO — SAML",
    description: "SAML 2.0 IdP/SP-initiated flows.",
    type: "story",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-15",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-8",
    key: "PLAT-17",
    summary: "SSO — OIDC",
    description: "OIDC discovery and token exchange.",
    type: "story",
    status: "Open",
    priority: "high",
    assigneeId: "usr-15",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-1",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-9",
    key: "PLAT-18",
    summary: "Payment gateway abstraction",
    description: "Unified interface over Stripe, PayPal.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-3",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-14T16:00:00.000Z",
  },
  {
    id: "iss-10",
    key: "PLAT-19",
    summary: "Stripe v2 integration",
    description: "Migrate to Stripe PaymentIntents API.",
    type: "story",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-5",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "iss-11",
    key: "PLAT-20",
    summary: "PayPal integration",
    description: "PayPal Checkout v2 with billing agreements.",
    type: "story",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-14",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-12",
    key: "PLAT-21",
    summary: "Payment webhook handler",
    description: "Verify and process gateway webhooks.",
    type: "story",
    status: "Code Review",
    priority: "high",
    assigneeId: "usr-12",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 5,
    labels: ["release-candidate"],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-13",
    key: "PLAT-22",
    summary: "Idempotency keys",
    description: "Safe retries with Idempotency-Key header.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-13",
    reporterId: "usr-3",
    sprintId: "sprint-3",
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 5,
    labels: ["release-candidate"],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-17T09:00:00.000Z",
    updatedAt: "2026-03-29T15:00:00.000Z",
  },
  {
    id: "iss-14",
    key: "PLAT-23",
    summary: "Payment retry logic",
    description: "Exponential backoff for transient failures.",
    type: "story",
    status: "Open",
    priority: "high",
    assigneeId: "usr-5",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-15",
    key: "PLAT-24",
    summary: "API Gateway — caching layer",
    description: "Edge caching for hot endpoints.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-12",
    reporterId: "usr-3",
    sprintId: "sprint-1",
    epicId: "epic-3",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-02-17T09:00:00.000Z",
    updatedAt: "2026-02-28T15:00:00.000Z",
  },
  {
    id: "iss-16",
    key: "PLAT-25",
    summary: "API Gateway — rate limiting",
    description: "Global rate limits per API key.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-12",
    reporterId: "usr-3",
    sprintId: "sprint-1",
    epicId: "epic-3",
    projectId: "proj-4",
    storyPoints: 5,
    labels: ["release-candidate"],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-02-17T09:00:00.000Z",
    updatedAt: "2026-02-27T15:00:00.000Z",
  },
  {
    id: "iss-17",
    key: "PLAT-26",
    summary: "Prometheus metrics export",
    description: "Export core metrics to Prometheus.",
    type: "story",
    status: "Done",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-4",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-13T15:00:00.000Z",
  },
  {
    id: "iss-18",
    key: "PLAT-27",
    summary: "Grafana dashboard setup",
    description: "Core dashboards for API, auth, payments.",
    type: "story",
    status: "Done",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-4",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-14T15:00:00.000Z",
  },
  {
    id: "iss-19",
    key: "PLAT-28",
    summary: "Alert rules — payment failures",
    description: "PagerDuty alerts for elevated failure rates.",
    type: "story",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-4",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z",
  },
  {
    id: "iss-20",
    key: "PLAT-29",
    summary: "Distributed tracing setup",
    description: "OpenTelemetry spans across services.",
    type: "story",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-4",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-21",
    key: "PLAT-30",
    summary: "K8s migration — auth service",
    description: "Move auth service to Kubernetes.",
    type: "story",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-5",
    projectId: "proj-4",
    storyPoints: 8,
    labels: ["release-candidate"],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-22",
    key: "PLAT-31",
    summary: "K8s migration — payment service",
    description: "Move payment service to Kubernetes.",
    type: "story",
    status: "Open",
    priority: "high",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-5",
    projectId: "proj-4",
    storyPoints: 8,
    labels: [],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-23",
    key: "PLAT-32",
    summary: "Database connection pooling",
    description: "PgBouncer in front of Postgres.",
    type: "story",
    status: "Staging",
    priority: "high",
    assigneeId: "usr-13",
    reporterId: "usr-3",
    sprintId: "sprint-4",
    epicId: "epic-5",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-4"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-24",
    key: "PLAT-33",
    summary: "CI/CD pipeline optimization",
    description: "Reduce build times and flakiness.",
    type: "story",
    status: "Done",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: "sprint-3",
    epicId: "epic-5",
    projectId: "proj-4",
    storyPoints: 5,
    labels: ["release-candidate"],
    componentIds: [],
    fixVersionIds: ["ver-3"],
    createdAt: "2026-03-17T09:00:00.000Z",
    updatedAt: "2026-03-28T15:00:00.000Z",
  },
  {
    id: "iss-25",
    key: "PLAT-34",
    summary: "Load testing framework",
    description: "k6-based framework for repeatable load tests.",
    type: "story",
    status: "Open",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-7",
    sprintId: null,
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-26",
    key: "PLAT-35",
    summary: "PCI compliance docs",
    description: "SAQ-D documentation for payment flow.",
    type: "story",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    sprintId: "sprint-4",
    epicId: "epic-2",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-09T14:00:00.000Z",
  },
  {
    id: "iss-27",
    key: "PLAT-36",
    summary: "API versioning strategy",
    description: "Semver + deprecation headers.",
    type: "story",
    status: "Done",
    priority: "medium",
    assigneeId: "usr-3",
    reporterId: "usr-3",
    sprintId: "sprint-1",
    epicId: "epic-3",
    projectId: "proj-4",
    storyPoints: 3,
    labels: ["release-candidate"],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-02-17T09:00:00.000Z",
    updatedAt: "2026-02-25T15:00:00.000Z",
  },
  {
    id: "iss-28",
    key: "PLAT-37",
    summary: "Error code standardization",
    description: "Map to stable public error codes.",
    type: "story",
    status: "Done",
    priority: "low",
    assigneeId: "usr-5",
    reporterId: "usr-3",
    sprintId: "sprint-2",
    epicId: "epic-3",
    projectId: "proj-4",
    storyPoints: 2,
    labels: ["release-candidate"],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-10T15:00:00.000Z",
  },
  {
    id: "iss-29",
    key: "PLAT-38",
    summary: "Canary deployment setup",
    description: "Gradual rollout with automatic rollback.",
    type: "story",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-5",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-30",
    key: "PLAT-39",
    summary: "Secret rotation automation",
    description: "Automated secret rotation via Vault.",
    type: "story",
    status: "Open",
    priority: "high",
    assigneeId: "usr-7",
    reporterId: "usr-3",
    sprintId: null,
    epicId: "epic-5",
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-04T09:00:00.000Z",
    updatedAt: "2026-04-04T09:00:00.000Z",
  },
]

const platBugs: Issue[] = [
  {
    id: "iss-31",
    key: "PLAT-50",
    summary: "Auth token not refreshing on mobile",
    description: "Mobile clients fail to refresh tokens after backgrounding.",
    type: "bug",
    status: "Open",
    priority: "high",
    assigneeId: "usr-5",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z",
  },
  {
    id: "iss-32",
    key: "PLAT-51",
    summary: "Payment webhook timeout on retry",
    description: "Webhooks retrying beyond 30s timeout window.",
    type: "bug",
    status: "In Development",
    priority: "highest",
    assigneeId: "usr-3",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-06T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-33",
    key: "PLAT-52",
    summary: "API Gateway 502 under load",
    description: "Sporadic 502s when backend pool is saturated.",
    type: "bug",
    status: "QA",
    priority: "high",
    assigneeId: "usr-12",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-09T16:00:00.000Z",
  },
  {
    id: "iss-34",
    key: "PLAT-53",
    summary: "Session expires during checkout",
    description: "User session expires mid-checkout.",
    type: "bug",
    status: "Open",
    priority: "high",
    assigneeId: "usr-5",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-07T09:00:00.000Z",
    updatedAt: "2026-04-09T09:00:00.000Z",
  },
  {
    id: "iss-35",
    key: "PLAT-54",
    summary: "Rate limiter not resetting hourly",
    description:
      "Rate limit window not resetting correctly at hour boundaries.",
    type: "bug",
    status: "Done",
    priority: "medium",
    assigneeId: "usr-12",
    reporterId: "usr-9",
    sprintId: "sprint-3",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-3"],
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-03-28T15:00:00.000Z",
  },
  {
    id: "iss-36",
    key: "PLAT-55",
    summary: "Monitoring false positives on health check",
    description: "Health check returns 200 even when dependency is down.",
    type: "bug",
    status: "Done",
    priority: "low",
    assigneeId: "usr-7",
    reporterId: "usr-9",
    sprintId: "sprint-3",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-3"],
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-03-25T15:00:00.000Z",
  },
  {
    id: "iss-37",
    key: "PLAT-56",
    summary: "DB connection leak in auth service",
    description: "Connections not returning to pool.",
    type: "bug",
    status: "Open",
    priority: "highest",
    assigneeId: "usr-13",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-4"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-06T09:00:00.000Z",
    updatedAt: "2026-04-09T09:00:00.000Z",
  },
  {
    id: "iss-38",
    key: "PLAT-57",
    summary: "SAML response parsing error",
    description: "Fails on assertions with multiple audience tags.",
    type: "bug",
    status: "In Development",
    priority: "high",
    assigneeId: "usr-15",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-39",
    key: "PLAT-58",
    summary: "Payment amount overflow >$10K",
    description:
      "Payments over $10K fail due to int32 overflow. Reported in Zendesk ticket ZD-1001 from MegaCorp.",
    type: "bug",
    status: "Open",
    priority: "highest",
    assigneeId: null,
    reporterId: "usr-19",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: ["customer-reported"],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-11T09:00:00.000Z",
    updatedAt: "2026-04-11T09:00:00.000Z",
  },
  {
    id: "iss-40",
    key: "PLAT-59",
    summary: "Webhook signature validation fails",
    description: "Valid signatures rejected intermittently.",
    type: "bug",
    status: "Done",
    priority: "high",
    assigneeId: "usr-3",
    reporterId: "usr-9",
    sprintId: "sprint-3",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-3"],
    createdAt: "2026-03-19T09:00:00.000Z",
    updatedAt: "2026-03-27T15:00:00.000Z",
  },
  {
    id: "iss-41",
    key: "PLAT-60",
    summary: "Audit log missing DELETE operations",
    description: "Delete events not showing up in audit log.",
    type: "bug",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-9",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-42",
    key: "PLAT-61",
    summary: "Cache invalidation race condition",
    description: "Stale data served during concurrent invalidations.",
    type: "bug",
    status: "Open",
    priority: "high",
    assigneeId: "usr-12",
    reporterId: "usr-9",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-3"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-43",
    key: "PLAT-62",
    summary: "OIDC discovery endpoint 404",
    description: "/.well-known/openid-configuration returns 404 in staging.",
    type: "bug",
    status: "Open",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-9",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-2"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-44",
    key: "PLAT-63",
    summary: "Grafana dashboard widget OOM",
    description: "Widget crashes browser tab on large time ranges.",
    type: "bug",
    status: "Done",
    priority: "low",
    assigneeId: "usr-7",
    reporterId: "usr-9",
    sprintId: "sprint-2",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-5"],
    fixVersionIds: ["ver-2"],
    createdAt: "2026-03-05T09:00:00.000Z",
    updatedAt: "2026-03-12T15:00:00.000Z",
  },
  {
    id: "iss-45",
    key: "PLAT-64",
    summary: "Duplicate payment events on timeout",
    description: "Payment events duplicated when network times out.",
    type: "bug",
    status: "Open",
    priority: "highest",
    assigneeId: "usr-3",
    reporterId: "usr-9",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: null,
    labels: [],
    componentIds: ["cmp-1"],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-08T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
]

const platTasks: Issue[] = [
  {
    id: "iss-46",
    key: "PLAT-70",
    summary: "Update API documentation for v2.3.0",
    description: "Revise API docs to reflect v2.3.0 changes.",
    type: "task",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-47",
    key: "PLAT-71",
    summary: "Write migration guide for auth v2",
    description: "Customer-facing migration guide.",
    type: "task",
    status: "In Development",
    priority: "medium",
    assigneeId: "usr-5",
    reporterId: "usr-1",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-48",
    key: "PLAT-72",
    summary: "Performance benchmark — payment service",
    description: "Run baseline benchmarks and publish results.",
    type: "task",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-13",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-49",
    key: "PLAT-73",
    summary: "Security audit prep",
    description: "Gather docs for external security audit.",
    type: "task",
    status: "Open",
    priority: "high",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-50",
    key: "PLAT-74",
    summary: "On-call runbook update",
    description: "Update runbook with v2.3.0 changes.",
    type: "task",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-7",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 2,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-51",
    key: "PLAT-75",
    summary: "Deprecation notice for v1 endpoints",
    description: "Publish 6-month deprecation notice.",
    type: "task",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 2,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-04T09:00:00.000Z",
    updatedAt: "2026-04-04T09:00:00.000Z",
  },
  {
    id: "iss-52",
    key: "PLAT-76",
    summary: "Integration test suite expansion",
    description: "Add integration tests for new auth endpoints.",
    type: "task",
    status: "In Development",
    priority: "medium",
    assigneeId: "usr-8",
    reporterId: "usr-1",
    sprintId: "sprint-4",
    epicId: null,
    projectId: "proj-4",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-53",
    key: "PLAT-77",
    summary: "Load test results analysis",
    description: "Analyze results from recent load tests.",
    type: "task",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-13",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-04T09:00:00.000Z",
    updatedAt: "2026-04-04T09:00:00.000Z",
  },
  {
    id: "iss-54",
    key: "PLAT-78",
    summary: "Dependency audit and upgrades",
    description: "Quarterly dependency audit.",
    type: "task",
    status: "Open",
    priority: "low",
    assigneeId: "usr-7",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
  {
    id: "iss-55",
    key: "PLAT-79",
    summary: "Release notes draft for v2.3.0",
    description: "Draft release notes for v2.3.0.",
    type: "task",
    status: "Open",
    priority: "medium",
    assigneeId: "usr-10",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-4",
    storyPoints: 2,
    labels: [],
    componentIds: [],
    fixVersionIds: ["ver-4"],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
]

// --- FAPP issues (20) ---

const fappIssues: Issue[] = [
  {
    id: "iss-56",
    key: "FAPP-10",
    summary: "Cart component rewrite",
    description: "Rewrite cart component with new design system.",
    type: "story",
    status: "Done",
    priority: "high",
    assigneeId: "usr-4",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-03-17T09:00:00.000Z",
    updatedAt: "2026-03-28T15:00:00.000Z",
  },
  {
    id: "iss-57",
    key: "FAPP-11",
    summary: "Payment form UI",
    description: "Payment form with Stripe Elements.",
    type: "story",
    status: "In Progress",
    priority: "high",
    assigneeId: "usr-6",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 8,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-58",
    key: "FAPP-12",
    summary: "Address autocomplete",
    description: "Google Places autocomplete for shipping address.",
    type: "story",
    status: "Ready",
    priority: "medium",
    assigneeId: "usr-17",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-03-31T09:00:00.000Z",
  },
  {
    id: "iss-59",
    key: "FAPP-13",
    summary: "Order confirmation view",
    description: "Order confirmation page with order details.",
    type: "story",
    status: "Ready",
    priority: "medium",
    assigneeId: "usr-6",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-60",
    key: "FAPP-14",
    summary: "Mobile responsive layout",
    description: "Ensure checkout works on mobile breakpoints.",
    type: "story",
    status: "In Progress",
    priority: "high",
    assigneeId: "usr-4",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 8,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-61",
    key: "FAPP-15",
    summary: "Checkout analytics integration",
    description: "Emit analytics events for each checkout step.",
    type: "story",
    status: "Backlog",
    priority: "low",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-62",
    key: "FAPP-16",
    summary: "Error state handling",
    description: "Graceful error UI for each failure mode.",
    type: "story",
    status: "In Review",
    priority: "high",
    assigneeId: "usr-6",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-63",
    key: "FAPP-17",
    summary: "Loading skeleton screens",
    description: "Skeleton loaders for each checkout step.",
    type: "story",
    status: "Ready",
    priority: "medium",
    assigneeId: "usr-17",
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 2,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-64",
    key: "FAPP-18",
    summary: "Accessibility audit",
    description: "WCAG 2.1 AA audit and remediation.",
    type: "story",
    status: "Backlog",
    priority: "high",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: "epic-6",
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-65",
    key: "FAPP-19",
    summary: "Dark mode support",
    description: "Dark mode for the entire checkout flow.",
    type: "story",
    status: "Backlog",
    priority: "low",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "iss-66",
    key: "FAPP-20",
    summary: "Fix cart flicker on add item",
    description: "Cart briefly flickers when adding an item.",
    type: "bug",
    status: "In Progress",
    priority: "medium",
    assigneeId: "usr-17",
    reporterId: "usr-9",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 2,
    labels: ["bug"],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z",
  },
  {
    id: "iss-67",
    key: "FAPP-21",
    summary: "Fix inconsistent form validation",
    description: "Validation messages differ between fields.",
    type: "bug",
    status: "Backlog",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-9",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 2,
    labels: ["bug"],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
  {
    id: "iss-68",
    key: "FAPP-22",
    summary: "Add saved payment methods list",
    description: "Show saved payment methods in account page.",
    type: "story",
    status: "Ready",
    priority: "medium",
    assigneeId: "usr-17",
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-04T09:00:00.000Z",
    updatedAt: "2026-04-04T09:00:00.000Z",
  },
  {
    id: "iss-69",
    key: "FAPP-23",
    summary: "Add promo code input",
    description: "Apply and validate promo codes at checkout.",
    type: "story",
    status: "Backlog",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
  {
    id: "iss-70",
    key: "FAPP-24",
    summary: "Add gift card redemption",
    description: "Apply gift card balances at checkout.",
    type: "story",
    status: "Backlog",
    priority: "low",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
  {
    id: "iss-71",
    key: "FAPP-25",
    summary: "Add order history page",
    description: "Paginated order history with filters.",
    type: "story",
    status: "Backlog",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-06T09:00:00.000Z",
    updatedAt: "2026-04-06T09:00:00.000Z",
  },
  {
    id: "iss-72",
    key: "FAPP-26",
    summary: "Add order details page",
    description: "Full order details with tracking.",
    type: "story",
    status: "Backlog",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-06T09:00:00.000Z",
    updatedAt: "2026-04-06T09:00:00.000Z",
  },
  {
    id: "iss-73",
    key: "FAPP-27",
    summary: "Add reorder button",
    description: "One-click reorder from order details.",
    type: "story",
    status: "Backlog",
    priority: "low",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 2,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-06T09:00:00.000Z",
    updatedAt: "2026-04-06T09:00:00.000Z",
  },
  {
    id: "iss-74",
    key: "FAPP-28",
    summary: "Fix header dropdown z-index",
    description: "Header dropdown hidden behind modal backdrop.",
    type: "bug",
    status: "Done",
    priority: "low",
    assigneeId: "usr-6",
    reporterId: "usr-9",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 1,
    labels: ["bug"],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-07T15:00:00.000Z",
  },
  {
    id: "iss-75",
    key: "FAPP-29",
    summary: "Add keyboard navigation to cart",
    description: "Full keyboard support for cart management.",
    type: "task",
    status: "Backlog",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-4",
    sprintId: null,
    epicId: null,
    projectId: "proj-5",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-07T09:00:00.000Z",
    updatedAt: "2026-04-07T09:00:00.000Z",
  },
]

// --- LCRM issues (215) — spec §4.5. Distribution: 8 epics, 71 stories, 70 bugs, 50 tasks, 15 sub-tasks + 1 epic reserved ---

const lcrmDistribution: { status: string; count: number }[] = [
  { status: "To Do", count: 45 },
  { status: "Doing", count: 25 },
  { status: "Review", count: 15 },
  { status: "Testing", count: 10 },
  { status: "Done", count: 100 },
  { status: "Rejected", count: 20 },
]

function expandLcrmStatuses(): string[] {
  const out: string[] = []
  for (const { status, count } of lcrmDistribution) {
    for (let i = 0; i < count; i++) out.push(status)
  }
  return out
}

const lcrmEpics: Issue[] = [
  "Contacts Module Rewrite",
  "Deals Pipeline v2",
  "Reporting Engine Overhaul",
  "Integrations Framework",
  "Admin Dashboard",
  "Global Search",
  "Mobile App Support",
  "Notifications System",
].map((name, i) => ({
  id: `iss-${76 + i}`,
  key: `LCRM-${i + 1}`,
  summary: name,
  description: `Epic: ${name}. Major workstream inherited with the legacy codebase.`,
  type: "epic" as const,
  status: [
    "Done",
    "Doing",
    "Doing",
    "To Do",
    "Doing",
    "To Do",
    "To Do",
    "Doing",
  ][i],
  priority: "medium" as const,
  assigneeId: [
    "usr-12",
    "usr-13",
    "usr-14",
    "usr-15",
    "usr-12",
    "usr-13",
    "usr-15",
    "usr-14",
  ][i],
  reporterId: "usr-12",
  sprintId: null,
  epicId: null,
  projectId: "proj-8",
  storyPoints: null,
  labels: ["epic"],
  componentIds: [],
  fixVersionIds: ["ver-9"],
  createdAt: "2024-07-01T09:00:00.000Z",
  updatedAt: "2026-03-01T09:00:00.000Z",
}))

function randPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

const lcrmComponentIds = ["cmp-6", "cmp-7", "cmp-8", "cmp-9", "cmp-10"]
const lcrmReporters = ["usr-12", "usr-13", "usr-14", "usr-15"]
const lcrmAssignees = ["usr-12", "usr-13", "usr-14", "usr-15", null]

const lcrmStatusSequence = expandLcrmStatuses()

// Stories LCRM-10..80 (71 stories)
const lcrmStories: Issue[] = Array.from({ length: 71 }, (_, i) => {
  const num = i + 10
  const idx = i
  return {
    id: `iss-${84 + i}`,
    key: `LCRM-${num}`,
    summary: `Story: ${["Contacts import flow", "Deal stage transitions", "Report builder UI", "OAuth integration", "Admin role editor"][i % 5]} #${Math.floor(i / 5) + 1}`,
    description:
      "Legacy story inherited from acquisition. Specs unclear — needs triage.",
    type: "story" as const,
    status: lcrmStatusSequence[idx] ?? "To Do",
    priority: ["medium", "high", "low", "medium", "medium"][
      i % 5
    ] as Issue["priority"],
    assigneeId: randPick(lcrmAssignees, i * 3),
    reporterId: randPick(lcrmReporters, i),
    sprintId: null,
    epicId: lcrmEpics[i % lcrmEpics.length].id,
    projectId: "proj-8",
    storyPoints: [3, 5, 8, 2, 3][i % 5],
    labels: i % 4 === 0 ? ["tech-debt"] : [],
    componentIds: [lcrmComponentIds[i % 5]],
    fixVersionIds: i % 7 === 0 ? ["ver-9"] : [],
    createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-${String((i % 4) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
  }
})

// Bugs LCRM-81..150 (70 bugs)
const lcrmBugs: Issue[] = Array.from({ length: 70 }, (_, i) => {
  const num = i + 81
  return {
    id: `iss-${155 + i}`,
    key: `LCRM-${num}`,
    summary: `Bug: ${["Contact duplicate on import", "Deal stuck in stage", "Report export fails", "Webhook not firing", "Permission check bypassed"][i % 5]} #${Math.floor(i / 5) + 1}`,
    description:
      "Bug inherited from legacy backlog. Reproduction steps unclear.",
    type: "bug" as const,
    status: lcrmStatusSequence[(i + 71) % lcrmStatusSequence.length] ?? "To Do",
    priority: ["high", "medium", "high", "low", "medium"][
      i % 5
    ] as Issue["priority"],
    assigneeId: randPick(lcrmAssignees, i * 2 + 1),
    reporterId: randPick(lcrmReporters, i + 3),
    sprintId: null,
    epicId: null,
    projectId: "proj-8",
    storyPoints: null,
    labels: ["bug"],
    componentIds: [lcrmComponentIds[(i + 2) % 5]],
    fixVersionIds: [],
    createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-${String((i % 4) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
  }
})

// Tasks LCRM-151..200 (50 tasks)
const lcrmTasks: Issue[] = Array.from({ length: 50 }, (_, i) => {
  const num = i + 151
  return {
    id: `iss-${225 + i}`,
    key: `LCRM-${num}`,
    summary: `Task: ${["Update contacts docs", "Clean up dead code", "Add logging to deals module", "Migrate tests to Jest", "Update README"][i % 5]} #${Math.floor(i / 5) + 1}`,
    description: "Task from legacy cleanup list. Low priority overall.",
    type: "task" as const,
    status:
      lcrmStatusSequence[(i + 141) % lcrmStatusSequence.length] ?? "To Do",
    priority: ["low", "medium", "low", "low", "medium"][
      i % 5
    ] as Issue["priority"],
    assigneeId: randPick(lcrmAssignees, i + 5),
    reporterId: randPick(lcrmReporters, i + 1),
    sprintId: null,
    epicId: null,
    projectId: "proj-8",
    storyPoints: [1, 2, 3, null, 1][i % 5],
    labels: ["tech-debt"],
    componentIds: [lcrmComponentIds[(i + 4) % 5]],
    fixVersionIds: [],
    createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-${String((i % 4) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
  }
})

// Sub-tasks LCRM-201..215 (15 sub-tasks, parented to stories)
const lcrmSubtasks: Issue[] = Array.from({ length: 15 }, (_, i) => {
  const num = i + 201
  const parent = lcrmStories[i * 4]
  return {
    id: `iss-${275 + i}`,
    key: `LCRM-${num}`,
    summary: `Sub-task for ${parent?.key ?? "LCRM-10"}: ${["Unit tests", "API docs", "E2E tests", "UI polish", "Code review fixes"][i % 5]}`,
    description: `Sub-task of ${parent?.key ?? "LCRM-10"}.`,
    type: "subtask" as const,
    status:
      lcrmStatusSequence[(i + 191) % lcrmStatusSequence.length] ?? "To Do",
    priority: "low" as const,
    assigneeId: parent?.assigneeId ?? null,
    reporterId: randPick(lcrmReporters, i),
    sprintId: null,
    epicId: parent?.epicId ?? null,
    projectId: "proj-8",
    storyPoints: 1,
    labels: [],
    componentIds: parent?.componentIds ?? [],
    fixVersionIds: [],
    createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-${String((i % 4) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}T09:00:00.000Z`,
  }
})

const lcrmIssues: Issue[] = [
  ...lcrmEpics,
  ...lcrmStories,
  ...lcrmBugs,
  ...lcrmTasks,
  ...lcrmSubtasks,
]

// --- Support project issues (SUS/SEU/SAP) — 30 issues each = 90 total ---
// Distribution per project: 3 Intake, 5 Triage, 8 Investigation, 6 Fix in Progress, 3 Peer Review, 2 Validation, 1 Deployed, 2 Closed

const supportStatusDistribution: { status: string; count: number }[] = [
  { status: "Intake", count: 3 },
  { status: "Triage", count: 5 },
  { status: "Investigation", count: 8 },
  { status: "Fix in Progress", count: 6 },
  { status: "Peer Review", count: 3 },
  { status: "Validation", count: 2 },
  { status: "Deployed", count: 1 },
  { status: "Closed", count: 2 },
]

function makeSupportIssues(
  projectKey: string,
  projectId: string,
  startIssueIdx: number,
  reporter: string
): Issue[] {
  const out: Issue[] = []
  let issueNum = 1
  for (const { status, count } of supportStatusDistribution) {
    for (let i = 0; i < count; i++) {
      const idx = out.length
      const daysAgo = 1 + ((idx * 3) % 30)
      const created = new Date(
        new Date("2026-04-13T09:00:00.000Z").getTime() -
          daysAgo * 24 * 60 * 60 * 1000
      )
      out.push({
        id: `iss-${startIssueIdx + idx}`,
        key: `${projectKey}-${issueNum}`,
        summary: `${projectKey} ticket #${issueNum}: customer issue in ${status}`,
        description: `Customer support ticket for ${projectKey} region. Currently in ${status}.`,
        type: "task",
        status,
        priority: ["high", "medium", "low", "medium", "high"][
          idx % 5
        ] as Issue["priority"],
        assigneeId: randPick(["usr-3", "usr-12", "usr-15", "usr-19"], idx),
        reporterId: reporter,
        sprintId: null,
        epicId: null,
        projectId,
        storyPoints: null,
        labels: ["support"],
        componentIds: [],
        fixVersionIds: [],
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
      })
      issueNum++
    }
  }
  return out
}

const susIssues = makeSupportIssues("SUS", "proj-1", 290, "usr-19")
const seuIssues = makeSupportIssues("SEU", "proj-2", 320, "usr-19")
const sapIssues = makeSupportIssues("SAP", "proj-3", 350, "usr-19")

// --- SCRUM project issues ---
const scrumIssues: Issue[] = [
  {
    id: "iss-scrum-1",
    key: "SCRUM-1",
    summary: "Task 1",
    description: "First task in scrum project",
    type: "task",
    status: "To Do",
    priority: "medium",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: "sprint-6",
    epicId: null,
    projectId: "proj-9",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
  },
  {
    id: "iss-scrum-2",
    key: "SCRUM-2",
    summary: "Task 2",
    description: "Second task in scrum project",
    type: "task",
    status: "In Progress",
    priority: "high",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: "sprint-6",
    epicId: null,
    projectId: "proj-9",
    storyPoints: 5,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-14T09:00:00.000Z",
    updatedAt: "2026-04-20T09:00:00.000Z",
  },
  {
    id: "iss-scrum-3",
    key: "SCRUM-3",
    summary: "Task 3",
    description: "Third task",
    type: "task",
    status: "In Progress",
    priority: "medium",
    assigneeId: "usr-1",
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-9",
    storyPoints: 3,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-13T09:00:00.000Z",
    updatedAt: "2026-04-13T09:00:00.000Z",
  },
  {
    id: "iss-scrum-5",
    key: "SCRUM-5",
    summary: "vijay",
    description: "",
    type: "task",
    status: "To Do",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-9",
    storyPoints: null,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-12T09:00:00.000Z",
    updatedAt: "2026-04-12T09:00:00.000Z",
  },
  {
    id: "iss-scrum-6",
    key: "SCRUM-6",
    summary: "wsdsadaas",
    description: "",
    type: "task",
    status: "To Do",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-9",
    storyPoints: null,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-11T09:00:00.000Z",
    updatedAt: "2026-04-11T09:00:00.000Z",
  },
  {
    id: "iss-scrum-7",
    key: "SCRUM-7",
    summary: "geeta",
    description: "",
    type: "task",
    status: "To Do",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-9",
    storyPoints: null,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-scrum-8",
    key: "SCRUM-8",
    summary: "geeta",
    description: "",
    type: "task",
    status: "To Do",
    priority: "medium",
    assigneeId: null,
    reporterId: "usr-1",
    sprintId: null,
    epicId: null,
    projectId: "proj-9",
    storyPoints: null,
    labels: [],
    componentIds: [],
    fixVersionIds: [],
    createdAt: "2026-04-09T09:00:00.000Z",
    updatedAt: "2026-04-09T09:00:00.000Z",
  },
]

// --- Combined issues export ---

export const issues: Issue[] = [
  ...platStories,
  ...platBugs,
  ...platTasks,
  ...fappIssues,
  ...lcrmIssues,
  ...susIssues,
  ...seuIssues,
  ...sapIssues,
  ...scrumIssues,
]

// ---------------------------------------------------------------------------
// Issue Links — spec §4.5
// ---------------------------------------------------------------------------

export const issueLinks: IssueLink[] = [
  { id: "link-1", fromIssueId: "iss-7", toIssueId: "iss-8", type: "blocks" }, // PLAT-16 blocks PLAT-17
  { id: "link-2", fromIssueId: "iss-9", toIssueId: "iss-10", type: "blocks" }, // PLAT-18 blocks PLAT-19
  { id: "link-3", fromIssueId: "iss-10", toIssueId: "iss-11", type: "blocks" }, // PLAT-19 blocks PLAT-20
  {
    id: "link-4",
    fromIssueId: "iss-32",
    toIssueId: "iss-45",
    type: "relates to",
  }, // PLAT-51 relates PLAT-64
  {
    id: "link-5",
    fromIssueId: "iss-33",
    toIssueId: "iss-42",
    type: "is caused by",
  }, // PLAT-52 caused by PLAT-61
  { id: "link-6", fromIssueId: "iss-37", toIssueId: "iss-23", type: "blocks" }, // PLAT-56 blocks PLAT-32
  { id: "link-7", fromIssueId: "iss-21", toIssueId: "iss-22", type: "blocks" }, // PLAT-30 blocks PLAT-31
]

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

export const boards: Board[] = [
  {
    id: "board-1",
    name: "PLAT Board",
    projectId: "proj-4",
    type: "scrum",
    columns: [
      { name: "Open", statuses: ["Open"] },
      { name: "In Development", statuses: ["In Development"] },
      { name: "Code Review", statuses: ["Code Review"] },
      { name: "QA", statuses: ["QA"] },
      { name: "Staging", statuses: ["Staging"] },
      { name: "Done", statuses: ["Done", "Won't Fix"] },
    ],
  },
  {
    id: "board-2",
    name: "FAPP Board",
    projectId: "proj-5",
    type: "scrum",
    columns: [
      { name: "Backlog", statuses: ["Backlog"] },
      { name: "Ready", statuses: ["Ready"] },
      { name: "In Progress", statuses: ["In Progress"] },
      { name: "In Review", statuses: ["In Review"] },
      { name: "QA", statuses: ["QA"] },
      { name: "Done", statuses: ["Done", "Won't Fix"] },
    ],
  },
  {
    id: "board-3",
    name: "LCRM Board",
    projectId: "proj-8",
    type: "scrum",
    columns: [
      { name: "To Do", statuses: ["To Do"] },
      { name: "Doing", statuses: ["Doing"] },
      { name: "Review", statuses: ["Review"] },
      { name: "Testing", statuses: ["Testing"] },
      { name: "Done", statuses: ["Done", "Rejected"] },
    ],
  },
]

// ---------------------------------------------------------------------------
// Custom Fields — spec §4.6
// ---------------------------------------------------------------------------

export const customFields: CustomField[] = [
  { id: "cf-1", name: "Story Points", type: "number", appliedTo: "all" },
  { id: "cf-2", name: "Sprint", type: "sprint", appliedTo: "all" },
  { id: "cf-3", name: "Epic Link", type: "epicLink", appliedTo: "all" },
  {
    id: "cf-4",
    name: "Environment",
    type: "select",
    options: ["Production", "Staging", "Dev", "Local"],
    appliedTo: "all",
  },
  {
    id: "cf-5",
    name: "Severity",
    type: "select",
    options: ["SEV-1", "SEV-2", "SEV-3", "SEV-4"],
    appliedTo: "all",
  },
  {
    id: "cf-6",
    name: "Customer Impact",
    type: "select",
    options: ["None", "Low", "Medium", "High", "Critical"],
    appliedTo: "all",
  },
  { id: "cf-7", name: "Root Cause", type: "text", appliedTo: "all" },
  { id: "cf-8", name: "QA Sign-Off", type: "user", appliedTo: ["proj-4"] },
]

// ---------------------------------------------------------------------------
// Automation Rules — spec §4.7
// ---------------------------------------------------------------------------

export const automationRules: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Auto-assign on sprint add",
    trigger: "Issue added to sprint",
    condition: "Assignee is empty",
    action: "Assign to project lead",
    enabled: true,
  },
  {
    id: "rule-2",
    name: "Notify on critical bug",
    trigger: "Bug created with priority Critical",
    condition: "—",
    action: "Email engineering managers",
    enabled: true,
  },
  {
    id: "rule-3",
    name: "Close stale issues",
    trigger: "Scheduled: weekly",
    condition: "Status = Open, no update for 60 days",
    action: "Transition to Won't Fix",
    enabled: true,
  },
  {
    id: "rule-4",
    name: "Sprint complete reminder",
    trigger: "Sprint end date - 1 day",
    condition: "—",
    action: "Slack message to #engineering",
    enabled: true,
  },
  {
    id: "rule-5",
    name: "Subtask rollup",
    trigger: "All sub-tasks Done",
    condition: "Parent issue status != Done",
    action: "Transition parent to QA",
    enabled: true,
  },
]

// ---------------------------------------------------------------------------
// Dashboards — spec §4.8
// ---------------------------------------------------------------------------

export const dashboards: Dashboard[] = [
  {
    id: "dash-1",
    name: "Engineering Overview",
    ownerId: "usr-2",
    gadgets: [
      "Sprint burndown (PLAT)",
      "Velocity chart",
      "Open bugs by priority",
      "Created vs Resolved trend",
    ],
  },
  {
    id: "dash-2",
    name: "Support Dashboard",
    ownerId: "usr-3",
    gadgets: [
      "Kanban status (SUS+SEU+SAP)",
      "Avg time in status",
      "Issues by priority",
    ],
  },
]

// ---------------------------------------------------------------------------
// Saved Filters — spec §4.9
// ---------------------------------------------------------------------------

export const filters: SavedFilter[] = [
  {
    id: "filter-1",
    name: "My Open Issues",
    jql: 'assignee = currentUser() AND status != Done AND status != "Won\'t Fix"',
    owner: "usr-1",
    createdAt: "2026-01-20T09:00:00.000Z",
    sharedWith: "all",
  },
  {
    id: "filter-2",
    name: "PLAT — Release v2.3.0",
    jql: 'project = PLAT AND fixVersion = "v2.3.0"',
    owner: "usr-2",
    createdAt: "2026-02-01T09:00:00.000Z",
    sharedWith: "engineering",
  },
  {
    id: "filter-3",
    name: "All Critical Bugs",
    jql: "priority = Critical AND type = Bug AND status != Done",
    owner: "usr-2",
    createdAt: "2026-02-10T09:00:00.000Z",
    sharedWith: "engineering",
  },
  {
    id: "filter-4",
    name: "Sprint 13 — Active",
    jql: "sprint in openSprints() AND project = PLAT",
    owner: "usr-3",
    createdAt: "2026-03-31T09:00:00.000Z",
    sharedWith: "engineering",
  },
  {
    id: "filter-5",
    name: "Unassigned Backlog",
    jql: "assignee is EMPTY AND status = Open",
    owner: "usr-1",
    createdAt: "2026-02-15T09:00:00.000Z",
    sharedWith: "engineering",
  },
  {
    id: "filter-6",
    name: "This Week's Resolved",
    jql: "resolved >= startOfWeek() AND project = PLAT",
    owner: "usr-2",
    createdAt: "2026-03-01T09:00:00.000Z",
    sharedWith: "engineering",
  },
]

// ---------------------------------------------------------------------------
// Issue History (seed — a few recent examples; store mutations append more)
// ---------------------------------------------------------------------------

export const issueHistory: IssueHistoryEntry[] = [
  {
    id: "hist-1",
    issueId: "iss-2",
    authorId: "usr-5",
    field: "status",
    oldValue: "Open",
    newValue: "In Development",
    createdAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "hist-2",
    issueId: "iss-3",
    authorId: "usr-12",
    field: "status",
    oldValue: "In Development",
    newValue: "Code Review",
    createdAt: "2026-04-08T14:00:00.000Z",
  },
  {
    id: "hist-3",
    issueId: "iss-5",
    authorId: "usr-3",
    field: "status",
    oldValue: "QA",
    newValue: "Done",
    createdAt: "2026-03-29T14:00:00.000Z",
  },
  {
    id: "hist-4",
    issueId: "iss-31",
    authorId: "usr-9",
    field: "priority",
    oldValue: "medium",
    newValue: "high",
    createdAt: "2026-04-08T11:00:00.000Z",
  },
  {
    id: "hist-5",
    issueId: "iss-39",
    authorId: "usr-19",
    field: "status",
    oldValue: null,
    newValue: "Open",
    createdAt: "2026-04-11T09:00:00.000Z",
  },
]

export const comments: Comment[] = [
  {
    id: "cmt-1",
    issueId: "iss-39",
    authorId: "usr-19",
    body: "Reported by MegaCorp. Customer impact is HIGH — they can't process orders over $10K. See Zendesk ZD-1001 for full thread.",
    createdAt: "2026-04-11T09:30:00.000Z",
    updatedAt: "2026-04-11T09:30:00.000Z",
  },
  {
    id: "cmt-2",
    issueId: "iss-39",
    authorId: "usr-3",
    body: "Confirmed. Int32 overflow in amount field. Need to widen to int64 across the payment flow.",
    createdAt: "2026-04-11T14:00:00.000Z",
    updatedAt: "2026-04-11T14:00:00.000Z",
  },
  {
    id: "cmt-3",
    issueId: "iss-2",
    authorId: "usr-5",
    body: "Started work. Rotation logic + grace period for in-flight requests.",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "cmt-4",
    issueId: "iss-3",
    authorId: "usr-12",
    body: "Ready for review. Redis TTL semantics tested with integration suite.",
    createdAt: "2026-04-08T14:00:00.000Z",
    updatedAt: "2026-04-08T14:00:00.000Z",
  },
  {
    id: "cmt-5",
    issueId: "iss-37",
    authorId: "usr-13",
    body: "Reproduced under load. Looks like leak is from failed transactions not returning connections.",
    createdAt: "2026-04-08T16:00:00.000Z",
    updatedAt: "2026-04-08T16:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Plans (legacy export — retained for API compatibility)
// ---------------------------------------------------------------------------

export interface Plan {
  [key: string]: unknown
  id: string
  name: string
  access: "open" | "private" | "team"
  workSources: { type: "space" | "board" | "filter"; name: string }[]
  owner: string
  createdAt: string
}

export const plans: Plan[] = []

export const teams: Team[] = [
  {
    id: "team-1",
    name: "Engineering",
    description:
      "Build and maintain the core product, APIs, and infrastructure.",
    members: 12,
    color: "bg-blue-500",
    createdAt: "2025-06-01T09:00:00.000Z",
  },
  {
    id: "team-2",
    name: "Product",
    description:
      "Define product strategy, roadmap, and feature prioritization.",
    members: 6,
    color: "bg-purple-500",
    createdAt: "2025-06-01T09:00:00.000Z",
  },
  {
    id: "team-3",
    name: "Design",
    description: "Craft user experiences, visual design, and design systems.",
    members: 5,
    color: "bg-pink-500",
    createdAt: "2025-06-01T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export const dashboardStats = {
  totalIssues: issues.length,
  openIssues: issues.filter(
    (i) =>
      i.status !== "Done" &&
      i.status !== "Closed" &&
      i.status !== "Won't Fix" &&
      i.status !== "Rejected"
  ).length,
  inProgressIssues: issues.filter((i) =>
    ["In Development", "In Progress", "Doing", "Fix in Progress"].includes(
      i.status
    )
  ).length,
  inReviewIssues: issues.filter((i) =>
    ["Code Review", "In Review", "Review", "Peer Review"].includes(i.status)
  ).length,
  doneIssues: issues.filter((i) => i.status === "Done").length,
  unassignedIssues: issues.filter((i) => i.assigneeId === null).length,
  activeSprints: sprints.filter((s) => s.state === "active").length,
  totalProjects: projects.length,
}
