"use client"

import { useCallback, useEffect, useState } from "react"
import { Hash, Lock, MessageSquare } from "lucide-react"
import { MessageItem } from "@/components/message-item"
import { Composer } from "@/components/composer"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useMessageActions } from "@/hooks/use-message-actions"
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
  type: "public" | "private"
}

type DirectMessage = {
  id: string
  participantIds: string[]
  isGroup: boolean
}

type Message = {
  id: string
  channelId: string | null
  dmId: string | null
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

type ThreadGroup = {
  root: Message
  replies: Message[]
}

const CURRENT_USER_ID = "usr-1"

export default function ThreadsPage() {
  const [groups, setGroups] = useState<ThreadGroup[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [broadcastByRoot, setBroadcastByRoot] = useState<
    Record<string, boolean>
  >({})

  const load = useCallback(async () => {
    const [msgs, u, c, d]: [Message[], User[], Channel[], DirectMessage[]] =
      await Promise.all([
        fetch("/api/data/messages").then((r) => r.json()),
        fetch("/api/data/users").then((r) => r.json()),
        fetch("/api/data/channels").then((r) => r.json()),
        fetch("/api/data/dms").then((r) => r.json()),
      ])

    // A thread is "active for me" if I authored the root, replied to it, or
    // was mentioned in the root and it has at least one reply. This mirrors
    // the set of threads Slack surfaces in its Threads tab.
    const myRoots = new Set<string>()
    for (const m of msgs) {
      if (m.threadRootId && m.authorId === CURRENT_USER_ID) {
        myRoots.add(m.threadRootId)
      }
    }
    for (const m of msgs) {
      if (
        m.threadReplyCount > 0 &&
        (m.authorId === CURRENT_USER_ID || m.mentions.includes(CURRENT_USER_ID))
      ) {
        myRoots.add(m.id)
      }
    }
    const rootById = new Map<string, Message>()
    for (const m of msgs) if (myRoots.has(m.id)) rootById.set(m.id, m)
    const repliesByRoot = new Map<string, Message[]>()
    for (const m of msgs) {
      if (m.threadRootId && rootById.has(m.threadRootId)) {
        const arr = repliesByRoot.get(m.threadRootId) ?? []
        arr.push(m)
        repliesByRoot.set(m.threadRootId, arr)
      }
    }
    const out: ThreadGroup[] = []
    for (const root of rootById.values()) {
      const replies = (repliesByRoot.get(root.id) ?? []).sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
      )
      out.push({ root, replies })
    }
    out.sort((a, b) => {
      const aLast =
        a.replies[a.replies.length - 1]?.createdAt ?? a.root.createdAt
      const bLast =
        b.replies[b.replies.length - 1]?.createdAt ?? b.root.createdAt
      return +new Date(bLast) - +new Date(aLast)
    })
    setGroups(out)
    setUsers(u)
    setChannels(c)
    setDms(d)
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Reuse the message-action helpers for each thread; they each operate
  // on the whole flattened message set so the messageId we pass in lands
  // on the right entity regardless of which thread card emitted it.
  const allMessages = groups.flatMap((g) => [g.root, ...g.replies])
  const actions = useMessageActions<Message>({
    getMessages: () => allMessages,
    refetch: load,
  })

  const sendReply = async (
    root: Message,
    text: string,
    attachments: { localId: string; type: string; name: string; url: string }[]
  ) => {
    const broadcast = broadcastByRoot[root.id] === true
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: root.channelId ?? undefined,
        dmId: root.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text,
        threadRootId: root.id,
        broadcastToChannel: broadcast,
        attachments: attachments.map((a) => ({
          id: a.localId,
          type: a.type,
          name: a.name,
          url: a.url,
        })),
      }),
    })
    if (res.ok) {
      load()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to reply")
    }
  }

  return (
    <>
      <header className="flex shrink-0 items-center border-b border-border bg-background px-6 py-3">
        <h1 className="text-base font-bold text-foreground">Threads</h1>
      </header>
      <ScrollArea className="min-h-0 flex-1 bg-muted/30">
        {groups.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>No threads yet</EmptyTitle>
              <EmptyDescription>
                When you reply to or are mentioned in a thread, it will show up
                here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-4">
            {groups.map((g) => (
              <ThreadCard
                key={g.root.id}
                group={g}
                users={users}
                channels={channels}
                dms={dms}
                broadcast={broadcastByRoot[g.root.id] === true}
                onBroadcastChange={(v) =>
                  setBroadcastByRoot((s) => ({ ...s, [g.root.id]: v }))
                }
                onSendReply={(text, atts) => sendReply(g.root, text, atts)}
                onToggleReaction={(messageId, emoji) =>
                  actions.onToggleReaction(messageId, emoji)
                }
                onSave={(messageId) => actions.onSave(messageId)}
                onForward={(messageId) => actions.onForward(messageId)}
                onEdit={(messageId) => actions.onEdit(messageId)}
                onDelete={(messageId) => actions.onDelete(messageId)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  )
}

function ThreadCard({
  group,
  users,
  channels,
  dms,
  broadcast,
  onBroadcastChange,
  onSendReply,
  onToggleReaction,
  onSave,
  onForward,
  onEdit,
  onDelete,
}: {
  group: ThreadGroup
  users: User[]
  channels: Channel[]
  dms: DirectMessage[]
  broadcast: boolean
  onBroadcastChange: (v: boolean) => void
  onSendReply: (
    text: string,
    attachments: { localId: string; type: string; name: string; url: string }[]
  ) => void | Promise<void>
  onToggleReaction: (messageId: string, emoji: string) => void
  onSave: (messageId: string) => void
  onForward: (messageId: string) => void
  onEdit: (messageId: string) => void
  onDelete: (messageId: string) => void
}) {
  const { root, replies } = group

  // Resolve the thread's "venue" — channel or DM — for the card header.
  const channel = root.channelId
    ? channels.find((c) => c.id === root.channelId)
    : null
  const dm = root.dmId ? dms.find((d) => d.id === root.dmId) : null
  const dmOther = dm
    ? users.find(
        (u) => u.id !== CURRENT_USER_ID && dm.participantIds.includes(u.id)
      )
    : null

  const ChannelIcon = channel?.type === "private" ? Lock : Hash

  // Participant names for the subtitle row, formatted "A, B, and you" the
  // way Slack does.
  const participantIds = Array.from(
    new Set([
      root.authorId,
      ...replies.map((r) => r.authorId),
      ...root.threadParticipantIds,
    ])
  )
  const otherNames = participantIds
    .filter((id) => id !== CURRENT_USER_ID)
    .map((id) => users.find((u) => u.id === id)?.name)
    .filter((n): n is string => Boolean(n))
  const isMember = participantIds.includes(CURRENT_USER_ID)
  const subtitle =
    otherNames.length === 0
      ? "Just you"
      : isMember
        ? `${otherNames.join(", ")}, and you`
        : otherNames.join(", ")

  return (
    <section className="flex flex-col gap-1">
      {/* Card header — venue (channel or DM) + participant subtitle */}
      <div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          {channel ? (
            <>
              <ChannelIcon className="size-4" />
              <span>{channel.name}</span>
            </>
          ) : dmOther ? (
            <>
              <span
                className={
                  dmOther.presence === "active"
                    ? "size-2 rounded-full bg-emerald-500"
                    : "size-2 rounded-full border border-muted-foreground"
                }
              />
              <span>{dmOther.name}</span>
            </>
          ) : (
            <span>Direct message</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>

      <div className="overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border">
        <div className="py-2">
          <MessageItem
            message={root}
            author={users.find((u) => u.id === root.authorId)}
            users={users}
            compact={false}
            onToggleReaction={(emoji) => onToggleReaction(root.id, emoji)}
            onAddReaction={(emoji) => onToggleReaction(root.id, emoji)}
            onSave={() => onSave(root.id)}
            onForward={() => onForward(root.id)}
            onEdit={() => onEdit(root.id)}
            onDelete={() => onDelete(root.id)}
          />
          {replies.map((r) => (
            <MessageItem
              key={r.id}
              message={r}
              author={users.find((u) => u.id === r.authorId)}
              users={users}
              compact={false}
              onToggleReaction={(emoji) => onToggleReaction(r.id, emoji)}
              onAddReaction={(emoji) => onToggleReaction(r.id, emoji)}
              onSave={() => onSave(r.id)}
              onForward={() => onForward(r.id)}
              onEdit={() => onEdit(r.id)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </div>

        {/* Inline reply composer — same component the channel uses, with the
            "Also send to" broadcast toggle when the thread lives in a
            channel. */}
        <div className="border-t border-border">
          <Composer
            placeholder="Reply…"
            onSend={async (text, attachments) => {
              await onSendReply(text, attachments)
            }}
            compact
          />
          {channel ? (
            <label className="mx-4 mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={broadcast}
                onCheckedChange={(v) => onBroadcastChange(v === true)}
              />
              <span className="flex items-center gap-1">
                Also send to
                <ChannelIcon className="size-3" />
                <span className="font-semibold text-foreground">
                  {channel.name}
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </div>
    </section>
  )
}
