"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Update {
  id: number
  project: string
  projectKey: string
  emoji: string
  author: string
  authorInitials: string
  time: string
  status: "ON TRACK" | "AT RISK" | "OFF TRACK"
  month: string
  bodyLines: string[]
}

const initialUpdates: Update[] = [
  {
    id: 1,
    project: "Space shuttle autopilot AI",
    projectKey: "SCRUM",
    emoji: "🍜",
    author: "Lia Arroyo",
    authorInitials: "LA",
    time: "3 days ago",
    status: "ON TRACK",
    month: "February",
    bodyLines: [
      "🏆 Developed a basic autopilot algorithm that can control the shuttle's velocity, altitude, and orientation.",
      "🔍 Currently researching and studying existing competitor autopilot systems. More info next week.",
    ],
  },
]

export default function ProjectStatusUpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = last week, -1 = two weeks ago, 1 = this week
  const [writeOpen, setWriteOpen] = useState(false)
  const [catchUpOpen, setCatchUpOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newUpdateBody, setNewUpdateBody] = useState("")
  const [newUpdateStatus, setNewUpdateStatus] = useState<
    "ON TRACK" | "AT RISK" | "OFF TRACK"
  >("ON TRACK")
  const [toast, setToast] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const weekLabel =
    weekOffset === 0
      ? "Last week"
      : weekOffset === 1
        ? "This week"
        : weekOffset === -1
          ? "Two weeks ago"
          : `${-weekOffset} weeks ago`

  const statusColors: Record<string, string> = {
    "ON TRACK": "bg-green-100 text-green-700",
    "AT RISK": "bg-yellow-100 text-yellow-700",
    "OFF TRACK": "bg-red-100 text-red-700",
  }

  const filteredUpdates = statusFilter
    ? updates.filter((u) => u.status === statusFilter)
    : updates

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) return
    setCreateOpen(false)
    setNewProjectName("")
    showToast(`Project "${name}" created`)
  }

  const handleWriteUpdate = () => {
    const body = newUpdateBody.trim()
    if (!body) return
    setUpdates((prev) => [
      ...prev,
      {
        id: Date.now(),
        project: "E2E Test Project",
        projectKey: "E2E",
        emoji: "📝",
        author: "Abhishek Sharma",
        authorInitials: "AS",
        time: "just now",
        status: newUpdateStatus,
        month: "April",
        bodyLines: [body],
      },
    ])
    setWriteOpen(false)
    setNewUpdateBody("")
    showToast("Update published")
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Status updates</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCatchUpOpen(true)}>
            Catch up
          </Button>
          <Button variant="outline" onClick={() => setWriteOpen(true)}>
            Write updates
          </Button>
        </div>
      </div>

      {/* Tabs matching /project-directory/following */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">
          Projects
        </h1>
        <div className="flex items-center gap-1">
          <Link
            href="/project-directory"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            All projects
          </Link>
          <Link
            href="/project-directory/following"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Following
          </Link>
          <Link
            href="/project-directory/archived"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Archived
          </Link>
        </div>
      </div>

      <div className="mb-6 border-b">
        <button className="border-b-2 border-blue-600 pb-2 text-sm font-medium text-blue-600">
          Following
        </button>
      </div>

      {/* Info / Create project banner */}
      <div className="mb-8 rounded-lg border p-5">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 size-6 shrink-0 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <div>
            <p className="text-sm font-semibold">
              There aren&apos;t any new project updates to show yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every Monday, this feed will show the latest updates from projects
              and topics you follow.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                Create project
              </Button>
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:underline"
              >
                More about projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setWeekOffset((v) => v - 1)}
          title="Previous week"
          aria-label="Previous week"
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold">{weekLabel}</h2>
        <button
          onClick={() => setWeekOffset((v) => v + 1)}
          title="Next week"
          aria-label="Next week"
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <p className="mb-4 text-sm font-medium text-muted-foreground">
        You&apos;re following 4 active projects, here&apos;s the breakdown.
      </p>

      {/* Stats grid — clickable filter cards */}
      <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border">
        {[
          {
            count: 1,
            label: "On track",
            sub: "-2 from last week",
            color: "text-green-600",
            filterKey: "ON TRACK",
          },
          {
            count: 1,
            label: "At risk",
            sub: "+1 from last week",
            color: "text-yellow-600",
            filterKey: "AT RISK",
          },
          {
            count: 1,
            label: "Off track",
            sub: "No change",
            color: "text-red-600",
            filterKey: "OFF TRACK",
          },
          {
            count: 0,
            label: "No update",
            sub: "No change",
            color: "text-gray-500",
            filterKey: null,
          },
          {
            count: 0,
            label: "Cancelled",
            sub: "No change",
            color: "text-gray-500",
            filterKey: null,
          },
          {
            count: 1,
            label: "Completed",
            sub: "+1 from last week",
            color: "text-gray-500",
            filterKey: null,
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (!item.filterKey) return
              setStatusFilter(
                statusFilter === item.filterKey ? null : item.filterKey
              )
              showToast(
                statusFilter === item.filterKey
                  ? `${item.label} filter cleared`
                  : `Filtered to ${item.label}`
              )
            }}
            className={`flex items-start gap-3 border-r border-b p-4 text-left transition-colors last:border-r-0 ${statusFilter === item.filterKey ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-accent"}`}
          >
            <span className={`text-2xl font-bold ${item.color}`}>
              {item.count}
            </span>
            <div>
              <p className="text-sm font-medium">
                {item.label} {item.label === "Completed" && "🎉"}
              </p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Feed */}
      {filteredUpdates.map((update) => (
        <div key={update.id} className="mb-4 rounded-lg border p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{update.emoji}</span>
            <span>Project</span>
          </div>
          <Link
            href={`/projects/${update.projectKey}/board`}
            className="mb-4 block text-sm font-medium hover:text-blue-600 hover:underline"
          >
            {update.project}
          </Link>
          <div className="flex items-start gap-3">
            <button
              onClick={() => showToast(`Viewing ${update.author}'s profile`)}
              title={`${update.author}'s profile`}
              className="rounded-full"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-indigo-600 text-xs text-white">
                  {update.authorInitials}
                </AvatarFallback>
              </Avatar>
            </button>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <button
                  onClick={() =>
                    showToast(`Viewing ${update.author}'s profile`)
                  }
                  className="text-sm font-medium hover:text-blue-600 hover:underline"
                >
                  {update.author}
                </button>
                <span className="text-xs text-muted-foreground">
                  {update.time}
                </span>
                <button
                  onClick={() => {
                    setStatusFilter(update.status)
                    showToast(`Filtered to ${update.status}`)
                  }}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase hover:ring-2 hover:ring-blue-300 ${statusColors[update.status]}`}
                  title={`Filter to ${update.status}`}
                >
                  {update.status}
                </button>
                <span className="text-xs text-muted-foreground">for</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <svg
                    className="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                  {update.month}
                </span>
              </div>
              {update.bodyLines.map((line, i) => (
                <p
                  key={i}
                  className="mt-1 text-sm leading-relaxed text-muted-foreground"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Catch up overlay */}
      {catchUpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setCatchUpOpen(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-lg border bg-background p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="size-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">You&apos;re all caught up</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ve reviewed every update from projects you follow for{" "}
              {weekLabel.toLowerCase()}.
            </p>
            <Button className="mt-4" onClick={() => setCatchUpOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Write update modal */}
      {writeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setWriteOpen(false)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold">Write your update</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Status
                </label>
                <div className="flex gap-2">
                  {(["ON TRACK", "AT RISK", "OFF TRACK"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewUpdateStatus(s)}
                      className={`rounded-md border px-3 py-1 text-sm ${newUpdateStatus === s ? "border-blue-500 bg-blue-50 text-blue-700" : "hover:bg-accent"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Update <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newUpdateBody}
                  onChange={(e) => setNewUpdateBody(e.target.value)}
                  autoFocus
                  placeholder="Share what's happening with this project..."
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setWriteOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleWriteUpdate}
                disabled={!newUpdateBody.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Publish update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create project modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh]"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-[480px] rounded-lg border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold">Create project</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                placeholder="e.g. Status Update E2E Project"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
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
