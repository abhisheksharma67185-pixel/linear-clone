// ---------------------------------------------------------------------------
// LinearStoreState — the per-session state container.
//
// Everything that used to live as module-level `let`s across `app/lib/store.ts`
// and the `lib/*-mocks.ts` files now lives on this object, one instance per
// rollout session. The session layer (./session.ts) owns the registry +
// AsyncLocalStorage; consumers read state via `_state()` and never see the
// registry directly.
// ---------------------------------------------------------------------------

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
// Workspace settings (was lib/workspace-mocks.ts)
// ---------------------------------------------------------------------------

export interface WorkspaceState {
  name: string
  slug: string
  logoDataUrl: string | null
  fiscalYearStartMonth: string
  region: "us" | "eu"
}

const INITIAL_WORKSPACE: WorkspaceState = {
  name: "Abhishek",
  slug: "abhishek2007",
  logoDataUrl: null,
  fiscalYearStartMonth: "january",
  region: "us",
}

// ---------------------------------------------------------------------------
// Members-admin overlay (was lib/members-admin-mocks.ts)
// ---------------------------------------------------------------------------

export type MemberRole = "admin" | "member" | "guest"
export type MemberStatus = "active" | "invited" | "suspended" | "application"

export interface ExtraMember {
  id: string
  name: string
  email: string
  avatar: string
  role: MemberRole
  status: MemberStatus
  joinedAt: string
  lastSeenAt: string | null
  username: string
  teamCount?: number
}

export interface MembersAdminState {
  roleOverrides: Map<string, MemberRole>
  statusOverrides: Map<string, MemberStatus>
  lastSeenOverrides: Map<string, string | null>
  extras: ExtraMember[]
  seeded: boolean
}

// ---------------------------------------------------------------------------
// Agent personalization (was lib/agent-mocks.ts)
// ---------------------------------------------------------------------------

export interface Skill {
  id: string
  name: string
  slashCommand: string
  promptTemplate: string
  autoSelectRules: string
  lastUsedAt: string | null
  createdAt: string
}

export interface McpServer {
  id: string
  name: string
  url: string
  status: "connected" | "error"
  addedAt: string
}

export interface AgentState {
  guidance: string
  skills: Skill[]
  mcpServers: McpServer[]
}

// ---------------------------------------------------------------------------
// API settings — OAuth apps + webhooks (was lib/api-settings-mocks.ts)
// ---------------------------------------------------------------------------

export interface OAuthApp {
  id: string
  name: string
  description: string
  redirectUris: string[]
  scopes: string[]
  iconDataUrl: string | null
  clientId: string
  clientSecret: string
  createdAt: string
}

export type WebhookResource =
  | "issues"
  | "comments"
  | "projects"
  | "cycles"
  | "labels"
  | "reactions"
  | "initiatives"
  | "documents"
  | "customer-requests"
  | "issue-attachments"
  | "project-updates"

