"use client"

import * as React from "react"

import type {
  Agent,
  Customer,
  Label,
  Message,
  Tenant,
  Thread,
} from "@/app/lib/mock-data"

import { CommandPalette } from "./command-palette"
import { CustomerProfile } from "./customer-profile"
import { NavRail, type NavRailView } from "./nav-rail"
import { ThreadDetail } from "./thread-detail"
import { ThreadList } from "./thread-list"

export function WorkspaceShell({
  threads,
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
  const selectedTenant = selectedThread
    ? tenantsById.get(selectedThread.tenantId)
    : undefined
  const selectedAssignee =
    selectedThread && selectedThread.assigneeId
      ? agentsById.get(selectedThread.assigneeId)
      : undefined
  const selectedMessages = selectedThread
    ? messages
        .filter((m) => m.threadId === selectedThread.id)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : []
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
        thread={selectedThread}
        customer={selectedCustomer}
        tenant={selectedTenant}
        assignee={selectedAssignee}
        agents={agents}
        labels={labels}
        messages={selectedMessages}
        onToggleProfile={() => setShowProfile((s) => !s)}
      />
      {showProfile && selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          tenant={selectedTenant}
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
