"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AtSign,
  Bold,
  Code,
  Hash,
  Italic,
  Link2,
  List,
  ListOrdered,
  Lock,
  Smile,
  Strikethrough,
  Underline as UnderlineIcon,
  X,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "./user-avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CURRENT_USER_ID = "usr-1"

type Channel = {
  id: string
  name: string
  type: "public" | "private"
  isArchived: boolean
}
type DirectMessage = { id: string; participantIds: string[]; isGroup: boolean }
type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  isBot?: boolean
}
type Attachment = {
  id: string
  type: "file" | "image" | "link"
  name: string
  url: string
}

// A target the user can share to. Channels and DMs reuse the same shape so
// the recipient chip + post fan-out can treat them uniformly.
type Target =
  | { kind: "user"; id: string; label: string; user: User }
  | { kind: "channel"; id: string; label: string; channel: Channel }
  | { kind: "dm"; id: string; label: string }

function fileExt(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? ""
}

const FILE_TILE: Record<string, { bg: string; label: string }> = {
  xlsx: { bg: "bg-emerald-600", label: "X" },
  xls: { bg: "bg-emerald-600", label: "X" },
  csv: { bg: "bg-emerald-700", label: "C" },
  docx: { bg: "bg-blue-600", label: "W" },
  doc: { bg: "bg-blue-600", label: "W" },
  pdf: { bg: "bg-rose-500", label: "P" },
  md: { bg: "bg-sky-500", label: "T" },
  txt: { bg: "bg-sky-500", label: "T" },
  pptx: { bg: "bg-orange-600", label: "P" },
  ppt: { bg: "bg-orange-600", label: "P" },
}

