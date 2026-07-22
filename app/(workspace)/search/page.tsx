"use client"

/**
 * Workspace search route — full-page version of the search experience
 * that previously only existed as a dialog (`components/search-dialog`).
 *
 * The regression this fixes: deep-linking to `/search` rendered a
 * blank page because no route component existed; the search UI only
 * mounted when the sidebar Search button opened the dialog. Hitting
 * the URL directly (e.g. browser history, hotkey shortcut, or any
 * external link) produced an empty `<SidebarInset>` with nothing in it.
 *
 * The contract this page enforces:
 *   1. The search input renders on first paint, before any query
 *      has been typed (no blank-screen state).
 *   2. The tabs strip and "type to search" empty state are visible
 *      on initial mount, regardless of `useSearchParams()` value.
 *   3. The page is read-only deep-linkable — `?q=foo` pre-fills the
 *      input so search URLs are shareable.
 */

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  StatusIcon,
  UserIcon,
  PencilEdit01Icon,
  CalendarSyncIcon,
  CalendarAdd01Icon,
  ArrowDown01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { FilterPopover, type FilterOption } from "@/components/filter-popover"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusIcon as SharedStatusIcon } from "@/components/status-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { members, issues, projects } from "@/app/lib/mock-data"
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"

type SearchOrdering = "Most relevant" | "Recently created" | "Recently updated"
const ORDERING_OPTIONS: SearchOrdering[] = [
  "Most relevant",
  "Recently created",
  "Recently updated",
]
// Linear's global search display popover only exposes "ID" as a toggleable
// display property — list views (issues, projects) have the richer set of
// status/priority/assignee/etc. toggles, but search results stay minimal.
const ALL_DISPLAY_PROPS = ["ID"] as const
type DisplayProp = (typeof ALL_DISPLAY_PROPS)[number]

type Tab = "all" | "issues" | "projects" | "documents"

// Inline icons for submenu rows.
// Linear shows visually distinct status indicators per status; we reuse the
// shared StatusIcon for the existing 5 statuses and supply small SVGs for the
// two extras (Triage, Planned) that aren't part of the issue model.
function TriageStatusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="#f97316"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="8" r="1.6" fill="#f97316" />
    </svg>
  )
}

function PlannedStatusIcon() {
  return (
    <span
      aria-hidden="true"
      className="border-muted-foreground/70 size-3.5 rounded-full border border-dotted"
    />
  )
}

function GenericPersonIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <circle cx="8" cy="6" r="2.5" />
      <path d="M3.5 13.5 C3.5 11 5.5 9.5 8 9.5 C10.5 9.5 12.5 11 12.5 13.5" />
    </svg>
  )
}

function NoAssigneeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="2" />
      <path d="M2 13 C2 10.8 3.8 9.5 6 9.5 C8.2 9.5 10 10.8 10 13" />
      <circle cx="11.5" cy="7" r="1.5" />
      <path d="M9 13 C9 11.5 10 10.8 11.5 10.8 C13 10.8 14 11.5 14 13" />
    </svg>
  )
}

function ApplicationIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M8 1 L9.5 5.5 L14 6.5 L10.5 9.5 L11.5 14 L8 11.5 L4.5 14 L5.5 9.5 L2 6.5 L6.5 5.5 Z" />
    </svg>
  )
}

function LinearAgentIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.7" />
      <path
        d="M3 9.5 L9.5 3 M3.5 12.5 L12.5 3.5 M6.5 13 L13 6.5"
        stroke="white"
        strokeWidth="0.9"
        opacity="0.8"
      />
    </svg>
  )
}

