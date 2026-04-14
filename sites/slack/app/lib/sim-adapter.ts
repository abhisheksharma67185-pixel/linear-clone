/**
 * Slack site adapter — wires @simbench/core engine to the Slack store.
 * This file is the bridge between the generic engine and Slack-specific data.
 *
 * Import this once at app startup (via `init-sim.ts`) to register the
 * adapter + tasks + predicates.
 */

import {
  registerSiteAdapter,
  registerTasks,
  registerPredicate,
  getNestedField,
  type SiteAdapter,
  type GenericSnapshot,
  type EvalCheck,
} from "@simbench/core";

import * as store from "./store";

// Site-specific task definitions
import { navigationTasks } from "./tasks/navigation";
import { messageTasks } from "./tasks/messages";
import { channelTasks } from "./tasks/channels";
import { dmTasks } from "./tasks/dms";
import { reactionTasks } from "./tasks/reactions";
import { searchTasks } from "./tasks/search";
import { retrievalTasks } from "./tasks/retrieval";
import { multiDomainTasks } from "./tasks/multi-domain";
import { impossibleTasks } from "./tasks/impossible";

// ---------------------------------------------------------------------------
// 1. Register site adapter
// ---------------------------------------------------------------------------

const slackAdapter: SiteAdapter = {
  getState: () => ({
    workspace: store.getWorkspace(),
    preferences: store.getPreferences(),
    users: store.getUsers(),
    channels: store.getChannels(),
    directMessages: store.getDirectMessages(),
    messages: store.getMessages(),
    notifications: store.getNotifications(),
    readStates: store.getReadStates(),
    userGroups: store.getUserGroups(),
    savedItems: store.getSavedItems(),
    bookmarks: store.getBookmarks(),
    canvases: store.getCanvases(),
    lists: store.getLists(),
    workflows: store.getWorkflows(),
    huddles: store.getHuddles(),
  }),

  reset: (seed?: number) => store.reset(seed),

  executeMutation: (name: string, args: unknown[]) => {
    const MUTATION_ALLOWLIST = new Set([
      "createChannel",
      "updateChannel",
      "archiveChannel",
      "unarchiveChannel",
      "inviteToChannel",
      "removeFromChannel",
      "joinChannel",
      "leaveChannel",
      "pinMessage",
      "unpinMessage",
      "addBookmark",
      "removeBookmark",
      "setChannelCanvas",
      "openDirectMessage",
      "closeDirectMessage",
      "createMessage",
      "updateMessage",
      "deleteMessage",
      "forwardMessage",
      "scheduleMessage",
      "cancelScheduledMessage",
      "addReaction",
      "removeReaction",
      "saveMessage",
      "unsaveMessage",
      "markChannelRead",
      "markDmRead",
      "markAllRead",
      "markUnread",
      "updateUserStatus",
      "clearUserStatus",
      "setPresence",
      "setDnd",
      "markNotificationRead",
      "markAllNotificationsRead",
      "createUserGroup",
      "updateUserGroup",
      "disableUserGroup",
      "createCanvas",
      "updateCanvas",
      "deleteCanvas",
      "createList",
      "addListItem",
      "updateListItem",
      "deleteListItem",
      "deleteList",
      "createWorkflow",
      "enableWorkflow",
      "disableWorkflow",
      "startHuddle",
      "endHuddle",
      "joinHuddle",
      "setPreference",
    ]);
    if (!MUTATION_ALLOWLIST.has(name)) {
      return { success: false, error: `Unknown mutation: ${name}` };
    }
    const fn = (store as unknown as Record<string, (...a: unknown[]) => unknown>)[name];
    if (fn) return fn(...args) as { success: boolean; error?: string; data?: unknown };
    return { success: false, error: `Mutation not found: ${name}` };
  },

  collections: [
    "users",
    "channels",
    "directMessages",
    "messages",
    "notifications",
    "readStates",
    "userGroups",
    "savedItems",
    "bookmarks",
    "canvases",
    "lists",
    "workflows",
    "huddles",
  ],
  singletons: ["workspace", "preferences"],
};

registerSiteAdapter(slackAdapter);

// ---------------------------------------------------------------------------
// 2. Register all tasks
// ---------------------------------------------------------------------------

registerTasks([
  ...navigationTasks,
  ...messageTasks,
  ...channelTasks,
  ...dmTasks,
  ...reactionTasks,
  ...searchTasks,
  ...retrievalTasks,
  ...multiDomainTasks,
  ...impossibleTasks,
]);

// ---------------------------------------------------------------------------
// 3. Register Slack-specific predicates
// ---------------------------------------------------------------------------

type Msg = {
  id: string;
  channelId: string | null;
  dmId: string | null;
  threadRootId: string | null;
  authorId: string;
  text: string;
  reactions: { emoji: string; userIds: string[] }[];
  mentions: string[];
  isDeleted: boolean;
  pinnedBy: string | null;
};

