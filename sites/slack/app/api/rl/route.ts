// AUTH: Intentionally omitted — this route is designed for local benchmark/sim use only.
import { NextRequest, NextResponse } from "next/server";
import * as store from "../../lib/store";
import "../../lib/init-sim";
import {
  getActiveEpisode,
  hasActiveEpisode,
  logAction,
  getStepReward,
} from "@thetabench/core";

// ---------------------------------------------------------------------------
// Per-episode RL session state
// ---------------------------------------------------------------------------

interface RLSessionState {
  currentPage: string;
  lastAction: string | null;
  stepCount: number;
}

let _rlState: RLSessionState = {
  currentPage: "/c/general",
  lastAction: null,
  stepCount: 0,
};

export function resetRLState(): void {
  _rlState = {
    currentPage: "/c/general",
    lastAction: null,
    stepCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

function getContextData(): Record<string, unknown> {
  const channelMatch = _rlState.currentPage.match(/^\/c\/(.+?)(?:\/|$)/);
  if (channelMatch) {
    const channel = store.getChannelByName(channelMatch[1]);
    if (channel) {
      return {
        channel,
        messages: store.getMessagesByChannel(channel.id).slice(-20),
        pinned: channel.pinnedMessageIds.map((id) =>
          store.getMessageById(id),
        ),
      };
    }
  }
  const dmMatch = _rlState.currentPage.match(/^\/dm\/(.+)$/);
  if (dmMatch) {
    const dm = store.getDmById(dmMatch[1]);
    if (dm) {
      return {
        dm,
        messages: store.getMessagesByDm(dm.id).slice(-20),
      };
    }
  }
  const userMatch = _rlState.currentPage.match(/^\/people\/(.+)$/);
  if (userMatch) {
    return { user: store.getUserById(userMatch[1]) ?? null };
  }
  return {};
}

function getAvailableActions(): string[] {
  const base = ["navigate", "search", "respond"];

  if (_rlState.currentPage.match(/^\/c\/.+/)) {
    return [
      ...base,
      "send_message",
      "edit_message",
      "delete_message",
      "reply_in_thread",
      "add_reaction",
      "remove_reaction",
      "save_message",
      "pin_message",
      "unpin_message",
      "invite_to_channel",
      "leave_channel",
      "update_channel",
      "archive_channel",
      "add_bookmark",
      "start_huddle",
      "create_canvas",
      "update_canvas",
      "create_list",
    ];
  }
  if (_rlState.currentPage.match(/^\/dm\/.+/)) {
    return [
      ...base,
      "send_message",
      "edit_message",
      "delete_message",
      "reply_in_thread",
      "add_reaction",
      "mark_dm_read",
      "start_huddle",
    ];
  }
  if (_rlState.currentPage === "/dms") {
    return [...base, "open_dm"];
  }
  if (_rlState.currentPage === "/activity" || _rlState.currentPage === "/mentions") {
    return [...base, "mark_notification_read", "mark_all_read"];
  }
  if (_rlState.currentPage === "/later" || _rlState.currentPage === "/saved") {
    return [...base, "unsave_message"];
  }
  if (_rlState.currentPage === "/people" || _rlState.currentPage.match(/^\/people\/.+/)) {
    return [...base, "open_dm"];
  }
  if (_rlState.currentPage === "/preferences") {
    return [...base, "set_preference", "update_status", "set_presence", "set_dnd"];
  }
  if (_rlState.currentPage === "/user-groups") {
    return [...base, "create_user_group", "update_user_group"];
  }

  return [...base, "send_message", "open_dm", "create_channel"];
}

function getObservation() {
  const users = store.getUsers();
  const channels = store.getChannels();
  const directMessages = store.getDirectMessages();
  const messages = store.getMessages();
  const notifications = store.getNotifications("usr-1");
  const savedItems = store.getSavedItems("usr-1");
  const readStates = store.getReadStates("usr-1");

  const episode = getActiveEpisode();

  return {
    currentPage: _rlState.currentPage,
    stepCount: _rlState.stepCount,
    lastAction: _rlState.lastAction,
    availableActions: getAvailableActions(),
    currentPageData: getContextData(),
    episode: episode
      ? {
          id: episode.id,
          taskId: episode.task.id,
          taskGoal: episode.task.goal,
          status: episode.status,
          stepsRemaining: episode.task.maxSteps - episode.stepCount,
        }
      : null,
    summary: {
      totalUsers: users.length,
      totalChannels: channels.length,
      publicChannels: channels.filter(
        (c: Record<string, unknown>) => c.type === "public",
      ).length,
      privateChannels: channels.filter(
        (c: Record<string, unknown>) => c.type === "private",
      ).length,
      archivedChannels: channels.filter(
        (c: Record<string, unknown>) => c.isArchived,
      ).length,
      totalDms: directMessages.length,
      totalMessages: messages.length,
      unreadNotifications: notifications.filter(
        (n: Record<string, unknown>) => !n.read,
      ).length,
      savedItems: savedItems.length,
      totalUnread: readStates.reduce(
        (sum: number, rs: Record<string, unknown>) =>
          sum + ((rs.unreadCount as number) ?? 0),
        0,
      ),
    },
    data: {
      channels: channels.map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        topic: c.topic,
        memberCount: (c.memberIds as string[]).length,
        isArchived: c.isArchived,
        unreadCount:
          readStates.find(
            (rs: Record<string, unknown>) => rs.channelId === c.id,
          )?.unreadCount ?? 0,
      })),
      directMessages: directMessages.map((d: Record<string, unknown>) => ({
        id: d.id,
        participantIds: d.participantIds,
        isGroup: d.isGroup,
      })),
      users: users.map((u: Record<string, unknown>) => ({
        id: u.id,
        displayName: u.displayName,
        name: u.name,
        presence: u.presence,
      })),
      notifications: notifications.slice(0, 10).map(
        (n: Record<string, unknown>) => ({
          id: n.id,
          type: n.type,
          messageId: n.messageId,
          read: n.read,
        }),
      ),
    },
  };
}

