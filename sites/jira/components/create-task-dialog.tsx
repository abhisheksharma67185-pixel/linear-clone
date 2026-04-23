"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  MinusSignIcon,
  ArrowExpand01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import type { Project, User, Sprint, Epic } from "@/app/lib/mock-data"
import { useIssueDrawer } from "@/components/issue-drawer-provider"
import { format } from "date-fns"

// ─── Type Icons ──────────────────────────────────────────────────────────────

function IssueTypeIcon({
  type,
  size = "sm",
}: {
  type: string
  size?: "sm" | "md"
}) {
  const s = size === "sm" ? "size-4" : "size-5"
  const is = size === "sm" ? "size-2.5" : "size-3"
  const colors: Record<string, string> = {
    story: "bg-green-500",
    task: "bg-blue-500",
    bug: "bg-red-500",
    subtask: "bg-cyan-500",
  }
  return (
    <span
      className={`flex ${s} items-center justify-center rounded-sm ${colors[type] ?? "bg-blue-500"} shrink-0`}
    >
      <svg
        className={`${is} text-white`}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        {type === "bug" ? (
          <circle cx="8" cy="8" r="4" />
        ) : type === "story" ? (
          <path
            d="M4 8l3 3 5-5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        ) : (
          <path d="M3 3h10v10H3z" />
        )}
      </svg>
    </span>
  )
}

// ─── Priority Icons ──────────────────────────────────────────────────────────

function PriorityIcon({ priority }: { priority: string }) {
  const icons: Record<string, React.ReactNode> = {
    highest: (
      <svg
        className="size-4 text-red-600"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 14l5-5 5 5H7z" />
        <path d="M7 10l5-5 5 5H7z" />
      </svg>
    ),
    high: (
      <svg
        className="size-4 text-orange-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 14l5-5 5 5H7z" />
      </svg>
    ),
    medium: (
      <svg
        className="size-4 text-orange-400"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <rect x="5" y="11" width="14" height="2" rx="1" />
      </svg>
    ),
    low: (
      <svg
        className="size-4 text-blue-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 10l5 5 5-5H7z" />
      </svg>
    ),
    lowest: (
      <svg
        className="size-4 text-blue-400"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 10l5 5 5-5H7z" />
        <path d="M7 14l5 5 5-5H7z" />
      </svg>
    ),
  }
  return <>{icons[priority] ?? icons.medium}</>
}

// ─── Description Toolbar ─────────────────────────────────────────────────────

function DescriptionToolbar() {
  return (
    <div className="flex items-center gap-0.5 border-b border-border px-1 py-1">
      <button
        type="button"
        className="rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Normal text
      </button>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded p-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        B
      </button>
      <button
        type="button"
        className="rounded p-1 text-xs text-muted-foreground italic transition-colors hover:bg-accent hover:text-foreground"
      >
        I
      </button>
      <button
        type="button"
        className="rounded p-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7V4h16v3" />
          <path d="M9 20h6" />
          <path d="M12 4v16" />
        </svg>
      </button>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 6h11M10 12h11M10 18h11M3 6l3 0M3 12l3 0M3 18l3 0" />
        </svg>
      </button>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
    </div>
  )
}

// ─── Date Picker Field ───────────────────────────────────────────────────────

