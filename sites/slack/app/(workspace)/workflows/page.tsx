"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Workflow as WorkflowIcon } from "lucide-react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { CreateWorkflowDialog } from "@/components/create-workflow-dialog"
import { toast } from "sonner"

type Workflow = {
  id: string
  name: string
  trigger: string
  isEnabled: boolean
  runCount: number
  lastRunAt: string | null
  channelId: string | null
}

type Channel = { id: string; name: string }

const TRIGGER_LABEL: Record<string, string> = {
  slash: "Slash command",
  shortcut: "Shortcut",
  schedule: "Schedule",
  new_channel_member: "New channel member",
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    const [w, c] = await Promise.all([
      fetch("/api/data/workflows").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ])
    setWorkflows(w as Workflow[])
    setChannels(c as Channel[])
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = async (w: Workflow) => {
    const res = await fetch(`/api/data/workflows/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !w.isEnabled }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to toggle")
      return
    }
    load()
  }

  const channelLabel = (id: string | null) => {
    if (!id) return "Workspace"
    const ch = channels.find((c) => c.id === id)
    return ch ? `#${ch.name}` : "Channel"
  }

  return (
    <>
      <SimplePageHeader
        title="Workflow Builder"
        subtitle={`${workflows.length} workflows`}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            New workflow
          </Button>
        }
      />
      <ScrollArea className="flex-1">
        {workflows.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WorkflowIcon />
              </EmptyMedia>
              <EmptyTitle>No workflows yet</EmptyTitle>
              <EmptyDescription>
                Workflows automate routine tasks. Try a daily standup ping or a
                welcome message for new channel members.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {workflows.map((w) => (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <WorkflowIcon className="size-4 text-muted-foreground" />
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">{w.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {TRIGGER_LABEL[w.trigger] ?? w.trigger} ·{" "}
                    {channelLabel(w.channelId)} · {w.runCount} runs
                    {w.lastRunAt
                      ? ` · last run ${new Date(w.lastRunAt).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
                <Switch
                  checked={w.isEnabled}
                  onCheckedChange={() => toggle(w)}
                  aria-label={
                    w.isEnabled ? "Disable workflow" : "Enable workflow"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <CreateWorkflowDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />
    </>
  )
}
