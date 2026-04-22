"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppLink {
  id: string
  name: string
  url: string
  hidden: boolean
  groups: string
  system: boolean
}

const initialApps: AppLink[] = [
  {
    id: "app-1",
    name: "Jira",
    url: "https://abhisheksharma67185.atlassian.net/secure/MyJiraHome.jspa",
    hidden: false,
    groups: "",
    system: true,
  },
  {
    id: "app-2",
    name: "Confluence",
    url: "https://abhisheksharma67185.atlassian.net/wiki",
    hidden: false,
    groups: "",
    system: true,
  },
  {
    id: "app-3",
    name: "Bitbucket",
    url: "https://bitbucket.org",
    hidden: false,
    groups: "",
    system: true,
  },
]

export default function ApplicationsPage() {
  const [apps, setApps] = useState<AppLink[]>(initialApps)

  // Add form state
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newHidden, setNewHidden] = useState(false)
  const [newGroups, setNewGroups] = useState("")

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editApp, setEditApp] = useState<AppLink | null>(null)
  const [editName, setEditName] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [editGroups, setEditGroups] = useState("")

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteApp, setDeleteApp] = useState<AppLink | null>(null)

  // Success message
  const [message, setMessage] = useState<string | null>(null)

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return
    const app: AppLink = {
      id: `app-${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim(),
      hidden: newHidden,
      groups: newGroups.trim(),
      system: false,
    }
    setApps((prev) => [...prev, app])
    setNewName("")
    setNewUrl("")
    setNewHidden(false)
    setNewGroups("")
    showMessage(`"${app.name}" has been added.`)
  }

  const handleToggleHidden = (id: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, hidden: !a.hidden } : a))
    )
  }

  const handleEditOpen = (app: AppLink) => {
    setEditApp(app)
    setEditName(app.name)
    setEditUrl(app.url)
    setEditGroups(app.groups)
    setEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editApp || !editName.trim() || !editUrl.trim()) return
    setApps((prev) =>
      prev.map((a) =>
        a.id === editApp.id
          ? {
              ...a,
              name: editName.trim(),
              url: editUrl.trim(),
              groups: editGroups.trim(),
            }
          : a
      )
    )
    setEditOpen(false)
    setEditApp(null)
    showMessage(`"${editName.trim()}" has been updated.`)
  }

  const handleDeleteConfirm = () => {
    if (!deleteApp) return
    setApps((prev) => prev.filter((a) => a.id !== deleteApp.id))
    setDeleteOpen(false)
    const name = deleteApp.name
    setDeleteApp(null)
    showMessage(`"${name}" has been removed.`)
  }

  const handleMoveUp = (id: string) => {
    setApps((prev) => {
      const idx = prev.findIndex((a) => a.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const handleMoveDown = (id: string) => {
    setApps((prev) => {
      const idx = prev.findIndex((a) => a.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  return (
    <div className="p-8">
      {/* Toast message */}
      {message && (
        <div className="fixed top-4 right-4 z-50 flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
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
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
      </div>

      {/* Application Navigator section */}
      <div className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Application Navigator</h2>
        <p className="mb-6 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          The application navigator appears in the top left corner of the header
          so users can quickly access other applications. Linked applications
          are automatically configured in the application navigator for you, and
          you can&apos;t delete them. Add your own links for users by providing
          the name and URL of the destination below.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_80px_180px_80px] gap-2 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <span>Name</span>
          <span>URL</span>
          <span className="text-center">Hide</span>
          <span>Groups</span>
          <span className="text-center">Actions</span>
        </div>

        {/* Add new row */}
        <div className="grid grid-cols-[200px_1fr_80px_180px_80px] gap-2 border-b bg-blue-50/50 px-4 py-2 dark:bg-blue-900/10">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 bg-background text-sm"
            placeholder="App name"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-8 bg-background text-sm"
            placeholder="https://..."
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex items-center justify-center">
            <button
              onClick={() => setNewHidden(!newHidden)}
              className={`size-4 rounded border transition-colors ${newHidden ? "border-blue-600 bg-blue-600" : "border-muted-foreground/40"}`}
            >
              {newHidden && (
                <svg
                  className="size-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
          <Input
            value={newGroups}
            onChange={(e) => setNewGroups(e.target.value)}
            className="h-8 bg-background text-sm"
            placeholder="e.g. jira-users"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex items-center justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              disabled={!newName.trim() || !newUrl.trim()}
              className="text-sm"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Existing apps */}
        {apps.map((app, idx) => (
          <div
            key={app.id}
            className={`grid grid-cols-[200px_1fr_80px_180px_80px] items-center gap-2 border-b px-4 py-3 last:border-b-0 ${app.hidden ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-2">
              {app.system ? (
                <svg
                  className="size-4 shrink-0 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              ) : (
                <svg
                  className="size-4 shrink-0 text-muted-foreground/50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
              <span className="truncate text-sm font-medium">{app.name}</span>
              {app.system && (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  System
                </span>
              )}
            </div>
            <span className="truncate text-sm text-muted-foreground">
              {app.url}
            </span>
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleToggleHidden(app.id)}
                className={`size-4 rounded border transition-colors ${app.hidden ? "border-blue-600 bg-blue-600" : "border-muted-foreground/40 hover:border-muted-foreground"}`}
              >
                {app.hidden && (
                  <svg
                    className="size-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </div>
            <span className="truncate text-sm text-muted-foreground">
              {app.groups || "—"}
            </span>
            <div className="flex items-center justify-center">
              {app.system ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <svg
                      className="size-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditOpen(app)}>
                      <svg
                        className="mr-2 size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </DropdownMenuItem>
                    {idx > 0 && (
                      <DropdownMenuItem onClick={() => handleMoveUp(app.id)}>
                        <svg
                          className="mr-2 size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                        Move up
                      </DropdownMenuItem>
                    )}
                    {idx < apps.length - 1 && (
                      <DropdownMenuItem onClick={() => handleMoveDown(app.id)}>
                        <svg
                          className="mr-2 size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        Move down
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setDeleteApp(app)
                        setDeleteOpen(true)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <svg
                        className="mr-2 size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}

        {apps.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No applications configured. Add one above.
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {apps.length} application{apps.length !== 1 ? "s" : ""} configured
        &middot; {apps.filter((a) => a.system).length} system &middot;{" "}
        {apps.filter((a) => !a.system).length} custom
      </p>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit application link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                URL <span className="text-red-500">*</span>
              </label>
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Groups</label>
              <Input
                value={editGroups}
                onChange={(e) => setEditGroups(e.target.value)}
                placeholder="e.g. jira-users, developers"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleEditSave}
              disabled={!editName.trim() || !editUrl.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete application link</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">
              {deleteApp?.name}
            </span>{" "}
            from the application navigator?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
