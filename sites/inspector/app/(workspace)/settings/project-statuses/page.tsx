"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PlusSignIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Copy01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import type { Issue } from "@/app/lib/mock-data"
import { StatusIcon } from "@/components/status-icons"

type StatusCategory =
  | "backlog"
  | "planned"
  | "in-progress"
  | "completed"
  | "canceled"

const STATUS_CATEGORIES: StatusCategory[] = [
  "backlog",
  "planned",
  "in-progress",
  "completed",
  "canceled",
]

const CATEGORY_LABEL: Record<StatusCategory, string> = {
  backlog: "Backlog",
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  canceled: "Canceled",
}

// Map project status category to the issue StatusIcon shape language so we
// reuse the same iconography (dashed circle / outline / pie / check / X)
// instead of rendering a plain colored swatch.
const CATEGORY_ICON_SHAPE: Record<StatusCategory, Issue["status"]> = {
  backlog: "backlog",
  planned: "todo",
  "in-progress": "in_progress",
  completed: "done",
  canceled: "cancelled",
}

const CATEGORY_DEFAULT_COLOR: Record<StatusCategory, string> = {
  backlog: "#9ca3af",
  planned: "#a78bfa",
  "in-progress": "#f59e0b",
  completed: "#10b981",
  canceled: "#6b7280",
}

const SWATCHES = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#9ca3af",
  "#6b7280",
  "#a78bfa",
] as const

type Status = {
  id: string
  name: string
  description: string
  color: string
  category: StatusCategory
  order: number
  usageCount?: number
  createdAt: string
  updatedAt: string
}

type Draft = {
  category: StatusCategory
  name: string
  description: string
  color: string
}

type EditTarget = { id: string; field: "name" | "description" } | null

