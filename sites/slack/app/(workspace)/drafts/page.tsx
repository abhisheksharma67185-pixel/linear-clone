"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  Hash,
  Lock,
  Pencil,
  PenLine,
  Send,
  Trash2,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Channel = {
  id: string
  name: string
  type: "public" | "private"
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
type Message = {
  id: string
  authorId: string
  text: string
  scheduledFor: string | null
  createdAt: string
  channelId: string | null
  dmId: string | null
}

// Local-only drafts. Real Slack syncs them server-side; we keep them in
// localStorage so the page is functional without yet another endpoint.
type Draft = {
  id: string
  text: string
  channelId: string | null
  dmId: string | null
  updatedAt: string
}

const CURRENT_USER_ID = "usr-1"
const DRAFTS_KEY = "slack:drafts:v1"
const BANNER_DISMISS_KEY = "slack:drafts-banner-dismissed:v1"

type Tab = "drafts" | "scheduled" | "sent"

export default function DraftsAndSentPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("drafts")
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [scheduled, setScheduled] = useState<Message[]>([])
  const [sent, setSent] = useState<Message[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const load = useCallback(async () => {
    const [s, msgs, c, d, u] = await Promise.all([
      fetch("/api/data/scheduled").then((r) => r.json() as Promise<Message[]>),
      fetch("/api/data/messages").then((r) => r.json() as Promise<Message[]>),
      fetch("/api/data/channels").then((r) => r.json() as Promise<Channel[]>),
      fetch("/api/data/dms").then((r) => r.json() as Promise<DirectMessage[]>),
      fetch("/api/data/users").then((r) => r.json() as Promise<User[]>),
    ])
    setScheduled(s)
    setSent(
      msgs
        .filter((m) => m.authorId === CURRENT_USER_ID)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 50)
    )
    setChannels(c)
    setDms(d)
    setUsers(u)
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(DRAFTS_KEY)
      if (raw) setDrafts(JSON.parse(raw) as Draft[])
    } catch {
      // Drafts are best-effort — bail silently if storage is unavailable.
    }
    setBannerDismissed(
      window.localStorage.getItem(BANNER_DISMISS_KEY) === "true"
    )
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const persistDrafts = (next: Draft[]) => {
    setDrafts(next)
    try {
      window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(next))
    } catch {}
  }

  const dismissBanner = () => {
    setBannerDismissed(true)
    try {
      window.localStorage.setItem(BANNER_DISMISS_KEY, "true")
    } catch {}
  }

  const recipientFor = useCallback(
    (m: { channelId: string | null; dmId: string | null }) => {
      if (m.channelId) {
        const ch = channels.find((c) => c.id === m.channelId)
        if (ch) {
          const Icon = ch.type === "private" ? Lock : Hash
          return {
            label: ch.name,
            icon: <Icon className="size-3.5" />,
            href: `/c/${ch.name}`,
          }
        }
      }
      if (m.dmId) {
        const dm = dms.find((d) => d.id === m.dmId)
        if (dm) {
          const others = dm.participantIds
            .filter((id) => id !== CURRENT_USER_ID)
            .map((id) => users.find((u) => u.id === id))
            .filter((x): x is User => Boolean(x))
          const label = dm.isGroup
            ? others.map((u) => u.displayName).join(", ")
            : (others[0]?.name ?? "Direct message")
          return {
            label,
            icon: others[0] ? (
              <UserAvatar
                name={others[0].name}
                src={others[0].avatar}
                presence={others[0].presence}
                size="xs"
              />
            ) : null,
            href: `/dm/${dm.id}`,
          }
        }
      }
      return { label: "—", icon: null, href: "" }
    },
    [channels, dms, users]
  )

  const me = useMemo(() => users.find((u) => u.id === CURRENT_USER_ID), [users])

  // ---- Draft actions
  const deleteDraft = (id: string) =>
    persistDrafts(drafts.filter((d) => d.id !== id))

  const editDraft = (d: Draft) => {
    const next = window.prompt("Edit draft", d.text)
    if (next == null) return
    persistDrafts(
      drafts.map((x) =>
        x.id === d.id
          ? { ...x, text: next, updatedAt: new Date().toISOString() }
          : x
      )
    )
  }

  const scheduleDraft = async (d: Draft) => {
    const when = window.prompt(
      "Schedule for (YYYY-MM-DDTHH:mm, local time):",
      ""
    )
    if (!when || when.trim() === "") return
    const iso = new Date(when).toISOString()
    if (Number.isNaN(new Date(iso).getTime())) {
      toast.error("Invalid date — use YYYY-MM-DDTHH:mm")
      return
    }
    const res = await fetch("/api/data/scheduled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: d.channelId ?? undefined,
        dmId: d.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text: d.text,
        scheduledFor: iso,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to schedule")
      return
    }
    deleteDraft(d.id)
    toast.success("Scheduled")
    load()
  }

  const sendDraft = async (d: Draft) => {
    if (!d.channelId && !d.dmId) {
      toast.error("Pick a channel or DM for this draft first")
      return
    }
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: d.channelId ?? undefined,
        dmId: d.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text: d.text,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to send")
      return
    }
    deleteDraft(d.id)
    toast.success("Sent")
    load()
  }

  // ---- Scheduled actions (existing endpoints)
  const cancelScheduled = async (id: string) => {
    if (!window.confirm("Cancel this scheduled message?")) return
    const res = await fetch(`/api/data/scheduled?id=${id}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      toast.error("Failed to cancel")
      return
    }
    toast.success("Cancelled")
    load()
  }

  const sendScheduledNow = async (m: Message) => {
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
      toast.error("Sent partially — please retry")
      load()
      return
    }
    toast.success("Sent")
    load()
  }

  // ---- New message — kick the user to the workspace creator (the same
  // command-palette path the rail edit button uses). Acts as a fallback
  // when the user has no destination drafts yet.
  const newMessage = () => router.push("/dms")

  const TABS: { value: Tab; label: string; count: number }[] = [
    { value: "drafts", label: "Drafts", count: drafts.length },
    { value: "scheduled", label: "Scheduled", count: scheduled.length },
    { value: "sent", label: "Sent", count: sent.length },
  ]

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-6 py-3">
        <h1 className="text-base font-bold text-foreground">
          Drafts &amp; sent
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Edit drafts coming soon")}
        >
          <PenLine className="size-3.5" />
          Edit
        </Button>
      </header>

      <div className="shrink-0 border-b border-border bg-background px-6">
        <nav role="tablist" className="flex items-center gap-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "relative flex items-center gap-1 py-3 text-sm font-medium transition-colors",
                tab === t.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {t.count > 0 ? (
                <span
                  className={cn(
                    "text-xs",
                    tab === t.value
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {t.count}
                </span>
              ) : null}
              {tab === t.value ? (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t bg-foreground" />
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-muted/30">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4">
          {!bannerDismissed ? (
            <div className="relative flex items-start gap-4 overflow-hidden rounded-md bg-amber-50 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-amber-900">
                  All your outgoing messages
                </div>
                <div className="text-sm text-amber-900/80">
                  Everything you send, draft, and schedule can now be found
                  here.
                </div>
              </div>
              <div className="hidden text-3xl sm:block" aria-hidden>
                ✉️
              </div>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss"
                className="absolute top-2 right-2 rounded p-1 text-amber-900/70 hover:bg-amber-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          {tab === "drafts" ? (
            drafts.length === 0 ? (
              <EmptyDrafts onNew={newMessage} />
            ) : (
              <ul className="overflow-hidden rounded-lg bg-background shadow-sm">
                {drafts.map((d) => {
                  const r = recipientFor(d)
                  return (
                    <li
                      key={d.id}
                      className="group relative flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                    >
                      {me ? (
                        <UserAvatar
                          name={me.name}
                          src={me.avatar}
                          presence={me.presence}
                          size="sm"
                        />
                      ) : (
                        <div className="size-9 rounded-md bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-bold text-foreground">
                            {me?.name ?? "You"}
                          </span>
                          {r.label !== "—" ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              · to {r.icon}
                              <span className="font-medium text-foreground">
                                {r.label}
                              </span>
                            </span>
                          ) : null}
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {d.text || "(empty draft)"}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(d.updatedAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      {/* Hover-only action cluster */}
                      <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-background p-0.5 shadow-sm group-hover:flex">
                        <RowAction
                          label="Delete draft"
                          onClick={() => deleteDraft(d.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </RowAction>
                        <RowAction
                          label="Edit draft"
                          onClick={() => editDraft(d)}
                        >
                          <Pencil className="size-3.5" />
                        </RowAction>
                        <RowAction
                          label="Schedule"
                          onClick={() => scheduleDraft(d)}
                        >
                          <Clock className="size-3.5" />
                        </RowAction>
                        <RowAction
                          label="Send now"
                          onClick={() => sendDraft(d)}
                        >
                          <Send className="size-3.5" />
                        </RowAction>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )
          ) : null}

          {tab === "scheduled" ? (
            scheduled.length === 0 ? (
              <EmptyScheduled />
            ) : (
              <ul className="overflow-hidden rounded-lg bg-background shadow-sm">
                {scheduled.map((m) => {
                  const r = recipientFor(m)
                  return (
                    <li
                      key={m.id}
                      className="group relative flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                    >
                      {me ? (
                        <UserAvatar
                          name={me.name}
                          src={me.avatar}
                          presence={me.presence}
                          size="sm"
                        />
                      ) : (
                        <div className="size-9 rounded-md bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-bold text-foreground">
                            {me?.name ?? "You"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            · to {r.icon}
                            <span className="font-medium text-foreground">
                              {r.label}
                            </span>
                          </span>
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {m.text}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.scheduledFor
                          ? new Date(m.scheduledFor).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "—"}
                      </div>
                      <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-background p-0.5 shadow-sm group-hover:flex">
                        <RowAction
                          label="Cancel"
                          onClick={() => cancelScheduled(m.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </RowAction>
                        <RowAction
                          label="Send now"
                          onClick={() => sendScheduledNow(m)}
                        >
                          <Send className="size-3.5" />
                        </RowAction>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )
          ) : null}

          {tab === "sent" ? (
            sent.length === 0 ? (
              <EmptySent />
            ) : (
              <ul className="overflow-hidden rounded-lg bg-background shadow-sm">
                {sent.map((m) => {
                  const r = recipientFor(m)
                  return (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                    >
                      {me ? (
                        <UserAvatar
                          name={me.name}
                          src={me.avatar}
                          presence={me.presence}
                          size="sm"
                        />
                      ) : (
                        <div className="size-9 rounded-md bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-bold text-foreground">
                            {me?.name ?? "You"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            · in {r.icon}
                            <span className="font-medium text-foreground">
                              {r.label}
                            </span>
                          </span>
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {m.text}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )
          ) : null}
        </div>
      </ScrollArea>
    </>
  )
}

function EmptyDrafts({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Pencil
        className="size-16 -rotate-12 text-purple-500"
        strokeWidth={1.5}
      />
      <h2 className="mt-4 text-base font-bold text-foreground">
        Draft messages to send when you’re ready
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Start typing a message anywhere, then find it here. Re-read, revise, and
        send whenever you’d like.
      </p>
      <Button variant="outline" className="mt-4" onClick={onNew}>
        New Message
      </Button>
    </div>
  )
}

function EmptyScheduled() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Clock className="size-12 text-purple-500" strokeWidth={1.5} />
      <h2 className="mt-4 text-base font-bold text-foreground">
        Schedule a message to send later
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Use the down-arrow next to the send button to choose when a message
        should go out.
      </p>
    </div>
  )
}

function EmptySent() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Send className="size-12 text-purple-500" strokeWidth={1.5} />
      <h2 className="mt-4 text-base font-bold text-foreground">
        Nothing sent yet
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Messages you send will appear here so you can revisit them later.
      </p>
    </div>
  )
}

function RowAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label={label}
            className="size-7 text-muted-foreground"
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
