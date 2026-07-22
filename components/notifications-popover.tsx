"use client"

/**
 * Notifications bell + popover. Used in the team-issues page header
 * (and re-usable on any page that wants notifications).
 *
 * The bell renders an unread-count badge derived from the items
 * passed in. Clicking it opens a Base UI Popover that lists recent
 * notifications, or an "all caught up" empty state when there are
 * no items. Both states are tagged with stable `data-testid` hooks
 * so the e2e can assert behavior without scraping copy.
 *
 * Items are passed in by the parent (instead of fetched here) so
 * the page owns the data source — easier to swap from mock to API.
 */
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification01Icon } from "@hugeicons/core-free-icons"

export interface NotificationItem {
  id: string
  /** Short, human-readable label. */
  title: string
  /** Optional secondary line (e.g. "ABH-12 · 2h ago"). */
  meta?: string
  /** Whether the user has seen this notification. */
  read: boolean
}

export function NotificationsPopover({
  items,
  ariaLabel = "Notifications",
  side = "bottom",
  align = "end",
}: {
  items: NotificationItem[]
  ariaLabel?: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const unreadCount = items.filter((i) => !i.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            data-testid="notifications-bell"
            aria-label={
              unreadCount > 0
                ? `${ariaLabel} (${unreadCount} unread)`
                : ariaLabel
            }
            aria-haspopup="dialog"
            className="text-muted-foreground hover:text-foreground relative inline-flex size-7 items-center justify-center rounded-md"
          >
            <HugeiconsIcon icon={Notification01Icon} className="size-4" />
            {unreadCount > 0 && (
              <span
                data-testid="notifications-unread-badge"
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-semibold text-white tabular-nums"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        }
      />
      <PopoverContent
        side={side}
        align={align}
        sideOffset={6}
        data-testid="notifications-popover"
        className="w-80 gap-0 p-0"
      >
        <div className="border-border flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {unreadCount} unread
            </span>
          )}
        </div>
        {items.length === 0 ? (
          <div
            data-testid="notifications-empty"
            className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-3 py-10 text-xs"
          >
            <HugeiconsIcon
              icon={Notification01Icon}
              className="size-6 opacity-40"
            />
            <p>You&apos;re all caught up</p>
          </div>
        ) : (
          <ul
            data-testid="notifications-list"
            className="max-h-80 overflow-y-auto"
          >
            {items.map((item) => (
              <li
                key={item.id}
                data-testid={`notification-${item.id}`}
                data-unread={!item.read}
                className="hover:bg-accent/50 border-border/50 flex flex-col gap-0.5 border-b px-3 py-2 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  {!item.read && (
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full bg-violet-500"
                    />
                  )}
                  <span className="text-sm">{item.title}</span>
                </div>
                {item.meta && (
                  <span className="text-muted-foreground ml-3 text-[11px]">
                    {item.meta}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
