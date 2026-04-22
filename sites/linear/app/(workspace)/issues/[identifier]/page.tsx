"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Issue, Member, Project, Cycle } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function IssueDetailPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const identifier = params.identifier

  const [issue, setIssue] = useState<Issue | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [creatorId, setCreatorId] = useState("")
  const [cycleId, setCycleId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [labelIds, setLabelIds] = useState("")
  const [estimate, setEstimate] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/issues/${identifier}`).then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
    ]).then(([iss, m, p, c]) => {
      setIssue(iss)
      setMembers(m)
      setProjects(p)
      setCycles(c)
      if (iss && !iss.error) {
        setTitle(iss.title)
        setDescription(iss.description)
        setStatus(iss.status)
        setPriority(iss.priority)
        setAssigneeId(iss.assigneeId || "__none__")
        setCreatorId(iss.creatorId)
        setCycleId(iss.cycleId || "__none__")
        setProjectId(iss.projectId || "__none__")
        setLabelIds(iss.labelIds.join(","))
        setEstimate(iss.estimate != null ? String(iss.estimate) : "")
        setDueDate(iss.dueDate || "")
      }
      setLoading(false)
    })
  }, [identifier])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/data/issues/${identifier}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId === "__none__" ? null : assigneeId,
        creatorId,
        cycleId: cycleId === "__none__" ? null : cycleId,
        projectId: projectId === "__none__" ? null : projectId,
        labelIds: labelIds ? labelIds.split(",").map((s) => s.trim()) : [],
        estimate: estimate ? Number(estimate) : null,
        dueDate: dueDate || null,
      }),
    })
    setSaving(false)
  }

  const handleDelete = async () => {
    await fetch(`/api/data/issues/${identifier}`, { method: "DELETE" })
    router.push("/my-issues")
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!issue || (issue as Record<string, unknown>).error) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-sm text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Issue not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/my-issues")}
            >
              Back to My Issues
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-mono text-xl font-semibold">{issue.identifier}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Issue detail</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - main content */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="issue-title">Title</Label>
            <Input
              id="issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="issue-description">Description</Label>
            <Textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
            />
          </div>
        </div>

        {/* Right column - details panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => v && setPriority(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Assignee</Label>
              <Select
                value={assigneeId}
                onValueChange={(v) => v && setAssigneeId(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Creator</Label>
              <Select
                value={creatorId}
                onValueChange={(v) => v && setCreatorId(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Cycle</Label>
              <Select value={cycleId} onValueChange={(v) => v && setCycleId(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {cycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Project</Label>
              <Select
                value={projectId}
                onValueChange={(v) => v && setProjectId(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="issue-labels">Labels (comma-separated IDs)</Label>
              <Input
                id="issue-labels"
                value={labelIds}
                onChange={(e) => setLabelIds(e.target.value)}
                placeholder="label-1, label-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="issue-estimate">Estimate</Label>
              <Input
                id="issue-estimate"
                type="number"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                placeholder="Story points"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="issue-due-date">Due Date</Label>
              <Input
                id="issue-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete issue?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {issue.identifier}. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
