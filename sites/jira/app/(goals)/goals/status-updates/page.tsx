"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// ─── Types ───────────────────────────────────────────────────────────────────

interface GoalRow {
  id: string
  name: string
  status: string
  progress: number
  targetDate: string
  owner: { name: string; initials: string }
  following: boolean
  createdAt: string
}

interface UpdateEntry {
  id: string
  goalId: string
  goalName: string
  author: { name: string; initials: string }
  status: string
  date: string
  body: string
}

// ─── Seed updates (displayed per month) ──────────────────────────────────────

const seedUpdates: UpdateEntry[] = [
  {
    id: "upd-1",
    goalId: "goal-1",
    goalName: "Increase platform uptime to 99.9%",
    author: { name: "Abhishek Sharma", initials: "AS" },
    status: "ON TRACK",
    date: "2026-04-10T10:00:00Z",
    body: "Uptime hit 99.85% in March. Migrated two more services to the redundant cluster. On track for 99.9% by June.",
  },
  {
    id: "upd-2",
    goalId: "goal-8",
    goalName: "Ship redesigned onboarding flow",
    author: { name: "Taylor Brown", initials: "TB" },
    status: "ON TRACK",
    date: "2026-04-08T14:00:00Z",
    body: "Onboarding v2 designs approved. Engineering started implementation — 3 of 5 screens done. Beta testing next week.",
  },
  {
    id: "upd-3",
    goalId: "goal-5",
    goalName: "Achieve SOC 2 Type II compliance",
    author: { name: "Abhishek Sharma", initials: "AS" },
    status: "AT RISK",
    date: "2026-04-06T09:00:00Z",
    body: "Audit prep is 45% complete but we're behind on evidence collection for access controls. Requested additional help from DevOps.",
  },
  {
    id: "upd-4",
    goalId: "goal-2",
    goalName: "Reduce customer churn by 15%",
    author: { name: "Sam Williams", initials: "SW" },
    status: "AT RISK",
    date: "2026-03-15T09:00:00Z",
    body: "Churn rate dropped to 8.2% from 9.1% but still above the 7.5% target. Launched new retention email series this week.",
  },
  {
    id: "upd-5",
    goalId: "goal-6",
    goalName: "Grow monthly active users to 50K",
    author: { name: "Sam Williams", initials: "SW" },
    status: "OFF TRACK",
    date: "2026-03-10T11:00:00Z",
    body: "MAU at 28K — growth slowed after the initial launch push. Need to revisit acquisition strategy and ad spend.",
  },
]

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "Today"
  if (days === 1) return "1 day ago"
  if (days < 30) return `${days} days ago`
  return `${Math.floor(days / 30)} months ago`
}

