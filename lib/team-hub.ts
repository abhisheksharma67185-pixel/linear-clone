// Shared configuration + helpers for the Team Settings Hub page.

export type TeamHubSection = {
  id:
    | "general"
    | "members"
    | "notifications"
    | "issue-labels"
    | "templates"
    | "recurring-issues"
    | "statuses"
    | "workflow"
    | "triage"
    | "cycles"
    | "agents"
    | "discussion-summaries"
  label: string
  subtitle: string
  // Matches the value keys on the sections summary payload.
  valueKey:
    | "members"
    | "slackOn"
    | "issueLabels"
    | "templates"
    | "recurringIssues"
    | "statuses"
    | null
}

export type TeamHubGroup = {
  title: string | null
  sections: TeamHubSection[]
}

// Section copy + sub-route wiring for the hub. Deliberately kept data-only so
// both rendering and tests can import the exact same source of truth.
export const TEAM_HUB_GROUPS: TeamHubGroup[] = [
  {
    title: null,
    sections: [
      {
        id: "general",
        label: "General",
        subtitle: "Name, identifier, timezone, estimates, and broader settings",
        valueKey: null,
      },
      {
        id: "members",
        label: "Members",
        subtitle: "Manage team members",
        valueKey: "members",
      },
      {
        id: "notifications",
        label: "Slack notifications",
        subtitle: "Broadcast notifications to Slack",
        valueKey: "slackOn",
      },
    ],
  },
  {
    title: "Issues, projects, and docs",
    sections: [
      {
        id: "issue-labels",
        label: "Issue labels",
        subtitle: "Labels available to this team's issues",
        valueKey: "issueLabels",
      },
      {
        id: "templates",
        label: "Templates",
        subtitle: "Pre-filled templates for issues, documents, and projects",
        valueKey: "templates",
      },
      {
        id: "recurring-issues",
        label: "Recurring issues",
        subtitle: "Automatically create issues on a schedule",
        valueKey: "recurringIssues",
      },
    ],
  },
  {
    title: "Workflow",
    sections: [
      {
        id: "statuses",
        label: "Issue statuses",
        subtitle: "Configure the states issues move through",
        valueKey: "statuses",
      },
      {
        id: "workflow",
        label: "Workflows & automations",
        subtitle: "Automate repetitive actions",
        valueKey: null,
      },
      {
        id: "triage",
        label: "Triage",
        subtitle: "Review and route incoming issues",
        valueKey: null,
      },
      {
        id: "cycles",
        label: "Cycles",
        subtitle: "Plan work in time-boxed sprints",
        valueKey: null,
      },
    ],
  },
  {
    title: "AI & Agents",
    sections: [
      {
        id: "agents",
        label: "Agents",
        subtitle: "Add guidance for how agents should operate within this team",
        valueKey: null,
      },
      {
        id: "discussion-summaries",
        label: "Discussion summaries",
        subtitle: "Automatically generate summaries for issues and comments",
        valueKey: null,
      },
    ],
  },
]

export type TeamHubSectionSummary = {
  members: number
  slackOn: boolean
  issueLabels: number
  templates: number
  recurringIssues: number
  statuses: number
}

export function sectionValueLabel(
  section: TeamHubSection,
  summary: TeamHubSectionSummary | null
): string | null {
  if (!summary || !section.valueKey) return null
  switch (section.valueKey) {
    case "members":
      return `${summary.members} member${summary.members === 1 ? "" : "s"}`
    case "slackOn":
      return summary.slackOn ? "On" : "Off"
    case "issueLabels":
      return summary.issueLabels === 0
        ? "None"
        : `${summary.issueLabels} label${summary.issueLabels === 1 ? "" : "s"}`
    case "templates":
      return summary.templates === 0 ? "None" : `${summary.templates}`
    case "recurringIssues":
      return summary.recurringIssues === 0
        ? "None"
        : `${summary.recurringIssues}`
    case "statuses":
      return `${summary.statuses} status${summary.statuses === 1 ? "" : "es"}`
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Danger zone
// ---------------------------------------------------------------------------

export type TeamDangerAction = "leave" | "retire" | "delete"

export const TEAM_DANGER_ACTIONS: {
  id: TeamDangerAction
  label: string
  subtitle: string
  button: string
  // The server-side action enum in /api/teams/[id] is `archive` for retire.
  apiAction: "leave" | "archive" | "delete"
}[] = [
  {
    id: "leave",
    label: "Leave team",
    subtitle: "Remove yourself from this team",
    button: "Leave team…",
    apiAction: "leave",
  },
  {
    id: "retire",
    label: "Retire team",
    subtitle:
      "Prevent creating and updating issues in this team while preserving all historical data",
    button: "Retire…",
    apiAction: "archive",
  },
  {
    id: "delete",
    label: "Delete team",
    subtitle:
      "Permanently delete this team and all its data, with a 30-day restoration window",
    button: "Delete…",
    apiAction: "delete",
  },
]

export function validateTeamNameMatch(
  input: string,
  expectedName: string
): boolean {
  return input.trim().toLowerCase() === expectedName.trim().toLowerCase()
}