// ---------------------------------------------------------------------------
// Execute action and compute reward
// ---------------------------------------------------------------------------

function executeAction(action: Record<string, unknown>): {
  reward: number;
  success: boolean;
} {
  let reward = -0.01;
  let success = true;

  switch (action.action) {
    case "navigate": {
      if (
        typeof action.target === "string" &&
        action.target !== _rlState.currentPage
      ) {
        _rlState.currentPage = action.target;
        reward = 0.0;
      }
      break;
    }
    case "search":
      reward = 0.05;
      break;
    case "respond":
      reward = 0.0;
      break;
    case "send_message": {
      const result = store.createMessage({
        channelId: action.channelId as string | undefined,
        dmId: action.dmId as string | undefined,
        authorId: action.authorId as string | undefined,
        text: action.text as string,
        threadRootId: action.threadRootId as string | null | undefined,
        mentions: action.mentions as string[] | undefined,
      });
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "edit_message": {
      const result = store.updateMessage(action.messageId as string, {
        text: action.text as string,
      });
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "delete_message": {
      const result = store.deleteMessage(action.messageId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "reply_in_thread": {
      const result = store.createMessage({
        channelId: action.channelId as string | undefined,
        dmId: action.dmId as string | undefined,
        text: action.text as string,
        threadRootId: action.threadRootId as string,
      });
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "forward_message": {
      const result = store.forwardMessage(action.messageId as string, {
        channelId: action.channelId as string | undefined,
        dmId: action.dmId as string | undefined,
      });
      reward = result.success ? 0.4 : -0.5;
      success = result.success;
      break;
    }
    case "add_reaction": {
      const result = store.addReaction(
        action.messageId as string,
        action.emoji as string,
        action.userId as string | undefined,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "remove_reaction": {
      const result = store.removeReaction(
        action.messageId as string,
        action.emoji as string,
        action.userId as string | undefined,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "save_message": {
      const result = store.saveMessage(
        action.messageId as string,
        action.reminder as string | undefined,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "unsave_message": {
      const result = store.unsaveMessage(action.messageId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "pin_message": {
      const result = store.pinMessage(
        action.channelId as string,
        action.messageId as string,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "unpin_message": {
      const result = store.unpinMessage(
        action.channelId as string,
        action.messageId as string,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "create_channel": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createChannel(
          fields as Parameters<typeof store.createChannel>[0],
        );
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "update_channel": {
      const result = store.updateChannel(
        action.channelId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateChannel>[1],
      );
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "archive_channel": {
      const result = store.archiveChannel(action.channelId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "unarchive_channel": {
      const result = store.unarchiveChannel(action.channelId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "invite_to_channel": {
      const result = store.inviteToChannel(
        action.channelId as string,
        action.userIds as string[],
      );
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "remove_from_channel": {
      const result = store.removeFromChannel(
        action.channelId as string,
        action.userId as string,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "join_channel": {
      const result = store.joinChannel(
        action.channelId as string,
        action.userId as string | undefined,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "leave_channel": {
      const result = store.leaveChannel(
        action.channelId as string,
        action.userId as string | undefined,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "add_bookmark": {
      const result = store.addBookmark(
        action.channelId as string,
        action.fields as Parameters<typeof store.addBookmark>[1],
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "remove_bookmark": {
      const result = store.removeBookmark(
        action.channelId as string,
        action.bookmarkId as string,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "open_dm": {
      const result = store.openDirectMessage(
        action.participantIds as string[],
      );
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "mark_channel_read": {
      const result = store.markChannelRead(action.channelId as string);
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    case "mark_dm_read": {
      const result = store.markDmRead(action.dmId as string);
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    case "mark_all_read": {
      store.markAllRead();
      reward = 0.2;
      break;
    }
    case "update_status": {
      const result = store.updateUserStatus(
        (action.userId as string | undefined) ?? "usr-1",
        action.status as { emoji: string; text: string; expiresAt: string | null },
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "clear_status": {
      const result = store.clearUserStatus(
        (action.userId as string | undefined) ?? "usr-1",
      );
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    case "set_presence": {
      const result = store.setPresence(
        (action.userId as string | undefined) ?? "usr-1",
        action.presence as "active" | "away" | "offline" | "dnd",
      );
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    case "set_dnd": {
      const result = store.setDnd(
        (action.userId as string | undefined) ?? "usr-1",
        action.enabled as boolean,
      );
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    case "mark_notification_read": {
      const result = store.markNotificationRead(
        action.notificationId as string,
      );
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    case "create_user_group": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createUserGroup(
          fields as Parameters<typeof store.createUserGroup>[0],
        );
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "update_user_group": {
      const result = store.updateUserGroup(
        action.groupId as string,
        action.fields as Parameters<typeof store.updateUserGroup>[1],
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "create_canvas": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createCanvas(
          fields as Parameters<typeof store.createCanvas>[0],
        );
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "update_canvas": {
      const result = store.updateCanvas(
        action.canvasId as string,
        action.fields as Parameters<typeof store.updateCanvas>[1],
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "create_list": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createList(
          fields as Parameters<typeof store.createList>[0],
        );
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "add_list_item": {
      const result = store.addListItem(
        action.listId as string,
        action.values as Record<string, unknown>,
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "create_workflow": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createWorkflow(
          fields as Parameters<typeof store.createWorkflow>[0],
        );
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "start_huddle": {
      const result = store.startHuddle({
        channelId: action.channelId as string | null | undefined,
        dmId: action.dmId as string | null | undefined,
        topic: action.topic as string | undefined,
      });
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "end_huddle": {
      const result = store.endHuddle(action.huddleId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "schedule_message": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.scheduleMessage(
          fields as Parameters<typeof store.scheduleMessage>[0],
        );
        reward = result.success ? 0.4 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "set_preference": {
      const result = store.setPreference(
        action.key as string,
        action.value,
      );
      reward = result.success ? 0.2 : -0.5;
      success = result.success;
      break;
    }
    default:
      reward = -0.1;
      success = false;
  }

  return { reward, success };
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    observation: getObservation(),
    info: {
      description: "ThetaBench Slack RL Environment",
      version: "1.0",
      episodeActive: hasActiveEpisode(),
    },
  });
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const action = body as Record<string, unknown>;
  const actionName = action.action as string;

  _rlState.lastAction = actionName;

  const { reward: baseReward, success } = executeAction(action);

  _rlState.stepCount++;

  let finalReward = baseReward;
  const episode = getActiveEpisode();

  if (episode && episode.status === "active") {
    const stepReward = getStepReward(success);
    finalReward = success ? baseReward + stepReward : stepReward;
    logAction(actionName, action as Record<string, unknown>, finalReward, success);
  }

  const observation = getObservation();

  let done = false;
  if (episode) {
    done =
      episode.status === "timeout" ||
      episode.status === "completed" ||
      episode.status === "failed";
  }

  return NextResponse.json({
    observation,
    reward: finalReward,
    done,
    truncated: episode ? episode.status === "timeout" : false,
    info: {
      stepCount: _rlState.stepCount,
      lastAction: actionName,
      success,
      episodeActive: hasActiveEpisode(),
      episodeStepsRemaining: episode
        ? episode.task.maxSteps - episode.stepCount
        : null,
    },
  });
}
