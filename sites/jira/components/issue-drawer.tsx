"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import type { Issue, User, Project, Sprint, Epic } from "@/app/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { statusDisplayLabel } from "@/lib/badge-styles"

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

const statusStyle: Record<string, string> = {
  to_do: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

interface IssueDrawerProps {
  issueKey: string | null
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function IssueDrawer({ issueKey, open, onClose, onUpdate }: IssueDrawerProps) {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  // Editable fields
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [assigneeId, setAssigneeId] = useState("__none__")
  const [sprintId, setSprintId] = useState("__none__")
  const [epicId, setEpicId] = useState("__none__")

  // Comments
  const [comments, setComments] = useState<Array<{ id: string; body: string; authorId: string; createdAt: string; updatedAt: string; author: User | null }>>([])
  const [commentBody, setCommentBody] = useState("")
  const [posting, setPosting] = useState(false)

  const loadedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchData = useCallback(() => {
    if (!issueKey) return
    setLoading(true)
    loadedRef.current = false
    Promise.all([
      fetch(`/api/data/issues/${issueKey}`).then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
      fetch(`/api/data/issues/${issueKey}/comments`).then((r) => r.json()),
    ]).then(([i, u, p, s, e, c]) => {
      setIssue(i)
      setUsers(u)
      setProjects(p)
      setSprints(s)
      setEpics(e)
      if (Array.isArray(c)) setComments(c)
      setSummary(i.summary ?? "")
      setDescription(i.description ?? "")
      setStatus(i.status ?? "to_do")
      setPriority(i.priority ?? "medium")
      setAssigneeId(i.assigneeId ?? "__none__")
      setSprintId(i.sprintId ?? "__none__")
      setEpicId(i.epicId ?? "__none__")
      setLoading(false)
      setTimeout(() => { loadedRef.current = true }, 0)
    })
  }, [issueKey])

  useEffect(() => {
    if (open && issueKey) fetchData()
    if (!open) {
      setIssue(null)
      setComments([])
      loadedRef.current = false
      setSaveStatus("idle")
    }
  }, [open, issueKey, fetchData])

  // Auto-save
  const persistToApi = useCallback(() => {
    if (!loadedRef.current || !issueKey) return
    setSaveStatus("saving")
    fetch(`/api/data/issues/${issueKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary, description, status, priority,
        assigneeId: assigneeId && assigneeId !== "__none__" ? assigneeId : null,
        sprintId: sprintId && sprintId !== "__none__" ? sprintId : null,
        epicId: epicId && epicId !== "__none__" ? epicId : null,
      }),
    }).then(() => {
      setSaveStatus("saved")
      onUpdate?.()
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000)
    })
  }, [issueKey, summary, description, status, priority, assigneeId, sprintId, epicId, onUpdate])

  useEffect(() => {
    if (!loadedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(persistToApi, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [persistToApi])

  const handlePostComment = async () => {
    if (!commentBody.trim() || !issueKey) return
    const text = commentBody.trim()
    setPosting(true)

    // Optimistic insert — show immediately
    const optimistic = {
      id: `temp-${Date.now()}`,
      body: text,
      authorId: "usr-1",
      issueId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: users.find((u) => u.id === "usr-1") ?? null,
    }
    setComments((prev) => [...prev, optimistic])
    setCommentBody("")

    try {
      await fetch(`/api/data/issues/${issueKey}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, authorId: "usr-1" }),
      })
      // Refresh to get real server data
      const res = await fetch(`/api/data/issues/${issueKey}/comments`)
      const data = await res.json()
      if (Array.isArray(data)) setComments(data)
    } catch { /* ignore */ }
    setPosting(false)
  }

  const project = projects.find((p) => p.id === issue?.projectId)

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {loading || !issue ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {loading ? "Loading..." : ""}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-center gap-2 pr-8">
                <Badge variant="secondary" className={statusStyle[status]}>
                  {statusDisplayLabel[status] ?? status}
                </Badge>
                <SheetTitle className="font-mono text-base">{issue.key}</SheetTitle>
                {project && <span className="text-xs text-muted-foreground">in {project.name}</span>}
              </div>
              <SheetDescription className="sr-only">Issue detail panel</SheetDescription>
              <Link
                href={`/issue/${issueKey}`}
                className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
              >
                Open full page
                <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12L12 4M12 4H6M12 4v6" /></svg>
              </Link>
            </SheetHeader>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Summary */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Summary</Label>
                <Input value={summary} onChange={(e) => setSummary(e.target.value)} className="text-sm font-medium" />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="text-sm" />
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                  <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => <SelectItem key={o.value} value={o.value} label={o.label}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
                  <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((o) => <SelectItem key={o.value} value={o.value} label={o.label}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Assignee</Label>
                  <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                    <SelectTrigger>
                      {(() => { const u = users.find((u) => u.id === assigneeId); return u ? <span className="truncate">{u.displayName ?? u.name}</span> : <span className="text-muted-foreground">Unassigned</span> })()}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" label="Unassigned">Unassigned</SelectItem>
                      {users.map((u) => <SelectItem key={u.id} value={u.id} label={u.displayName ?? u.name}>{u.displayName ?? u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Sprint</Label>
                  <Select value={sprintId} onValueChange={(v) => v && setSprintId(v)}>
                    <SelectTrigger>
                      {(() => { const s = sprints.find((s) => s.id === sprintId); return s ? <span className="truncate">{s.name}</span> : <span className="text-muted-foreground">No sprint</span> })()}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" label="No sprint">No sprint</SelectItem>
                      {sprints.map((s) => <SelectItem key={s.id} value={s.id} label={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground mb-1 block">Epic</Label>
                  <Select value={epicId} onValueChange={(v) => v && setEpicId(v)}>
                    <SelectTrigger>
                      {(() => { const ep = epics.find((e) => e.id === epicId); return ep ? <span className="truncate">{ep.name}</span> : <span className="text-muted-foreground">No epic</span> })()}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" label="No epic">No epic</SelectItem>
                      {epics.map((e) => <SelectItem key={e.id} value={e.id} label={e.name}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto-save indicator */}
              <div className="flex items-center justify-end h-5">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="size-3 animate-spin rounded-full border-[1.5px] border-muted-foreground/30 border-t-muted-foreground" />
                    Saving...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Saved
                  </span>
                )}
              </div>

              {/* Comments */}
              <div className="border-t pt-5">
                <h4 className="text-sm font-semibold mb-3">Comments ({comments.length})</h4>
                <div className="space-y-3 mb-4">
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">No comments yet.</p>
                  )}
                  {comments.map((c) => {
                    const name = c.author?.displayName ?? c.author?.name ?? "Unknown"
                    return (
                      <div key={c.id} className="flex gap-2">
                        <Avatar className="size-6 shrink-0 mt-0.5">
                          <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium">{name}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-foreground mt-0.5 whitespace-pre-wrap">{c.body}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* New comment */}
                <div className="flex gap-2">
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Add a comment..."
                    className="text-xs min-h-[50px]"
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePostComment() }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handlePostComment} disabled={!commentBody.trim() || posting}>
                    {posting ? "Posting..." : "Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