export function ShareFileDialog({
  open,
  onOpenChange,
  file,
  sharedByName,
  sharedAt,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  file: Attachment | null
  sharedByName: string | null
  sharedAt: string | null
}) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [query, setQuery] = useState("")
  const [target, setTarget] = useState<Target | null>(null)
  const [message, setMessage] = useState("")
  const [showSuggest, setShowSuggest] = useState(true)
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/dms").then((r) => r.json()),
    ]).then(([u, c, d]) => {
      setUsers(u as User[])
      setChannels(c as Channel[])
      setDms(d as DirectMessage[])
    })
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setTarget(null)
      setMessage("")
      setShowSuggest(true)
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const suggestions: Target[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out: Target[] = []
    // Direct people first (Slack shows users above channels in its picker).
    for (const u of users) {
      if (u.id === CURRENT_USER_ID) continue
      if (u.isBot) continue
      const hay = `${u.name} ${u.displayName}`.toLowerCase()
      if (q && !hay.includes(q)) continue
      out.push({ kind: "user", id: u.id, label: u.name, user: u })
    }
    for (const c of channels) {
      if (c.isArchived) continue
      if (q && !c.name.toLowerCase().includes(q)) continue
      out.push({ kind: "channel", id: c.id, label: c.name, channel: c })
    }
    for (const d of dms) {
      const others = d.participantIds
        .filter((id) => id !== CURRENT_USER_ID)
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => Boolean(u))
      if (!others.length) continue
      const label = others.map((u) => u.displayName).join(", ")
      if (q && !label.toLowerCase().includes(q)) continue
      out.push({ kind: "dm", id: d.id, label })
    }
    return out.slice(0, 12)
  }, [users, channels, dms, query])

  const submit = async () => {
    if (!target || !file) return
    setSending(true)
    // Re-attach the file (as a synthetic attachment) to a freshly-posted
    // message in the chosen destination. This is a pragmatic stand-in for
    // real Slack's file ACL fan-out.
    let body: Record<string, unknown> = {
      authorId: CURRENT_USER_ID,
      text: message.trim(),
      attachments: [
        {
          id: `${file.id}-fwd-${Date.now()}`,
          type: file.type,
          name: file.name,
          url: file.url,
        },
      ],
    }
    if (target.kind === "channel") {
      body = { ...body, channelId: target.id }
    } else if (target.kind === "dm") {
      body = { ...body, dmId: target.id }
    } else {
      // User → ensure a 1:1 DM exists, then post into it.
      const ensure = await fetch("/api/data/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: [CURRENT_USER_ID, target.id],
        }),
      })
      if (!ensure.ok) {
        setSending(false)
        toast.error("Failed to open DM")
        return
      }
      const { id: dmId } = (await ensure.json()) as { id: string }
      body = { ...body, dmId }
    }
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSending(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to share file")
      return
    }
    toast.success(`Shared ${file.name} with ${target.label}`)
    onOpenChange(false)
    if (target.kind === "channel") router.push(`/c/${target.channel.name}`)
    else if (target.kind === "dm") router.push(`/dm/${target.id}`)
  }

  if (!file) return null
  const ext = fileExt(file.name)
  const tile = FILE_TILE[ext] ?? { bg: "bg-muted", label: "F" }
  const dateLabel = sharedAt
    ? new Date(sharedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold">Share this file</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-2">
          {/* Recipient picker: chip + autocomplete dropdown. */}
          <div className="relative">
            {target ? (
              <div className="flex min-h-10 flex-wrap items-center gap-1 rounded-md border-2 border-blue-500 px-2 py-1">
                <span className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-sm">
                  {target.kind === "user" ? (
                    <UserAvatar
                      name={target.user.name}
                      src={target.user.avatar}
                      presence={target.user.presence}
                      size="xs"
                    />
                  ) : target.kind === "channel" ? (
                    target.channel.type === "private" ? (
                      <Lock className="size-3.5" />
                    ) : (
                      <Hash className="size-3.5" />
                    )
                  ) : (
                    <Hash className="size-3.5" />
                  )}
                  <span className="font-semibold">{target.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTarget(null)
                      setShowSuggest(true)
                      requestAnimationFrame(() => inputRef.current?.focus())
                    }}
                    aria-label="Remove recipient"
                    className="ml-1 rounded p-0.5 hover:bg-blue-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              </div>
            ) : (
              <Input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowSuggest(true)
                }}
                onFocus={() => setShowSuggest(true)}
                placeholder="Search for channel or person"
                className="h-10 border-2 border-blue-500 focus-visible:ring-0"
              />
            )}
            {!target && showSuggest && suggestions.length > 0 ? (
              <div className="absolute top-full left-0 z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg">
                <ul className="py-1">
                  {suggestions.map((s) => (
                    <li key={`${s.kind}:${s.id}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setTarget(s)
                          setShowSuggest(false)
                          setQuery("")
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        {s.kind === "user" ? (
                          <>
                            <UserAvatar
                              name={s.user.name}
                              src={s.user.avatar}
                              presence={s.user.presence}
                              size="xs"
                              showPresence
                            />
                            <span className="font-semibold">{s.user.name}</span>
                            <span className="text-muted-foreground">
                              {s.user.displayName}
                            </span>
                          </>
                        ) : s.kind === "channel" ? (
                          <>
                            {s.channel.type === "private" ? (
                              <Lock className="size-4" />
                            ) : (
                              <Hash className="size-4" />
                            )}
                            <span className="font-semibold">{s.label}</span>
                          </>
                        ) : (
                          <>
                            <Hash className="size-4" />
                            <span className="font-semibold">{s.label}</span>
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Message editor — surfaces only after a recipient is chosen, just
              like real Slack does. */}
          {target ? (
            <div className="overflow-hidden rounded-md border border-border">
              <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5 text-muted-foreground">
                <ToolbarButton aria-label="Bold">
                  <Bold className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton aria-label="Italic">
                  <Italic className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton aria-label="Underline">
                  <UnderlineIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton aria-label="Strikethrough">
                  <Strikethrough className="size-3.5" />
                </ToolbarButton>
                <span className="mx-1 h-4 w-px bg-border" />
                <ToolbarButton aria-label="Link">
                  <Link2 className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton aria-label="Numbered list">
                  <ListOrdered className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton aria-label="Bulleted list">
                  <List className="size-3.5" />
                </ToolbarButton>
                <span className="mx-1 h-4 w-px bg-border" />
                <ToolbarButton aria-label="Code">
                  <Code className="size-3.5" />
                </ToolbarButton>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message, if you’d like."
                className="block min-h-24 w-full resize-none px-3 py-2 text-sm outline-none"
              />
              <div className="flex items-center gap-2 border-t border-border px-3 py-1.5 text-muted-foreground">
                <ToolbarButton aria-label="Format">
                  <span className="text-[12px] font-semibold underline">
                    Aa
                  </span>
                </ToolbarButton>
                <ToolbarButton aria-label="Insert emoji">
                  <Smile className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton aria-label="Insert mention">
                  <AtSign className="size-3.5" />
                </ToolbarButton>
              </div>
            </div>
          ) : null}

          {/* File preview chip */}
          <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded text-sm font-bold text-white",
                tile.bg
              )}
            >
              {tile.label}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{file.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {sharedByName ? `${sharedByName} · ` : ""}
                {dateLabel}
              </div>
            </div>
          </div>

          <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            1 user and 1 channel have access to this file.
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                ?.writeText(`${window.location.origin}${file.url}`)
                .then(() => toast.success("Link copied"))
                .catch(() => toast.error("Copy failed"))
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
          >
            <Link2 className="size-3.5" />
            Copy Link
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Save Draft
            </Button>
            <Button
              onClick={submit}
              disabled={!target || sending}
              className={cn(
                target && !sending
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : ""
              )}
            >
              {sending ? "Sending…" : "Forward"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ToolbarButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
      {...rest}
    >
      {children}
    </button>
  )
}
