"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Clock,
  MoreHorizontal,
  Send,
  SendHorizonal,
  Trash2,
} from "lucide-react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type Message = {
  id: string
  text: string
  authorId: string
  scheduledFor: string | null
  createdAt: string
  channelId: string | null
  dmId: string | null
}

type Channel = { id: string; name: string }
type DirectMessage = {
  id: string
  participantIds: string[]
  isGroup: boolean
}
type User = {
  id: string
  name: string
  displayName: string
}

const CURRENT_USER_ID = "usr-1"

export default function DraftsPage() {
  const [scheduled, setScheduled] = useState<Message[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [users, setUsers] = useState<User[]>([])

  const load = useCallback(async () => {
    const [s, c, d, u] = await Promise.all([
      fetch("/api/data/scheduled").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/dms").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ])
    setScheduled(s as Message[])
    setChannels(c as Channel[])
    setDms(d as DirectMessage[])
    setUsers(u as User[])
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const cancelDraft = async (id: string) => {
    if (!window.confirm("Cancel this scheduled message?")) return
    const res = await fetch(`/api/data/scheduled?id=${id}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to cancel")
      return
    }
    toast.success("Scheduled message cancelled")
    load()
  }

  // "Send now" — cancel the scheduled record, then post a normal message
  // with the same body to the same destination. Failure on the second leg
  // leaves the original cancelled, which matches Slack's behavior.
  const sendNow = async (m: Message) => {
    const cancelRes = await fetch(`/api/data/scheduled?id=${m.id}`, {
      method: "DELETE",
    })
    if (!cancelRes.ok) {
      toast.error("Failed to cancel scheduled message")
      return
    }
    const sendRes = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: m.channelId ?? undefined,
        dmId: m.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text: m.text,
      }),
    })
    if (!sendRes.ok) {
      const err = await sendRes.json().catch(() => ({}))
      toast.error(err.error ?? "Sent partially — please retry")
      load()
      return
    }
    toast.success("Sent")
    load()
  }

  const reschedule = async (m: Message) => {
    const initial = m.scheduledFor
      ? new Date(m.scheduledFor).toISOString().slice(0, 16)
      : ""
    const next = window.prompt(
      "Reschedule for (YYYY-MM-DDTHH:mm, local time):",
      initial
    )
    if (next === null || next.trim() === "") return
    const iso = new Date(next).toISOString()
    if (Number.isNaN(new Date(iso).getTime())) {
      toast.error("Invalid date — use YYYY-MM-DDTHH:mm")
      return
    }
    // No PATCH endpoint — cancel + reschedule with the new timestamp.
    await fetch(`/api/data/scheduled?id=${m.id}`, { method: "DELETE" })
    const res = await fetch("/api/data/scheduled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: m.channelId ?? undefined,
        dmId: m.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text: m.text,
        scheduledFor: iso,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to reschedule")
      load()
      return
    }
    toast.success("Rescheduled")
    load()
  }

  const labelFor = (m: Message): string => {
    if (m.channelId) {
      const ch = channels.find((c) => c.id === m.channelId)
      return ch ? `#${ch.name}` : "Channel"
    }
    if (m.dmId) {
      const dm = dms.find((d) => d.id === m.dmId)
      if (!dm) return "DM"
      const others = dm.participantIds
        .filter((id) => id !== CURRENT_USER_ID)
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => Boolean(u))
      if (dm.isGroup) return others.map((u) => u.displayName).join(", ")
      return others[0]?.name ?? "DM"
    }
    return "—"
  }

  return (
    <>
      <SimplePageHeader
        title="Drafts & sent"
        subtitle={`${scheduled.length} scheduled`}
      />
      <ScrollArea className="flex-1">
        {scheduled.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Send />
              </EmptyMedia>
              <EmptyTitle>No scheduled messages</EmptyTitle>
              <EmptyDescription>
                Messages you schedule for later delivery will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {scheduled.map((m) => (
              <div key={m.id} className="flex items-start gap-3 px-4 py-3">
                <Clock className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex flex-1 flex-col">
                  <span className="text-xs text-muted-foreground">
                    Scheduled for{" "}
                    <span className="font-semibold text-foreground">
                      {m.scheduledFor
                        ? new Date(m.scheduledFor).toLocaleString()
                        : "—"}
                    </span>{" "}
                    · {labelFor(m)}
                  </span>
                  <span className="mt-0.5 text-sm text-foreground">
                    {m.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendNow(m)}
                  >
                    <SendHorizonal className="size-3.5" />
                    Send now
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => reschedule(m)}>
                        <Clock className="size-3.5" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => cancelDraft(m.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  )
}
