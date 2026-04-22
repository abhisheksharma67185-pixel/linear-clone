"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

interface Dashboard {
  id: string
  name: string
  description: string
  owner: string
  viewers: string
  editors: string
  starred: boolean
}

const initialDashboards: Dashboard[] = [
  {
    id: "dash-1",
    name: "Default dashboard",
    description:
      "Your personal default dashboard showing assigned issues and activity.",
    owner: "Abhishek Sharma",
    viewers: "My organization",
    editors: "Private",
    starred: false,
  },
  {
    id: "dash-2",
    name: "Sprint Overview",
    description:
      "Track active sprint progress and burndown across all projects.",
    owner: "Abhishek Sharma",
    viewers: "My organization",
    editors: "My organization",
    starred: false,
  },
  {
    id: "dash-3",
    name: "Bug Tracker",
    description: "Monitor open bugs, regressions, and critical issues.",
    owner: "Abhishek Sharma",
    viewers: "Private",
    editors: "Private",
    starred: false,
  },
]

export default function DashboardsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [dashboards, setDashboards] = useState<Dashboard[]>(initialDashboards)

  // Filters
  const [ownerFilter, setOwnerFilter] = useState<"all" | "me">("all")
  const [viewerFilter, setViewerFilter] = useState<"all" | "private" | "org">(
    "all"
  )

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newViewers, setNewViewers] = useState("My organization")
  const [newEditors, setNewEditors] = useState("Private")
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editDash, setEditDash] = useState<Dashboard | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteDash, setDeleteDash] = useState<Dashboard | null>(null)

  const filtered = dashboards.filter((d) => {
    if (!d.name.toLowerCase().includes(search.toLowerCase())) return false
    if (ownerFilter === "me" && d.owner !== "Abhishek Sharma") return false
    if (viewerFilter === "private" && d.viewers !== "Private") return false
    if (viewerFilter === "org" && d.viewers !== "My organization") return false
    return true
  })

  const starredCount = dashboards.filter((d) => d.starred).length

  const handleCreate = () => {
    if (!newName.trim()) return
    setCreating(true)
    const newDash: Dashboard = {
      id: `dash-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim(),
      owner: "Abhishek Sharma",
      viewers: newViewers,
      editors: newEditors,
      starred: false,
    }
    setDashboards((prev) => [...prev, newDash])
    setCreateOpen(false)
    setNewName("")
    setNewDescription("")
    setNewViewers("My organization")
    setNewEditors("Private")
    setCreating(false)
    router.push(`/dashboards/${newDash.id}`)
  }

  const handleStar = (id: string) => {
    setDashboards((prev) =>
      prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d))
    )
  }

  const handleEdit = (dash: Dashboard) => {
    setEditDash(dash)
    setEditName(dash.name)
    setEditDescription(dash.description)
    setEditOpen(true)
  }

  const handleEditSave = () => {
    if (!editDash || !editName.trim()) return
    setDashboards((prev) =>
      prev.map((d) =>
        d.id === editDash.id
          ? { ...d, name: editName.trim(), description: editDescription.trim() }
          : d
      )
    )
    setEditOpen(false)
    setEditDash(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteDash) return
    setDashboards((prev) => prev.filter((d) => d.id !== deleteDash.id))
    setDeleteOpen(false)
    setDeleteDash(null)
  }

  const handleCopy = (dash: Dashboard) => {
    const copy: Dashboard = {
      ...dash,
      id: `dash-${Date.now()}`,
      name: `${dash.name} (copy)`,
      starred: false,
    }
    setDashboards((prev) => [...prev, copy])
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setCreateOpen(true)}
        >
          Create dashboard
        </Button>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
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
          <Input
            placeholder="Search dashboards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 pl-9"
          />
        </div>

        {/* Owner filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
            Owner{ownerFilter !== "all" ? ": Me" : ""}
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setOwnerFilter("all")}>
              All owners
              {ownerFilter === "all" && (
                <svg
                  className="ml-auto size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOwnerFilter("me")}>
              Owned by me
              {ownerFilter === "me" && (
                <svg
                  className="ml-auto size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Viewers filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
            Viewers
            {viewerFilter !== "all"
              ? `: ${viewerFilter === "private" ? "Private" : "Organization"}`
              : ""}
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setViewerFilter("all")}>
              All
              {viewerFilter === "all" && (
                <svg
                  className="ml-auto size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewerFilter("org")}>
              My organization
              {viewerFilter === "org" && (
                <svg
                  className="ml-auto size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewerFilter("private")}>
              Private
              {viewerFilter === "private" && (
                <svg
                  className="ml-auto size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(ownerFilter !== "all" || viewerFilter !== "all") && (
          <button
            onClick={() => {
              setOwnerFilter("all")
              setViewerFilter("all")
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {starredCount > 0 && (
        <p className="mb-3 text-xs text-muted-foreground">
          {starredCount} starred dashboard{starredCount !== 1 ? "s" : ""}
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8">
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 text-xs font-medium">
                  Name
                  <svg
                    className="size-3 text-muted-foreground"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 4l4 4H4z" />
                  </svg>
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium">Owner</TableHead>
              <TableHead className="text-xs font-medium">Viewers</TableHead>
              <TableHead className="text-xs font-medium">Editors</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((dashboard) => (
              <TableRow key={dashboard.id}>
                <TableCell>
                  <button
                    onClick={() => handleStar(dashboard.id)}
                    className={`transition-colors ${dashboard.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill={dashboard.starred ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboards/${dashboard.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {dashboard.name}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dashboard.owner}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {dashboard.viewers === "Private" ? (
                        <>
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </>
                      ) : (
                        <>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                        </>
                      )}
                    </svg>
                    {dashboard.viewers}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {dashboard.editors}
                  </div>
                </TableCell>
                <TableCell>
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
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboards/${dashboard.id}`)
                        }
                      >
                        <svg
                          className="mr-2 size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(dashboard)}>
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
                      <DropdownMenuItem onClick={() => handleCopy(dashboard)}>
                        <svg
                          className="mr-2 size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setDeleteDash(dashboard)
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
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No dashboards found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dashboard Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sprint Overview"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What is this dashboard for?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Viewers
                </label>
                <select
                  value={newViewers}
                  onChange={(e) => setNewViewers(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="Private">Private</option>
                  <option value="My organization">My organization</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Editors
                </label>
                <select
                  value={newEditors}
                  onChange={(e) => setNewEditors(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="Private">Private</option>
                  <option value="My organization">My organization</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dashboard Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit dashboard</DialogTitle>
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
                Description
              </label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
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
              disabled={!editName.trim()}
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
            <DialogTitle>Delete dashboard</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteDash?.name}
            </span>
            ? This action cannot be undone.
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
