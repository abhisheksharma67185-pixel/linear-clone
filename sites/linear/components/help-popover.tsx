"use client"

/**
 * Shared help (?) popover used by the global app sidebar and the settings
 * sidebar footer. Mirrors Linear's help menu: search input + ordered items
 * + "What's new" group below.
 *
 * The search input filters the local item list by name. Linear's
 * production help search also queries the docs site index, but the clone
 * has no docs index to hit — so the popover items are the only data
 * source.
 *
 * The popover also listens for a custom `linear:open-help` window event so
 * global keyboard shortcuts (`?`, `⌘/`) can open it without prop drilling
 * a controlled-open flag through the sidebar.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { OPEN_KEYBOARD_SHORTCUTS_EVENT } from "@/components/keyboard-shortcuts-panel"
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
  /**
   * Click handler for items that don't navigate — e.g. "Keyboard shortcuts"
   * opens the side panel rather than visiting a URL. When provided, takes
   * precedence over `href`.
   */
  onSelect?: () => void
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

/**
 * "What's new" rows. Each row gets a small filled-circle bullet in
 * the muted-foreground color so they read as a neutral list marker
 * rather than a category cue.
 */
const WHATS_NEW: { label: string; href: string }[] = [
  {
    label: "Releases",
    href: "https://linear.app/releases",
  },
  {
    label: "Linear Agent MCP support",
    href: "https://linear.app/changelog/linear-agent-mcp",
  },
  {
    label: "Full changelog",
    href: "https://linear.app/changelog",
  },
]

export const OPEN_HELP_EVENT = "linear:open-help"

export function HelpPopover({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  // Global keyboard shortcuts dispatch this event on the window. Each
  // mounted HelpPopover instance opens itself in response — the app
  // typically has a single visible instance at a time (sidebar OR
  // settings footer) so this doesn't double-open in practice.
  useEffect(() => {
    const onOpenHelp = () => setOpen(true)
    window.addEventListener(OPEN_HELP_EVENT, onOpenHelp)
    return () => window.removeEventListener(OPEN_HELP_EVENT, onOpenHelp)
  }, [])

  // Case-insensitive substring match against the visible label of each
  // item. Empty query passes everything through unchanged so the
  // popover reads exactly the same when the user hasn't typed.
  const normalised = query.trim().toLowerCase()
  const filteredItems = useMemo(
    () =>
      normalised.length === 0
        ? HELP_ITEMS
        : HELP_ITEMS.filter((i) => i.label.toLowerCase().includes(normalised)),
    [normalised]
  )
  const filteredWhatsNew = useMemo(
    () =>
      normalised.length === 0
        ? WHATS_NEW
        : WHATS_NEW.filter((i) => i.label.toLowerCase().includes(normalised)),
    [normalised]
  )
  const hasResults = filteredItems.length + filteredWhatsNew.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger as React.ReactElement} />
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-72 p-2"
      >
        <div className="relative mb-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Help with…"
            aria-label="Help with"
            className="placeholder:text-muted-foreground/60 focus-visible:ring-ring h-8 w-full rounded-md border bg-transparent pr-2 pl-8 text-xs outline-none focus-visible:ring-2"
          />
        </div>

        {filteredItems.length > 0 && (
          <div className="flex flex-col">
            {filteredItems.map((item) => {
              // The "Keyboard shortcuts" row opens the side panel
              // instead of navigating. Inject the onSelect here rather
              // than baking it into HELP_ITEMS so the data table stays
              // serialisable.
              const decorated: HelpItem =
                item.label === "Keyboard shortcuts"
                  ? {
                      ...item,
                      onSelect: () => {
                        setOpen(false)
                        window.dispatchEvent(
                          new CustomEvent(OPEN_KEYBOARD_SHORTCUTS_EVENT)
                        )
                      },
                    }
                  : item
              return (
                <HelpRow
                  key={item.label}
                  item={decorated}
                  onClose={() => setOpen(false)}
                />
              )
            })}
          </div>
        )}

        {filteredWhatsNew.length > 0 && (
          <>
            <div className="text-muted-foreground/70 mt-2 mb-1 px-2 text-[11px] font-semibold tracking-wide uppercase">
              What&apos;s new
            </div>
            <div className="flex flex-col">
              {filteredWhatsNew.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    // Base UI's Popover closes on outside-click and the
                    // unmount can race with the anchor's native
                    // navigation — by the time the browser tries to
                    // open the URL, the link has been torn out of the
                    // DOM and nothing happens. Drive the navigation
                    // explicitly so the click is guaranteed to land.
                    event.preventDefault()
                    setOpen(false)
                    window.open(item.href, "_blank", "noopener,noreferrer")
                  }}
                  className="text-foreground hover:bg-accent/50 focus-visible:ring-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-xs focus-visible:ring-2 focus-visible:outline-none"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="text-muted-foreground shrink-0"
                  >
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                  </svg>
                  <span className="flex-1 truncate">{item.label}</span>
                </a>
              ))}
            </div>
          </>
        )}

        {!hasResults && (
          <div className="text-muted-foreground px-2 py-3 text-center text-xs">
            No results
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function HelpRow({ item, onClose }: { item: HelpItem; onClose?: () => void }) {
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
    // Internal route — let Next.js routing handle it. Close the
    // popover on click so it doesn't linger on the destination page.
    return (
      <a href={item.href} className={className} onClick={onClose}>
        {inner}
      </a>
    )
  }
  if (item.href) {
    // External link — drive the navigation explicitly. Base UI's
    // Popover unmounts on outside-click, which can race with the
    // anchor's native click handler so the new tab never opens.
    // Using `window.open` after `setOpen(false)` makes the click
    // reliable regardless of the unmount timing.
    const href = item.href
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          event.preventDefault()
          onClose?.()
          window.open(href, "_blank", "noopener,noreferrer")
        }}
        className={className}
      >
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={className} onClick={item.onSelect}>
      {inner}
    </button>
  )
}
