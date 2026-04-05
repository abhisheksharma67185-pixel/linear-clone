"use client"

import { useEffect, useState } from "react"
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

const statusOptions = [
  { value: "to_do", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable fields
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [type, setType] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("__none__")
  const [reporterId, setReporterId] = useState("")
  const [sprintId, setSprintId] = useState<string>("__none__")
  const [epicId, setEpicId] = useState<string>("__none__")
  const [storyPoints, setStoryPoints] = useState("")
  const [labelsStr, setLabelsStr] = useState("")

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/issues/${issueKey}`).then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([i, u, p, s, e]) => {
      setIssue(i)
      setUsers(u)
      setProjects(p)
      setSprints(s)
      setEpics(e)
      setSummary(i.summary ?? "")
      setDescription(i.description ?? "")
      setStatus(i.status ?? "to_do")
      setPriority(i.priority ?? "medium")
      setType(i.type ?? "task")
      setAssigneeId(i.assigneeId ?? "__none__")
      setReporterId(i.reporterId ?? "")
      setSprintId(i.sprintId ?? "__none__")
      setEpicId(i.epicId ?? "__none__")
      setStoryPoints(i.storyPoints != null ? String(i.storyPoints) : "")
      setLabelsStr(Array.isArray(i.labels) ? i.labels.join(", ") : "")
      setLoading(false)
    })
  }, [issueKey])

  const handleSave = async () => {
    if (!issue) return
    setSaving(true)
    setSaved(false)
    await fetch(`/api/data/issues/${issueKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary,
        description,
        status,
        priority,
        type,
        assigneeId: assigneeId === "__none__" ? null : assigneeId,
        reporterId,
        sprintId: sprintId === "__none__" ? null : sprintId,
        epicId: epicId === "__none__" ? null : epicId,
        storyPoints: storyPoints ? Number(storyPoints) : null,
        labels: labelsStr
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    if (!issue) return
    if (!confirm("Delete this issue?")) return
    await fetch(`/api/data/issues/${issueKey}`, { method: "DELETE" })
    router.push("/dashboard")
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={statusStyle[status]}>
          {status.replace(/_/g, " ")}
        </Badge>
        <h1 className="text-xl font-semibold font-mono">{issue.key}</h1>
        {project && (
          <span className="text-sm text-muted-foreground">
            in {project.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-4">
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
                rows={6}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Details panel */}
        <div className="space-y-4">
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Reporter</Label>
                <Select value={reporterId} onValueChange={(v) => v && setReporterId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sprint</Label>
                <Select value={sprintId} onValueChange={(v) => v && setSprintId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Sprint</SelectItem>
                    {sprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Epic</SelectItem>
                    {epics.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
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

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
          {saved && (
            <p className="text-sm text-green-600 dark:text-green-400 text-center">
              Saved successfully
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
