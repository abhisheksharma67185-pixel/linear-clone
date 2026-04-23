// ---------------------------------------------------------------------------
// Plain — mock data + types
// Modeled after plain.com's actual product (modern customer support tool).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThreadStatus = "open" | "snoozed" | "done"
export type ThreadPriority = "urgent" | "high" | "normal" | "low"

export interface Tenant {
  id: string
  name: string
  domain: string
  plan: "free" | "starter" | "growth" | "enterprise"
  mrr: number
  createdAt: string
}

export interface Customer {
  id: string
  fullName: string
  email: string
  initials: string
  role: string
  tenantId: string
  plan: "free" | "starter" | "growth" | "enterprise"
  lifecycleStage: "lead" | "trial" | "active" | "at_risk" | "churned"
  externalId: string
  createdAt: string
  customAttributes: Record<string, string>
}

export interface Agent {
  id: string
  fullName: string
  email: string
  initials: string
  role: "owner" | "admin" | "support" | "engineer"
  isCurrentUser?: boolean
}

export interface Label {
  id: string
  name: string
  color: string // tailwind hue: emerald, amber, sky, etc.
  description: string
}

export type MessageRole = "customer" | "agent" | "system"

export interface Message {
  id: string
  threadId: string
  role: MessageRole
  authorId: string // customerId or agentId or "system"
  body: string
  createdAt: string
}

export interface Thread {
  id: string
  title: string
  customerId: string
  tenantId: string
  status: ThreadStatus
  priority: ThreadPriority
  labelIds: string[]
  assigneeId: string | null
  snoozedUntil: string | null
  doneAt: string | null
  createdAt: string
  updatedAt: string
  preview: string
}

// ---------------------------------------------------------------------------
// Tenants — companies whose users open threads
// ---------------------------------------------------------------------------

