"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { View, Member } from "@/app/lib/mock-data"
import { CreateViewDialog } from "@/components/create-view-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { IconPickerPopover } from "@/components/icon-picker-popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  ArrowDown01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

const WORKSPACE_NAME = "Theta Computers"
const WORKSPACE_INITIALS = "TC"

type ViewOrdering = "Created" | "Updated" | "Name" | "Owner"
type ViewDisplayProp = "Created" | "Updated" | "Owner"

const ORDERING_OPTIONS: ViewOrdering[] = ["Name", "Owner", "Updated", "Created"]
const ALL_DISPLAY_PROPS: ViewDisplayProp[] = ["Created", "Updated", "Owner"]

export default function ViewsPage() {
  const [views, setViews] = useState<View[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"issues" | "projects">("issues")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [ordering, setOrdering] = useState<ViewOrdering>("Created")
  const [orderAsc, setOrderAsc] = useState(false)
  const [displayProps, setDisplayProps] = useState<Set<ViewDisplayProp>>(
    () => new Set<ViewDisplayProp>(["Created", "Owner"])
  )
  const toggleDisplayProp = (prop: ViewDisplayProp) =>
    setDisplayProps((prev) => {
      const next = new Set(prev)
      if (next.has(prop)) next.delete(prop)
      else next.add(prop)
      return next
    })

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ]).then(([v, m]) => {
      setViews(v)
      setMembers(m)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2.5">
        <h1 className="text-sm font-medium" data-testid="views-header-title">
          Views
        </h1>
        {/*
          The header New view button now routes to /views/new so the
          create flow is URL-addressable (deep-link friendly, browser
          back returns to /views). The in-list "+" buttons below
          still open the dialog inline for users already scanning the
          list. Both paths land on the same CreateViewDialog.
        */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="New view"
          data-testid="views-header-new"
          className="size-7"
        >
          <Link href="/views/new">
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          </Link>
        </Button>
      </header>

      {/* Tabs + toolbar */}
      <div className="flex items-center justify-between border-b px-4">
        <div className="flex items-center gap-0.5">
          {(["issues", "projects"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-2.5 py-1 text-[13px] font-medium transition-colors ${
                tab === t
                  ? "bg-zinc-800 text-foreground"
                  : "text-muted-foreground hover:bg-zinc-800/40 hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <ViewsDisplayPopover
          ordering={ordering}
          onOrderingChange={setOrdering}
          orderAsc={orderAsc}
          onOrderAscChange={setOrderAsc}
          displayProps={displayProps}
          onToggleDisplayProp={toggleDisplayProp}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded" />
            ))}
          </div>
        ) : tab === "issues" ? (
          <>
            {/* Column header. data-testid hooks let the regression
                test for the Display-options popover ghost bug verify
                the headers aren't covered by a leftover popover layer
                after outside-click dismiss. */}
            <div
              data-testid="views-table-header"
              className="text-muted-foreground flex items-center border-b px-5 py-2 text-[11px]"
            >
              <button
                type="button"
                data-testid="views-header-name"
                className="hover:text-foreground flex flex-1 items-center gap-1"
              >
                Name
                <svg
                  viewBox="0 0 10 10"
                  className="size-2.5 fill-current opacity-60"
                >
                  <path d="M5 7L1 3h8z" />
                </svg>
              </button>
              {displayProps.has("Created") && (
                <span data-testid="views-header-created" className="w-32">
                  Created
                </span>
              )}
              {displayProps.has("Updated") && (
                <span data-testid="views-header-updated" className="w-32">
                  Updated
                </span>
              )}
              {displayProps.has("Owner") && (
                <span data-testid="views-header-owner" className="w-44">
                  Owner
                </span>
              )}
            </div>

            {/* Personal views section header */}
            <div className="group bg-accent/20 flex items-center gap-2 border-b px-5 py-2">
              <Avatar className="size-5 shrink-0">
                <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                  {WORKSPACE_INITIALS}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground flex-1 text-xs font-medium">
                Personal views
                <span className="ml-1.5 font-normal opacity-60">
                  · Only visible to you
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
              </button>
            </div>

            {/* User-created views */}
            {sortViews(views, ordering, orderAsc).map((view) => {
              const owner = members.find((m) => m.id === view.ownerId)
              return (
                <Link
                  key={view.id}
                  href={`/views/${view.id}`}
                  className="hover:bg-accent/40 flex items-center border-b px-5 py-2.5 transition-colors"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ViewIconPicker />
                    </div>
                    <span className="text-sm">{view.name}</span>
                  </div>
                  {displayProps.has("Created") && (
                    <span className="text-muted-foreground w-32 text-xs">
                      {formatViewDate(view.createdAt)}
                    </span>
                  )}
                  {displayProps.has("Updated") && (
                    <span className="text-muted-foreground w-32 text-xs">
                      {formatViewDate(view.createdAt)}
                    </span>
                  )}
                  {displayProps.has("Owner") && (
                    <div className="flex w-44 items-center gap-2">
                      {owner ? (
                        <>
                          <Avatar className="size-5">
                            <AvatarImage src={owner.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {owner.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground truncate text-xs">
                            {owner.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <Avatar className="size-5">
                            <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                              {WORKSPACE_INITIALS}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground truncate text-xs">
                            {WORKSPACE_NAME}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-muted-foreground text-sm">
              No project views yet
            </p>
          </div>
        )}
      </div>

      <CreateViewDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

/**
 * Display options popover for the Views page (the gear/sliders icon
 * to the right of the Issues/Projects tabs).
 *
 * Controlled `open` state + Base UI's `onOpenChangeComplete` is what
 * fixes the regression where outside-click left a faded ghost over
 * the Created/Updated/Owner table columns:
 *
 *   1. `open`/`setOpen` make the close path explicit. Both Escape AND
 *      outside-click route through `onOpenChange(false)`, so the two
 *      dismiss paths are identical.
 *   2. `onOpenChangeComplete(false)` is the lib's "animation done"
 *      signal. We use it to assert (in development) that the popup
 *      really did unmount. In production it's a no-op.
 *   3. The hardened global `PopoverContent` already adds
 *      `data-[instant=dismiss]:duration-0 data-[instant=dismiss]:opacity-0`
 *      so outside-click dismisses snap to invisible instead of
 *      animating — combined here for belt-and-suspenders.
 */
function ViewsDisplayPopover({
  ordering,
  onOrderingChange,
  orderAsc,
  onOrderAscChange,
  displayProps,
  onToggleDisplayProp,
}: {
  ordering: ViewOrdering
  onOrderingChange: (v: ViewOrdering) => void
  orderAsc: boolean
  onOrderAscChange: (v: boolean) => void
  displayProps: Set<ViewDisplayProp>
  onToggleDisplayProp: (p: ViewDisplayProp) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            data-testid="views-display-trigger"
            aria-label="Display options"
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
        data-testid="views-display-popover"
        className="w-72 gap-0 p-0"
      >
        <div className="flex flex-col px-2.5 py-2">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-xs">Ordering</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onOrderAscChange(!orderAsc)}
                aria-label={
                  orderAsc ? "Sort descending" : "Sort ascending"
                }
                aria-pressed={orderAsc}
                data-testid="views-ordering-direction"
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded transition-colors"
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`size-3.5 transition-transform ${orderAsc ? "rotate-180" : ""}`}
                  fill="none"
                >
                  <path
                    d="M5 3v10M2 10l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      data-testid="views-ordering-select"
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
                  className="w-36 p-1"
                >
                  {ORDERING_OPTIONS.map((o) => (
                    <DropdownMenuItem
                      key={o}
                      data-testid={`views-ordering-option-${o.toLowerCase()}`}
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
        </div>
        <div className="border-border/60 border-t" />
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
                  data-testid={`views-display-prop-${prop.toLowerCase()}`}
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

function sortViews(
  views: View[],
  ordering: ViewOrdering,
  asc: boolean
): View[] {
  const out = [...views]
  out.sort((a, b) => {
    let cmp = 0
    if (ordering === "Name") cmp = a.name.localeCompare(b.name)
    else if (ordering === "Owner") cmp = a.ownerId.localeCompare(b.ownerId)
    // No `updatedAt` on the View model — fall back to createdAt so the
    // Updated sort still has a stable order until we wire up edit
    // tracking.
    else cmp = a.createdAt.localeCompare(b.createdAt)
    return asc ? cmp : -cmp
  })
  return out
}

function formatViewDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ViewIconPicker() {
  return (
    <IconPickerPopover
      trigger={
        <svg
          viewBox="0 0 16 16"
          className="text-muted-foreground size-4 shrink-0"
          fill="none"
        >
          <path
            d="M2 4h12M2 8h8M2 12h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      }
    />
  )
}
