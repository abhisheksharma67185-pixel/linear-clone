"use client"

import { useEffect, useState } from "react"
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
  Attachment01Icon,
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<IssueLabel[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loaded, setLoaded] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [teamId, setTeamId] = useState<string>("")
  const [status, setStatus] = useState<Status>("backlog")
  const [priority, setPriority] = useState<Priority>("none")
  const [assigneeId, setAssigneeId] = useState<string | null>("usr-1")
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
          if (t.length > 0) setTeamId(t[0].id)
          setLoaded(true)
        }
      )
    }
  }, [open, loaded])

  const team = teams.find((t) => t.id === teamId) ?? null
  const assignee = members.find((m) => m.id === assigneeId) ?? null
  const project = projects.find((p) => p.id === projectId) ?? null
  const cycle = cycles.find((c) => c.id === cycleId) ?? null
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

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("backlog")
    setPriority("none")
    setProjectId(null)
    setLabelIds([])
    setCycleId(null)
  }

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
      resetForm()
      if (!createMore) onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {team ? team.key : "ABH"}
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
            aria-label="Attach file"
          >
            <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
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
              className="h-7 rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700"
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

// ---------- Status + Priority icons ----------

function StatusIcon({ status }: { status: Status }) {
  if (status === "backlog") {
    return (
      <span className="border-muted-foreground/60 size-3.5 rounded-full border border-dashed" />
    )
  }
  if (status === "todo") {
    return (
      <span className="border-muted-foreground/70 size-3.5 rounded-full border" />
    )
  }
  if (status === "in_progress") {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="#eab308"
          strokeWidth="1.5"
        />
        <path d="M8 8 L8 2 A6 6 0 0 1 13.2 11 Z" fill="#eab308" />
      </svg>
    )
  }
  if (status === "done") {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5">
        <circle cx="8" cy="8" r="7" fill="#6366f1" />
        <path
          d="M5 8 L7 10 L11 6"
          stroke="white"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // cancelled
  return (
    <svg viewBox="0 0 16 16" className="size-3.5">
      <circle cx="8" cy="8" r="7" fill="#9ca3af" />
      <path
        d="M5 5 L11 11 M11 5 L5 11"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PriorityIcon({ priority }: { priority: Priority }) {
  if (priority === "none") {
    return (
      <svg viewBox="0 0 16 16" className="text-muted-foreground size-3.5">
        <line
          x1="3"
          y1="8"
          x2="5"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="7"
          y1="8"
          x2="9"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="11"
          y1="8"
          x2="13"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (priority === "urgent") {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5">
        <rect x="1" y="1" width="14" height="14" rx="3" fill="#ef4444" />
        <rect x="7.25" y="3.5" width="1.5" height="6" fill="white" />
        <rect x="7.25" y="10.5" width="1.5" height="1.5" fill="white" />
      </svg>
    )
  }
  // low / medium / high — bar chart
  const heights: Record<string, [number, number, number]> = {
    high: [4, 8, 12],
    medium: [4, 8, 4],
    low: [4, 4, 4],
  }
  const opacity: Record<string, [number, number, number]> = {
    high: [1, 1, 1],
    medium: [1, 1, 0.3],
    low: [1, 0.3, 0.3],
  }
  const h = heights[priority] ?? [4, 4, 4]
  const o = opacity[priority] ?? [1, 1, 1]
  return (
    <svg viewBox="0 0 16 16" className="text-foreground size-3.5">
      <rect
        x="2"
        y={14 - h[0]}
        width="3"
        height={h[0]}
        rx="0.5"
        fill="currentColor"
        opacity={o[0]}
      />
      <rect
        x="6.5"
        y={14 - h[1]}
        width="3"
        height={h[1]}
        rx="0.5"
        fill="currentColor"
        opacity={o[1]}
      />
      <rect
        x="11"
        y={14 - h[2]}
        width="3"
        height={h[2]}
        rx="0.5"
        fill="currentColor"
        opacity={o[2]}
      />
    </svg>
  )
}
