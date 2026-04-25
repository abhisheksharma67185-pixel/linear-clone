// ---------------------------------------------------------------------------
// CESS Benchmark Seed Data — Linear (Theta Engineering workspace)
// Anchor date: 2026-04-13 (benchmark day)
// Identity IDs are internal (usr-N, team-N, iss-N). Display values (name,
// email, identifier, key) match the CESS spec exactly.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Member {
  [key: string]: unknown
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "member"
  /** CESS cross-platform identity (LU001, etc.) */
  cessId: string
}

export interface Team {
  [key: string]: unknown
  id: string
  name: string
  key: string
  description: string
  leadId: string
  memberIds: string[]
  createdAt: string
}

export interface Project {
  [key: string]: unknown
  id: string
  name: string
  description: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  leadId: string | null
  teamId: string
  targetDate: string | null
  createdAt: string
}

export interface Issue {
  [key: string]: unknown
  id: string
  identifier: string
  title: string
  description: string
  status: "backlog" | "todo" | "in_progress" | "done" | "cancelled"
  priority: "urgent" | "high" | "medium" | "low" | "none"
  assigneeId: string | null
  creatorId: string
  /**
   * Users who follow this issue and receive notifications. Distinct from
   * `creatorId`: an issue can be created by user A and subscribed to by
   * users B, C, D — and the "/my-issues subscribed" filter must use
   * this field, not `creatorId`.
   *
   * Optional/back-compat: pre-seeded fixtures may omit it; readers should
   * treat undefined as `[]`.
   */
  subscriberIds?: string[]
  teamId: string
  projectId: string | null
  cycleId: string | null
  labelIds: string[]
  estimate: number | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Cycle {
  [key: string]: unknown
  id: string
  name: string
  description: string
  teamId: string
  startDate: string
  endDate: string
  state: "active" | "upcoming" | "completed"
  /** Planned story points for this cycle. */
  plannedPoints: number
  /** Completed story points (only meaningful for completed/active cycles). */
  completedPoints: number
}

export interface Label {
  [key: string]: unknown
  id: string
  name: string
  /** Optional longer description shown in the labels settings table. */
  description?: string
  color: string
  teamId: string | null // null = workspace-level
  /** CESS label grouping (Area, Type, Status, Source, Severity). */
  group: "Area" | "Type" | "Status" | "Source" | "Severity"
  /** ISO timestamp when archived; undefined/null = active. */
  archivedAt?: string | null
}

export interface View {
  [key: string]: unknown
  id: string
  name: string
  description: string
  filterQuery: string
  ownerId: string
  teamId: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

export const workspace = {
  name: "Theta Engineering",
  urlKey: "theta-eng",
}

// ---------------------------------------------------------------------------
// Members — spec §2.2 (15 users, LU001..LU015)
// ---------------------------------------------------------------------------

export const members: Member[] = [
  {
    id: "usr-1",
    cessId: "LU001",
    name: "Priya Sharma",
    email: "priya@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    role: "admin",
  },
  {
    id: "usr-2",
    cessId: "LU002",
    name: "Arjun Mehta",
    email: "arjun@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    role: "admin",
  },
  {
    id: "usr-3",
    cessId: "LU003",
    name: "Ravi Kumar",
    email: "ravi@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ravi",
    role: "member",
  },
  {
    id: "usr-4",
    cessId: "LU004",
    name: "Sneha Reddy",
    email: "sneha@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",
    role: "member",
  },
  {
    id: "usr-5",
    cessId: "LU005",
    name: "Kiran Patel",
    email: "kiran@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kiran",
    role: "member",
  },
  {
    id: "usr-6",
    cessId: "LU006",
    name: "Ananya Iyer",
    email: "ananya@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya",
    role: "member",
  },
  {
    id: "usr-7",
    cessId: "LU007",
    name: "Vikram Singh",
    email: "vikram@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    role: "member",
  },
  {
    id: "usr-8",
    cessId: "LU008",
    name: "Meera Nair",
    email: "meera@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=meera",
    role: "member",
  },
  {
    id: "usr-9",
    cessId: "LU009",
    name: "Amit Verma",
    email: "amit@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    role: "member",
  },
  {
    id: "usr-10",
    cessId: "LU010",
    name: "Lakshmi Rao",
    email: "lakshmi@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lakshmi",
    role: "member",
  },
  {
    id: "usr-11",
    cessId: "LU011",
    name: "Aisha Khan",
    email: "aisha@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha",
    role: "member",
  },
  {
    id: "usr-12",
    cessId: "LU012",
    name: "Nikhil Joshi",
    email: "nikhil@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nikhil",
    role: "member",
  },
  {
    id: "usr-13",
    cessId: "LU013",
    name: "Sanjay Gupta",
    email: "sanjay@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay",
    role: "member",
  },
  {
    id: "usr-14",
    cessId: "LU014",
    name: "Thomas Weber",
    email: "thomas@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas",
    role: "member",
  },
  {
    id: "usr-15",
    cessId: "LU015",
    name: "Suresh Pillai",
    email: "suresh@theta.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=suresh",
    role: "member",
  },
]

// ---------------------------------------------------------------------------
// Teams — spec §2.3
// ---------------------------------------------------------------------------

export const teams: Team[] = [
  {
    id: "team-1",
    name: "Platform",
    key: "PLT",
    description:
      "Backend platform team owning auth, payments, and API gateway.",
    leadId: "usr-3",
    memberIds: [
      "usr-3",
      "usr-5",
      "usr-7",
      "usr-9",
      "usr-10",
      "usr-13",
      "usr-14",
      "usr-15",
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "team-2",
    name: "Frontend",
    key: "FE",
    description:
      "Frontend engineering team owning the checkout flow and merchant dashboard.",
    leadId: "usr-4",
    memberIds: ["usr-4", "usr-6", "usr-12", "usr-15"],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "team-3",
    name: "Infra",
    key: "INF",
    description:
      "Infrastructure team owning Kubernetes, CI/CD, and observability.",
    leadId: "usr-7",
    memberIds: ["usr-7", "usr-5", "usr-9", "usr-10"],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "team-4",
    name: "Legacy",
    key: "LEG",
    description:
      "Inherited backlog from the acquired codebase. Used for cleanup/triage tasks.",
    leadId: "usr-9",
    memberIds: ["usr-9", "usr-10", "usr-13"],
    createdAt: "2025-12-15T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Labels — spec §2.4 (12 workspace labels in 5 groups)
// ---------------------------------------------------------------------------

export const labels: Label[] = [
  // Area
  {
    id: "label-1",
    name: "frontend",
    color: "#3b82f6",
    teamId: null,
    group: "Area",
  },
  {
    id: "label-2",
    name: "backend",
    color: "#22c55e",
    teamId: null,
    group: "Area",
  },
  {
    id: "label-3",
    name: "infra",
    color: "#f97316",
    teamId: null,
    group: "Area",
  },
  {
    id: "label-4",
    name: "design-needed",
    color: "#a855f7",
    teamId: null,
    group: "Area",
  },
  // Type
  { id: "label-5", name: "bug", color: "#ef4444", teamId: null, group: "Type" },
  {
    id: "label-6",
    name: "feature",
    color: "#14b8a6",
    teamId: null,
    group: "Type",
  },
  {
    id: "label-7",
    name: "tech-debt",
    color: "#6b7280",
    teamId: null,
    group: "Type",
  },
  {
    id: "label-8",
    name: "improvement",
    color: "#06b6d4",
    teamId: null,
    group: "Type",
  },
  // Status
  {
    id: "label-9",
    name: "blocked",
    color: "#dc2626",
    teamId: null,
    group: "Status",
  },
  // Source
  {
    id: "label-10",
    name: "customer-reported",
    color: "#eab308",
    teamId: null,
    group: "Source",
  },
  // Severity
  {
    id: "label-11",
    name: "p1-critical",
    color: "#b91c1c",
    teamId: null,
    group: "Severity",
  },
  {
    id: "label-12",
    name: "p2-high",
    color: "#ea580c",
    teamId: null,
    group: "Severity",
  },
]

// ---------------------------------------------------------------------------
// Projects — spec §2.5 (3 projects, all in progress)
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Auth Service",
    description:
      "Complete rewrite of the authentication service — OAuth2 PKCE, MFA, SSO, and permission model redesign.",
    status: "in_progress",
    leadId: "usr-3",
    teamId: "team-1",
    targetDate: "2026-06-30",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "proj-2",
    name: "New Checkout Flow",
    description:
      "Redesigned mobile-first checkout with A/B test framework and saved payment methods.",
    status: "in_progress",
    leadId: "usr-4",
    teamId: "team-2",
    targetDate: "2026-05-30",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "proj-3",
    name: "Payment API v2",
    description:
      "Payment gateway abstraction with Stripe v2 and PayPal integrations, idempotency, and retry logic.",
    status: "in_progress",
    leadId: null,
    teamId: "team-1",
    targetDate: "2026-06-15",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Cycles — spec §2.6 (14 cycles with velocity data)
// ---------------------------------------------------------------------------

export const cycles: Cycle[] = [
  // Platform team — Sprint 8..13
  {
    id: "cycle-1",
    name: "Sprint 8",
    description: "Foundation work for Auth Service rewrite",
    teamId: "team-1",
    startDate: "2026-01-20",
    endDate: "2026-02-02",
    state: "completed",
    plannedPoints: 40,
    completedPoints: 37,
  },
  {
    id: "cycle-2",
    name: "Sprint 9",
    description: "OAuth2 PKCE flow and token revocation",
    teamId: "team-1",
    startDate: "2026-02-03",
    endDate: "2026-02-16",
    state: "completed",
    plannedPoints: 42,
    completedPoints: 40,
  },
  {
    id: "cycle-3",
    name: "Sprint 10",
    description: "Payment gateway abstraction layer",
    teamId: "team-1",
    startDate: "2026-02-17",
    endDate: "2026-03-02",
    state: "completed",
    plannedPoints: 45,
    completedPoints: 38,
  },
  {
    id: "cycle-4",
    name: "Sprint 11",
    description: "Payment API groundwork + MFA TOTP",
    teamId: "team-1",
    startDate: "2026-03-03",
    endDate: "2026-03-16",
    state: "completed",
    plannedPoints: 48,
    completedPoints: 45,
  },
  {
    id: "cycle-5",
    name: "Sprint 12",
    description: "Permission model redesign",
    teamId: "team-1",
    startDate: "2026-03-17",
    endDate: "2026-03-30",
    state: "completed",
    plannedPoints: 50,
    completedPoints: 42,
  },
  {
    id: "cycle-6",
    name: "Sprint 13",
    description: "Pre-release hardening for v2.3.0",
    teamId: "team-1",
    startDate: "2026-03-31",
    endDate: "2026-04-13",
    state: "active",
    plannedPoints: 48,
    completedPoints: 35,
  },
  // Frontend team — FE Sprint 10..13
  {
    id: "cycle-7",
    name: "FE Sprint 10",
    description: "Checkout cart + summary components",
    teamId: "team-2",
    startDate: "2026-02-17",
    endDate: "2026-03-02",
    state: "completed",
    plannedPoints: 30,
    completedPoints: 28,
  },
  {
    id: "cycle-8",
    name: "FE Sprint 11",
    description: "Payment form UI",
    teamId: "team-2",
    startDate: "2026-03-03",
    endDate: "2026-03-16",
    state: "completed",
    plannedPoints: 32,
    completedPoints: 30,
  },
  {
    id: "cycle-9",
    name: "FE Sprint 12",
    description: "Mobile responsive + error states",
    teamId: "team-2",
    startDate: "2026-03-17",
    endDate: "2026-03-30",
    state: "completed",
    plannedPoints: 35,
    completedPoints: 32,
  },
  {
    id: "cycle-10",
    name: "FE Sprint 13",
    description: "Accessibility audit and polish",
    teamId: "team-2",
    startDate: "2026-03-31",
    endDate: "2026-04-13",
    state: "active",
    plannedPoints: 33,
    completedPoints: 22,
  },
  // Infra team — Infra Sprint 10..13
  {
    id: "cycle-11",
    name: "Infra Sprint 10",
    description: "CI/CD pipeline upgrade",
    teamId: "team-3",
    startDate: "2026-02-17",
    endDate: "2026-03-02",
    state: "completed",
    plannedPoints: 25,
    completedPoints: 25,
  },
  {
    id: "cycle-12",
    name: "Infra Sprint 11",
    description: "K8s cluster upgrade",
    teamId: "team-3",
    startDate: "2026-03-03",
    endDate: "2026-03-16",
    state: "completed",
    plannedPoints: 28,
    completedPoints: 24,
  },
  {
    id: "cycle-13",
    name: "Infra Sprint 12",
    description: "Observability stack (Prometheus)",
    teamId: "team-3",
    startDate: "2026-03-17",
    endDate: "2026-03-30",
    state: "completed",
    plannedPoints: 30,
    completedPoints: 27,
  },
  {
    id: "cycle-14",
    name: "Infra Sprint 13",
    description: "Rate limiting + distributed tracing",
    teamId: "team-3",
    startDate: "2026-03-31",
    endDate: "2026-04-13",
    state: "active",
    plannedPoints: 26,
    completedPoints: 18,
  },
]

// ---------------------------------------------------------------------------
// Issues
//
// Section A: Auth Service project (23 issues, PLT-101..123)
// Section B: New Checkout Flow project (15 issues, FE-40..54)
// Section C: Payment API v2 project (12 issues, PLT-201..212)
// Section D: Platform backlog / triage (45 issues, PLT-301..345)
// Section E: Legacy inherited (85 issues, LEG-001..085)
// ---------------------------------------------------------------------------

// Quick label-id lookups for readability
const L = {
  frontend: "label-1",
  backend: "label-2",
  infra: "label-3",
  designNeeded: "label-4",
  bug: "label-5",
  feature: "label-6",
  techDebt: "label-7",
  improvement: "label-8",
  blocked: "label-9",
  customerReported: "label-10",
  p1: "label-11",
  p2: "label-12",
} as const

// --- Section A: Auth Service (PLT-101..123) ---
const authServiceIssues: Issue[] = [
  {
    id: "iss-1",
    identifier: "PLT-101",
    title: "Implement OAuth2 PKCE flow",
    description:
      "Build the OAuth2 authorization code flow with PKCE for public clients.",
    status: "done",
    priority: "high",
    assigneeId: "usr-3",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: [L.backend, L.feature],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-01-22T09:00:00.000Z",
    updatedAt: "2026-02-10T15:00:00.000Z",
  },
  {
    id: "iss-2",
    identifier: "PLT-102",
    title: "Add refresh token rotation",
    description:
      "Rotate refresh tokens on every use to prevent replay attacks.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-5",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend, L.feature],
    estimate: 5,
    dueDate: "2026-04-12",
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z",
  },
  {
    id: "iss-3",
    identifier: "PLT-103",
    title: "Session management API",
    description:
      "Server-side session storage with Redis-backed sliding expiration.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-9",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend, L.feature],
    estimate: 5,
    dueDate: "2026-04-12",
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "iss-4",
    identifier: "PLT-104",
    title: "Rate limiting for auth endpoints",
    description:
      "Token-bucket rate limiting for /login, /register, /reset-password.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-13",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend, L.infra],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-04-08T11:00:00.000Z",
  },
  {
    id: "iss-5",
    identifier: "PLT-105",
    title: "Multi-factor auth — TOTP",
    description: "RFC 6238 TOTP with QR code enrollment and backup codes.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-3",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-5",
    labelIds: [L.backend, L.feature],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-03-05T09:00:00.000Z",
    updatedAt: "2026-04-09T14:00:00.000Z",
  },
  {
    id: "iss-6",
    identifier: "PLT-106",
    title: "Multi-factor auth — WebAuthn",
    description:
      "WebAuthn/FIDO2 enrollment and authentication for hardware keys.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-5",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend, L.feature],
    estimate: 13,
    dueDate: null,
    createdAt: "2026-03-10T09:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "iss-7",
    identifier: "PLT-107",
    title: "SSO integration — SAML",
    description:
      "SAML 2.0 IdP-initiated and SP-initiated flows with signed assertions.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-14",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend, L.feature],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-04-09T15:00:00.000Z",
  },
  {
    id: "iss-8",
    identifier: "PLT-108",
    title: "SSO integration — OIDC",
    description: "OIDC discovery and token exchange for enterprise customers.",
    status: "todo",
    priority: "high",
    assigneeId: "usr-14",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend, L.feature],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-15T09:00:00.000Z",
    updatedAt: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "iss-9",
    identifier: "PLT-109",
    title: "Auth audit logging",
    description:
      "Structured audit logs for login, logout, MFA, and permission changes.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend, L.infra],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "iss-10",
    identifier: "PLT-110",
    title: "Token revocation endpoint",
    description: "POST /oauth/revoke per RFC 7009 with immediate propagation.",
    status: "done",
    priority: "high",
    assigneeId: "usr-9",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: [L.backend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-02-04T09:00:00.000Z",
    updatedAt: "2026-02-14T15:00:00.000Z",
  },
  {
    id: "iss-11",
    identifier: "PLT-111",
    title: "Password policy enforcement",
    description:
      "Configurable password strength requirements with zxcvbn scoring.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-13",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-22T09:00:00.000Z",
    updatedAt: "2026-03-22T09:00:00.000Z",
  },
  {
    id: "iss-12",
    identifier: "PLT-112",
    title: "Brute force protection",
    description:
      "Exponential backoff and account lockout after N failed attempts.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-10",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend, L.infra],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "iss-13",
    identifier: "PLT-113",
    title: "Auth service load testing",
    description:
      "k6 scripts to verify 10k RPS sustained under realistic auth mix.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-7",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.infra],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-28T09:00:00.000Z",
    updatedAt: "2026-03-28T09:00:00.000Z",
  },
  {
    id: "iss-14",
    identifier: "PLT-114",
    title: "Permission model redesign",
    description: "Move from role-based to policy-based permissions with Rego.",
    status: "todo",
    priority: "urgent",
    assigneeId: "usr-3",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend, L.techDebt],
    estimate: 13,
    dueDate: "2026-04-13",
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-04-08T11:00:00.000Z",
  },
  {
    id: "iss-15",
    identifier: "PLT-115",
    title: "API key management UI",
    description:
      "Self-service API key creation, rotation, and revocation in dashboard.",
    status: "todo",
    priority: "low",
    assigneeId: "usr-15",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
  },
  {
    id: "iss-16",
    identifier: "PLT-116",
    title: "Auth error code standardization",
    description: "Map internal errors to stable OAuth2 error codes per spec.",
    status: "done",
    priority: "low",
    assigneeId: "usr-5",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-2",
    labelIds: [L.backend, L.techDebt],
    estimate: 2,
    dueDate: null,
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-02-12T10:00:00.000Z",
  },
  {
    id: "iss-17",
    identifier: "PLT-117",
    title: "Device trust framework",
    description:
      "Persistent device fingerprints with trust-on-first-use and revocation.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "iss-18",
    identifier: "PLT-118",
    title: "Auth migration script v1→v2",
    description:
      "Zero-downtime migration of existing users and sessions to new schema.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-10",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: "cycle-6",
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "iss-19",
    identifier: "PLT-119",
    title: "Auth SDK update (Python)",
    description:
      "Update PyPI package to support new endpoints and refresh flow.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-9",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
  },
  {
    id: "iss-20",
    identifier: "PLT-120",
    title: "Auth SDK update (Node.js)",
    description:
      "Update npm package to support new endpoints and refresh flow.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-13",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
  },
  {
    id: "iss-21",
    identifier: "PLT-121",
    title: "Auth metrics dashboard",
    description:
      "Grafana dashboard with login rates, MFA adoption, and error breakdowns.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-7",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.infra],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-22",
    identifier: "PLT-122",
    title: "Login page redesign",
    description:
      "Mobile-first login page with inline validation and social login buttons.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "usr-12",
    creatorId: "usr-4",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.frontend, L.designNeeded],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-28T09:00:00.000Z",
    updatedAt: "2026-04-09T14:00:00.000Z",
  },
  {
    id: "iss-23",
    identifier: "PLT-123",
    title: "Security review — auth service",
    description: "External pen test and code review before v2.3.0 GA.",
    status: "backlog",
    priority: "high",
    assigneeId: null,
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-1",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-05T09:00:00.000Z",
  },
]