type Ch = {
  id: string;
  name: string;
  topic: string;
  purpose: string;
  type: "public" | "private";
  isArchived: boolean;
  memberIds: string[];
  pinnedMessageIds: string[];
  bookmarkIds: string[];
  huddleActive: boolean;
};

const normalizeEmoji = (emoji: string) =>
  emoji.startsWith(":") ? emoji : `:${emoji}:`;

const resolveChannel = (
  snapshot: GenericSnapshot,
  key: { channelId?: string; channelName?: string; id?: string; name?: string },
): Ch | undefined => {
  const channels = snapshot.channels as Ch[];
  const id = key.channelId ?? key.id;
  const name = key.channelName ?? key.name;
  if (id) {
    const byId = channels?.find((c) => c.id === id);
    if (byId) return byId;
  }
  if (name) {
    const normalized = name.startsWith("#") ? name.slice(1) : name;
    return channels?.find((c) => c.name === normalized);
  }
  return undefined;
};

registerPredicate(
  "message_in_channel",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as Record<string, unknown> | undefined;
    if (!expected) return false;
    const channel = resolveChannel(snapshot, expected as never);
    if (!channel) return false;
    const messages = snapshot.messages as Msg[];
    return messages.some((m) => {
      if (m.channelId !== channel.id) return false;
      if (m.isDeleted) return false;
      if (expected.text !== undefined && m.text !== expected.text) return false;
      if (expected.authorId !== undefined && m.authorId !== expected.authorId)
        return false;
      return true;
    });
  },
);

registerPredicate(
  "message_has_text",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const messages = snapshot.messages as Msg[];
    const msg = messages.find((m) => m.id === check.id);
    return msg?.text === String(check.expected ?? "");
  },
);

registerPredicate(
  "message_has_reaction",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as
      | { emoji: string; userId?: string }
      | undefined;
    if (!expected) return false;
    const messages = snapshot.messages as Msg[];
    const msg = messages.find((m) => m.id === check.id);
    if (!msg) return false;
    const target = normalizeEmoji(expected.emoji);
    const reaction = msg.reactions.find((r) => r.emoji === target);
    if (!reaction) return false;
    const userId = expected.userId ?? "usr-1";
    return reaction.userIds.includes(userId);
  },
);

registerPredicate(
  "message_reaction_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as
      | { emoji: string; count: number }
      | undefined;
    if (!expected) return false;
    const messages = snapshot.messages as Msg[];
    const msg = messages.find((m) => m.id === check.id);
    if (!msg) return false;
    const target = normalizeEmoji(expected.emoji);
    const reaction = msg.reactions.find((r) => r.emoji === target);
    return (reaction?.userIds.length ?? 0) === Number(expected.count);
  },
);

registerPredicate(
  "message_is_deleted",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const messages = snapshot.messages as Msg[];
    const msg = messages.find((m) => m.id === check.id);
    return msg?.isDeleted === true;
  },
);

registerPredicate(
  "message_is_pinned",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channels = snapshot.channels as Ch[];
    const messageId = String(check.expected ?? check.id ?? "");
    return channels.some((c) => c.pinnedMessageIds.includes(messageId));
  },
);

registerPredicate(
  "message_is_saved",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const saved = snapshot.savedItems as { userId: string; messageId: string }[];
    const userId = (check.expected as { userId?: string } | undefined)?.userId ?? "usr-1";
    const messageId = check.id ?? (check.expected as { messageId?: string } | undefined)?.messageId;
    return saved.some((s) => s.userId === userId && s.messageId === messageId);
  },
);

registerPredicate(
  "message_has_mention",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const messages = snapshot.messages as Msg[];
    const msg = messages.find((m) => m.id === check.id);
    if (!msg) return false;
    return msg.mentions.includes(String(check.expected ?? ""));
  },
);

registerPredicate(
  "thread_reply_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const messages = snapshot.messages as Msg[];
    const rootId = check.id ?? (check.expected as { id?: string } | undefined)?.id;
    const expectedCount = (check.expected as { count?: number } | undefined)?.count ?? check.expected;
    const count = messages.filter((m) => m.threadRootId === rootId).length;
    return count === Number(expectedCount);
  },
);

registerPredicate(
  "channel_exists",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as Record<string, unknown> | undefined;
    if (!expected) return false;
    const channel = resolveChannel(snapshot, expected as never);
    if (!channel) return false;
    return Object.entries(expected).every(([key, val]) => {
      if (key === "channelId" || key === "channelName") return true;
      const actual = getNestedField(channel as Record<string, unknown>, key);
      return JSON.stringify(actual) === JSON.stringify(val);
    });
  },
);

registerPredicate(
  "channel_has_member",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    if (!channel) return false;
    const expected = check.expected as { userId?: string } | string | undefined;
    const userId =
      typeof expected === "string" ? expected : expected?.userId;
    if (!userId) return false;
    return channel.memberIds.includes(userId);
  },
);

registerPredicate(
  "channel_member_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    if (!channel) return false;
    return channel.memberIds.length === Number(check.expected);
  },
);

registerPredicate(
  "channel_is_archived",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    return channel?.isArchived === Boolean(check.expected);
  },
);

