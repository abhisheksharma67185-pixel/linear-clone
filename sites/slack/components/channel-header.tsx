"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Hash,
  Lock,
  Star,
  Headphones,
  Volume2,
  Bell,
  Users,
  Info,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Channel = {
  id: string
  name: string
  topic: string
  type: "public" | "private"
  isArchived: boolean
  isShared: boolean
  memberIds: string[]
}

type NotifLevel = "all" | "mentions" | "off"
const NOTIF_LEVELS: { value: NotifLevel; label: string }[] = [
  { value: "all", label: "All new messages" },
  { value: "mentions", label: "Just mentions and DMs" },
  { value: "off", label: "Nothing" },
]

export function ChannelHeader({ channel }: { channel: Channel }) {
  const Icon =
    channel.type === "private" ? Lock : channel.isShared ? Volume2 : Hash

  const [starred, setStarred] = useState(false)
  const [notifLevel, setNotifLevel] = useState<NotifLevel>("all")
  const [huddleStarting, setHuddleStarting] = useState(false)

  // Pull the per-channel toggles out of preferences. Using a separate
  // fetch (vs a context) keeps the header self-contained.
  useEffect(() => {
    fetch("/api/data/preferences")
      .then((r) => r.json())
      .then((p: Record<string, unknown>) => {
        const stars = Array.isArray(p?.starredChannelIds)
          ? (p.starredChannelIds as string[])
          : []
        setStarred(stars.includes(channel.id))
        const notifs = (p?.channelNotifs as Record<string, NotifLevel>) ?? {}
        setNotifLevel(notifs[channel.id] ?? "all")
      })
      .catch(() => {})
  }, [channel.id])

  const persistPrefs = async (patch: Record<string, unknown>) => {
    await fetch("/api/data/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  }

  const toggleStar = async () => {
    const next = !starred
    setStarred(next)
    // Read-modify-write on the prefs slot to avoid clobbering other channels.
    const p = await fetch("/api/data/preferences").then((r) => r.json())
    const current: string[] = Array.isArray(p?.starredChannelIds)
      ? p.starredChannelIds
      : []
    const updated = next
      ? Array.from(new Set([...current, channel.id]))
      : current.filter((id) => id !== channel.id)
    await persistPrefs({ starredChannelIds: updated })
  }

  const setNotif = async (level: NotifLevel) => {
    setNotifLevel(level)
    const p = await fetch("/api/data/preferences").then((r) => r.json())
    const map: Record<string, NotifLevel> =
      (p?.channelNotifs as Record<string, NotifLevel>) ?? {}
    map[channel.id] = level
    await persistPrefs({ channelNotifs: map })
    toast.success(
      level === "off"
        ? `Muted #${channel.name}`
        : `Notifications for #${channel.name} set to "${level}"`
    )
  }

  const startHuddle = async () => {
    if (huddleStarting) return
    setHuddleStarting(true)
    const res = await fetch("/api/data/huddles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: channel.id }),
    })
    setHuddleStarting(false)
    if (res.ok) {
      toast.success(`Started huddle in #${channel.name}`)
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to start huddle")
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate font-bold text-foreground">
            {channel.name}
          </span>
        </button>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleStar}
                className={cn(
                  "size-7",
                  starred ? "text-yellow-500" : "text-muted-foreground"
                )}
                aria-pressed={starred}
                aria-label={starred ? "Unstar channel" : "Star channel"}
              >
                <Star
                  className={cn("size-3.5", starred && "fill-yellow-500")}
                />
              </Button>
            }
          />
          <TooltipContent>
            {starred ? "Unstar channel" : "Star channel"}
          </TooltipContent>
        </Tooltip>
        {channel.topic ? (
          <span className="ml-1 max-w-xl truncate text-xs text-muted-foreground">
            {channel.topic}
          </span>
        ) : (
          <span className="ml-1 text-xs text-muted-foreground italic">
            Add a topic
          </span>
        )}
        {channel.isArchived ? (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
            Archived
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={startHuddle}
                disabled={channel.isArchived || huddleStarting}
                aria-label="Start huddle"
              >
                <Headphones className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Start huddle</TooltipContent>
        </Tooltip>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8",
                  notifLevel !== "all" && "text-yellow-500"
                )}
                aria-label="Notification preferences"
              >
                <Bell className="size-4" />
              </Button>
            }
          />
          <PopoverContent align="end" className="w-60 p-1">
            <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Notifications for #{channel.name}
            </div>
            {NOTIF_LEVELS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setNotif(opt.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                  notifLevel === opt.value && "font-semibold"
                )}
              >
                <span
                  className={cn(
                    "flex size-3 items-center justify-center rounded-full border",
                    notifLevel === opt.value
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                />
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`/c/${channel.name}/members`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-8 w-auto gap-1 px-2"
                )}
              >
                <Users className="size-4" />
                <span className="text-xs font-semibold">
                  {channel.memberIds.length}
                </span>
              </Link>
            }
          />
          <TooltipContent>Members</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`/c/${channel.name}/settings`}
                aria-label="Channel info"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-8"
                )}
              >
                <Info className="size-4" />
              </Link>
            }
          />
          <TooltipContent>Channel info</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
