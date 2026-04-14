"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Issue, User, Project, Sprint, Epic } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { statusDisplayLabel } from "@/lib/badge-styles"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Comment, IssueHistoryEntry, User as UserType } from "@/app/lib/mock-data"

const statusOptions = [
  { value: "to_do", label: statusDisplayLabel.to_do },
  { value: "in_progress", label: statusDisplayLabel.in_progress },
  { value: "in_review", label: statusDisplayLabel.in_review },
  { value: "done", label: statusDisplayLabel.done },
]

const priorityOptions = [
  { value: "highest", label: "Highest" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "lowest", label: "Lowest" },
]

const typeOptions = [
  { value: "story", label: "Story" },
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "subtask", label: "Sub-task" },
]

const statusStyle: Record<string, string> = {
  to_do: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  assignee: "Assignee",
  reporter: "Reporter",
  priority: "Priority",
  type: "Type",
  sprint: "Sprint",
  epic: "Epic",
  summary: "Summary",
  description: "Description",
  storyPoints: "Story Points",
}

function formatFieldValue(field: string, value: string | null): string {
  if (value === null) return "None"
  if (field === "status") return statusDisplayLabel[value] ?? value
  if (field === "priority") return value.charAt(0).toUpperCase() + value.slice(1)
  return value
}

// Types kept for compatibility
type PopulatedComment = Comment & { author: UserType | null }
type PopulatedHistory = IssueHistoryEntry & { author: UserType | null }


// ─── Issue detail page ───────────────────────────────────────────────────────

