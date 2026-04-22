import { NextResponse } from "next/server"

const actionSpace = {
  version: "2.0",
  actions: [
    {
      name: "navigate",
      description: "Navigate to a page in the Jira workspace",
      params: {
        target:
          "string — e.g. /board, /backlog, /projects, /sprints, /epics, /filters",
      },
      reward: 0.0,
      example: { action: "navigate", target: "/board" },
    },
    {
      name: "create_issue",
      description: "Create a new issue",
      params: {
        fields:
          "{ summary, description?, issueType?, status?, priority?, assigneeId?, labels?, projectKey?, sprintId?, epicId?, storyPoints? }",
      },
      reward: 0.5,
      example: {
        action: "create_issue",
        fields: {
          summary: "Fix login bug",
          issueType: "bug",
          priority: "high",
        },
      },
    },
    {
      name: "update_issue",
      description: "Update an existing issue",
      params: {
        issueId: "string",
        fields:
          "{ summary?, description?, issueType?, status?, priority?, assigneeId?, labels?, projectKey?, sprintId?, epicId?, storyPoints? }",
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
      name: "create_project",
      description: "Create a new project",
      params: {
        fields: "{ name, key, description?, projectType?, leadId? }",
      },
      reward: 0.5,
      example: {
        action: "create_project",
        fields: { name: "Q3 Roadmap", key: "Q3R", projectType: "scrum" },
      },
    },
    {
      name: "update_project",
      description: "Update an existing project",
      params: {
        projectId: "string",
        fields: "{ name?, key?, description?, projectType?, leadId? }",
      },
      reward: 0.5,
      example: {
        action: "update_project",
        projectId: "proj-1",
        fields: { name: "Updated Project" },
      },
    },
    {
      name: "create_sprint",
      description: "Create a new sprint",
      params: {
        fields: "{ name, boardId, goal?, startDate?, endDate? }",
      },
      reward: 0.5,
      example: {
        action: "create_sprint",
        fields: { name: "Sprint 5", boardId: "board-1" },
      },
    },
    {
      name: "start_sprint",
      description: "Start a sprint",
      params: { sprintId: "string" },
      reward: 0.3,
      example: { action: "start_sprint", sprintId: "sprint-1" },
    },
    {
      name: "complete_sprint",
      description: "Complete a sprint",
      params: { sprintId: "string" },
      reward: 0.3,
      example: { action: "complete_sprint", sprintId: "sprint-1" },
    },
    {
      name: "move_issue_to_sprint",
      description: "Move an issue to a sprint",
      params: { sprintId: "string", issueId: "string" },
      reward: 0.3,
      example: {
        action: "move_issue_to_sprint",
        sprintId: "sprint-1",
        issueId: "iss-1",
      },
    },
    {
      name: "create_epic",
      description: "Create a new epic",
      params: { fields: "{ name, summary?, projectKey? }" },
      reward: 0.5,
      example: {
        action: "create_epic",
        fields: { name: "User Authentication", projectKey: "PROJ" },
      },
    },
    {
      name: "update_epic",
      description: "Update an existing epic",
      params: {
        epicId: "string",
        fields: "{ name?, summary?, status? }",
      },
      reward: 0.5,
      example: {
        action: "update_epic",
        epicId: "epic-1",
        fields: { status: "done" },
      },
    },
    {
      name: "create_filter",
      description: "Create a saved filter",
      params: { fields: "{ name, jql?, description? }" },
      reward: 0.3,
      example: {
        action: "create_filter",
        fields: { name: "My Open Bugs", jql: "type = Bug AND status != Done" },
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
        message: "There are 5 open issues assigned to Alice.",
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