function statusBadge(status: string) {
  const cls =
    status === "ON TRACK"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : status === "AT RISK"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
        : status === "OFF TRACK"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : status === "DONE"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${cls}`}
    >
      {status}
    </span>
  )
}

function statusDot(status: string) {
  const cls =
    status === "ON TRACK"
      ? "bg-green-500"
      : status === "AT RISK"
        ? "bg-yellow-400"
        : status === "OFF TRACK"
          ? "bg-red-500"
          : status === "DONE"
            ? "bg-green-500"
            : "bg-gray-400"
  return <span className={`inline-block size-2.5 rounded-full ${cls}`} />
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StatusUpdatesPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()) // 0-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Catch up drawer
  const [catchUpOpen, setCatchUpOpen] = useState(false)

  // Write updates dialog
  const [writeOpen, setWriteOpen] = useState(false)
  const [writeGoalId, setWriteGoalId] = useState("")
  const [writeStatus, setWriteStatus] = useState("ON TRACK")
  const [writeBody, setWriteBody] = useState("")
  const [userUpdates, setUserUpdates] = useState<UpdateEntry[]>([])
  const [writeToast, setWriteToast] = useState<string | null>(null)

  const fetchGoals = useCallback(() => {
    fetch("/api/data/goals")
      .then((r) => r.json())
      .then((data) => {
        const rows: GoalRow[] = data.map((g: Record<string, unknown>) => {
          const ou = g.ownerUser as {
            displayName?: string
            name?: string
          } | null
          const ownerName = ou?.displayName ?? ou?.name ?? "Unknown"
          return {
            id: g.id as string,
            name: g.name as string,
            status: g.status as string,
            progress: g.progress as number,
            targetDate: (g.targetDate as string) || "No date",
            owner: {
              name: ownerName,
              initials: ownerName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2),
            },
            following: g.following as boolean,
            createdAt: g.createdAt as string,
          }
        })
        setGoals(rows)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Derived data
  const followedGoals = goals.filter((g) => g.following)
  const activeGoals = followedGoals.filter(
    (g) => g.status !== "DONE" && g.status !== "CANCELLED"
  )
  const newGoals = goals.filter((g) => {
    const d = new Date(g.createdAt)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const completedGoals = goals.filter((g) => g.status === "DONE")

  // Status breakdown from followed goals
  const onTrack = followedGoals.filter((g) => g.status === "ON TRACK").length
  const atRisk = followedGoals.filter((g) => g.status === "AT RISK").length
  const offTrack = followedGoals.filter((g) => g.status === "OFF TRACK").length
  const noUpdate = followedGoals.filter(
    (g) => g.status === "PENDING" || g.status === "PAUSED"
  ).length
  const cancelled = followedGoals.filter((g) => g.status === "CANCELLED").length
  const completed = followedGoals.filter((g) => g.status === "DONE").length

  // Updates for current month
  const allUpdates = [...seedUpdates, ...userUpdates]
  const monthUpdates = allUpdates.filter((u) => {
    const d = new Date(u.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else setCurrentMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else setCurrentMonth((m) => m + 1)
  }

  const handleWriteUpdate = () => {
    if (!writeGoalId || !writeBody.trim()) return
    const goal = goals.find((g) => g.id === writeGoalId)
    const entry: UpdateEntry = {
      id: `upd-user-${Date.now()}`,
      goalId: writeGoalId,
      goalName: goal?.name ?? "Goal",
      author: { name: "Abhishek Sharma", initials: "AS" },
      status: writeStatus,
      date: new Date().toISOString(),
      body: writeBody.trim(),
    }
    setUserUpdates((prev) => [entry, ...prev])
    setWriteOpen(false)
    setWriteBody("")
    setWriteGoalId("")
    setWriteStatus("ON TRACK")
    setWriteToast("Update published")
    setTimeout(() => setWriteToast(null), 3000)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )

  return (
    <div className="flex gap-0">
      {/* Main content */}
      <div className="min-w-0 flex-1 p-6">
        {/* Title + actions */}
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

        {/* Following tab */}
        <div className="mb-6 border-b">
          <button className="border-b-2 border-blue-600 pb-2 text-sm font-medium text-blue-600">
            Following
          </button>
        </div>

        {/* Info card */}
        <div className="mb-8 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 size-6 shrink-0 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" opacity="0.2" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            <div>
              <p className="text-sm leading-relaxed">
                On the 8th of each month, you&apos;ll see the latest updates on
                goals and topics you follow in this feed.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  size="sm"
                  onClick={() => router.push("/goals")}
                >
                  Create your first goal
                </Button>
                <button
                  className="text-sm text-muted-foreground hover:underline"
                  onClick={() => router.push("/goals")}
                >
                  More about goals
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={prevMonth}
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
          <h2 className="text-xl font-semibold">{MONTHS[currentMonth]}</h2>
          <button
            onClick={nextMonth}
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

        {/* Summary */}
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          You&apos;re following {activeGoals.length} active goal
          {activeGoals.length !== 1 ? "s" : ""}, here&apos;s the breakdown.
        </p>

        {/* Status grid */}
        <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border">
          {[
            {
              count: onTrack,
              label: "On track",
              sub: onTrack > 0 ? `+${onTrack} from last month` : "No change",
              color: "text-green-600",
              dot: "bg-green-500",
            },
            {
              count: atRisk,
              label: "At risk",
              sub:
                atRisk > 0
                  ? `${atRisk} goal${atRisk !== 1 ? "s" : ""}`
                  : "No change",
              color: "text-yellow-600",
              dot: "bg-yellow-400",
            },
            {
              count: offTrack,
              label: "Off track",
              sub:
                offTrack > 0
                  ? `${offTrack} goal${offTrack !== 1 ? "s" : ""}`
                  : "No change",
              color: "text-red-600",
              dot: "bg-red-500",
            },
            {
              count: noUpdate,
              label: "No update",
              sub: noUpdate > 0 ? `${noUpdate} pending` : "No change",
              color: "text-gray-500",
              dot: "bg-gray-400",
            },
            {
              count: cancelled,
              label: "Cancelled",
              sub: "No change",
              color: "text-gray-500",
              dot: "bg-gray-400",
            },
            {
              count: completed,
              label: "Completed",
              sub: completed > 0 ? `${completed} done` : "No change",
              color: "text-gray-500",
              dot: "bg-gray-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 border-r border-b p-4 last:border-r-0"
            >
              <span className={`text-2xl font-bold ${item.color}`}>
                {item.count}
              </span>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Updates feed */}
        {monthUpdates.length > 0 ? (
          <div className="space-y-4">
            {monthUpdates.map((update) => (
              <div key={update.id} className="rounded-lg border p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Goal</span>
                </div>
                <p className="mb-4 text-sm font-medium">{update.goalName}</p>
                <div className="flex items-start gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-purple-600 text-xs text-white">
                      {update.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {update.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(update.date)}
                      </span>
                      {statusBadge(update.status)}
                      {(() => {
                        const goal = goals.find((g) => g.id === update.goalId)
                        if (goal?.targetDate && goal.targetDate !== "No date") {
                          return (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>for</span>
                              <svg
                                className="size-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                              </svg>
                              {goal.targetDate}
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {update.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 text-6xl">📋</div>
            <h3 className="mb-1 text-lg font-semibold">
              No updates for {MONTHS[currentMonth]}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Goal owners need to know someone&apos;s listening to invest time
              in writing monthly updates.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setWriteOpen(true)}
            >
              Write an update
            </Button>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="hidden w-64 shrink-0 border-l p-6 xl:block">
        {/* Your goals */}
        {followedGoals.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold">Your goals</h3>
            <div className="space-y-2">
              {followedGoals.slice(0, 5).map((g) => (
                <button
                  key={g.id}
                  onClick={() => router.push(`/goals/${g.id}`)}
                  className="-mx-1 flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-accent"
                >
                  {statusDot(g.status)}
                  <span className="flex-1 truncate text-sm">{g.name}</span>
                </button>
              ))}
              {followedGoals.length > 5 && (
                <button
                  onClick={() => router.push("/goals/following")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  +{followedGoals.length - 5} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* New goals */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">New goals</h3>
          {newGoals.length > 0 ? (
            <div className="space-y-2">
              {newGoals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => router.push(`/goals/${g.id}`)}
                  className="-mx-1 flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-accent"
                >
                  {statusDot(g.status)}
                  <span className="flex-1 truncate text-sm">{g.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No new goals this month
            </p>
          )}
        </div>

        {/* Completed goals */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Completed goals</h3>
          {completedGoals.length > 0 ? (
            <div className="space-y-2">
              {completedGoals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => router.push(`/goals/${g.id}`)}
                  className="-mx-1 flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    className="size-4 shrink-0 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="flex-1 truncate text-sm">{g.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No completed goals this month
            </p>
          )}
        </div>
      </div>

      {/* ── Catch up — full-screen overlay with confetti like real Jira ── */}
      {catchUpOpen && <CatchUpOverlay onClose={() => setCatchUpOpen(false)} />}

      {/* ── Write updates — full-screen overlay like real Jira ── */}
      {writeOpen && (
        <WriteUpdatesOverlay
          goals={goals}
          onClose={() => setWriteOpen(false)}
          onPublish={handleWriteUpdate}
          writeGoalId={writeGoalId}
          setWriteGoalId={setWriteGoalId}
          writeStatus={writeStatus}
          setWriteStatus={setWriteStatus}
          writeBody={writeBody}
          setWriteBody={setWriteBody}
        />
      )}

      {/* Toast */}
      {writeToast && (
        <div className="fixed top-4 right-4 z-[100] flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
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
          {writeToast}
        </div>
      )}
    </div>
  )
}

// ─── Green checkmark SVG shared by both overlays ─────────────────────────────

function GreenCheckmark({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Sparkles */}
      <svg
        className="absolute -top-3 -left-2 size-5 animate-pulse text-emerald-400"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
      </svg>
      <svg
        className="absolute -top-1 -right-3 size-4 animate-pulse text-emerald-300"
        style={{ animationDelay: "0.3s" }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
      </svg>
      <svg
        className="absolute bottom-2 -left-4 size-3 animate-pulse text-emerald-400"
        style={{ animationDelay: "0.6s" }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
      </svg>
      <svg
        className="absolute right-0 bottom-0 size-3 animate-pulse text-yellow-400"
        style={{ animationDelay: "0.4s" }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="5" />
      </svg>
      {/* Main circle */}
      <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-200 dark:shadow-green-900/30">
        <svg
          className="size-14 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  )
}

// ─── Confetti particle ───────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#6366F1",
  "#14B8A6",
]

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      w: number
      h: number
      color: string
      rotation: number
      rotationSpeed: number
      vx: number
      vy: number
      gravity: number
      opacity: number
    }> = []

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 1,
        gravity: 0.02 + Math.random() * 0.02,
        opacity: 1,
      })
    }

    let animId: number
    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let allDone = true
      for (const p of particles) {
        p.x += p.vx
        p.vy += p.gravity
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > canvas.height + 20) {
          p.opacity -= 0.02
        }
        if (p.opacity <= 0) continue
        allDone = false

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (!allDone) animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  )
}

// ─── Catch up overlay — confetti + "You're all caught up" ────────────────────

function CatchUpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/95 backdrop-blur-sm duration-300 fade-in">
      {/* Confetti */}
      <ConfettiCanvas />

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[70] rounded p-2 text-muted-foreground transition-colors hover:bg-accent"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Content card */}
      <div className="relative z-[65] w-full max-w-md animate-in rounded-xl border bg-background p-10 text-center shadow-xl duration-500 zoom-in-95">
        <div className="mb-6 flex justify-center">
          <GreenCheckmark />
        </div>
        <h2 className="mb-3 text-xl font-bold">You&apos;re all caught up</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thanks for{" "}
          <span className="cursor-help underline decoration-dotted">
            showing teams that you&apos;re paying attention
          </span>{" "}
          by{" "}
          <span className="cursor-help underline decoration-dotted">
            engaging with status updates
          </span>
          . See you next week!
        </p>
      </div>
    </div>
  )
}

// ─── Write updates overlay — full-screen like real Jira ──────────────────────

function WriteUpdatesOverlay({
  goals,
  onClose,
  onPublish,
  writeGoalId,
  setWriteGoalId,
  writeStatus,
  setWriteStatus,
  writeBody,
  setWriteBody,
}: {
  goals: GoalRow[]
  onClose: () => void
  onPublish: () => void
  writeGoalId: string
  setWriteGoalId: (v: string) => void
  writeStatus: string
  setWriteStatus: (v: string) => void
  writeBody: string
  setWriteBody: (v: string) => void
}) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [showPending, setShowPending] = useState(true)
  const pendingGoals = goals.filter((g) =>
    showPending ? true : g.status !== "PENDING" && g.status !== "PAUSED"
  )
  const dueGoals = pendingGoals.filter(
    (g) => g.status !== "DONE" && g.status !== "CANCELLED"
  )
  const hasGoalSelected = writeGoalId && writeBody.trim()

  return (
    <div className="fixed inset-0 z-50 animate-in bg-background/95 backdrop-blur-sm duration-300 fade-in">
      {/* Top bar */}
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        {/* Three-dot menu with Update filtering */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-accent"
          >
            <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </button>
          {filterOpen && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute top-full right-0 z-10 mt-1 w-64 rounded-lg border bg-popover p-4 shadow-lg">
                <h3 className="mb-2 text-sm font-semibold">Update filtering</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Show{" "}
                    <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      PENDING
                    </span>{" "}
                    and{" "}
                    <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      PAUSED
                    </span>
                  </span>
                  <button
                    onClick={() => setShowPending(!showPending)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${showPending ? "bg-blue-600" : "bg-muted-foreground/30"}`}
                  >
                    <span
                      className={`inline-block size-3.5 rounded-full bg-white transition-transform ${showPending ? "translate-x-[18px]" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded p-2 text-muted-foreground transition-colors hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex h-full items-center justify-center">
        {dueGoals.length === 0 && !hasGoalSelected ? (
          /* No updates due — show green checkmark like real Jira */
          <div className="w-full max-w-lg animate-in px-6 text-center duration-500 zoom-in-95">
            <div className="mb-8 flex justify-center">
              <GreenCheckmark />
            </div>
            <h2 className="mb-4 text-xl font-bold">
              You don&apos;t have any updates due in the next 7 days
            </h2>
            <p className="mb-2 text-sm text-muted-foreground">
              Expecting to see updates? Try changing{" "}
              <button
                onClick={() => setFilterOpen(true)}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Update Filters
              </button>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We recommend writing your project and goal updates on Friday,
              ready for the team to read on Monday.{" "}
              <span className="cursor-pointer text-blue-600 hover:underline">
                Learn more about The Loop
                <svg
                  className="ml-0.5 inline size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </span>
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-md border px-6 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Done
            </button>
          </div>
        ) : (
          /* Has goals to update — show the write form */
          <div className="w-full max-w-lg animate-in px-6 duration-500 slide-in-from-bottom-4">
            <div className="rounded-xl border bg-background p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-bold">Write your update</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Goal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={writeGoalId}
                    onChange={(e) => setWriteGoalId(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">Select a goal...</option>
                    {dueGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {[
                      {
                        value: "ON TRACK",
                        label: "On track",
                        color: "bg-green-500",
                      },
                      {
                        value: "AT RISK",
                        label: "At risk",
                        color: "bg-yellow-400",
                      },
                      {
                        value: "OFF TRACK",
                        label: "Off track",
                        color: "bg-red-500",
                      },
                    ].map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setWriteStatus(s.value)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${writeStatus === s.value ? "border-blue-600 bg-blue-50 font-medium dark:bg-blue-900/20" : "hover:bg-accent"}`}
                      >
                        <span className={`size-2 rounded-full ${s.color}`} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Update <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={writeBody}
                    onChange={(e) => setWriteBody(e.target.value)}
                    placeholder="Share what's happening with this goal..."
                    rows={4}
                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  disabled={!writeGoalId || !writeBody.trim()}
                  onClick={onPublish}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  Publish update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
