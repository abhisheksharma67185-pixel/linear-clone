"use client"

import * as React from "react"
import {
  IconAlertTriangle,
  IconArrowsMinimize,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconDotsVertical,
  IconFlag,
  IconTag,
  IconUserPlus,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type {
  Agent,
  Customer,
  Label,
  Message,
  Tenant,
  Thread,
} from "@/app/lib/mock-data"
import { Composer } from "./composer"
import { Kbd } from "./kbd"
import { LabelChip } from "./label-chip"
import { StatusPill } from "./status-pill"

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ThreadDetail({
  thread,
  customer,
  tenant,
  assignee,
  agents,
  labels,
  messages,
  onToggleProfile,
}: {
  thread: Thread | null
  customer: Customer | undefined
  tenant: Tenant | undefined
  assignee: Agent | undefined
  agents: Agent[]
  labels: Label[]
  messages: Message[]
  onToggleProfile: () => void
}) {
  if (!thread) {
    return (
      <section className="flex flex-1 items-center justify-center bg-background">
        <div className="text-center text-sm text-muted-foreground">
          Select a thread to get started.
        </div>
      </section>
    )
  }

  const labelMap = new Map(labels.map((l) => [l.id, l]))
  const agentMap = new Map(agents.map((a) => [a.id, a]))

  return (
    <section className="flex flex-1 flex-col bg-background">
      {/* Top header */}
      <header className="flex flex-col gap-2 border-b border-border/60 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {thread.id.toUpperCase()}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="truncate text-sm font-medium text-foreground">
              {customer?.fullName ?? "Unknown"}
            </span>
            {tenant && (
              <>
                <span className="text-muted-foreground">·</span>
                <Badge
                  variant="outline"
                  className="h-5 rounded-md border-border/60 bg-transparent font-normal text-muted-foreground"
                >
                  {tenant.name}
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Toggle customer profile"
                    onClick={onToggleProfile}
                  >
                    <IconArrowsMinimize className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>
                <span className="flex items-center gap-2">
                  Toggle profile <Kbd>I</Kbd>
                </span>
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More actions"
                  >
                    <IconDotsVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem>Copy thread link</DropdownMenuItem>
                  <DropdownMenuItem>Open in new tab</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Mark as spam</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h2 className="text-base font-semibold text-foreground">
          {thread.title}
        </h2>

        {/* Status / priority / assignee / labels controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="border border-border/50 bg-muted/30 hover:bg-muted/60"
                >
                  <StatusPill
                    status={thread.status}
                    className="border-0 bg-transparent px-0"
                  />
                  <IconChevronDown className="ml-1 size-3 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconCheck className="size-4" /> Mark as done
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconClock className="size-4" /> Snooze in 2 hours
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconClock className="size-4" /> Snooze until tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconClock className="size-4" /> Snooze until next Monday
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="border border-border/50 bg-muted/30 hover:bg-muted/60"
                >
                  <IconFlag
                    className={cn(
                      "size-3",
                      thread.priority === "urgent"
                        ? "text-rose-500"
                        : "text-muted-foreground"
                    )}
                  />
                  {PRIORITY_LABEL[thread.priority]}
                  <IconChevronDown className="ml-1 size-3 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Set priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                <DropdownMenuItem key={k}>{v}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="border border-border/50 bg-muted/30 hover:bg-muted/60"
                >
                  <IconUserPlus className="size-3" />
                  {assignee ? assignee.fullName : "Assign"}
                  <IconChevronDown className="ml-1 size-3 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {agents.map((a) => (
                <DropdownMenuItem key={a.id}>
                  <Avatar className="size-5">
                    <AvatarFallback className="bg-muted text-[10px]">
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                  {a.fullName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="border border-border/50 bg-muted/30 hover:bg-muted/60"
                >
                  <IconTag className="size-3" />
                  Labels
                  <IconChevronDown className="ml-1 size-3 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Add label</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {labels.map((l) => (
                <DropdownMenuItem key={l.id}>{l.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5" />

          {thread.labelIds.map((lid) => {
            const l = labelMap.get(lid)
            return l ? <LabelChip key={lid} label={l} /> : null
          })}
        </div>

        <Tabs defaultValue="conversation" className="mt-1 -mb-3">
          <TabsList className="h-auto gap-1 bg-transparent p-0">
            <TabsTrigger
              value="conversation"
              className="h-8 rounded-md px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Conversation
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="h-8 rounded-md px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="h-8 rounded-md px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Internal notes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Message timeline */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 px-5 py-5">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            messages.map((m, idx) => {
              if (m.role === "system") {
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 py-1 text-[11px] text-muted-foreground"
                  >
                    <IconAlertTriangle className="size-3 text-amber-500/80" />
                    <span>{m.body}</span>
                    <span className="text-muted-foreground/60">
                      · {formatTime(m.createdAt)}
                    </span>
                  </div>
                )
              }
              const isAgent = m.role === "agent"
              const author = isAgent
                ? (agentMap.get(m.authorId)?.fullName ?? "Agent")
                : (customer?.fullName ?? "Customer")
              const initials = isAgent
                ? (agentMap.get(m.authorId)?.initials ?? "·")
                : (customer?.initials ?? "?")
              return (
                <article
                  key={m.id}
                  className={cn(
                    "flex gap-3",
                    isAgent ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="mt-0.5 size-7 shrink-0">
                    <AvatarFallback
                      className={cn(
                        "text-[10px] font-medium",
                        isAgent
                          ? "bg-foreground/15 text-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex max-w-[70%] flex-col gap-1",
                      isAgent ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-baseline gap-2 text-[11px]",
                        isAgent ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <span className="font-medium text-foreground">
                        {author}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(m.createdAt)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                        isAgent
                          ? "border-foreground/15 bg-foreground/5"
                          : "border-border/60 bg-card"
                      )}
                    >
                      {m.body}
                    </div>
                  </div>
                  {/* Hide separator on last message */}
                  {idx < 0 && <Separator />}
                </article>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Composer */}
      <Composer />
    </section>
  )
}
