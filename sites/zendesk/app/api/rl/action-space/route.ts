import { NextResponse } from "next/server"

const actionSpace = {
  version: "1.0",
  actions: [
    {
      name: "navigate",
      description: "Navigate to a page in the Zendesk Support workspace",
      params: {
        target:
          "string — e.g. /home, /tickets/tic-2, /views/view-tickets, /macros, /groups, /customers",
      },
      reward: 0.0,
      example: { action: "navigate", target: "/tickets/tic-2" },
    },
    {
      name: "create_ticket",
      description: "Create a new support ticket",
      params: {
        fields:
          "{ subject, description?, status?, priority?, channel?, requesterId?, assigneeId?, groupId?, brandId?, tags? }",
      },
      reward: 0.5,
      example: {
        action: "create_ticket",
        fields: {
          subject: "Cannot reset password",
          priority: "high",
          channel: "email",
        },
      },
    },
    {
      name: "update_ticket",
      description: "Update fields on an existing ticket",
      params: {
        ticketId: "string",
        fields:
          "{ subject?, description?, status?, priority?, channel?, assigneeId?, groupId?, tags? }",
      },
      reward: 0.5,
      example: {
        action: "update_ticket",
        ticketId: "tic-3",
        fields: { priority: "high" },
      },
    },
    {
      name: "delete_ticket",
      description: "Delete a ticket",
      params: { ticketId: "string" },
      reward: 0.3,
      example: { action: "delete_ticket", ticketId: "tic-30" },
    },
    {
      name: "transition_ticket",
      description: "Transition a ticket to a new status",
      params: {
        ticketId: "string",
        status: "'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'",
      },
      reward: 0.5,
      example: {
        action: "transition_ticket",
        ticketId: "tic-5",
        status: "pending",
      },
    },
    {
      name: "assign_ticket",
      description: "Assign a ticket to an agent (and optionally a group)",
      params: {
        ticketId: "string",
        assigneeId: "string | null",
        groupId: "string | null (optional)",
      },
      reward: 0.5,
      example: {
        action: "assign_ticket",
        ticketId: "tic-19",
        assigneeId: "usr-3",
        groupId: "grp-2",
      },
    },
    {
      name: "merge_tickets",
      description: "Merge a source ticket into a target (closes source)",
      params: { sourceId: "string", targetId: "string" },
      reward: 0.5,
      example: {
        action: "merge_tickets",
        sourceId: "tic-29",
        targetId: "tic-10",
      },
    },
    {
      name: "add_tag",
      description: "Add a tag to a ticket",
      params: { ticketId: "string", tag: "string" },
      reward: 0.3,
      example: {
        action: "add_tag",
        ticketId: "tic-17",
        tag: "escalated",
      },
    },
    {
      name: "remove_tag",
      description: "Remove a tag from a ticket",
      params: { ticketId: "string", tag: "string" },
      reward: 0.3,
      example: { action: "remove_tag", ticketId: "tic-5", tag: "crash" },
    },
    {
      name: "add_comment",
      description: "Add a public or internal comment to a ticket",
      params: {
        ticketId: "string",
        authorId: "string",
        body: "string",
        public: "boolean (default true)",
      },
      reward: 0.5,
      example: {
        action: "add_comment",
        ticketId: "tic-2",
        authorId: "usr-1",
        body: "Welcome — happy to help.",
        public: true,
      },
    },
    {
      name: "create_macro",
      description: "Create a saved-reply macro",
      params: { fields: "{ title, body, active? }" },
      reward: 0.5,
      example: {
        action: "create_macro",
        fields: {
          title: "Awaiting customer info",
          body: "We've followed up...",
        },
      },
    },
    {
      name: "update_macro",
      description: "Update an existing macro",
      params: {
        macroId: "string",
        fields: "{ title?, body?, active? }",
      },
      reward: 0.5,
      example: {
        action: "update_macro",
        macroId: "mac-5",
        fields: { active: true },
      },
    },
    {
      name: "create_group",
      description: "Create a new agent group",
      params: { fields: "{ name, description? }" },
      reward: 0.5,
      example: {
        action: "create_group",
        fields: { name: "Enterprise Support" },
      },
    },
    {
      name: "create_user",
      description: "Create a new contact (end-user) record",
      params: { fields: "{ name, email, role?, organization? }" },
      reward: 0.5,
      example: {
        action: "create_user",
        fields: { name: "Avery Kim", email: "avery.kim@example.com" },
      },
    },
    {
      name: "search",
      description: "Search within the current page",
      params: { query: "string" },
      reward: 0.05,
      example: { action: "search", query: "webhook" },
    },
    {
      name: "respond",
      description: "Provide a text response for retrieval tasks",
      params: { message: "string" },
      reward: 0.0,
      example: {
        action: "respond",
        message: "There are 3 urgent tickets in the queue.",
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
