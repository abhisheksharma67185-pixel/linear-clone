"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  AiSearchIcon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { FilterSortIcon } from "@/components/circular-icon-toolbar"

export type SubmenuItem = {
  label: string
  count?: number
  icon?: React.ReactNode
  /** Small pill rendered after the label (e.g. "Agent"). */
  badge?: string
  /**
   * Inserts a hairline divider above this item to break the list into
   * visual groups (e.g. separating "System notifications" from the long
   * list of notification types that follow it).
   */
  groupBreakBefore?: boolean
}
export type SubmenuKind = "checkbox" | "click" | "nested" | "search"
export type FilterOption = {
  label: string
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  submenu?: SubmenuItem[]
  kind?: SubmenuKind
  searchPlaceholder?: string
  /** Pushes a divider above this row to create a visual group. */
  groupBreakBefore?: boolean
  /**
   * Suppresses the search/filter input above the submenu items. Some filters
   * (e.g. inbox "Notification type" / "Project") in Linear render a bare
   * list of options without an inline filter — set this to `true` to match.
   */
  hideSearch?: boolean
  /**
   * Optional footer rendered below the submenu items, separated by a
   * divider. Used for muted informational rows like "14 options not
   * matching any notifications".
   */
  footer?: React.ReactNode
}

const FILTER_TOP_OPTIONS = [
  { label: "AI filter", icon: AiSearchIcon },
  { label: "Advanced filter", icon: FilterHorizontalIcon },
]

/**
 * Controlled-selection key shape: `${filterLabel}::${itemLabel}`. Stored
 * as a Set so toggling stays O(1).
 */
export type FilterSelection = Set<string>
export const filterSelectionKey = (filter: string, item: string) =>
  `${filter}::${item}`
export const parseFilterSelectionKey = (key: string) => {
  const idx = key.indexOf("::")
  return idx === -1
    ? { filter: key, item: "" }
    : { filter: key.slice(0, idx), item: key.slice(idx + 2) }
}

