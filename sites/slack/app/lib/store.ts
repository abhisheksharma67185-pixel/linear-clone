import {
  workspace as initialWorkspace,
  preferences as initialPreferences,
  users as initialUsers,
  channels as initialChannels,
  directMessages as initialDirectMessages,
  messages as initialMessages,
  notifications as initialNotifications,
  readStates as initialReadStates,
  userGroups as initialUserGroups,
  savedItems as initialSavedItems,
  bookmarks as initialBookmarks,
  canvases as initialCanvases,
  lists as initialLists,
  workflows as initialWorkflows,
  huddles as initialHuddles,
  callHistory as initialCallHistory,
  type User,
  type Channel,
  type DirectMessage,
  type Message,
  type MessageBlock,
  type Attachment,
  type Notification,
  type ReadState,
  type UserGroup,
  type SavedItem,
  type Bookmark,
  type Canvas,
  type SlackList,
  type ListField,
  type Workflow,
  type Huddle,
  type Call,
  type Preferences,
} from "./mock-data";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Deterministic timestamps — use dateOverride when set (seeded episodes)
let _dateOverride: string | null = null;
let _dateCounter = 0;

export function setDateOverride(date: string | null): void {
  _dateOverride = date;
  _dateCounter = 0;
}

function now(): string {
  if (_dateOverride) {
    const base = new Date(_dateOverride);
    base.setSeconds(base.getSeconds() + _dateCounter++);
    return base.toISOString();
  }
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Enum validators
// ---------------------------------------------------------------------------

const VALID_PRESENCE = new Set<string>(["active", "away", "offline", "dnd"]);
const VALID_CHANNEL_TYPE = new Set<string>(["public", "private"]);
const VALID_POSTING_PERMISSION = new Set<string>(["all", "admins", "owners"]);
const CHANNEL_NAME_RE = /^[a-z0-9_-]{1,80}$/;

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let _workspace = deepClone(initialWorkspace);
let _preferences: Preferences = deepClone(initialPreferences);
let _users: User[] = deepClone(initialUsers);
let _channels: Channel[] = deepClone(initialChannels);
let _directMessages: DirectMessage[] = deepClone(initialDirectMessages);
let _messages: Message[] = deepClone(initialMessages);
let _notifications: Notification[] = deepClone(initialNotifications);
let _readStates: ReadState[] = deepClone(initialReadStates);
let _userGroups: UserGroup[] = deepClone(initialUserGroups);
let _savedItems: SavedItem[] = deepClone(initialSavedItems);
let _bookmarks: Bookmark[] = deepClone(initialBookmarks);
let _canvases: Canvas[] = deepClone(initialCanvases);
let _lists: SlackList[] = deepClone(initialLists);
let _workflows: Workflow[] = deepClone(initialWorkflows);
let _huddles: Huddle[] = deepClone(initialHuddles);
let _callHistory: Call[] = deepClone(initialCallHistory);

// Auto-increment counters (start above seed ranges)
let _nextChannelId = 20;
let _nextDmId = 12;
let _nextMessageId = 200;
let _nextNotificationId = 20;
let _nextReadStateId = 100;
let _nextUserGroupId = 10;
let _nextSavedId = 10;
let _nextBookmarkId = 10;
let _nextCanvasId = 10;
let _nextListId = 10;
let _nextListItemId = 20;
let _nextWorkflowId = 10;
let _nextHuddleId = 10;
let _nextCallId = 10;

const CURRENT_USER_ID = "usr-1";

// ---------------------------------------------------------------------------
// Workspace + preferences
// ---------------------------------------------------------------------------

export function getWorkspace() {
  return _workspace;
}

export function getPreferences(): Preferences {
  return _preferences;
}

export function setPreference(
  key: string,
  value: unknown,
): Result<Preferences> {
  (_preferences as Record<string, unknown>)[key] = value;
  return { success: true, data: _preferences };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUsers(): User[] {
  return _users;
}

export function getUserById(id: string): User | undefined {
  return _users.find((u) => u.id === id);
}

export function getUserByName(name: string): User | undefined {
  const lower = name.toLowerCase();
  return _users.find(
    (u) =>
      u.displayName.toLowerCase() === lower ||
      u.name.toLowerCase() === lower ||
      u.cessId.toLowerCase() === lower,
  );
}

export function getCurrentUser(): User {
  const u = getUserById(CURRENT_USER_ID);
  if (!u) throw new Error("Current user not found");
  return u;
}

export function updateUserStatus(
  userId: string,
  status: { emoji: string; text: string; expiresAt: string | null },
): Result<User> {
  const user = _users.find((u) => u.id === userId);
  if (!user) return { success: false, error: `User ${userId} not found` };
  user.status = { ...status };
  return { success: true, data: user };
}

export function clearUserStatus(userId: string): Result<User> {
  return updateUserStatus(userId, { emoji: "", text: "", expiresAt: null });
}

export function setPresence(
  userId: string,
  presence: User["presence"],
): Result<User> {
  if (!VALID_PRESENCE.has(presence))
    return { success: false, error: `Invalid presence: ${presence}` };
  const user = _users.find((u) => u.id === userId);
  if (!user) return { success: false, error: `User ${userId} not found` };
  user.presence = presence;
  return { success: true, data: user };
}

export function setDnd(
  userId: string,
  enabled: boolean,
): Result<User> {
  const user = _users.find((u) => u.id === userId);
  if (!user) return { success: false, error: `User ${userId} not found` };
  user.presence = enabled ? "dnd" : "active";
  return { success: true, data: user };
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export function getChannels(): Channel[] {
  return _channels;
}

export function getChannelById(id: string): Channel | undefined {
  return _channels.find((c) => c.id === id);
}

export function getChannelByName(name: string): Channel | undefined {
  const n = name.startsWith("#") ? name.slice(1) : name;
  return _channels.find((c) => c.name === n);
}

export function getChannelsForUser(userId: string): Channel[] {
  return _channels.filter((c) => c.memberIds.includes(userId));
}

export function createChannel(fields: {
  name?: string;
  topic?: string;
  purpose?: string;
  type?: "public" | "private";
  createdBy?: string;
  memberIds?: string[];
}): Result<Channel> {
  const name = (fields.name ?? "").trim().toLowerCase();
  if (!CHANNEL_NAME_RE.test(name))
    return {
      success: false,
      error: `Invalid channel name. Use 1-80 lowercase letters, numbers, hyphens, underscores.`,
    };
  if (_channels.some((c) => c.name === name))
    return { success: false, error: `Channel #${name} already exists` };
  const type = fields.type ?? "public";
  if (!VALID_CHANNEL_TYPE.has(type))
    return { success: false, error: `Invalid channel type: ${type}` };

  const creator = fields.createdBy ?? CURRENT_USER_ID;
  const memberIds = Array.from(
    new Set([creator, ...(fields.memberIds ?? [])]),
  );

  const channel: Channel = {
    id: `ch-${_nextChannelId++}`,
    name,
    topic: fields.topic ?? "",
    purpose: fields.purpose ?? "",
    type,
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: now(),
    createdBy: creator,
    memberIds,
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  };
  _channels.push(channel);

  // Initialize read state for each member
  for (const userId of memberIds) {
    _readStates.push({
      id: `rs-${_nextReadStateId++}`,
      userId,
      channelId: channel.id,
      dmId: null,
      lastReadMessageId: null,
      unreadCount: 0,
      unreadMentions: 0,
    });
  }

  return { success: true, data: channel };
}

export function updateChannel(
  id: string,
  fields: {
    name?: string;
    topic?: string;
    purpose?: string;
    postingPermission?: "all" | "admins" | "owners";
  },
): Result<Channel> {
  const channel = _channels.find((c) => c.id === id);
  if (!channel) return { success: false, error: `Channel ${id} not found` };
  if (fields.name !== undefined) {
    const n = fields.name.trim().toLowerCase();
    if (!CHANNEL_NAME_RE.test(n))
      return { success: false, error: `Invalid channel name` };
    if (_channels.some((c) => c.id !== id && c.name === n))
      return { success: false, error: `Channel #${n} already exists` };
    channel.name = n;
  }
  if (fields.topic !== undefined) channel.topic = fields.topic;
  if (fields.purpose !== undefined) channel.purpose = fields.purpose;
  if (fields.postingPermission !== undefined) {
    if (!VALID_POSTING_PERMISSION.has(fields.postingPermission))
      return {
        success: false,
        error: `Invalid posting permission: ${fields.postingPermission}`,
      };
    channel.postingPermission = fields.postingPermission;
  }
  return { success: true, data: channel };
}

export function archiveChannel(id: string): Result<Channel> {
  const channel = _channels.find((c) => c.id === id);
  if (!channel) return { success: false, error: `Channel ${id} not found` };
  if (channel.isGeneral)
    return {
      success: false,
      error: `Cannot archive the #general channel`,
    };
  if (channel.isArchived)
    return { success: false, error: `Channel #${channel.name} already archived` };
  channel.isArchived = true;
  return { success: true, data: channel };
}

export function unarchiveChannel(id: string): Result<Channel> {
  const channel = _channels.find((c) => c.id === id);
  if (!channel) return { success: false, error: `Channel ${id} not found` };
  if (!channel.isArchived)
    return { success: false, error: `Channel #${channel.name} not archived` };
  channel.isArchived = false;
  return { success: true, data: channel };
}

export function inviteToChannel(
  channelId: string,
  userIds: string[],
): Result<Channel> {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  if (channel.isArchived)
    return { success: false, error: `Channel #${channel.name} is archived` };
  const existing = new Set(channel.memberIds);
  for (const userId of userIds) {
    if (!getUserById(userId))
      return { success: false, error: `User ${userId} not found` };
    if (!existing.has(userId)) {
      channel.memberIds.push(userId);
      existing.add(userId);
      _readStates.push({
        id: `rs-${_nextReadStateId++}`,
        userId,
        channelId: channel.id,
        dmId: null,
        lastReadMessageId: null,
        unreadCount: 0,
        unreadMentions: 0,
      });
    }
  }
  return { success: true, data: channel };
}

export function removeFromChannel(
  channelId: string,
  userId: string,
): Result<Channel> {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  if (channel.isGeneral)
    return {
      success: false,
      error: `Cannot remove users from the #general channel`,
    };
  channel.memberIds = channel.memberIds.filter((id) => id !== userId);
  _readStates = _readStates.filter(
    (rs) => !(rs.channelId === channelId && rs.userId === userId),
  );
  return { success: true, data: channel };
}

export function joinChannel(
  channelId: string,
  userId?: string,
): Result<Channel> {
  return inviteToChannel(channelId, [userId ?? CURRENT_USER_ID]);
}

export function leaveChannel(
  channelId: string,
  userId?: string,
): Result<Channel> {
  return removeFromChannel(channelId, userId ?? CURRENT_USER_ID);
}

export function pinMessage(
  channelId: string,
  messageId: string,
): Result<Channel> {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  const message = _messages.find((m) => m.id === messageId);
  if (!message || message.channelId !== channelId)
    return {
      success: false,
      error: `Message ${messageId} not in channel ${channelId}`,
    };
  if (channel.pinnedMessageIds.includes(messageId))
    return { success: false, error: `Message already pinned` };
  channel.pinnedMessageIds.push(messageId);
  message.pinnedBy = CURRENT_USER_ID;
  return { success: true, data: channel };
}

export function unpinMessage(
  channelId: string,
  messageId: string,
): Result<Channel> {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  channel.pinnedMessageIds = channel.pinnedMessageIds.filter(
    (id) => id !== messageId,
  );
  const message = _messages.find((m) => m.id === messageId);
  if (message) message.pinnedBy = null;
  return { success: true, data: channel };
}

export function addBookmark(
  channelId: string,
  fields: { title: string; url: string; emoji?: string },
): Result<Bookmark> {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  const bookmark: Bookmark = {
    id: `bk-${_nextBookmarkId++}`,
    channelId,
    title: fields.title,
    url: fields.url,
    emoji: fields.emoji ?? ":bookmark:",
    createdBy: CURRENT_USER_ID,
    createdAt: now(),
  };
  _bookmarks.push(bookmark);
  channel.bookmarkIds.push(bookmark.id);
  return { success: true, data: bookmark };
}

export function removeBookmark(
  channelId: string,
  bookmarkId: string,
): Result {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  channel.bookmarkIds = channel.bookmarkIds.filter((id) => id !== bookmarkId);
  _bookmarks = _bookmarks.filter((b) => b.id !== bookmarkId);
  return { success: true, data: undefined };
}

export function setChannelCanvas(
  channelId: string,
  canvasId: string,
): Result<Channel> {
  const channel = _channels.find((c) => c.id === channelId);
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` };
  channel.canvasId = canvasId;
  return { success: true, data: channel };
}

// ---------------------------------------------------------------------------
// Direct messages
// ---------------------------------------------------------------------------

export function getDirectMessages(): DirectMessage[] {
  return _directMessages;
}

export function getDmById(id: string): DirectMessage | undefined {
  return _directMessages.find((d) => d.id === id);
}

export function getDmByParticipants(
  ids: string[],
): DirectMessage | undefined {
  const sorted = [...ids].sort();
  return _directMessages.find((d) => {
    const pSorted = [...d.participantIds].sort();
    return (
      pSorted.length === sorted.length &&
      pSorted.every((p, i) => p === sorted[i])
    );
  });
}

export function openDirectMessage(
  participantIds: string[],
): Result<DirectMessage> {
  const unique = Array.from(new Set(participantIds));
  if (unique.length < 2)
    return {
      success: false,
      error: `A direct message must include at least one other user. You cannot DM only yourself.`,
    };
  if (unique.length === 1 && unique[0] === CURRENT_USER_ID)
    return {
      success: false,
      error: `Cannot open a DM with only yourself`,
    };
  for (const id of unique) {
    if (!getUserById(id))
      return { success: false, error: `User ${id} not found` };
  }
  const existing = getDmByParticipants(unique);
  if (existing) return { success: true, data: existing };

  const dm: DirectMessage = {
    id: `dm-${_nextDmId++}`,
    participantIds: unique,
    createdAt: now(),
    isGroup: unique.length > 2,
    name: null,
    lastMessageAt: now(),
  };
  _directMessages.push(dm);
  for (const userId of unique) {
    _readStates.push({
      id: `rs-${_nextReadStateId++}`,
      userId,
      channelId: null,
      dmId: dm.id,
      lastReadMessageId: null,
      unreadCount: 0,
      unreadMentions: 0,
    });
  }
  return { success: true, data: dm };
}

export function closeDirectMessage(id: string): Result {
  _directMessages = _directMessages.filter((d) => d.id !== id);
  _readStates = _readStates.filter((rs) => rs.dmId !== id);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function getMessages(): Message[] {
  return _messages;
}

export function getMessagesByChannel(channelId: string): Message[] {
  return _messages.filter(
    (m) => m.channelId === channelId && !m.threadRootId && !m.scheduledFor,
  );
}

export function getMessagesByDm(dmId: string): Message[] {
  return _messages.filter((m) => m.dmId === dmId && !m.threadRootId);
}

export function getMessageById(id: string): Message | undefined {
  return _messages.find((m) => m.id === id);
}

export function getThreadReplies(rootId: string): Message[] {
  return _messages.filter((m) => m.threadRootId === rootId);
}

export function getThreadsForUser(userId: string): Message[] {
  const rootsWithUser = new Set<string>();
  for (const m of _messages) {
    if (m.threadRootId && m.authorId === userId)
      rootsWithUser.add(m.threadRootId);
    if (m.threadRootId && m.mentions.includes(userId))
      rootsWithUser.add(m.threadRootId);
  }
  return _messages.filter((m) => rootsWithUser.has(m.id));
}

export function createMessage(fields: {
  channelId?: string;
  dmId?: string;
  authorId?: string;
  text?: string;
  threadRootId?: string | null;
  blocks?: MessageBlock[];
  mentions?: string[];
  attachments?: Attachment[];
  broadcastToChannel?: boolean;
  scheduledFor?: string | null;
}): Result<Message> {
  if (!fields.channelId && !fields.dmId)
    return { success: false, error: `Either channelId or dmId is required` };
  if (fields.channelId && fields.dmId)
    return {
      success: false,
      error: `Cannot specify both channelId and dmId`,
    };
  const authorId = fields.authorId ?? CURRENT_USER_ID;
  if (!getUserById(authorId))
    return { success: false, error: `User ${authorId} not found` };
  const text = fields.text ?? "";
  if (!text.trim() && !(fields.attachments?.length))
    return { success: false, error: `Message text cannot be empty` };

  if (fields.channelId) {
    const channel = _channels.find((c) => c.id === fields.channelId);
    if (!channel)
      return { success: false, error: `Channel ${fields.channelId} not found` };
    if (channel.isArchived)
      return {
        success: false,
        error: `Cannot post to archived channel #${channel.name}`,
      };
    if (!channel.memberIds.includes(authorId))
      return {
        success: false,
        error: `User ${authorId} is not a member of #${channel.name}`,
      };
    const author = getUserById(authorId)!;
    if (
      channel.postingPermission === "admins" &&
      author.role !== "admin" &&
      author.role !== "owner"
    )
      return {
        success: false,
        error: `Only admins can post in #${channel.name}`,
      };
    if (
      channel.postingPermission === "owners" &&
      author.role !== "owner"
    )
      return {
        success: false,
        error: `Only owners can post in #${channel.name}`,
      };
  }
  if (fields.dmId) {
    const dm = _directMessages.find((d) => d.id === fields.dmId);
    if (!dm)
      return { success: false, error: `DM ${fields.dmId} not found` };
    if (!dm.participantIds.includes(authorId))
      return {
        success: false,
        error: `User ${authorId} is not a participant in this DM`,
      };
  }

  if (fields.threadRootId) {
    const root = _messages.find((m) => m.id === fields.threadRootId);
    if (!root)
      return {
        success: false,
        error: `Thread root ${fields.threadRootId} not found`,
      };
    if (root.isDeleted)
      return {
        success: false,
        error: `Cannot reply to a deleted message`,
      };
  }

  const message: Message = {
    id: `msg-${_nextMessageId++}`,
    channelId: fields.channelId ?? null,
    dmId: fields.dmId ?? null,
    threadRootId: fields.threadRootId ?? null,
    threadReplyCount: 0,
    threadParticipantIds: [],
    authorId,
    text,
    blocks: fields.blocks ?? [{ type: "rich_text", text }],
    mentions: fields.mentions ?? [],
    reactions: [],
    attachments: fields.attachments ?? [],
    createdAt: now(),
    editedAt: null,
    isDeleted: false,
    pinnedBy: null,
    isSaved: false,
    broadcastToChannel: fields.broadcastToChannel ?? false,
    scheduledFor: fields.scheduledFor ?? null,
  };
  _messages.push(message);

  // Update thread root bookkeeping
  if (fields.threadRootId) {
    const root = _messages.find((m) => m.id === fields.threadRootId);
    if (root) {
      root.threadReplyCount += 1;
      if (!root.threadParticipantIds.includes(authorId))
        root.threadParticipantIds.push(authorId);
    }
  }

  // Update DM lastMessageAt
  if (fields.dmId) {
    const dm = _directMessages.find((d) => d.id === fields.dmId);
    if (dm) dm.lastMessageAt = message.createdAt;
  }

  // Create mention notifications
  for (const mentionedId of message.mentions) {
    if (mentionedId === authorId) continue;
    _notifications.push({
      id: `notif-${_nextNotificationId++}`,
      type: "mention",
      userId: mentionedId,
      channelId: message.channelId,
      dmId: message.dmId,
      messageId: message.id,
      read: false,
      createdAt: message.createdAt,
    });
  }

  return { success: true, data: message };
}

export function updateMessage(
  id: string,
  fields: { text?: string; blocks?: MessageBlock[] },
): Result<Message> {
  const message = _messages.find((m) => m.id === id);
  if (!message) return { success: false, error: `Message ${id} not found` };
  if (message.isDeleted)
    return { success: false, error: `Cannot edit a deleted message` };
  if (fields.text !== undefined) {
    message.text = fields.text;
    message.blocks = fields.blocks ?? [{ type: "rich_text", text: fields.text }];
  } else if (fields.blocks !== undefined) {
    message.blocks = fields.blocks;
  }
  message.editedAt = now();
  return { success: true, data: message };
}

export function deleteMessage(id: string): Result<Message> {
  const message = _messages.find((m) => m.id === id);
  if (!message) return { success: false, error: `Message ${id} not found` };
  if (message.isDeleted)
    return { success: false, error: `Message already deleted` };
  message.isDeleted = true;
  message.text = "";
  message.blocks = [];
  return { success: true, data: message };
}

export function addReaction(
  messageId: string,
  emoji: string,
  userId?: string,
): Result<Message> {
  const message = _messages.find((m) => m.id === messageId);
  if (!message)
    return { success: false, error: `Message ${messageId} not found` };
  if (message.isDeleted)
    return { success: false, error: `Cannot react to a deleted message` };
  if (!emoji || typeof emoji !== "string")
    return { success: false, error: `Invalid emoji` };
  const uid = userId ?? CURRENT_USER_ID;
  const normalized = emoji.startsWith(":") ? emoji : `:${emoji}:`;
  const existing = message.reactions.find((r) => r.emoji === normalized);
  if (existing) {
    if (!existing.userIds.includes(uid)) existing.userIds.push(uid);
  } else {
    message.reactions.push({ emoji: normalized, userIds: [uid] });
  }
  return { success: true, data: message };
}

export function removeReaction(
  messageId: string,
  emoji: string,
  userId?: string,
): Result<Message> {
  const message = _messages.find((m) => m.id === messageId);
  if (!message)
    return { success: false, error: `Message ${messageId} not found` };
  const uid = userId ?? CURRENT_USER_ID;
  const normalized = emoji.startsWith(":") ? emoji : `:${emoji}:`;
  const reaction = message.reactions.find((r) => r.emoji === normalized);
  if (!reaction)
    return { success: false, error: `Reaction ${normalized} not found` };
  reaction.userIds = reaction.userIds.filter((id) => id !== uid);
  if (reaction.userIds.length === 0)
    message.reactions = message.reactions.filter(
      (r) => r.emoji !== normalized,
    );
  return { success: true, data: message };
}

export function saveMessage(
  messageId: string,
  reminder?: string | null,
  userId?: string,
): Result<SavedItem> {
  const message = _messages.find((m) => m.id === messageId);
  if (!message)
    return { success: false, error: `Message ${messageId} not found` };
  const uid = userId ?? CURRENT_USER_ID;
  const existing = _savedItems.find(
    (s) => s.userId === uid && s.messageId === messageId,
  );
  if (existing) return { success: true, data: existing };
  const item: SavedItem = {
    id: `sv-${_nextSavedId++}`,
    userId: uid,
    messageId,
    reminder: reminder ?? null,
    createdAt: now(),
    isCompleted: false,
  };
  _savedItems.push(item);
  if (uid === CURRENT_USER_ID) message.isSaved = true;
  return { success: true, data: item };
}

export function unsaveMessage(
  messageId: string,
  userId?: string,
): Result {
  const uid = userId ?? CURRENT_USER_ID;
  _savedItems = _savedItems.filter(
    (s) => !(s.userId === uid && s.messageId === messageId),
  );
  const message = _messages.find((m) => m.id === messageId);
  if (message && uid === CURRENT_USER_ID) message.isSaved = false;
  return { success: true, data: undefined };
}

export function forwardMessage(
  messageId: string,
  to: { channelId?: string; dmId?: string },
): Result<Message> {
  const src = _messages.find((m) => m.id === messageId);
  if (!src)
    return { success: false, error: `Message ${messageId} not found` };
  return createMessage({
    channelId: to.channelId,
    dmId: to.dmId,
    text: src.text,
    blocks: src.blocks,
    attachments: src.attachments,
  });
}

export function scheduleMessage(fields: {
  channelId?: string;
  dmId?: string;
  authorId?: string;
  text: string;
  scheduledFor: string;
}): Result<Message> {
  return createMessage({ ...fields, scheduledFor: fields.scheduledFor });
}

export function cancelScheduledMessage(id: string): Result {
  const idx = _messages.findIndex((m) => m.id === id && m.scheduledFor);
  if (idx < 0)
    return { success: false, error: `Scheduled message ${id} not found` };
  _messages.splice(idx, 1);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Read states
// ---------------------------------------------------------------------------

export function getReadStates(userId?: string): ReadState[] {
  if (!userId) return _readStates;
  return _readStates.filter((rs) => rs.userId === userId);
}

export function markChannelRead(
  channelId: string,
  userId?: string,
): Result<ReadState> {
  const uid = userId ?? CURRENT_USER_ID;
  const rs = _readStates.find(
    (r) => r.channelId === channelId && r.userId === uid,
  );
  if (!rs)
    return {
      success: false,
      error: `No read state for channel ${channelId} user ${uid}`,
    };
  const channelMessages = getMessagesByChannel(channelId);
  const last = channelMessages[channelMessages.length - 1];
  rs.lastReadMessageId = last?.id ?? rs.lastReadMessageId;
  rs.unreadCount = 0;
  rs.unreadMentions = 0;
  return { success: true, data: rs };
}

export function markDmRead(
  dmId: string,
  userId?: string,
): Result<ReadState> {
  const uid = userId ?? CURRENT_USER_ID;
  const rs = _readStates.find(
    (r) => r.dmId === dmId && r.userId === uid,
  );
  if (!rs)
    return {
      success: false,
      error: `No read state for DM ${dmId} user ${uid}`,
    };
  const dmMessages = getMessagesByDm(dmId);
  const last = dmMessages[dmMessages.length - 1];
  rs.lastReadMessageId = last?.id ?? rs.lastReadMessageId;
  rs.unreadCount = 0;
  rs.unreadMentions = 0;
  return { success: true, data: rs };
}

export function markAllRead(userId?: string): Result {
  const uid = userId ?? CURRENT_USER_ID;
  for (const rs of _readStates) {
    if (rs.userId === uid) {
      rs.unreadCount = 0;
      rs.unreadMentions = 0;
    }
  }
  return { success: true, data: undefined };
}

export function markUnread(
  messageId: string,
  userId?: string,
): Result<ReadState> {
  const message = _messages.find((m) => m.id === messageId);
  if (!message)
    return { success: false, error: `Message ${messageId} not found` };
  const uid = userId ?? CURRENT_USER_ID;
  const rs = _readStates.find(
    (r) =>
      r.userId === uid &&
      (r.channelId === message.channelId || r.dmId === message.dmId),
  );
  if (!rs)
    return { success: false, error: `Read state not found` };
  rs.unreadCount = Math.max(1, rs.unreadCount);
  return { success: true, data: rs };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function getNotifications(userId?: string): Notification[] {
  if (!userId) return _notifications;
  return _notifications.filter((n) => n.userId === userId);
}

export function markNotificationRead(id: string): Result<Notification> {
  const n = _notifications.find((n) => n.id === id);
  if (!n) return { success: false, error: `Notification ${id} not found` };
  n.read = true;
  return { success: true, data: n };
}

export function markAllNotificationsRead(userId?: string): Result {
  const uid = userId ?? CURRENT_USER_ID;
  for (const n of _notifications) {
    if (n.userId === uid) n.read = true;
  }
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// User groups
// ---------------------------------------------------------------------------

export function getUserGroups(): UserGroup[] {
  return _userGroups;
}

export function createUserGroup(fields: {
  handle?: string;
  name?: string;
  description?: string;
  memberIds?: string[];
}): Result<UserGroup> {
  const handle = (fields.handle ?? "").trim().toLowerCase();
  if (!handle) return { success: false, error: `handle required` };
  if (_userGroups.some((g) => g.handle === handle))
    return { success: false, error: `User group @${handle} already exists` };
  const group: UserGroup = {
    id: `ug-${_nextUserGroupId++}`,
    handle,
    name: fields.name ?? handle,
    description: fields.description ?? "",
    memberIds: fields.memberIds ?? [],
    isEnabled: true,
  };
  _userGroups.push(group);
  return { success: true, data: group };
}

export function updateUserGroup(
  id: string,
  fields: Partial<Pick<UserGroup, "name" | "description" | "memberIds">>,
): Result<UserGroup> {
  const group = _userGroups.find((g) => g.id === id);
  if (!group) return { success: false, error: `User group ${id} not found` };
  if (fields.name !== undefined) group.name = fields.name;
  if (fields.description !== undefined) group.description = fields.description;
  if (fields.memberIds !== undefined) group.memberIds = fields.memberIds;
  return { success: true, data: group };
}

export function disableUserGroup(id: string): Result<UserGroup> {
  const group = _userGroups.find((g) => g.id === id);
  if (!group) return { success: false, error: `User group ${id} not found` };
  group.isEnabled = false;
  return { success: true, data: group };
}

// ---------------------------------------------------------------------------
// Saved items
// ---------------------------------------------------------------------------

export function getSavedItems(userId?: string): SavedItem[] {
  if (!userId) return _savedItems;
  return _savedItems.filter((s) => s.userId === userId);
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export function getBookmarks(channelId?: string): Bookmark[] {
  if (!channelId) return _bookmarks;
  return _bookmarks.filter((b) => b.channelId === channelId);
}

// ---------------------------------------------------------------------------
// Canvases
// ---------------------------------------------------------------------------

export function getCanvases(channelId?: string): Canvas[] {
  if (!channelId) return _canvases;
  return _canvases.filter((c) => c.channelId === channelId);
}

export function getCanvasById(id: string): Canvas | undefined {
  return _canvases.find((c) => c.id === id);
}

export function createCanvas(fields: {
  channelId?: string | null;
  title?: string;
  content?: string;
}): Result<Canvas> {
  const canvas: Canvas = {
    id: `canvas-${_nextCanvasId++}`,
    channelId: fields.channelId ?? null,
    title: fields.title ?? "Untitled Canvas",
    content: fields.content ?? "",
    createdBy: CURRENT_USER_ID,
    createdAt: now(),
    updatedAt: now(),
  };
  _canvases.push(canvas);
  if (canvas.channelId) {
    const channel = _channels.find((c) => c.id === canvas.channelId);
    if (channel) channel.canvasId = canvas.id;
  }
  return { success: true, data: canvas };
}

export function updateCanvas(
  id: string,
  fields: { title?: string; content?: string },
): Result<Canvas> {
  const canvas = _canvases.find((c) => c.id === id);
  if (!canvas) return { success: false, error: `Canvas ${id} not found` };
  if (fields.title !== undefined) canvas.title = fields.title;
  if (fields.content !== undefined) canvas.content = fields.content;
  canvas.updatedAt = now();
  return { success: true, data: canvas };
}

export function deleteCanvas(id: string): Result {
  _canvases = _canvases.filter((c) => c.id !== id);
  for (const channel of _channels) {
    if (channel.canvasId === id) channel.canvasId = null;
  }
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export function getLists(channelId?: string): SlackList[] {
  if (!channelId) return _lists;
  return _lists.filter((l) => l.channelId === channelId);
}

export function getListById(id: string): SlackList | undefined {
  return _lists.find((l) => l.id === id);
}

export function createList(fields: {
  channelId?: string | null;
  name: string;
  fields: ListField[];
}): Result<SlackList> {
  const list: SlackList = {
    id: `list-${_nextListId++}`,
    channelId: fields.channelId ?? null,
    name: fields.name,
    fields: fields.fields,
    items: [],
    createdBy: CURRENT_USER_ID,
    createdAt: now(),
  };
  _lists.push(list);
  if (list.channelId) {
    const channel = _channels.find((c) => c.id === list.channelId);
    if (channel) channel.listIds.push(list.id);
  }
  return { success: true, data: list };
}

export function addListItem(
  listId: string,
  values: Record<string, unknown>,
): Result<SlackList> {
  const list = _lists.find((l) => l.id === listId);
  if (!list) return { success: false, error: `List ${listId} not found` };
  list.items.push({ id: `li-${_nextListItemId++}`, values });
  return { success: true, data: list };
}

export function updateListItem(
  listId: string,
  itemId: string,
  values: Record<string, unknown>,
): Result<SlackList> {
  const list = _lists.find((l) => l.id === listId);
  if (!list) return { success: false, error: `List ${listId} not found` };
  const item = list.items.find((i) => i.id === itemId);
  if (!item)
    return { success: false, error: `List item ${itemId} not found` };
  item.values = { ...item.values, ...values };
  return { success: true, data: list };
}

export function deleteListItem(
  listId: string,
  itemId: string,
): Result<SlackList> {
  const list = _lists.find((l) => l.id === listId);
  if (!list) return { success: false, error: `List ${listId} not found` };
  list.items = list.items.filter((i) => i.id !== itemId);
  return { success: true, data: list };
}

export function deleteList(id: string): Result {
  _lists = _lists.filter((l) => l.id !== id);
  for (const channel of _channels) {
    channel.listIds = channel.listIds.filter((lid) => lid !== id);
  }
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export function getWorkflows(channelId?: string): Workflow[] {
  if (!channelId) return _workflows;
  return _workflows.filter((w) => w.channelId === channelId);
}

export function createWorkflow(fields: {
  channelId?: string | null;
  name: string;
  trigger: Workflow["trigger"];
}): Result<Workflow> {
  const workflow: Workflow = {
    id: `wf-${_nextWorkflowId++}`,
    channelId: fields.channelId ?? null,
    name: fields.name,
    trigger: fields.trigger,
    isEnabled: true,
    runCount: 0,
    lastRunAt: null,
  };
  _workflows.push(workflow);
  if (workflow.channelId) {
    const channel = _channels.find((c) => c.id === workflow.channelId);
    if (channel) channel.workflowIds.push(workflow.id);
  }
  return { success: true, data: workflow };
}

export function enableWorkflow(id: string): Result<Workflow> {
  const wf = _workflows.find((w) => w.id === id);
  if (!wf) return { success: false, error: `Workflow ${id} not found` };
  wf.isEnabled = true;
  return { success: true, data: wf };
}

export function disableWorkflow(id: string): Result<Workflow> {
  const wf = _workflows.find((w) => w.id === id);
  if (!wf) return { success: false, error: `Workflow ${id} not found` };
  wf.isEnabled = false;
  return { success: true, data: wf };
}

// ---------------------------------------------------------------------------
// Huddles
// ---------------------------------------------------------------------------

export function getHuddles(activeOnly?: boolean): Huddle[] {
  if (activeOnly) return _huddles.filter((h) => h.endedAt === null);
  return _huddles;
}

export function startHuddle(fields: {
  channelId?: string | null;
  dmId?: string | null;
  topic?: string;
}): Result<Huddle> {
  if (!fields.channelId && !fields.dmId)
    return {
      success: false,
      error: `Either channelId or dmId is required`,
    };
  const huddle: Huddle = {
    id: `hud-${_nextHuddleId++}`,
    channelId: fields.channelId ?? null,
    dmId: fields.dmId ?? null,
    startedBy: CURRENT_USER_ID,
    startedAt: now(),
    endedAt: null,
    participantIds: [CURRENT_USER_ID],
    topic: fields.topic ?? "",
  };
  _huddles.push(huddle);
  if (fields.channelId) {
    const channel = _channels.find((c) => c.id === fields.channelId);
    if (channel) channel.huddleActive = true;
  }
  return { success: true, data: huddle };
}

export function endHuddle(id: string): Result<Huddle> {
  const huddle = _huddles.find((h) => h.id === id);
  if (!huddle) return { success: false, error: `Huddle ${id} not found` };
  if (huddle.endedAt !== null)
    return { success: false, error: `Huddle already ended` };
  huddle.endedAt = now();
  if (huddle.channelId) {
    const channel = _channels.find((c) => c.id === huddle.channelId);
    if (channel) channel.huddleActive = false;
  }
  _callHistory.push({
    id: `call-${_nextCallId++}`,
    type: "huddle",
    startedAt: huddle.startedAt,
    endedAt: huddle.endedAt,
    participantIds: huddle.participantIds,
    channelId: huddle.channelId,
    dmId: huddle.dmId,
  });
  return { success: true, data: huddle };
}

export function joinHuddle(
  id: string,
  userId?: string,
): Result<Huddle> {
  const huddle = _huddles.find((h) => h.id === id);
  if (!huddle) return { success: false, error: `Huddle ${id} not found` };
  if (huddle.endedAt !== null)
    return { success: false, error: `Huddle has ended` };
  const uid = userId ?? CURRENT_USER_ID;
  if (!huddle.participantIds.includes(uid))
    huddle.participantIds.push(uid);
  return { success: true, data: huddle };
}

export function getCallHistory(): Call[] {
  return _callHistory;
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  _workspace = deepClone(initialWorkspace);
  _preferences = deepClone(initialPreferences);
  _users = deepClone(initialUsers);
  _channels = deepClone(initialChannels);
  _directMessages = deepClone(initialDirectMessages);
  _messages = deepClone(initialMessages);
  _notifications = deepClone(initialNotifications);
  _readStates = deepClone(initialReadStates);
  _userGroups = deepClone(initialUserGroups);
  _savedItems = deepClone(initialSavedItems);
  _bookmarks = deepClone(initialBookmarks);
  _canvases = deepClone(initialCanvases);
  _lists = deepClone(initialLists);
  _workflows = deepClone(initialWorkflows);
  _huddles = deepClone(initialHuddles);
  _callHistory = deepClone(initialCallHistory);

  _nextChannelId = 20;
  _nextDmId = 12;
  _nextMessageId = 200;
  _nextNotificationId = 20;
  _nextReadStateId = 100;
  _nextUserGroupId = 10;
  _nextSavedId = 10;
  _nextBookmarkId = 10;
  _nextCanvasId = 10;
  _nextListId = 10;
  _nextListItemId = 20;
  _nextWorkflowId = 10;
  _nextHuddleId = 10;
  _nextCallId = 10;

  if (seed !== undefined) {
    setDateOverride("2026-04-13T12:00:00.000Z");
  } else {
    setDateOverride(null);
  }
}
