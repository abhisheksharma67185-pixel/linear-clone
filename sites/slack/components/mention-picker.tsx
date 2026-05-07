"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AtSign, Megaphone } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  isBot?: boolean
  title?: string
}

export type MentionItem =
  | { kind: "user"; user: User; insert: string }
  | { kind: "broadcast"; key: "channel" | "here"; insert: string }

const CURRENT_USER_ID = "usr-1"

/**
 * Floating picker that opens when the user types `@` in a message composer.
 * The composer owns the text + cursor; this component just renders the
 * filtered list and reports which item the user selected back via
 * `onSelect`. Keyboard nav (arrows / enter / tab) is also handled here so
 * the composer doesn't need to grow that logic.
 */
export function MentionPicker({
  query,
  users,
  onSelect,
  onCancel,
  // The composer passes its keydown event-bus so we can intercept arrows /
  // enter / tab without duplicating listener wiring.
  registerKeydown,
}: {
  query: string
  users: User[]
  onSelect: (item: MentionItem) => void
  onCancel: () => void
  registerKeydown: (handler: (e: KeyboardEvent) => boolean) => () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo<MentionItem[]>(() => {
    const q = query.toLowerCase()
    const matches = (u: User) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)

    // Real Slack order: online non-bot non-self → offline → broadcast →
    // current user pinned at the bottom with "(you)".
    const online = users.filter(
      (u) =>
        u.id !== CURRENT_USER_ID &&
        !u.isBot &&
        u.presence === "active" &&
        matches(u)
    )
    const offline = users.filter(
      (u) =>
        u.id !== CURRENT_USER_ID &&
        !u.isBot &&
        u.presence !== "active" &&
        matches(u)
    )
    const broadcasts: MentionItem[] = []
    if (!q || "channel".includes(q)) {
      broadcasts.push({ kind: "broadcast", key: "channel", insert: "@channel" })
    }
    if (!q || "here".includes(q)) {
      broadcasts.push({ kind: "broadcast", key: "here", insert: "@here" })
    }
    const self = users.find((u) => u.id === CURRENT_USER_ID)

    return [
      ...online.map<MentionItem>((u) => ({
        kind: "user",
        user: u,
        insert: `@${u.displayName || u.name}`,
      })),
      ...offline.slice(0, 20 - online.length).map<MentionItem>((u) => ({
        kind: "user",
        user: u,
        insert: `@${u.displayName || u.name}`,
      })),
      ...broadcasts,
      ...(self && matches(self)
        ? [
            {
              kind: "user" as const,
              user: self,
              insert: `@${self.displayName || self.name}`,
            },
          ]
        : []),
    ].slice(0, 12)
  }, [query, users])

  // Reset selection when items change (e.g. user typed more characters).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setActiveIndex((i) => (i >= items.length ? 0 : i))
  }, [items.length])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keyboard nav. Returning true from the handler means "we consumed it,
  // composer should preventDefault" — that's how we hijack ↑/↓ from
  // breaking message navigation.
  useEffect(() => {
    return registerKeydown((e) => {
      if (items.length === 0) return false
      if (e.key === "ArrowDown") {
        setActiveIndex((i) => (i + 1) % items.length)
        return true
      }
      if (e.key === "ArrowUp") {
        setActiveIndex((i) => (i - 1 + items.length) % items.length)
        return true
      }
      if (e.key === "Enter" || e.key === "Tab") {
        const item = items[activeIndex]
        if (item) {
          onSelect(item)
          return true
        }
      }
      if (e.key === "Escape") {
        onCancel()
        return true
      }
      return false
    })
  }, [items, activeIndex, onSelect, onCancel, registerKeydown])

  // Scroll the highlighted item into view as the user navigates.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-mention-index="${activeIndex}"]`
    )
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  if (items.length === 0) return null

  return (
    <div className="absolute right-0 bottom-full left-0 z-30 mb-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
      <div ref={listRef} className="py-1">
        {items.map((item, idx) => (
          <Row
            key={
              item.kind === "user"
                ? `user-${item.user.id}`
                : `bcast-${item.key}`
            }
            item={item}
            active={idx === activeIndex}
            index={idx}
            onPick={() => onSelect(item)}
            onHover={() => setActiveIndex(idx)}
          />
        ))}
      </div>
    </div>
  )
}

function Row({
  item,
  active,
  index,
  onPick,
  onHover,
}: {
  item: MentionItem
  active: boolean
  index: number
  onPick: () => void
  onHover: () => void
}) {
  if (item.kind === "broadcast") {
    return (
      <button
        type="button"
        data-mention-index={index}
        onClick={onPick}
        onMouseEnter={onHover}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
          active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
        )}
      >
        <Megaphone
          className={cn(
            "size-4 shrink-0",
            active ? "text-primary-foreground" : "text-muted-foreground"
          )}
        />
        <span className="font-bold">@{item.key}</span>
        <span
          className={cn(
            "flex-1 text-xs",
            active ? "text-primary-foreground/85" : "text-muted-foreground"
          )}
        >
          {item.key === "channel"
            ? "Notify everyone in this channel."
            : "Notify every online member in this channel."}
        </span>
      </button>
    )
  }

  const u = item.user
  const isSelf = u.id === CURRENT_USER_ID
  return (
    <button
      type="button"
      data-mention-index={index}
      onClick={onPick}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
        active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
      )}
    >
      <UserAvatar
        name={u.name}
        src={u.avatar}
        presence={u.presence}
        size="xs"
        showPresence
      />
      <span className="truncate font-bold">{u.name}</span>
      {u.displayName && u.displayName !== u.name ? (
        <span
          className={cn(
            "truncate text-xs",
            active ? "text-primary-foreground/85" : "text-muted-foreground"
          )}
        >
          {u.displayName}
        </span>
      ) : null}
      {isSelf ? (
        <span
          className={cn(
            "ml-auto flex items-center gap-1 text-xs",
            active ? "text-primary-foreground/85" : "text-muted-foreground"
          )}
        >
          <AtSign className="size-3" />
          you
        </span>
      ) : null}
    </button>
  )
}
