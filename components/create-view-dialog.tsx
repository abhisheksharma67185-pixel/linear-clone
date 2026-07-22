"use client"

import { useEffect, useMemo, useState } from "react"
import type {
  Cycle,
  Issue,
  Label as IssueLabel,
  Member,
  Team,
  View,
} from "@/app/lib/mock-data"
import { filterIssuesForView } from "@/lib/view-filter"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  ArrowExpandDiagonal01Icon,
  HashtagIcon,
  UserIcon,
  Tag01Icon,
  PlayCircleIcon,
  FilterIcon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"

type Status = "backlog" | "todo" | "in_progress" | "done" | "cancelled"
type Priority = "urgent" | "high" | "medium" | "low" | "none"

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Canceled" },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "No priority" },
]

interface ViewFilters {
  status: Status | null
  priority: Priority | null
  assignee: "none" | "currentUser" | string | null // null = any, "none" = unassigned, "currentUser" = me, else memberId
  labelName: string | null
  teamId: string | null
  cycle: "active" | null
}

const EMPTY_FILTERS: ViewFilters = {
  status: null,
  priority: null,
  assignee: null,
  labelName: null,
  teamId: null,
  cycle: null,
}

function serializeFilters(f: ViewFilters): string {
  const clauses: string[] = []
  if (f.status) clauses.push(`status = ${f.status}`)
  if (f.priority) clauses.push(`priority = ${f.priority}`)
  if (f.assignee === "none") clauses.push(`assignee is EMPTY`)
  else if (f.assignee === "currentUser")
    clauses.push(`assignee = currentUser()`)
  else if (f.assignee) clauses.push(`assignee = ${f.assignee}`)
  if (f.labelName) clauses.push(`label = "${f.labelName}"`)
  if (f.teamId) clauses.push(`team = ${f.teamId}`)
  if (f.cycle === "active") clauses.push(`cycle = activeCycle()`)
  return clauses.join(" AND ")
}