export interface Webhook {
  id: string
  url: string
  resources: WebhookResource[]
  teamId: string | null
  secret: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Document templates (was lib/document-template-mocks.ts)
// ---------------------------------------------------------------------------

export interface DocumentTemplate {
  id: string
  name: string
  iconName: string
  body: string
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Emojis (was lib/emoji-mocks.ts)
// ---------------------------------------------------------------------------

export type EmojiMime = "image/png" | "image/jpeg" | "image/gif" | "image/webp"

export interface Emoji {
  id: string
  shortcode: string
  dataUrl: string
  mimeType: EmojiMime
  sizeBytes: number
  uploaderId: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Project statuses (was lib/project-statuses-mocks.ts)
// ---------------------------------------------------------------------------

export type StatusCategory =
  | "backlog"
  | "planned"
  | "in-progress"
  | "completed"
  | "canceled"

export interface ProjectStatusRow {
  id: string
  name: string
  description: string
  color: string
  category: StatusCategory
  order: number
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Project templates (was lib/project-template-mocks.ts)
// ---------------------------------------------------------------------------

export type ProjectTemplateVisibility = "private" | "workspace"
export type ProjectTemplateScope = "workspace" | "team"

export interface ProjectMilestone {
  id: string
  name: string
}

export interface ProjectTemplateAttributes {
  status: string
  priority: "none" | "low" | "medium" | "high" | "urgent"
  leadId: string | null
  memberIds: string[]
  teamId: string | null
  labelIds: string[]
  dependencies: string[]
  issuesSeed: number
}

export interface ProjectTemplate {
  id: string
  name: string
  iconName: string
  projectName: string
  summary: string
  description: string
  attributes: ProjectTemplateAttributes
  milestones: ProjectMilestone[]
  visibility: ProjectTemplateVisibility
  scope: ProjectTemplateScope
  order: number
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Security: sessions, passkeys, API keys, integrations (was lib/security-mocks.ts)
// ---------------------------------------------------------------------------

export interface Session {
  id: string
  userAgent: string
  city: string
  countryCode: string
  isCurrent: boolean
  lastSeenAt: string
}

export interface Passkey {
  id: string
  name: string
  createdAt: string
}

export interface ApiKey {
  id: string
  name: string
  token: string
  lastFour: string
  expiresAt: string | null
  createdAt: string
}

export type IntegrationStatus = "disconnected" | "connected"

export interface IntegrationState {
  provider: string
  status: IntegrationStatus
  accountHandle: string | null
  connectedAt: string | null
}

// ---------------------------------------------------------------------------
// SLAs + billing plan (was lib/sla-mocks.ts)
// ---------------------------------------------------------------------------

export type BillingPlan =
  | "free"
  | "standard"
  | "trial"
  | "business"
  | "enterprise"

export interface PlanState {
  plan: BillingPlan
  trialDaysRemaining: number | null
}

export type SlaDurationUnit = "minutes" | "hours" | "days" | "business-hours"

export interface SlaPolicy {
  id: string
  name: string
  durationValue: number
  durationUnit: SlaDurationUnit
  scopeChips: string[]
  pauseConditions: string
  breachNotify: string
  createdAt: string
  updatedAt: string
}

export type AutomationTrigger =
  | "issue-created"
  | "issue-updated"
  | "label-added"

export type AutomationAction = "add-sla" | "remove-sla"

export interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: {
    teamId: string | null
    labelIds: string[]
    priority: string | null
    assigneeId: string | null
  }
  action: AutomationAction
  slaPolicyId: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Teams admin overlay (was lib/teams-admin-mocks.ts)
// ---------------------------------------------------------------------------

export type TeamAdminStatus = "active" | "retired" | "recently-deleted"

export interface TeamsAdminState {
  status: Map<string, TeamAdminStatus>
  leftByCurrentUser: Set<string>
}

// ---------------------------------------------------------------------------
// Issue templates (was lib/templates-mocks.ts)
// ---------------------------------------------------------------------------

export type TemplateType = "standard" | "custom-form"

export interface TemplateDefaults {
  teamId: string | null
  priority: "none" | "low" | "medium" | "high" | "urgent"
  assigneeId: string | null
  projectId: string | null
  labelIds: string[]
  status?: string | null
  estimate?: number | null
  cycleId?: string | null
  dueDate?: string | null
  parentId?: string | null
}

export interface CustomFormField {
  id: string
  kind:
    | "text"
    | "textarea"
    | "select"
    | "multi-select"
    | "number"
    | "date"
    | "toggle"
  label: string
  placeholder: string
  required: boolean
  options: string[]
}

export interface IssueTemplate {
  id: string
  type: TemplateType
  name: string
  description: string
  issueTitle: string
  issueBody: string
  defaults: TemplateDefaults
  fields: CustomFormField[]
  order: number
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Chaos / latency / rate-limit config — mirrors UniversalConfig but lives on
// the per-session state so the middleware can read it without crossing the
// core boundary on every request.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// LinearStoreState
// ---------------------------------------------------------------------------

export interface LinearStoreState {
  members: Member[]
  teams: Team[]
  projects: Project[]
  cycles: Cycle[]
  issues: Issue[]
  labels: Label[]
  projectLabels: Label[]
  views: View[]

  nextIssueCounters: Record<string, number>
  nextIssueId: number
  nextProjectId: number
  nextCycleId: number
  nextLabelId: number
  nextProjectLabelId: number
  nextTeamId: number
  nextViewId: number

  dateOverride: string | null
  dateCounter: number

  workspace: WorkspaceState
  pendingDeletionCode: { code: string; expiresAt: number } | null

  membersAdmin: MembersAdminState
  agent: AgentState

