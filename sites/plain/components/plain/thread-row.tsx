"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import type { Customer, Thread } from "@/app/lib/mock-data"
import { StatusPill } from "./status-pill"

function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  const diff = (now.getTime() - then.getTime()) / 1000
  if (diff < 60) return "now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function ThreadRow({
  thread,
  customer,
  isActive,
  onSelect,
}: {
  thread: Thread
  customer: Customer | undefined
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      data-active={isActive}
      className={cn(
        "group flex w-full items-start gap-3 border-b border-border/40 px-3 py-3 text-left transition-colors",
        "hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:outline-none",
        "data-[active=true]:bg-muted/60"
      )}
    >
      <Avatar className="mt-0.5 size-7">
        <AvatarFallback className="bg-foreground/10 text-[10px] font-medium text-foreground">
          {customer?.initials ?? "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {customer?.fullName ?? "Unknown"}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {formatRelativeTime(thread.updatedAt)}
          </span>
        </div>
        <div className="line-clamp-1 text-sm text-foreground/90">
          {thread.title}
        </div>
        <div className="line-clamp-1 text-xs text-muted-foreground">
          {thread.preview}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <StatusPill
            status={thread.status}
            className="h-4.5 px-1.5 text-[10px]"
          />
          {thread.priority === "urgent" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-1.5 py-0 text-[10px] font-medium text-rose-700 dark:text-rose-400">
              Urgent
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
