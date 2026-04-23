import {
  IconBell,
  IconHelpCircle,
  IconLayoutGrid,
  IconPhone,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TopToolbarProps {
  agentName: string
  conversations: number
}

// White app toolbar that sits below the trial bar — Zendesk "Z" + Add
// button on the left, search/notification cluster + avatar on the right.
export function TopToolbar({ agentName, conversations }: TopToolbarProps) {
  const initials = agentName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-12 w-full items-center justify-between gap-3 border-b bg-card px-3 text-card-foreground">
      <div className="flex items-center gap-2">
        <div
          aria-label="Zendesk"
          className="flex size-8 items-center justify-center rounded-md bg-zinc-900 font-heading text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Z
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <IconPlus data-icon="inline-start" />
          Add
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Search">
                <IconSearch />
              </Button>
            }
          />
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        <Badge variant="secondary" className="gap-1.5 pl-2">
          Conversations
          <span className="rounded-full bg-muted-foreground/20 px-1.5 text-[11px] leading-4 font-semibold text-foreground">
            {conversations}
          </span>
        </Badge>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Phone">
                <IconPhone />
              </Button>
            }
          />
          <TooltipContent>Phone</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                <IconBell />
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
                size="icon-sm"
                aria-label="Play simulator"
                className="relative"
              >
                <IconPlayerPlay />
                <span
                  aria-hidden
                  className="absolute top-1 right-1 size-1.5 rounded-full bg-sky-500"
                />
              </Button>
            }
          />
          <TooltipContent>Play (simulator)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Apps">
                <IconLayoutGrid />
              </Button>
            }
          />
          <TooltipContent>Apps</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Help">
                <IconHelpCircle />
              </Button>
            }
          />
          <TooltipContent>Help</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`Signed in as ${agentName}`}
                className="relative inline-flex items-center justify-center rounded-full"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-900">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-hidden
                  className="absolute -right-0 -bottom-0 size-2 rounded-full bg-emerald-500 ring-2 ring-card"
                />
              </button>
            }
          />
          <TooltipContent>{agentName}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