export const tenants: Tenant[] = [
  {
    id: "tnt-1",
    name: "MegaCorp",
    domain: "megacorp.com",
    plan: "enterprise",
    mrr: 24000,
    createdAt: "2024-08-12T09:00:00.000Z",
  },
  {
    id: "tnt-2",
    name: "Northwind Studios",
    domain: "northwind.studio",
    plan: "growth",
    mrr: 4900,
    createdAt: "2025-02-04T09:00:00.000Z",
  },
  {
    id: "tnt-3",
    name: "Acme Robotics",
    domain: "acmerobotics.io",
    plan: "growth",
    mrr: 4900,
    createdAt: "2025-04-21T09:00:00.000Z",
  },
  {
    id: "tnt-4",
    name: "Lumen Labs",
    domain: "lumenlabs.dev",
    plan: "starter",
    mrr: 290,
    createdAt: "2025-09-03T09:00:00.000Z",
  },
  {
    id: "tnt-5",
    name: "Polymath AI",
    domain: "polymath.ai",
    plan: "enterprise",
    mrr: 18500,
    createdAt: "2024-11-30T09:00:00.000Z",
  },
  {
    id: "tnt-6",
    name: "Switchback",
    domain: "switchback.app",
    plan: "starter",
    mrr: 290,
    createdAt: "2025-12-01T09:00:00.000Z",
  },
  {
    id: "tnt-7",
    name: "Halcyon Health",
    domain: "halcyonhealth.co",
    plan: "growth",
    mrr: 4900,
    createdAt: "2025-06-19T09:00:00.000Z",
  },
  {
    id: "tnt-8",
    name: "Voltage Pay",
    domain: "voltagepay.com",
    plan: "enterprise",
    mrr: 31000,
    createdAt: "2024-05-02T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Agents — workspace members handling support
// ---------------------------------------------------------------------------

export const agents: Agent[] = [
  {
    id: "agt-1",
    fullName: "Marie Lefevre",
    email: "marie@thetabench.support",
    initials: "ML",
    role: "owner",
    isCurrentUser: true,
  },
  {
    id: "agt-2",
    fullName: "Theo Hartmann",
    email: "theo@thetabench.support",
    initials: "TH",
    role: "admin",
  },
  {
    id: "agt-3",
    fullName: "Anika Iyer",
    email: "anika@thetabench.support",
    initials: "AI",
    role: "support",
  },
  {
    id: "agt-4",
    fullName: "Jonas Kim",
    email: "jonas@thetabench.support",
    initials: "JK",
    role: "engineer",
  },
  {
    id: "agt-5",
    fullName: "Priya Singh",
    email: "priya@thetabench.support",
    initials: "PS",
    role: "support",
  },
]

// ---------------------------------------------------------------------------
// Customers — humans who open threads, belong to a tenant
// ---------------------------------------------------------------------------

export const customers: Customer[] = [
  {
    id: "cus-1",
    fullName: "Eleanor Whitaker",
    email: "eleanor@megacorp.com",
    initials: "EW",
    role: "VP Engineering",
    tenantId: "tnt-1",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "mg_001",
    createdAt: "2024-08-12T09:00:00.000Z",
    customAttributes: { region: "us-east", contractEndsOn: "2026-12-31" },
  },
  {
    id: "cus-2",
    fullName: "Rahul Iyer",
    email: "rahul@megacorp.com",
    initials: "RI",
    role: "Senior Platform Engineer",
    tenantId: "tnt-1",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "mg_204",
    createdAt: "2024-09-01T09:00:00.000Z",
    customAttributes: { region: "us-east", contractEndsOn: "2026-12-31" },
  },
  {
    id: "cus-3",
    fullName: "Naomi Chen",
    email: "naomi@northwind.studio",
    initials: "NC",
    role: "Founder",
    tenantId: "tnt-2",
    plan: "growth",
    lifecycleStage: "active",
    externalId: "nw_007",
    createdAt: "2025-02-04T09:00:00.000Z",
    customAttributes: { region: "us-west", contractEndsOn: "2026-02-04" },
  },
  {
    id: "cus-4",
    fullName: "Kai Bergstrom",
    email: "kai@northwind.studio",
    initials: "KB",
    role: "Lead Designer",
    tenantId: "tnt-2",
    plan: "growth",
    lifecycleStage: "active",
    externalId: "nw_018",
    createdAt: "2025-03-12T09:00:00.000Z",
    customAttributes: { region: "us-west" },
  },
  {
    id: "cus-5",
    fullName: "Sofia Rossi",
    email: "sofia@acmerobotics.io",
    initials: "SR",
    role: "Robotics PM",
    tenantId: "tnt-3",
    plan: "growth",
    lifecycleStage: "active",
    externalId: "ar_044",
    createdAt: "2025-04-21T09:00:00.000Z",
    customAttributes: { region: "eu-west" },
  },
  {
    id: "cus-6",
    fullName: "Hassan Mahmoud",
    email: "hassan@acmerobotics.io",
    initials: "HM",
    role: "Backend Engineer",
    tenantId: "tnt-3",
    plan: "growth",
    lifecycleStage: "active",
    externalId: "ar_092",
    createdAt: "2025-05-08T09:00:00.000Z",
    customAttributes: { region: "eu-west" },
  },
  {
    id: "cus-7",
    fullName: "Mei Tanaka",
    email: "mei@lumenlabs.dev",
    initials: "MT",
    role: "Solo Developer",
    tenantId: "tnt-4",
    plan: "starter",
    lifecycleStage: "trial",
    externalId: "ll_002",
    createdAt: "2025-09-03T09:00:00.000Z",
    customAttributes: { region: "ap-northeast" },
  },
  {
    id: "cus-8",
    fullName: "Diego Alvarez",
    email: "diego@lumenlabs.dev",
    initials: "DA",
    role: "Co-founder",
    tenantId: "tnt-4",
    plan: "starter",
    lifecycleStage: "trial",
    externalId: "ll_010",
    createdAt: "2025-09-15T09:00:00.000Z",
    customAttributes: { region: "us-central" },
  },
  {
    id: "cus-9",
    fullName: "Amara Okeke",
    email: "amara@polymath.ai",
    initials: "AO",
    role: "Head of Research",
    tenantId: "tnt-5",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "pm_021",
    createdAt: "2024-11-30T09:00:00.000Z",
    customAttributes: { region: "us-east", contractEndsOn: "2026-11-30" },
  },
  {
    id: "cus-10",
    fullName: "Ben Lockhart",
    email: "ben@polymath.ai",
    initials: "BL",
    role: "ML Engineer",
    tenantId: "tnt-5",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "pm_055",
    createdAt: "2025-01-04T09:00:00.000Z",
    customAttributes: { region: "us-east" },
  },
  {
    id: "cus-11",
    fullName: "Yuki Sato",
    email: "yuki@switchback.app",
    initials: "YS",
    role: "Indie Hacker",
    tenantId: "tnt-6",
    plan: "starter",
    lifecycleStage: "trial",
    externalId: "sb_001",
    createdAt: "2025-12-01T09:00:00.000Z",
    customAttributes: { region: "ap-northeast" },
  },
  {
    id: "cus-12",
    fullName: "Liora Bauman",
    email: "liora@halcyonhealth.co",
    initials: "LB",
    role: "Head of Engineering",
    tenantId: "tnt-7",
    plan: "growth",
    lifecycleStage: "active",
    externalId: "hh_011",
    createdAt: "2025-06-19T09:00:00.000Z",
    customAttributes: { region: "eu-central" },
  },
  {
    id: "cus-13",
    fullName: "Omar El-Sayed",
    email: "omar@halcyonhealth.co",
    initials: "OE",
    role: "Compliance Officer",
    tenantId: "tnt-7",
    plan: "growth",
    lifecycleStage: "at_risk",
    externalId: "hh_023",
    createdAt: "2025-07-30T09:00:00.000Z",
    customAttributes: { region: "eu-central" },
  },
  {
    id: "cus-14",
    fullName: "Greta Lindqvist",
    email: "greta@voltagepay.com",
    initials: "GL",
    role: "CTO",
    tenantId: "tnt-8",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "vp_002",
    createdAt: "2024-05-02T09:00:00.000Z",
    customAttributes: { region: "eu-north", contractEndsOn: "2027-05-02" },
  },
  {
    id: "cus-15",
    fullName: "Marcus Webb",
    email: "marcus@voltagepay.com",
    initials: "MW",
    role: "Payments Lead",
    tenantId: "tnt-8",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "vp_018",
    createdAt: "2024-06-15T09:00:00.000Z",
    customAttributes: { region: "eu-north" },
  },
  {
    id: "cus-16",
    fullName: "Tara Khouri",
    email: "tara@voltagepay.com",
    initials: "TK",
    role: "Risk Engineer",
    tenantId: "tnt-8",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "vp_034",
    createdAt: "2024-09-01T09:00:00.000Z",
    customAttributes: { region: "eu-north" },
  },
  {
    id: "cus-17",
    fullName: "Andre Petrov",
    email: "andre@megacorp.com",
    initials: "AP",
    role: "Staff SRE",
    tenantId: "tnt-1",
    plan: "enterprise",
    lifecycleStage: "active",
    externalId: "mg_412",
    createdAt: "2025-03-20T09:00:00.000Z",
    customAttributes: { region: "us-east" },
  },
  {
    id: "cus-18",
    fullName: "Saoirse Walsh",
    email: "saoirse@northwind.studio",
    initials: "SW",
    role: "Marketing Lead",
    tenantId: "tnt-2",
    plan: "growth",
    lifecycleStage: "at_risk",
    externalId: "nw_033",
    createdAt: "2025-08-12T09:00:00.000Z",
    customAttributes: { region: "eu-west" },
  },
  {
    id: "cus-19",
    fullName: "Noor Hassan",
    email: "noor@acmerobotics.io",
    initials: "NH",
    role: "QA Engineer",
    tenantId: "tnt-3",
    plan: "growth",
    lifecycleStage: "active",
    externalId: "ar_120",
    createdAt: "2025-10-04T09:00:00.000Z",
    customAttributes: { region: "eu-west" },
  },
  {
    id: "cus-20",
    fullName: "River Henson",
    email: "river@switchback.app",
    initials: "RH",
    role: "Co-founder",
    tenantId: "tnt-6",
    plan: "starter",
    lifecycleStage: "trial",
    externalId: "sb_002",
    createdAt: "2026-01-15T09:00:00.000Z",
    customAttributes: { region: "us-west" },
  },
]

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const labels: Label[] = [
  { id: "lbl-1", name: "bug", color: "rose", description: "Confirmed defect" },
  {
    id: "lbl-2",
    name: "billing",
    color: "amber",
    description: "Invoices, payments, refunds",
  },
  {
    id: "lbl-3",
    name: "feature-request",
    color: "violet",
    description: "Customer feature ideas",
  },
  {
    id: "lbl-4",
    name: "question",
    color: "sky",
    description: "How-to / clarification",
  },
  {
    id: "lbl-5",
    name: "urgent",
    color: "red",
    description: "Drop everything",
  },
  {
    id: "lbl-6",
    name: "onboarding",
    color: "emerald",
    description: "New customer setup",
  },
  { id: "lbl-7", name: "api", color: "indigo", description: "API surface" },
  {
    id: "lbl-8",
    name: "dashboard",
    color: "teal",
    description: "Web dashboard issue",
  },
  {
    id: "lbl-9",
    name: "integration",
    color: "fuchsia",
    description: "Third-party integrations",
  },
  {
    id: "lbl-10",
    name: "webhook",
    color: "orange",
    description: "Webhook delivery problems",
  },
]

// ---------------------------------------------------------------------------
// Threads — 25 of them across all statuses
// ---------------------------------------------------------------------------

export const threads: Thread[] = [
  {
    id: "thr-1",
    title: "Webhook failing on org_megacorp",
    customerId: "cus-2",
    tenantId: "tnt-1",
    status: "open",
    priority: "urgent",
    labelIds: ["lbl-1", "lbl-10", "lbl-5"],
    assigneeId: "agt-4",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-21T08:14:00.000Z",
    updatedAt: "2026-04-23T10:02:00.000Z",
    preview:
      "We're seeing 503s on our webhook endpoint about every five min...",
  },
  {
    id: "thr-2",
    title: "Question about API rate limits",
    customerId: "cus-7",
    tenantId: "tnt-4",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-4", "lbl-7"],
    assigneeId: "agt-3",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T11:42:00.000Z",
    updatedAt: "2026-04-22T15:18:00.000Z",
    preview:
      "Hey — what's the per-org rate limit on the workspace endpoint? Docs say 100/min...",
  },
  {
    id: "thr-3",
    title: "Feature request: bulk export of threads",
    customerId: "cus-3",
    tenantId: "tnt-2",
    status: "open",
    priority: "low",
    labelIds: ["lbl-3", "lbl-8"],
    assigneeId: null,
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-19T16:07:00.000Z",
    updatedAt: "2026-04-19T16:07:00.000Z",
    preview:
      "Would love a CSV export option for closed threads, even just per-month...",
  },
  {
    id: "thr-4",
    title: "Billing: invoice INV-12 wrong amount",
    customerId: "cus-1",
    tenantId: "tnt-1",
    status: "open",
    priority: "high",
    labelIds: ["lbl-2", "lbl-5"],
    assigneeId: "agt-1",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T09:00:00.000Z",
    updatedAt: "2026-04-23T08:14:00.000Z",
    preview:
      "Invoice INV-12 charged us for 24 seats but our active count is 18.",
  },
  {
    id: "thr-5",
    title: "How do I invite a teammate?",
    customerId: "cus-11",
    tenantId: "tnt-6",
    status: "done",
    priority: "low",
    labelIds: ["lbl-4", "lbl-6"],
    assigneeId: "agt-3",
    snoozedUntil: null,
    doneAt: "2026-04-20T14:33:00.000Z",
    createdAt: "2026-04-20T13:18:00.000Z",
    updatedAt: "2026-04-20T14:33:00.000Z",
    preview: "Can't find the invite teammate option in settings...",
  },
  {
    id: "thr-6",
    title: "Slack integration disconnected overnight",
    customerId: "cus-5",
    tenantId: "tnt-3",
    status: "open",
    priority: "high",
    labelIds: ["lbl-9", "lbl-1"],
    assigneeId: "agt-2",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-23T07:02:00.000Z",
    updatedAt: "2026-04-23T07:02:00.000Z",
    preview:
      "Our Slack integration shows 'reconnect required' as of 02:00 UTC — was there a deploy?",
  },
  {
    id: "thr-7",
    title: "Onboarding: SSO with Okta not working",
    customerId: "cus-12",
    tenantId: "tnt-7",
    status: "snoozed",
    priority: "high",
    labelIds: ["lbl-6", "lbl-9", "lbl-1"],
    assigneeId: "agt-4",
    snoozedUntil: "2026-04-24T09:00:00.000Z",
    doneAt: null,
    createdAt: "2026-04-21T15:00:00.000Z",
    updatedAt: "2026-04-22T17:10:00.000Z",
    preview:
      "Setting up SAML through Okta. Getting 'AudienceRestriction' validation failure on callback...",
  },
  {
    id: "thr-8",
    title: "Dashboard charts not rendering on Safari 17",
    customerId: "cus-4",
    tenantId: "tnt-2",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-1", "lbl-8"],
    assigneeId: "agt-3",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T18:48:00.000Z",
    updatedAt: "2026-04-22T18:48:00.000Z",
    preview:
      "Charts on the analytics page show as empty rectangles in Safari 17.4.",
  },
  {
    id: "thr-9",
    title: "Refund request — accidental upgrade",
    customerId: "cus-8",
    tenantId: "tnt-4",
    status: "done",
    priority: "normal",
    labelIds: ["lbl-2"],
    assigneeId: "agt-1",
    snoozedUntil: null,
    doneAt: "2026-04-19T11:42:00.000Z",
    createdAt: "2026-04-18T22:00:00.000Z",
    updatedAt: "2026-04-19T11:42:00.000Z",
    preview:
      "I clicked Upgrade by mistake last night — please refund the charge.",
  },
  {
    id: "thr-10",
    title: "API auth: rotating secret keys",
    customerId: "cus-10",
    tenantId: "tnt-5",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-7", "lbl-4"],
    assigneeId: "agt-4",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-23T05:30:00.000Z",
    updatedAt: "2026-04-23T05:30:00.000Z",
    preview:
      "What's the recommended way to rotate our API secret without downtime?",
  },
  {
    id: "thr-11",
    title: "Integration: Stripe webhook events deduped wrong",
    customerId: "cus-15",
    tenantId: "tnt-8",
    status: "open",
    priority: "urgent",
    labelIds: ["lbl-9", "lbl-1", "lbl-10", "lbl-5"],
    assigneeId: "agt-4",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T03:11:00.000Z",
    updatedAt: "2026-04-23T09:48:00.000Z",
    preview:
      "We're receiving Stripe payment_succeeded events twice per charge — looks like dedupe key is off.",
  },
  {
    id: "thr-12",
    title: "Snooze threads with no activity for 7 days",
    customerId: "cus-3",
    tenantId: "tnt-2",
    status: "snoozed",
    priority: "low",
    labelIds: ["lbl-3"],
    assigneeId: "agt-1",
    snoozedUntil: "2026-04-30T09:00:00.000Z",
    doneAt: null,
    createdAt: "2026-04-15T13:22:00.000Z",
    updatedAt: "2026-04-22T11:00:00.000Z",
    preview: "Could we get an auto-snooze rule for inactive threads?",
  },
  {
    id: "thr-13",
    title: "Export: customer attributes missing in CSV",
    customerId: "cus-9",
    tenantId: "tnt-5",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-1", "lbl-8"],
    assigneeId: "agt-2",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T20:14:00.000Z",
    updatedAt: "2026-04-23T06:17:00.000Z",
    preview:
      "When I export customers to CSV the custom attributes column is empty.",
  },
  {
    id: "thr-14",
    title: "Compliance: PII redaction in transcripts",
    customerId: "cus-13",
    tenantId: "tnt-7",
    status: "open",
    priority: "high",
    labelIds: ["lbl-4"],
    assigneeId: "agt-1",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-21T10:08:00.000Z",
    updatedAt: "2026-04-22T09:30:00.000Z",
    preview:
      "Need a way to auto-redact PII from agent-side message transcripts before exporting.",
  },
  {
    id: "thr-15",
    title: "Mobile push notifications not arriving",
    customerId: "cus-6",
    tenantId: "tnt-3",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-1"],
    assigneeId: null,
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T22:55:00.000Z",
    updatedAt: "2026-04-22T22:55:00.000Z",
    preview:
      "iOS app stopped delivering push notifications after the 2.4 update.",
  },
  {
    id: "thr-16",
    title: "Question: webhook signing key v2 migration",
    customerId: "cus-2",
    tenantId: "tnt-1",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-4", "lbl-10", "lbl-7"],
    assigneeId: "agt-4",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-20T17:18:00.000Z",
    updatedAt: "2026-04-22T14:00:00.000Z",
    preview:
      "When does the v1 signing key get retired? We're still on the legacy header.",
  },
  {
    id: "thr-17",
    title: "Custom domain SSL provisioning timed out",
    customerId: "cus-14",
    tenantId: "tnt-8",
    status: "done",
    priority: "high",
    labelIds: ["lbl-1", "lbl-9"],
    assigneeId: "agt-4",
    snoozedUntil: null,
    doneAt: "2026-04-22T09:14:00.000Z",
    createdAt: "2026-04-21T20:00:00.000Z",
    updatedAt: "2026-04-22T09:14:00.000Z",
    preview:
      "support.voltagepay.com showed 'pending' for 6h — manually retried, now resolved.",
  },
  {
    id: "thr-18",
    title: "Feature request: reply templates with variables",
    customerId: "cus-18",
    tenantId: "tnt-2",
    status: "open",
    priority: "low",
    labelIds: ["lbl-3"],
    assigneeId: null,
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-18T14:00:00.000Z",
    updatedAt: "2026-04-18T14:00:00.000Z",
    preview:
      "Would be huge to have reply templates with {{customer.first_name}} variables.",
  },
  {
    id: "thr-19",
    title: "Onboarding webhook receiver setup",
    customerId: "cus-20",
    tenantId: "tnt-6",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-6", "lbl-10"],
    assigneeId: "agt-3",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-23T04:18:00.000Z",
    updatedAt: "2026-04-23T04:18:00.000Z",
    preview:
      "Just signed up — what's the recommended way to point our staging webhook receiver?",
  },
  {
    id: "thr-20",
    title: "Billing: switching from monthly to annual",
    customerId: "cus-19",
    tenantId: "tnt-3",
    status: "open",
    priority: "normal",
    labelIds: ["lbl-2", "lbl-4"],
    assigneeId: "agt-1",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T13:33:00.000Z",
    updatedAt: "2026-04-22T13:33:00.000Z",
    preview:
      "We'd like to move our subscription to annual — does the discount apply mid-cycle?",
  },
  {
    id: "thr-21",
    title: "Bug: search sometimes returns deleted threads",
    customerId: "cus-17",
    tenantId: "tnt-1",
    status: "open",
    priority: "high",
    labelIds: ["lbl-1", "lbl-8"],
    assigneeId: "agt-2",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-21T19:48:00.000Z",
    updatedAt: "2026-04-22T20:11:00.000Z",
    preview:
      "Search results occasionally include threads that were deleted — index lag?",
  },
  {
    id: "thr-22",
    title: "Snooze: 'until next monday' off by one day",
    customerId: "cus-4",
    tenantId: "tnt-2",
    status: "open",
    priority: "low",
    labelIds: ["lbl-1"],
    assigneeId: "agt-3",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-22T08:00:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
    preview: "When I pick 'until next Monday' it snoozes until Tuesday.",
  },
  {
    id: "thr-23",
    title: "Compliance: SOC 2 reports for 2026",
    customerId: "cus-12",
    tenantId: "tnt-7",
    status: "snoozed",
    priority: "normal",
    labelIds: ["lbl-4"],
    assigneeId: "agt-1",
    snoozedUntil: "2026-04-29T09:00:00.000Z",
    doneAt: null,
    createdAt: "2026-04-19T09:00:00.000Z",
    updatedAt: "2026-04-22T09:18:00.000Z",
    preview: "Where can I download the latest SOC 2 Type II report?",
  },
  {
    id: "thr-24",
    title: "Question: how does threading dedupe work?",
    customerId: "cus-16",
    tenantId: "tnt-8",
    status: "done",
    priority: "low",
    labelIds: ["lbl-4"],
    assigneeId: "agt-3",
    snoozedUntil: null,
    doneAt: "2026-04-21T16:00:00.000Z",
    createdAt: "2026-04-21T11:48:00.000Z",
    updatedAt: "2026-04-21T16:00:00.000Z",
    preview:
      "How does Plain decide whether two emails go to the same thread or split them?",
  },
  {
    id: "thr-25",
    title: "Urgent: production webhook signature mismatch",
    customerId: "cus-15",
    tenantId: "tnt-8",
    status: "open",
    priority: "urgent",
    labelIds: ["lbl-5", "lbl-10", "lbl-1"],
    assigneeId: "agt-4",
    snoozedUntil: null,
    doneAt: null,
    createdAt: "2026-04-23T06:30:00.000Z",
    updatedAt: "2026-04-23T10:00:00.000Z",
    preview:
      "All inbound webhooks rejected with signature_mismatch since 06:00 UTC. Production blocked.",
  },
]

// ---------------------------------------------------------------------------
// Messages — 2 to 6 per thread, alternating customer/agent + system events
// ---------------------------------------------------------------------------

export const messages: Message[] = [
  // --- thr-1 — webhook failing
  {
    id: "msg-1",
    threadId: "thr-1",
    role: "customer",
    authorId: "cus-2",
    body: "Hey team — we're seeing intermittent 503s on our webhook endpoint about every 5 minutes. Started around 07:50 UTC. We can share request IDs.",
    createdAt: "2026-04-21T08:14:00.000Z",
  },
  {
    id: "msg-2",
    threadId: "thr-1",
    role: "agent",
    authorId: "agt-4",
    body: "Looking now — can you DM me 5 sample request IDs from the failing batch?",
    createdAt: "2026-04-21T08:42:00.000Z",
  },
  {
    id: "msg-3",
    threadId: "thr-1",
    role: "customer",
    authorId: "cus-2",
    body: "Sent over Slack: req_a8b7c, req_a8b7d, req_a8b7e, req_a8b7f, req_a8b80.",
    createdAt: "2026-04-21T09:08:00.000Z",
  },
  {
    id: "msg-4",
    threadId: "thr-1",
    role: "system",
    authorId: "system",
    body: "Label 'urgent' added by Jonas Kim",
    createdAt: "2026-04-21T09:10:00.000Z",
  },
  {
    id: "msg-5",
    threadId: "thr-1",
    role: "agent",
    authorId: "agt-4",
    body: "Confirmed — we're seeing TLS handshake timeouts to your endpoint from us-east-2. Pulling logs.",
    createdAt: "2026-04-23T10:02:00.000Z",
  },

  // --- thr-2 — rate limits
  {
    id: "msg-6",
    threadId: "thr-2",
    role: "customer",
    authorId: "cus-7",
    body: "Hey — what's the per-org rate limit on the workspace endpoint? Docs say 100/min but I'm hitting 429 around 60/min.",
    createdAt: "2026-04-22T11:42:00.000Z",
  },
  {
    id: "msg-7",
    threadId: "thr-2",
    role: "agent",
    authorId: "agt-3",
    body: "Default is 100/min but trial workspaces are throttled to 60/min. You can request a bump from settings → API.",
    createdAt: "2026-04-22T15:18:00.000Z",
  },

  // --- thr-3 — bulk export request
  {
    id: "msg-8",
    threadId: "thr-3",
    role: "customer",
    authorId: "cus-3",
    body: "Would love a CSV export option for closed threads, even just per-month. Right now I'm scraping the API which feels brittle.",
    createdAt: "2026-04-19T16:07:00.000Z",
  },

  // --- thr-4 — billing wrong amount
  {
    id: "msg-9",
    threadId: "thr-4",
    role: "customer",
    authorId: "cus-1",
    body: "Invoice INV-12 charged us for 24 seats but our active count is 18. Can you take a look?",
    createdAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "msg-10",
    threadId: "thr-4",
    role: "agent",
    authorId: "agt-1",
    body: "Looking — likely from a seat-count snapshot taken before your offboarding cycle. Will issue a credit if so.",
    createdAt: "2026-04-22T13:48:00.000Z",
  },
  {
    id: "msg-11",
    threadId: "thr-4",
    role: "system",
    authorId: "system",
    body: "Priority changed: normal → high",
    createdAt: "2026-04-22T13:49:00.000Z",
  },
  {
    id: "msg-12",
    threadId: "thr-4",
    role: "customer",
    authorId: "cus-1",
    body: "Thanks — we offboarded 6 contractors on the 4th. Snapshot probably caught them.",
    createdAt: "2026-04-23T08:14:00.000Z",
  },

  // --- thr-5 — invite teammate (done)
  {
    id: "msg-13",
    threadId: "thr-5",
    role: "customer",
    authorId: "cus-11",
    body: "Can't find the invite teammate option in settings.",
    createdAt: "2026-04-20T13:18:00.000Z",
  },
  {
    id: "msg-14",
    threadId: "thr-5",
    role: "agent",
    authorId: "agt-3",
    body: "It's under Settings → Workspace → Members. Send me an email and I'll add them on your behalf if easier.",
    createdAt: "2026-04-20T14:12:00.000Z",
  },
  {
    id: "msg-15",
    threadId: "thr-5",
    role: "customer",
    authorId: "cus-11",
    body: "Found it, thanks!",
    createdAt: "2026-04-20T14:30:00.000Z",
  },
  {
    id: "msg-16",
    threadId: "thr-5",
    role: "system",
    authorId: "system",
    body: "Marked as done by Anika Iyer",
    createdAt: "2026-04-20T14:33:00.000Z",
  },

  // --- thr-6 — slack disconnect
  {
    id: "msg-17",
    threadId: "thr-6",
    role: "customer",
    authorId: "cus-5",
    body: "Our Slack integration shows 'reconnect required' as of 02:00 UTC — was there a deploy?",
    createdAt: "2026-04-23T07:02:00.000Z",
  },

  // --- thr-7 — SAML / Okta (snoozed)
  {
    id: "msg-18",
    threadId: "thr-7",
    role: "customer",
    authorId: "cus-12",
    body: "Setting up SAML through Okta. Getting 'AudienceRestriction' validation failure on callback. Have double-checked the entity ID.",
    createdAt: "2026-04-21T15:00:00.000Z",
  },
  {
    id: "msg-19",
    threadId: "thr-7",
    role: "agent",
    authorId: "agt-4",
    body: "Likely Okta's audience field doesn't match our SP entity ID exactly (case-sensitive). Can you paste your SAMLResponse XML decoded?",
    createdAt: "2026-04-21T17:30:00.000Z",
  },
  {
    id: "msg-20",
    threadId: "thr-7",
    role: "customer",
    authorId: "cus-12",
    body: "Will get with our IT team and send tomorrow.",
    createdAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "msg-21",
    threadId: "thr-7",
    role: "system",
    authorId: "system",
    body: "Snoozed until tomorrow morning by Jonas Kim",
    createdAt: "2026-04-22T17:10:00.000Z",
  },

  // --- thr-8 — Safari charts
  {
    id: "msg-22",
    threadId: "thr-8",
    role: "customer",
    authorId: "cus-4",
    body: "Charts on the analytics page show as empty rectangles in Safari 17.4. Chrome and Firefox are fine.",
    createdAt: "2026-04-22T18:48:00.000Z",
  },

  // --- thr-9 — refund (done)
  {
    id: "msg-23",
    threadId: "thr-9",
    role: "customer",
    authorId: "cus-8",
    body: "I clicked Upgrade by mistake last night — please refund the charge.",
    createdAt: "2026-04-18T22:00:00.000Z",
  },
  {
    id: "msg-24",
    threadId: "thr-9",
    role: "agent",
    authorId: "agt-1",
    body: "Done — refund issued to your card on file. Should land within 3 business days.",
    createdAt: "2026-04-19T11:30:00.000Z",
  },
  {
    id: "msg-25",
    threadId: "thr-9",
    role: "system",
    authorId: "system",
    body: "Marked as done by Marie Lefevre",
    createdAt: "2026-04-19T11:42:00.000Z",
  },

  // --- thr-10 — rotating secret
  {
    id: "msg-26",
    threadId: "thr-10",
    role: "customer",
    authorId: "cus-10",
    body: "What's the recommended way to rotate our API secret without downtime?",
    createdAt: "2026-04-23T05:30:00.000Z",
  },

  // --- thr-11 — Stripe dedupe
  {
    id: "msg-27",
    threadId: "thr-11",
    role: "customer",
    authorId: "cus-15",
    body: "We're receiving Stripe payment_succeeded events twice per charge — looks like dedupe key is off.",
    createdAt: "2026-04-22T03:11:00.000Z",
  },
  {
    id: "msg-28",
    threadId: "thr-11",
    role: "agent",
    authorId: "agt-4",
    body: "Looking — what's the event ID format on the duplicates? Same evt_ ID or different IDs with same payload?",
    createdAt: "2026-04-22T08:20:00.000Z",
  },
  {
    id: "msg-29",
    threadId: "thr-11",
    role: "customer",
    authorId: "cus-15",
    body: "Same evt_ ID, sent within ~2 seconds of each other.",
    createdAt: "2026-04-22T14:40:00.000Z",
  },
  {
    id: "msg-30",
    threadId: "thr-11",
    role: "agent",
    authorId: "agt-4",
    body: "That confirms our dedupe miss. Pushing a fix to the webhook gateway today.",
    createdAt: "2026-04-23T09:48:00.000Z",
  },

  // --- thr-12 — auto-snooze rule (snoozed)
  {
    id: "msg-31",
    threadId: "thr-12",
    role: "customer",
    authorId: "cus-3",
    body: "Could we get an auto-snooze rule for inactive threads? Anything with 7+ days no activity should snooze.",
    createdAt: "2026-04-15T13:22:00.000Z",
  },
  {
    id: "msg-32",
    threadId: "thr-12",
    role: "agent",
    authorId: "agt-1",
    body: "On our roadmap. Will keep you posted as we scope it.",
    createdAt: "2026-04-15T15:00:00.000Z",
  },
  {
    id: "msg-33",
    threadId: "thr-12",
    role: "system",
    authorId: "system",
    body: "Snoozed for one week by Marie Lefevre",
    createdAt: "2026-04-22T11:00:00.000Z",
  },

  // --- thr-13 — CSV missing attrs
  {
    id: "msg-34",
    threadId: "thr-13",
    role: "customer",
    authorId: "cus-9",
    body: "When I export customers to CSV the custom attributes column is empty.",
    createdAt: "2026-04-22T20:14:00.000Z",
  },
  {
    id: "msg-35",
    threadId: "thr-13",
    role: "agent",
    authorId: "agt-2",
    body: "Reproduced — we serialize attributes only when at least one value is set. Will fix the export to always emit the column.",
    createdAt: "2026-04-23T06:17:00.000Z",
  },

  // --- thr-14 — PII redaction
  {
    id: "msg-36",
    threadId: "thr-14",
    role: "customer",
    authorId: "cus-13",
    body: "Need a way to auto-redact PII from agent-side message transcripts before exporting (HIPAA requirements).",
    createdAt: "2026-04-21T10:08:00.000Z",
  },
  {
    id: "msg-37",
    threadId: "thr-14",
    role: "agent",
    authorId: "agt-1",
    body: "Logged as a feature request — we'll loop in our compliance team. Mind sharing the specific PII categories you need covered?",
    createdAt: "2026-04-22T09:30:00.000Z",
  },

  // --- thr-15 — push notifications
  {
    id: "msg-38",
    threadId: "thr-15",
    role: "customer",
    authorId: "cus-6",
    body: "iOS app stopped delivering push notifications after the 2.4 update. Android is fine.",
    createdAt: "2026-04-22T22:55:00.000Z",
  },

  // --- thr-16 — webhook key migration
  {
    id: "msg-39",
    threadId: "thr-16",
    role: "customer",
    authorId: "cus-2",
    body: "When does the v1 signing key get retired? We're still on the legacy header.",
    createdAt: "2026-04-20T17:18:00.000Z",
  },
  {
    id: "msg-40",
    threadId: "thr-16",
    role: "agent",
    authorId: "agt-4",
    body: "v1 deprecation is on June 15 2026. We'll send a reminder one month out. Migration guide: docs.thetabench.support/webhooks/v2.",
    createdAt: "2026-04-22T14:00:00.000Z",
  },

  // --- thr-17 — SSL provisioning (done)
  {
    id: "msg-41",
    threadId: "thr-17",
    role: "customer",
    authorId: "cus-14",
    body: "support.voltagepay.com showed 'pending' for 6h on certificate provisioning.",
    createdAt: "2026-04-21T20:00:00.000Z",
  },
  {
    id: "msg-42",
    threadId: "thr-17",
    role: "agent",
    authorId: "agt-4",
    body: "Manually retried provisioning — cert issued. Should be live in 5 minutes.",
    createdAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "msg-43",
    threadId: "thr-17",
    role: "customer",
    authorId: "cus-14",
    body: "Confirmed live, thanks!",
    createdAt: "2026-04-22T09:12:00.000Z",
  },
  {
    id: "msg-44",
    threadId: "thr-17",
    role: "system",
    authorId: "system",
    body: "Marked as done by Jonas Kim",
    createdAt: "2026-04-22T09:14:00.000Z",
  },

  // --- thr-18 — reply templates
  {
    id: "msg-45",
    threadId: "thr-18",
    role: "customer",
    authorId: "cus-18",
    body: "Would be huge to have reply templates with {{customer.first_name}} variables. Right now we copy/paste.",
    createdAt: "2026-04-18T14:00:00.000Z",
  },

  // --- thr-19 — onboarding webhook
  {
    id: "msg-46",
    threadId: "thr-19",
    role: "customer",
    authorId: "cus-20",
    body: "Just signed up — what's the recommended way to point our staging webhook receiver?",
    createdAt: "2026-04-23T04:18:00.000Z",
  },

  // --- thr-20 — annual switch
  {
    id: "msg-47",
    threadId: "thr-20",
    role: "customer",
    authorId: "cus-19",
    body: "We'd like to move our subscription to annual — does the discount apply mid-cycle?",
    createdAt: "2026-04-22T13:33:00.000Z",
  },

  // --- thr-21 — search returns deleted
  {
    id: "msg-48",
    threadId: "thr-21",
    role: "customer",
    authorId: "cus-17",
    body: "Search results occasionally include threads that were deleted — index lag?",
    createdAt: "2026-04-21T19:48:00.000Z",
  },
  {
    id: "msg-49",
    threadId: "thr-21",
    role: "agent",
    authorId: "agt-2",
    body: "Confirmed there's a tombstone propagation lag of up to 60s. Reproducing now.",
    createdAt: "2026-04-22T20:11:00.000Z",
  },

  // --- thr-22 — snooze off-by-one
  {
    id: "msg-50",
    threadId: "thr-22",
    role: "customer",
    authorId: "cus-4",
    body: "When I pick 'until next Monday' it snoozes until Tuesday. Looks like timezone math is off.",
    createdAt: "2026-04-22T08:00:00.000Z",
  },

  // --- thr-23 — SOC 2 (snoozed)
  {
    id: "msg-51",
    threadId: "thr-23",
    role: "customer",
    authorId: "cus-12",
    body: "Where can I download the latest SOC 2 Type II report?",
    createdAt: "2026-04-19T09:00:00.000Z",
  },
  {
    id: "msg-52",
    threadId: "thr-23",
    role: "agent",
    authorId: "agt-1",
    body: "It's gated behind an NDA — sending the request form to your inbox now.",
    createdAt: "2026-04-19T15:20:00.000Z",
  },
  {
    id: "msg-53",
    threadId: "thr-23",
    role: "system",
    authorId: "system",
    body: "Snoozed until next week by Marie Lefevre",
    createdAt: "2026-04-22T09:18:00.000Z",
  },

  // --- thr-24 — threading dedupe (done)
  {
    id: "msg-54",
    threadId: "thr-24",
    role: "customer",
    authorId: "cus-16",
    body: "How does Plain decide whether two emails go to the same thread or split them?",
    createdAt: "2026-04-21T11:48:00.000Z",
  },
  {
    id: "msg-55",
    threadId: "thr-24",
    role: "agent",
    authorId: "agt-3",
    body: "We use the In-Reply-To and References headers, with subject-line fallback when those are missing.",
    createdAt: "2026-04-21T15:48:00.000Z",
  },
  {
    id: "msg-56",
    threadId: "thr-24",
    role: "system",
    authorId: "system",
    body: "Marked as done by Anika Iyer",
    createdAt: "2026-04-21T16:00:00.000Z",
  },

  // --- thr-25 — production signature mismatch (urgent)
  {
    id: "msg-57",
    threadId: "thr-25",
    role: "customer",
    authorId: "cus-15",
    body: "All inbound webhooks rejected with signature_mismatch since 06:00 UTC. Production blocked.",
    createdAt: "2026-04-23T06:30:00.000Z",
  },
  {
    id: "msg-58",
    threadId: "thr-25",
    role: "agent",
    authorId: "agt-4",
    body: "On it — paging the gateway team. Any chance the signing secret rotated on your side recently?",
    createdAt: "2026-04-23T06:48:00.000Z",
  },
  {
    id: "msg-59",
    threadId: "thr-25",
    role: "customer",
    authorId: "cus-15",
    body: "No rotation in 6 weeks. Confirmed env var matches the dashboard.",
    createdAt: "2026-04-23T07:30:00.000Z",
  },
  {
    id: "msg-60",
    threadId: "thr-25",
    role: "system",
    authorId: "system",
    body: "Label 'urgent' added by Jonas Kim",
    createdAt: "2026-04-23T07:35:00.000Z",
  },
  {
    id: "msg-61",
    threadId: "thr-25",
    role: "agent",
    authorId: "agt-4",
    body: "Found it — our gateway flipped to v2 signature format an hour ago and didn't fall back for v1 customers. Rolling back now.",
    createdAt: "2026-04-23T10:00:00.000Z",
  },
]
