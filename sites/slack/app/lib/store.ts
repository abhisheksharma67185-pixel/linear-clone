// ---------------------------------------------------------------------------
// Slack store — public API for the in-memory simulator.
//
// State now lives on the per-session `SlackStoreState` (see ./state.ts and
// ./session.ts). Every function below reads + mutates through `_state()`,
// which resolves to the rollout-scoped store when called inside a request
// wrapped with `withSession`, and to the shared "default" session otherwise
// (RSC pages, vitest, etc).
//
// The free-function shape of the public API is preserved so existing call
// sites in components, API routes, and tests keep working unchanged.
//
// NOTE on returns: unlike the linear store, slack getters return *live*
// references to the underlying arrays/objects (no deep clone). This matches
// the original behavior — callers like the RL route reduce over the array
// directly and would be surprised by a fresh copy.
// ---------------------------------------------------------------------------

import {
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
} from "./mock-data"
import { _state } from "./session"
import { resetState } from "./state"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Deterministic timestamps — use dateOverride when set (seeded episodes)
// ---------------------------------------------------------------------------

export function setDateOverride(date: string | null): void {
  const s = _state()
  s.dateOverride = date
  s.dateCounter = 0
}

function now(): string {
  const s = _state()
  if (s.dateOverride) {
    const base = new Date(s.dateOverride)
    base.setSeconds(base.getSeconds() + s.dateCounter++)
    return base.toISOString()
  }
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// Enum validators
// ---------------------------------------------------------------------------

const VALID_PRESENCE = new Set<string>(["active", "away", "offline", "dnd"])
const VALID_CHANNEL_TYPE = new Set<string>(["public", "private"])
const VALID_POSTING_PERMISSION = new Set<string>(["all", "admins", "owners"])
const CHANNEL_NAME_RE = /^[a-z0-9_-]{1,80}$/

const CURRENT_USER_ID = "usr-1"

// ---------------------------------------------------------------------------
// Workspace + preferences
// ---------------------------------------------------------------------------

export function getWorkspace() {
  return _state().workspace
}

export function getPreferences(): Preferences {
  return _state().preferences
}

export function setPreference(
  key: string,
  value: unknown
): Result<Preferences> {
  const prefs = _state().preferences as unknown as Record<string, unknown>
  prefs[key] = value
  return { success: true, data: _state().preferences }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUsers(): User[] {
  return _state().users
}

export function getUserById(id: string): User | undefined {
  return _state().users.find((u) => u.id === id)
}

export function getUserByName(name: string): User | undefined {
  const lower = name.toLowerCase()
  return _state().users.find(
    (u) =>
      u.displayName.toLowerCase() === lower ||
      u.name.toLowerCase() === lower ||
      u.cessId.toLowerCase() === lower
  )
}

export function getCurrentUser(): User {
  const u = getUserById(CURRENT_USER_ID)
  if (!u) throw new Error("Current user not found")
  return u
}

export function updateUserStatus(
  userId: string,
  status: { emoji: string; text: string; expiresAt: string | null }
): Result<User> {
  const user = _state().users.find((u) => u.id === userId)
  if (!user) return { success: false, error: `User ${userId} not found` }
  user.status = { ...status }
  return { success: true, data: user }
}

export function clearUserStatus(userId: string): Result<User> {
  return updateUserStatus(userId, { emoji: "", text: "", expiresAt: null })
}

export function setPresence(
  userId: string,
  presence: User["presence"]
): Result<User> {
  if (!VALID_PRESENCE.has(presence))
    return { success: false, error: `Invalid presence: ${presence}` }
  const user = _state().users.find((u) => u.id === userId)
  if (!user) return { success: false, error: `User ${userId} not found` }
  user.presence = presence
  return { success: true, data: user }
}

export function setDnd(userId: string, enabled: boolean): Result<User> {
  const user = _state().users.find((u) => u.id === userId)
  if (!user) return { success: false, error: `User ${userId} not found` }
  user.presence = enabled ? "dnd" : "active"
  return { success: true, data: user }
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export function getChannels(): Channel[] {
  return _state().channels
}

export function getChannelById(id: string): Channel | undefined {
  return _state().channels.find((c) => c.id === id)
}

export function getChannelByName(name: string): Channel | undefined {
  const n = name.startsWith("#") ? name.slice(1) : name
  return _state().channels.find((c) => c.name === n)
}

export function getChannelsForUser(userId: string): Channel[] {
  return _state().channels.filter((c) => c.memberIds.includes(userId))
}

export function createChannel(fields: {
  name?: string
  topic?: string
  purpose?: string
  type?: "public" | "private"
  createdBy?: string
  memberIds?: string[]
}): Result<Channel> {
  const s = _state()
  const name = (fields.name ?? "").trim().toLowerCase()
  if (!CHANNEL_NAME_RE.test(name))
    return {
      success: false,
      error: `Invalid channel name. Use 1-80 lowercase letters, numbers, hyphens, underscores.`,
    }
  if (s.channels.some((c) => c.name === name))
    return { success: false, error: `Channel #${name} already exists` }
  const type = fields.type ?? "public"
  if (!VALID_CHANNEL_TYPE.has(type))
    return { success: false, error: `Invalid channel type: ${type}` }

  const creator = fields.createdBy ?? CURRENT_USER_ID
  const memberIds = Array.from(new Set([creator, ...(fields.memberIds ?? [])]))

  const channel: Channel = {
    id: `ch-${s.nextChannelId++}`,
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
  }
  s.channels.push(channel)

  for (const userId of memberIds) {
    s.readStates.push({
      id: `rs-${s.nextReadStateId++}`,
      userId,
      channelId: channel.id,
      dmId: null,
      lastReadMessageId: null,
      unreadCount: 0,
      unreadMentions: 0,
    })
  }

  return { success: true, data: channel }
}

export function updateChannel(
  id: string,
  fields: {
    name?: string
    topic?: string
    purpose?: string
    postingPermission?: "all" | "admins" | "owners"
  }
): Result<Channel> {
  const s = _state()
  const channel = s.channels.find((c) => c.id === id)
  if (!channel) return { success: false, error: `Channel ${id} not found` }
  if (fields.name !== undefined) {
    const n = fields.name.trim().toLowerCase()
    if (!CHANNEL_NAME_RE.test(n))
      return { success: false, error: `Invalid channel name` }
    if (s.channels.some((c) => c.id !== id && c.name === n))
      return { success: false, error: `Channel #${n} already exists` }
    channel.name = n
  }
  if (fields.topic !== undefined) channel.topic = fields.topic
  if (fields.purpose !== undefined) channel.purpose = fields.purpose
  if (fields.postingPermission !== undefined) {
    if (!VALID_POSTING_PERMISSION.has(fields.postingPermission))
      return {
        success: false,
        error: `Invalid posting permission: ${fields.postingPermission}`,
      }
    channel.postingPermission = fields.postingPermission
  }
  return { success: true, data: channel }
}

export function archiveChannel(id: string): Result<Channel> {
  const channel = _state().channels.find((c) => c.id === id)
  if (!channel) return { success: false, error: `Channel ${id} not found` }
  if (channel.isGeneral)
    return {
      success: false,
      error: `Cannot archive the #general channel`,
    }
  if (channel.isArchived)
    return {
      success: false,
      error: `Channel #${channel.name} already archived`,
    }
  channel.isArchived = true
  return { success: true, data: channel }
}

export function unarchiveChannel(id: string): Result<Channel> {
  const channel = _state().channels.find((c) => c.id === id)
  if (!channel) return { success: false, error: `Channel ${id} not found` }
  if (!channel.isArchived)
    return { success: false, error: `Channel #${channel.name} not archived` }
  channel.isArchived = false
  return { success: true, data: channel }
}

export function inviteToChannel(
  channelId: string,
  userIds: string[]
): Result<Channel> {
  const s = _state()
  const channel = s.channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  if (channel.isArchived)
    return { success: false, error: `Channel #${channel.name} is archived` }
  const existing = new Set(channel.memberIds)
  for (const userId of userIds) {
    if (!getUserById(userId))
      return { success: false, error: `User ${userId} not found` }
    if (!existing.has(userId)) {
      channel.memberIds.push(userId)
      existing.add(userId)
      s.readStates.push({
        id: `rs-${s.nextReadStateId++}`,
        userId,
        channelId: channel.id,
        dmId: null,
        lastReadMessageId: null,
        unreadCount: 0,
        unreadMentions: 0,
      })
    }
  }
  return { success: true, data: channel }
}

export function removeFromChannel(
  channelId: string,
  userId: string
): Result<Channel> {
  const s = _state()
  const channel = s.channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  if (channel.isGeneral)
    return {
      success: false,
      error: `Cannot remove users from the #general channel`,
    }
  channel.memberIds = channel.memberIds.filter((id) => id !== userId)
  s.readStates = s.readStates.filter(
    (rs) => !(rs.channelId === channelId && rs.userId === userId)
  )
  return { success: true, data: channel }
}

export function joinChannel(
  channelId: string,
  userId?: string
): Result<Channel> {
  return inviteToChannel(channelId, [userId ?? CURRENT_USER_ID])
}

export function leaveChannel(
  channelId: string,
  userId?: string
): Result<Channel> {
  return removeFromChannel(channelId, userId ?? CURRENT_USER_ID)
}

export function pinMessage(
  channelId: string,
  messageId: string
): Result<Channel> {
  const s = _state()
  const channel = s.channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  const message = s.messages.find((m) => m.id === messageId)
  if (!message || message.channelId !== channelId)
    return {
      success: false,
      error: `Message ${messageId} not in channel ${channelId}`,
    }
  if (channel.pinnedMessageIds.includes(messageId))
    return { success: false, error: `Message already pinned` }
  channel.pinnedMessageIds.push(messageId)
  message.pinnedBy = CURRENT_USER_ID
  return { success: true, data: channel }
}

export function unpinMessage(
  channelId: string,
  messageId: string
): Result<Channel> {
  const s = _state()
  const channel = s.channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  channel.pinnedMessageIds = channel.pinnedMessageIds.filter(
    (id) => id !== messageId
  )
  const message = s.messages.find((m) => m.id === messageId)
  if (message) message.pinnedBy = null
  return { success: true, data: channel }
}

export function addBookmark(
  channelId: string,
  fields: { title: string; url: string; emoji?: string }
): Result<Bookmark> {
  const s = _state()
  const channel = s.channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  const bookmark: Bookmark = {
    id: `bk-${s.nextBookmarkId++}`,
    channelId,
    title: fields.title,
    url: fields.url,
    emoji: fields.emoji ?? ":bookmark:",
    createdBy: CURRENT_USER_ID,
    createdAt: now(),
  }
  s.bookmarks.push(bookmark)
  channel.bookmarkIds.push(bookmark.id)
  return { success: true, data: bookmark }
}

export function removeBookmark(channelId: string, bookmarkId: string): Result {
  const s = _state()
  const channel = s.channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  channel.bookmarkIds = channel.bookmarkIds.filter((id) => id !== bookmarkId)
  s.bookmarks = s.bookmarks.filter((b) => b.id !== bookmarkId)
  return { success: true, data: undefined }
}

export function setChannelCanvas(
  channelId: string,
  canvasId: string
): Result<Channel> {
  const channel = _state().channels.find((c) => c.id === channelId)
  if (!channel)
    return { success: false, error: `Channel ${channelId} not found` }
  channel.canvasId = canvasId
  return { success: true, data: channel }
}

// ---------------------------------------------------------------------------
// Direct messages
// ---------------------------------------------------------------------------

export function getDirectMessages(): DirectMessage[] {
  return _state().directMessages
}

export function getDmById(id: string): DirectMessage | undefined {
  return _state().directMessages.find((d) => d.id === id)
}

export function getDmByParticipants(ids: string[]): DirectMessage | undefined {
  const sorted = [...ids].sort()
  return _state().directMessages.find((d) => {
    const pSorted = [...d.participantIds].sort()
    return (
      pSorted.length === sorted.length &&
      pSorted.every((p, i) => p === sorted[i])
    )
  })
}

export function openDirectMessage(
  participantIds: string[]
): Result<DirectMessage> {
  const s = _state()
  const unique = Array.from(new Set(participantIds))
  if (unique.length < 2)
    return {
      success: false,
      error: `A direct message must include at least one other user. You cannot DM only yourself.`,
    }
  if (unique.length === 1 && unique[0] === CURRENT_USER_ID)
    return {
      success: false,
      error: `Cannot open a DM with only yourself`,
    }
  for (const id of unique) {
    if (!getUserById(id))
      return { success: false, error: `User ${id} not found` }
  }
  const existing = getDmByParticipants(unique)
  if (existing) return { success: true, data: existing }

  const dm: DirectMessage = {
    id: `dm-${s.nextDmId++}`,
    participantIds: unique,
    createdAt: now(),
    isGroup: unique.length > 2,
    name: null,
    lastMessageAt: now(),
  }
  s.directMessages.push(dm)
  for (const userId of unique) {
    s.readStates.push({
      id: `rs-${s.nextReadStateId++}`,
      userId,
      channelId: null,
      dmId: dm.id,
      lastReadMessageId: null,
      unreadCount: 0,
      unreadMentions: 0,
    })
  }
  return { success: true, data: dm }
}

export function closeDirectMessage(id: string): Result {
  const s = _state()
  s.directMessages = s.directMessages.filter((d) => d.id !== id)
  s.readStates = s.readStates.filter((rs) => rs.dmId !== id)
  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function getMessages(): Message[] {
  return _state().messages
}

export function getMessagesByChannel(channelId: string): Message[] {
  return _state().messages.filter(
    (m) => m.channelId === channelId && !m.threadRootId && !m.scheduledFor
  )
}

export function getMessagesByDm(dmId: string): Message[] {
  return _state().messages.filter((m) => m.dmId === dmId && !m.threadRootId)
}

export function getMessageById(id: string): Message | undefined {
  return _state().messages.find((m) => m.id === id)
}

export function getThreadReplies(rootId: string): Message[] {
  return _state().messages.filter((m) => m.threadRootId === rootId)
}

export function getThreadsForUser(userId: string): Message[] {
  const messages = _state().messages
  const rootsWithUser = new Set<string>()
  for (const m of messages) {
    if (m.threadRootId && m.authorId === userId)
      rootsWithUser.add(m.threadRootId)
    if (m.threadRootId && m.mentions.includes(userId))
      rootsWithUser.add(m.threadRootId)
  }
  return messages.filter((m) => rootsWithUser.has(m.id))
}

export function createMessage(fields: {
  channelId?: string
  dmId?: string
  authorId?: string
  text?: string
  threadRootId?: string | null
  blocks?: MessageBlock[]
  mentions?: string[]
  attachments?: Attachment[]
  broadcastToChannel?: boolean
  scheduledFor?: string | null
}): Result<Message> {
  const s = _state()
  if (!fields.channelId && !fields.dmId)
    return { success: false, error: `Either channelId or dmId is required` }
  if (fields.channelId && fields.dmId)
    return {
      success: false,
      error: `Cannot specify both channelId and dmId`,
    }
  const authorId = fields.authorId ?? CURRENT_USER_ID
  if (!getUserById(authorId))
    return { success: false, error: `User ${authorId} not found` }
  const text = fields.text ?? ""
  if (!text.trim() && !fields.attachments?.length)
    return { success: false, error: `Message text cannot be empty` }

  if (fields.channelId) {
    const channel = s.channels.find((c) => c.id === fields.channelId)
    if (!channel)
      return { success: false, error: `Channel ${fields.channelId} not found` }
    if (channel.isArchived)
      return {
        success: false,
        error: `Cannot post to archived channel #${channel.name}`,
      }
    if (!channel.memberIds.includes(authorId))
      return {
        success: false,
        error: `User ${authorId} is not a member of #${channel.name}`,
      }
    const author = getUserById(authorId)!
    if (
      channel.postingPermission === "admins" &&
      author.role !== "admin" &&
      author.role !== "owner"
    )
      return {
        success: false,
        error: `Only admins can post in #${channel.name}`,
      }
    if (channel.postingPermission === "owners" && author.role !== "owner")
      return {
        success: false,
        error: `Only owners can post in #${channel.name}`,
      }
  }
  if (fields.dmId) {
    const dm = s.directMessages.find((d) => d.id === fields.dmId)
    if (!dm) return { success: false, error: `DM ${fields.dmId} not found` }
    if (!dm.participantIds.includes(authorId))
      return {
        success: false,
        error: `User ${authorId} is not a participant in this DM`,
      }
  }

  if (fields.threadRootId) {
    const root = s.messages.find((m) => m.id === fields.threadRootId)
    if (!root)
      return {
        success: false,
        error: `Thread root ${fields.threadRootId} not found`,
      }
    if (root.isDeleted)
      return {
        success: false,
        error: `Cannot reply to a deleted message`,
      }
  }

  const message: Message = {
    id: `msg-${s.nextMessageId++}`,
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
  }
  s.messages.push(message)

  if (fields.threadRootId) {
    const root = s.messages.find((m) => m.id === fields.threadRootId)
    if (root) {
      root.threadReplyCount += 1
      if (!root.threadParticipantIds.includes(authorId))
        root.threadParticipantIds.push(authorId)
    }
  }

  if (fields.dmId) {
    const dm = s.directMessages.find((d) => d.id === fields.dmId)
    if (dm) dm.lastMessageAt = message.createdAt
  }

  for (const mentionedId of message.mentions) {
    if (mentionedId === authorId) continue
    s.notifications.push({
      id: `notif-${s.nextNotificationId++}`,
      type: "mention",
      userId: mentionedId,
      channelId: message.channelId,
      dmId: message.dmId,
      messageId: message.id,
      read: false,
      createdAt: message.createdAt,
    })
  }

  return { success: true, data: message }
}

export function updateMessage(
  id: string,
  fields: { text?: string; blocks?: MessageBlock[] }
): Result<Message> {
  const message = _state().messages.find((m) => m.id === id)
  if (!message) return { success: false, error: `Message ${id} not found` }
  if (message.isDeleted)
    return { success: false, error: `Cannot edit a deleted message` }
  if (fields.text !== undefined) {
    message.text = fields.text
    message.blocks = fields.blocks ?? [{ type: "rich_text", text: fields.text }]
  } else if (fields.blocks !== undefined) {
    message.blocks = fields.blocks
  }
  message.editedAt = now()
  return { success: true, data: message }
}

export function deleteMessage(id: string): Result<Message> {
  const message = _state().messages.find((m) => m.id === id)
  if (!message) return { success: false, error: `Message ${id} not found` }
  if (message.isDeleted)
    return { success: false, error: `Message already deleted` }
  message.isDeleted = true
  message.text = ""
  message.blocks = []
  return { success: true, data: message }
}

export function addReaction(
  messageId: string,
  emoji: string,
  userId?: string
): Result<Message> {
  const message = _state().messages.find((m) => m.id === messageId)
  if (!message)
    return { success: false, error: `Message ${messageId} not found` }
  if (message.isDeleted)
    return { success: false, error: `Cannot react to a deleted message` }
  if (!emoji || typeof emoji !== "string")
    return { success: false, error: `Invalid emoji` }
  const uid = userId ?? CURRENT_USER_ID
  const normalized = emoji.startsWith(":") ? emoji : `:${emoji}:`
  const existing = message.reactions.find((r) => r.emoji === normalized)
  if (existing) {
    if (!existing.userIds.includes(uid)) existing.userIds.push(uid)
  } else {
    message.reactions.push({ emoji: normalized, userIds: [uid] })
  }
  return { success: true, data: message }
}

export function removeReaction(
  messageId: string,
  emoji: string,
  userId?: string
): Result<Message> {
  const message = _state().messages.find((m) => m.id === messageId)
  if (!message)
    return { success: false, error: `Message ${messageId} not found` }
  const uid = userId ?? CURRENT_USER_ID
  const normalized = emoji.startsWith(":") ? emoji : `:${emoji}:`
  const reaction = message.reactions.find((r) => r.emoji === normalized)
  if (!reaction)
    return { success: false, error: `Reaction ${normalized} not found` }
  reaction.userIds = reaction.userIds.filter((id) => id !== uid)
  if (reaction.userIds.length === 0)
    message.reactions = message.reactions.filter((r) => r.emoji !== normalized)
  return { success: true, data: message }
}

export function saveMessage(
  messageId: string,
  reminder?: string | null,
  userId?: string
): Result<SavedItem> {
  const s = _state()
  const message = s.messages.find((m) => m.id === messageId)
  if (!message)
    return { success: false, error: `Message ${messageId} not found` }
  const uid = userId ?? CURRENT_USER_ID
  const existing = s.savedItems.find(
    (sv) => sv.userId === uid && sv.messageId === messageId
  )
  if (existing) return { success: true, data: existing }
  const item: SavedItem = {
    id: `sv-${s.nextSavedId++}`,
    userId: uid,
    messageId,
    reminder: reminder ?? null,
    createdAt: now(),
    isCompleted: false,
  }
  s.savedItems.push(item)
  if (uid === CURRENT_USER_ID) message.isSaved = true
  return { success: true, data: item }
}

export function unsaveMessage(messageId: string, userId?: string): Result {
  const s = _state()
  const uid = userId ?? CURRENT_USER_ID
  s.savedItems = s.savedItems.filter(
    (sv) => !(sv.userId === uid && sv.messageId === messageId)
  )
  const message = s.messages.find((m) => m.id === messageId)
  if (message && uid === CURRENT_USER_ID) message.isSaved = false
  return { success: true, data: undefined }
}

export function forwardMessage(
  messageId: string,
  to: { channelId?: string; dmId?: string }
): Result<Message> {
  const src = _state().messages.find((m) => m.id === messageId)
  if (!src) return { success: false, error: `Message ${messageId} not found` }
  return createMessage({
    channelId: to.channelId,
    dmId: to.dmId,
    text: src.text,
    blocks: src.blocks,
    attachments: src.attachments,
  })
}

export function scheduleMessage(fields: {
  channelId?: string
  dmId?: string
  authorId?: string
  text: string
  scheduledFor: string
}): Result<Message> {
  return createMessage({ ...fields, scheduledFor: fields.scheduledFor })
}

export function cancelScheduledMessage(id: string): Result {
  const s = _state()
  const idx = s.messages.findIndex((m) => m.id === id && m.scheduledFor)
  if (idx < 0)
    return { success: false, error: `Scheduled message ${id} not found` }
  s.messages.splice(idx, 1)
  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Read states
// ---------------------------------------------------------------------------

export function getReadStates(userId?: string): ReadState[] {
  const all = _state().readStates
  if (!userId) return all
  return all.filter((rs) => rs.userId === userId)
}

export function markChannelRead(
  channelId: string,
  userId?: string
): Result<ReadState> {
  const uid = userId ?? CURRENT_USER_ID
  const rs = _state().readStates.find(
    (r) => r.channelId === channelId && r.userId === uid
  )
  if (!rs)
    return {
      success: false,
      error: `No read state for channel ${channelId} user ${uid}`,
    }
  const channelMessages = getMessagesByChannel(channelId)
  const last = channelMessages[channelMessages.length - 1]
  rs.lastReadMessageId = last?.id ?? rs.lastReadMessageId
  rs.unreadCount = 0
  rs.unreadMentions = 0
  return { success: true, data: rs }
}

export function markDmRead(dmId: string, userId?: string): Result<ReadState> {
  const uid = userId ?? CURRENT_USER_ID
  const rs = _state().readStates.find(
    (r) => r.dmId === dmId && r.userId === uid
  )
  if (!rs)
    return {
      success: false,
      error: `No read state for DM ${dmId} user ${uid}`,
    }
  const dmMessages = getMessagesByDm(dmId)
  const last = dmMessages[dmMessages.length - 1]
  rs.lastReadMessageId = last?.id ?? rs.lastReadMessageId
  rs.unreadCount = 0
  rs.unreadMentions = 0
  return { success: true, data: rs }
}

export function markAllRead(userId?: string): Result {
  const uid = userId ?? CURRENT_USER_ID
  for (const rs of _state().readStates) {
    if (rs.userId === uid) {
      rs.unreadCount = 0
      rs.unreadMentions = 0
    }
  }
  return { success: true, data: undefined }
}

export function markUnread(
  messageId: string,
  userId?: string
): Result<ReadState> {
  const s = _state()
  const message = s.messages.find((m) => m.id === messageId)
  if (!message)
    return { success: false, error: `Message ${messageId} not found` }
  const uid = userId ?? CURRENT_USER_ID
  const rs = s.readStates.find(
    (r) =>
      r.userId === uid &&
      (r.channelId === message.channelId || r.dmId === message.dmId)
  )
  if (!rs) return { success: false, error: `Read state not found` }
  rs.unreadCount = Math.max(1, rs.unreadCount)
  return { success: true, data: rs }
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function getNotifications(userId?: string): Notification[] {
  const all = _state().notifications
  if (!userId) return all
  return all.filter((n) => n.userId === userId)
}

export function markNotificationRead(id: string): Result<Notification> {
  const n = _state().notifications.find((n) => n.id === id)
  if (!n) return { success: false, error: `Notification ${id} not found` }
  n.read = true
  return { success: true, data: n }
}

export function markAllNotificationsRead(userId?: string): Result {
  const uid = userId ?? CURRENT_USER_ID
  for (const n of _state().notifications) {
    if (n.userId === uid) n.read = true
  }
  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// User groups
// ---------------------------------------------------------------------------

export function getUserGroups(): UserGroup[] {
  return _state().userGroups
}

export function createUserGroup(fields: {
  handle?: string
  name?: string
  description?: string
  memberIds?: string[]
}): Result<UserGroup> {
  const s = _state()
  const handle = (fields.handle ?? "").trim().toLowerCase()
  if (!handle) return { success: false, error: `handle required` }
  if (s.userGroups.some((g) => g.handle === handle))
    return { success: false, error: `User group @${handle} already exists` }
  const group: UserGroup = {
    id: `ug-${s.nextUserGroupId++}`,
    handle,
    name: fields.name ?? handle,
    description: fields.description ?? "",
    memberIds: fields.memberIds ?? [],
    isEnabled: true,
  }
  s.userGroups.push(group)
  return { success: true, data: group }
}

export function updateUserGroup(
  id: string,
  fields: Partial<Pick<UserGroup, "name" | "description" | "memberIds">>
): Result<UserGroup> {
  const group = _state().userGroups.find((g) => g.id === id)
  if (!group) return { success: false, error: `User group ${id} not found` }
  if (fields.name !== undefined) group.name = fields.name
  if (fields.description !== undefined) group.description = fields.description
  if (fields.memberIds !== undefined) group.memberIds = fields.memberIds
  return { success: true, data: group }
}

export function disableUserGroup(id: string): Result<UserGroup> {
  const group = _state().userGroups.find((g) => g.id === id)
  if (!group) return { success: false, error: `User group ${id} not found` }
  group.isEnabled = false
  return { success: true, data: group }
}

// ---------------------------------------------------------------------------
// Saved items
// ---------------------------------------------------------------------------

export function getSavedItems(userId?: string): SavedItem[] {
  const all = _state().savedItems
  if (!userId) return all
  return all.filter((s) => s.userId === userId)
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export function getBookmarks(channelId?: string): Bookmark[] {
  const all = _state().bookmarks
  if (!channelId) return all
  return all.filter((b) => b.channelId === channelId)
}

// ---------------------------------------------------------------------------
// Canvases
// ---------------------------------------------------------------------------

export function getCanvases(channelId?: string): Canvas[] {
  const all = _state().canvases
  if (!channelId) return all
  return all.filter((c) => c.channelId === channelId)
}

export function getCanvasById(id: string): Canvas | undefined {
  return _state().canvases.find((c) => c.id === id)
}

export function createCanvas(fields: {
  channelId?: string | null
  title?: string
  content?: string
}): Result<Canvas> {
  const s = _state()
  const canvas: Canvas = {
    id: `canvas-${s.nextCanvasId++}`,
    channelId: fields.channelId ?? null,
    title: fields.title ?? "Untitled Canvas",
    content: fields.content ?? "",
    createdBy: CURRENT_USER_ID,
    createdAt: now(),
    updatedAt: now(),
  }
  s.canvases.push(canvas)
  if (canvas.channelId) {
    const channel = s.channels.find((c) => c.id === canvas.channelId)
    if (channel) channel.canvasId = canvas.id
  }
  return { success: true, data: canvas }
}

export function updateCanvas(
  id: string,
  fields: { title?: string; content?: string }
): Result<Canvas> {
  const canvas = _state().canvases.find((c) => c.id === id)
  if (!canvas) return { success: false, error: `Canvas ${id} not found` }
  if (fields.title !== undefined) canvas.title = fields.title
  if (fields.content !== undefined) canvas.content = fields.content
  canvas.updatedAt = now()
  return { success: true, data: canvas }
}

export function deleteCanvas(id: string): Result {
  const s = _state()
  s.canvases = s.canvases.filter((c) => c.id !== id)
  for (const channel of s.channels) {
    if (channel.canvasId === id) channel.canvasId = null
  }
  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export function getLists(channelId?: string): SlackList[] {
  const all = _state().lists
  if (!channelId) return all
  return all.filter((l) => l.channelId === channelId)
}

export function getListById(id: string): SlackList | undefined {
  return _state().lists.find((l) => l.id === id)
}

export function createList(fields: {
  channelId?: string | null
  name: string
  fields: ListField[]
}): Result<SlackList> {
  const s = _state()
  const list: SlackList = {
    id: `list-${s.nextListId++}`,
    channelId: fields.channelId ?? null,
    name: fields.name,
    fields: fields.fields,
    items: [],
    createdBy: CURRENT_USER_ID,
    createdAt: now(),
  }
  s.lists.push(list)
  if (list.channelId) {
    const channel = s.channels.find((c) => c.id === list.channelId)
    if (channel) channel.listIds.push(list.id)
  }
  return { success: true, data: list }
}

export function addListItem(
  listId: string,
  values: Record<string, unknown>
): Result<SlackList> {
  const s = _state()
  const list = s.lists.find((l) => l.id === listId)
  if (!list) return { success: false, error: `List ${listId} not found` }
  list.items.push({ id: `li-${s.nextListItemId++}`, values })
  return { success: true, data: list }
}

export function updateListItem(
  listId: string,
  itemId: string,
  values: Record<string, unknown>
): Result<SlackList> {
  const list = _state().lists.find((l) => l.id === listId)
  if (!list) return { success: false, error: `List ${listId} not found` }
  const item = list.items.find((i) => i.id === itemId)
  if (!item) return { success: false, error: `List item ${itemId} not found` }
  item.values = { ...item.values, ...values }
  return { success: true, data: list }
}

export function deleteListItem(
  listId: string,
  itemId: string
): Result<SlackList> {
  const list = _state().lists.find((l) => l.id === listId)
  if (!list) return { success: false, error: `List ${listId} not found` }
  list.items = list.items.filter((i) => i.id !== itemId)
  return { success: true, data: list }
}

export function deleteList(id: string): Result {
  const s = _state()
  s.lists = s.lists.filter((l) => l.id !== id)
  for (const channel of s.channels) {
    channel.listIds = channel.listIds.filter((lid) => lid !== id)
  }
  return { success: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export function getWorkflows(channelId?: string): Workflow[] {
  const all = _state().workflows
  if (!channelId) return all
  return all.filter((w) => w.channelId === channelId)
}

export function createWorkflow(fields: {
  channelId?: string | null
  name: string
  trigger: Workflow["trigger"]
}): Result<Workflow> {
  const s = _state()
  const workflow: Workflow = {
    id: `wf-${s.nextWorkflowId++}`,
    channelId: fields.channelId ?? null,
    name: fields.name,
    trigger: fields.trigger,
    isEnabled: true,
    runCount: 0,
    lastRunAt: null,
  }
  s.workflows.push(workflow)
  if (workflow.channelId) {
    const channel = s.channels.find((c) => c.id === workflow.channelId)
    if (channel) channel.workflowIds.push(workflow.id)
  }
  return { success: true, data: workflow }
}

export function enableWorkflow(id: string): Result<Workflow> {
  const wf = _state().workflows.find((w) => w.id === id)
  if (!wf) return { success: false, error: `Workflow ${id} not found` }
  wf.isEnabled = true
  return { success: true, data: wf }
}

export function disableWorkflow(id: string): Result<Workflow> {
  const wf = _state().workflows.find((w) => w.id === id)
  if (!wf) return { success: false, error: `Workflow ${id} not found` }
  wf.isEnabled = false
  return { success: true, data: wf }
}

// ---------------------------------------------------------------------------
// Huddles
// ---------------------------------------------------------------------------

export function getHuddles(activeOnly?: boolean): Huddle[] {
  const all = _state().huddles
  if (activeOnly) return all.filter((h) => h.endedAt === null)
  return all
}

export function startHuddle(fields: {
  channelId?: string | null
  dmId?: string | null
  topic?: string
}): Result<Huddle> {
  const s = _state()
  if (!fields.channelId && !fields.dmId)
    return {
      success: false,
      error: `Either channelId or dmId is required`,
    }
  const huddle: Huddle = {
    id: `hud-${s.nextHuddleId++}`,
    channelId: fields.channelId ?? null,
    dmId: fields.dmId ?? null,
    startedBy: CURRENT_USER_ID,
    startedAt: now(),
    endedAt: null,
    participantIds: [CURRENT_USER_ID],
    topic: fields.topic ?? "",
  }
  s.huddles.push(huddle)
  if (fields.channelId) {
    const channel = s.channels.find((c) => c.id === fields.channelId)
    if (channel) channel.huddleActive = true
  }
  return { success: true, data: huddle }
}

export function endHuddle(id: string): Result<Huddle> {
  const s = _state()
  const huddle = s.huddles.find((h) => h.id === id)
  if (!huddle) return { success: false, error: `Huddle ${id} not found` }
  if (huddle.endedAt !== null)
    return { success: false, error: `Huddle already ended` }
  huddle.endedAt = now()
  if (huddle.channelId) {
    const channel = s.channels.find((c) => c.id === huddle.channelId)
    if (channel) channel.huddleActive = false
  }
  s.callHistory.push({
    id: `call-${s.nextCallId++}`,
    type: "huddle",
    startedAt: huddle.startedAt,
    endedAt: huddle.endedAt,
    participantIds: huddle.participantIds,
    channelId: huddle.channelId,
    dmId: huddle.dmId,
  })
  return { success: true, data: huddle }
}

export function joinHuddle(id: string, userId?: string): Result<Huddle> {
  const huddle = _state().huddles.find((h) => h.id === id)
  if (!huddle) return { success: false, error: `Huddle ${id} not found` }
  if (huddle.endedAt !== null)
    return { success: false, error: `Huddle has ended` }
  const uid = userId ?? CURRENT_USER_ID
  if (!huddle.participantIds.includes(uid)) huddle.participantIds.push(uid)
  return { success: true, data: huddle }
}

export function getCallHistory(): Call[] {
  return _state().callHistory
}

// ---------------------------------------------------------------------------
// Reset — restores everything in the current session to initial state.
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  resetState(_state(), seed)
}
