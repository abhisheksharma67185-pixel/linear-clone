"use client"

/**
 * Customize sidebar modal — production-parity with Linear:
 *
 *   1. Per-row visibility dropdown with the FULL three-option set
 *      (Always show / Show when badged / Don't show). Every item
 *      gets every option; the previous version shipped subsets.
 *   2. Sections (Personal / Workspace) with drag-and-drop reordering
 *      both within and across sections, powered by `@dnd-kit/core`.
 *   3. Default badge style segmented control (Count / Dot) with a
 *      helper caption explaining the visual difference.
 *   4. "Reset to default" footer button.
 *   5. 150ms ease-out opacity+height transition tag the sidebar
 *      consumes when the visibility changes — toggling "Don't show"
 *      doesn't snap.
 *   6. Selecting a visibility option closes only the dropdown
 *      popover; Escape closes the popover OR the modal depending on
 *      what's open (Base UI's Menu+Dialog already handle this).
 *   7. Modal traps focus when open and restores focus to the trigger
 *      on close (Base UI Dialog default).
 */

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Menu02Icon,
} from "@hugeicons/core-free-icons"
import {
  DEFAULT_CUSTOMIZATION,
  loadSidebarCustomization,
  resetSidebarCustomization,
  saveSidebarCustomization,
  setBadgeStyle,
  setItemVisibility,
  type BadgeStyle,
  type SidebarCustomization,
  type SidebarItem,
  type SidebarSection,
  type SidebarVisibility,
} from "@/lib/sidebar-customization"

const VISIBILITY_LABELS: Record<SidebarVisibility, string> = {
  always: "Always show",
  badged: "Show when badged",
  never: "Don't show",
}

const SECTION_LABELS: Record<SidebarSection, string> = {
  personal: "Personal",
  workspace: "Workspace",
}

const SECTION_ORDER: readonly SidebarSection[] = ["personal", "workspace"]

const BADGE_STYLE_OPTIONS: readonly {
  value: BadgeStyle
  label: string
}[] = [
  { value: "count", label: "Count" },
  { value: "dot", label: "Dot" },
]

