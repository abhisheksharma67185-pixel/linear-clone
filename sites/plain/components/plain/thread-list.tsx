"use client"

import * as React from "react"
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconPencilPlus,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type { Customer, Thread } from "@/app/lib/mock-data"
import { ThreadRow } from "./thread-row"

const FILTER_PILLS = [
  { id: "all", label: "All" },
  { id: "you", label: "Assigned to you" },
  { id: "urgent", label: "Urgent" },
  { id: "unassigned", label: "Unassigned" },
] as const

type FilterId = (typeof FILTER_PILLS)[number]["id"]

const VIEW_TITLES: Record<string, string> = {
  inbox: "Inbox",
  snoozed: "Snoozed",
  done: "Done",
  customers: "Customers",
  search: "Search",
}

export function ThreadList({
  view,
  threads,
  customersById,
  selectedThreadId,
  onSelectThread,
  currentAgentId,
}: {
  view: string
  threads: Thread[]
  customersById: Map<string, Customer>
  selectedThreadId: string | null
  onSelectThread: (id: string) => void
  currentAgentId: string
}) {
  const [filter, setFilter] = React.useState<FilterId>("all")

  const filtered = React.useMemo(() => {
    if (filter === "you")
      return threads.filter((t) => t.assigneeId === currentAgentId)
    if (filter === "urgent")
      return threads.filter((t) => t.priority === "urgent")
    if (filter === "unassigned") return threads.filter((t) => !t.assigneeId)
    return threads
  }, [threads, filter, currentAgentId])

  const sorted = React.useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [filtered]
  )

  return (
    <section className="flex w-[380px] shrink-0 flex-col border-r border-border/60">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">
              {VIEW_TITLES[view] ?? "Inbox"}
            </h1>
            <Badge
              variant="secondary"
              className="h-5 rounded-md bg-muted px-1.5 font-mono text-[10px] text-muted-foreground"
            >
              {sorted.length}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Filter options"
                  >
                    <IconAdjustmentsHorizontal className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Filter</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="New thread"
                  >
                    <IconPencilPlus className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>New thread</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {FILTER_PILLS.map((p) => {
            const active = filter === p.id
            return (
              <button
                key={p.id}
                onClick={() => setFilter(p.id)}
                data-active={active}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-full border border-border/50 bg-transparent px-2 text-[11px] font-medium text-muted-foreground transition-colors",
                  "hover:bg-muted/60 hover:text-foreground",
                  "data-[active=true]:border-foreground/50 data-[active=true]:bg-foreground/10 data-[active=true]:text-foreground"
                )}
              >
                {p.label}
                {p.id === "all" && (
                  <IconChevronDown className="size-3 opacity-50" />
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Thread rows */}
      <ScrollArea className="flex-1">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-2 text-sm font-medium text-foreground">
              No threads
            </div>
            <p className="text-xs text-muted-foreground">
              Nothing matches the current filter.
            </p>
          </div>
        ) : (
          sorted.map((t) => (
            <ThreadRow
              key={t.id}
              thread={t}
              customer={customersById.get(t.customerId)}
              isActive={t.id === selectedThreadId}
              onSelect={() => onSelectThread(t.id)}
            />
          ))
        )}
      </ScrollArea>
    </section>
  )
}
