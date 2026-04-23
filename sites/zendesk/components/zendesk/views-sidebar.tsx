"use client"

import {
  IconArchive,
  IconLayoutColumns,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react"
import * as React from "react"

import { cn } from "@/lib/utils"

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const SECTIONS: SidebarSection[] = [
  {
    title: "Your work",
    items: [{ id: "tickets", label: "Tickets", icon: IconLayoutColumns }],
  },
  {
    title: "Shared work",
    items: [
      { id: "ccd", label: "CC'd", icon: IconUserPlus },
      { id: "following", label: "Following", icon: IconUsers },
    ],
  },
  {
    title: "Completed work",
    items: [{ id: "last-30", label: "Last 30 days", icon: IconArchive }],
  },
]

export function ViewsSidebar() {
  // Default selection matches the screenshot: "Tickets" inside "Your work".
  const [active, setActive] = React.useState("tickets")

  return (
    <aside
      aria-label="Views"
      className="flex h-full w-60 shrink-0 flex-col border-r bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-5 px-3 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <div className="px-2 text-sm font-semibold text-foreground">
              {section.title}
            </div>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActive(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        isActive && "bg-muted text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