export default function ProjectStatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [editing, setEditing] = useState<EditTarget>(null)
  const [editingValue, setEditingValue] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<Status | null>(null)
  const [liveMessage, setLiveMessage] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch("/api/project-statuses")
      .then((r) => r.json())
      .then((list: Status[]) => {
        if (!cancelled) setStatuses(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const announce = (msg: string) => {
    setLiveMessage("") // reset so re-setting the same message still fires
    requestAnimationFrame(() => setLiveMessage(msg))
  }

  const byCategory = useMemo(() => {
    const map: Record<StatusCategory, Status[]> = {
      backlog: [],
      planned: [],
      "in-progress": [],
      completed: [],
      canceled: [],
    }
    for (const s of statuses) {
      if (map[s.category]) map[s.category].push(s)
    }
    for (const cat of STATUS_CATEGORIES) {
      map[cat].sort((a, b) => a.order - b.order)
    }
    return map
  }, [statuses])

  // The "+" button on each category header inserts exactly ONE editor row.
  // If another draft is open, replace it (don't accumulate duplicates).
  const startDraft = (category: StatusCategory) => {
    setDraft({
      category,
      name: "",
      description: "",
      color: CATEGORY_DEFAULT_COLOR[category],
    })
  }

  const cancelDraft = () => setDraft(null)

  const saveDraft = async () => {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      cancelDraft()
      return
    }
    try {
      const res = await fetch("/api/project-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: draft.description.trim(),
          color: draft.color,
          category: draft.category,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error || "Failed to create status")
        return
      }
      const created = (await res.json()) as Status
      setStatuses((prev) => [...prev, created])
      setDraft(null)
      toast.success(`Status "${name}" created`)
      announce(`${name} added to ${CATEGORY_LABEL[created.category]}`)
    } catch {
      toast.error("Failed to create status")
    }
  }

  const applyUpdate = async (id: string, patch: Partial<Status>) => {
    const prev = statuses
    setStatuses((list) =>
      list.map((s) => (s.id === id ? { ...s, ...patch } : s))
    )
    try {
      const res = await fetch(`/api/project-statuses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
    } catch {
      setStatuses(prev)
      toast.error("Failed to update status")
    }
  }

  const commitNameEdit = (id: string) => {
    const current = statuses.find((s) => s.id === id)
    const next = editingValue.trim()
    setEditing(null)
    if (!current || !next || next === current.name) return
    applyUpdate(id, { name: next })
  }

  const commitDescriptionEdit = (id: string) => {
    const current = statuses.find((s) => s.id === id)
    const next = editingValue.trim()
    setEditing(null)
    if (!current || next === (current.description ?? "")) return
    applyUpdate(id, { description: next })
  }

  const duplicateStatus = async (s: Status) => {
    try {
      const res = await fetch(`/api/project-statuses/${s.id}/duplicate`, {
        method: "POST",
      })
      if (!res.ok) throw new Error()
      const copy = (await res.json()) as Status
      setStatuses((list) => [...list, copy])
      toast.success(`Duplicated "${s.name}"`)
      announce(`${copy.name} added`)
    } catch {
      toast.error("Failed to duplicate status")
    }
  }

  const performDelete = async () => {
    if (!confirmDelete) return
    const s = confirmDelete
    const prev = statuses
    setStatuses((list) => list.filter((x) => x.id !== s.id))
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/project-statuses/${s.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Deleted "${s.name}"`)
      announce(`${s.name} deleted`)
    } catch {
      setStatuses(prev)
      toast.error("Failed to delete status")
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex w-fit items-center gap-1 rounded text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Settings
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Project statuses</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Project statuses define the workflow that projects go through from
          start to completion
        </p>
      </div>

      {/* aria-live region: screen readers announce create/delete/reorder. */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <div className="overflow-hidden rounded-lg border">
        {STATUS_CATEGORIES.map((cat) => (
          <section key={cat} aria-labelledby={`status-header-${cat}`}>
            <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-1.5">
              <h2
                id={`status-header-${cat}`}
                className="text-muted-foreground text-xs font-medium"
              >
                {CATEGORY_LABEL[cat]}
              </h2>
              <button
                type="button"
                aria-label={`Add new ${CATEGORY_LABEL[cat]} status`}
                onClick={() => startDraft(cat)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              </button>
            </div>

            {/* Inline draft for this category (exactly one at a time). */}
            {draft?.category === cat && (
              <DraftRow
                draft={draft}
                setDraft={setDraft}
                onSave={saveDraft}
                onCancel={cancelDraft}
              />
            )}

            {byCategory[cat].length === 0 && draft?.category !== cat && (
              <div className="text-muted-foreground/70 border-b px-4 py-3 text-xs last:border-b-0">
                No {CATEGORY_LABEL[cat].toLowerCase()} statuses
              </div>
            )}

            {byCategory[cat].map((s) => {
              const isEditingName =
                editing !== null &&
                editing.id === s.id &&
                editing.field === "name"
              const isEditingDesc =
                editing !== null &&
                editing.id === s.id &&
                editing.field === "description"
              return (
                <div
                  key={s.id}
                  className="group/row hover:bg-accent/20 flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
                >
                  {/* Drag handle (decorative — DnD reorder out of scope). */}
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50 cursor-grab text-xs opacity-0 transition-opacity select-none group-hover/row:opacity-100"
                  >
                    ⋮⋮
                  </span>
                  <ColorPicker
                    color={s.color}
                    onChange={(c) => applyUpdate(s.id, { color: c })}
                    ariaLabel={`Change color of ${s.name}`}
                    shape={CATEGORY_ICON_SHAPE[s.category]}
                  />
                  <div className="min-w-0 flex-1">
                    {isEditingName ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitNameEdit(s.id)
                          if (e.key === "Escape") setEditing(null)
                        }}
                        onBlur={() => commitNameEdit(s.id)}
                        aria-label={`Rename ${s.name}`}
                        className="focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      />
                    ) : (
                      <div
                        onDoubleClick={() => {
                          setEditing({ id: s.id, field: "name" })
                          setEditingValue(s.name)
                        }}
                        className="cursor-text text-sm font-medium"
                      >
                        {s.name}
                      </div>
                    )}
                    {isEditingDesc ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitDescriptionEdit(s.id)
                          if (e.key === "Escape") setEditing(null)
                        }}
                        onBlur={() => commitDescriptionEdit(s.id)}
                        aria-label={`Edit description for ${s.name}`}
                        placeholder="Description…"
                        className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background mt-0.5 w-full bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      />
                    ) : (
                      (() => {
                        const count = s.usageCount ?? 0
                        const desc = s.description
                        return (
                          <div
                            onDoubleClick={() => {
                              setEditing({ id: s.id, field: "description" })
                              setEditingValue(desc ?? "")
                            }}
                            className={`text-muted-foreground mt-0.5 cursor-text text-xs ${desc ? "" : "text-muted-foreground/50"}`}
                          >
                            {desc ||
                              (count > 0
                                ? `${count} ${count === 1 ? "project" : "projects"}`
                                : "Description…")}
                          </div>
                        )
                      })()
                    )}
                  </div>

                  {s.usageCount !== undefined && s.usageCount > 0 && (
                    <button
                      type="button"
                      aria-label={`View ${s.usageCount} projects in ${s.name}`}
                      onClick={() =>
                        toast.info(
                          `Filtered projects view for "${s.name}" — coming soon`
                        )
                      }
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background hidden shrink-0 rounded px-2 py-0.5 text-xs opacity-0 transition-opacity group-hover/row:block group-hover/row:opacity-100 focus-visible:block focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      View projects
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label={`Open menu for ${s.name}`}
                          className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end" sideOffset={4}>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing({ id: s.id, field: "name" })
                          setEditingValue(s.name)
                        }}
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing({ id: s.id, field: "description" })
                          setEditingValue(s.description ?? "")
                        }}
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        Edit description
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateStatus(s)}>
                        <HugeiconsIcon
                          icon={Copy01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setConfirmDelete(s)}
                        className="text-destructive data-highlighted:text-destructive data-highlighted:bg-destructive/10"
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </section>
        ))}
      </div>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete status?</DialogTitle>
            <DialogDescription>
              The status{" "}
              <span className="text-foreground font-medium">
                {confirmDelete?.name}
              </span>{" "}
              will be removed.
              {(confirmDelete?.usageCount ?? 0) > 0 && (
                <>
                  {" "}
                  It&apos;s currently used by {confirmDelete?.usageCount}{" "}
                  project{confirmDelete?.usageCount === 1 ? "" : "s"}; those
                  projects will need a new status.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={performDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DraftRow({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="bg-accent/20 flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
      data-testid="draft-row"
    >
      <span
        aria-hidden="true"
        className="text-muted-foreground/50 text-xs select-none"
      >
        ⋮⋮
      </span>
      <ColorPicker
        color={draft.color}
        onChange={(c) => setDraft({ ...draft, color: c })}
        ariaLabel="Pick status color"
        shape={CATEGORY_ICON_SHAPE[draft.category]}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <input
          autoFocus
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave()
            if (e.key === "Escape") onCancel()
          }}
          placeholder="Name"
          aria-label="Status name"
          className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
        <input
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave()
            if (e.key === "Escape") onCancel()
          }}
          placeholder="Description…"
          aria-label="Status description"
          className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Cancel new status"
        onClick={onCancel}
        className="h-7 text-xs"
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        aria-label="Create status"
        onClick={onSave}
        disabled={!draft.name.trim()}
        className="h-7 text-xs"
      >
        Create
      </Button>
    </div>
  )
}

function ColorPicker({
  color,
  onChange,
  ariaLabel,
  shape,
}: {
  color: string
  onChange: (c: string) => void
  ariaLabel: string
  /** When provided, render the matching Linear status icon instead of a plain swatch. */
  shape?: Issue["status"]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className="focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-5 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {shape ? (
              <StatusIcon status={shape} color={color} className="size-4" />
            ) : (
              <span
                className="size-3.5 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            )}
          </button>
        }
      />
      <PopoverContent className="w-auto p-2" align="start" sideOffset={4}>
        <div className="grid grid-cols-9 gap-1.5">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Color ${s}`}
              onClick={() => {
                onChange(s)
                setOpen(false)
              }}
              className="focus-visible:ring-primary/50 focus-visible:ring-offset-background size-5 rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{ backgroundColor: s }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
