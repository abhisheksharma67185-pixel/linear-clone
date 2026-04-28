"use client"

/**
 * Inbox route — `/inbox`.
 *
 * Layout intent: a left list pane (fixed 320px) + a right detail pane
 * (flex). On first load the welcome notification is pre-selected so the
 * onboarding content renders immediately — matches the reference
 * screenshot. Clicking the row a second time deselects, dropping the
 * right pane to the "No unread notifications" empty state.
 *
 * The header on the left is borderless to match Linear's actual chrome
 * (the only divider is the per-row hairline). The right pane only
 * surfaces its top-right action pair (history + expand) once a
 * notification is selected; the empty state has no chrome.
 */

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FilterPopover,
  type FilterOption,
  type FilterSelection,
  parseFilterSelectionKey,
} from "@/components/filter-popover"
import {
  PriorityIcon as PriorityGlyph,
  StatusIcon as StatusGlyph,
} from "@/components/status-icons"
import {
  MoreHorizontalIcon,
  InboxCheckIcon,
  Clock01Icon,
  ArrowExpandDiagonal01Icon,
  ArrowDown01Icon,
  Tick02Icon,
  Notification01Icon,
  UserIcon,
  CubeIcon,
  Chart01Icon,
  StatusIcon,
  Cancel01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

// Notification type taxonomy — the 14 options below "System
// notifications" don't match any current inbox item, so by default the
// popover shows just System notifications + a clickable "14 options not
// matching any notifications" footer. Clicking the footer expands the
// list inline.
const NOTIFICATION_TYPES_OTHER = [
  "Apps and integrations",
  "Assignments",
  "Comments and replies",
  "Customer requests",
  "Document changes",
  "Mentions",
  "Pulse summaries",
  "Reactions",
  "Reminders and deadlines",
  "Reviews",
  "Status changes",
  "Subscriptions",
  "Triage",
  "Updates",
] as const

function CubeGlyph() {
  return (
    <HugeiconsIcon icon={CubeIcon} className="text-muted-foreground size-3.5" />
  )
}

// "Triage" isn't part of the shared `Status` union used by the rest of
// the app, but it shows up in Linear's status-type filter as a small
// orange dot inside a circle. Drawn inline so we don't have to widen the
// `StatusIcon` API.
function TriageGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5">
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill="none"
        stroke="#f97316"
        strokeWidth="1.5"
      />
      <circle cx="8" cy="8" r="2.5" fill="#f97316" />
    </svg>
  )
}

type InboxOrdering = "Newest" | "Oldest" | "Most relevant"
const INBOX_ORDERING_OPTIONS: InboxOrdering[] = [
  "Newest",
  "Oldest",
  "Most relevant",
]
// The actual Linear inbox display popover only exposes "ID" and
// "Status and icon" as toggleable display properties — keeping the set
// narrow matches the reference screenshot.
const INBOX_DISPLAY_PROPS = ["ID", "Status and icon"] as const
type InboxDisplayProp = (typeof INBOX_DISPLAY_PROPS)[number]

type Notification = {
  id: string
  title: string
  preview: string
  ago: string
  /** Notification type taxonomy used by the filter popover. */
  type: "System notifications" | (typeof NOTIFICATION_TYPES_OTHER)[number]
  /** Hours since the notification was sent — drives Newest/Oldest sort. */
  ageHours: number
  read: boolean
  snoozed: boolean
  /** Optional issue identifier surfaced when the "ID" display property is on. */
  issueId?: string
  /**
   * Optional issue status surfaced when the "Status and icon" display
   * property is on — leave undefined for non-issue notifications (e.g.
   * the welcome row) so no glyph renders.
   */
  status?: "todo" | "in_progress" | "done" | "backlog" | "cancelled"
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "welcome",
    title: "Welcome to Linear",
    preview: "Watch an introductory video and access a list o…",
    ago: "6d",
    ageHours: 24 * 6,
    type: "System notifications",
    read: false,
    snoozed: false,
  },
]

