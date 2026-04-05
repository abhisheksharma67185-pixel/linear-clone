"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Project, User } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProjectSettingsPage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [lead, setLead] = useState("")
  const [type, setType] = useState<"scrum" | "kanban">("scrum")

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectKey}`).then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([p, u]) => {
      setProject(p)
      setUsers(u)
      setName(p.name ?? "")
      setDescription(p.description ?? "")
      setLead(p.lead ?? "")
      setType(p.type ?? "scrum")
      setLoading(false)
    })
  }, [projectKey])

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    setSaved(false)
    await fetch(`/api/data/projects/${projectKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, lead, type }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!project || project.error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Project not found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">
          Project Settings - {project.key}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure project details and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead">Project Lead</Label>
            <Select value={lead} onValueChange={(v) => v && setLead(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead" />
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

          <div className="space-y-2">
            <Label htmlFor="type">Project Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as "scrum" | "kanban")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scrum">Scrum</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved successfully
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
