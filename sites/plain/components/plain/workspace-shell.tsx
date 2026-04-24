"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import type {
  Agent,
  Customer,
  Label,
  Message,
  Tenant,
  Thread,
} from "@/app/lib/mock-data"
import { fetchThreads } from "@/lib/api"

import { CommandPalette } from "./command-palette"
import { CustomerProfile } from "./customer-profile"
import { NavRail, type NavRailView } from "./nav-rail"
import { ThreadDetail } from "./thread-detail"
import { ThreadList } from "./thread-list"

export function WorkspaceShell({
  threads: initialThreads,
  messages,
  customers,
  tenants,
  labels,
  agents,
  currentAgent,
}: {
  threads: Thread[]
  messages: Message[]
  customers: Customer[]
  tenants: Tenant[]
  labels: Label[]
  agents: Agent[]
  currentAgent: Agent
}) {
  // Threads are the only collection that mutates from the UI; everything else
  // is read-only seed data, so we keep it as plain props. Threads flow through
  // TanStack Query so optimistic updates from dropdowns/composer flip the
  // pills + list rows immediately without prop drilling.
  const { data: threads = initialThreads } = useQuery({
    queryKey: ["threads"],
    queryFn: fetchThreads,
    initialData: initialThreads,
    staleTime: 30_000,
  })

  const customersById = React.useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )
  const tenantsById = React.useMemo(
    () => new Map(tenants.map((t) => [t.id, t])),
    [tenants]
  )
  const agentsById = React.useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  )

  const [view, setView] = React.useState<NavRailView>("inbox")
  const [showProfile, setShowProfile] = React.useState(true)
  const [commandOpen, setCommandOpen] = React.useState(false)

  // Filter threads by view
  const visibleThreads = React.useMemo(() => {
    if (view === "inbox") return threads.filter((t) => t.status === "open")
    if (view === "snoozed") return threads.filter((t) => t.status === "snoozed")
    if (view === "done") return threads.filter((t) => t.status === "done")
    return threads
  }, [threads, view])

  // The user's explicit pick (null until they click). When null, we fall
  // through to the first visible thread, computed below — this avoids the
  // "setState in useEffect" cascade flagged by react-hooks/set-state-in-effect.
  const [pickedThreadId, setPickedThreadId] = React.useState<string | null>(
    null
  )

  const sortedVisible = React.useMemo(
    () =>
      [...visibleThreads].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [visibleThreads]
  )

  const selectedThreadId =
    pickedThreadId && visibleThreads.some((t) => t.id === pickedThreadId)
      ? pickedThreadId
      : (sortedVisible[0]?.id ?? null)
  const setSelectedThreadId = setPickedThreadId

  // Cmd+K opens the command palette
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const selectedThread = selectedThreadId
    ? (threads.find((t) => t.id === selectedThreadId) ?? null)
    : null
  const selectedCustomer = selectedThread
    ? customersById.get(selectedThread.customerId)
    : undefined

  // Initial messages for the seeded session — ThreadDetail prefers its own
  // useQuery for thread detail, but we hand it the seed so the very first
  // render is hydrated and there's no flash-of-skeleton on initial load.
  const initialMessagesForSelected = React.useMemo(
    () =>
      selectedThread
        ? messages
            .filter((m) => m.threadId === selectedThread.id)
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
        : [],
    [messages, selectedThread]
  )
  const recentThreads = selectedCustomer
    ? threads
        .filter(
          (t) =>
            t.customerId === selectedCustomer.id && t.id !== selectedThread?.id
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    : []

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      <NavRail
        view={view}
        onViewChange={(v) => setView(v)}
        onOpenCommand={() => setCommandOpen(true)}
        agent={currentAgent}
      />
      <ThreadList
        view={view}
        threads={visibleThreads}
        customersById={customersById}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
        currentAgentId={currentAgent.id}
      />
      <ThreadDetail
        threadId={selectedThreadId}
        initialThread={selectedThread}
        initialMessages={initialMessagesForSelected}
        customersById={customersById}
        tenantsById={tenantsById}
        agentsById={agentsById}
        agents={agents}
        labels={labels}
        currentAgent={currentAgent}
        onToggleProfile={() => setShowProfile((s) => !s)}
      />
      {showProfile && selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          tenant={tenantsById.get(selectedCustomer.tenantId)}
          recentThreads={recentThreads}
        />
      )}

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        threads={threads}
        customersById={customersById}
        onPickThread={(id) => {
          setSelectedThreadId(id)
          setCommandOpen(false)
        }}
        onSwitchView={(v) => {
          setView(v)
          setCommandOpen(false)
        }}
      />
    </div>
  )
}