export function CustomizeSidebarDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // Local copy so the user can preview changes without nuking
  // localStorage on every keystroke. We persist on each commit so
  // the sidebar reflects changes immediately (item 8(c) in the spec
  // requires "Don't show" hides the item from the sidebar at once).
  const [config, setConfig] = useState<SidebarCustomization>(
    DEFAULT_CUSTOMIZATION
  )

  // Sync local state from localStorage every time the dialog opens.
  // Keeps the modal authoritative on each session.
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setConfig(loadSidebarCustomization())
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  // Mutate-and-persist helper. Every store write commits to
  // localStorage AND updates local state, so the modal preview and
  // the sidebar stay in lockstep.
  const commit = (next: SidebarCustomization) => {
    setConfig(next)
    saveSidebarCustomization(next)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small drag distance so a click on the handle
      // doesn't accidentally start a drag.
      activationConstraint: { distance: 4 },
    })
  )

  // Per-section item arrays. The render order is just `config.items`
  // filtered by section, so re-ordering the underlying array in
  // `commit()` is enough to update both sections.
  const itemsBySection = useMemo(() => {
    const out: Record<SidebarSection, SidebarItem[]> = {
      personal: [],
      workspace: [],
    }
    for (const item of config.items) out[item.section].push(item)
    return out
  }, [config.items])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    const fromKey = String(active.id)
    const toKey = String(over.id)

    setConfig((prev) => {
      const items = [...prev.items]
      const fromIndex = items.findIndex((i) => i.key === fromKey)
      const toIndex = items.findIndex((i) => i.key === toKey)
      if (fromIndex < 0 || toIndex < 0) return prev
      // Cross-section drag: when dropping onto a target in a
      // different section, adopt the target's section.
      const targetSection = items[toIndex].section
      const moved = { ...items[fromIndex], section: targetSection }
      items.splice(fromIndex, 1)
      // After splice, the toIndex shifts if fromIndex < toIndex.
      const adjustedTo =
        fromIndex < toIndex ? toIndex - 1 : toIndex
      items.splice(adjustedTo, 0, moved)
      const next = { ...prev, items }
      saveSidebarCustomization(next)
      return next
    })
  }

  const handleReset = () => {
    commit(resetSidebarCustomization())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize sidebar</DialogTitle>
          <DialogDescription>
            Choose which items appear in your sidebar, drag to reorder
            within and across sections, and pick how badges are
            displayed.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-4 py-1"
          data-testid="customize-sidebar-body"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {SECTION_ORDER.map((section) => (
              <Section
                key={section}
                section={section}
                items={itemsBySection[section]}
                onChangeVisibility={(key, visibility) =>
                  commit(setItemVisibility(config, key, visibility))
                }
              />
            ))}
          </DndContext>

          {/* Default badge style — segmented + helper caption */}
          <div
            className="flex flex-col gap-1.5"
            data-testid="badge-style-section"
          >
            <span className="text-sm font-medium">Default badge style</span>
            <div
              role="radiogroup"
              aria-label="Default badge style"
              className="bg-muted/30 inline-flex w-fit items-center rounded-md border p-0.5 text-xs"
            >
              {BADGE_STYLE_OPTIONS.map((opt) => {
                const active = config.badgeStyle === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-testid={`badge-style-${opt.value}`}
                    onClick={() => commit(setBadgeStyle(config, opt.value))}
                    className={`inline-flex h-6 items-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <p
              data-testid="badge-style-helper"
              className="text-muted-foreground text-xs"
            >
              <span className="text-foreground font-medium">Count</span>{" "}
              shows the exact number (e.g. <span className="font-mono">3</span>).{" "}
              <span className="text-foreground font-medium">Dot</span> shows a
              small unread indicator without the number.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row-reverse items-center gap-2 sm:flex-row-reverse sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              data-testid="customize-sidebar-done"
            >
              Done
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            data-testid="customize-sidebar-reset"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Reset to default
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({
  section,
  items,
  onChangeVisibility,
}: {
  section: SidebarSection
  items: SidebarItem[]
  onChangeVisibility: (key: string, visibility: SidebarVisibility) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        data-testid={`customize-section-${section}`}
        className="text-muted-foreground text-xs font-medium"
      >
        {SECTION_LABELS[section]}
      </span>
      <div className="divide-border/50 border-border flex flex-col divide-y rounded-md border">
        <SortableContext
          // The sortable context is per-section; cross-section drags
          // still work because the DndContext's drag-end handler
          // looks up indices in the global `config.items` array.
          items={items.map((i) => i.key)}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <div className="text-muted-foreground/70 px-3 py-2 text-xs italic">
              No items in this section
            </div>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.key}
                item={item}
                onChangeVisibility={(v) =>
                  onChangeVisibility(item.key, v)
                }
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

function ItemRow({
  item,
  onChangeVisibility,
}: {
  item: SidebarItem
  onChangeVisibility: (v: SidebarVisibility) => void
}) {
  const sortable = useSortable({ id: item.key })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    sortable
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  // The row stays interactive in every visibility state. Only the
  // label is muted when locked at "never" — the dropdown trigger
  // remains keyboard-focusable so the user can re-enable the row.
  const isLocked = item.visibility === "never"
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`customize-row-${item.key}`}
      data-dragging={isDragging ? "true" : "false"}
      className={`group bg-background relative flex items-center justify-between px-3 py-2 ${
        isDragging ? "z-10 shadow-md" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* Drag handle — only the handle starts a drag, so the row
            below it stays clickable for keyboard interactions and
            for clicking through to the visibility dropdown. */}
        <button
          type="button"
          aria-label={`Reorder ${item.label}`}
          data-testid={`customize-row-handle-${item.key}`}
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground -ml-1 flex size-5 shrink-0 cursor-grab items-center justify-center rounded active:cursor-grabbing"
        >
          <HugeiconsIcon icon={Menu02Icon} className="size-3.5" />
        </button>
        <span
          className={`text-sm ${
            isLocked
              ? "text-muted-foreground"
              : "text-foreground"
          }`}
        >
          {item.label}
        </span>
      </div>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Visibility for ${item.label}: ${VISIBILITY_LABELS[item.visibility]}`}
              data-testid={`customize-row-trigger-${item.key}`}
              className="hover:bg-accent/50 focus-visible:ring-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs focus-visible:ring-2 focus-visible:outline-none"
            >
              <span>{VISIBILITY_LABELS[item.visibility]}</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="text-muted-foreground size-3"
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          {(Object.keys(VISIBILITY_LABELS) as SidebarVisibility[]).map(
            (option) => (
              <DropdownMenuItem
                key={option}
                data-testid={`customize-row-option-${item.key}-${option}`}
                onClick={() => {
                  onChangeVisibility(option)
                  // Spec: "selecting an option closes the dropdown".
                  // Base UI auto-closes on item click, but we also
                  // explicitly close here to be defensive against
                  // any onSelect customisation.
                  setMenuOpen(false)
                }}
                className="flex items-center justify-between text-xs"
              >
                <span>{VISIBILITY_LABELS[option]}</span>
                {item.visibility === option && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-3.5"
                  />
                )}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
