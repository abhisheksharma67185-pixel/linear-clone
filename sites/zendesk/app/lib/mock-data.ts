// ---------------------------------------------------------------------------
// Zendesk mock data — initial seed for the in-memory store.
// All ids are stable and predictable so task definitions can reference them.
// ---------------------------------------------------------------------------

export type TicketStatus =
  | "new"
  | "open"
  | "pending"
  | "on-hold"
  | "solved"
  | "closed"
export type TicketPriority = "urgent" | "high" | "normal" | "low"
export type TicketChannel = "email" | "web" | "chat" | "api" | "phone"
export type AgentRole = "admin" | "agent" | "light-agent"

export interface Brand {
  id: string
  name: string
  subdomain: string
  active: boolean
}

export interface Group {
  id: string
  name: string
  description: string
  default: boolean
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "end-user" | AgentRole
  groupId?: string | null
  active: boolean
  organization?: string
  createdAt: string
}

export interface Ticket {
  id: string
  number: number // human-friendly #N
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  channel: TicketChannel
  requesterId: string
  assigneeId: string | null
  groupId: string | null
  brandId: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  ticketId: string
  authorId: string
  body: string
  public: boolean
  createdAt: string
}

export interface Macro {
  id: string
  title: string
  body: string
  active: boolean
  createdAt: string
}

