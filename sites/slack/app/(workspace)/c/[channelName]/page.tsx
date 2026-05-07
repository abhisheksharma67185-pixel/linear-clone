"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChannelHeader } from "@/components/channel-header"
import { ChannelBookmarksBar } from "@/components/channel-bookmarks-bar"
import { MessageList } from "@/components/message-list"
import { Composer } from "@/components/composer"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Hash, MessageSquare } from "lucide-react"
import { toast } from "sonner"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
}

type Channel = {
  id: string
  name: string
  topic: string
  purpose: string
  type: "public" | "private"
  isArchived: boolean
  isShared: boolean
  memberIds: string[]
  pinnedMessageIds: string[]
  bookmarkIds: string[]
}

type Message = {
  id: string
  authorId: string
  text: string
  reactions: { emoji: string; userIds: string[] }[]
  attachments: {
    id: string
    type: "file" | "image" | "link"
    name: string
    url: string
  }[]
  createdAt: string
  editedAt: string | null
  isDeleted: boolean
  threadRootId: string | null
  threadReplyCount: number
  threadParticipantIds: string[]
  mentions: string[]
}

type Bookmark = {
  id: string
  title: string
  url: string
  emoji: string
}

const CURRENT_USER_ID = "usr-1"

export default function ChannelPage() {
  const params = useParams<{ channelName: string }>()
  const channelName = params.channelName
  const [channel, setChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadChannel = useCallback(async () => {
    const [chRes, usersRes] = await Promise.all([
      fetch(`/api/data/channels/${channelName}`),
      fetch("/api/data/users"),
    ])
    if (!chRes.ok) {
      setNotFound(true)
      setLoading(false)
      return
    }
    const ch = (await chRes.json()) as Channel
    const u = (await usersRes.json()) as User[]
    setChannel(ch)
    setUsers(u)
    const [msgRes, bmRes] = await Promise.all([
      fetch(`/api/data/messages?channelId=${ch.id}`),
      fetch(`/api/data/channels/${ch.name}/bookmarks`),
    ])
    setMessages((await msgRes.json()) as Message[])
    setBookmarks((await bmRes.json()) as Bookmark[])
    setLoading(false)
    // Mark read
    fetch(`/api/data/read-states/channel/${ch.id}?userId=${CURRENT_USER_ID}`, {
      method: "POST",
    })
  }, [channelName])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    loadChannel()
  }, [loadChannel])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSend = async (
    text: string,
    attachments: { localId: string; type: string; name: string; url: string }[]
  ) => {
    if (!channel) return
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: channel.id,
        authorId: CURRENT_USER_ID,
        text,
        attachments: attachments.map((a) => ({
          id: a.localId,
          type: a.type,
          name: a.name,
          url: a.url,
        })),
      }),
    })
    if (res.ok) {
      await loadChannel()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to send message")
    }
  }

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (!message) return
    const mine = message.reactions
      .find((r) => r.emoji === emoji)
      ?.userIds.includes(CURRENT_USER_ID)
    const method = mine ? "DELETE" : "POST"
    const url = `/api/data/messages/${messageId}/reactions${
      mine
        ? `?emoji=${encodeURIComponent(emoji)}&userId=${CURRENT_USER_ID}`
        : ""
    }`
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: mine
        ? undefined
        : JSON.stringify({ emoji, userId: CURRENT_USER_ID }),
    })
    if (res.ok) loadChannel()
  }

  // Picker delegates each pick to toggleReaction so existing reactions are
  // removed on a second pick (Slack-like behavior).
  const handleAddReaction = handleToggleReaction

  const handleSave = async (messageId: string) => {
    const res = await fetch(`/api/data/messages/${messageId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: CURRENT_USER_ID }),
    })
    if (res.ok) toast.success("Saved to Later")
  }

  const handleForward = async (messageId: string) => {
    toast.info(`Forward ${messageId} — select destination`)
  }

  const handleEdit = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (!message) return
    const next = window.prompt("Edit message", message.text)
    if (next === null || next.trim() === "") return
    const res = await fetch(`/api/data/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: next }),
    })
    if (res.ok) loadChannel()
  }

  const handleDelete = async (messageId: string) => {
    if (!window.confirm("Delete this message?")) return
    const res = await fetch(`/api/data/messages/${messageId}`, {
      method: "DELETE",
    })
    if (res.ok) loadChannel()
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (notFound || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Hash />
            </EmptyMedia>
            <EmptyTitle>Channel not found</EmptyTitle>
            <EmptyDescription>
              The channel #{channelName} does not exist in this workspace.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <ChannelHeader channel={channel} />
      <ChannelBookmarksBar bookmarks={bookmarks} />
      <MessageList
        messages={messages}
        users={users}
        onToggleReaction={handleToggleReaction}
        onAddReaction={handleAddReaction}
        onSaveMessage={handleSave}
        onForwardMessage={handleForward}
        onEditMessage={handleEdit}
        onDeleteMessage={handleDelete}
        emptyState={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>No messages yet</EmptyTitle>
              <EmptyDescription>
                Be the first to send a message in #{channel.name}.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
      {channel.isArchived ? (
        <div className="mx-4 mb-4 rounded-md border border-border bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
          This channel is archived. You can&apos;t post new messages.
        </div>
      ) : (
        <Composer
          placeholder={`Message #${channel.name}`}
          onSend={handleSend}
        />
      )}
    </>
  )
}