registerPredicate(
  "channel_has_topic",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    return channel?.topic === String(check.expected ?? "");
  },
);

registerPredicate(
  "channel_has_purpose",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    return channel?.purpose === String(check.expected ?? "");
  },
);

registerPredicate(
  "channel_has_pin_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    return channel?.pinnedMessageIds.length === Number(check.expected);
  },
);

registerPredicate(
  "channel_has_bookmark",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const channel = resolveChannel(snapshot, {
      id: check.id,
      channelId: check.id,
      channelName: check.id,
    });
    if (!channel) return false;
    const bookmarks = snapshot.bookmarks as { id: string; channelId: string; title: string; url: string }[];
    const expected = check.expected as { title?: string; url?: string };
    return bookmarks.some(
      (b) =>
        b.channelId === channel.id &&
        (expected.title === undefined || b.title === expected.title) &&
        (expected.url === undefined || b.url === expected.url),
    );
  },
);

registerPredicate(
  "dm_exists_with_participants",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const dms = snapshot.directMessages as { id: string; participantIds: string[] }[];
    const expected = check.expected as string[] | undefined;
    if (!expected || !Array.isArray(expected)) return false;
    const sortedExpected = [...expected].sort();
    return dms.some((d) => {
      const sorted = [...d.participantIds].sort();
      return (
        sorted.length === sortedExpected.length &&
        sorted.every((p, i) => p === sortedExpected[i])
      );
    });
  },
);

registerPredicate(
  "user_has_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const users = snapshot.users as {
      id: string;
      status: { emoji: string; text: string };
    }[];
    const user = users.find((u) => u.id === check.id);
    if (!user) return false;
    const expected = check.expected as { emoji?: string; text?: string };
    if (expected.emoji !== undefined && user.status.emoji !== expected.emoji)
      return false;
    if (expected.text !== undefined && user.status.text !== expected.text)
      return false;
    return true;
  },
);

registerPredicate(
  "user_has_presence",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const users = snapshot.users as { id: string; presence: string }[];
    const user = users.find((u) => u.id === check.id);
    return user?.presence === check.expected;
  },
);

registerPredicate(
  "user_dnd_enabled",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const users = snapshot.users as { id: string; presence: string }[];
    const user = users.find((u) => u.id === check.id);
    return user?.presence === "dnd" === Boolean(check.expected);
  },
);

registerPredicate(
  "read_state_unread_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const states = snapshot.readStates as {
      channelId: string | null;
      dmId: string | null;
      userId: string;
      unreadCount: number;
    }[];
    const expected = check.expected as { count?: number } | number;
    const targetCount =
      typeof expected === "number" ? expected : expected?.count ?? 0;
    const userId = (check.expected as { userId?: string })?.userId ?? "usr-1";
    const rs = states.find(
      (s) =>
        s.userId === userId &&
        (s.channelId === check.id || s.dmId === check.id),
    );
    return rs?.unreadCount === Number(targetCount);
  },
);

registerPredicate(
  "user_group_exists",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const groups = snapshot.userGroups as {
      handle: string;
      memberIds: string[];
    }[];
    const expected = check.expected as {
      handle: string;
      memberIds?: string[];
    };
    const group = groups.find((g) => g.handle === expected.handle);
    if (!group) return false;
    if (expected.memberIds) {
      const a = [...group.memberIds].sort();
      const b = [...expected.memberIds].sort();
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    return true;
  },
);

registerPredicate(
  "notification_count_unread",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const notifs = snapshot.notifications as {
      userId: string;
      read: boolean;
    }[];
    const userId = (check.expected as { userId?: string })?.userId ?? "usr-1";
    const count = notifs.filter(
      (n) => n.userId === userId && !n.read,
    ).length;
    const expected = check.expected as { count?: number } | number;
    const target =
      typeof expected === "number" ? expected : expected?.count ?? 0;
    return count === Number(target);
  },
);

registerPredicate(
  "canvas_exists",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const canvases = snapshot.canvases as {
      title: string;
      channelId: string | null;
    }[];
    const expected = check.expected as {
      title?: string;
      channelId?: string;
    };
    return canvases.some(
      (c) =>
        (expected.title === undefined || c.title === expected.title) &&
        (expected.channelId === undefined || c.channelId === expected.channelId),
    );
  },
);

registerPredicate(
  "list_has_item_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const lists = snapshot.lists as { id: string; items: unknown[] }[];
    const list = lists.find((l) => l.id === check.id);
    return list?.items.length === Number(check.expected);
  },
);

registerPredicate(
  "huddle_is_active",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const huddles = snapshot.huddles as {
      channelId: string | null;
      dmId: string | null;
      endedAt: string | null;
    }[];
    const expected = check.expected as {
      channelId?: string;
      dmId?: string;
    };
    return huddles.some(
      (h) =>
        h.endedAt === null &&
        (expected.channelId === undefined || h.channelId === expected.channelId) &&
        (expected.dmId === undefined || h.dmId === expected.dmId),
    );
  },
);

export { slackAdapter };
