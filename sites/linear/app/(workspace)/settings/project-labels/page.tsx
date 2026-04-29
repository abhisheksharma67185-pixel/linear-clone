"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { Label as LabelType } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  Search01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Copy01Icon,
  Archive01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import {
  applyTableQuery,
  parseScope,
  shouldShowEmptyState,
  type ProjectLabelScope,
} from "@/lib/project-labels"

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
  "#6b7280",
] as const

const SCOPE_LABELS: Record<ProjectLabelScope, string> = {
  workspace: "Workspace",
  archived: "Archived",
}

type LabelGroup = { id: string; name: string; color: string }

function ProjectLabelsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const scope = parseScope(searchParams.get("scope"))
  const filter = searchParams.get("q") ?? ""

  const [labels, setLabels] = useState<LabelType[]>([])
  const [groups, setGroups] = useState<LabelGroup[]>([])
  const [draft, setDraft] = useState<{
    color: string
    name: string
    description: string
  } | null>(null)
  const [groupDraft, setGroupDraft] = useState<{
    color: string
    name: string
  } | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/data/project-labels")
      .then((r) => r.json())
      .then(setLabels)
      .catch(() => {})
  }, [])

  const setParam = useCallback(
    (patch: { scope?: ProjectLabelScope; q?: string }) => {
      const next = new URLSearchParams(searchParams.toString())
      if (patch.scope !== undefined) {
        // Drop default scope to keep URLs clean.
        if (patch.scope === "workspace") next.delete("scope")
        else next.set("scope", patch.scope)
      }
      if (patch.q !== undefined) {
        if (patch.q.length === 0) next.delete("q")
        else next.set("q", patch.q)
      }
      router.replace(
        `/settings/project-labels${next.toString() ? `?${next}` : ""}`,
        { scroll: false }
      )
    },
    [router, searchParams]
  )

  const visible = useMemo(
    () => applyTableQuery(labels, { term: filter, scope, sortDir }),
    [labels, filter, scope, sortDir]
  )

  const startNew = () => {
    const pick = SWATCHES[Math.floor(Math.random() * SWATCHES.length)]
    setDraft({ color: pick, name: "", description: "" })
  }

  const saveNew = async () => {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      setDraft(null)
      return
    }
    try {
      const res = await fetch("/api/data/project-labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color: draft.color,
          description: draft.description.trim(),
          teamId: null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error || "Failed to create label")
        return
      }
      const created = (await res.json()) as LabelType
      setLabels((list) => [created, ...list])
      setDraft(null)
      toast.success(`Label "${name}" created`)
    } catch {
      toast.error("Failed to create label")
    }
  }

  const applyUpdate = async (id: string, patch: Partial<LabelType>) => {
    const prev = labels
    setLabels((list) =>
      list.map((l) => (l.id === id ? ({ ...l, ...patch } as LabelType) : l))
    )
    try {
      const res = await fetch(`/api/data/project-labels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLabels(prev)
      toast.error("Failed to update label")
    }
  }

  const deleteLabel = async (label: LabelType) => {
    const prev = labels
    setLabels((list) => list.filter((l) => l.id !== label.id))
    try {
      const res = await fetch(`/api/data/project-labels/${label.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Deleted "${label.name}"`)
    } catch {
      setLabels(prev)
      toast.error("Failed to delete label")
    }
  }

  const archiveLabel = (label: LabelType) =>
    applyUpdate(label.id, { archivedAt: new Date().toISOString() })

  const restoreLabel = (label: LabelType) =>
    applyUpdate(label.id, { archivedAt: null })

  const duplicateLabel = async (label: LabelType) => {
    const name = `${label.name} (copy)`
    try {
      const res = await fetch("/api/data/project-labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color: label.color,
          description: label.description ?? "",
          teamId: label.teamId,
        }),
      })
      if (!res.ok) throw new Error()
      const created = (await res.json()) as LabelType
      setLabels((list) => [created, ...list])
      toast.success(`Duplicated as "${name}"`)
    } catch {
      toast.error("Failed to duplicate label")
    }
  }

  const saveGroup = () => {
    if (!groupDraft || !groupDraft.name.trim()) {
      setGroupDraft(null)
      return
    }
    const group: LabelGroup = {
      id: `grp_${Math.random().toString(36).slice(2, 10)}`,
      name: groupDraft.name.trim(),
      color: groupDraft.color,
    }
    setGroups((list) => [group, ...list])
    setGroupDraft(null)
    toast.success(`Group "${group.name}" created`)
  }

  const showEmpty = shouldShowEmptyState(visible.length, draft !== null)
  // Mirrors the issue-labels table after the parity simplification:
  // checkbox / dot / name (with description as inline secondary text) /
  // Last applied / Created / row-actions menu.
  const gridCols = "grid grid-cols-[32px_16px_1fr_120px_96px_32px]"
  const allVisibleSelected =
    visible.length > 0 && visible.every((l) => selected.has(l.id))
  const someVisibleSelected = visible.some((l) => selected.has(l.id))

  return (
    <div className="flex max-w-4xl flex-col p-6">
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background mb-3 inline-flex w-fit items-center gap-1 rounded text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Settings
      </Link>
      <h1 className="mb-4 text-xl font-semibold">Project labels</h1>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <input
            value={filter}
            onChange={(e) => setParam({ q: e.target.value })}
            placeholder="Filter by name..."
            aria-label="Filter labels by name"
            className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background h-8 w-full rounded-md border bg-transparent pr-3 pl-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Scope: ${SCOPE_LABELS[scope]}`}
                aria-haspopup="listbox"
                className="text-muted-foreground hover:bg-accent/40 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {SCOPE_LABELS[scope]}
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
              </button>
            }
          />
          <DropdownMenuContent align="start" sideOffset={4}>
            {(["workspace", "archived"] as ProjectLabelScope[]).map((k) => (
              <DropdownMenuItem
                key={k}
                onClick={() => {
                  setParam({ scope: k })
                  setSelected(new Set())
                }}
                className="justify-between"
              >
                {SCOPE_LABELS[k]}
                {scope === k && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="New label group"
            onClick={() => setGroupDraft({ color: SWATCHES[9], name: "" })}
            className="h-8 text-sm"
          >
            New group
          </Button>
          <Button
            size="sm"
            aria-label="New label"
            onClick={startNew}
            className="h-8 bg-violet-600 text-sm text-white hover:bg-violet-700"
          >
            New label
          </Button>
        </div>
      </div>

      {/* Column headers */}
      <div
        className={`${gridCols} text-muted-foreground border-b px-2 pb-2 text-xs font-medium`}
      >
        <div className="flex items-center">
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={!allVisibleSelected && someVisibleSelected}
            onCheckedChange={(v) => {
              if (v) setSelected(new Set(visible.map((l) => l.id)))
              else setSelected(new Set())
            }}
            aria-label={
              allVisibleSelected ? "Deselect all labels" : "Select all labels"
            }
            className="size-3.5"
          />
        </div>
        <div />
        <div>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={`Sort by name ${sortDir === "asc" ? "descending" : "ascending"}`}
            className="hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Name
            <HugeiconsIcon
              icon={sortDir === "asc" ? ArrowDown01Icon : ArrowUp01Icon}
              className="size-3"
            />
          </button>
        </div>
        <div>Last applied</div>
        <div>Created</div>
        <div />
      </div>

      {/* Inline new-label row */}
      {draft && (
        <div
          className={`${gridCols} bg-accent/20 items-center border-b px-2 py-2.5 text-sm`}
        >
          <div />
          <SwatchPicker
            color={draft.color}
            onChange={(c) => setDraft((d) => (d ? { ...d, color: c } : d))}
            ariaLabel="Pick label color"
          />
          {/* Name + description stack inside the single name column to
              match the issue-labels table after column simplification. */}
          <div className="flex flex-col pr-2">
            <input
              autoFocus
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, name: e.target.value } : d))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNew()
                if (e.key === "Escape") setDraft(null)
              }}
              placeholder="Label name"
              aria-label="Label name"
              className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
            <input
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, description: e.target.value } : d))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNew()
                if (e.key === "Escape") setDraft(null)
              }}
              placeholder="Add label description…"
              aria-label="Label description"
              className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
          <div />
          <div />
          <div />
        </div>
      )}

      {/* Inline new-group row */}
      {groupDraft && (
        <div
          className={`${gridCols} bg-accent/20 items-center border-b px-2 py-2.5 text-sm`}
        >
          <div />
          <SwatchPicker
            color={groupDraft.color}
            onChange={(c) => setGroupDraft((g) => (g ? { ...g, color: c } : g))}
            ariaLabel="Group color"
          />
          <div className="col-span-4 pr-2">
            <input
              autoFocus
              value={groupDraft.name}
              onChange={(e) =>
                setGroupDraft((g) => (g ? { ...g, name: e.target.value } : g))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") saveGroup()
                if (e.key === "Escape") setGroupDraft(null)
              }}
              onBlur={saveGroup}
              placeholder="Group name"
              aria-label="Group name"
              className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
          <div />
        </div>
      )}

      {groups.map((g) => (
        <div key={g.id} className={`${gridCols} border-b px-2 py-2.5 text-sm`}>
          <div />
          <span
            className="mt-[3px] size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: g.color }}
            aria-hidden="true"
          />
          <div className="col-span-4 text-sm font-medium">
            {g.name}
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              group
            </span>
          </div>
        </div>
      ))}

      {visible.map((label) => {
        const isChecked = selected.has(label.id)
        return (
          <div
            key={label.id}
            className={`${gridCols} group/row hover:bg-accent/20 items-center border-b px-2 py-2.5 text-sm last:border-b-0 ${
              isChecked ? "bg-accent/30" : ""
            }`}
          >
            <div className="flex items-center">
              <Checkbox
                checked={isChecked}
                onCheckedChange={(v) => {
                  setSelected((prev) => {
                    const next = new Set(prev)
                    if (v) next.add(label.id)
                    else next.delete(label.id)
                    return next
                  })
                }}
                aria-label={`Select ${label.name}`}
                className={`size-3.5 transition-opacity ${
                  isChecked
                    ? "opacity-100"
                    : "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
                }`}
              />
            </div>
            <SwatchPicker
              color={label.color}
              onChange={(c) => applyUpdate(label.id, { color: c })}
              ariaLabel={`Change color of ${label.name}`}
            />
            <div className="flex min-w-0 flex-col pr-2">
              <span className="truncate text-sm font-medium">{label.name}</span>
              {/* Description rendered as inline secondary text under the
                  name to preserve the field after dropping the dedicated
                  Description column (matches issue-labels). */}
              {label.description && (
                <span className="text-muted-foreground truncate text-xs">
                  {label.description}
                </span>
              )}
            </div>
            <div className="text-muted-foreground text-xs">—</div>
            <div className="text-muted-foreground text-xs">
              {label.createdAt
                ? new Date(label.createdAt as string).toLocaleDateString()
                : "—"}
            </div>
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`Actions for ${label.name}`}
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
                  <DropdownMenuItem onClick={() => duplicateLabel(label)}>
                    <HugeiconsIcon
                      icon={Copy01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    Duplicate
                  </DropdownMenuItem>
                  {label.archivedAt ? (
                    <DropdownMenuItem onClick={() => restoreLabel(label)}>
                      <HugeiconsIcon
                        icon={PencilEdit01Icon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                      Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => archiveLabel(label)}>
                      <HugeiconsIcon
                        icon={Archive01Icon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteLabel(label)}
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
          </div>
        )
      })}

      {showEmpty && <EmptyState scope={scope} filter={filter} />}
    </div>
  )
}

function SwatchPicker({
  color,
  onChange,
  ariaLabel,
}: {
  color: string
  onChange: (c: string) => void
  ariaLabel: string
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
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          </button>
        }
      />
      <PopoverContent className="w-auto p-2" align="start" sideOffset={4}>
        <div className="grid grid-cols-8 gap-1.5">
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

function EmptyState({
  scope,
  filter,
}: {
  scope: ProjectLabelScope
  filter: string
}) {
  const copy = filter.trim()
    ? "No labels match your filter"
    : scope === "archived"
      ? "No archived labels"
      : "No labels yet — create one to get started"
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg
        viewBox="0 0 80 60"
        className="text-muted-foreground/30 mb-4 w-20"
        fill="none"
        aria-hidden="true"
      >
        <ellipse
          cx="40"
          cy="30"
          rx="30"
          ry="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <ellipse
          cx="34"
          cy="30"
          rx="7"
          ry="5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <ellipse
          cx="44"
          cy="27"
          rx="7"
          ry="5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <ellipse
          cx="44"
          cy="33"
          rx="7"
          ry="5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <p className="text-muted-foreground text-sm">{copy}</p>
    </div>
  )
}

export default function ProjectLabelsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectLabelsInner />
    </Suspense>
  )
}
