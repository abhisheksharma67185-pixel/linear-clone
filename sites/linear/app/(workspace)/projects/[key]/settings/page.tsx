"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Team, Member } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const params = useParams<{ key: string }>()
  const teamKey = params.key

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [leadId, setLeadId] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${teamKey}`).then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ]).then(([t, m]) => {
      setTeam(t)
      setMembers(m)
      if (t && !t.error) {
        setName(t.name)
        setDescription(t.description)
        setLeadId(t.leadId)
      }
      setLoading(false)
    })
  }, [teamKey])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/data/projects/${teamKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, leadId }),
    })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-2xl">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!team || (team as Record<string, unknown>).error) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-sm text-center">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Team not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">{team.name} Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage team settings and configuration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Lead</Label>
            <Select value={leadId} onValueChange={(v) => v && setLeadId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
