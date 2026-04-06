"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AppLink {
  id: string
  name: string
  url: string
  hidden: boolean
  groups: string
  system: boolean
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<AppLink[]>([
    {
      id: "app-1",
      name: "Jira",
      url: "https://abhisheksharma67185.atlassian.net/secure/MyJiraHome.jspa",
      hidden: false,
      groups: "",
      system: true,
    },
  ])

  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newHidden, setNewHidden] = useState(false)
  const [newGroups, setNewGroups] = useState("")

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return
    setApps((prev) => [
      ...prev,
      {
        id: `app-${Date.now()}`,
        name: newName.trim(),
        url: newUrl.trim(),
        hidden: newHidden,
        groups: newGroups.trim(),
        system: false,
      },
    ])
    setNewName("")
    setNewUrl("")
    setNewHidden(false)
    setNewGroups("")
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search Jira admin
        </button>
      </div>

      {/* Application Navigator section */}
      <div className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Application Navigator</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground max-w-4xl">
          The application navigator appears in the top left corner of the header so users can quickly access other applications. Linked applications are automatically configured in the application navigator for you, and you can&apos;t delete them. Add your own links for users by providing the name and URL of the destination below.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_80px_180px_80px] gap-2 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <span>Name</span>
          <span>URL</span>
          <span>Hide</span>
          <span>Groups</span>
          <span className="flex justify-end">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
            </svg>
          </span>
        </div>

        {/* Add new row */}
        <div className="grid grid-cols-[200px_1fr_80px_180px_80px] gap-2 border-b bg-blue-50/50 px-4 py-2 dark:bg-blue-900/10">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm bg-background"
            placeholder=""
          />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-8 text-sm bg-background"
            placeholder=""
          />
          <div className="flex items-center justify-center">
            <input
              type="radio"
              checked={newHidden}
              onChange={() => setNewHidden(!newHidden)}
              className="size-4 accent-blue-600"
            />
          </div>
          <Input
            value={newGroups}
            onChange={(e) => setNewGroups(e.target.value)}
            className="h-8 text-sm bg-background"
            placeholder=""
          />
          <div className="flex items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              className="text-sm"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Existing apps */}
        {apps.map((app) => (
          <div
            key={app.id}
            className="grid grid-cols-[200px_1fr_80px_180px_80px] gap-2 border-b last:border-b-0 px-4 py-3 items-center"
          >
            <div className="flex items-center gap-2">
              {app.system && (
                <svg className="size-4 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              )}
              <span className="text-sm">{app.name}</span>
            </div>
            <span className="text-sm text-muted-foreground truncate">{app.url}</span>
            <div />
            <div />
            <div />
          </div>
        ))}
      </div>
    </div>
  )
}
