"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type {
  Issue,
  Member,
  Label,
  Project,
  Cycle,
  Team,
} from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Link04Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  UserCircleIcon,
  LabelIcon,
  Calendar03Icon,
  CubeIcon,
  Tick02Icon,
  GitMergeIcon,
  ArrowExpandDiagonal01Icon,
  Copy01Icon,
  Archive01Icon,
  Delete01Icon,
  SlidersHorizontalIcon,
  Target02Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type IssueStatus = Issue["status"]
type IssuePriority = Issue["priority"]

const STATUS_LABEL: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
}

const PRIORITY_LABEL: Record<IssuePriority, string> = {
  none: "No priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
}

const ESTIMATE_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "No estimate" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
  { value: 8, label: "8" },
  { value: 13, label: "13" },
]

function formatDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatShortDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function LabelDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

function AutoTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  placeholder?: string
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      style={{ resize: "none", overflow: "hidden" }}
    />
  )
}

function PropRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[28px] items-center gap-2 px-4 py-0.5">
      <span className="text-muted-foreground w-24 shrink-0 text-xs">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export default function IssueDetailPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const identifier = params.identifier

  const [issue, setIssue] = useState<Issue | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<IssueStatus>("backlog")
  const [priority, setPriority] = useState<IssuePriority>("none")
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [cycleId, setCycleId] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)

  const [subscribed, setSubscribed] = useState(false)
  const [branchCopied, setBranchCopied] = useState(false)

  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<
    { id: string; author: string; body: string; at: string }[]
  >([])

  const issueRef = useRef<Issue | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/issues/${identifier}`).then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([iss, m, lb, p, c, t]) => {
      if (!iss || iss.error) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setIssue(iss)
      issueRef.current = iss
      setMembers(m)
      setLabels(lb)
      setProjects(p)
      setCycles(c)
      setTeams(t)
      setTitle(iss.title ?? "")
      setDescription(iss.description ?? "")
      setStatus(iss.status)
      setPriority(iss.priority)
      setAssigneeId(iss.assigneeId)
      setLabelIds(iss.labelIds ?? [])
      setProjectId(iss.projectId)
      setCycleId(iss.cycleId)
      setEstimate(iss.estimate)
      setDueDate(iss.dueDate)
      setLoading(false)
    })
  }, [identifier])

  const persist = useCallback(
    (patch: Partial<Issue>) => {
      if (!issueRef.current) return
      fetch(`/api/data/issues/${identifier}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...issueRef.current, ...patch }),
      })
    },
    [identifier]
  )

  const memberById = new Map(members.map((m) => [m.id, m]))
  const labelById = new Map(labels.map((l) => [l.id, l]))
  const projectById = new Map(projects.map((p) => [p.id, p]))
  const cycleById = new Map(cycles.map((c) => [c.id, c]))
  const teamById = new Map(teams.map((t) => [t.id, t]))

  const assignee = assigneeId ? (memberById.get(assigneeId) ?? null) : null
  const currentProject = projectId ? (projectById.get(projectId) ?? null) : null
  const currentCycle = cycleId ? (cycleById.get(cycleId) ?? null) : null
  const issueTeam = issue ? (teamById.get(issue.teamId) ?? null) : null
  const activeLabels = labelIds
    .map((id) => labelById.get(id))
    .filter(Boolean) as Label[]

  const applyStatus = (v: IssueStatus) => {
    setStatus(v)
    if (issueRef.current) issueRef.current = { ...issueRef.current, status: v }
    persist({ status: v })
  }
  const applyPriority = (v: IssuePriority) => {
    setPriority(v)
    if (issueRef.current)
      issueRef.current = { ...issueRef.current, priority: v }
    persist({ priority: v })
  }
  const applyAssignee = (v: string | null) => {
    setAssigneeId(v)
    if (issueRef.current)
      issueRef.current = { ...issueRef.current, assigneeId: v }
    persist({ assigneeId: v })
  }
  const toggleLabel = (id: string) => {
    const next = labelIds.includes(id)
      ? labelIds.filter((l) => l !== id)
      : [...labelIds, id]
    setLabelIds(next)
    if (issueRef.current)
      issueRef.current = { ...issueRef.current, labelIds: next }
    persist({ labelIds: next })
  }
  const applyProject = (v: string | null) => {
    setProjectId(v)
    if (issueRef.current)
      issueRef.current = { ...issueRef.current, projectId: v }
    persist({ projectId: v })
  }
  const applyCycle = (v: string | null) => {
    setCycleId(v)
    if (issueRef.current) issueRef.current = { ...issueRef.current, cycleId: v }
    persist({ cycleId: v })
  }
  const applyEstimate = (v: number | null) => {
    setEstimate(v)
    if (issueRef.current)
      issueRef.current = { ...issueRef.current, estimate: v }
    persist({ estimate: v })
  }

  const branchName = issue
    ? `${issue.identifier.toLowerCase()}-${issue.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40)}`
    : ""

  const handleCopyBranch = () => {
    navigator.clipboard.writeText(branchName).catch(() => {})
    setBranchCopied(true)
    setTimeout(() => setBranchCopied(false), 2000)
  }

  const handleArchive = async () => {
    if (!issue) return
    applyStatus("cancelled")
  }

  const handleDelete = async () => {
    await fetch(`/api/data/issues/${identifier}`, { method: "DELETE" })
    router.push("/my-issues")
  }

  const submitComment = () => {
    if (!commentText.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: "Priya Sharma",
        body: commentText.trim(),
        at: new Date().toISOString(),
      },
    ])
    setCommentText("")
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-10 shrink-0 items-center border-b px-4">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-16 py-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="w-64 shrink-0 space-y-3 border-l px-4 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Issue not found.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/my-issues")}
          >
            Back to My Issues
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-3">
        <div className="text-muted-foreground flex items-center gap-0.5 text-xs">
          <button
            type="button"
            onClick={() => router.back()}
            className="hover:bg-accent hover:text-foreground flex items-center rounded px-1.5 py-1 transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
          </button>
          <span className="text-muted-foreground/40">/</span>
          {issueTeam && (
            <>
              <Link
                href={`/teams/${issueTeam.key.toLowerCase()}/issues`}
                className="hover:bg-accent hover:text-foreground rounded px-1.5 py-1 transition-colors"
              >
                {issueTeam.name}
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <Link
                href={`/teams/${issueTeam.key.toLowerCase()}/issues`}
                className="hover:bg-accent hover:text-foreground rounded px-1.5 py-1 transition-colors"
              >
                Issues
              </Link>
              <span className="text-muted-foreground/40">/</span>
            </>
          )}
          <span className="rounded px-1.5 py-1 font-mono">{identifier}</span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label={subscribed ? "Unsubscribe" : "Subscribe"}
            onClick={() => setSubscribed((s) => !s)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
              subscribed
                ? "hover:bg-accent text-violet-500"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={Notification01Icon} className="size-3.5" />
            <span>{subscribed ? "Subscribed" : "Subscribe"}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(window.location.href)
                .catch(() => {})
            }
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
          >
            <HugeiconsIcon icon={Link04Icon} className="size-3.5" />
            Copy link
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded transition-colors"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard
                    .writeText(window.location.href)
                    .catch(() => {})
                }
              >
                <HugeiconsIcon icon={Copy01Icon} className="mr-2 size-3.5" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon
                  icon={ArrowExpandDiagonal01Icon}
                  className="mr-2 size-3.5"
                />
                Open in full page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive}>
                <HugeiconsIcon icon={Archive01Icon} className="mr-2 size-3.5" />
                Archive issue
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <HugeiconsIcon icon={Delete01Icon} className="mr-2 size-3.5" />
                Delete issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-16 py-8">
            {/* Metadata chips */}
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              {/* Status */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="border-border/60 hover:bg-accent flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                >
                  <StatusIcon status={status} className="size-3.5" />
                  {STATUS_LABEL[status]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {(
                    [
                      "backlog",
                      "todo",
                      "in_progress",
                      "done",
                      "cancelled",
                    ] as IssueStatus[]
                  ).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => applyStatus(s)}
                      className="flex items-center gap-2"
                    >
                      <StatusIcon status={s} className="size-3.5" />
                      {STATUS_LABEL[s]}
                      {status === s && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-auto size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="border-border/60 hover:bg-accent flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                >
                  <PriorityIcon priority={priority} className="size-3.5" />
                  {PRIORITY_LABEL[priority]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {(
                    [
                      "none",
                      "urgent",
                      "high",
                      "medium",
                      "low",
                    ] as IssuePriority[]
                  ).map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => applyPriority(p)}
                      className="flex items-center gap-2"
                    >
                      <PriorityIcon priority={p} className="size-3.5" />
                      {PRIORITY_LABEL[p]}
                      {priority === p && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-auto size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Assignee */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="border-border/60 hover:bg-accent flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                >
                  {assignee ? (
                    <>
                      <Avatar className="size-4">
                        <AvatarImage
                          src={assignee.avatar}
                          alt={assignee.name}
                        />
                        <AvatarFallback className="bg-violet-600 text-[8px] text-white">
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {assignee.name}
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={UserCircleIcon}
                        className="text-muted-foreground size-3.5"
                      />
                      <span className="text-muted-foreground">Assignee</span>
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => applyAssignee(null)}
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={UserCircleIcon}
                      className="text-muted-foreground size-3.5"
                    />
                    Unassigned
                    {!assigneeId && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="ml-auto size-3.5"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {members.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => applyAssignee(m.id)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-5">
                        <AvatarImage src={m.avatar} alt={m.name} />
                        <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                          {m.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{m.name}</span>
                      {assigneeId === m.id && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-auto size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Active label chips */}
              {activeLabels.map((lbl) => (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => toggleLabel(lbl.id)}
                  title="Remove label"
                  className="border-border/60 hover:bg-accent flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors"
                >
                  <LabelDot color={lbl.color} />
                  {lbl.name}
                </button>
              ))}

              {/* Due date chip */}
              {dueDate && (
                <span className="border-border/60 text-muted-foreground flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                  {formatShortDate(dueDate)}
                </span>
              )}
            </div>

            {/* Title */}
            <AutoTextarea
              value={title}
              onChange={setTitle}
              onBlur={() => {
                if (issueRef.current)
                  issueRef.current = { ...issueRef.current, title }
                persist({ title })
              }}
              placeholder="Issue title"
              className="placeholder:text-muted-foreground/40 mb-6 w-full resize-none bg-transparent text-2xl font-semibold outline-none"
            />

            {/* Description */}
            <div className="mb-8">
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const text = e.currentTarget.innerText
                  setDescription(text)
                  if (issueRef.current)
                    issueRef.current = {
                      ...issueRef.current,
                      description: text,
                    }
                  persist({ description: text })
                }}
                data-placeholder="Add a description..."
                className="empty:before:text-muted-foreground/40 min-h-[60px] text-sm leading-relaxed outline-none empty:before:content-[attr(data-placeholder)]"
              >
                {description || undefined}
              </div>
            </div>

            {/* Sub-issues */}
            <section className="mb-6 border-t pt-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sub-issues</span>
                <span className="text-muted-foreground text-xs">0</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                  Add sub-issue
                </button>
              </div>
            </section>

            {/* Relations */}
            <section className="mb-6 border-t pt-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Relations</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                  Add relation
                </button>
              </div>
              <p className="text-muted-foreground/50 mt-1.5 text-xs">
                No relations
              </p>
            </section>

            {/* Git branches */}
            <section className="mb-6 border-t pt-5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={GitMergeIcon}
                  className="text-muted-foreground size-3.5"
                />
                <span className="text-sm font-medium">Git branches</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                  Create branch
                </button>
              </div>
              {branchName && (
                <div className="bg-muted/30 mt-2 flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs">
                  <span className="text-muted-foreground flex-1 truncate">
                    {branchName}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBranch}
                    className="text-muted-foreground hover:text-foreground shrink-0 text-xs"
                  >
                    {branchCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </section>

            {/* Activity */}
            <section className="border-t pt-5">
              <h3 className="mb-4 text-sm font-medium">Activity</h3>

              {/* Comment input */}
              <div className="mb-6 flex items-start gap-3">
                <Avatar className="mt-0.5 size-6 shrink-0">
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=priya"
                    alt="You"
                  />
                  <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                    P
                  </AvatarFallback>
                </Avatar>
                <div className="bg-background flex-1 rounded-md border">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        submitComment()
                      }
                    }}
                    placeholder="Add a comment..."
                    rows={2}
                    className="placeholder:text-muted-foreground/50 w-full resize-none rounded-t-md bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  {commentText.trim() && (
                    <div className="flex items-center justify-end gap-2 border-t px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setCommentText("")}
                        className="text-muted-foreground hover:bg-accent rounded px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitComment}
                        className="bg-primary text-primary-foreground rounded px-2.5 py-1 text-xs"
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              {comments.length === 0 ? (
                <p className="text-muted-foreground/50 text-xs">
                  No comments yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <Avatar className="mt-0.5 size-6 shrink-0">
                        <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                          {c.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-xs font-medium">
                            {c.author}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatShortDate(c.at)}
                          </span>
                        </div>
                        <p className="text-sm">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right: properties panel */}
        <aside className="w-64 shrink-0 overflow-y-auto border-l">
          <div className="py-4">
            <div className="mb-1 px-4 pb-1">
              <span className="text-muted-foreground/60 text-[11px] font-medium tracking-wider uppercase">
                Properties
              </span>
            </div>

            {/* Status */}
            <PropRow label="Status">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  <StatusIcon status={status} className="size-3.5 shrink-0" />
                  <span className="truncate">{STATUS_LABEL[status]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {(
                    [
                      "backlog",
                      "todo",
                      "in_progress",
                      "done",
                      "cancelled",
                    ] as IssueStatus[]
                  ).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => applyStatus(s)}
                      className="flex items-center gap-2"
                    >
                      <StatusIcon status={s} className="size-3.5" />
                      {STATUS_LABEL[s]}
                      {status === s && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-auto size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Priority */}
            <PropRow label="Priority">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  <PriorityIcon
                    priority={priority}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">{PRIORITY_LABEL[priority]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {(
                    [
                      "none",
                      "urgent",
                      "high",
                      "medium",
                      "low",
                    ] as IssuePriority[]
                  ).map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => applyPriority(p)}
                      className="flex items-center gap-2"
                    >
                      <PriorityIcon priority={p} className="size-3.5" />
                      {PRIORITY_LABEL[p]}
                      {priority === p && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-auto size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Assignee */}
            <PropRow label="Assignee">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  {assignee ? (
                    <>
                      <Avatar className="size-4 shrink-0">
                        <AvatarImage
                          src={assignee.avatar}
                          alt={assignee.name}
                        />
                        <AvatarFallback className="bg-violet-600 text-[8px] text-white">
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{assignee.name}</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={UserCircleIcon}
                        className="text-muted-foreground/50 size-3.5 shrink-0"
                      />
                      <span className="text-muted-foreground/50">Assignee</span>
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => applyAssignee(null)}
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={UserCircleIcon}
                      className="text-muted-foreground size-3.5"
                    />
                    Unassigned
                    {!assigneeId && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="ml-auto size-3.5"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {members.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => applyAssignee(m.id)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-5">
                        <AvatarImage src={m.avatar} alt={m.name} />
                        <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                          {m.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-sm">{m.name}</span>
                      {assigneeId === m.id && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-auto size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Label */}
            <PropRow label="Label">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  {activeLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {activeLabels.map((lbl) => (
                        <span key={lbl.id} className="flex items-center gap-1">
                          <LabelDot color={lbl.color} />
                          <span className="text-xs">{lbl.name}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={LabelIcon}
                        className="text-muted-foreground/50 size-3.5 shrink-0"
                      />
                      <span className="text-muted-foreground/50">Label</span>
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {labels
                    .filter((l) => !l.archivedAt)
                    .map((lbl) => (
                      <DropdownMenuItem
                        key={lbl.id}
                        onClick={() => toggleLabel(lbl.id)}
                        className="flex items-center gap-2"
                      >
                        <LabelDot color={lbl.color} />
                        <span className="flex-1">{lbl.name}</span>
                        {labelIds.includes(lbl.id) && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="size-3.5"
                          />
                        )}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Project */}
            <PropRow label="Project">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  {currentProject ? (
                    <>
                      <HugeiconsIcon
                        icon={CubeIcon}
                        className="size-3.5 shrink-0 text-violet-500"
                      />
                      <span className="truncate">{currentProject.name}</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={CubeIcon}
                        className="text-muted-foreground/50 size-3.5 shrink-0"
                      />
                      <span className="text-muted-foreground/50">Project</span>
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => applyProject(null)}
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={CubeIcon}
                      className="text-muted-foreground size-3.5"
                    />
                    No project
                    {!projectId && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="ml-auto size-3.5"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {projects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => applyProject(p.id)}
                      className="flex items-center gap-2"
                    >
                      <HugeiconsIcon
                        icon={CubeIcon}
                        className="size-3.5 text-violet-500"
                      />
                      <span className="flex-1 truncate text-sm">{p.name}</span>
                      {projectId === p.id && (
                        <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Cycle */}
            <PropRow label="Cycle">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  {currentCycle ? (
                    <>
                      <HugeiconsIcon
                        icon={Target02Icon}
                        className="size-3.5 shrink-0 text-orange-500"
                      />
                      <span className="truncate">{currentCycle.name}</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={Target02Icon}
                        className="text-muted-foreground/50 size-3.5 shrink-0"
                      />
                      <span className="text-muted-foreground/50">Cycle</span>
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => applyCycle(null)}
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon
                      icon={Target02Icon}
                      className="text-muted-foreground size-3.5"
                    />
                    No cycle
                    {!cycleId && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="ml-auto size-3.5"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {cycles.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => applyCycle(c.id)}
                      className="flex items-center gap-2"
                    >
                      <HugeiconsIcon
                        icon={Target02Icon}
                        className="size-3.5 text-orange-500"
                      />
                      <span className="flex-1 truncate text-sm">{c.name}</span>
                      {cycleId === c.id && (
                        <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Milestone (decorative) */}
            <PropRow label="Milestone">
              <button
                type="button"
                className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
              >
                <HugeiconsIcon
                  icon={SlidersHorizontalIcon}
                  className="text-muted-foreground/50 size-3.5 shrink-0"
                />
                <span className="text-muted-foreground/50">Milestone</span>
              </button>
            </PropRow>

            {/* Estimate */}
            <PropRow label="Estimate">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                >
                  {estimate != null ? (
                    <span>{estimate}</span>
                  ) : (
                    <span className="text-muted-foreground/50">
                      No estimate
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  {ESTIMATE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={String(opt.value)}
                      onClick={() => applyEstimate(opt.value)}
                      className="flex items-center"
                    >
                      <span className="flex-1">{opt.label}</span>
                      {estimate === opt.value && (
                        <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PropRow>

            {/* Due date */}
            <PropRow label="Due date">
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className="hover:bg-accent flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm transition-colors"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    className={`size-3.5 shrink-0 ${dueDate ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                  />
                  {dueDate ? (
                    <span>{formatShortDate(dueDate)}</span>
                  ) : (
                    <span className="text-muted-foreground/50">Due date</span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-medium">
                      Due date
                    </p>
                    <input
                      type="date"
                      value={dueDate ?? ""}
                      onChange={(e) => {
                        const val = e.target.value || null
                        setDueDate(val)
                        if (issueRef.current)
                          issueRef.current = {
                            ...issueRef.current,
                            dueDate: val,
                          }
                        persist({ dueDate: val })
                      }}
                      className="rounded border bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setDueDate(null)
                          if (issueRef.current)
                            issueRef.current = {
                              ...issueRef.current,
                              dueDate: null,
                            }
                          persist({ dueDate: null })
                        }}
                        className="text-muted-foreground hover:text-foreground block text-xs"
                      >
                        Clear date
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </PropRow>

            <div className="mx-4 my-3 border-t" />

            {/* Dates */}
            <div className="space-y-1.5 px-4">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>Created</span>
                <span>{issue ? formatDate(issue.createdAt) : ""}</span>
              </div>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>Updated</span>
                <span>{issue ? formatDate(issue.updatedAt) : ""}</span>
              </div>
            </div>

            <div className="mx-4 my-3 border-t" />

            {/* Relations section */}
            <div className="mb-1 px-4 pb-1">
              <span className="text-muted-foreground/60 text-[11px] font-medium tracking-wider uppercase">
                Relations
              </span>
            </div>
            <div className="px-4">
              <button
                type="button"
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-1.5 py-1 text-xs transition-colors"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                Add relation
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
