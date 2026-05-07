"use client"

import { useCallback, useEffect, useState } from "react"
import { Hash, Lock, MoreHorizontal, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageItem } from "./message-item"
import { Composer } from "./composer"
import { useThreadPanel } from "./thread-panel-provider"
import { toast } from "sonner"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
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

type Channel = {
  id: string
  name: string
  type: "public" | "private"
}

const CURRENT_USER_ID = "usr-1"

export function ThreadPanel() {
  const { rootId, close } = useThreadPanel()
  const [root, setRoot] = useState<Message | null>(null)
  const [replies, setReplies] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [channel, setChannel] = useState<Channel | null>(null)
  const [broadcast, setBroadcast] = useState(false)

  const load = useCallback(async () => {
    if (!rootId) return
    const [rootRes, repliesRes, usersRes] = await Promise.all([
      fetch(`/api/data/messages/${rootId}`),
      fetch(`/api/data/messages?threadRootId=${rootId}`),
      fetch("/api/data/users"),
    ])
    let parent: Message | null = null
    if (rootRes.ok) {
      parent = (await rootRes.json()) as Message
      setRoot(parent)
    }
    if (repliesRes.ok) setReplies(await repliesRes.json())
    if (usersRes.ok) setUsers(await usersRes.json())

    // If the parent message lives in a channel, fetch the channel record
    // so the header subtitle + "Also send to" label show its real name.
    if (parent?.channelId) {
      const all = await fetch("/api/data/channels").then((r) => r.json())
      const ch = (all as Channel[]).find((c) => c.id === parent!.channelId)
      setChannel(ch ?? null)
    } else {
      setChannel(null)
    }
  }, [rootId])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (rootId) {
      load()
    } else {
      setRoot(null)
      setReplies([])
    }
  }, [rootId, load])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!rootId || !root) return null

  const handleReplySend = async (
    text: string,
    attachments: { localId: string; type: string; name: string; url: string }[]
  ) => {
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: root.channelId ?? undefined,
        dmId: root.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text,
        threadRootId: rootId,
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
      await load()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to reply")
    }
  }

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const all = [root, ...replies]
    const message = all.find((m) => m.id === messageId)
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
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: mine
        ? undefined
        : JSON.stringify({ emoji, userId: CURRENT_USER_ID }),
    })
    load()
  }

  // Picker delegates each pick to toggleReaction so existing reactions are
  // removed on a second pick (Slack-like behavior).
  const handleAddReaction = handleToggleReaction

  const handleSave = async (messageId: string) => {
    await fetch(`/api/data/messages/${messageId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: CURRENT_USER_ID }),
    })
    toast.success("Saved to Later")
  }

  const handleEdit = async (messageId: string) => {
    const all = [root, ...replies]
    const message = all.find((m) => m.id === messageId)
    if (!message) return
    const next = window.prompt("Edit message", message.text)
    if (next === null || next.trim() === "") return
    await fetch(`/api/data/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: next }),
    })
    load()
  }

  const handleDelete = async (messageId: string) => {
    if (!window.confirm("Delete this message?")) return
    await fetch(`/api/data/messages/${messageId}`, { method: "DELETE" })
    load()
  }

  const ChannelIcon = channel?.type === "private" ? Lock : Hash

  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-l border-border bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between gap-1 border-b border-border px-3">
        <div className="flex min-w-0 flex-col">
          <div className="text-sm leading-none font-bold">Thread</div>
          {channel ? (
            <div className="mt-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
              <ChannelIcon className="size-3" />
              <span className="truncate">{channel.name}</span>
            </div>
          ) : root.dmId ? (
            <div className="mt-0.5 text-xs text-muted-foreground">
              Direct message
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                  onClick={() => toast.info("AI thread summary coming soon")}
                  aria-label="Summarize thread"
                >
                  <Sparkles className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Summarize thread</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                  aria-label="Thread actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Followed thread")}>
                Follow thread
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Marked unread")}>
                Mark unread
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(`thread-${root.id}`)
                    .then(() => toast.success("Link copied"))
                    .catch(() => toast.error("Copy failed"))
                }}
              >
                Copy link to thread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={close}>Close thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={close}
            aria-label="Close thread"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1">
        <div className="py-2">
          <MessageItem
            message={root}
            author={users.find((u) => u.id === root.authorId)}
            users={users}
            compact={false}
            onToggleReaction={(emoji) => handleToggleReaction(root.id, emoji)}
            onAddReaction={(emoji) => handleAddReaction(root.id, emoji)}
            onSave={() => handleSave(root.id)}
            onForward={() => toast.info("Forward — pick destination")}
            onEdit={() => handleEdit(root.id)}
            onDelete={() => handleDelete(root.id)}
          />
          <Separator className="my-2" />
          <div className="px-5 text-xs font-semibold text-muted-foreground">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </div>
          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              author={users.find((u) => u.id === reply.authorId)}
              users={users}
              compact={false}
              onToggleReaction={(emoji) =>
                handleToggleReaction(reply.id, emoji)
              }
              onAddReaction={(emoji) => handleAddReaction(reply.id, emoji)}
              onSave={() => handleSave(reply.id)}
              onForward={() => toast.info("Forward — pick destination")}
              onEdit={() => handleEdit(reply.id)}
              onDelete={() => handleDelete(reply.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="shrink-0">
        <Composer placeholder="Reply…" onSend={handleReplySend} compact />
        {channel ? (
          <label className="mx-4 mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={broadcast}
              onCheckedChange={(v) => setBroadcast(v === true)}
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
    </aside>
  )
}
