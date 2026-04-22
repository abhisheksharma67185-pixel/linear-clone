import { NextResponse } from "next/server"

const actionSpace = {
  version: "2.0",
  actions: [
    {
      name: "navigate",
      description: "Navigate to a page in the Linear workspace",
      params: {
        target:
          "string — e.g. /board, /backlog, /projects, /cycles, /labels, /teams, /views",
      },
      reward: 0.0,
      example: { action: "navigate", target: "/board" },
    },
    {
      name: "create_issue",
      description: "Create a new issue",
      params: {
        fields:
          "{ title, description?, status?, priority?, assigneeId?, teamId?, projectId?, cycleId?, labelIds?, estimate?, dueDate? }",
      },
      reward: 0.5,
      example: {
        action: "create_issue",
        fields: { title: "Fix login bug", priority: "high", teamId: "team-1" },
      },
    },
    {
      name: "update_issue",
      description: "Update an existing issue",
      params: {
        issueId: "string",
        fields:
          "{ title?, description?, status?, priority?, assigneeId?, teamId?, projectId?, cycleId?, labelIds?, estimate?, dueDate? }",
      },
      reward: 0.5,
      example: {
        action: "update_issue",
        issueId: "iss-1",
        fields: { status: "in_progress" },
      },
    },
    {
      name: "delete_issue",
      description: "Delete an issue",
      params: { issueId: "string" },
      reward: 0.3,
      example: { action: "delete_issue", issueId: "iss-10" },
    },
    {
      name: "transition_issue",
      description: "Transition an issue to a new status",
      params: { issueId: "string", status: "string" },
      reward: 0.5,
      example: { action: "transition_issue", issueId: "iss-1", status: "done" },
    },
    {
      name: "move_issue_to_cycle",
      description: "Move an issue to a cycle",
      params: { issueId: "string", cycleId: "string" },
      reward: 0.3,
      example: {
        action: "move_issue_to_cycle",
        issueId: "iss-1",
        cycleId: "cycle-2",
      },
    },
    {
      name: "create_project",
      description: "Create a new project",
      params: {
        fields:
          "{ name, description?, status?, leadId?, teamId?, targetDate? }",
      },
      reward: 0.5,
      example: {
        action: "create_project",
        fields: { name: "Q3 Roadmap", teamId: "team-1" },
      },
    },
    {
      name: "update_project",
      description: "Update an existing project",
      params: {
        projectId: "string",
        fields: "{ name?, description?, status?, leadId?, targetDate? }",
      },
      reward: 0.5,
      example: {
        action: "update_project",
        projectId: "proj-1",
        fields: { name: "Updated Project" },
      },
    },
    {
      name: "create_cycle",
      description: "Create a new cycle",
      params: {
        fields: "{ name, description?, teamId?, startDate?, endDate? }",
      },
      reward: 0.5,
      example: {
        action: "create_cycle",
        fields: { name: "Cycle 15", teamId: "team-1" },
      },
    },
    {
      name: "start_cycle",
      description: "Start a cycle",
      params: { cycleId: "string" },
      reward: 0.3,
      example: { action: "start_cycle", cycleId: "cycle-3" },
    },
    {
      name: "complete_cycle",
      description: "Complete a cycle",
      params: { cycleId: "string" },
      reward: 0.3,
      example: { action: "complete_cycle", cycleId: "cycle-2" },
    },
    {
      name: "create_label",
      description: "Create a new label",
      params: { fields: "{ name, color, teamId? }" },
      reward: 0.3,
      example: {
        action: "create_label",
        fields: { name: "urgent", color: "#dc2626" },
      },
    },
    {
      name: "update_label",
      description: "Update an existing label",
      params: {
        labelId: "string",
        fields: "{ name?, color? }",
      },
      reward: 0.3,
      example: {
        action: "update_label",
        labelId: "label-1",
        fields: { color: "#000000" },
      },
    },
    {
      name: "create_team",
      description: "Create a new team",
      params: {
        fields: "{ name, key, description?, leadId?, memberIds? }",
      },
      reward: 0.5,
      example: {
        action: "create_team",
        fields: { name: "Backend", key: "BE", leadId: "usr-1" },
      },
    },
    {
      name: "update_team",
      description: "Update an existing team",
      params: {
        teamId: "string",
        fields: "{ name?, description?, leadId?, memberIds? }",
      },
      reward: 0.5,
      example: {
        action: "update_team",
        teamId: "team-1",
        fields: { name: "Core Engineering" },
      },
    },
    {
      name: "create_view",
      description: "Create a custom view",
      params: {
        fields: "{ name, filterQuery, description?, ownerId?, teamId? }",
      },
      reward: 0.3,
      example: {
        action: "create_view",
        fields: {
          name: "My Open Bugs",
          filterQuery: "label = bug AND status != done",
        },
      },
    },
    {
      name: "search",
      description: "Search within the current page",
      params: { query: "string" },
      reward: 0.05,
      example: { action: "search", query: "login bug" },
    },
    {
      name: "respond",
      description: "Provide a text response for retrieval tasks",
      params: { message: "string" },
      reward: 0.0,
      example: {
        action: "respond",
        message: "There are 5 open issues assigned to Alex.",
      },
    },
  ],
  rewards: {
    stepPenalty: -0.01,
    invalidAction: -0.5,
    unknownAction: -0.1,
  },
  episodeEnd: "Task goal achieved or max steps reached",
}

export async function GET() {
  return NextResponse.json(actionSpace)
}
