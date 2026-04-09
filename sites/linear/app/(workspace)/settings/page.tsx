"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WorkspaceSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("SimBench Workspace")
  const [workspaceUrl, setWorkspaceUrl] = useState("simbench")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
                {[
                  { name: "Alex Johnson", email: "alex@example.com", role: "Admin" },
                  { name: "Sam Williams", email: "sam@example.com", role: "Member" },
                  { name: "Jordan Lee", email: "jordan@example.com", role: "Member" },
                  { name: "Taylor Brown", email: "taylor@example.com", role: "Member" },
                  { name: "Casey Davis", email: "casey@example.com", role: "Member" },
                ].map((member) => (
                  <div key={member.email} className="flex items-center justify-between py-2">
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

        <TabsContent value="labels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Bug", color: "bg-red-500" },
                  { name: "Feature", color: "bg-blue-500" },
                  { name: "Improvement", color: "bg-green-500" },
                  { name: "Documentation", color: "bg-yellow-500" },
                  { name: "Security", color: "bg-purple-500" },
                  { name: "Performance", color: "bg-orange-500" },
                ].map((label) => (
                  <div key={label.name} className="flex items-center gap-2 py-1.5">
                    <div className={`size-3 rounded-full ${label.color}`} />
                    <span className="text-sm">{label.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