const RESOURCES = [
  {
    title: "Join a live onboarding session",
    description: "Learn the essentials and see demos of core workflows",
  },
  {
    title: "Join our Slack community",
    description: "Connect with other Linear users and get tips",
  },
  {
    title: "Onboarding videos",
    description: "Everything you need to know to get started with Linear",
  },
  {
    title: "AI workflows",
    description:
      "Leverage agents for project scoping, bug reports, and day-to-day product work",
  },
]

const KEY_FEATURES = [
  {
    title: "AI & Agents",
    description: "Automate your product development processes and operations",
  },
  {
    title: "Integration directory",
    description:
      "Discover 150+ connections from support tools (Intercom, Zendesk), to design (Figma)",
  },
]

export default function InboxPage() {
  // Filter selections from the FilterPopover — controlled here so the
  // pill bar above the notification list can render and the list can
  // actually be filtered. Keys are `${filterLabel}::${itemLabel}`.
  const [filterKeys, setFilterKeys] = useState<FilterSelection>(() => new Set())
  // Open state for the secondary "+" trigger that lives inside the
  // pill bar. The header trigger uses its own internal open state.
  const [pillFilterOpen, setPillFilterOpen] = useState(false)

  // Display-options state — local-only; matches Linear's inbox where
  // these toggles are user preferences, not URL-shareable. Declared
  // before `visibleNotifications` because the memo reads them.
  const [ordering, setOrdering] = useState<InboxOrdering>("Newest")
  const [showSnoozed, setShowSnoozed] = useState(false)
  const [showRead, setShowRead] = useState(true)
  const [showUnreadFirst, setShowUnreadFirst] = useState(false)
  const [displayProps, setDisplayProps] = useState<Set<InboxDisplayProp>>(
    () => new Set<InboxDisplayProp>(["ID", "Status and icon"])
  )
  const toggleDisplayProp = (p: InboxDisplayProp) =>
    setDisplayProps((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  const visibleNotifications = useMemo(() => {
    // 1. Apply popover filters (Notification type, etc.)
    const grouped = new Map<string, Set<string>>()
    for (const key of filterKeys) {
      const { filter, item } = parseFilterSelectionKey(key)
      if (!grouped.has(filter)) grouped.set(filter, new Set())
      grouped.get(filter)!.add(item)
    }
    let list = NOTIFICATIONS.filter((n) => {
      for (const [filter, items] of grouped) {
        if (filter === "Notification type" && !items.has(n.type)) return false
        // Other filters (From / Project / Issue priority / Issue status
        // type) don't apply to system notifications, so any non-empty
        // selection on them excludes the welcome row.
        if (filter !== "Notification type") return false
      }
      return true
    })

    // 2. Apply display-options visibility toggles.
    if (!showSnoozed) list = list.filter((n) => !n.snoozed)
    if (!showRead) list = list.filter((n) => !n.read)

    // 3. Apply ordering. "Most relevant" keeps the source order;
    // Newest/Oldest sort by ageHours.
    const sorted = [...list]
    if (ordering === "Newest") sorted.sort((a, b) => a.ageHours - b.ageHours)
    else if (ordering === "Oldest")
      sorted.sort((a, b) => b.ageHours - a.ageHours)

    // 4. "Show unread first" stable-partitions unread before read.
    if (showUnreadFirst) {
      const unread = sorted.filter((n) => !n.read)
      const read = sorted.filter((n) => n.read)
      return [...unread, ...read]
    }
    return sorted
  }, [filterKeys, showSnoozed, showRead, ordering, showUnreadFirst])

  const [selectedId, setSelectedId] = useState<string | null>("welcome")
  // If the active filter hides the currently-selected notification,
  // collapse the right pane to the empty state.
  const selected = visibleNotifications.find((n) => n.id === selectedId) ?? null

  // Notification-type filter starts collapsed (just "System
  // notifications" + a clickable footer summarising the 14 hidden
  // options). Clicking the footer expands the full list inline.
  const [notifTypeExpanded, setNotifTypeExpanded] = useState(false)
  const inboxFilterOptions: FilterOption[] = [
    {
      label: "Notification type",
      icon: Notification01Icon,
      kind: "checkbox",
      // The collapsed state shows just the matching option + a footer
      // pill, with no inline search; the search only appears once the
      // user expands the full list.
      hideSearch: !notifTypeExpanded,
      searchPlaceholder: notifTypeExpanded ? "Notification type" : undefined,
      submenu: notifTypeExpanded
        ? [
            { label: "System notifications", count: 1 },
            ...NOTIFICATION_TYPES_OTHER.map((label, i) => ({
              label,
              ...(i === 0 ? { groupBreakBefore: true } : {}),
            })),
          ]
        : [{ label: "System notifications", count: 1 }],
      footer: notifTypeExpanded ? undefined : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setNotifTypeExpanded(true)
          }}
          className="hover:text-foreground -mx-2.5 -my-1.5 flex w-[calc(100%+1.25rem)] items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors"
        >
          <HugeiconsIcon
            icon={Notification01Icon}
            className="text-muted-foreground size-3.5 shrink-0"
          />
          <span className="whitespace-nowrap">
            14 options not matching any notifications
          </span>
        </button>
      ),
    },
    {
      label: "From",
      icon: UserIcon,
      kind: "checkbox",
      hideSearch: true,
      submenu: [],
    },
    {
      label: "Project",
      icon: CubeIcon,
      kind: "checkbox",
      hideSearch: true,
      submenu: [
        { label: "No project", icon: <CubeGlyph /> },
        { label: "bbkbk", icon: <CubeGlyph /> },
      ],
    },
    {
      label: "Issue priority",
      icon: Chart01Icon,
      kind: "checkbox",
      submenu: [
        { label: "No priority", icon: <PriorityGlyph priority="none" /> },
        { label: "Urgent", icon: <PriorityGlyph priority="urgent" /> },
        { label: "High", icon: <PriorityGlyph priority="high" /> },
        { label: "Medium", icon: <PriorityGlyph priority="medium" /> },
        { label: "Low", icon: <PriorityGlyph priority="low" /> },
      ],
    },
    {
      label: "Issue status type",
      icon: StatusIcon,
      kind: "checkbox",
      submenu: [
        { label: "Triage", icon: <TriageGlyph /> },
        { label: "Backlog", icon: <StatusGlyph status="backlog" /> },
        { label: "Unstarted", icon: <StatusGlyph status="todo" /> },
        { label: "Started", icon: <StatusGlyph status="in_progress" /> },
        { label: "Completed", icon: <StatusGlyph status="done" /> },
        { label: "Canceled", icon: <StatusGlyph status="cancelled" /> },
      ],
    },
  ]

  return (
    <div className="flex h-full min-h-0 flex-1">
      <aside className="flex w-[320px] shrink-0 flex-col border-r">
        {/* Borderless list header — title + ⋯ menu on the left,
            filter / display-options circular pair on the right. */}
        <header className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <h1 className="text-sm font-medium">Inbox</h1>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Inbox actions"
                    className="text-muted-foreground size-6"
                  />
                }
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>
                  <HugeiconsIcon icon={InboxCheckIcon} className="size-4" />
                  <span className="flex-1">Delete all</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={InboxCheckIcon} className="size-4" />
                  <span className="flex-1">Delete all read</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    ⇧⌫
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-muted-foreground flex items-center gap-0.5">
            <FilterPopover
              options={inboxFilterOptions}
              showAiFilter={false}
              showAdvancedFilter={false}
              submenuSide="right"
              countNoun="notification"
              selectedKeys={filterKeys}
              onSelectedKeysChange={setFilterKeys}
              triggerRender={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Filter"
                  data-testid="inbox-filter-trigger"
                  className="size-7"
                >
                  {/*
                    Filter glyph (three decreasing pill bars) — matches
                    the style used by the search page and view detail
                    toolbar so Linear's "filter" icon reads consistently
                    across the app.
                  */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.25 3a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Zm2.75 3.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
                    />
                  </svg>
                </Button>
              }
            />
            <InboxDisplayPopover
              ordering={ordering}
              onOrderingChange={setOrdering}
              showSnoozed={showSnoozed}
              onShowSnoozedChange={setShowSnoozed}
              showRead={showRead}
              onShowReadChange={setShowRead}
              showUnreadFirst={showUnreadFirst}
              onShowUnreadFirstChange={setShowUnreadFirst}
              displayProps={displayProps}
              onToggleDisplayProp={toggleDisplayProp}
            />
          </div>
        </header>

        {filterKeys.size > 0 && (
          <InboxFilterPillBar
            selectedKeys={filterKeys}
            onSelectedKeysChange={setFilterKeys}
            filterOptions={inboxFilterOptions}
            popoverOpen={pillFilterOpen}
            onPopoverOpenChange={setPillFilterOpen}
          />
        )}

        <ul className="flex flex-1 flex-col overflow-auto">
          {visibleNotifications.length === 0 ? (
            <li className="text-muted-foreground px-4 py-6 text-center text-xs">
              No matching notifications
            </li>
          ) : (
            visibleNotifications.map((n) => {
              const active = n.id === selectedId
              const showId = displayProps.has("ID") && n.issueId
              const showStatus = displayProps.has("Status and icon") && n.status
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId((cur) => (cur === n.id ? null : n.id))
                    }
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      active ? "bg-accent/60" : "hover:bg-accent/40"
                    }`}
                  >
                    <LinearMark className="mt-0.5 size-7 shrink-0" />
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {showStatus && (
                            <StatusGlyph
                              status={n.status!}
                              className="size-3.5 shrink-0"
                            />
                          )}
                          {showId && (
                            <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                              {n.issueId}
                            </span>
                          )}
                          <p className="truncate text-sm">{n.title}</p>
                        </div>
                        <p
                          className={`text-muted-foreground truncate text-xs ${
                            n.read ? "opacity-60" : ""
                          }`}
                        >
                          {n.preview}
                        </p>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-[10px]">
                        {n.ago}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </aside>

      <section className="relative flex flex-1 flex-col">
        {selected ? (
          <>
            <header className="text-muted-foreground absolute top-0 right-0 z-10 flex items-center gap-0.5 px-3 py-2.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="History"
                className="size-7"
              >
                <HugeiconsIcon icon={Clock01Icon} className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open"
                className="size-7"
              >
                <HugeiconsIcon
                  icon={ArrowExpandDiagonal01Icon}
                  className="size-4"
                />
              </Button>
            </header>
            <WelcomeContent />
          </>
        ) : (
          <EmptyInbox />
        )}
      </section>
    </div>
  )
}

/**
 * Filter pill bar — renders one chip per selected option grouped by
 * filter (so e.g. selecting two notification types collapses to a
 * single "Notification type | is | A, B" chip), each removable via the
 * × button. The trailing "+" trigger opens the same FilterPopover used
 * by the header icon, sharing selection state via `selectedKeys`.
 */
function InboxFilterPillBar({
  selectedKeys,
  onSelectedKeysChange,
  filterOptions,
  popoverOpen,
  onPopoverOpenChange,
}: {
  selectedKeys: FilterSelection
  onSelectedKeysChange: (next: FilterSelection) => void
  filterOptions: FilterOption[]
  popoverOpen: boolean
  onPopoverOpenChange: (open: boolean) => void
}) {
  // Group selected keys back by their filter label, preserving the
  // first-seen filter order so the chip order is stable across renders.
  const grouped = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, string[]>()
    for (const key of selectedKeys) {
      const { filter, item } = parseFilterSelectionKey(key)
      if (!map.has(filter)) {
        map.set(filter, [])
        order.push(filter)
      }
      map.get(filter)!.push(item)
    }
    return order.map((filter) => ({ filter, items: map.get(filter)! }))
  }, [selectedKeys])

  const removeFilter = (filterLabel: string) => {
    const next = new Set(selectedKeys)
    for (const key of selectedKeys) {
      if (parseFilterSelectionKey(key).filter === filterLabel) next.delete(key)
    }
    onSelectedKeysChange(next)
  }

  return (
    <div
      data-testid="inbox-filter-pillbar"
      className="flex flex-wrap items-center gap-1.5 px-3 py-2"
    >
      {grouped.map(({ filter, items }) => (
        <div
          key={filter}
          data-testid={`inbox-filter-pill-${filter.toLowerCase().replace(/\s+/g, "-")}`}
          className="bg-muted text-foreground flex items-stretch overflow-hidden rounded text-xs"
        >
          <span className="text-muted-foreground px-2 py-1">{filter}</span>
          <span className="border-border/60 text-muted-foreground border-x px-2 py-1">
            is
          </span>
          <span className="max-w-[140px] truncate px-2 py-1">
            {items.length === 1
              ? items[0]
              : `${items[0]}${items.length > 1 ? ` +${items.length - 1}` : ""}`}
          </span>
          <button
            type="button"
            aria-label={`Remove ${filter} filter`}
            onClick={() => removeFilter(filter)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground border-border/60 flex items-center justify-center border-l px-1.5 transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
          </button>
        </div>
      ))}
      <FilterPopover
        options={filterOptions}
        showAiFilter={false}
        showAdvancedFilter={false}
        submenuSide="right"
        countNoun="notification"
        selectedKeys={selectedKeys}
        onSelectedKeysChange={onSelectedKeysChange}
        open={popoverOpen}
        onOpenChange={onPopoverOpenChange}
        triggerRender={
          <button
            type="button"
            aria-label="Add filter"
            data-testid="inbox-filter-pill-add"
            className="bg-muted text-muted-foreground hover:text-foreground flex size-6 items-center justify-center rounded transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
          </button>
        }
      />
    </div>
  )
}

/**
 * Linear brand mark — hairline circle bisected by a wedge so it reads
 * as the Linear logo even at 28px. Used as the avatar for the "Welcome
 * to Linear" notification, the hero glyph above the welcome heading, and
 * the placeholder inside the embedded video. `solid` switches off the
 * 0.55 opacity used for the small avatar variant.
 */
function LinearMark({
  className,
  solid = false,
}: {
  className?: string
  solid?: boolean
}) {
  const opacity = solid ? 1 : 0.55
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle
        cx="14"
        cy="14"
        r="13"
        stroke="currentColor"
        strokeOpacity={opacity}
        strokeWidth="1.4"
      />
      <path
        d="M3 14 A11 11 0 0 0 14 25 L14 14 Z"
        fill="currentColor"
        fillOpacity={opacity}
      />
    </svg>
  )
}

function EmptyInbox() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <svg
        viewBox="0 0 96 72"
        className="text-muted-foreground/50 h-16 w-20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 24 L24 24 L30 36 L66 36 L72 24 L92 24 L92 60 C92 63 90 65 87 65 L9 65 C6 65 4 63 4 60 Z" />
        <path d="M4 24 L16 6 L80 6 L92 24" />
      </svg>
      <p className="text-muted-foreground text-xs">No unread notifications</p>
    </div>
  )
}

function WelcomeContent() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-2xl px-12 pt-16 pb-16">
        <LinearMark className="text-foreground mb-6 size-9" solid />
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">
          Welcome to Linear
        </h1>
        <p className="text-foreground/80 mb-8 text-sm">
          Watch an introductory video and access a list of resources below.
        </p>

        <VideoBlock />

        <h2 className="mt-10 mb-4 text-base font-semibold">Resources</h2>
        <ul className="flex flex-col gap-4">
          {RESOURCES.map((r) => (
            <ResourceItem key={r.title} {...r} />
          ))}
        </ul>

        <h2 className="mt-10 mb-4 text-base font-semibold">Key features</h2>
        <ul className="flex flex-col gap-4">
          {KEY_FEATURES.map((r) => (
            <ResourceItem key={r.title} {...r} />
          ))}
        </ul>

        <p className="text-foreground/80 mt-8 text-sm">
          If what you&rsquo;re looking for doesn&rsquo;t exist yet, be sure to
          check out the{" "}
          <a className="text-violet-400 hover:underline" href="#">
            Linear API
          </a>{" "}
          and{" "}
          <a className="text-violet-400 hover:underline" href="#">
            MCP server
          </a>
          .{" "}
          <a className="text-violet-400 hover:underline" href="#">
            Learn more&nbsp;↗
          </a>
        </p>

        <hr className="border-border/60 my-8" />

        <p className="text-foreground/80 text-sm">
          If you have any questions hit the{" "}
          <kbd className="border-border/70 text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[11px]">
            ?
          </kbd>{" "}
          in the bottom left and select Contact us.
        </p>

        <ScreenshotMock className="mt-8" />
      </div>
    </div>
  )
}

function ResourceItem({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="text-muted-foreground/70">•</span>
      <div>
        <a className="text-sm text-violet-400 hover:underline" href="#">
          {title}
        </a>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </li>
  )
}

/**
 * Onboarding video — native HTML5 <video controls>, so the play / mute /
 * scrubber / fullscreen / picture-in-picture / playback-speed / download
 * affordances are all real (provided by the browser's built-in chrome).
 *
 * Source: Linear's CDN-hosted welcome clip. Pulled from the actual
 * Linear web app's "Welcome to Linear" notification (4K MP4, 16:9).
 * `crossOrigin="use-credentials"` matches the Linear app's request
 * mode so the response's Access-Control-Allow-Credentials header is
 * honoured. The Linear mark renders as a poster while metadata loads.
 */
const WELCOME_VIDEO_SRC =
  "https://uploads.linear.app/fe63b3e2-bf87-46c0-8784-cd7d639287c8/a044fb03-9b84-470c-ab6f-8eae613e2529/98d7274d-de7f-4910-b3f3-f72e8e286a98"

function VideoBlock() {
  return (
    <div className="overflow-hidden rounded-md bg-white">
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-200">
        <video
          className="absolute inset-0 size-full"
          controls
          preload="metadata"
          playsInline
          crossOrigin="use-credentials"
        >
          <source src={WELCOME_VIDEO_SRC} type="video/mp4" />
        </video>
        <LinearMark
          className="pointer-events-none size-16 text-zinc-900"
          solid
        />
      </div>
    </div>
  )
}

/**
 * Onboarding screenshot — the actual asset Linear's welcome notification
 * embeds, served from their CDN. Previously this was a hand-rolled JSX
 * mock of the same screenshot (dimmed issue list + "Ask a question"
 * modal); swapping in the real image keeps the rendered result
 * pixel-faithful to Linear's app and lets us delete ~120 lines of mock
 * markup that had to drift in lockstep with whatever Linear changed.
 *
 * Native `<img>` is intentional: Next/Image would require allow-listing
 * `uploads.linear.app` in `next.config.js`, and the asset is a static
 * 1920×1080 raster — no responsive variants to fetch.
 */
const WELCOME_SCREENSHOT_SRC =
  "https://uploads.linear.app/fe63b3e2-bf87-46c0-8784-cd7d639287c8/bc9bbf62-4192-411f-88f6-c89c9150503e/4df0346e-803b-4f58-8527-4aeb30d88411"

function ScreenshotMock({ className }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-md bg-black ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={WELCOME_SCREENSHOT_SRC}
        alt="Linear's Ask a question modal floating over a dimmed issue list"
        width={1920}
        height={1080}
        loading="lazy"
        className="block h-auto w-full"
      />
    </div>
  )
}

/**
 * Display-options popover for the inbox header — anchored to the
 * second circular icon (two-knob sliders). Mirrors the structure of
 * the search and views display popovers so the three surfaces feel
 * like siblings:
 *   - **Ordering**: dropdown of sort modes (Newest / Oldest / Most relevant).
 *   - **Show snoozed / Show read / Show unread first**: three boolean
 *     checkboxes controlling list visibility.
 *   - **Display properties**: dashed-pill toggles for "ID" and
 *     "Status and icon" — the same minimal set Linear's actual inbox
 *     surfaces.
 */
function InboxDisplayPopover({
  ordering,
  onOrderingChange,
  showSnoozed,
  onShowSnoozedChange,
  showRead,
  onShowReadChange,
  showUnreadFirst,
  onShowUnreadFirstChange,
  displayProps,
  onToggleDisplayProp,
}: {
  ordering: InboxOrdering
  onOrderingChange: (v: InboxOrdering) => void
  showSnoozed: boolean
  onShowSnoozedChange: (v: boolean) => void
  showRead: boolean
  onShowReadChange: (v: boolean) => void
  showUnreadFirst: boolean
  onShowUnreadFirstChange: (v: boolean) => void
  displayProps: Set<InboxDisplayProp>
  onToggleDisplayProp: (p: InboxDisplayProp) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Display options"
            data-testid="inbox-display-trigger"
            className="size-7"
          />
        }
      >
        {/* Display-options glyph (two-knob sliders). */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7 2.5C8.11933 2.5 9.06613 3.23584 9.38477 4.25H14.75C15.1642 4.25 15.5 4.58579 15.5 5C15.5 5.41421 15.1642 5.75 14.75 5.75H9.38477C9.06613 6.76416 8.11933 7.5 7 7.5C5.88067 7.5 4.93387 6.76416 4.61523 5.75H2.25C1.83579 5.75 1.5 5.41421 1.5 5C1.5 4.58579 1.83579 4.25 2.25 4.25H4.61523C4.93387 3.23584 5.88067 2.5 7 2.5ZM7 4C6.44772 4 6 4.44772 6 5C6 5.55228 6.44772 6 7 6C7.55228 6 8 5.55228 8 5C8 4.44772 7.55228 4 7 4Z"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 13.5C8.88067 13.5 7.93387 12.7642 7.61523 11.75H2.25C1.83579 11.75 1.5 11.4142 1.5 11C1.5 10.5858 1.83579 10.25 2.25 10.25H7.61523C7.93387 9.23584 8.88067 8.5 10 8.5C11.1193 8.5 12.0661 9.23584 12.3848 10.25H14.75C15.1642 10.25 15.5 10.5858 15.5 11C15.5 11.4142 15.1642 11.75 14.75 11.75H12.3848C12.0661 12.7642 11.1193 13.5 10 13.5ZM10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12Z"
          />
        </svg>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        data-testid="inbox-display-popover"
        className="w-72 gap-0 p-0"
      >
        {/* Ordering */}
        <div className="flex flex-col px-2.5 py-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-xs">Ordering</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    data-testid="inbox-ordering-select"
                    className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium focus:outline-none"
                  />
                }
              >
                <span>{ordering}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="text-muted-foreground size-3"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-44 p-1"
              >
                {INBOX_ORDERING_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o}
                    data-testid={`inbox-ordering-option-${o.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => onOrderingChange(o)}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs"
                  >
                    <span>{o}</span>
                    {ordering === o && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="text-muted-foreground size-3.5"
                      />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="border-border/60 border-t" />

        {/* Boolean toggles */}
        <div className="flex flex-col px-2.5 py-2">
          <InboxToggleRow
            id="inbox-show-snoozed"
            label="Show snoozed"
            checked={showSnoozed}
            onChange={onShowSnoozedChange}
          />
          <InboxToggleRow
            id="inbox-show-read"
            label="Show read"
            checked={showRead}
            onChange={onShowReadChange}
          />
          <InboxToggleRow
            id="inbox-show-unread-first"
            label="Show unread first"
            checked={showUnreadFirst}
            onChange={onShowUnreadFirstChange}
          />
        </div>
        <div className="border-border/60 border-t" />

        {/* Display properties */}
        <div className="flex flex-col px-2.5 py-2">
          <span className="text-muted-foreground py-1 text-[11px]">
            Display properties
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
            {INBOX_DISPLAY_PROPS.map((prop) => {
              const active = displayProps.has(prop)
              return (
                <button
                  key={prop}
                  type="button"
                  onClick={() => onToggleDisplayProp(prop)}
                  aria-pressed={active}
                  data-testid={`inbox-display-prop-${prop.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-dashed"
                  }`}
                >
                  {prop}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function InboxToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </label>
      <Switch
        id={id}
        data-testid={id}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  )
}
