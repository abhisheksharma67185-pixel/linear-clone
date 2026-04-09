"use client"

import { useEffect, useState } from "react"
import type { Member, Project, Cycle, Team } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

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
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loaded, setLoaded] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [teamId, setTeamId] = useState("")
  const [status, setStatus] = useState("backlog")
  const [priority, setPriority] = useState("none")
  const [assigneeId, setAssigneeId] = useState("__none__")
  const [cycleId, setCycleId] = useState("__none__")
  const [projectId, setProjectId] = useState("__none__")
  const [labelIds, setLabelIds] = useState("")
  const [estimate, setEstimate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (open && !loaded) {
      Promise.all([
        fetch("/api/data/teams").then((r) => r.json()),
        fetch("/api/data/members").then((r) => r.json()),
        fetch("/api/data/projects").then((r) => r.json()),
        fetch("/api/data/cycles").then((r) => r.json()),
      ]).then(([t, m, p, c]) => {
        setTeams(t)
        setMembers(m)
        setProjects(p)
        setCycles(c)
        if (t.length > 0) setTeamId(t[0].id)
        setLoaded(true)
      })
    }
  }, [open, loaded])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("backlog")
    setPriority("none")
    setAssigneeId("__none__")
    setCycleId("__none__")
    setProjectId("__none__")
    setLabelIds("")
    setEstimate("")
    setDueDate("")
  }

  const handleCreate = async () => {
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
        assigneeId: assigneeId === "__none__" ? null : assigneeId,
        cycleId: cycleId === "__none__" ? null : cycleId,
        projectId: projectId === "__none__" ? null : projectId,
        labelIds: labelIds ? labelIds.split(",").map((s) => s.trim()) : [],
        estimate: estimate ? Number(estimate) : null,
        dueDate: dueDate || null,
      }),
    })
    setCreating(false)
    if (res.ok) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Issue</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ci-title">Title</Label>
            <Input id="ci-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue title" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ci-desc">Description</Label>
            <Textarea id="ci-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Team</Label>
              <Select value={teamId} onValueChange={(v) => v && setTeamId(v)}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Cycle</Label>
              <Select value={cycleId} onValueChange={(v) => v && setCycleId(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {cycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ci-estimate">Estimate</Label>
              <Input id="ci-estimate" type="number" value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="Points" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ci-due">Due Date</Label>
              <Input id="ci-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ci-labels">Labels (comma-separated IDs)</Label>
            <Input id="ci-labels" value={labelIds} onChange={(e) => setLabelIds(e.target.value)} placeholder="label-1, label-2" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleCreate} disabled={!title.trim() || !teamId || creating}>
            {creating ? "Creating..." : "Create Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
