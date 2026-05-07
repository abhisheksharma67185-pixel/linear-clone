"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type Trigger = "slash" | "shortcut" | "schedule" | "new_channel_member"

const TRIGGERS: { value: Trigger; label: string; description: string }[] = [
  {
    value: "slash",
    label: "Slash command",
    description: "Run when someone types a /slash command in any channel.",
  },
  {
    value: "shortcut",
    label: "Shortcut",
    description: "Run from the toolbar of a message or channel.",
  },
  {
    value: "schedule",
    label: "Schedule",
    description: "Run on a recurring schedule (daily, weekly).",
  },
  {
    value: "new_channel_member",
    label: "New channel member",
    description: "Run when a new person joins a channel.",
  },
]

type Channel = { id: string; name: string }

export function CreateWorkflowDialog({
  open,
  onOpenChange,
  // Default to the channel that opened the dialog (when applicable);
  // workspace-level workflows pass null.
  defaultChannelId = null,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultChannelId?: string | null
  onCreated?: (workflowId: string) => void
}) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [name, setName] = useState("")
  const [trigger, setTrigger] = useState<Trigger>("slash")
  const [channelId, setChannelId] = useState<string | null>(defaultChannelId)
  const [loading, setLoading] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    fetch("/api/data/channels")
      .then((r) => r.json())
      .then((c: Channel[]) => setChannels(c))
      .catch(() => {})
    setChannelId(defaultChannelId)
  }, [open, defaultChannelId])

  useEffect(() => {
    if (!open) {
      setName("")
      setTrigger("slash")
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    const res = await fetch("/api/data/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, trigger, channelId }),
    })
    setLoading(false)
    if (res.ok) {
      const w = await res.json()
      toast.success(`Workflow "${w.name}" created`)
      onOpenChange(false)
      onCreated?.(w.id)
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to create workflow")
    }
  }

  const triggerInfo = TRIGGERS.find((t) => t.value === trigger)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New workflow</DialogTitle>
          <DialogDescription>
            Workflows automate routine tasks like onboarding messages or daily
            standups.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wf-name">Name</Label>
            <Input
              id="wf-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily standup ping"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Trigger</Label>
            <Select
              value={trigger}
              onValueChange={(v) => setTrigger(v as Trigger)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {triggerInfo ? (
              <p className="text-xs text-muted-foreground">
                {triggerInfo.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Scope</Label>
            <Select
              value={channelId ?? "__workspace"}
              onValueChange={(v) =>
                setChannelId(v === "__workspace" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__workspace">Workspace-wide</SelectItem>
                {channels.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    #{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || loading}>
            {loading ? "Creating…" : "Create workflow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
