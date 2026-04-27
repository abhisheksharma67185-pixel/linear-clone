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
  IconRefresh,
  IconTag,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  fetchThread,
  sendReply,
  updateThread,
  type ThreadWithMessages,
  type UpdateThreadBody,
} from "@/lib/api"

import type {
  Agent,
  Customer,
  Label,
  Message,
  Tenant,
  Thread,
  ThreadPriority,
} from "@/app/lib/mock-data"
import { Composer, type ComposerSendAction } from "./composer"
import { Kbd } from "./kbd"
import { LabelChip } from "./label-chip"
import { StatusPill } from "./status-pill"

const PRIORITY_LABEL: Record<ThreadPriority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
}

const PRIORITY_ORDER: ThreadPriority[] = ["urgent", "high", "normal", "low"]

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function snoozeUntil(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString()
}

function snoozeNextMonday(): string {
  const d = new Date()
  const day = d.getDay() // 0 = Sunday
  const daysToMonday = (1 - day + 7) % 7 || 7
  d.setDate(d.getDate() + daysToMonday)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

export function ThreadDetail({
  threadId,
  initialThread,
  initialMessages,
  customersById,
  tenantsById,
  agentsById,
  agents,
  labels,
  currentAgent,
  onToggleProfile,
}: {
  threadId: string | null
  initialThread: Thread | null
  initialMessages: Message[]
  customersById: Map<string, Customer>
  tenantsById: Map<string, Tenant>
  agentsById: Map<string, Agent>
  agents: Agent[]
  labels: Label[]
  currentAgent: Agent
  onToggleProfile: () => void
}) {
  const queryClient = useQueryClient()

  // Hydrate the thread-detail cache from the server-rendered seed for the
  // initial selection so we don't show a skeleton on first paint.
  const initialData: ThreadWithMessages | undefined = React.useMemo(() => {
    if (!initialThread || initialThread.id !== threadId) return undefined
    return { ...initialThread, messages: initialMessages }
  }, [initialThread, initialMessages, threadId])

  const threadQuery = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => {
      if (!threadId) throw new Error("no thread selected")
      return fetchThread(threadId)
    },
    enabled: !!threadId,
    initialData,
    staleTime: 30_000,
  })

  // ---------- mutations ----------

  const patchMutation = useMutation({
    mutationFn: (body: UpdateThreadBody) => {
      if (!threadId) throw new Error("no thread selected")
      return updateThread(threadId, body)
    },
    onMutate: async (body) => {
      if (!threadId) return { previous: undefined }
      await queryClient.cancelQueries({ queryKey: ["thread", threadId] })
      const previous = queryClient.getQueryData<ThreadWithMessages>([
        "thread",
        threadId,
      ])
      if (previous) {
        queryClient.setQueryData<ThreadWithMessages>(["thread", threadId], {
          ...previous,
          ...body,
          // Keep messages around — they live on the same cache entry.
          messages: previous.messages,
        })
      }
      // Also reflect into the list cache so the row pill flips immediately.
      const previousList = queryClient.getQueryData<Thread[]>(["threads"])
      if (previousList) {
        queryClient.setQueryData<Thread[]>(
          ["threads"],
          previousList.map((t) => (t.id === threadId ? { ...t, ...body } : t))
        )
      }
      return { previous, previousList }
    },
    onError: (err, _body, ctx) => {
      if (ctx?.previous && threadId) {
        queryClient.setQueryData(["thread", threadId], ctx.previous)
      }
      if (ctx?.previousList) {
        queryClient.setQueryData(["threads"], ctx.previousList)
      }
      toast.error("Couldn't update thread", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    },
    onSettled: () => {
      if (threadId) {
        queryClient.invalidateQueries({ queryKey: ["thread", threadId] })
      }
      queryClient.invalidateQueries({ queryKey: ["threads"] })
    },
  })

  const replyMutation = useMutation({
    mutationFn: async (vars: { body: string; action: ComposerSendAction }) => {
      if (!threadId) throw new Error("no thread selected")
      const tasks: Promise<unknown>[] = [
        sendReply(threadId, { body: vars.body, authorId: currentAgent.id }),
      ]
      if (vars.action === "reply-snooze") {
        tasks.push(
          updateThread(threadId, {
            status: "snoozed",
            snoozedUntil: snoozeUntil(2),
          })
        )
      } else if (vars.action === "reply-done") {
        tasks.push(updateThread(threadId, { status: "done" }))
      }
      await Promise.all(tasks)
    },
    onSuccess: (_data, vars) => {
      const verb =
        vars.action === "reply-snooze"
          ? "Reply sent and snoozed for 2h"
          : vars.action === "reply-done"
            ? "Reply sent and marked done"
            : "Reply sent"
      toast.success(verb)
    },
    onError: (err) => {
      toast.error("Couldn't send reply", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    },
    onSettled: () => {
      if (threadId) {
        queryClient.invalidateQueries({ queryKey: ["thread", threadId] })
      }
      queryClient.invalidateQueries({ queryKey: ["threads"] })
    },
  })

  // ---------- empty / loading / error states ----------

  if (!threadId) {
    return (
      <section className="flex flex-1 items-center justify-center bg-background">
        <div className="text-center text-sm text-muted-foreground">
          Select a thread to get started.
        </div>
      </section>
    )
  }

  if (threadQuery.isLoading || (!threadQuery.data && !threadQuery.isError)) {
    return <ThreadDetailSkeleton />
  }

  if (threadQuery.isError || !threadQuery.data) {
    return (
      <section className="flex flex-1 items-center justify-center bg-background p-8">
        <Alert variant="destructive" className="max-w-md">
          <IconX />
          <AlertTitle>Couldn&apos;t load this thread</AlertTitle>
          <AlertDescription>
            {threadQuery.error instanceof Error
              ? threadQuery.error.message
              : "An unexpected error occurred."}
          </AlertDescription>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => threadQuery.refetch()}
            >
              <IconRefresh data-icon="inline-start" />
              Retry
            </Button>
          </div>
        </Alert>
      </section>
    )
  }

  const thread = threadQuery.data
  const messages = thread.messages
  const customer = customersById.get(thread.customerId)
  const tenant = tenantsById.get(thread.tenantId)
  const assignee = thread.assigneeId
    ? agentsById.get(thread.assigneeId)
    : undefined

  const labelMap = new Map(labels.map((l) => [l.id, l]))
  const agentMap = agentsById

  const labelSet = new Set(thread.labelIds)
  const toggleLabel = (labelId: string) => {
    const next = new Set(thread.labelIds)
    if (next.has(labelId)) next.delete(labelId)
    else next.add(labelId)
    patchMutation.mutate({ labelIds: [...next] })
  }

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
          {/* Status */}
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
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => patchMutation.mutate({ status: "open" })}
                  disabled={thread.status === "open"}
                >
                  <IconRefresh className="size-4" /> Reopen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => patchMutation.mutate({ status: "done" })}
                  disabled={thread.status === "done"}
                >
                  <IconCheck className="size-4" /> Mark as done
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    patchMutation.mutate({
                      status: "snoozed",
                      snoozedUntil: snoozeUntil(2),
                    })
                  }
                >
                  <IconClock className="size-4" /> Snooze in 2 hours
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    patchMutation.mutate({
                      status: "snoozed",
                      snoozedUntil: snoozeUntil(24),
                    })
                  }
                >
                  <IconClock className="size-4" /> Snooze until tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    patchMutation.mutate({
                      status: "snoozed",
                      snoozedUntil: snoozeNextMonday(),
                    })
                  }
                >
                  <IconClock className="size-4" /> Snooze until next Monday
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority */}
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
              <DropdownMenuGroup>
                {PRIORITY_ORDER.map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => patchMutation.mutate({ priority: p })}
                    disabled={thread.priority === p}
                  >
                    <IconFlag
                      className={cn(
                        "size-4",
                        p === "urgent"
                          ? "text-rose-500"
                          : "text-muted-foreground"
                      )}
                    />
                    {PRIORITY_LABEL[p]}
                    {thread.priority === p && (
                      <IconCheck className="ml-auto size-3 text-muted-foreground" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assignee */}
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
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => patchMutation.mutate({ assigneeId: null })}
                  disabled={!thread.assigneeId}
                >
                  Unassign
                  {!thread.assigneeId && (
                    <IconCheck className="ml-auto size-3 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
                {agents.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onClick={() => patchMutation.mutate({ assigneeId: a.id })}
                  >
                    <Avatar className="size-5">
                      <AvatarFallback className="bg-muted text-[10px]">
                        {a.initials}
                      </AvatarFallback>
                    </Avatar>
                    {a.fullName}
                    {thread.assigneeId === a.id && (
                      <IconCheck className="ml-auto size-3 text-muted-foreground" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Labels */}
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
              <DropdownMenuLabel>Toggle labels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {labels.map((l) => {
                  const checked = labelSet.has(l.id)
                  return (
                    <DropdownMenuItem
                      key={l.id}
                      onClick={(e) => {
                        // Keep menu open for multi-select
                        e.preventDefault()
                        toggleLabel(l.id)
                      }}
                    >
                      <span
                        className={cn(
                          "inline-flex size-3 items-center justify-center rounded-sm border",
                          checked
                            ? "border-foreground/60 bg-foreground/10"
                            : "border-border/60 bg-transparent"
                        )}
                      >
                        {checked && (
                          <IconCheck className="size-2.5 text-foreground" />
                        )}
                      </span>
                      {l.name}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
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
      <Composer
        onSend={(body, action) => replyMutation.mutate({ body, action })}
        pending={replyMutation.isPending}
      />
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton — shown while a freshly-selected thread is fetching.
// ---------------------------------------------------------------------------

function ThreadDetailSkeleton() {
  return (
    <section className="flex flex-1 flex-col bg-background">
      <header className="flex flex-col gap-2 border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </header>
      <div className="flex flex-col gap-4 px-5 py-5">
        <div className="flex gap-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-16 w-80" />
          </div>
        </div>
        <div className="flex flex-row-reverse gap-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-72" />
          </div>
        </div>
      </div>
    </section>
  )
}

// Re-export the message type so consumers don't need a second import path.
export type { Message }
