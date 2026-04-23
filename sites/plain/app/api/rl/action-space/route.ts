import { NextResponse } from "next/server"

const actionSpace = {
  version: "1.0",
  actions: [
    {
      name: "navigate",
      description: "Navigate to a page in the Plain workspace",
      params: {
        target:
          "string — e.g. /inbox, /snoozed, /done, /threads/<id>, /customers, /customers/<id>",
      },
      reward: 0.0,
      example: { action: "navigate", target: "/inbox" },
    },
    {
      name: "create_thread",
      description: "Open a new support thread on behalf of a customer",
      params: {
        fields:
          "{ title, customerId, body?, priority?, labelIds?, assigneeId? }",
      },
      reward: 0.5,
      example: {
        action: "create_thread",
        fields: {
          title: "Cannot reset password",
          customerId: "cus-7",
          body: "Reset link 404s.",
          priority: "high",
        },
      },
    },
    {
      name: "reply_thread",
      description: "Send a reply on a thread (defaults to agent role)",
      params: {
        threadId: "string",
        fields: "{ body, role?: 'agent'|'customer', authorId? }",
      },
      reward: 0.5,
      example: {
        action: "reply_thread",
        threadId: "thr-2",
        fields: { body: "Bumped your trial limit to 100/min." },
      },
    },
    {
      name: "snooze_thread",
      description: "Snooze a thread until a future ISO timestamp",
      params: { threadId: "string", until: "ISO-8601 string" },
      reward: 0.3,
      example: {
        action: "snooze_thread",
        threadId: "thr-3",
        until: "2026-04-30T09:00:00.000Z",
      },
    },
    {
      name: "done_thread",
      description: "Mark a thread as done (resolved)",
      params: { threadId: "string" },
      reward: 0.5,
      example: { action: "done_thread", threadId: "thr-2" },
    },
    {
      name: "reopen_thread",
      description: "Reopen a snoozed or done thread",
      params: { threadId: "string" },
      reward: 0.3,
      example: { action: "reopen_thread", threadId: "thr-9" },
    },
    {
      name: "assign_thread",
      description: "Assign a thread to a workspace agent (or null to unassign)",
      params: { threadId: "string", assigneeId: "string | null" },
      reward: 0.3,
      example: {
        action: "assign_thread",
        threadId: "thr-15",
        assigneeId: "agt-3",
      },
    },
    {
      name: "add_label",
      description: "Add a label to a thread",
      params: { threadId: "string", labelId: "string" },
      reward: 0.3,
      example: {
        action: "add_label",
        threadId: "thr-20",
        labelId: "lbl-2",
      },
    },
    {
      name: "remove_label",
      description: "Remove a label from a thread",
      params: { threadId: "string", labelId: "string" },
      reward: 0.3,
      example: {
        action: "remove_label",
        threadId: "thr-1",
        labelId: "lbl-5",
      },
    },
    {
      name: "set_priority",
      description: "Change a thread's priority",
      params: {
        threadId: "string",
        priority: "'urgent' | 'high' | 'normal' | 'low'",
      },
      reward: 0.3,
      example: {
        action: "set_priority",
        threadId: "thr-6",
        priority: "urgent",
      },
    },
    {
      name: "update_customer",
      description: "Update a customer's profile",
      params: {
        customerId: "string",
        fields:
          "{ fullName?, email?, role?, plan?, lifecycleStage?, customAttributes? }",
      },
      reward: 0.5,
      example: {
        action: "update_customer",
        customerId: "cus-13",
        fields: { lifecycleStage: "active" },
      },
    },
    {
      name: "merge_customers",
      description: "Merge two customer records (duplicate into primary)",
      params: { primaryId: "string", duplicateId: "string" },
      reward: 0.5,
      example: {
        action: "merge_customers",
        primaryId: "cus-11",
        duplicateId: "cus-20",
      },
    },
    {
      name: "add_internal_note",
      description: "Add an internal note (system-style) to a thread",
      params: { threadId: "string", fields: "{ body, authorId? }" },
      reward: 0.3,
      example: {
        action: "add_internal_note",
        threadId: "thr-11",
        fields: { body: "Coordinating with platform team." },
      },
    },
    {
      name: "search",
      description: "Search the workspace",
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
        message: "There are 18 open threads in the workspace.",
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
