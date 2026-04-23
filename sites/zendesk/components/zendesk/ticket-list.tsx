import { IconChevronDown, IconArrowsSort } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TicketRow } from "@/components/zendesk/ticket-row"
import type { Ticket, User } from "@/app/lib/mock-data"

interface TicketListProps {
  tickets: Ticket[]
  usersById: Record<string, User>
}

function agePill(updatedAt: string): {
  label: string
  tone: "danger" | "warn" | "muted"
} {
  const diffMs = Date.now() - new Date(updatedAt).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return { label: "-now", tone: "muted" }
  if (hours < 24) {
    const tone = hours >= 12 ? "danger" : hours >= 4 ? "warn" : "muted"
    return { label: `-${hours}h`, tone }
  }
  const days = Math.floor(hours / 24)
  return { label: `-${days}d`, tone: "danger" }
}

export function TicketList({ tickets, usersById }: TicketListProps) {
  return (
    <Card className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-sm font-medium text-foreground">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Status
            <IconChevronDown data-icon="inline-end" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Channel
            <IconChevronDown data-icon="inline-end" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Recommended
            <IconArrowsSort data-icon="inline-end" />
          </Button>
        </div>
      </header>
      <Separator />
      <div className="flex flex-col">
        {tickets.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No tickets in this view.
          </p>
        ) : (
          tickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              requester={usersById[ticket.requesterId]}
              agePill={agePill(ticket.updatedAt)}
            />
          ))
        )}
      </div>
    </Card>
  )
}
