"use client"

import {
  IconBook2,
  IconBuildingSkyscraper,
  IconChartBar,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface RailItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const ITEMS: RailItem[] = [
  { id: "home", label: "Home", icon: IconHome },
  { id: "knowledge", label: "Knowledge", icon: IconBook2 },
  { id: "customers", label: "Customers", icon: IconUsers },
  { id: "organizations", label: "Organizations", icon: IconBuildingSkyscraper },
  { id: "reports", label: "Reports", icon: IconChartBar },
  { id: "settings", label: "Admin", icon: IconSettings },
]

export function IconRail() {
  const [active, setActive] = React.useState("home")

  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r bg-card py-3"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "size-10 rounded-md text-muted-foreground hover:text-foreground",
                    isActive && "bg-muted text-foreground"
                  )}
                  onClick={() => setActive(item.id)}
                >
                  <Icon />
                </Button>
              }
            />
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