export interface View {
  id: string
  title: string
  // tickets matching `filter` are members of this view
  filter: {
    status?: TicketStatus | TicketStatus[]
    assigneeId?: string | "me" | "unassigned"
    groupId?: string
    channel?: TicketChannel
  }
  group: "your-work" | "shared-work" | "completed-work"
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const brands: Brand[] = [
  {
    id: "brand-1",
    name: "Theta Support",
    subdomain: "thetalabs",
    active: true,
  },
]

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export const groups: Group[] = [
  {
    id: "grp-1",
    name: "Support",
    description: "First-line customer support",
    default: true,
    createdAt: "2026-01-04T09:00:00.000Z",
  },
  {
    id: "grp-2",
    name: "Billing",
    description: "Subscription, invoices, refunds",
    default: false,
    createdAt: "2026-01-04T09:00:00.000Z",
  },
  {
    id: "grp-3",
    name: "Triage",
    description: "Inbound triage and routing",
    default: false,
    createdAt: "2026-01-04T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Users — agents (usr-1..usr-5) and end-user customers (usr-6..usr-20)
// ---------------------------------------------------------------------------

export const users: User[] = [
  // Agents
  {
    id: "usr-1",
    name: "Riya Mehta",
    email: "riya@thetalabs.example",
    role: "admin",
    groupId: "grp-1",
    active: true,
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "usr-2",
    name: "Marcus Allen",
    email: "marcus@thetalabs.example",
    role: "agent",
    groupId: "grp-1",
    active: true,
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "usr-3",
    name: "Sun-Hee Park",
    email: "sunhee@thetalabs.example",
    role: "agent",
    groupId: "grp-2",
    active: true,
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "usr-4",
    name: "Diego Hernandez",
    email: "diego@thetalabs.example",
    role: "agent",
    groupId: "grp-3",
    active: true,
    createdAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "usr-5",
    name: "Ana Volkov",
    email: "ana@thetalabs.example",
    role: "light-agent",
    groupId: "grp-1",
    active: true,
    createdAt: "2026-01-02T09:00:00.000Z",
  },

  // Customers
  {
    id: "usr-6",
    name: "Ethan Park",
    email: "ethan.park@example.com",
    role: "end-user",
    organization: "Northwind Inc.",
    active: true,
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "usr-7",
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    role: "end-user",
    organization: "Acme Corp.",
    active: true,
    createdAt: "2026-02-03T09:00:00.000Z",
  },
  {
    id: "usr-8",
    name: "Liam Foster",
    email: "liam.foster@example.com",
    role: "end-user",
    organization: "Globex",
    active: true,
    createdAt: "2026-02-04T09:00:00.000Z",
  },
  {
    id: "usr-9",
    name: "Sofia Rivera",
    email: "sofia.rivera@example.com",
    role: "end-user",
    organization: "Initech",
    active: true,
    createdAt: "2026-02-05T09:00:00.000Z",
  },
  {
    id: "usr-10",
    name: "Hiroshi Tanaka",
    email: "hiroshi.tanaka@example.com",
    role: "end-user",
    organization: "Nakatomi Trading",
    active: true,
    createdAt: "2026-02-06T09:00:00.000Z",
  },
  {
    id: "usr-11",
    name: "Maya Goldberg",
    email: "maya.goldberg@example.com",
    role: "end-user",
    organization: "Hooli",
    active: true,
    createdAt: "2026-02-07T09:00:00.000Z",
  },
  {
    id: "usr-12",
    name: "Owen Walsh",
    email: "owen.walsh@example.com",
    role: "end-user",
    organization: "Pied Piper",
    active: true,
    createdAt: "2026-02-08T09:00:00.000Z",
  },
  {
    id: "usr-13",
    name: "Priya Iyer",
    email: "priya.iyer@example.com",
    role: "end-user",
    organization: "Massive Dynamic",
    active: true,
    createdAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: "usr-14",
    name: "Tomás Silva",
    email: "tomas.silva@example.com",
    role: "end-user",
    organization: "Soylent Corp.",
    active: true,
    createdAt: "2026-02-11T09:00:00.000Z",
  },
  {
    id: "usr-15",
    name: "Nora Bergström",
    email: "nora.bergstrom@example.com",
    role: "end-user",
    organization: "Cyberdyne",
    active: true,
    createdAt: "2026-02-12T09:00:00.000Z",
  },
  {
    id: "usr-16",
    name: "Sample Customer",
    email: "sample@thetalabs.zendesk.example",
    role: "end-user",
    organization: "Sample Co.",
    active: true,
    createdAt: "2026-02-13T09:00:00.000Z",
  },
  {
    id: "usr-17",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@example.com",
    role: "end-user",
    organization: "Wayne Enterprises",
    active: true,
    createdAt: "2026-02-14T09:00:00.000Z",
  },
  {
    id: "usr-18",
    name: "Yuki Sato",
    email: "yuki.sato@example.com",
    role: "end-user",
    organization: "Stark Industries",
    active: true,
    createdAt: "2026-02-15T09:00:00.000Z",
  },
  {
    id: "usr-19",
    name: "Fatima Al-Mansour",
    email: "fatima.almansour@example.com",
    role: "end-user",
    organization: "Tyrell Corp.",
    active: true,
    createdAt: "2026-02-16T09:00:00.000Z",
  },
  {
    id: "usr-20",
    name: "Dmitri Volkov",
    email: "dmitri.volkov@example.com",
    role: "end-user",
    organization: "Umbrella Co.",
    active: true,
    createdAt: "2026-02-17T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Tickets — 30 tickets across statuses, priorities, channels.
// ticket #2 is the SAMPLE ticket rendered on the home page.
// ---------------------------------------------------------------------------

export const tickets: Ticket[] = [
  {
    id: "tic-1",
    number: 1,
    subject: "Welcome to Theta Support",
    description: "Thanks for trying our support workspace.",
    status: "closed",
    priority: "low",
    channel: "web",
    requesterId: "usr-16",
    assigneeId: "usr-1",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["welcome", "onboarding"],
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-04-01T08:30:00.000Z",
  },
  {
    id: "tic-2",
    number: 2,
    subject: "SAMPLE: How does Zendesk work",
    description:
      "Hello, let's see how you or your agents can easily respond to and solve tickets. Feel free to email additional customer test inquiries to **support@thetalabs.zendesk.example** or use the Play feature to simulate end-user inquiries.",
    status: "open",
    priority: "normal",
    channel: "email",
    requesterId: "usr-16",
    assigneeId: "usr-1",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["sample", "getting-started"],
    createdAt: "2026-04-23T01:21:00.000Z",
    updatedAt: "2026-04-23T01:21:00.000Z",
  },
  {
    id: "tic-3",
    number: 3,
    subject: "Cannot log in after password reset",
    description: "Reset link works but the new password is rejected on login.",
    status: "open",
    priority: "high",
    channel: "email",
    requesterId: "usr-6",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["auth", "login"],
    createdAt: "2026-04-22T10:12:00.000Z",
    updatedAt: "2026-04-22T11:00:00.000Z",
  },
  {
    id: "tic-4",
    number: 4,
    subject: "Refund request — order #88421",
    description: "Customer requesting refund for duplicate billing.",
    status: "pending",
    priority: "high",
    channel: "email",
    requesterId: "usr-7",
    assigneeId: "usr-3",
    groupId: "grp-2",
    brandId: "brand-1",
    tags: ["billing", "refund"],
    createdAt: "2026-04-21T14:00:00.000Z",
    updatedAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "tic-5",
    number: 5,
    subject: "Mobile app crashes on startup (iOS 18)",
    description: "App immediately crashes after splash screen on iPhone 14.",
    status: "open",
    priority: "urgent",
    channel: "web",
    requesterId: "usr-8",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["mobile", "crash", "ios"],
    createdAt: "2026-04-22T16:20:00.000Z",
    updatedAt: "2026-04-22T16:45:00.000Z",
  },
  {
    id: "tic-6",
    number: 6,
    subject: "Dark mode preference not persisting",
    description: "Setting reverts to light on every reload.",
    status: "open",
    priority: "low",
    channel: "web",
    requesterId: "usr-9",
    assigneeId: null,
    groupId: "grp-3",
    brandId: "brand-1",
    tags: ["settings", "ui"],
    createdAt: "2026-04-22T11:30:00.000Z",
    updatedAt: "2026-04-22T11:30:00.000Z",
  },
  {
    id: "tic-7",
    number: 7,
    subject: "Two-factor codes not arriving",
    description: "SMS not received for 2FA attempt.",
    status: "pending",
    priority: "urgent",
    channel: "phone",
    requesterId: "usr-10",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["auth", "2fa", "sms"],
    createdAt: "2026-04-21T09:00:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
  },
  {
    id: "tic-8",
    number: 8,
    subject: "Cancel my subscription",
    description: "Please cancel my Pro plan effective end of cycle.",
    status: "solved",
    priority: "normal",
    channel: "email",
    requesterId: "usr-11",
    assigneeId: "usr-3",
    groupId: "grp-2",
    brandId: "brand-1",
    tags: ["billing", "cancel"],
    createdAt: "2026-04-18T13:00:00.000Z",
    updatedAt: "2026-04-19T15:00:00.000Z",
  },
  {
    id: "tic-9",
    number: 9,
    subject: "API key rate-limited unexpectedly",
    description: "429 responses well under documented limits.",
    status: "open",
    priority: "high",
    channel: "api",
    requesterId: "usr-12",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["api", "rate-limit"],
    createdAt: "2026-04-22T07:30:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
  },
  {
    id: "tic-10",
    number: 10,
    subject: "Webhook deliveries failing with 502",
    description: "Outbound webhooks fail intermittently.",
    status: "on-hold",
    priority: "high",
    channel: "api",
    requesterId: "usr-13",
    assigneeId: "usr-1",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["api", "webhooks"],
    createdAt: "2026-04-20T08:00:00.000Z",
    updatedAt: "2026-04-21T10:00:00.000Z",
  },
  {
    id: "tic-11",
    number: 11,
    subject: "Invoice PDF won't download",
    description: "Clicking download just opens a blank tab.",
    status: "open",
    priority: "normal",
    channel: "web",
    requesterId: "usr-14",
    assigneeId: "usr-3",
    groupId: "grp-2",
    brandId: "brand-1",
    tags: ["billing", "invoice"],
    createdAt: "2026-04-21T16:30:00.000Z",
    updatedAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "tic-12",
    number: 12,
    subject: "Add seats to team plan",
    description: "Need 5 more seats provisioned this week.",
    status: "open",
    priority: "normal",
    channel: "email",
    requesterId: "usr-15",
    assigneeId: "usr-3",
    groupId: "grp-2",
    brandId: "brand-1",
    tags: ["billing", "seats"],
    createdAt: "2026-04-22T13:00:00.000Z",
    updatedAt: "2026-04-22T13:00:00.000Z",
  },
  {
    id: "tic-13",
    number: 13,
    subject: "Feature request: SAML SSO",
    description: "We require SAML SSO for our enterprise rollout.",
    status: "pending",
    priority: "normal",
    channel: "email",
    requesterId: "usr-17",
    assigneeId: "usr-1",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["feature-request", "sso"],
    createdAt: "2026-04-19T11:00:00.000Z",
    updatedAt: "2026-04-21T09:00:00.000Z",
  },
  {
    id: "tic-14",
    number: 14,
    subject: "Email notifications duplicated",
    description: "Each ticket update sends two identical emails.",
    status: "open",
    priority: "low",
    channel: "email",
    requesterId: "usr-18",
    assigneeId: null,
    groupId: "grp-3",
    brandId: "brand-1",
    tags: ["notifications", "email"],
    createdAt: "2026-04-22T15:00:00.000Z",
    updatedAt: "2026-04-22T15:00:00.000Z",
  },
  {
    id: "tic-15",
    number: 15,
    subject: "Chat widget fails to load on Safari",
    description: "Console error: 'Failed to fetch widget bundle'.",
    status: "open",
    priority: "high",
    channel: "chat",
    requesterId: "usr-19",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["chat", "browser", "safari"],
    createdAt: "2026-04-22T12:00:00.000Z",
    updatedAt: "2026-04-22T12:30:00.000Z",
  },
  {
    id: "tic-16",
    number: 16,
    subject: "Export contacts as CSV",
    description: "How do I export my contact list to CSV?",
    status: "solved",
    priority: "low",
    channel: "chat",
    requesterId: "usr-20",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["how-to", "export"],
    createdAt: "2026-04-17T10:00:00.000Z",
    updatedAt: "2026-04-17T11:00:00.000Z",
  },
  {
    id: "tic-17",
    number: 17,
    subject: "Custom domain SSL renewal failed",
    description: "Auto renewal failed; certificate expired this morning.",
    status: "open",
    priority: "urgent",
    channel: "email",
    requesterId: "usr-6",
    assigneeId: "usr-1",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["dns", "ssl"],
    createdAt: "2026-04-23T07:00:00.000Z",
    updatedAt: "2026-04-23T07:15:00.000Z",
  },
  {
    id: "tic-18",
    number: 18,
    subject: "Search returns no results for known keywords",
    description: "Indexing seems stale across the dashboard search.",
    status: "open",
    priority: "normal",
    channel: "web",
    requesterId: "usr-7",
    assigneeId: null,
    groupId: "grp-3",
    brandId: "brand-1",
    tags: ["search", "indexing"],
    createdAt: "2026-04-22T17:00:00.000Z",
    updatedAt: "2026-04-22T17:00:00.000Z",
  },
  {
    id: "tic-19",
    number: 19,
    subject: "Phone callback never came through",
    description: "Booked a callback yesterday afternoon, no call received.",
    status: "pending",
    priority: "high",
    channel: "phone",
    requesterId: "usr-8",
    assigneeId: "usr-4",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["phone", "callback"],
    createdAt: "2026-04-21T15:30:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
  },
  {
    id: "tic-20",
    number: 20,
    subject: "Onboarding: enable single sign-on",
    description: "Need help wiring our IdP to your SSO endpoint.",
    status: "new",
    priority: "normal",
    channel: "email",
    requesterId: "usr-9",
    assigneeId: null,
    groupId: "grp-3",
    brandId: "brand-1",
    tags: ["sso", "onboarding"],
    createdAt: "2026-04-23T08:00:00.000Z",
    updatedAt: "2026-04-23T08:00:00.000Z",
  },
  {
    id: "tic-21",
    number: 21,
    subject: "Card on file declined this month",
    description: "Payment failed even though the card is valid.",
    status: "open",
    priority: "high",
    channel: "email",
    requesterId: "usr-10",
    assigneeId: "usr-3",
    groupId: "grp-2",
    brandId: "brand-1",
    tags: ["billing", "payment"],
    createdAt: "2026-04-22T19:30:00.000Z",
    updatedAt: "2026-04-22T20:00:00.000Z",
  },
  {
    id: "tic-22",
    number: 22,
    subject: "Slack integration disconnects after a few hours",
    description: "We re-auth and it disconnects again next morning.",
    status: "open",
    priority: "normal",
    channel: "web",
    requesterId: "usr-11",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["integration", "slack"],
    createdAt: "2026-04-22T18:30:00.000Z",
    updatedAt: "2026-04-22T19:00:00.000Z",
  },
  {
    id: "tic-23",
    number: 23,
    subject: "Bulk import fails on row 1024",
    description: "CSV import fails consistently mid-file.",
    status: "on-hold",
    priority: "high",
    channel: "web",
    requesterId: "usr-12",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["import", "csv"],
    createdAt: "2026-04-20T11:00:00.000Z",
    updatedAt: "2026-04-21T13:00:00.000Z",
  },
  {
    id: "tic-24",
    number: 24,
    subject: "Reporting dashboard shows yesterday's data",
    description: "Numbers seem 24h delayed.",
    status: "open",
    priority: "normal",
    channel: "web",
    requesterId: "usr-13",
    assigneeId: null,
    groupId: "grp-3",
    brandId: "brand-1",
    tags: ["reporting", "data"],
    createdAt: "2026-04-22T20:00:00.000Z",
    updatedAt: "2026-04-22T20:00:00.000Z",
  },
  {
    id: "tic-25",
    number: 25,
    subject: "Profile picture upload not working",
    description: "Upload appears to succeed but picture never updates.",
    status: "solved",
    priority: "low",
    channel: "web",
    requesterId: "usr-14",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["profile", "upload"],
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-15T11:00:00.000Z",
  },
  {
    id: "tic-26",
    number: 26,
    subject: "Account locked after travel",
    description: "Logged in from new country, account is now locked.",
    status: "open",
    priority: "high",
    channel: "phone",
    requesterId: "usr-15",
    assigneeId: "usr-4",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["auth", "lockout"],
    createdAt: "2026-04-22T22:00:00.000Z",
    updatedAt: "2026-04-22T22:30:00.000Z",
  },
  {
    id: "tic-27",
    number: 27,
    subject: "Need to merge two duplicate accounts",
    description: "Same person, two distinct logins; please merge.",
    status: "open",
    priority: "normal",
    channel: "email",
    requesterId: "usr-17",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["account", "merge"],
    createdAt: "2026-04-21T18:00:00.000Z",
    updatedAt: "2026-04-22T08:00:00.000Z",
  },
  {
    id: "tic-28",
    number: 28,
    subject: "Tax exemption certificate upload",
    description: "Where do I upload my W-9 / tax exemption?",
    status: "pending",
    priority: "low",
    channel: "email",
    requesterId: "usr-18",
    assigneeId: "usr-3",
    groupId: "grp-2",
    brandId: "brand-1",
    tags: ["billing", "tax"],
    createdAt: "2026-04-21T10:00:00.000Z",
    updatedAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "tic-29",
    number: 29,
    subject: "Webhook signature mismatch on staging",
    description: "Signatures fail validation against your docs.",
    status: "open",
    priority: "high",
    channel: "api",
    requesterId: "usr-19",
    assigneeId: "usr-2",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["api", "webhooks", "signature"],
    createdAt: "2026-04-23T05:00:00.000Z",
    updatedAt: "2026-04-23T05:30:00.000Z",
  },
  {
    id: "tic-30",
    number: 30,
    subject: "Out of office responder loops",
    description: "Auto-replies are bouncing back and forth.",
    status: "closed",
    priority: "low",
    channel: "email",
    requesterId: "usr-20",
    assigneeId: "usr-1",
    groupId: "grp-1",
    brandId: "brand-1",
    tags: ["email", "automations"],
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Comments — a few seed comments
// ---------------------------------------------------------------------------

export const comments: Comment[] = [
  {
    id: "cmt-1",
    ticketId: "tic-2",
    authorId: "usr-16",
    body: "Trying to understand how the workflow works end-to-end.",
    public: true,
    createdAt: "2026-04-23T01:21:30.000Z",
  },
  {
    id: "cmt-2",
    ticketId: "tic-3",
    authorId: "usr-2",
    body: "Hi Ethan — can you confirm whether you're using the new password as-typed or pasted?",
    public: true,
    createdAt: "2026-04-22T10:30:00.000Z",
  },
  {
    id: "cmt-3",
    ticketId: "tic-5",
    authorId: "usr-2",
    body: "We're investigating — likely related to the latest iOS push.",
    public: true,
    createdAt: "2026-04-22T16:35:00.000Z",
  },
  {
    id: "cmt-4",
    ticketId: "tic-9",
    authorId: "usr-2",
    body: "Internal: customer is on legacy plan with reduced quota.",
    public: false,
    createdAt: "2026-04-22T07:45:00.000Z",
  },
  {
    id: "cmt-5",
    ticketId: "tic-17",
    authorId: "usr-1",
    body: "Cert ops paged — we'll publish a renewed cert within the hour.",
    public: false,
    createdAt: "2026-04-23T07:10:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Macros — saved replies
// ---------------------------------------------------------------------------

export const macros: Macro[] = [
  {
    id: "mac-1",
    title: "Acknowledge receipt",
    body: "Thanks for reaching out — we received your ticket and a teammate will reply shortly.",
    active: true,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "mac-2",
    title: "Refund processed",
    body: "Your refund has been processed and should appear within 5–10 business days.",
    active: true,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "mac-3",
    title: "Bug confirmed — escalating",
    body: "We have reproduced the issue and have escalated it to engineering. We'll keep you posted.",
    active: true,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "mac-4",
    title: "Close as resolved",
    body: "Glad we could help. Closing this ticket — feel free to reopen if anything else comes up.",
    active: true,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "mac-5",
    title: "Unable to reproduce",
    body: "We tried but couldn't reproduce the issue — could you share a screen recording so we can dig deeper?",
    active: false,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Views — what shows up in the left sidebar groups
// ---------------------------------------------------------------------------

export const views: View[] = [
  {
    id: "view-tickets",
    title: "Tickets",
    filter: { assigneeId: "me" },
    group: "your-work",
  },
  {
    id: "view-ccd",
    title: "CC'd",
    filter: { assigneeId: "me" },
    group: "shared-work",
  },
  {
    id: "view-following",
    title: "Following",
    filter: { assigneeId: "me" },
    group: "shared-work",
  },
  {
    id: "view-last-30",
    title: "Last 30 days",
    filter: { status: ["solved", "closed"] },
    group: "completed-work",
  },
]
