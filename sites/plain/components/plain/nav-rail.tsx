"use client"

import * as React from "react"
import {
  IconCheck,
  IconClock,
  IconInbox,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
  IconUsers,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { Agent } from "@/app/lib/mock-data"
import { Kbd } from "./kbd"

export type NavRailView = "inbox" | "snoozed" | "done" | "search" | "customers"

const NAV_ITEMS: {
  id: NavRailView
  label: string
  icon: React.ElementType
  shortcut?: string
}[] = [
  { id: "inbox", label: "Inbox", icon: IconInbox, shortcut: "G I" },
  { id: "snoozed", label: "Snoozed", icon: IconClock, shortcut: "G S" },
  { id: "done", label: "Done", icon: IconCheck, shortcut: "G D" },
  { id: "search", label: "Search", icon: IconSearch, shortcut: "⌘ K" },
  { id: "customers", label: "Customers", icon: IconUsers, shortcut: "G C" },
]

/**
 * Left nav rail — workspace logo, vertical icon nav, theme toggle, avatar.
 * ~64px wide, monochrome, every icon-only button has a tooltip with shortcut.
 */
export function NavRail({
  view,
  onViewChange,
  onOpenCommand,
  agent,
}: {
  view: NavRailView
  onViewChange: (v: NavRailView) => void
  onOpenCommand: () => void
  agent: Agent
}) {
  const { resolvedTheme, setTheme } = useTheme()
  // Defer reading resolvedTheme to client to avoid SSR/CSR icon mismatch.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-border/60 bg-card/30 py-3">
      <div className="flex flex-col items-center gap-3">
        {/* Workspace logo */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="flex size-9 items-center justify-center rounded-md bg-foreground text-background transition-colors select-none hover:opacity-90">
                <span className="font-mono text-[15px] font-semibold tracking-tight">
                  P
                </span>
              </button>
            }
          />
          <TooltipContent side="right" sideOffset={8}>
            ThetaBench Support
          </TooltipContent>
        </Tooltip>

        <Separator className="w-7" />

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.id
            const Icon = item.icon
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => {
                        if (item.id === "search") onOpenCommand()
                        else onViewChange(item.id)
                      }}
                      data-active={isActive}
                      aria-label={item.label}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors",
                        "hover:bg-muted hover:text-foreground",
                        "data-[active=true]:bg-muted data-[active=true]:text-foreground"
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </button>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
                  </span>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-1">
        {/* Settings */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                aria-label="Settings"
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconSettings className="size-[18px]" />
              </button>
            }
          />
          <TooltipContent side="right" sideOffset={8}>
            Settings
          </TooltipContent>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle theme"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {mounted && resolvedTheme === "dark" ? (
                  <IconSun className="size-[18px]" />
                ) : (
                  <IconMoon className="size-[18px]" />
                )}
              </Button>
            }
          />
          <TooltipContent side="right" sideOffset={8}>
            <span className="flex items-center gap-2">
              Toggle theme <Kbd>D</Kbd>
            </span>
          </TooltipContent>
        </Tooltip>

        {/* Current user */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                aria-label={agent.fullName}
                className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-foreground/10 text-xs font-medium text-foreground">
                    {agent.initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <TooltipContent side="right" sideOffset={8}>
            {agent.fullName}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