export function FilterPopover({
  options,
  aiSuggestions = [],
  variant = "toolbar",
  onAdvancedFilter,
  onSubmenuItemClick,
  triggerRender,
  countNoun = "project",
  showAiFilter = true,
  showAdvancedFilter = true,
  submenuSide,
  selectedKeys,
  onSelectedKeysChange,
  open: openProp,
  onOpenChange,
}: {
  options: FilterOption[]
  aiSuggestions?: string[]
  variant?: "toolbar" | "advanced-add"
  onAdvancedFilter?: () => void
  /**
   * Fired when a click-kind submenu row is clicked. If the handler returns
   * `true`, the popover stays open so the parent can hand off to a follow-up
   * UI (e.g. opening a custom-date dialog without flicker). Otherwise the
   * popover closes after the click.
   */
  onSubmenuItemClick?: (
    filterLabel: string,
    itemLabel: string
  ) => boolean | void
  triggerRender?: React.ReactElement
  countNoun?: string
  /**
   * When false, the "AI filter" entry is hidden from the toolbar
   * top-options list — useful for surfaces (like global search) that
   * don't expose AI-assisted filtering.
   */
  showAiFilter?: boolean
  /**
   * When false, the "Advanced filter" entry is hidden from the toolbar
   * top-options list. Combined with `showAiFilter={false}` this hides
   * the entire top-options section so the popover starts directly with
   * the actual filter rows — used by the inbox filter popover, which
   * doesn't expose either of those modes.
   */
  showAdvancedFilter?: boolean
  /**
   * Which side the submenu flyout opens on. Defaults to the variant's
   * natural side (`toolbar` → left, `advanced-add` → right). Override
   * this when the trigger sits near the left edge of the viewport
   * (e.g. the inbox header) so the flyout doesn't get clipped by
   * the sidebar.
   */
  submenuSide?: "left" | "right"
  /**
   * Controlled selection set. When provided, the parent owns the selected
   * checkbox keys (lets it render filter pills and apply filtering).
   * Falls back to internal state when undefined.
   */
  selectedKeys?: FilterSelection
  onSelectedKeysChange?: (next: FilterSelection) => void
  /** Controlled open state — used when a separate trigger (e.g. a "+"
   * pill in the filter bar) needs to drive the same popover. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = (v: boolean) => {
    if (openProp === undefined) setInternalOpen(v)
    onOpenChange?.(v)
  }
  const [search, setSearch] = useState("")
  // Submenu filter input — pair the query with the row it belongs to so it
  // resets implicitly when the user hovers a different submenu (avoids a
  // setState-in-effect to clear the value).
  const [submenuSearchState, setSubmenuSearchState] = useState<{
    key: string | null
    q: string
  }>({ key: null, q: "" })
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [sideOffset, setSideOffset] = useState(0)
  const [internalActive, setInternalActive] = useState<FilterSelection>(
    () => new Set()
  )
  const activeChildren = selectedKeys ?? internalActive
  const setActiveChildren: React.Dispatch<
    React.SetStateAction<FilterSelection>
  > = (updater) => {
    const next =
      typeof updater === "function"
        ? (updater as (prev: FilterSelection) => FilterSelection)(
            activeChildren
          )
        : updater
    if (selectedKeys === undefined) setInternalActive(next)
    onSelectedKeysChange?.(next)
  }
  const [aiMode, setAiMode] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const submenuSearch =
    submenuSearchState.key === hoveredKey ? submenuSearchState.q : ""
  const setSubmenuSearch = (q: string) =>
    setSubmenuSearchState({ key: hoveredKey, q })
  const mainPanelRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  // When the side panel is absolute-positioned, the cursor briefly
  // crosses a gap between the main panel and the flyout. The flex
  // container's bounding box doesn't include the absolute child, so
  // mouseLeave fires immediately and the flyout disappears mid-traverse.
  // Buffer the clear with a short timer so a quick cross-over keeps the
  // flyout open; mouseEnter on either panel cancels the timer.
  const hoverClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queueHoverClear = () => {
    if (hoverClearTimer.current) clearTimeout(hoverClearTimer.current)
    hoverClearTimer.current = setTimeout(() => setHoveredKey(null), 80)
  }
  const cancelHoverClear = () => {
    if (hoverClearTimer.current) {
      clearTimeout(hoverClearTimer.current)
      hoverClearTimer.current = null
    }
  }
  useEffect(() => {
    return () => {
      if (hoverClearTimer.current) clearTimeout(hoverClearTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setAiMode(false)
      setAiQuery("")
      setSearch("")
      setSubmenuSearchState({ key: null, q: "" })
      setHoveredKey(null)
    }
  }, [open])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTop = FILTER_TOP_OPTIONS.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) &&
      (showAiFilter || o.label !== "AI filter") &&
      (showAdvancedFilter || o.label !== "Advanced filter")
  )

  const hovered = hoveredKey
    ? (options.find((o) => o.label === hoveredKey) ?? null)
    : null
  const hoveredHasFlyout = !!(
    hovered &&
    (hovered.kind === "search" || hovered.submenu !== undefined)
  )

  useEffect(() => {
    if (!hoveredKey) {
      setSideOffset(0)
      return
    }
    const rowEl = rowRefs.current.get(hoveredKey)
    const mainEl = mainPanelRef.current
    const sideEl = sidePanelRef.current
    if (!rowEl || !mainEl) return
    const rowOffset = Math.max(
      0,
      rowEl.getBoundingClientRect().top - mainEl.getBoundingClientRect().top
    )
    const sideH = sideEl?.offsetHeight ?? 0
    const mainH = mainEl.offsetHeight
    const maxOffset = Math.max(0, mainH - sideH)
    setSideOffset(Math.min(rowOffset, maxOffset))
  }, [hoveredKey])

  const toggleChild = (key: string) => {
    setActiveChildren((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {triggerRender ? (
        <PopoverTrigger render={triggerRender} />
      ) : (
        <PopoverTrigger
          render={
            <button
              type="button"
              className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
            />
          }
        >
          <FilterSortIcon />
        </PopoverTrigger>
      )}
      <PopoverContent
        side="bottom"
        align={variant === "advanced-add" ? "start" : "end"}
        sideOffset={6}
        className="w-auto gap-1.5 border-0 bg-transparent p-0 shadow-none ring-0"
      >
        {aiMode ? (
          <div className="bg-popover ring-foreground/10 w-72 overflow-hidden rounded-lg shadow-md ring-1">
            <div className="px-2.5 py-2">
              <input
                autoFocus
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="AI filter"
                className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div className="py-1">
              {aiSuggestions
                .filter((s) => s.toLowerCase().includes(aiQuery.toLowerCase()))
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors"
                  >
                    <HugeiconsIcon
                      icon={AiSearchIcon}
                      className="size-3.5 shrink-0"
                    />
                    <span className="text-foreground">{s}</span>
                  </button>
                ))}
            </div>
          </div>
        ) : (
          (() => {
            // Resolved submenu side: the explicit `submenuSide` prop
            // wins; otherwise fall back to the variant's natural side
            // (advanced-add → right, toolbar → left).
            const resolvedSide =
              submenuSide ?? (variant === "advanced-add" ? "right" : "left")
            // When the flyout is on the right we *must not* let it
            // contribute to the popover's bounding box, otherwise
            // Radix's right-anchored align="end" would shove the main
            // panel left every time a row is hovered (the
            // glitching-on-hover bug). Render the side panel
            // absolutely positioned next to the main panel instead.
            const sideAbsolute = resolvedSide === "right"
            const sideStyle: React.CSSProperties = sideAbsolute
              ? {
                  position: "absolute",
                  top: sideOffset,
                  left: "calc(100% + 6px)",
                }
              : { marginTop: sideOffset }
            return (
              <div
                className={`flex items-start gap-1.5 ${sideAbsolute ? "relative" : ""}`}
                onMouseLeave={queueHoverClear}
                onMouseEnter={cancelHoverClear}
              >
                {hovered && hoveredHasFlyout && (
                  <>
                    {hovered.kind === "search" ? (
                      <div
                        ref={sidePanelRef}
                        className="bg-popover ring-foreground/10 w-[270px] overflow-hidden rounded-lg px-2.5 py-2 shadow-md ring-1"
                        style={sideStyle}
                        onMouseEnter={cancelHoverClear}
                        onMouseLeave={queueHoverClear}
                      >
                        <input
                          autoFocus
                          placeholder={hovered.searchPlaceholder ?? "Filter..."}
                          className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-xs focus:outline-none"
                        />
                      </div>
                    ) : (
                      (() => {
                        const items = hovered.submenu ?? []
                        const q = submenuSearch.trim().toLowerCase()
                        const filteredItems = q
                          ? items.filter((s) =>
                              s.label.toLowerCase().includes(q)
                            )
                          : items
                        const showCheckbox = hovered.kind === "checkbox"
                        const showChevron = hovered.kind === "nested"
                        return (
                          <div
                            ref={sidePanelRef}
                            style={sideStyle}
                            onMouseEnter={cancelHoverClear}
                            onMouseLeave={queueHoverClear}
                          >
                            <div className="bg-popover ring-foreground/10 w-[270px] overflow-hidden rounded-lg shadow-md ring-1">
                              {!hovered.hideSearch && (
                                <>
                                  <div className="px-2.5 py-2">
                                    <input
                                      value={submenuSearch}
                                      onChange={(e) =>
                                        setSubmenuSearch(e.target.value)
                                      }
                                      placeholder={
                                        hovered.searchPlaceholder ?? "Filter..."
                                      }
                                      className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-xs focus:outline-none"
                                    />
                                  </div>
                                  <div className="border-border/60 border-t" />
                                </>
                              )}
                              <div className="max-h-[70vh] overflow-y-auto py-1">
                                {filteredItems.length === 0 ? (
                                  <p className="text-muted-foreground px-2.5 py-3 text-center text-xs">
                                    No matching options
                                  </p>
                                ) : (
                                  filteredItems.map((s, idx) => {
                                    const key = `${hovered.label}::${s.label}`
                                    const checked = activeChildren.has(key)
                                    // Only render a divider when no submenu
                                    // search query is active — otherwise the
                                    // divider can end up "floating" above the
                                    // first surviving item, which looks broken.
                                    const showItemDivider =
                                      s.groupBreakBefore &&
                                      idx > 0 &&
                                      submenuSearch === ""
                                    return (
                                      <React.Fragment key={s.label}>
                                        {showItemDivider && (
                                          <div className="border-border/60 my-1 border-t" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={
                                            showCheckbox
                                              ? () => toggleChild(key)
                                              : hovered.kind === "click"
                                                ? () => {
                                                    const keepOpen =
                                                      onSubmenuItemClick?.(
                                                        hovered.label,
                                                        s.label
                                                      )
                                                    if (!keepOpen)
                                                      setOpen(false)
                                                  }
                                                : undefined
                                          }
                                          className="hover:bg-accent group flex w-full items-center gap-2 px-2.5 py-1.5 text-xs transition-colors"
                                        >
                                          {showCheckbox && (
                                            <span
                                              className={`flex size-3.5 shrink-0 items-center justify-center rounded-sm border transition-opacity ${
                                                checked
                                                  ? "border-primary bg-primary text-primary-foreground opacity-100"
                                                  : "border-muted-foreground/40 opacity-0 group-hover:opacity-100"
                                              }`}
                                            >
                                              {checked && (
                                                <svg
                                                  viewBox="0 0 16 16"
                                                  className="size-2.5"
                                                  fill="none"
                                                >
                                                  <path
                                                    d="M3 8l3.5 3.5L13 4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                  />
                                                </svg>
                                              )}
                                            </span>
                                          )}
                                          {s.icon && (
                                            <span className="text-muted-foreground flex size-3.5 shrink-0 items-center justify-center">
                                              {s.icon}
                                            </span>
                                          )}
                                          <span className="text-foreground flex-1 truncate text-left">
                                            {s.label}
                                          </span>
                                          {s.badge && (
                                            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                                              {s.badge}
                                            </span>
                                          )}
                                          {s.count !== undefined && (
                                            <span className="text-muted-foreground text-[11px]">
                                              {s.count}{" "}
                                              {s.count === 1
                                                ? countNoun
                                                : `${countNoun}s`}
                                            </span>
                                          )}
                                          {showChevron && (
                                            <HugeiconsIcon
                                              icon={ArrowRight01Icon}
                                              className="text-muted-foreground/60 size-3.5 shrink-0"
                                            />
                                          )}
                                        </button>
                                      </React.Fragment>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                            {hovered.footer && (
                              <div className="bg-popover ring-foreground/10 text-muted-foreground mt-1.5 w-[270px] overflow-hidden rounded-lg px-2.5 py-1.5 text-[11px] shadow-md ring-1">
                                {hovered.footer}
                              </div>
                            )}
                          </div>
                        )
                      })()
                    )}
                  </>
                )}

                <div
                  ref={mainPanelRef}
                  className="bg-popover ring-foreground/10 w-72 overflow-hidden rounded-lg shadow-md ring-1"
                >
                  <div className="flex items-center gap-2 px-2.5 py-2">
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={
                        variant === "advanced-add" ? "Filter" : "Add Filter..."
                      }
                      className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-xs focus:outline-none"
                    />
                    {variant === "toolbar" && (
                      <kbd className="border-border/60 text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]">
                        F
                      </kbd>
                    )}
                  </div>

                  <div className="border-border/60 border-t" />

                  {variant === "toolbar" && filteredTop.length > 0 && (
                    <div className="py-1">
                      {filteredTop.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onMouseEnter={() => setHoveredKey(null)}
                          onClick={() => {
                            if (opt.label === "AI filter") {
                              setAiMode(true)
                            } else if (opt.label === "Advanced filter") {
                              setOpen(false)
                              onAdvancedFilter?.()
                            }
                          }}
                          className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors"
                        >
                          <HugeiconsIcon
                            icon={opt.icon}
                            className="size-3.5 shrink-0"
                          />
                          <span className="text-foreground">{opt.label}</span>
                        </button>
                      ))}
                      <div className="border-border/60 mt-1 border-t" />
                    </div>
                  )}

                  {variant === "advanced-add" &&
                    "add filter group".includes(search.toLowerCase()) && (
                      <div className="py-1">
                        <button
                          type="button"
                          onMouseEnter={() => setHoveredKey(null)}
                          className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors"
                        >
                          <span className="flex size-3.5 shrink-0 items-center justify-center font-mono text-[13px]">
                            ()
                          </span>
                          <span className="text-foreground">
                            Add filter group
                          </span>
                        </button>
                        <div className="border-border/60 mt-1 border-t" />
                      </div>
                    )}

                  <div className="max-h-96 overflow-y-auto py-1">
                    {filtered.map((opt, i) => {
                      const hasSub =
                        opt.kind === "search" || opt.submenu !== undefined
                      const isHovered = hasSub && hoveredKey === opt.label
                      // Only show divider when search is empty so the visual
                      // groups stay coherent during browsing.
                      const showDivider =
                        opt.groupBreakBefore && i > 0 && search === ""
                      return (
                        <React.Fragment key={opt.label}>
                          {showDivider && (
                            <div className="border-border/60 my-1 border-t" />
                          )}
                          <button
                            ref={(el) => {
                              if (el) rowRefs.current.set(opt.label, el)
                              else rowRefs.current.delete(opt.label)
                            }}
                            type="button"
                            onMouseEnter={() =>
                              setHoveredKey(hasSub ? opt.label : null)
                            }
                            className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors ${
                              isHovered
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <HugeiconsIcon
                              icon={opt.icon}
                              className="size-3.5 shrink-0"
                            />
                            <span>{opt.label}</span>
                            {hasSub && (
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                className="text-muted-foreground/60 ml-auto size-3.5 shrink-0"
                              />
                            )}
                          </button>
                        </React.Fragment>
                      )
                    })}
                    {filtered.length === 0 &&
                      (variant === "advanced-add"
                        ? !"add filter group".includes(search.toLowerCase())
                        : filteredTop.length === 0) && (
                        <p className="text-muted-foreground px-2.5 py-3 text-center text-xs">
                          No filters found
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )
          })()
        )}
      </PopoverContent>
    </Popover>
  )
}
