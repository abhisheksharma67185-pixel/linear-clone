"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Hash, Lock, Search, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserAvatar } from "./user-avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Channel = {
  id: string
  name: string
  type: "public" | "private"
  isArchived: boolean
}

type DirectMessage = {
  id: string
  participantIds: string[]
  isGroup: boolean
}

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
}

type Destination =
  | { kind: "channel"; channelId: string; label: string }
  | { kind: "dm"; dmId: string; label: string }

const CURRENT_USER_ID = "usr-1"

export function ForwardMessageDialog({
  open,
  onOpenChange,
  messageId,
  onForwarded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  messageId: string | null
  onForwarded?: () => void
}) {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [target, setTarget] = useState<Destination | null>(null)
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/dms").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([c, d, u]) => {
      setChannels(c as Channel[])
      setDms(d as DirectMessage[])
      setUsers(u as User[])
    })
  }, [open])

  useEffect(() => {
    if (!open) {
      // Reset on close so re-opening is clean.
      setQuery("")
      setTarget(null)
      setComment("")
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const filteredChannels = useMemo(() => {
    const q = query.trim().toLowerCase()
    return channels
      .filter((c) => !c.isArchived)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice(0, 50)
  }, [channels, query])

  const filteredDms = useMemo(() => {
    const q = query.trim().toLowerCase()
    return dms
      .map((dm) => {
        const others = dm.participantIds
          .filter((id) => id !== CURRENT_USER_ID)
          .map((id) => users.find((u) => u.id === id))
          .filter((u): u is User => Boolean(u))
        const label = dm.isGroup
          ? others.map((u) => u.displayName).join(", ")
          : (others[0]?.name ?? "Direct message")
        return { dm, label, others }
      })
      .filter(({ label }) => !q || label.toLowerCase().includes(q))
      .slice(0, 50)
  }, [dms, users, query])

  const submit = async () => {
    if (!target || !messageId) return
    setSending(true)
    const body =
      target.kind === "channel"
        ? { channelId: target.channelId }
        : { dmId: target.dmId }
    const res = await fetch(`/api/data/messages/${messageId}/forward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setSending(false)
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to forward")
      return
    }

    // Optional comment posts as a follow-up message in the same destination.
    const trimmed = comment.trim()
    if (trimmed) {
      await fetch("/api/data/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          authorId: CURRENT_USER_ID,
          text: trimmed,
        }),
      })
    }

    setSending(false)
    toast.success(`Forwarded to ${target.label}`)
    onForwarded?.()
    onOpenChange(false)

    // Take the user to the destination so they can verify the message landed.
    if (target.kind === "channel") {
      const ch = channels.find((c) => c.id === target.channelId)
      if (ch) router.push(`/c/${ch.name}`)
    } else {
      router.push(`/dm/${target.dmId}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Forward this message</DialogTitle>
          <DialogDescription>
            Send a copy to a channel or direct message.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels or people"
              className="h-9 pl-8"
            />
          </div>

          <Tabs defaultValue="channels">
            <TabsList>
              <TabsTrigger value="channels">
                Channels ({filteredChannels.length})
              </TabsTrigger>
              <TabsTrigger value="dms">DMs ({filteredDms.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="channels" className="mt-2">
              <ul className="max-h-64 overflow-y-auto rounded-md border border-border">
                {filteredChannels.length === 0 ? (
                  <li className="px-3 py-3 text-center text-xs text-muted-foreground">
                    No channels match
                  </li>
                ) : (
                  filteredChannels.map((c) => {
                    const Icon = c.type === "private" ? Lock : Hash
                    const selected =
                      target?.kind === "channel" && target.channelId === c.id
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setTarget({
                              kind: "channel",
                              channelId: c.id,
                              label: `#${c.name}`,
                            })
                          }
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                            selected && "bg-accent font-semibold"
                          )}
                        >
                          <Icon className="size-3.5" />#{c.name}
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </TabsContent>
            <TabsContent value="dms" className="mt-2">
              <ul className="max-h-64 overflow-y-auto rounded-md border border-border">
                {filteredDms.length === 0 ? (
                  <li className="px-3 py-3 text-center text-xs text-muted-foreground">
                    No conversations match
                  </li>
                ) : (
                  filteredDms.map(({ dm, label, others }) => {
                    const selected =
                      target?.kind === "dm" && target.dmId === dm.id
                    return (
                      <li key={dm.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setTarget({ kind: "dm", dmId: dm.id, label })
                          }
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                            selected && "bg-accent font-semibold"
                          )}
                        >
                          {dm.isGroup ? (
                            <span className="flex size-5 items-center justify-center rounded-md bg-muted">
                              <Users className="size-3" />
                            </span>
                          ) : (
                            <UserAvatar
                              name={others[0]?.name ?? ""}
                              src={others[0]?.avatar}
                              presence={others[0]?.presence}
                              size="xs"
                            />
                          )}
                          <span className="truncate">{label}</span>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Add a comment (optional)
            </label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Say something about this…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!target || sending}>
            {sending
              ? "Forwarding…"
              : target
                ? `Forward to ${target.label}`
                : "Forward"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
