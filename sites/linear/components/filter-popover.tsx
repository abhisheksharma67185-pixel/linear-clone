"use client"

import * as React from "react"
import { useLayoutEffect, useRef, useState } from "react"
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
}

const FILTER_TOP_OPTIONS = [
  { label: "AI filter", icon: AiSearchIcon },
  { label: "Advanced filter", icon: FilterHorizontalIcon },
]

export function FilterPopover({
  options,
  aiSuggestions = [],
  variant = "toolbar",
  onAdvancedFilter,
  triggerRender,
  countNoun = "project",
}: {
  options: FilterOption[]
  aiSuggestions?: string[]
  variant?: "toolbar" | "advanced-add"
  onAdvancedFilter?: () => void
  triggerRender?: React.ReactElement
  countNoun?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [activeChildren, setActiveChildren] = useState<Set<string>>(new Set())
  const [aiMode, setAiMode] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const mainPanelRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setAiMode(false)
      setAiQuery("")
      setSearch("")
      setHoveredKey(null)
    }
  }

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTop = FILTER_TOP_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const hovered = hoveredKey
    ? (options.find((o) => o.label === hoveredKey) ?? null)
    : null
  const hoveredHasFlyout = !!(
    hovered &&
    (hovered.kind === "search" || hovered.submenu !== undefined)
  )

  // Position the side panel via DOM mutation rather than React state — the
  // measurement is a one-shot layout sync, not data the rest of the tree
  // needs to read. This keeps `react-hooks/set-state-in-effect` quiet.
  useLayoutEffect(() => {
    const sideEl = sidePanelRef.current
    if (!sideEl) return
    if (!hoveredKey) {
      sideEl.style.marginTop = "0px"
      return
    }
    const rowEl = rowRefs.current.get(hoveredKey)
    const mainEl = mainPanelRef.current
    if (!rowEl || !mainEl) return
    const rowOffset = Math.max(
      0,
      rowEl.getBoundingClientRect().top - mainEl.getBoundingClientRect().top
    )
    const sideH = sideEl.offsetHeight
    const mainH = mainEl.offsetHeight
    const maxOffset = Math.max(0, mainH - sideH)
    sideEl.style.marginTop = `${Math.min(rowOffset, maxOffset)}px`
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
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          <div
            className={`flex items-start gap-1.5 ${variant === "advanced-add" ? "flex-row-reverse" : ""}`}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {hovered && hoveredHasFlyout && (
              <>
                {hovered.kind === "search" ? (
                  <div
                    ref={sidePanelRef}
                    className="bg-popover ring-foreground/10 w-[230px] overflow-hidden rounded-lg px-2.5 py-2 shadow-md ring-1"
                  >
                    <input
                      autoFocus
                      placeholder={hovered.searchPlaceholder ?? "Filter..."}
                      className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-xs focus:outline-none"
                    />
                  </div>
                ) : hovered.submenu!.length === 0 ? (
                  <div
                    ref={sidePanelRef}
                    className="bg-popover text-muted-foreground ring-foreground/10 w-[230px] rounded-lg px-2.5 py-3 text-center text-xs shadow-md ring-1"
                  >
                    No matching options
                  </div>
                ) : (
                  <div
                    ref={sidePanelRef}
                    className="bg-popover ring-foreground/10 w-[230px] overflow-hidden rounded-lg shadow-md ring-1"
                  >
                    <div className="max-h-72 overflow-y-auto py-1">
                      {hovered.submenu!.map((s) => {
                        const key = `${hovered.label}::${s.label}`
                        const checked = activeChildren.has(key)
                        const showCheckbox = hovered.kind === "checkbox"
                        const showChevron = hovered.kind === "nested"
                        return (
                          <button
                            key={s.label}
                            type="button"
                            onClick={
                              showCheckbox ? () => toggleChild(key) : undefined
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
                            <span className="text-foreground flex-1 text-left">
                              {s.label}
                            </span>
                            {s.count !== undefined && (
                              <span className="text-muted-foreground text-[11px]">
                                {s.count}{" "}
                                {s.count === 1 ? countNoun : `${countNoun}s`}
                              </span>
                            )}
                            {showChevron && (
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                className="text-muted-foreground/60 size-3.5 shrink-0"
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
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
                      <span className="text-foreground">Add filter group</span>
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
        )}
      </PopoverContent>
    </Popover>
  )
}
