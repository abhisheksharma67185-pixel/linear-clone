"use client"

/**
 * Shared help (?) popover used by the global app sidebar and the settings
 * sidebar footer. Mirrors Linear's help menu: search input + ordered items
 * + "What's new" group below.
 *
 * The search input is intentionally UI-only (no backend) — Linear's
 * production help search powers the docs site, but the clone has no
 * docs index to query.
 */

import { useState, type ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Search01Icon,
  BookUploadIcon,
  CustomerSupportIcon,
  SourceCodeIcon,
  ActivitySparkIcon,
  AppStoreIcon,
  Settings02Icon,
  SlackIcon,
} from "@hugeicons/core-free-icons"

type HelpItem = {
  label: string
  icon: IconSvgElement
  shortcut?: string
  href?: string
}

const HELP_ITEMS: HelpItem[] = [
  {
    label: "Docs",
    icon: BookUploadIcon,
    href: "https://linear.app/docs",
  },
  {
    label: "Contact us",
    icon: CustomerSupportIcon,
    href: "https://linear.app/contact",
  },
  {
    label: "Keyboard shortcuts",
    icon: SourceCodeIcon,
    shortcut: "⌘/",
  },
  {
    label: "Linear status",
    icon: ActivitySparkIcon,
    href: "https://linearstatus.com",
  },
  {
    label: "Download apps",
    icon: AppStoreIcon,
    href: "https://linear.app/download",
  },
  {
    label: "Settings",
    icon: Settings02Icon,
    shortcut: "G then S",
    href: "/settings",
  },
  {
    label: "Slack community",
    icon: SlackIcon,
    href: "https://linear.app/join-slack",
  },
]

const WHATS_NEW: { label: string; href: string }[] = [
  {
    label: "Linear Agent MCP support",
    href: "https://linear.app/changelog/linear-agent-mcp",
  },
  {
    label: "Project update templates",
    href: "https://linear.app/changelog/project-update-templates",
  },
  {
    label: "Full changelog",
    href: "https://linear.app/changelog",
  },
]

export function HelpPopover({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger as React.ReactElement} />
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-72 p-2"
      >
        {/* Search input — UI-only, no backend index. */}
        <div className="relative mb-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help…"
            aria-label="Search help"
            className="placeholder:text-muted-foreground/60 focus-visible:ring-ring h-8 w-full rounded-md border bg-transparent pr-2 pl-8 text-xs outline-none focus-visible:ring-2"
          />
        </div>

        <div className="flex flex-col">
          {HELP_ITEMS.map((item) => (
            <HelpRow key={item.label} item={item} />
          ))}
        </div>

        <div className="text-muted-foreground/70 mt-2 mb-1 px-2 text-[11px] font-semibold tracking-wide uppercase">
          What&apos;s new
        </div>
        <div className="flex flex-col">
          {WHATS_NEW.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:bg-accent/50 focus-visible:ring-ring flex items-center justify-between rounded-md px-2 py-1.5 text-xs focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="truncate">{item.label}</span>
              <span aria-hidden="true" className="text-muted-foreground">
                ↗
              </span>
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function HelpRow({ item }: { item: HelpItem }) {
  const className =
    "text-foreground hover:bg-accent/50 focus-visible:ring-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
  const inner = (
    <>
      <HugeiconsIcon
        icon={item.icon}
        className="text-muted-foreground size-3.5 shrink-0"
        aria-hidden="true"
      />
      <span className="flex-1 text-left">{item.label}</span>
      {item.shortcut && (
        <span className="text-muted-foreground text-[11px]">
          {item.shortcut}
        </span>
      )}
    </>
  )
  if (item.href && item.href.startsWith("/")) {
    // Internal route — let Next.js routing handle it.
    return (
      <a href={item.href} className={className}>
        {inner}
      </a>
    )
  }
  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={className}>
      {inner}
    </button>
  )
}