export default function IssueDetailPage() {
  const params = useParams<{ key: string }>()
  const router = useRouter()
  const issueKey = params.key

  const [issue, setIssue] = useState<Issue | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  // Comment state — inline (not a separate component) for reliability
  const [comments, setComments] = useState<Array<{ id: string; body: string; authorId: string; createdAt: string; updatedAt: string; author: { name: string; displayName?: string } | null }>>([])
  const [commentBody, setCommentBody] = useState("")
  const [commentPosting, setCommentPosting] = useState(false)
  const [history, setHistory] = useState<PopulatedHistory[]>([])
  const [activityTab, setActivityTab] = useState<"all" | "comments" | "history">("all")

  // Editable fields
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [type, setType] = useState("")
  const [assigneeId, setAssigneeId] = useState("__none__")
  const [reporterId, setReporterId] = useState("__none__")
  const [sprintId, setSprintId] = useState("__none__")
  const [epicId, setEpicId] = useState("__none__")
  const [storyPoints, setStoryPoints] = useState("")
  const [labelsStr, setLabelsStr] = useState("")

  // Track whether initial load is done (to skip auto-save on mount)
  const loadedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/issues/${issueKey}`).then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
      fetch(`/api/data/issues/${issueKey}/comments`).then((r) => r.json()).catch(() => []),
      fetch(`/api/data/issues/${issueKey}/history`).then((r) => r.json()).catch(() => []),
    ]).then(([i, u, p, s, e, c, h]) => {
      setIssue(i)
      setUsers(u)
      setProjects(p)
      setSprints(s)
      setEpics(e)
      if (Array.isArray(c)) setComments(c)
      if (Array.isArray(h)) setHistory(h)
      setSummary(i.summary ?? "")
      setDescription(i.description ?? "")
      setStatus(i.status ?? "to_do")
      setPriority(i.priority ?? "medium")
      setType(i.type ?? "task")
      setAssigneeId(i.assigneeId ?? "__none__")
      setReporterId(i.reporterId ?? "__none__")
      setSprintId(i.sprintId ?? "__none__")
      setEpicId(i.epicId ?? "__none__")
      setStoryPoints(i.storyPoints != null ? String(i.storyPoints) : "")
      setLabelsStr(Array.isArray(i.labels) ? i.labels.join(", ") : "")
      setLoading(false)
      // Mark loaded after a tick so the first useEffect for auto-save skips
      setTimeout(() => { loadedRef.current = true }, 0)
    })
  }, [issueKey])

  // Auto-save: debounce 800ms after any field change
  const persistToApi = useCallback(() => {
    if (!loadedRef.current) return
    setSaveStatus("saving")
    fetch(`/api/data/issues/${issueKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary,
        description,
        status,
        priority,
        type,
        assigneeId: assigneeId && assigneeId !== "__none__" ? assigneeId : null,
        reporterId: reporterId && reporterId !== "__none__" ? reporterId : null,
        sprintId: sprintId && sprintId !== "__none__" ? sprintId : null,
        epicId: epicId && epicId !== "__none__" ? epicId : null,
        storyPoints: storyPoints ? Number(storyPoints) : null,
        labels: labelsStr.split(",").map((l) => l.trim()).filter(Boolean),
      }),
    }).then(() => {
      setSaveStatus("saved")
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000)
    })
  }, [issueKey, summary, description, status, priority, type, assigneeId, reporterId, sprintId, epicId, storyPoints, labelsStr])

  useEffect(() => {
    if (!loadedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(persistToApi, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [persistToApi])

  // Comment submit — reads from DOM as fallback, zero external dependencies
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const postComment = () => {
    // Read from state first, fall back to DOM
    let text = commentBody.trim()
    if (!text && commentRef.current) {
      text = commentRef.current.value.trim()
    }
    if (!text) return

    // 1. Add to state immediately
    setComments((prev) => [...prev, {
      id: `cmt-local-${Date.now()}`,
      body: text,
      authorId: "usr-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { name: "Abhishek Sharma", displayName: "Abhishek Sharma" },
    }])

    // 2. Clear both state and DOM
    setCommentBody("")
    if (commentRef.current) commentRef.current.value = ""

    // 3. API call (fire-and-forget)
    fetch(`/api/data/issues/${issueKey}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, authorId: "usr-1" }),
    }).catch(() => {})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!issue || issue.error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Issue not found.
      </div>
    )
  }

  const project = projects.find((p) => p.id === issue.projectId)

  return (
    <div className="flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={statusStyle[status]}>
          {statusDisplayLabel[status] ?? status.replace(/_/g, " ")}
        </Badge>
        <h1 className="text-xl font-semibold font-mono">{issue.key}</h1>
        {project && (
          <span className="text-sm text-muted-foreground">
            in {project.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 overflow-hidden">
        {/* Left column - Main content + Activity */}
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="text-base font-medium"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Activity — comments + history */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Activity</CardTitle>
                <div className="flex gap-1">
                  {(["all", "comments", "history"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivityTab(tab)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${activityTab === tab ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "text-muted-foreground hover:bg-accent"}`}
                    >
                      {tab === "all" ? "All" : tab === "comments" ? `Comments (${comments.length})` : `History (${history.length})`}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {(() => {
                  const items: Array<{ type: "comment" | "history"; date: string; data: (typeof comments)[number] | PopulatedHistory }> = []
                  if (activityTab === "all" || activityTab === "comments") {
                    comments.forEach((c) => items.push({ type: "comment", date: c.createdAt, data: c }))
                  }
                  if (activityTab === "all" || activityTab === "history") {
                    history.forEach((h) => items.push({ type: "history", date: h.createdAt, data: h }))
                  }
                  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                  if (items.length === 0) {
                    return <p className="text-sm text-muted-foreground py-2">No activity yet.</p>
                  }

                  return items.map((item) => {
                    if (item.type === "comment") {
                      const c = item.data as (typeof comments)[number]
                      const authorName = c.author?.displayName ?? c.author?.name ?? "Unknown"
                      return (
                        <div key={`c-${c.id}`} className="flex gap-3">
                          <Avatar className="size-7 shrink-0 mt-0.5">
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{authorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{authorName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="rounded-md border bg-muted/30 px-3 py-2">
                              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    const h = item.data as PopulatedHistory
                    const authorName = h.author?.displayName ?? h.author?.name ?? "System"
                    const fieldLabel = FIELD_LABELS[h.field] ?? h.field
                    return (
                      <div key={`h-${h.id}`} className="flex gap-3">
                        <Avatar className="size-7 shrink-0 mt-0.5">
                          <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{authorName}</span>
                            <span className="text-xs text-muted-foreground">changed {fieldLabel}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(h.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                            <span className="line-through">{formatFieldValue(h.field, h.oldValue)}</span>
                            <span>→</span>
                            <span className="font-medium text-foreground">{formatFieldValue(h.field, h.newValue)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
              {/* New comment form */}
              <div className="flex gap-3">
                <Avatar className="size-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">A</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <textarea
                    ref={commentRef}
                    defaultValue=""
                    placeholder="Add a comment..."
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px] resize-none outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        postComment()
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘" : "Ctrl"}+Enter to submit
                    </span>
                    <button
                      type="button"
                      onClick={postComment}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Details panel */}
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Assignee</Label>
                <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                  <SelectTrigger>
                    {(() => {
                      const u = users.find((u) => u.id === assigneeId)
                      return u ? (
                        <span className="flex items-center gap-2">
                          <Avatar className="size-5"><AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">{(u.displayName ?? u.name).charAt(0)}</AvatarFallback></Avatar>
                          {u.displayName ?? u.name}
                        </span>
                      ) : <span className="text-muted-foreground">Unassigned</span>
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" label="Unassigned">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} label={u.displayName ?? u.name}>
                        <span className="flex items-center gap-2">
                          <Avatar className="size-5"><AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">{(u.displayName ?? u.name).charAt(0)}</AvatarFallback></Avatar>
                          {u.displayName ?? u.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Reporter</Label>
                <Select value={reporterId} onValueChange={(v) => v && setReporterId(v)}>
                  <SelectTrigger>
                    {(() => {
                      const u = users.find((u) => u.id === reporterId)
                      return u ? (
                        <span className="flex items-center gap-2">
                          <Avatar className="size-5"><AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">{(u.displayName ?? u.name).charAt(0)}</AvatarFallback></Avatar>
                          {u.displayName ?? u.name}
                        </span>
                      ) : <span className="text-muted-foreground">Select reporter</span>
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} label={u.displayName ?? u.name}>
                        <span className="flex items-center gap-2">
                          <Avatar className="size-5"><AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">{(u.displayName ?? u.name).charAt(0)}</AvatarFallback></Avatar>
                          {u.displayName ?? u.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sprint</Label>
                <Select value={sprintId} onValueChange={(v) => v && setSprintId(v)}>
                  <SelectTrigger>
                    {(() => {
                      const s = sprints.find((s) => s.id === sprintId)
                      return s ? <span>{s.name} ({s.state})</span> : <span className="text-muted-foreground">No sprint</span>
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" label="No sprint">No sprint</SelectItem>
                    {sprints.map((s) => (
                      <SelectItem key={s.id} value={s.id} label={`${s.name} (${s.state})`}>
                        {s.name} ({s.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Epic</Label>
                <Select value={epicId} onValueChange={(v) => v && setEpicId(v)}>
                  <SelectTrigger>
                    {(() => {
                      const ep = epics.find((e) => e.id === epicId)
                      return ep ? <span>{ep.name}</span> : <span className="text-muted-foreground">No epic</span>
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" label="No epic">No epic</SelectItem>
                    {epics.map((e) => (
                      <SelectItem key={e.id} value={e.id} label={e.name}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Story Points</Label>
                <Input
                  type="number"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Labels</Label>
                <Input
                  value={labelsStr}
                  onChange={(e) => setLabelsStr(e.target.value)}
                  placeholder="frontend, bug (comma separated)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Auto-save indicator */}
          <div className="flex items-center justify-end h-6">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="size-3 animate-spin rounded-full border-[1.5px] border-muted-foreground/30 border-t-muted-foreground" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Changes saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
