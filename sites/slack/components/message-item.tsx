"use client"

import { MessageSquare } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { ReactionBar, emojiFor } from "./reaction-bar"
import { MessageToolbar } from "./message-toolbar"
import { useThreadPanel } from "./thread-panel-provider"
import { useForwardMessage } from "./forward-message-provider"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
}

type Reaction = { emoji: string; userIds: string[] }
type Attachment = {
  id: string
  type: "file" | "image" | "link"
  name: string
  url: string
}

type Message = {
  id: string
  authorId: string
  text: string
  reactions: Reaction[]
  attachments: Attachment[]
  createdAt: string
  editedAt: string | null
  isDeleted: boolean
  threadRootId: string | null
  threadReplyCount: number
  threadParticipantIds: string[]
  mentions: string[]
}

const CURRENT_USER_ID = "usr-1"

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function renderInline(text: string, users: User[]): React.ReactNode {
  // Replace @user-id mentions and :emoji: shortcodes inline
  const parts: React.ReactNode[] = []
  const regex = /(@usr-\d+|:[a-z0-9_+-]+:)/gi
  let lastIndex = 0
  let match: RegExpExecArray | null
  let idx = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith("@")) {
      const user = users.find((u) => u.id === token.slice(1))
      parts.push(
        <span
          key={`m-${idx++}`}
          className="rounded bg-primary/15 px-1 font-semibold text-primary"
        >
          @{user?.displayName ?? token.slice(1)}
        </span>
      )
    } else {
      parts.push(
        <span key={`e-${idx++}`} className="text-base">
          {emojiFor(token)}
        </span>
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export function MessageItem({
  message,
  author,
  users,
  compact,
  onToggleReaction,
  onAddReaction,
  onSave,
  onForward,
  onEdit,
  onDelete,
}: {
  message: Message
  author: User | undefined
  users: User[]
  compact: boolean
  onToggleReaction: (emoji: string) => void
  // Receives the picked emoji shortcode (`:tada:`, `:+1:`, etc.) chosen
  // from the picker. Pages typically forward to onToggleReaction.
  onAddReaction: (emoji: string) => void
  onSave: () => void
  // Optional — when omitted, the toolbar opens the global forward dialog.
  // Pages can pass a custom handler for special-case behavior.
  onForward?: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { open } = useThreadPanel()
  const { openForward } = useForwardMessage()
  if (message.isDeleted) {
    return (
      <div className="group relative flex gap-3 px-5 py-1 text-muted-foreground italic">
        {compact ? <div className="w-9" /> : null}
        This message was deleted.
      </div>
    )
  }
  const canEdit = message.authorId === CURRENT_USER_ID

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-5 hover:bg-muted/40",
        compact ? "py-0.5" : "pt-2 pb-1"
      )}
    >
      {compact ? (
        <div className="flex w-9 shrink-0 justify-end pt-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
          {formatTime(message.createdAt)}
        </div>
      ) : (
        <UserAvatar
          name={author?.name ?? "Unknown"}
          src={author?.avatar}
          presence={author?.presence}
          size="md"
          showPresence={false}
          className="shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        {!compact ? (
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">
              {author?.name ?? "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
          </div>
        ) : null}
        <div className="text-[15px] leading-relaxed text-foreground">
          {renderInline(message.text, users)}
          {message.editedAt ? (
            <span className="ml-1 text-[11px] text-muted-foreground">
              (edited)
            </span>
          ) : null}
        </div>
        {message.attachments.length > 0 ? (
          <div className="mt-1 flex flex-col gap-1">
            {message.attachments.map((a) => (
              <div
                key={a.id}
                className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-xs"
              >
                📎 {a.name}
              </div>
            ))}
          </div>
        ) : null}
        <ReactionBar
          reactions={message.reactions}
          currentUserId={CURRENT_USER_ID}
          onToggle={onToggleReaction}
        />
        {message.threadReplyCount > 0 ? (
          <button
            type="button"
            onClick={() => open(message.id)}
            className="mt-1 flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-xs font-semibold text-primary hover:border-border hover:bg-background"
          >
            <MessageSquare className="size-3.5" />
            {message.threadReplyCount}{" "}
            {message.threadReplyCount === 1 ? "reply" : "replies"}
            <span className="font-normal text-muted-foreground">
              View thread
            </span>
          </button>
        ) : null}
      </div>
      <MessageToolbar
        onReact={onAddReaction}
        onReplyInThread={() => open(message.id)}
        onSave={onSave}
        onForward={onForward ?? (() => openForward(message.id))}
        onEdit={onEdit}
        onDelete={onDelete}
        canEdit={canEdit}
      />
    </div>
  )
}
