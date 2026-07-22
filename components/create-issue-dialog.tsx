"use client"

import { useCallback, useEffect, useState } from "react"
import { CURRENT_USER_ID } from "@/app/lib/current-user"
import {
  members as initialMembers,
  teams as initialTeams,
  projects as initialProjects,
  labels as initialLabels,
  cycles as initialCycles,
} from "@/app/lib/mock-data"
import type {
  Member,
  Project,
  Team,
  Label as IssueLabel,
  Cycle,
} from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  ArrowExpandDiagonal01Icon,
  ArrowRight01Icon,
  MoreHorizontalIcon,
  Hexagon01Icon,
  Tag01Icon,
  UserIcon,
  Calendar01Icon,
  Refresh01Icon,
  Link01Icon,
  PlusSignSquareIcon,
  PlayCircleIcon,
} from "@hugeicons/core-free-icons"

type Status = "backlog" | "todo" | "in_progress" | "done" | "cancelled"
type Priority = "urgent" | "high" | "medium" | "low" | "none"

const STATUS_OPTIONS: { value: Status; label: string; shortcut: string }[] = [
  { value: "backlog", label: "Backlog", shortcut: "1" },
  { value: "todo", label: "Todo", shortcut: "2" },
  { value: "in_progress", label: "In Progress", shortcut: "3" },
  { value: "done", label: "Done", shortcut: "5" },
  { value: "cancelled", label: "Canceled", shortcut: "6" },
]

const PRIORITY_OPTIONS: { value: Priority; label: string; shortcut: string }[] =
  [
    { value: "none", label: "No priority", shortcut: "0" },
    { value: "urgent", label: "Urgent", shortcut: "1" },
    { value: "high", label: "High", shortcut: "2" },
    { value: "medium", label: "Medium", shortcut: "3" },
    { value: "low", label: "Low", shortcut: "4" },
  ]

