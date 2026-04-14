import { NextResponse } from "next/server";

const actionSpace = {
  version: "1.0",
  actions: [
    {
      name: "navigate",
      description: "Navigate to a page in the Slack workspace",
      params: {
        target:
          "string — e.g. /c/general, /dm/dm-1, /threads, /mentions, /later, /people, /preferences",
      },
      reward: 0.0,
      example: { action: "navigate", target: "/c/engineering" },
    },
    {
      name: "send_message",
      description: "Post a new message to a channel or DM",
      params: {
        channelId: "string — or dmId",
        dmId: "string — or channelId",
        text: "string",
        threadRootId: "string — optional, for thread reply",
        mentions: "string[] — optional list of user ids mentioned",
      },
      reward: 0.5,
      example: {
        action: "send_message",
        channelId: "ch-1",
        text: "Good morning team!",
      },
    },
    {
      name: "edit_message",
      description: "Edit an existing message",
      params: { messageId: "string", text: "string" },
      reward: 0.5,
      example: { action: "edit_message", messageId: "msg-200", text: "Updated text" },
    },
    {
      name: "delete_message",
      description: "Soft-delete a message",
      params: { messageId: "string" },
      reward: 0.3,
      example: { action: "delete_message", messageId: "msg-200" },
    },
    {
      name: "reply_in_thread",
      description: "Post a reply to a thread root",
      params: {
        channelId: "string — or dmId",
        dmId: "string — or channelId",
        threadRootId: "string",
        text: "string",
      },
      reward: 0.5,
      example: {
        action: "reply_in_thread",
        channelId: "ch-4",
        threadRootId: "msg-44",
        text: "Amazing work",
      },
    },
    {
      name: "add_reaction",
      description: "Add an emoji reaction to a message",
      params: { messageId: "string", emoji: "string — e.g. ':+1:'" },
      reward: 0.3,
      example: { action: "add_reaction", messageId: "msg-44", emoji: ":+1:" },
    },
    {
      name: "remove_reaction",
      description: "Remove an emoji reaction from a message",
      params: { messageId: "string", emoji: "string" },
      reward: 0.3,
      example: { action: "remove_reaction", messageId: "msg-44", emoji: ":+1:" },
    },
    {
      name: "save_message",
      description: "Add a message to Later/saved items",
      params: { messageId: "string", reminder: "string? — iso timestamp" },
      reward: 0.3,
      example: { action: "save_message", messageId: "msg-44" },
    },
    {
      name: "unsave_message",
      description: "Remove a message from saved items",
      params: { messageId: "string" },
      reward: 0.3,
      example: { action: "unsave_message", messageId: "msg-44" },
    },
    {
      name: "pin_message",
      description: "Pin a message to a channel",
      params: { channelId: "string", messageId: "string" },
      reward: 0.3,
      example: { action: "pin_message", channelId: "ch-1", messageId: "msg-3" },
    },
    {
      name: "unpin_message",
      description: "Unpin a message from a channel",
      params: { channelId: "string", messageId: "string" },
      reward: 0.3,
      example: { action: "unpin_message", channelId: "ch-1", messageId: "msg-3" },
    },
    {
      name: "create_channel",
      description: "Create a new channel",
      params: {
        fields:
          "{ name, topic?, purpose?, type?: public|private, memberIds?: string[] }",
      },
      reward: 0.5,
      example: {
        action: "create_channel",
        fields: { name: "q2-launch", topic: "Q2 product launch" },
      },
    },
    {
      name: "update_channel",
      description: "Update channel metadata",
      params: {
        channelId: "string",
        fields: "{ name?, topic?, purpose?, postingPermission? }",
      },
      reward: 0.5,
      example: {
        action: "update_channel",
        channelId: "ch-5",
        fields: { topic: "Design system and mockups" },
      },
    },
    {
      name: "archive_channel",
      description: "Archive a channel (blocks new messages)",
      params: { channelId: "string" },
      reward: 0.3,
      example: { action: "archive_channel", channelId: "ch-13" },
    },
    {
      name: "invite_to_channel",
      description: "Invite users to a channel",
      params: { channelId: "string", userIds: "string[]" },
      reward: 0.5,
      example: {
        action: "invite_to_channel",
        channelId: "ch-5",
        userIds: ["usr-7", "usr-10"],
      },
    },
    {
      name: "remove_from_channel",
      description: "Remove a user from a channel",
      params: { channelId: "string", userId: "string" },
      reward: 0.3,
      example: { action: "remove_from_channel", channelId: "ch-5", userId: "usr-10" },
    },
    {
      name: "join_channel",
      description: "Join a public channel",
      params: { channelId: "string", userId: "string?" },
      reward: 0.3,
      example: { action: "join_channel", channelId: "ch-2" },
    },
    {
      name: "leave_channel",
      description: "Leave a channel",
      params: { channelId: "string", userId: "string?" },
      reward: 0.3,
      example: { action: "leave_channel", channelId: "ch-2" },
    },
    {
      name: "add_bookmark",
      description: "Add a bookmark to a channel's bookmark bar",
      params: { channelId: "string", fields: "{ title, url, emoji? }" },
      reward: 0.3,
      example: {
        action: "add_bookmark",
        channelId: "ch-4",
        fields: { title: "Runbook", url: "https://runbook.dev" },
      },
    },
    {
      name: "open_dm",
      description: "Open a direct message conversation with one or more users",
      params: { participantIds: "string[]" },
      reward: 0.5,
      example: { action: "open_dm", participantIds: ["usr-1", "usr-4"] },
    },
    {
      name: "mark_channel_read",
      description: "Mark a channel as read for the current user",
      params: { channelId: "string" },
      reward: 0.2,
      example: { action: "mark_channel_read", channelId: "ch-4" },
    },
    {
      name: "mark_dm_read",
      description: "Mark a DM as read for the current user",
      params: { dmId: "string" },
      reward: 0.2,
      example: { action: "mark_dm_read", dmId: "dm-2" },
    },
    {
      name: "mark_all_read",
      description: "Mark every channel and DM read",
      params: {},
      reward: 0.2,
      example: { action: "mark_all_read" },
    },
    {
      name: "update_status",
      description: "Update the current user's status",
      params: {
        userId: "string? — default usr-1",
        status: "{ emoji, text, expiresAt }",
      },
      reward: 0.3,
      example: {
        action: "update_status",
        status: { emoji: ":palm_tree:", text: "On vacation", expiresAt: null },
      },
    },
    {
      name: "clear_status",
      description: "Clear the current user's status",
      params: { userId: "string? — default usr-1" },
      reward: 0.2,
      example: { action: "clear_status" },
    },
    {
      name: "set_presence",
      description: "Set presence for the current user",
      params: {
        userId: "string? — default usr-1",
        presence: "active|away|offline|dnd",
      },
      reward: 0.2,
      example: { action: "set_presence", presence: "away" },
    },
    {
      name: "set_dnd",
      description: "Enable/disable Do Not Disturb for the current user",
      params: {
        userId: "string? — default usr-1",
        enabled: "boolean",
        until: "string? — iso timestamp",
      },
      reward: 0.2,
      example: { action: "set_dnd", enabled: true },
    },
    {
      name: "mark_notification_read",
      description: "Mark a single notification as read",
      params: { notificationId: "string" },
      reward: 0.2,
      example: { action: "mark_notification_read", notificationId: "notif-1" },
    },
    {
      name: "create_user_group",
      description: "Create a new @usergroup",
      params: {
        fields: "{ handle, name, description?, memberIds: string[] }",
      },
      reward: 0.5,
      example: {
        action: "create_user_group",
        fields: { handle: "qa-team", name: "QA team", memberIds: ["usr-15"] },
      },
    },
    {
      name: "create_canvas",
      description: "Create a canvas attached to a channel",
      params: { fields: "{ channelId?, title, content? }" },
      reward: 0.5,
      example: {
        action: "create_canvas",
        fields: { channelId: "ch-4", title: "Runbook" },
      },
    },
    {
      name: "update_canvas",
      description: "Update an existing canvas",
      params: { canvasId: "string", fields: "{ title?, content? }" },
      reward: 0.3,
      example: {
        action: "update_canvas",
        canvasId: "canvas-2",
        fields: { content: "# Runbook\n..." },
      },
    },
    {
      name: "create_list",
      description: "Create a Slack list attached to a channel",
      params: {
        fields:
          "{ channelId?, name, fields: { id, name, type }[] }",
      },
      reward: 0.5,
      example: {
        action: "create_list",
        fields: {
          channelId: "ch-4",
          name: "Bugs",
          fields: [
            { id: "f-t", name: "Title", type: "text" },
            { id: "f-s", name: "Status", type: "status" },
          ],
        },
      },
    },
    {
      name: "add_list_item",
      description: "Add an item to a Slack list",
      params: {
        listId: "string",
        values: "Record<string, unknown>",
      },
      reward: 0.3,
      example: {
        action: "add_list_item",
        listId: "list-1",
        values: { "f-t": "Fix bug", "f-s": "todo" },
      },
    },
    {
      name: "start_huddle",
      description: "Start a huddle in a channel or DM",
      params: {
        channelId: "string? — or dmId",
        dmId: "string? — or channelId",
        topic: "string?",
      },
      reward: 0.5,
      example: { action: "start_huddle", channelId: "ch-4", topic: "Debug" },
    },
    {
      name: "end_huddle",
      description: "End an active huddle",
      params: { huddleId: "string" },
      reward: 0.3,
      example: { action: "end_huddle", huddleId: "hud-2" },
    },
    {
      name: "schedule_message",
      description: "Schedule a message for later delivery",
      params: {
        fields:
          "{ channelId?|dmId?, text, scheduledFor: string }",
      },
      reward: 0.4,
      example: {
        action: "schedule_message",
        fields: {
          channelId: "ch-1",
          text: "Happy Friday!",
          scheduledFor: "2026-04-17T09:00:00.000Z",
        },
      },
    },
    {
      name: "set_preference",
      description: "Set a preference value for the current user",
      params: { key: "string", value: "unknown" },
      reward: 0.2,
      example: { action: "set_preference", key: "theme", value: "dark" },
    },
    {
      name: "search",
      description: "Search the workspace",
      params: { query: "string" },
      reward: 0.05,
      example: { action: "search", query: "OAuth PKCE" },
    },
    {
      name: "respond",
      description: "Provide a text response for retrieval tasks",
      params: { message: "string" },
      reward: 0.0,
      example: {
        action: "respond",
        message: "The #general channel has 16 members.",
      },
    },
  ],
  rewards: {
    stepPenalty: -0.01,
    invalidAction: -0.5,
    unknownAction: -0.1,
  },
  episodeEnd: "Task goal achieved or max steps reached",
};

export async function GET() {
  return NextResponse.json(actionSpace);
}
