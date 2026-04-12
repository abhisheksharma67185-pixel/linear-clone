"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ArchivedGoal {
  id: number
  name: string
  description: string
  owner: { name: string; initials: string }
  archivedDate: string
  progress: number
  status: string
}

const initialArchivedGoals: ArchivedGoal[] = [
  {
    id: 1,
    name: "Reduce customer churn by 15%",
    description: "Focus on improving retention through better onboarding flows and proactive support outreach.",
    owner: { name: "Abhishek Sharma", initials: "AS" },
    archivedDate: "Mar 12, 2026",
    progress: 72,
    status: "AT RISK",
  },
  {
    id: 2,
    name: "Complete infrastructure migration to AWS",
    description: "Migrate all legacy on-prem services to AWS EKS with zero downtime.",
    owner: { name: "Priya Patel", initials: "PP" },
    archivedDate: "Feb 28, 2026",
    progress: 100,
    status: "COMPLETED",
  },
  {
    id: 3,
    name: "Launch mobile app v2.0",
    description: "Ship redesigned mobile experience with offline mode and push notifications.",
    owner: { name: "James Chen", initials: "JC" },
    archivedDate: "Jan 15, 2026",
    progress: 45,
    status: "CANCELLED",
  },
]

const statusColors: Record<string, string> = {
  "ON TRACK": "bg-green-400 text-white",
  "AT RISK": "bg-yellow-300 text-yellow-900",
  "OFF TRACK": "bg-red-400 text-white",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  PENDING: "bg-gray-200 text-gray-700",
}

export default function ArchivedGoalsPage() {
  const [goals, setGoals] = useState<ArchivedGoal[]>(initialArchivedGoals)
  const [search, setSearch] = useState("")
  const [restoredMessage, setRestoredMessage] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const filteredGoals = goals.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.owner.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleRestore = (id: number) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      setRestoredMessage(`"${goal.name}" has been restored.`)
      setTimeout(() => setRestoredMessage(null), 3000)
    }
  }

  const handleDelete = (id: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setDeleteConfirmId(null)
  }

  return (
    <div className="p-6">
      {/* Restored toast */}
      {restoredMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-white px-5 py-3 text-sm font-medium shadow-lg dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <svg className="size-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {restoredMessage}
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg className="size-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2" /><circle cx="12" cy="12" r="5" />
          </svg>
          <p className="text-sm">
            Goals give teams a single place to track progress toward the outcomes that their work contributes to.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button className="bg-green-600 text-white hover:bg-green-700">Create your first goal</Button>
          <button className="text-sm text-muted-foreground hover:underline">More about goals</button>
        </div>
      </div>

      {/* Title + tabs */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Goals</h1>
        <div className="flex items-center gap-1">
          <Link
            href="/goals"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            All goals
          </Link>
          <Link
            href="/goals/following"
            className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            My goals
          </Link>
          <Link
            href="/goals/archived"
            className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          >
            Archived
          </Link>
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            More views <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-5 relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          placeholder="Search archived goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 bg-muted/50"
        />
      </div>

      {/* Archived goals list */}
      {filteredGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="mb-4 size-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <p className="text-sm text-muted-foreground">
            {search ? "No archived goals match your search." : "No archived goals."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border p-5 transition-colors hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold truncate">{goal.name}</h3>
                    <span className="shrink-0 rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Archived
                    </span>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${statusColors[goal.status] ?? "bg-gray-200 text-gray-600"}`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                    {goal.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-5">
                        <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">
                          {goal.owner.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{goal.owner.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Archived {goal.archivedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-20 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-blue-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span>{goal.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(goal.id)}
                    className="gap-1.5"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmId(goal.id)}
                    className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete permanently
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete goal permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The goal and all its associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