function DatePickerField({
  label,
  value,
  onChange,
  helperText,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  helperText?: string
}) {
  const [calOpen, setCalOpen] = useState(false)
  const selected = value ? new Date(value) : undefined
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      <Popover open={calOpen} onOpenChange={setCalOpen}>
        <PopoverTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-input/20 px-2.5 py-1.5 text-xs transition-colors hover:bg-accent/50 dark:bg-input/30">
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? format(new Date(value), "MMM d, yyyy") : "Select date"}
          </span>
          <HugeiconsIcon
            icon={Calendar03Icon}
            className="size-3.5 text-muted-foreground"
            strokeWidth={2}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onChange(d ? d.toISOString().split("T")[0] : "")
              setCalOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {helperText && (
        <p className="text-[11px] leading-tight text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}

// ─── Main Create Task Dialog ─────────────────────────────────────────────────

export function CreateTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  useIssueDrawer() // keep context connected

  // Data
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const saving = false
  const [error, setError] = useState("")
  const [minimized, setMinimized] = useState(false)

  // Form state
  const [projectId, setProjectId] = useState<string | undefined>(undefined)
  const [issueType, setIssueType] = useState("task")
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [summary, setSummary] = useState("")
  const [summaryTouched, setSummaryTouched] = useState(false)
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("__none__")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [labelsStr, setLabelsStr] = useState("")
  const [teamName, setTeamName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [sprintId, setSprintId] = useState("")
  const [storyPoints, setStoryPoints] = useState("")
  const [reporterId, setReporterId] = useState("usr-1")
  const [epicId, setEpicId] = useState("")
  const [linkedType, setLinkedType] = useState("blocks")
  const [linkedUrl, setLinkedUrl] = useState("")
  const [restrictedTo, setRestrictedTo] = useState("")
  const [flagged, setFlagged] = useState(false)
  const [createAnother, setCreateAnother] = useState(false)

  // External sync on open: hydrate dropdown options + reset minimized.
  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinimized(false)
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([p, u, s, e]) => {
      setProjects(p)
      setUsers(u)
      setSprints(s)
      setEpics(e)
      if (p.length > 0) {
        const firstProject = p[0] as Project
        setProjectId((prev) => prev ?? firstProject.id)
        setStatus((prev) => prev ?? firstProject.workflow?.[0] ?? undefined)
      }
    })
  }, [open])

  // When project changes, reset status to the first workflow state of the new
  // project (external sync: projectId → status).
  useEffect(() => {
    if (!projectId) return
    const project = projects.find((p) => p.id === projectId)
    if (project?.workflow?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(project.workflow[0])
    }
  }, [projectId, projects])

  const resetForm = () => {
    setSummary("")
    setSummaryTouched(false)
    setDescription("")
    setIssueType("task")
    const project = projects.find((p) => p.id === projectId)
    setStatus(project?.workflow?.[0])
    setPriority("medium")
    setAssigneeId("__none__")
    setReporterId("usr-1")
    setSprintId("")
    setEpicId("")
    setStoryPoints("")
    setLabelsStr("")
    setDueDate("")
    setStartDate("")
    setTeamName("")
    setLinkedType("blocks")
    setLinkedUrl("")
    setRestrictedTo("")
    setFlagged(false)
    setError("")
  }

  const handleCreate = () => {
    setSummaryTouched(true)
    if (!summary.trim()) return
    setError("")

    const payload = {
      summary: summary.trim(),
      description,
      type: issueType,
      status,
      priority,
      projectId: projectId || undefined,
      assigneeId: assigneeId && assigneeId !== "__none__" ? assigneeId : null,
      reporterId: reporterId || "usr-1",
      sprintId: sprintId || null,
      epicId: epicId || null,
      storyPoints: storyPoints ? Number(storyPoints) : null,
      labels: labelsStr
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    }

    // Fire and forget — close dialog immediately for instant feedback
    fetch("/api/data/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {})

    if (createAnother) {
      resetForm()
    } else {
      resetForm()
      onOpenChange(false)
    }
  }

  const selectedProject = projects.find((p) => p.id === projectId)
  const selectedReporter = users.find((u) => u.id === reporterId)

  const workflowStates = selectedProject?.workflow ?? []

  if (!open) return null

  // ── Minimized panel at bottom-right (like real Jira) ──────────────────────
  if (minimized) {
    return (
      <div className="fixed right-4 bottom-0 z-50 w-[380px] rounded-t-lg border border-b-0 bg-popover shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-semibold text-foreground">
            New task
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Expand to full dialog"
            >
              <HugeiconsIcon
                icon={ArrowExpand01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                setMinimized(false)
              }}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Close"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Compact form */}
        <div className="max-h-[50vh] space-y-3 overflow-y-auto px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </p>

          {/* Space */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">
              Space <span className="text-red-500">*</span>
            </Label>
            <Select
              value={projectId || undefined}
              onValueChange={(v) => v && setProjectId(v)}
            >
              <SelectTrigger className="h-7 w-full text-xs">
                {selectedProject ? (
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                      <svg
                        className="size-2.5 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </span>
                    {selectedProject.name} ({selectedProject.key})
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select space</span>
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Recent Spaces</SelectLabel>
                  {[...projects]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 3)
                    .map((p) => (
                      <SelectItem
                        key={`recent-${p.id}`}
                        value={p.id}
                        label={`${p.name} (${p.key})`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex size-4 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                            <svg
                              className="size-2.5 text-blue-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                          </span>
                          {p.name} ({p.key})
                        </span>
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>All Spaces</SelectLabel>
                  {projects.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      label={`${p.name} (${p.key})`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex size-4 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                          <svg
                            className="size-2.5 text-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                          </svg>
                        </span>
                        {p.name} ({p.key})
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Work type + Status row */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-[11px] font-semibold">
                Work type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={issueType}
                onValueChange={(v) => v && setIssueType(v)}
              >
                <SelectTrigger className="h-7 w-full text-xs">
                  <span className="flex items-center gap-1.5">
                    <IssueTypeIcon type={issueType} />
                    {(
                      {
                        story: "Story",
                        task: "Task",
                        bug: "Bug",
                        subtask: "Sub-task",
                      } as Record<string, string>
                    )[issueType] ?? issueType}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "story", label: "Story" },
                    { value: "task", label: "Task" },
                    { value: "bug", label: "Bug" },
                    { value: "subtask", label: "Sub-task" },
                  ].map((t) => (
                    <SelectItem key={t.value} value={t.value} label={t.label}>
                      <span className="flex items-center gap-2">
                        <IssueTypeIcon type={t.value} />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="h-7 w-fit min-w-[80px] text-xs">
                  <span>{status || "Status"}</span>
                </SelectTrigger>
                <SelectContent>
                  {workflowStates.map((ws) => (
                    <SelectItem key={ws} value={ws} label={ws}>
                      {ws}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">
              Summary <span className="text-red-500">*</span>
            </Label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={() => setSummaryTouched(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && summary.trim()) {
                  e.preventDefault()
                  handleCreate()
                }
              }}
              autoFocus
              className="h-7 text-xs"
              aria-invalid={
                summaryTouched && !summary.trim() ? true : undefined
              }
            />
            {summaryTouched && !summary.trim() && (
              <p className="flex items-center gap-1 text-[10px] text-red-500">
                <svg
                  className="size-2.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zM8 12a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Summary is required
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Description</Label>
            <div className="overflow-hidden rounded-md border border-input focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
              <DescriptionToolbar />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type /a to Ask Rovo or @ to mention and notify someone."
                rows={2}
                className="w-full resize-none bg-input/20 px-2.5 py-1.5 text-[11px] outline-none placeholder:text-muted-foreground dark:bg-input/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <label className="flex cursor-pointer items-center gap-1.5">
            <Checkbox
              checked={createAnother}
              onCheckedChange={(checked) => setCreateAnother(checked === true)}
              className="size-3.5"
            />
            <span className="text-[11px]">Create another</span>
          </label>
          <Button
            type="button"
            size="sm"
            className="h-7 bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCreate()
            }}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh]"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Dialog */}
      <div
        className="relative z-10 flex w-full max-w-[560px] flex-col rounded-lg border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="text-base font-semibold text-foreground">
            Create Task
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Minimize"
              onClick={() => setMinimized(true)}
            >
              <HugeiconsIcon
                icon={MinusSignIcon}
                className="size-4"
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Full screen"
            >
              <HugeiconsIcon
                icon={ArrowExpand01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Close"
              onClick={() => onOpenChange(false)}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* ── Subtitle ───────────────────────────────────────────────── */}
        <div className="px-5 pt-3">
          <p className="text-xs text-muted-foreground">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </p>
        </div>

        {/* ── Scrollable Form ────────────────────────────────────────── */}
        <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-4">
          {/* Space / Project */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Space <span className="text-red-500">*</span>
            </Label>
            <Select
              value={projectId || undefined}
              onValueChange={(v) => v && setProjectId(v)}
            >
              <SelectTrigger className="h-8 w-full">
                {(() => {
                  return selectedProject ? (
                    <span className="flex items-center gap-2 truncate">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                        <svg
                          className="size-3 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </span>
                      {selectedProject.name} ({selectedProject.key})
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select space</span>
                  )
                })()}
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Recent Spaces</SelectLabel>
                  {[...projects]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 3)
                    .map((p) => (
                      <SelectItem
                        key={`recent-${p.id}`}
                        value={p.id}
                        label={`${p.name} (${p.key})`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                            <svg
                              className="size-3 text-blue-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                          </span>
                          {p.name}{" "}
                          <span className="text-muted-foreground">
                            ({p.key})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>All Spaces</SelectLabel>
                  {projects.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      label={`${p.name} (${p.key})`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                          <svg
                            className="size-3 text-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                          </svg>
                        </span>
                        {p.name}{" "}
                        <span className="text-muted-foreground">({p.key})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Work Type */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Work type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={issueType}
              onValueChange={(v) => v && setIssueType(v)}
            >
              <SelectTrigger className="h-8 w-full">
                <span className="flex items-center gap-2">
                  <IssueTypeIcon type={issueType} />
                  {(
                    {
                      story: "Story",
                      task: "Task",
                      bug: "Bug",
                      subtask: "Sub-task",
                    } as Record<string, string>
                  )[issueType] ?? issueType}
                </span>
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "story", label: "Story" },
                  { value: "task", label: "Task" },
                  { value: "bug", label: "Bug" },
                  { value: "subtask", label: "Sub-task" },
                ].map((t) => (
                  <SelectItem key={t.value} value={t.value} label={t.label}>
                    <span className="flex items-center gap-2">
                      <IssueTypeIcon type={t.value} />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <a
              href="#"
              className="text-[11px] text-blue-600 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Learn about work types
            </a>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Status</Label>
            <div>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="h-7 w-fit">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-gray-400" />
                    {status || "Select status"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {workflowStates.map((ws) => (
                    <SelectItem key={ws} value={ws} label={ws}>
                      <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-gray-400" />
                        {ws}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This is the initial status upon creation.
            </p>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Summary */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Summary <span className="text-red-500">*</span>
            </Label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={() => setSummaryTouched(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && summary.trim()) {
                  e.preventDefault()
                  handleCreate()
                }
              }}
              placeholder=""
              autoFocus
              className="h-8"
              aria-invalid={
                summaryTouched && !summary.trim() ? true : undefined
              }
            />
            {summaryTouched && !summary.trim() && (
              <p className="flex items-center gap-1 text-[11px] text-red-500">
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zM8 12a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Summary is required
              </p>
            )}
          </div>

          {/* Description with toolbar */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Description</Label>
            <div className="overflow-hidden rounded-md border border-input focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
              <DescriptionToolbar />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type /a to Ask Rovo or @ to mention and notify someone."
                rows={4}
                className="w-full resize-none bg-input/20 px-3 py-2 text-xs outline-none placeholder:text-muted-foreground dark:bg-input/30"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Assignee */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Assignee</Label>
              <button
                type="button"
                className="text-[11px] text-blue-600 hover:underline"
                onClick={() => setAssigneeId("usr-1")}
              >
                Assign to me
              </button>
            </div>
            <Select
              value={assigneeId}
              onValueChange={(v) => v && setAssigneeId(v)}
            >
              <SelectTrigger className="h-8 w-full">
                {(() => {
                  const u = users.find((u) => u.id === assigneeId)
                  return u ? (
                    <span className="truncate">{u.displayName ?? u.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Automatic</span>
                  )
                })()}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" label="Automatic">
                  Automatic
                </SelectItem>
                {users.map((u) => (
                  <SelectItem
                    key={u.id}
                    value={u.id}
                    label={u.displayName ?? u.name}
                  >
                    {u.displayName ?? u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Priority</Label>
            <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
              <SelectTrigger className="h-8 w-full">
                <span className="flex items-center gap-2">
                  <PriorityIcon priority={priority} />
                  {
                    (
                      {
                        highest: "Highest",
                        high: "High",
                        medium: "Medium",
                        low: "Low",
                        lowest: "Lowest",
                      } as Record<string, string>
                    )[priority]
                  }
                </span>
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "highest", label: "Highest" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                  { value: "lowest", label: "Lowest" },
                ].map((p) => (
                  <SelectItem key={p.value} value={p.value} label={p.label}>
                    <span className="flex items-center gap-2">
                      <PriorityIcon priority={p.value} />
                      {p.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <a
              href="#"
              className="text-[11px] text-blue-600 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Learn about priority levels
            </a>
          </div>

          {/* Parent (Epic) */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Parent</Label>
            <Select
              value={epicId || "__none__"}
              onValueChange={(v) =>
                setEpicId(v === "__none__" || v === null ? "" : v)
              }
            >
              <SelectTrigger className="h-8 w-full">
                {(() => {
                  const ep = epics.find((e) => e.id === epicId)
                  return ep ? (
                    <span className="truncate">{ep.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Select parent</span>
                  )
                })()}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" label="No parent">
                  No parent
                </SelectItem>
                {epics.map((e) => (
                  <SelectItem key={e.id} value={e.id} label={e.name}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Your work type hierarchy determines the work items you can set as
              parent.
            </p>
          </div>

          {/* Due date */}
          <DatePickerField
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
          />

          {/* Labels */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Labels</Label>
            <Input
              value={labelsStr}
              onChange={(e) => setLabelsStr(e.target.value)}
              placeholder="Select label"
              className="h-8"
            />
          </div>

          {/* Team */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Team</Label>
            <div className="flex h-8 w-full items-center gap-2 rounded-md border border-input bg-input/20 px-2.5 text-xs dark:bg-input/30">
              <svg
                className="size-4 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Choose a team"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Start date */}
          <DatePickerField
            label="Start date"
            value={startDate}
            onChange={setStartDate}
            helperText="Allows the planned start date for a piece of work to be set."
          />

          {/* Sprint */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Sprint</Label>
            <Select
              value={sprintId || "__none__"}
              onValueChange={(v) =>
                setSprintId(v === "__none__" || v === null ? "" : v)
              }
            >
              <SelectTrigger className="h-8 w-full">
                {(() => {
                  const sp = sprints.find((s) => s.id === sprintId)
                  return sp ? (
                    <span className="truncate">{sp.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Select sprint</span>
                  )
                })()}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" label="No sprint">
                  No sprint
                </SelectItem>
                {sprints
                  .filter((s) => s.state !== "closed")
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id} label={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Join Software sprint field.
            </p>
          </div>

          {/* Story point estimate */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Story point estimate
            </Label>
            <Input
              type="number"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              className="h-8 w-40"
              placeholder=""
            />
            <p className="text-[11px] text-muted-foreground">
              Measurement of complexity and/or size of a requirement.
            </p>
          </div>

          {/* Reporter */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Reporter <span className="text-red-500">*</span>
            </Label>
            <Select
              value={reporterId || undefined}
              onValueChange={(v) => v && setReporterId(v)}
            >
              <SelectTrigger className="h-8 w-full">
                {selectedReporter ? (
                  <span className="truncate">
                    {selectedReporter.displayName ?? selectedReporter.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select reporter</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem
                    key={u.id}
                    value={u.id}
                    label={u.displayName ?? u.name}
                  >
                    {u.displayName ?? u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attachment */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Attachment</Label>
            <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-input py-4 text-xs text-muted-foreground">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Drop files to attach or</span>
              <button
                type="button"
                className="font-medium text-blue-600 hover:underline"
              >
                Browse
              </button>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Linked Work Items */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Linked Work Items</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={linkedType}
                onValueChange={(v) => v && setLinkedType(v)}
              >
                <SelectTrigger className="h-8 w-full">
                  <span>{linkedType}</span>
                </SelectTrigger>
                <SelectContent>
                  {[
                    "blocks",
                    "is blocked by",
                    "clones",
                    "is cloned by",
                    "duplicates",
                    "is duplicated by",
                    "relates to",
                  ].map((lt) => (
                    <SelectItem key={lt} value={lt} label={lt}>
                      {lt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={linkedUrl}
                onChange={(e) => setLinkedUrl(e.target.value)}
                placeholder="Type, search or paste URL"
                className="h-8"
              />
            </div>
          </div>

          {/* Restricted to */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Restricted to</Label>
            <Select
              value={restrictedTo || "__none__"}
              onValueChange={(v) =>
                setRestrictedTo(v === "__none__" || v === null ? "" : v)
              }
            >
              <SelectTrigger className="h-8 w-full">
                <span
                  className={
                    restrictedTo ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {restrictedTo || "Select Roles"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" label="No restriction">
                  No restriction
                </SelectItem>
                <SelectItem value="administrators" label="Administrators">
                  Administrators
                </SelectItem>
                <SelectItem value="developers" label="Developers">
                  Developers
                </SelectItem>
                <SelectItem value="viewers" label="Viewers">
                  Viewers
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Flagged */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Flagged</Label>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={flagged}
                onCheckedChange={(checked) => setFlagged(checked === true)}
              />
              <span className="text-xs font-medium">Impediment</span>
            </label>
            <p className="text-[11px] text-muted-foreground">
              Allows to flag issues with impediments.
            </p>
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {error && (
          <div className="px-5">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={createAnother}
              onCheckedChange={(checked) => setCreateAnother(checked === true)}
            />
            <span className="text-xs">Create another</span>
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                setError("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCreate()
              }}
              disabled={saving}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