// --- Section B: New Checkout Flow (FE-40..54) ---
const checkoutIssues: Issue[] = [
  {
    id: "iss-24",
    identifier: "FE-40",
    title: "Cart page layout",
    description:
      "Responsive cart page with item list, summary, and proceed CTA.",
    status: "done",
    priority: "high",
    assigneeId: "usr-4",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: "cycle-8",
    labelIds: [L.frontend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-05T09:00:00.000Z",
    updatedAt: "2026-03-14T16:00:00.000Z",
  },
  {
    id: "iss-25",
    identifier: "FE-41",
    title: "Cart summary component",
    description: "Sticky cart summary with subtotal, shipping, tax, and total.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-6",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: "cycle-10",
    labelIds: [L.frontend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-04-09T15:00:00.000Z",
  },
  {
    id: "iss-26",
    identifier: "FE-42",
    title: "Checkout UI — payment step",
    description:
      "Card input with real-time validation and tokenization via Stripe.js.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-4",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: "cycle-10",
    labelIds: [L.frontend],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-27",
    identifier: "FE-43",
    title: "Address autocomplete",
    description: "Google Places integration for shipping address autofill.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-12",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-28T09:00:00.000Z",
    updatedAt: "2026-03-28T09:00:00.000Z",
  },
  {
    id: "iss-28",
    identifier: "FE-44",
    title: "Order confirmation page",
    description:
      "Post-purchase confirmation page with order details and receipt.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-6",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-29T09:00:00.000Z",
    updatedAt: "2026-03-29T09:00:00.000Z",
  },
  {
    id: "iss-29",
    identifier: "FE-45",
    title: "Checkout A/B test framework",
    description:
      "Client-side A/B test harness with variant assignment and tracking.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "usr-15",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: "cycle-10",
    labelIds: [L.frontend, L.infra],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-04-09T16:00:00.000Z",
  },
  {
    id: "iss-30",
    identifier: "FE-46",
    title: "Mobile responsive checkout",
    description:
      "Ensure checkout works on iOS Safari and Android Chrome at 320px+.",
    status: "todo",
    priority: "high",
    assigneeId: "usr-4",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "iss-31",
    identifier: "FE-47",
    title: "Checkout analytics events",
    description:
      "Emit structured events for each checkout step to the data warehouse.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 2,
    dueDate: null,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-32",
    identifier: "FE-48",
    title: "Gift card redemption flow",
    description: "Apply gift card during checkout with balance preview.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-33",
    identifier: "FE-49",
    title: "Saved payment methods UI",
    description: "List and manage saved payment methods per customer account.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-12",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-28T09:00:00.000Z",
    updatedAt: "2026-03-28T09:00:00.000Z",
  },
  {
    id: "iss-34",
    identifier: "FE-50",
    title: "Checkout error handling",
    description:
      "Graceful error UI for declined cards, network failures, and timeouts.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-6",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: "cycle-10",
    labelIds: [L.frontend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "iss-35",
    identifier: "FE-51",
    title: "Order summary email template",
    description: "Transactional email template for order confirmation.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 2,
    dueDate: null,
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-36",
    identifier: "FE-52",
    title: "Checkout loading states",
    description: "Skeleton and spinner states for each checkout step.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-15",
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 2,
    dueDate: null,
    createdAt: "2026-03-29T09:00:00.000Z",
    updatedAt: "2026-03-29T09:00:00.000Z",
  },
  {
    id: "iss-37",
    identifier: "FE-53",
    title: "Promo code input",
    description: "Apply and validate promotional discount codes at checkout.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "iss-38",
    identifier: "FE-54",
    title: "Checkout accessibility audit",
    description:
      "WCAG 2.1 AA audit of the full checkout flow with remediation.",
    status: "backlog",
    priority: "high",
    assigneeId: null,
    creatorId: "usr-4",
    teamId: "team-2",
    projectId: "proj-2",
    cycleId: null,
    labelIds: [L.frontend, L.designNeeded],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
  },
]

// --- Section C: Payment API v2 (PLT-201..212) ---
const paymentApiIssues: Issue[] = [
  {
    id: "iss-39",
    identifier: "PLT-201",
    title: "Payment gateway abstraction layer",
    description: "Unified interface for Stripe, PayPal, and future gateways.",
    status: "done",
    priority: "high",
    assigneeId: "usr-3",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: "cycle-3",
    labelIds: [L.backend, L.feature],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-02-18T09:00:00.000Z",
    updatedAt: "2026-02-28T16:00:00.000Z",
  },
  {
    id: "iss-40",
    identifier: "PLT-202",
    title: "Stripe v2 integration",
    description: "Migrate from legacy Stripe API to v2 with PaymentIntents.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-5",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: "cycle-6",
    labelIds: [L.backend],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "iss-41",
    identifier: "PLT-203",
    title: "PayPal integration",
    description:
      "PayPal Checkout v2 with billing agreements for recurring payments.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-13",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
  },
  {
    id: "iss-42",
    identifier: "PLT-204",
    title: "Payment webhook handler",
    description: "Verify and process async gateway webhooks with dedupe.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-9",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: "cycle-6",
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "iss-43",
    identifier: "PLT-205",
    title: "Idempotency key implementation",
    description: "Idempotency-Key header support for safe payment retries.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-10",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: "cycle-6",
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-04-09T15:00:00.000Z",
  },
  {
    id: "iss-44",
    identifier: "PLT-206",
    title: "Payment retry logic",
    description: "Exponential backoff retry for transient gateway failures.",
    status: "todo",
    priority: "high",
    assigneeId: "usr-5",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-28T09:00:00.000Z",
    updatedAt: "2026-03-28T09:00:00.000Z",
  },
  {
    id: "iss-45",
    identifier: "PLT-207",
    title: "Refund processing flow",
    description:
      "Full and partial refunds with audit trail and webhook fanout.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "iss-46",
    identifier: "PLT-208",
    title: "Payment audit trail",
    description: "Append-only event log for every payment state transition.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "iss-47",
    identifier: "PLT-209",
    title: "Currency conversion service",
    description:
      "FX conversion using daily rates with 15-minute staleness alarm.",
    status: "todo",
    priority: "medium",
    assigneeId: "usr-14",
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 5,
    dueDate: null,
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "iss-48",
    identifier: "PLT-210",
    title: "Payment load testing",
    description: "k6 suite simulating 5k concurrent checkouts.",
    status: "backlog",
    priority: "medium",
    assigneeId: null,
    creatorId: "usr-7",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.infra],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "iss-49",
    identifier: "PLT-211",
    title: "PCI compliance documentation",
    description: "SAQ-D documentation for the new payment flow architecture.",
    status: "in_progress",
    priority: "high",
    assigneeId: "usr-3",
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: "cycle-6",
    labelIds: [L.backend],
    estimate: 3,
    dueDate: null,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z",
  },
  {
    id: "iss-50",
    identifier: "PLT-212",
    title: "Payment SDK (public)",
    description: "Public payment SDK for merchants to embed payment UI.",
    status: "backlog",
    priority: "low",
    assigneeId: null,
    creatorId: "usr-3",
    teamId: "team-1",
    projectId: "proj-3",
    cycleId: null,
    labelIds: [L.backend],
    estimate: 8,
    dueDate: null,
    createdAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-02T09:00:00.000Z",
  },
]

// --- Section D: Platform backlog / triage (PLT-301..345) — spec §2.7 ---
// 15 with bare title+description only, 15 with +priority, 15 with +priority+labels. None have estimates or cycles.

const triageTitles = [
  // PLT-301..315 (bare)
  "Investigate memory leak in worker pool",
  "Add request tracing headers",
  "Refactor config loader",
  "Upgrade gRPC to latest version",
  "Consolidate logger wrappers",
  "Remove unused feature flags",
  "Improve CLI argument parsing",
  "Fix flaky integration tests",
  "Document API error taxonomy",
  "Deprecate v1 user endpoint",
  "Investigate high disk I/O on worker-3",
  "Audit S3 bucket permissions",
  "Refactor retry middleware",
  "Clean up dead code in utils/",
  "Migrate cron jobs to workflows",
  // PLT-316..330 (+priority)
  "Fix race condition in cache invalidation",
  "Add circuit breaker to downstream API",
  "Upgrade PostgreSQL to v16",
  "Investigate slow queries on orders table",
  "Add Prometheus alerts for queue depth",
  "Fix flaky deploy pipeline",
  "Review and rotate API keys",
  "Add health check endpoint for auth service",
  "Reduce Docker image size",
  "Investigate CI cache hit rate drop",
  "Add dead letter queue for webhooks",
  "Migrate secrets to Vault",
  "Fix timezone handling in reports",
  "Add compression to static assets",
  "Audit dependency licenses",
  // PLT-331..345 (+priority+labels)
  "Implement request rate limiting per API key",
  "Add retry budget to downstream calls",
  "Investigate connection pool exhaustion",
  "Add structured logging across services",
  "Migrate logs to OpenTelemetry",
  "Upgrade Kafka client library",
  "Reduce API response payload size",
  "Add Prometheus metrics to payment service",
  "Investigate p99 latency regression",
  "Fix memory fragmentation in JVM services",
  "Add schema validation to webhook payloads",
  "Upgrade Node.js to v24 LTS",
  "Migrate background jobs to queue workers",
  "Add tracing spans to auth flow",
  "Document microservice communication patterns",
]

const triageDescriptions = [
  "Users report increased memory usage after 48h uptime. Need to profile and fix.",
  "Implement distributed tracing with correlation IDs across microservices.",
  "Config loader has grown organically and is hard to test. Consolidate and document.",
  "Bumping gRPC to pick up performance improvements and security fixes.",
  "Multiple competing logger wrapper modules exist. Pick one and migrate.",
  "Dead feature flags are cluttering the config. Audit and remove.",
  "CLI parses args inconsistently across subcommands. Normalize.",
  "Several integration tests fail intermittently in CI. Triage and fix or quarantine.",
  "Inconsistent error responses. Document taxonomy and enforce in middleware.",
  "v1/users is still getting traffic. Need migration plan and sunset.",
  "Elevated I/O wait seen on worker-3. Profile and identify cause.",
  "Run audit and remove any public-read buckets containing sensitive data.",
  "Current retry middleware is duplicated across services. Extract library.",
  "Accumulated dead code in utils/. Run coverage report and remove.",
  "Move ad-hoc cron jobs into durable workflow system.",
  "Cache occasionally serves stale data during concurrent writes.",
  "Prevent cascading failures when downstream APIs are slow.",
  "Current v14 reaching EOL. Plan migration with zero downtime.",
  "Customer-reported slowness on /orders endpoint. Profile and optimize.",
  "Add alerting when queue depth exceeds normal operating range.",
  "Deploy pipeline has been failing intermittently for weeks.",
  "Quarterly key rotation. Audit usage and rotate.",
  "k8s liveness probe needs dedicated endpoint.",
  "Image is 2GB. Reduce to <500MB for faster deploys.",
  "CI cache hit rate dropped from 85% to 40%. Investigate.",
  "Failed webhooks are silently dropped. Add DLQ.",
  "Migrate from .env files to HashiCorp Vault.",
  "Reports show incorrect times for users in non-UTC timezones.",
  "Static JS/CSS not gzipped. Add compression at edge.",
  "Audit and document all dependency licenses for compliance.",
  "Prevent abuse by implementing per-key rate limits with Redis.",
  "Avoid retry storms by capping retries per time window.",
  "Pool exhaustion observed during peak hours. Investigate and tune.",
  "Migrate all services to structured JSON logging with consistent fields.",
  "Standardize on OpenTelemetry for logs, metrics, and traces.",
  "Bump to latest Kafka client to fix reconnection bug.",
  "API responses are 3x larger than necessary. Remove unused fields.",
  "Export payment success/failure rates, latency p50/p95/p99.",
  "p99 latency on /api/orders increased 2x since last deploy.",
  "Old GC pauses causing spikes. Tune or migrate off JVM.",
  "Invalid webhook payloads reach handlers. Validate at ingress.",
  "Upgrade from Node.js 18 (EOL) to v24 LTS.",
  "Consolidate background job processing onto the queue worker framework.",
  "Instrument auth flow with OTel spans for debugging slow logins.",
  "Create architecture decision record for sync vs async communication.",
]

const triageBacklogIssues: Issue[] = Array.from({ length: 45 }, (_, i) => {
  const num = i + 301
  const tier = Math.floor(i / 15) // 0, 1, or 2
  const priority: Issue["priority"] =
    tier === 0
      ? "none"
      : (["medium", "high", "medium", "low", "high"][
          i % 5
        ] as Issue["priority"])
  const labelIds: string[] =
    tier < 2
      ? []
      : [
          [L.backend, L.infra],
          [L.backend],
          [L.infra],
          [L.backend, L.techDebt],
          [L.techDebt],
        ][i % 5]
  const createdDay = 1 + ((i * 2) % 28)
  return {
    id: `iss-${50 + i + 1}`,
    identifier: `PLT-${num}`,
    title: triageTitles[i],
    description: triageDescriptions[i],
    status: "backlog" as const,
    priority,
    assigneeId: null,
    creatorId: ["usr-3", "usr-5", "usr-7", "usr-9"][i % 4],
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds,
    estimate: null,
    dueDate: null,
    createdAt: `2026-03-${String(createdDay).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-03-${String(createdDay).padStart(2, "0")}T09:00:00.000Z`,
  }
})

// --- Section E: Legacy inherited (LEG-001..085) — spec §2.8 ---
// 8 duplicate pairs + stale/miscellaneous issues. Anchor-relative dates.

const duplicatePairs: { title: string; description: string }[] = [
  {
    title: "Login timeout too short",
    description:
      "Users report session timing out after 10 minutes. Should be configurable.",
  },
  {
    title: "API returns 500 on empty input",
    description: "POST /api/search with empty body returns 500 instead of 400.",
  },
  {
    title: "Export CSV missing headers",
    description: "Exported CSVs don't include column headers.",
  },
  {
    title: "Dashboard loading slowly",
    description:
      "Main dashboard takes 8+ seconds to load for accounts with many orders.",
  },
  {
    title: "Search not returning recent results",
    description: "Recently-created items don't appear in search until reindex.",
  },
  {
    title: "Email notifications delayed",
    description:
      "Notification emails arrive 15+ minutes after the triggering event.",
  },
  {
    title: "File upload limit too low",
    description: "10MB upload limit is too low for our enterprise customers.",
  },
  {
    title: "Dark mode contrast issues",
    description:
      "Dark mode has insufficient contrast on form inputs (fails WCAG).",
  },
]

const legacyMiscTitles = [
  // Stale (LEG-001..015) — 90+ days, reference old product names / resolved issues
  "Fix OldProduct login page",
  "Refactor OldProduct billing module",
  "Document OldProduct API",
  "Migrate OldProduct users to new schema",
  "OldProduct admin panel not loading",
  "OldProduct image uploads failing",
  "OldProduct search broken on Firefox",
  "OldProduct emails in wrong language",
  "OldProduct checkout hangs",
  "OldProduct reports incorrect totals",
  "OldProduct cache invalidation issue",
  "OldProduct mobile nav broken",
  "OldProduct 2FA not working",
  "OldProduct API rate limit too low",
  "OldProduct SSO integration flaky",
  // Active mix (LEG-036..055) — bugs, features, tech debt
  "Add dark mode toggle",
  "Implement saved searches",
  "Add keyboard shortcuts",
  "Fix print stylesheet",
  "Add CSV export to all tables",
  "Implement bulk edit in list views",
  "Add field-level audit history",
  "Fix timezone display in activity log",
  "Add notification preferences page",
  "Implement @mentions in comments",
  "Fix broken links in help docs",
  "Add inline code blocks to comments",
  "Implement drag-to-reorder for lists",
  "Add keyboard navigation to dialogs",
  "Fix focus trap in modals",
  "Add loading skeletons to cards",
  "Implement virtual scrolling for long lists",
  "Fix table column resize on Safari",
  "Add sticky headers to tables",
  "Implement undo for destructive actions",
  // Security interspersed (LEG-056..070)
  "CSRF token missing on form X",
  "XSS risk in comment rendering",
  "SQL injection in search filter",
  "Session fixation vulnerability",
  "Insecure direct object reference",
  "Weak password reset token",
  "Missing rate limit on login",
  "Unvalidated redirect on logout",
  "Sensitive data in URL params",
  "Missing HSTS header",
  "Cookie missing Secure flag",
  "Cookie missing HttpOnly flag",
  "Password in request log",
  "API key in client bundle",
  "Error message leaks stack trace",
  // Integration/testing (LEG-071..085)
  "Add integration tests for auth flow",
  "Add smoke tests for checkout",
  "Add e2e tests for admin flows",
  "Migrate test fixtures to factories",
  "Add contract tests for webhooks",
  "Flaky test in user service",
  "Add load test for search endpoint",
  "Add chaos test for payment retries",
  "Add visual regression tests",
  "Add a11y tests to CI",
  "Add mutation tests for critical paths",
  "Add fuzz tests for parser",
  "Add performance benchmarks for hot loops",
  "Add end-to-end encryption tests",
  "Add mobile device test matrix",
]

const legacyDuplicateIndices = [
  // (primary LEG-NNN, duplicate LEG-NNN) — 1-indexed, positions where duplicates go
  [16, 22],
  [17, 28],
  [19, 30],
  [20, 33],
  [23, 31],
  [24, 29],
  [25, 34],
  [26, 35],
]

const legacyIssues: Issue[] = Array.from({ length: 85 }, (_, i) => {
  const num = i + 1
  const identifier = `LEG-${String(num).padStart(3, "0")}`
  const id = `iss-${95 + i + 1}` // starts at iss-96

  // Determine title/description
  let title: string
  let description: string
  const pairPrimary = legacyDuplicateIndices.find((p) => p[0] === num)
  const pairDuplicate = legacyDuplicateIndices.find((p) => p[1] === num)
  if (pairPrimary) {
    const pair = duplicatePairs[legacyDuplicateIndices.indexOf(pairPrimary)]
    title = pair.title
    description = pair.description
  } else if (pairDuplicate) {
    const pair = duplicatePairs[legacyDuplicateIndices.indexOf(pairDuplicate)]
    title = `${pair.title} (duplicate)`
    description = `Duplicate of LEG-${String(pairDuplicate[0]).padStart(3, "0")}. ${pair.description}`
  } else if (num <= 15) {
    title = legacyMiscTitles[num - 1]
    description =
      "Legacy inherited issue from the acquired codebase. Status unclear — needs triage."
  } else {
    // Compute index into legacyMiscTitles for non-duplicate slots after the first 15
    const miscIndex =
      15 + (num - 16) - legacyDuplicateIndices.filter((p) => p[1] < num).length
    title =
      legacyMiscTitles[Math.min(miscIndex, legacyMiscTitles.length - 1)] ??
      `Legacy issue ${num}`
    description =
      "Inherited from legacy backlog. Scope, priority, and owner uncertain."
  }

  // State distribution
  let status: Issue["status"]
  if (num <= 35) status = "backlog"
  else if (num <= 55)
    status = ["todo", "in_progress", "backlog", "done"][
      num % 4
    ] as Issue["status"]
  else if (num <= 70)
    status = ["todo", "backlog", "in_progress"][num % 3] as Issue["status"]
  else
    status = ["todo", "in_progress", "done", "backlog"][
      num % 4
    ] as Issue["status"]

  // Age in days relative to 2026-04-13
  let ageDays: number
  if (num <= 15) ageDays = 90 + num * 2
  else if (num <= 35) ageDays = 30 + (num % 30)
  else if (num <= 55) ageDays = 7 + (num % 20)
  else if (num <= 70) ageDays = 7 + (num % 7)
  else ageDays = 1 + (num % 5)

  const benchmarkDay = new Date("2026-04-13T09:00:00.000Z")
  const created = new Date(
    benchmarkDay.getTime() - ageDays * 24 * 60 * 60 * 1000
  )
  const updated = new Date(
    benchmarkDay.getTime() - Math.max(1, ageDays - 2) * 24 * 60 * 60 * 1000
  )

  // Labels — partial coverage, more as num increases
  const labelIds: string[] = []
  if (num > 15 && num % 3 === 0) labelIds.push(L.bug)
  if (num > 35 && num % 5 === 0) labelIds.push(L.techDebt)
  if (num >= 56 && num <= 70) labelIds.push(L.p2)
  if (num >= 71) labelIds.push(L.improvement)

  const priority: Issue["priority"] =
    num >= 56 && num <= 70
      ? "high"
      : num <= 15
        ? "none"
        : (["medium", "low", "medium", "none"][num % 4] as Issue["priority"])

  return {
    id,
    identifier,
    title,
    description,
    status,
    priority,
    assigneeId: num > 35 && num % 3 === 0 ? `usr-${(num % 15) + 1}` : null,
    creatorId: "usr-9",
    teamId: "team-4",
    projectId: null,
    cycleId: null,
    labelIds,
    estimate: null,
    dueDate: null,
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
  }
})

export const issues: Issue[] = [
  ...authServiceIssues,
  ...checkoutIssues,
  ...paymentApiIssues,
  ...triageBacklogIssues,
  ...legacyIssues,
]

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export const views: View[] = [
  {
    id: "view-1",
    name: "My Active Issues",
    description: "Issues assigned to me that are in progress.",
    filterQuery: "assignee = currentUser() AND status = in_progress",
    ownerId: "usr-3",
    teamId: "team-1",
    createdAt: "2026-01-20T09:00:00.000Z",
  },
  {
    id: "view-2",
    name: "Sprint 13 Bugs",
    description: "All bugs in the active Platform cycle.",
    filterQuery: "label = bug AND cycle = activeCycle()",
    ownerId: "usr-3",
    teamId: "team-1",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "view-3",
    name: "Unassigned Backlog",
    description: "All unassigned issues in the backlog.",
    filterQuery: "assignee is EMPTY AND status = backlog",
    ownerId: "usr-1",
    teamId: "team-1",
    createdAt: "2026-02-10T11:00:00.000Z",
  },
  {
    id: "view-4",
    name: "Customer Reported",
    description: "Issues tagged as customer-reported across all teams.",
    filterQuery: "label = customer-reported",
    ownerId: "usr-1",
    teamId: "team-1",
    createdAt: "2026-02-15T09:00:00.000Z",
  },
]

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
}