export function CreateViewDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional callback fired when a view is successfully created. */
  onCreated?: (view: View) => void
}) {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [labels, setLabels] = useState<IssueLabel[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loaded, setLoaded] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [filters, setFilters] = useState<ViewFilters>(EMPTY_FILTERS)
  const [fullscreen, setFullscreen] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (open && !loaded) {
      Promise.all([
        fetch("/api/data/teams").then((r) => r.json()),
        fetch("/api/data/members").then((r) => r.json()),
        fetch("/api/data/labels")
          .then((r) => r.json())
          .catch(() => []),
        fetch("/api/data/cycles")
          .then((r) => r.json())
          .catch(() => []),
        fetch("/api/data/issues").then((r) => r.json()),
      ]).then(
        ([t, m, l, c, i]: [
          Team[],
          Member[],
          IssueLabel[],
          Cycle[],
          Issue[],
        ]) => {
          setTeams(t)
          setMembers(m)
          setLabels(Array.isArray(l) ? l : [])
          setCycles(c)
          setIssues(i)
          setLoaded(true)
        }
      )
    }
  }, [open, loaded])

  const team = teams.find((t) => t.id === filters.teamId) ?? null
  const assigneeMember = useMemo(() => {
    if (
      filters.assignee &&
      filters.assignee !== "none" &&
      filters.assignee !== "currentUser"
    ) {
      return members.find((m) => m.id === filters.assignee) ?? null
    }
    return null
  }, [filters.assignee, members])

  const previewCount = useMemo(() => {
    const q = serializeFilters(filters)
    if (!q) return issues.length
    const preview: View = {
      id: "__preview",
      name: "",
      description: "",
      filterQuery: q,
      ownerId: "usr-1",
      teamId: filters.teamId ?? "team-1",
      createdAt: "",
    }
    return filterIssuesForView(preview, issues, { labels, cycles }).length
  }, [filters, issues, labels, cycles])

  const resetForm = () => {
    setName("")
    setDescription("")
    setFilters(EMPTY_FILTERS)
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    const filterQuery = serializeFilters(filters)
    if (!filterQuery) return
    setCreating(true)
    const res = await fetch("/api/data/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        filterQuery,
        teamId: filters.teamId ?? "team-1",
      }),
    })
    setCreating(false)
    if (res.ok) {
      const created = (await res.json()) as View
      onCreated?.(created)
      resetForm()
      onOpenChange(false)
    }
  }

  const statusLabel = STATUS_OPTIONS.find(
    (s) => s.value === filters.status
  )?.label
  const priorityLabel = PRIORITY_OPTIONS.find(
    (p) => p.value === filters.priority
  )?.label

  const hasAnyFilter = serializeFilters(filters).length > 0

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
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1 rounded-md border px-1.5 py-0.5">
              <HugeiconsIcon
                icon={FilterIcon}
                className="size-3 text-violet-500"
              />
              <span className="font-medium">View</span>
            </div>
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
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="View name"
            className="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-semibold focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short description..."
            className={`placeholder:text-muted-foreground/50 w-full flex-1 resize-none bg-transparent text-sm focus:outline-none ${
              fullscreen ? "min-h-[200px]" : "min-h-[40px]"
            }`}
          />
        </div>

        <div className="text-muted-foreground flex items-center gap-2 border-t border-b border-dashed px-4 py-2 text-[11px]">
          <HugeiconsIcon icon={FilterIcon} className="size-3" />
          <span>Filters</span>
          <span className="ml-auto tabular-nums">
            {hasAnyFilter ? `${previewCount} matching` : "No filters"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<PillButton active={filters.status !== null} />}
            >
              <StatusDot status={filters.status} />
              <span>{filters.status ? statusLabel : "Status"}</span>
              {filters.status && (
                <ClearPart
                  onClick={() => setFilters((f) => ({ ...f, status: null }))}
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <MenuHeader title="Filter by status..." />
              <MenuRow
                icon={<StatusDot status={null} />}
                checked={filters.status === null}
                onClick={() => setFilters((f) => ({ ...f, status: null }))}
              >
                Any status
              </MenuRow>
              {STATUS_OPTIONS.map((s) => (
                <MenuRow
                  key={s.value}
                  icon={<StatusDot status={s.value} />}
                  checked={filters.status === s.value}
                  onClick={() => setFilters((f) => ({ ...f, status: s.value }))}
                >
                  {s.label}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<PillButton active={filters.priority !== null} />}
            >
              <PriorityDot priority={filters.priority} />
              <span>{filters.priority ? priorityLabel : "Priority"}</span>
              {filters.priority && (
                <ClearPart
                  onClick={() => setFilters((f) => ({ ...f, priority: null }))}
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <MenuHeader title="Filter by priority..." />
              <MenuRow
                icon={<PriorityDot priority={null} />}
                checked={filters.priority === null}
                onClick={() => setFilters((f) => ({ ...f, priority: null }))}
              >
                Any priority
              </MenuRow>
              {PRIORITY_OPTIONS.map((p) => (
                <MenuRow
                  key={p.value}
                  icon={<PriorityDot priority={p.value} />}
                  checked={filters.priority === p.value}
                  onClick={() =>
                    setFilters((f) => ({ ...f, priority: p.value }))
                  }
                >
                  {p.label}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<PillButton active={filters.assignee !== null} />}
            >
              {filters.assignee === "none" ? (
                <div className="border-muted-foreground/60 size-4 rounded-full border border-dashed" />
              ) : filters.assignee === "currentUser" ? (
                <HugeiconsIcon
                  icon={UserIcon}
                  className="size-3.5 text-violet-500"
                />
              ) : assigneeMember ? (
                <Avatar
                  src={assigneeMember.avatar}
                  name={assigneeMember.name}
                />
              ) : (
                <HugeiconsIcon
                  icon={UserIcon}
                  className="text-muted-foreground size-3.5"
                />
              )}
              <span>
                {filters.assignee === "none"
                  ? "Unassigned"
                  : filters.assignee === "currentUser"
                    ? "Me"
                    : assigneeMember
                      ? assigneeMember.name
                      : "Assignee"}
              </span>
              {filters.assignee && (
                <ClearPart
                  onClick={() => setFilters((f) => ({ ...f, assignee: null }))}
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-80 w-64 overflow-auto"
            >
              <MenuHeader title="Filter by assignee..." />
              <MenuRow
                icon={
                  <div className="border-muted-foreground/60 size-4 rounded-full border border-dashed" />
                }
                checked={filters.assignee === "none"}
                onClick={() => setFilters((f) => ({ ...f, assignee: "none" }))}
              >
                Unassigned
              </MenuRow>
              <MenuRow
                icon={
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="size-3.5 text-violet-500"
                  />
                }
                checked={filters.assignee === "currentUser"}
                onClick={() =>
                  setFilters((f) => ({ ...f, assignee: "currentUser" }))
                }
              >
                Current user
              </MenuRow>
              <MenuSection label="Members" />
              {members.map((m) => (
                <MenuRow
                  key={m.id}
                  icon={<Avatar src={m.avatar} name={m.name} />}
                  checked={filters.assignee === m.id}
                  onClick={() => setFilters((f) => ({ ...f, assignee: m.id }))}
                >
                  {m.email}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<PillButton active={filters.labelName !== null} />}
            >
              <HugeiconsIcon
                icon={Tag01Icon}
                className="text-muted-foreground size-3.5"
              />
              <span>{filters.labelName ?? "Label"}</span>
              {filters.labelName && (
                <ClearPart
                  onClick={() => setFilters((f) => ({ ...f, labelName: null }))}
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-80 w-64 overflow-auto"
            >
              <MenuHeader title="Filter by label..." />
              {labels.map((l) => (
                <MenuRow
                  key={l.id}
                  icon={
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                  }
                  checked={filters.labelName === l.name}
                  onClick={() =>
                    setFilters((f) => ({ ...f, labelName: l.name }))
                  }
                >
                  {l.name}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<PillButton active={filters.teamId !== null} />}
            >
              <HugeiconsIcon
                icon={HashtagIcon}
                className="size-3.5 text-rose-500"
              />
              <span>{team ? team.key : "Team"}</span>
              {filters.teamId && (
                <ClearPart
                  onClick={() => setFilters((f) => ({ ...f, teamId: null }))}
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <MenuHeader title="Filter by team..." />
              {teams.map((t) => (
                <MenuRow
                  key={t.id}
                  icon={
                    <HugeiconsIcon
                      icon={HashtagIcon}
                      className="size-3.5 text-rose-500"
                    />
                  }
                  checked={filters.teamId === t.id}
                  right={
                    <span className="text-muted-foreground text-[10px]">
                      {t.key}
                    </span>
                  }
                  onClick={() => setFilters((f) => ({ ...f, teamId: t.id }))}
                >
                  {t.name}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <PillButton
            active={filters.cycle === "active"}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                cycle: f.cycle === "active" ? null : "active",
              }))
            }
          >
            <HugeiconsIcon
              icon={PlayCircleIcon}
              className="size-3.5 text-amber-500"
            />
            <span>Active cycle</span>
            {filters.cycle === "active" && (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-3 text-emerald-500"
              />
            )}
          </PillButton>
        </div>

        <footer className="flex items-center justify-between border-t px-3 py-2">
          <span className="text-muted-foreground text-xs">
            {hasAnyFilter ? (
              <>
                <span className="text-foreground tabular-nums">
                  {previewCount}
                </span>{" "}
                issue
                {previewCount === 1 ? "" : "s"} match this view
              </>
            ) : (
              "Add at least one filter"
            )}
          </span>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !hasAnyFilter || creating}
            className="h-7 rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700 disabled:bg-violet-600/50"
          >
            {creating ? "Creating..." : "Create view"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}

function PillButton({
  children,
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`hover:bg-muted/60 flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs ${
        active
          ? "text-foreground border-violet-500/40 bg-violet-500/10"
          : "text-muted-foreground border-dashed"
      } ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  )
}

function ClearPart({ onClick }: { onClick: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onClick()
      }}
      className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-3.5 items-center justify-center rounded-sm"
      aria-label="Clear filter"
    >
      <HugeiconsIcon icon={CancelCircleIcon} className="size-3" />
    </span>
  )
}

function MenuHeader({ title }: { title: string }) {
  return (
    <div className="text-muted-foreground px-2 py-1.5 text-xs">{title}</div>
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
      {right}
      {checked && <span className="text-[10px]">✓</span>}
    </button>
  )
}

function Avatar({ src, name }: { src: string; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} className="size-4 rounded-full" />
}

function StatusDot({ status }: { status: Status | null }) {
  if (!status) {
    return (
      <span className="border-muted-foreground/60 size-2.5 rounded-full border border-dashed" />
    )
  }
  const color: Record<Status, string> = {
    in_progress: "bg-amber-500",
    todo: "bg-muted-foreground/60",
    backlog: "bg-muted-foreground/30",
    done: "bg-emerald-500",
    cancelled: "bg-zinc-500",
  }
  return <span className={`size-2.5 rounded-full ${color[status]}`} />
}

function PriorityDot({ priority }: { priority: Priority | null }) {
  if (!priority) {
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
    return <span className="size-2.5 rounded-sm bg-rose-500" />
  }
  const color: Record<Exclude<Priority, "urgent" | "none">, string> = {
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-sky-500",
  }
  if (priority === "none") {
    return (
      <span className="border-muted-foreground/60 size-2.5 rounded-full border" />
    )
  }
  return <span className={`size-2.5 rounded-full ${color[priority]}`} />
}
