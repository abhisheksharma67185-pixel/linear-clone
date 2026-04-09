"use client"

import { useEffect, useState } from "react"
import type { Label as LabelType, Member } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function WorkspaceSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("SimBench Workspace")
  const [workspaceUrl, setWorkspaceUrl] = useState("simbench")
  const [saved, setSaved] = useState(false)

  const [labels, setLabels] = useState<LabelType[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [labelsLoaded, setLabelsLoaded] = useState(false)

  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState("#6b7280")
  const [newLabelTeamId, setNewLabelTeamId] = useState("team-1")
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/data/labels").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([l, m, t]) => {
      setLabels(l)
      setMembers(m)
      setTeams(t)
      setLabelsLoaded(true)
    })
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCreateLabel = async () => {
    const res = await fetch("/api/data/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newLabelName,
        color: newLabelColor,
        teamId: newLabelTeamId,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setLabels((prev) => [...prev, created])
      setNewLabelName("")
      setNewLabelColor("#6b7280")
    }
  }

  const handleUpdateLabelColor = async (labelId: string, color: string) => {
    const res = await fetch(`/api/data/labels/${labelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color }),
    })
    if (res.ok) {
      setLabels((prev) => prev.map((l) => (l.id === labelId ? { ...l, color } : l)))
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace preferences.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-url">Workspace URL</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">linear.app/</span>
                  <Input
                    id="ws-url"
                    value={workspaceUrl}
                    onChange={(e) => setWorkspaceUrl(e.target.value)}
                    className="max-w-[200px]"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Button onClick={handleSave}>Save changes</Button>
                {saved && (
                  <span className="text-sm text-green-600">Saved!</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value="UTC" readOnly className="max-w-xs bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date format</Label>
                <Input id="date-format" value="MMM D, YYYY" readOnly className="max-w-xs bg-muted" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create Label</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label htmlFor="label-name">Name</Label>
                  <Input
                    id="label-name"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="e.g. critical"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="label-color">Color</Label>
                  <Input
                    id="label-color"
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="w-16 h-9 p-1 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Team</Label>
                  <Select value={newLabelTeamId} onValueChange={(v) => v && setNewLabelTeamId(v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateLabel} disabled={!newLabelName.trim()}>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Labels</CardTitle>
            </CardHeader>
            <CardContent>
              {!labelsLoaded ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : labels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels yet.</p>
              ) : (
                <div className="space-y-2">
                  {labels.map((label) => {
                    const team = teams.find((t) => t.id === label.teamId)
                    return (
                      <div key={label.id} className="flex items-center gap-3 py-1.5">
                        <input
                          type="color"
                          value={label.color}
                          onChange={(e) => handleUpdateLabelColor(label.id, e.target.value)}
                          className="size-5 rounded-full border-0 cursor-pointer p-0"
                        />
                        <span className="text-sm font-medium">{label.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{label.id}</span>
                        {team && (
                          <span className="text-xs text-muted-foreground ml-auto">{team.name}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