export function CreateIssueDialog({
  open,
  onOpenChange,
  onCreated,
  defaultAssigneeId,
  defaultTeamId,
  defaultStatus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Fired after a successful POST /api/data/issues, with the freshly
   * created issue. Consumers should optimistically merge this into
   * their local issue list (or refetch) so the new row appears
   * without a hard refresh.
   */
  onCreated?: (issue: unknown) => void
  /**
   * Per-context override for the Assignee dropdown's initial value.
   * Pass this when the dialog is opened from a place that has an
   * implied assignee (e.g. a team board cell where the column already
   * filters to one user). When omitted, the dialog defaults to the
   * currently signed-in user — never to a hardcoded member.
   */
  defaultAssigneeId?: string | null
  /** Per-context override for the Team dropdown's initial value. */
  defaultTeamId?: string
  /** Per-context override for the Status dropdown's initial value. */
  defaultStatus?: Status
}) {
  // Seed read-only rosters from the static mock-data import so the dialog
  // renders correctly on first paint (team key, current-user assignee). The
  // /api/data/* fetch below refreshes these in case they've been mutated by
  // another route — but never with empty arrays, so we never flash a
  // placeholder "ABH" team key or empty "Assignee" pill.
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [labels, setLabels] = useState<IssueLabel[]>(initialLabels)
  const [cycles, setCycles] = useState<Cycle[]>(initialCycles)
  const [loaded, setLoaded] = useState(false)

  // The initial Assignee is the per-context override if provided
  // (including explicit `null` for "Unassigned"), otherwise the
  // signed-in user. We resolve `undefined` to currentUser here so the
  // dropdown reflects the right default before the members roster
  // finishes loading.
  const initialAssignee: string | null =
    defaultAssigneeId === undefined ? CURRENT_USER_ID : defaultAssigneeId

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [teamId, setTeamId] = useState<string>(
    defaultTeamId ?? initialTeams[0]?.id ?? ""
  )
  const [status, setStatus] = useState<Status>(defaultStatus ?? "backlog")
  const [priority, setPriority] = useState<Priority>("none")
  const [assigneeId, setAssigneeId] = useState<string | null>(initialAssignee)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [cycleId, setCycleId] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [createMore, setCreateMore] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (open && !loaded) {
      Promise.all([
        fetch("/api/data/teams").then((r) => r.json()),
        fetch("/api/data/members").then((r) => r.json()),
        fetch("/api/data/projects").then((r) => r.json()),
        fetch("/api/data/labels")
          .then((r) => r.json())
          .catch(() => []),
        fetch("/api/data/cycles")
          .then((r) => r.json())
          .catch(() => []),
      ]).then(
        ([t, m, p, l, c]: [
          Team[],
          Member[],
          Project[],
          IssueLabel[],
          Cycle[],
        ]) => {
          setTeams(t)
          setMembers(m)
          setProjects(p)
          setLabels(l)
          setCycles(c)
          // Only auto-pick the first team when no per-context override
          // was provided — respecting the override avoids resetting a
          // team that the caller intentionally set.
          if (!defaultTeamId && t.length > 0) setTeamId(t[0].id)
          setLoaded(true)
        }
      )
    }
  }, [open, loaded, defaultTeamId])

  // Window-level Escape safety net. Base UI's Dialog already closes on
  // Escape by default, but a focused dropdown / contenteditable inside the
  // modal can intercept the keydown before it bubbles to the dialog root.
  // Listening on window in capture phase guarantees Escape always closes
  // the create dialog from any nested input.
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      // If a *different* overlay (a dropdown) is open inside the modal, let
      // it consume the Escape first — only close the modal when no inner
      // popup is intercepting it.
      const innerPopup = document.querySelector(
        '[data-state="open"][data-slot="dropdown-menu-content"], [data-state="open"][role="listbox"]'
      )
      if (innerPopup) return
      event.preventDefault()
      onOpenChange(false)
    }
    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [open, onOpenChange])

  const resetForm = useCallback(() => {
    setTitle("")
    setDescription("")
    setStatus(defaultStatus ?? "backlog")
    setPriority("none")
    setAssigneeId(initialAssignee)
    setProjectId(null)
    setLabelIds([])
    setCycleId(null)
  }, [initialAssignee, defaultStatus])

  // Wrap onOpenChange so closing the dialog (via Escape, backdrop click,
  // close button, or successful create) always fully resets the form. Doing
  // this in the open-state callback (rather than a useEffect on `open`)
  // avoids the cascading-render footgun and keeps reset deterministic.
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm()
        setCreating(false)
        setFullscreen(false)
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetForm]
  )

  const team = teams.find((t) => t.id === teamId) ?? null
  const assignee = members.find((m) => m.id === assigneeId) ?? null
  const project = projects.find((p) => p.id === projectId) ?? null
  const selectedLabels = labels.filter((l) => labelIds.includes(l.id))
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? "Backlog"
  const priorityLabel =
    PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? "Priority"

  // Cycles visible for the current team, split by state.
  const teamCycles = cycles.filter((c) => c.teamId === teamId)
  const currentCycle = teamCycles.find((c) => c.state === "active") ?? null
  const upcomingCycles = teamCycles.filter((c) => c.state === "upcoming")
  const previousCycles = teamCycles
    .filter((c) => c.state === "completed")
    .slice(-1)

  const handleCreate = async () => {
    if (!title.trim() || !teamId) return
    setCreating(true)
    const res = await fetch("/api/data/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        teamId,
        status,
        priority,
        assigneeId,
        projectId,
        cycleId,
        labelIds,
        estimate: null,
        dueDate: null,
      }),
    })
    setCreating(false)
    if (res.ok) {
      // Hand the freshly-created issue to the parent so it can merge
      // it into its local list (e.g. so the new row shows up in a
      // saved view immediately, without a hard reload).
      try {
        const created = await res.clone().json()
        onCreated?.(created)
      } catch {
        // Body wasn't JSON or already consumed — non-fatal; the
        // parent can fall back to a refetch on next render.
        onCreated?.(null)
      }
      if (createMore) {
        // Stay open and clear the form for the next entry.
        resetForm()
      } else {
        // handleOpenChange takes care of resetting form/loading state.
        handleOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={
          fullscreen
            ? "flex h-[95vh] w-[95vw] max-w-none flex-col gap-0 overflow-hidden p-0"
            : "flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[620px]"
        }
      >
        <header className="flex items-center justify-between px-3 py-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
              <HugeiconsIcon icon={UserIcon} className="size-2.5" />
            </span>
            <span className="text-foreground font-medium">
              {team?.key ?? initialTeams[0]?.key ?? ""}
            </span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
            <span>New issue</span>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-6"
              onClick={() => setFullscreen((v) => !v)}
              aria-label="Toggle fullscreen"
            >
              <HugeiconsIcon
                icon={ArrowExpandDiagonal01Icon}
                className="size-3.5"
              />
            </Button>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground size-6"
                />
              }
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </DialogClose>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-1 px-4 pt-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue title"
            className="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-semibold focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            className={`placeholder:text-muted-foreground/50 w-full flex-1 resize-none bg-transparent text-sm focus:outline-none ${
              fullscreen ? "min-h-[300px]" : "min-h-[48px]"
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              <StatusIcon status={status} />
              <span>{statusLabel}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <MenuHeader title="Change status..." shortcut="S" />
              {STATUS_OPTIONS.map((s) => (
                <MenuRow
                  key={s.value}
                  icon={<StatusIcon status={s.value} />}
                  checked={s.value === status}
                  right={
                    <span className="text-muted-foreground text-[10px]">
                      {s.shortcut}
                    </span>
                  }
                  onClick={() => setStatus(s.value)}
                >
                  {s.label}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              <PriorityIcon priority={priority} />
              <span>{priority === "none" ? "Priority" : priorityLabel}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <MenuHeader title="Set priority to..." shortcut="P" />
              {PRIORITY_OPTIONS.map((p) => (
                <MenuRow
                  key={p.value}
                  icon={<PriorityIcon priority={p.value} />}
                  checked={p.value === priority}
                  right={
                    <span className="text-muted-foreground text-[10px]">
                      {p.shortcut}
                    </span>
                  }
                  onClick={() => setPriority(p.value)}
                >
                  {p.label}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assignee */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              {assignee ? (
                <Avatar src={assignee.avatar} name={assignee.name} />
              ) : (
                <div className="border-muted-foreground/50 size-4 rounded-full border border-dashed" />
              )}
              <span>{assignee ? assignee.email : "Assignee"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <MenuHeader title="Assign to..." shortcut="A" />
              <MenuRow
                icon={
                  <div className="border-muted-foreground/50 size-4 rounded-full border border-dashed" />
                }
                checked={assigneeId === null}
                right={
                  <span className="text-muted-foreground text-[10px]">0</span>
                }
                onClick={() => setAssigneeId(null)}
              >
                No assignee
              </MenuRow>
              <MenuSection label="Team members" />
              <div className="max-h-64 overflow-auto">
                {members.map((m) => (
                  <MenuRow
                    key={m.id}
                    icon={<Avatar src={m.avatar} name={m.name} />}
                    checked={m.id === assigneeId}
                    onClick={() => setAssigneeId(m.id)}
                  >
                    {m.email}
                  </MenuRow>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Project */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              <HugeiconsIcon
                icon={Hexagon01Icon}
                className="text-muted-foreground size-3.5"
              />
              <span>{project ? project.name : "Project"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <MenuHeader title="Add to project..." shortcut="⇧P" />
              <MenuRow
                icon={
                  <HugeiconsIcon
                    icon={Hexagon01Icon}
                    className="text-muted-foreground size-3.5"
                  />
                }
                checked={projectId === null}
                right={
                  <span className="text-muted-foreground text-[10px]">0</span>
                }
                onClick={() => setProjectId(null)}
              >
                No project
              </MenuRow>
              {projects.map((p) => (
                <MenuRow
                  key={p.id}
                  icon={
                    <HugeiconsIcon
                      icon={Hexagon01Icon}
                      className="text-muted-foreground size-3.5"
                    />
                  }
                  checked={p.id === projectId}
                  onClick={() => setProjectId(p.id)}
                >
                  {p.name}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Labels */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              <HugeiconsIcon
                icon={Tag01Icon}
                className="text-muted-foreground size-3.5"
              />
              <span>
                {selectedLabels.length === 0
                  ? "Labels"
                  : selectedLabels.length === 1
                    ? selectedLabels[0].name
                    : `${selectedLabels.length} labels`}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <MenuHeader title="Add labels..." shortcut="L" />
              <div className="max-h-80 overflow-auto">
                <MenuSection label="Frequently used" />
                {labels.slice(0, 3).map((l) => (
                  <LabelRow
                    key={l.id}
                    label={l}
                    checked={labelIds.includes(l.id)}
                    onToggle={() =>
                      setLabelIds((prev) =>
                        prev.includes(l.id)
                          ? prev.filter((x) => x !== l.id)
                          : [...prev, l.id]
                      )
                    }
                  />
                ))}
                <MenuSection label="Labels" />
                {labels.map((l) => (
                  <LabelRow
                    key={`all-${l.id}`}
                    label={l}
                    checked={labelIds.includes(l.id)}
                    onToggle={() =>
                      setLabelIds((prev) =>
                        prev.includes(l.id)
                          ? prev.filter((x) => x !== l.id)
                          : [...prev, l.id]
                      )
                    }
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cycle */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-muted/60 flex size-6 items-center justify-center rounded-md border"
                  aria-label="Cycle"
                />
              }
            >
              <HugeiconsIcon icon={PlayCircleIcon} className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <MenuRow
                icon={
                  <div className="border-muted-foreground/50 size-3.5 rounded-full border border-dashed" />
                }
                checked={cycleId === null}
                right={
                  <span className="text-muted-foreground text-[10px]">0</span>
                }
                onClick={() => setCycleId(null)}
              >
                No cycle
              </MenuRow>
              {currentCycle && (
                <CycleRow
                  cycle={currentCycle}
                  checked={cycleId === currentCycle.id}
                  onClick={() => setCycleId(currentCycle.id)}
                  state="Current"
                />
              )}
              {upcomingCycles.map((c) => (
                <CycleRow
                  key={c.id}
                  cycle={c}
                  checked={cycleId === c.id}
                  onClick={() => setCycleId(c.id)}
                  state="Upcoming"
                />
              ))}
              {previousCycles.length > 0 && (
                <div className="border-border my-1 border-t" />
              )}
              {previousCycles.map((c) => (
                <CycleRow
                  key={c.id}
                  cycle={c}
                  checked={cycleId === c.id}
                  onClick={() => setCycleId(c.id)}
                  state="Previous"
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-muted/60 flex size-6 items-center justify-center rounded-md border"
                  aria-label="More options"
                />
              }
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                <span className="flex-1">Set due date</span>
                <span className="text-muted-foreground text-[10px]">⇧D</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                <span className="flex-1">Make recurring...</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Link01Icon} className="size-4" />
                <span className="flex-1">Add link...</span>
                <span className="text-muted-foreground text-[10px]">
                  Ctrl L
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={PlusSignSquareIcon} className="size-4" />
                <span className="flex-1">Add sub-issue</span>
                <span className="text-muted-foreground text-[10px]">⌘⇧O</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <footer className="flex items-center justify-between border-t px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7"
            aria-label="Add link"
          >
            <HugeiconsIcon icon={Link01Icon} className="size-4" />
          </Button>
          <div className="flex items-center gap-3">
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              <Switch
                checked={createMore}
                onCheckedChange={setCreateMore}
                className="scale-75"
              />
              <span>Create more</span>
            </label>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || !teamId || creating}
              className="h-7 rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {creating ? "Creating..." : "Create issue"}
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Building blocks ----------

function PillButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`text-foreground hover:bg-muted/60 flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  )
}

function MenuHeader({ title, shortcut }: { title: string; shortcut?: string }) {
  return (
    <div className="text-muted-foreground flex items-center justify-between px-2 py-1.5 text-xs">
      <span>{title}</span>
      {shortcut && (
        <span className="rounded border px-1 font-mono text-[10px]">
          {shortcut}
        </span>
      )}
    </div>
  )
}

function MenuSection({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground mt-1 px-2 py-1 text-[10px] font-medium tracking-wide uppercase">
      {label}
    </div>
  )
}

function MenuRow({
  icon,
  children,
  checked,
  right,
  onClick,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  checked?: boolean
  right?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs"
    >
      {icon && (
        <span className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {checked && <span className="text-[10px]">✓</span>}
      {right}
    </button>
  )
}

function LabelRow({
  label,
  checked,
  onToggle,
}: {
  label: IssueLabel
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs"
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: label.color }}
      />
      <span className="flex-1 truncate">{label.name}</span>
      {checked && <span className="text-[10px]">✓</span>}
    </button>
  )
}

function CycleRow({
  cycle,
  state,
  checked,
  onClick,
}: {
  cycle: Cycle
  state: string
  checked: boolean
  onClick: () => void
}) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs"
    >
      <HugeiconsIcon
        icon={PlayCircleIcon}
        className="text-muted-foreground size-3.5 shrink-0"
      />
      <span className="font-medium">{cycle.name}</span>
      <span className="text-muted-foreground">
        {fmt(cycle.startDate)} - {fmt(cycle.endDate)}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{state}</span>
      {checked && <span className="ml-auto text-[10px]">✓</span>}
    </button>
  )
}

function Avatar({ src, name }: { src: string; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} className="size-4 rounded-full" />
}
