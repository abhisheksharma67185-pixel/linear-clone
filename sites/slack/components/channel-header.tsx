"use client"

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
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Channel = {
  id: string
  name: string
  topic: string
  type: "public" | "private"
  isArchived: boolean
  isShared: boolean
  memberIds: string[]
}

export function ChannelHeader({ channel }: { channel: Channel }) {
  const Icon =
    channel.type === "private" ? Lock : channel.isShared ? Volume2 : Hash
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
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          aria-label="Star channel"
        >
          <Star className="size-3.5" />
        </Button>
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
              <Button variant="ghost" size="icon" className="size-8">
                <Headphones className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Start huddle</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <Bell className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 w-auto gap-1 px-2"
              >
                <Users className="size-4" />
                <span className="text-xs font-semibold">
                  {channel.memberIds.length}
                </span>
              </Button>
            }
          />
          <TooltipContent>Members</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <Info className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Channel info</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