function MemberAvatar({ name, src }: { name: string; src: string }) {
  return (
    <Avatar className="size-3.5 shrink-0">
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="text-[8px]">{name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

const DATE_RANGES = [
  { label: "1 day ago" },
  { label: "3 days ago" },
  { label: "1 week ago" },
  { label: "1 month ago" },
  { label: "3 months ago" },
  { label: "6 months ago" },
  { label: "1 year ago" },
  { label: "Custom date or timeframe..." },
]

const SEARCH_FILTER_OPTIONS: FilterOption[] = [
  {
    label: "Status type",
    icon: StatusIcon,
    kind: "checkbox",
    submenu: [
      { label: "Triage", icon: <TriageStatusIcon /> },
      {
        label: "Backlog",
        icon: <StatusIconImage status="backlog" />,
      },
      { label: "Planned", icon: <PlannedStatusIcon /> },
      {
        label: "Unstarted",
        icon: <StatusIconImage status="todo" />,
      },
      {
        label: "Started",
        icon: <StatusIconImage status="in_progress" />,
      },
      {
        label: "Completed",
        icon: <StatusIconImage status="done" />,
      },
      {
        label: "Canceled",
        icon: <StatusIconImage status="cancelled" />,
      },
    ],
  },
  {
    label: "Assignee / Lead",
    icon: UserIcon,
    kind: "checkbox",
    submenu: [
      { label: "No assignee", icon: <NoAssigneeIcon /> },
      { label: "Current user", icon: <GenericPersonIcon /> },
      { label: "Invited user", icon: <GenericPersonIcon /> },
      { label: "Application", icon: <ApplicationIcon /> },
      ...members.map((m) => ({
        label: m.name,
        icon: <MemberAvatar name={m.name} src={m.avatar} />,
      })),
    ],
    groupBreakBefore: true,
  },
  {
    label: "Creator",
    icon: PencilEdit01Icon,
    kind: "checkbox",
    submenu: [
      { label: "Current user", icon: <GenericPersonIcon /> },
      ...members.map((m) => ({
        label: m.name,
        icon: <MemberAvatar name={m.name} src={m.avatar} />,
      })),
      { label: "Linear", icon: <LinearAgentIcon />, badge: "Agent" },
    ],
  },
  {
    label: "Updated date",
    icon: CalendarSyncIcon,
    kind: "click",
    submenu: DATE_RANGES,
    groupBreakBefore: true,
  },
  {
    label: "Created date",
    icon: CalendarAdd01Icon,
    kind: "click",
    submenu: DATE_RANGES,
  },
]

// Wrapper so we can name-conflict-free use the shared StatusIcon component
// inside a submenu definition (the outer `StatusIcon` import here is the
// hugeicons icon used as the row glyph).
function StatusIconImage({
  status,
}: {
  status: "backlog" | "todo" | "in_progress" | "done" | "cancelled"
}) {
  return <SharedStatusIcon status={status} className="size-3.5" />
}

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "issues", label: "Issues" },
  { value: "projects", label: "Projects" },
  { value: "documents", label: "Documents" },
]

export default function SearchPage() {
  // Suspense boundary — `useSearchParams` requires one in App Router.
  return (
    <Suspense fallback={<SearchPageInner initialQuery="" />}>
      <SearchPageWithParams />
    </Suspense>
  )
}

function SearchPageWithParams() {
  const params = useSearchParams()
  const initialQuery = params.get("q") ?? ""
  return <SearchPageInner initialQuery={initialQuery} />
}

function SearchPageInner({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [tab, setTab] = useState<Tab>("all")
  const inputRef = useRef<HTMLInputElement>(null)
  // Display-options state: persisted in component memory only — the search
  // page is read-only deep-linkable for `?q=` but display preferences stay
  // local since they're personalisation, not part of a shareable URL.
  const [ordering, setOrdering] = useState<SearchOrdering>("Most relevant")
  const [includeArchived, setIncludeArchived] = useState(true)
  const [displayProps, setDisplayProps] = useState<Set<DisplayProp>>(
    () => new Set<DisplayProp>(["ID"])
  )
  // Custom-date dialog: opened from the "Custom date or timeframe..."
  // submenu row inside the Updated/Created date filter flyouts. The field
  // name doubles as both the dialog title and the discriminator for which
  // filter the selection eventually applies to.
  const [customDateField, setCustomDateField] = useState<
    "Updated date" | "Created date" | null
  >(null)
  const toggleDisplayProp = (p: DisplayProp) =>
    setDisplayProps((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  // Auto-focus the input on mount so the route is ready to type
  // immediately, matching the dialog's behavior.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      data-testid="search-page"
      className="bg-background flex h-full min-h-0 w-full flex-col"
    >
      {/* Search input — always rendered, even before any query */}
      <div className="flex items-center gap-3 border-b px-5 py-3.5">
        <HugeiconsIcon
          icon={Search01Icon}
          className="text-muted-foreground size-4 shrink-0"
        />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search issues, projects, and documents"
          data-testid="search-page-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues, projects, and documents..."
          className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Tabs + toolbar — also always rendered */}
      <div
        data-testid="search-page-tabs"
        className="flex items-center justify-between border-b px-4 py-1.5"
      >
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              data-testid={`search-page-tab-${t.value}`}
              onClick={() => setTab(t.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                tab === t.value
                  ? "bg-accent text-foreground border-border"
                  : "text-muted-foreground border-border/60 hover:bg-accent/60 hover:text-foreground hover:border-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <FilterPopover
            options={SEARCH_FILTER_OPTIONS}
            showAiFilter={false}
            onSubmenuItemClick={(filter, item) => {
              if (
                item === "Custom date or timeframe..." &&
                (filter === "Updated date" || filter === "Created date")
              ) {
                setCustomDateField(filter)
              }
            }}
            triggerRender={
              <button
                type="button"
                aria-label="Filter results"
                className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  role="img"
                  focusable="false"
                  aria-hidden="true"
                  className="size-3.5"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.25 3a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Zm2.75 3.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
                  />
                </svg>
              </button>
            }
          />
          <SearchDisplayPopover
            ordering={ordering}
            onOrderingChange={setOrdering}
            includeArchived={includeArchived}
            onIncludeArchivedChange={setIncludeArchived}
            displayProps={displayProps}
            onToggleDisplayProp={toggleDisplayProp}
          />
        </div>
      </div>

      {/* Results area — empty/loading state always present */}
      <SearchResults query={query} tab={tab} showId={displayProps.has("ID")} />

      <CustomDateDialog
        field={customDateField}
        onClose={() => setCustomDateField(null)}
      />
    </div>
  )
}

/**
 * Search results list.
 *
 * Filters the in-memory mock data by query string and renders matching issues
 * + projects. Results respect the active tab filter and the `ID` display
 * property toggle — when on, each issue row is prefixed by its identifier
 * (e.g. "ABH-123") in a muted color, exactly like Linear's real list.
 */
function SearchResults({
  query,
  tab,
  showId,
}: {
  query: string
  tab: Tab
  showId: boolean
}) {
  const q = query.trim().toLowerCase()

  if (q.length === 0) {
    return (
      <div data-testid="search-page-results" className="flex-1 overflow-auto">
        <div
          data-testid="search-page-empty"
          className="flex h-full items-center justify-center"
        >
          <p className="text-muted-foreground/60 text-xs">
            Type to search across issues, projects, and documents.
          </p>
        </div>
      </div>
    )
  }

  const issueMatches =
    tab === "all" || tab === "issues"
      ? issues.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.identifier.toLowerCase().includes(q)
        )
      : []
  const projectMatches =
    tab === "all" || tab === "projects"
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : []

  const total = issueMatches.length + projectMatches.length
  if (total === 0) {
    return (
      <div data-testid="search-page-results" className="flex-1 overflow-auto">
        <div
          data-testid="search-page-no-results"
          className="flex h-full items-center justify-center"
        >
          <p className="text-muted-foreground text-xs">
            No results for &quot;{query}&quot;
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="search-page-results"
      className="flex-1 overflow-auto px-4 py-2"
    >
      {issueMatches.length > 0 && (
        <div className="mb-3">
          <p className="text-muted-foreground px-2 py-1 text-[11px] font-medium tracking-wide uppercase">
            Issues
          </p>
          {issueMatches.map((i) => (
            <div
              key={i.id}
              data-testid="search-result-issue"
              className="hover:bg-accent/40 flex items-center gap-3 rounded-md px-2 py-1.5 text-xs"
            >
              {showId && (
                <span
                  data-testid="search-result-id"
                  className="text-muted-foreground font-mono text-[11px]"
                >
                  {i.identifier}
                </span>
              )}
              <span className="text-foreground truncate">{i.title}</span>
            </div>
          ))}
        </div>
      )}
      {projectMatches.length > 0 && (
        <div>
          <p className="text-muted-foreground px-2 py-1 text-[11px] font-medium tracking-wide uppercase">
            Projects
          </p>
          {projectMatches.map((p) => (
            <div
              key={p.id}
              data-testid="search-result-project"
              className="hover:bg-accent/40 flex items-center gap-3 rounded-md px-2 py-1.5 text-xs"
            >
              <span className="text-foreground truncate">{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Display-options popover for the global search page.
 *
 * Mirrors the structure of `ViewsDisplayPopover` (in views/page.tsx) so the
 * two surfaces feel like siblings:
 *   - **Ordering**: an inline label + a small dropdown of sort modes.
 *     Defaults to "Most relevant" because the search page ranks by query
 *     relevance, not recency.
 *   - **Include archived**: a checkbox toggle. Defaults to `true` to match
 *     Linear's actual behaviour where archived items are searchable unless
 *     explicitly excluded.
 *   - **Display properties**: dashed-pill toggles. Active pills get a solid
 *     `bg-muted` fill; inactive pills get a dashed border so the affordance
 *     is obvious without dominating the popover.
 *
 * The popover is uncontrolled w.r.t. open/close — keeps the call site at the
 * search page free of yet another piece of UI state.
 */
function SearchDisplayPopover({
  ordering,
  onOrderingChange,
  includeArchived,
  onIncludeArchivedChange,
  displayProps,
  onToggleDisplayProp,
}: {
  ordering: SearchOrdering
  onOrderingChange: (v: SearchOrdering) => void
  includeArchived: boolean
  onIncludeArchivedChange: (v: boolean) => void
  displayProps: Set<DisplayProp>
  onToggleDisplayProp: (p: DisplayProp) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Display options"
            data-testid="search-display-trigger"
            className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
          />
        }
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
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
        data-testid="search-display-popover"
        className="w-72 gap-0 p-0"
      >
        {/* Ordering + Include archived */}
        <div className="flex flex-col px-2.5 py-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-xs">Ordering</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    data-testid="search-ordering-select"
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
                {ORDERING_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o}
                    data-testid={`search-ordering-option-${o.toLowerCase().replace(/\s+/g, "-")}`}
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
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-xs">
              Include archived
            </span>
            <Switch
              data-testid="search-include-archived"
              aria-label="Include archived"
              checked={includeArchived}
              onCheckedChange={onIncludeArchivedChange}
            />
          </div>
        </div>
        <div className="border-border/60 border-t" />
        {/* Display properties */}
        <div className="flex flex-col px-2.5 py-2">
          <span className="text-muted-foreground py-1 text-[11px]">
            Display properties
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
            {ALL_DISPLAY_PROPS.map((prop) => {
              const active = displayProps.has(prop)
              return (
                <button
                  key={prop}
                  type="button"
                  onClick={() => onToggleDisplayProp(prop)}
                  aria-pressed={active}
                  data-testid={`search-display-prop-${prop.toLowerCase()}`}
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

/**
 * Custom date / timeframe dialog.
 *
 * Opened from the "Custom date or timeframe..." row inside the Updated/Created
 * date filter flyouts. Presents granularity tabs (Day, Month, Quarter,
 * Half-year, Year) and — for everything except Day — a year-by-year grid of
 * period buttons. Day mode delegates to the shared Calendar primitive so we
 * don't reimplement day-level navigation.
 *
 * Selection is a single string ("2027-Q3", "2028-H1", etc.) so future
 * extension to ranges only needs to widen the state shape, not rewrite the
 * grid. The current contract is simple: clicking Apply closes the dialog —
 * the parent doesn't yet apply the selection to the result list because no
 * results stream is wired up here.
 */
type Granularity = "Day" | "Month" | "Quarter" | "Half-year" | "Year"
const GRANULARITIES: Granularity[] = [
  "Day",
  "Month",
  "Quarter",
  "Half-year",
  "Year",
]

function CustomDateDialog({
  field,
  onClose,
}: {
  field: "Updated date" | "Created date" | null
  onClose: () => void
}) {
  const open = field !== null
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      {/*
       * Keying the body on `field` makes each open a fresh mount, so internal
       * state (granularity, selection, free-text) is naturally reset without
       * an effect. Closed state renders nothing inside the portal.
       */}
      {open ? (
        <CustomDateDialogBody key={field} field={field} onClose={onClose} />
      ) : null}
    </Dialog>
  )
}

function CustomDateDialogBody({
  field,
  onClose,
}: {
  field: "Updated date" | "Created date"
  onClose: () => void
}) {
  const [granularity, setGranularity] = useState<Granularity>("Quarter")
  const [selected, setSelected] = useState<string | null>(null)
  const [day, setDay] = useState<Date | undefined>(undefined)
  // For Day mode the picker switches from "in <period>" to "<before|after>
  // <date>". Default to "after" because that's the more common intent for
  // both Created and Updated date filters ("show me things since X").
  const [dayOp, setDayOp] = useState<"before" | "after">("after")
  const [text, setText] = useState("")

  // Years to show: 2 years before the current year through 5 years after,
  // for an 8-year window centred on "now". Matches the screenshot
  // (2024..2031 when "today" is 2026). A real implementation would expose
  // pagination; this window is enough to demonstrate the picker shape.
  const baseYear = new Date().getFullYear()
  const years = [-2, -1, 0, 1, 2, 3, 4, 5].map((d) => baseYear + d)

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className="bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed start-1/2 top-1/2 z-[1001] flex w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl p-5 ring-1 duration-100 outline-none rtl:translate-x-1/2"
      >
        <DialogPrimitive.Title className="flex items-center gap-2 text-base font-semibold">
          {field}
          {granularity === "Day" ? (
            <div className="flex items-center gap-1.5">
              {(["before", "after"] as const).map((op) => {
                const active = dayOp === op
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setDayOp(op)}
                    className={`rounded-full px-3 py-1 text-xs font-normal transition-colors ${
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    {op}
                  </button>
                )
              })}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm font-normal">
              in
            </span>
          )}
        </DialogPrimitive.Title>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Try: May 2027, Q4, 20/05/2027"
          className="border-primary focus:border-primary text-foreground placeholder:text-muted-foreground/70 w-full rounded-md border bg-transparent px-3 py-2 text-xs outline-none"
        />

        <div className="flex flex-wrap gap-1.5">
          {GRANULARITIES.map((g) => {
            const active = granularity === g
            return (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGranularity(g)
                  setSelected(null)
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>

        <div className="max-h-[360px] overflow-y-auto pr-1">
          {granularity === "Day" ? (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={day}
                onSelect={setDay}
                numberOfMonths={2}
                weekStartsOn={1}
                modifiers={{
                  weekend: (d) => d.getDay() === 0 || d.getDay() === 6,
                }}
                modifiersClassNames={{
                  weekend: "text-muted-foreground/55",
                }}
                className="rounded-md border-0"
              />
            </div>
          ) : granularity === "Year" ? (
            <div className="flex flex-col gap-2">
              {years.map((y) => {
                const value = `${y}`
                const active = selected === value
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelected(value)}
                    className={`w-full rounded-full border py-1.5 text-center text-xs transition-colors ${
                      active
                        ? "border-foreground/40 bg-accent text-foreground"
                        : "border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    }`}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {years.map((y) => (
                <PeriodRow
                  key={y}
                  year={y}
                  granularity={granularity as SubYearGranularity}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full px-4"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-indigo-500 px-4 text-white hover:bg-indigo-500/90"
            onClick={onClose}
          >
            Apply
          </Button>
        </div>
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

type SubYearGranularity = "Month" | "Quarter" | "Half-year"

function PeriodRow({
  year,
  granularity,
  selected,
  onSelect,
}: {
  year: number
  granularity: SubYearGranularity
  selected: string | null
  onSelect: (v: string) => void
}) {
  const periods = periodsFor(granularity)
  const cols = granularity === "Half-year" ? "grid-cols-2" : "grid-cols-4"
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-xs font-medium">{year}</span>
      <div className={`grid gap-2 ${cols}`}>
        {periods.map((p) => {
          const value = `${year}-${p}`
          const active = selected === value
          return (
            <button
              key={p}
              type="button"
              onClick={() => onSelect(value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "border-foreground/40 bg-accent text-foreground"
                  : "border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function periodsFor(g: SubYearGranularity): string[] {
  switch (g) {
    case "Quarter":
      return ["Q1", "Q2", "Q3", "Q4"]
    case "Half-year":
      return ["H1", "H2"]
    case "Month":
      return [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ]
  }
}
