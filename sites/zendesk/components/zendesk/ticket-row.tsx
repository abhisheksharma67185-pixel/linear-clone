import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Ticket, User } from "@/app/lib/mock-data"

interface TicketRowProps {
  ticket: Ticket
  requester: User | undefined
  // Pre-computed "-13h" / "-2d" pill from server-rendered timestamps so the
  // row stays a server component.
  agePill: { label: string; tone: "danger" | "warn" | "muted" }
}

const STATUS_LABEL: Record<Ticket["status"], string> = {
  new: "New",
  open: "Open",
  pending: "Pending",
  "on-hold": "On-hold",
  solved: "Solved",
  closed: "Closed",
}

const STATUS_TONE: Record<Ticket["status"], string> = {
  new: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  open: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "on-hold": "bg-muted text-muted-foreground",
  solved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  closed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-200",
}

const AGE_TONE: Record<TicketRowProps["agePill"]["tone"], string> = {
  danger: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  muted: "bg-muted text-muted-foreground",
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  if (sameDay) return `Today ${time}`
  return (
    date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }) + ` ${time}`
  )
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TicketRow({ ticket, requester, agePill }: TicketRowProps) {
  const requesterName = requester?.name ?? "Customer"
  const initials = initialsOf(requesterName)
  return (
    <article className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
      <Avatar className="mt-0.5 size-8 ring-2 ring-emerald-400">
        <AvatarFallback className="bg-emerald-100 text-[11px] font-semibold text-emerald-900">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-medium text-foreground">
            <span className="text-muted-foreground">{requesterName} | </span>
            {ticket.subject}
          </h3>
          <Badge
            variant="secondary"
            className={cn("h-5 px-1.5 text-[11px]", AGE_TONE[agePill.tone])}
          >
            {agePill.label}
          </Badge>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Badge
            variant="secondary"
            className={cn(
              "h-5 shrink-0 px-1.5 text-[11px] tracking-wide uppercase",
              STATUS_TONE[ticket.status]
            )}
          >
            {STATUS_LABEL[ticket.status]}
          </Badge>
          <p className="line-clamp-1 min-w-0 flex-1">{ticket.description}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatTimestamp(ticket.updatedAt)} | #{ticket.number}
        </div>
      </div>
    </article>
  )
}
