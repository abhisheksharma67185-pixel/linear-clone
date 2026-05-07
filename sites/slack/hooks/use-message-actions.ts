"use client"

import { useCallback } from "react"
import { toast } from "sonner"

// Minimal shape we need to decide if the current user already reacted with
// a given emoji. Pages typically have richer Message types — they pass them
// through unchanged.
type MessageWithReactions = {
  id: string
  text?: string
  reactions: { emoji: string; userIds: string[] }[]
}

const CURRENT_USER_ID = "usr-1"

/**
 * Wraps the message-action HTTP calls used by /c/[name], /dm/[id], the
 * thread panel, /threads, and channel/pins. Single source of truth so the
 * handlers stay in sync and don't drift back into stubs.
 *
 * The caller passes `getMessages` (a function returning the current array)
 * + `refetch` (called after each mutation succeeds). Handlers take a
 * messageId and an emoji where relevant; refetch fires only on success so
 * a failed mutation doesn't blank the list.
 */
export function useMessageActions<T extends MessageWithReactions>({
  getMessages,
  refetch,
  userId = CURRENT_USER_ID,
}: {
  getMessages: () => T[]
  refetch: () => void | Promise<void>
  userId?: string
}) {
  const onToggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const message = getMessages().find((m) => m.id === messageId)
      if (!message) return
      const mine = message.reactions
        .find((r) => r.emoji === emoji)
        ?.userIds.includes(userId)
      const method = mine ? "DELETE" : "POST"
      const url = `/api/data/messages/${messageId}/reactions${
        mine ? `?emoji=${encodeURIComponent(emoji)}&userId=${userId}` : ""
      }`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: mine ? undefined : JSON.stringify({ emoji, userId }),
      })
      if (res.ok) await refetch()
    },
    [getMessages, refetch, userId]
  )

  const onAddReaction = useCallback(
    (messageId: string) => onToggleReaction(messageId, ":+1:"),
    [onToggleReaction]
  )

  const onSave = useCallback(
    async (messageId: string) => {
      const res = await fetch(`/api/data/messages/${messageId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success("Saved to Later")
        await refetch()
      }
    },
    [refetch, userId]
  )

  const onForward = useCallback(async (messageId: string) => {
    // Lightweight stub: real forwarding needs a destination picker. For now
    // we just acknowledge — pages can override if they need richer behavior.
    toast.info(`Forward ${messageId} — select destination`)
  }, [])

  const onEdit = useCallback(
    async (messageId: string) => {
      const message = getMessages().find((m) => m.id === messageId)
      if (!message) return
      const next = window.prompt("Edit message", message.text ?? "")
      if (next === null || next.trim() === "") return
      const res = await fetch(`/api/data/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: next }),
      })
      if (res.ok) await refetch()
    },
    [getMessages, refetch]
  )

  const onDelete = useCallback(
    async (messageId: string) => {
      if (!window.confirm("Delete this message?")) return
      const res = await fetch(`/api/data/messages/${messageId}`, {
        method: "DELETE",
      })
      if (res.ok) await refetch()
    },
    [refetch]
  )

  return {
    onToggleReaction,
    onAddReaction,
    onSave,
    onForward,
    onEdit,
    onDelete,
  }
}
