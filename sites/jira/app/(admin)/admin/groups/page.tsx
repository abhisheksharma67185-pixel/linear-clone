"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

const initialGroups = [
  {
    name: "goals-admins-abhisheksharma67185",
    desc: "Grants access to Goals and Goals administrat...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "goals-user-access-admins-abhisheksharma67185",
    desc: "Grants access to administer users and groups...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "goals-users-abhisheksharma67185",
    desc: "Grants access to Goals on abhisheksharma67...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "jira-admins-abhisheksharma67185",
    desc: "Grants access to the administration features for all Jira products on abhishek...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "jira-user-access-admins-abhisheksharma67185",
    desc: "Grants access to administer users and groups for Jira on abhisheksharma671...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "jira-users-abhisheksharma67185",
    desc: "Grants access to Jira on abhisheksharma67185",
    members: 1,
    apps: "1 app",
    team: "None",
  },
  {
    name: "org-admins",
    desc: "Grants access to administer org-level settings, users, and groups, and to vie...",
    members: 1,
    apps: "4 apps",
    team: "None",
  },
  {
    name: "projects-admins-abhisheksharma67185",
    desc: "Grants access to Projects and Projects administration features on abhisheks...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "projects-user-access-admins-abhisheksharma67185",
    desc: "Grants access to administer users and groups for Projects on abhisheksharm...",
    members: 0,
    apps: "1 app",
    team: "None",
  },
  {
    name: "projects-users-abhisheksharma67185",
    desc: "Grants access to Projects on abhisheksharma67185",
    members: 0,
    apps: "1 app",
    team: "None",
  },
]

const appOptions = [
  { name: "Goals", sub: "abhisheksharma67185", icon: "◎" },
  { name: "Jira Administration", sub: "abhisheksharma67185", icon: "⚙" },
  { name: "Jira", sub: "abhisheksharma67185", icon: "◆" },
  { name: "Projects", sub: "abhisheksharma67185", icon: "✦" },
]

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState(initialGroups)
  const [appsOpen, setAppsOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDesc, setNewGroupDesc] = useState("")
  const filterRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setAppsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Escape closes modal
  useEffect(() => {
    if (!dialogOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialogOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [dialogOpen])

  const handleCreate = () => {
    const name = newGroupName.trim()
    if (!name) return
    setGroups((prev) => [
      {
        name,
        desc: newGroupDesc.trim() || "No description",
        members: 0,
        apps: "0 apps",
        team: "None",
      },
      ...prev,
    ])
    setDialogOpen(false)
    setNewGroupName("")
    setNewGroupDesc("")
    showToast(`Group "${name}" created successfully`)
  }

  return (
    <div className="max-w-5xl p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[10000] flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          <svg
            className="size-4 shrink-0 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setDialogOpen(true)}
        >
          Create group
        </Button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Use groups to grant the same access and permissions to multiple users.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          How to manage groups
        </button>
      </p>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by group name"
            className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setAppsOpen(!appsOpen)}
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${appsOpen ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Apps{" "}
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {appsOpen && (
            <div className="absolute top-full left-0 z-10 mt-1 w-64 rounded-lg border bg-background shadow-lg">
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-8 w-full rounded-md border bg-background pr-8 pl-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                  <svg
                    className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {appOptions.map((app) => (
                  <label
                    key={app.name}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <input type="checkbox" className="size-4 rounded border" />
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-xs">
                        {app.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.sub}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="border-t px-3 py-2 text-right text-xs text-muted-foreground">
                4 of 4
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Showing {groups.length} results
      </p>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Group</th>
              <th className="w-[80px] px-4 py-2.5 text-left font-medium">
                Members
              </th>
              <th className="w-[80px] px-4 py-2.5 text-left font-medium">
                Apps
              </th>
              <th className="w-[80px] px-4 py-2.5 text-left font-medium">
                Team
              </th>
              <th className="w-[60px] px-4 py-2.5 text-left font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr
                key={g.name}
                className="border-b transition-colors last:border-b-0 hover:bg-accent/30"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{g.name}</p>
                  <p className="max-w-lg truncate text-xs text-muted-foreground">
                    {g.desc}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm">{g.members}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center gap-0.5">
                    {g.apps}
                    <svg
                      className="size-3.5 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {g.team}
                </td>
                <td className="px-4 py-3">
                  <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create group modal — manual overlay, not base-ui Dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialogOpen(false)
          }}
        >
          <div
            className="w-full max-w-lg rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Create group</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Groups give users the same app access and permissions. Required
                fields are marked with an asterisk{" "}
                <span className="text-red-500">*</span>
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate()
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  This will be visible to anyone in the organization
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Users
                </label>
                <input
                  type="text"
                  placeholder="Search users to add"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false)
                  setNewGroupName("")
                  setNewGroupDesc("")
                }}
                className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newGroupName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