  oauthApps: OAuthApp[]
  webhooks: Webhook[]
  documentTemplates: DocumentTemplate[]
  emojis: Emoji[]
  projectStatuses: ProjectStatusRow[]
  projectTemplates: ProjectTemplate[]
  issueTemplates: IssueTemplate[]
  slaPolicies: SlaPolicy[]
  automationRules: AutomationRule[]
  planState: PlanState
  sessions: Session[]
  passkeys: Passkey[]
  apiKeys: ApiKey[]
  integrations: Record<string, IntegrationState>
  teamsAdmin: TeamsAdminState
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function createInitialState(): LinearStoreState {
  return {
    members: deepClone(initialMembers),
    teams: deepClone(initialTeams),
    projects: deepClone(initialProjects),
    cycles: deepClone(initialCycles),
    issues: deepClone(initialIssues),
    labels: deepClone(initialLabels),
    projectLabels: [],
    views: deepClone(initialViews),

    nextIssueCounters: {
      PLT: 400,
      FE: 55,
      INF: 1,
      LEG: 86,
      ABH: 5,
    },
    nextIssueId: 185,
    nextProjectId: 4,
    nextCycleId: 15,
    nextLabelId: 13,
    nextProjectLabelId: 1,
    nextTeamId: 5,
    nextViewId: 5,

    dateOverride: null,
    dateCounter: 0,

    workspace: { ...INITIAL_WORKSPACE },
    pendingDeletionCode: null,

    membersAdmin: {
      roleOverrides: new Map(),
      statusOverrides: new Map(),
      lastSeenOverrides: new Map(),
      extras: [],
      seeded: false,
    },
    agent: {
      guidance: "",
      skills: [],
      mcpServers: [],
    },

    oauthApps: [],
    webhooks: [],
    documentTemplates: [],
    emojis: [],
    projectStatuses: defaultProjectStatuses(),
    projectTemplates: [],
    issueTemplates: [],
    slaPolicies: [],
    automationRules: [],
    planState: { plan: "free", trialDaysRemaining: null },
    sessions: defaultSessions(),
    passkeys: [],
    apiKeys: [],
    integrations: defaultIntegrations(),
    teamsAdmin: {
      status: new Map(),
      leftByCurrentUser: new Set(),
    },
  }
}

// ---------------------------------------------------------------------------
// In-place reset — used when a session is reused across episodes. Keeps the
// same object identity so any cached references stay valid; only the slot
// values are replaced.
// ---------------------------------------------------------------------------

export function resetState(state: LinearStoreState, seed?: number): void {
  const fresh = createInitialState()
  Object.assign(state, fresh)
  state.workspace = fresh.workspace
  state.membersAdmin = fresh.membersAdmin
  state.agent = fresh.agent

  if (seed !== undefined) {
    const base = new Date("2025-06-01T12:00:00.000Z")
    base.setMinutes(base.getMinutes() + (seed % 1440))
    state.dateOverride = base.toISOString()
  }
}

// ---------------------------------------------------------------------------
// Default seeds for the slots that ship with non-empty content
// ---------------------------------------------------------------------------

const STATUS_CATEGORIES_ORDER: StatusCategory[] = [
  "backlog",
  "planned",
  "in-progress",
  "completed",
  "canceled",
]

const STATUS_CATEGORY_LABEL: Record<StatusCategory, string> = {
  backlog: "Backlog",
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  canceled: "Canceled",
}

const STATUS_CATEGORY_DEFAULT_COLOR: Record<StatusCategory, string> = {
  backlog: "#9ca3af",
  planned: "#a78bfa",
  "in-progress": "#f59e0b",
  completed: "#10b981",
  canceled: "#6b7280",
}

function defaultProjectStatuses(): ProjectStatusRow[] {
  return STATUS_CATEGORIES_ORDER.map((category, idx) => ({
    id: `ps_default_${category.replace("-", "_")}`,
    name: STATUS_CATEGORY_LABEL[category],
    description: "",
    color: STATUS_CATEGORY_DEFAULT_COLOR[category],
    category,
    order: idx * 1000,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }))
}

function defaultSessions(): Session[] {
  const now = new Date().toISOString()
  return [
    {
      id: "sess_current",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      city: "San Francisco",
      countryCode: "US",
      isCurrent: true,
      lastSeenAt: now,
    },
    {
      id: "sess_mobile",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      city: "San Francisco",
      countryCode: "US",
      isCurrent: false,
      lastSeenAt: "2026-04-22T08:14:00Z",
    },
  ]
}

function defaultIntegrations(): Record<string, IntegrationState> {
  const blank = (provider: string): IntegrationState => ({
    provider,
    status: "disconnected",
    accountHandle: null,
    connectedAt: null,
  })
  return {
    slack: blank("slack"),
    github: blank("github"),
    gcal: blank("gcal"),
    notion: blank("notion"),
  }
}
