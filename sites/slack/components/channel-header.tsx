"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Columns2,
  Copy,
  FilePlus,
  Hash,
  Headphones,
  Info,
  LayoutList,
  Lock,
  LogOut,
  MoreHorizontal,
  MoveRight,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
  Volume2,
  Workflow,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

// Tabs that real Slack shows beneath the channel title. Mapped to the
// existing channel sub-pages we already have.
type ChannelTab = {
  label: string
  href: (name: string) => string
  // True iff the given pathname should highlight this tab.
  matches: (pathname: string, name: string) => boolean
}

const TABS: ChannelTab[] = [
  {
    label: "Messages",
    href: (name) => `/c/${name}`,
    matches: (p, name) =>
      p === `/c/${name}` ||
      p === `/c/${name}/pins` ||
      p === `/c/${name}/members`,
  },
  {
    label: "Canvas",
    href: (name) => `/c/${name}/canvas`,
    matches: (p, name) => p.startsWith(`/c/${name}/canvas`),
  },
  {
    label: "Files",
    href: (name) => `/c/${name}/files`,
    matches: (p, name) => p.startsWith(`/c/${name}/files`),
  },
  {
    label: "Lists",
    href: (name) => `/c/${name}/lists`,
    matches: (p, name) => p.startsWith(`/c/${name}/lists`),
  },
]

export function ChannelHeader({ channel }: { channel: Channel }) {
  const pathname = usePathname()
  const router = useRouter()
  const Icon =
    channel.type === "private" ? Lock : channel.isShared ? Volume2 : Hash

  const [starred, setStarred] = useState(false)
  const [notifLevel, setNotifLevel] = useState<NotifLevel>("all")
  const [notifOpen, setNotifOpen] = useState(false)
  const [huddleStarting, setHuddleStarting] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

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
    <header className="flex shrink-0 flex-col border-b border-border bg-background">
      {/* Title row */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-1">
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
          <button
            type="button"
            className="flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-muted"
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate text-base font-bold text-foreground">
              {channel.name}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
          {channel.isArchived ? (
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
              Archived
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/c/${channel.name}/members`}
                  aria-label="Members"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-8 w-auto gap-1 px-2 text-muted-foreground"
                  )}
                >
                  <Users className="size-4" />
                  <span className="text-xs font-semibold tabular-nums">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
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
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 text-muted-foreground",
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
                  href={`/search?q=in%3A${encodeURIComponent(channel.name)}+`}
                  aria-label="Search this channel"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-8 text-muted-foreground"
                  )}
                >
                  <Search className="size-4" />
                </Link>
              }
            />
            <TooltipContent>Search this channel</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label="More channel actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem
                onClick={() => router.push(`/c/${channel.name}/settings`)}
              >
                <Info className="size-3.5" />
                Open channel details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Summarizing channel…")}
              >
                <Sparkles className="size-3.5" />
                Summarize channel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setNotifOpen(true)}>
                <Bell className="size-3.5" />
                Edit notifications
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success(`Starred #${channel.name}`)}
              >
                <Star className="size-3.5" />
                Star channel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Move channel…")}>
                <MoveRight className="size-3.5" />
                Move channel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Choose a template…")}
              >
                <FilePlus className="size-3.5" />
                Add a template to channel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/workflows")}>
                <Workflow className="size-3.5" />
                Add a workflow
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/c/${channel.name}/settings`)}
              >
                <Settings className="size-3.5" />
                Edit settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(`${window.location.origin}/c/${channel.name}`)
                    .then(() => toast.success("Channel link copied"))
                    .catch(() => toast.error("Copy failed"))
                }}
              >
                <Copy className="size-3.5" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/search?q=in%3A${encodeURIComponent(channel.name)}+`
                  )
                }
              >
                <Search className="size-3.5" />
                Search in channel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Split view coming soon")}
              >
                <Columns2 className="size-3.5" />
                Open in split view
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => toast.success(`Left #${channel.name}`)}
              >
                <LogOut className="size-3.5" />
                Leave channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab row — Messages / Canvas / Files / Lists / + */}
      <nav
        aria-label="Channel views"
        className="flex h-9 items-center gap-1 border-t border-border px-3"
      >
        {TABS.map((tab) => {
          const isActive = tab.matches(pathname, channel.name)
          return (
            <Link
              key={tab.label}
              href={tab.href(channel.name)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-full items-center gap-1.5 px-3 text-xs font-semibold transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label === "Canvas" ? (
                <span className="rounded-sm bg-emerald-500/15 px-1 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                  +
                </span>
              ) : null}
              {tab.label}
              {isActive ? (
                <span className="absolute right-2 bottom-0 left-2 h-0.5 rounded-t bg-foreground" />
              ) : null}
            </Link>
          )
        })}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 size-7 text-muted-foreground"
                aria-label="Add tab"
              >
                <Plus className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent>Add a tab</TooltipContent>
        </Tooltip>

        {channel.topic ? (
          <span className="ml-3 max-w-xl truncate text-xs text-muted-foreground">
            {channel.topic}
          </span>
        ) : null}
      </nav>
    </header>
  )
}
