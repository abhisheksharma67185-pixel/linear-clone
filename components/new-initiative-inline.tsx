"use client"

/**
 * Inline draft for a new initiative, rendered at the top of the active
 * tab when the user opts to create without leaving the page context.
 *
 * The Cancel handler is the regression target: an earlier iteration
 * left the draft card mounted (just visually hidden), so opening the
 * Display Options popover surfaced the orphan card behind the popover.
 * This implementation:
 *
 *   1. Uses controlled visibility from the parent — when the parent
 *      sets `open=false` (or the user clicks Cancel, which calls
 *      `onCancel`) the component returns `null` and React unmounts
 *      every input it ever owned.
 *   2. Resets local state on close via the keyed remount pattern: the
 *      parent passes a fresh `key` whenever it re-opens the form, so
 *      a new mount starts with empty fields and there is no risk of a
 *      stale uncontrolled-input value lingering.
 *   3. Exposes a stable `data-testid="new-initiative-inline"` plus
 *      `data-testid="new-initiative-input"` on the title input so
 *      Playwright can assert the form is gone after Cancel without
 *      relying on text selectors that could match other UI.
 */

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { NewInitiative } from "@/components/create-initiative-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Satellite01Icon } from "@hugeicons/core-free-icons"

interface NewInitiativeInlineProps {
  /** Controlled visibility — when false, the component is unmounted. */
  open: boolean
  /** Cancel handler. Must clear the parent's `open` state to trigger unmount. */
  onCancel: () => void
  /** Save handler — receives a fully-formed initiative payload. */
  onSave: (init: NewInitiative) => void
}

export function NewInitiativeInline({
  open,
  onCancel,
  onSave,
}: NewInitiativeInlineProps) {
  // Hard guard: when not open we render nothing — no hidden DOM, no
  // residual inputs that other overlays could surface behind.
  if (!open) return null
  return <NewInitiativeInlineMounted onCancel={onCancel} onSave={onSave} />
}

function NewInitiativeInlineMounted({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (init: NewInitiative) => void
}) {
  const [name, setName] = useState("")
  const [summary, setSummary] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the title field on first mount so the inline form
  // behaves like Linear's: type immediately, no extra click.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Escape closes the draft. Stop-propagation so it doesn't bubble to
  // any parent listeners that might re-open it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopPropagation()
      onCancel()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [onCancel])

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({
      id: `init-${Date.now()}`,
      name: trimmed,
      summary: summary.trim(),
      ownerId: null,
      targetDate: null,
      totalProjects: 0,
      completedProjects: 0,
      activeProjects: 0,
      health: "no_update",
      status: "active",
    })
  }

  return (
    <div
      data-testid="new-initiative-inline"
      className="bg-card flex flex-col gap-2 border-b px-6 py-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-500">
          <HugeiconsIcon icon={Satellite01Icon} className="size-4" />
        </div>
        <input
          ref={inputRef}
          data-testid="new-initiative-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave()
          }}
          placeholder="Initiative name"
          aria-label="Initiative name"
          className="placeholder:text-muted-foreground/60 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Add a short summary…"
        aria-label="Initiative summary"
        rows={2}
        className="placeholder:text-muted-foreground/60 ml-9 resize-none rounded-md bg-transparent text-xs outline-none"
      />
      <div className="ml-9 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          data-testid="new-initiative-cancel"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!name.trim()}
          data-testid="new-initiative-save"
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          Save
        </Button>
      </div>
    </div>
  )
}
