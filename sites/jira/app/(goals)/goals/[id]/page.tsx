"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useCustomFields } from "@/hooks/use-custom-fields"
import { CustomFieldCell } from "@/components/custom-field-cell"

const statusColors: Record<string, string> = {
  "ON TRACK":
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "AT RISK":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "OFF TRACK": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
}

interface GoalData {
  id: string
  name: string
  status: string
  progress: number
  targetDate: string
  owner: string
  team: string
  following: boolean
  createdAt: string
  ownerUser: {
    id: string
    name: string
    displayName?: string
    email: string
  } | null
}

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>()
  const goalId = params.id
  const { fields: customFields } = useCustomFields()

  const [goal, setGoal] = useState<GoalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [following, setFollowing] = useState(true)
  const [commentBody, setCommentBody] = useState("")
  const [comments, setComments] = useState<
    Array<{ id: string; author: string; body: string; time: string }>
  >([])
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    const archivedFallback: Record<string, GoalData> = {
      "arch-1": {
        id: "arch-1",
        name: "Reduce customer churn by 15%",
        status: "AT RISK",
        progress: 72,
        targetDate: "Sep 2026",
        owner: "usr-1",
        team: "Engineering",
        following: true,
        createdAt: "2025-12-01",
        ownerUser: {
          id: "usr-1",
          name: "Abhishek Sharma",
          displayName: "Abhishek Sharma",
          email: "abhishek@example.com",
        },
      },
      "arch-2": {
        id: "arch-2",
        name: "Complete infrastructure migration to AWS",
        status: "COMPLETED",
        progress: 100,
        targetDate: "Feb 2026",
        owner: "usr-pp",
        team: "Platform",
        following: true,
        createdAt: "2025-09-01",
        ownerUser: {
          id: "usr-pp",
          name: "Priya Patel",
          displayName: "Priya Patel",
          email: "priya@example.com",
        },
      },
      "arch-3": {
        id: "arch-3",
        name: "Launch mobile app v2.0",
        status: "CANCELLED",
        progress: 45,
        targetDate: "Jan 2026",
        owner: "usr-jc",
        team: "Mobile",
        following: false,
        createdAt: "2025-08-01",
        ownerUser: {
          id: "usr-jc",
          name: "James Chen",
          displayName: "James Chen",
          email: "james@example.com",
        },
      },
    }

    fetch("/api/data/goals")
      .then((r) => r.json())
      .then(async (goals: GoalData[]) => {
        const found =
          goals.find((g) => g.id === goalId) ?? archivedFallback[goalId]
        if (found) {
          setGoal(found)
          setFollowing(found.following)
        }
        setLoading(false)
        // Fetch field values
        try {
          const fvRes = await fetch(`/api/data/goals/${goalId}/field-values`)
          if (fvRes.ok) setFieldValues(await fvRes.json())
        } catch {
          /* silent */
        }
      })
      .catch(() => {
        const fallback = archivedFallback[goalId]
        if (fallback) {
          setGoal(fallback)
          setFollowing(fallback.following)
        }
        setLoading(false)
      })
  }, [goalId])

  const handleSaveFieldValue = async (fieldId: string, value: unknown) => {
    // Optimistic update
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
    await fetch(`/api/data/goals/${goalId}/field-values`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [fieldId]: value }),
    }).catch(() => null)
  }

  const postComment = () => {
    const text = commentBody.trim()
    if (!text) return
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "Abhishek Sharma",
        body: text,
        time: "Just now",
      },
    ])
    setCommentBody("")
  }

  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
        <p>Goal not found.</p>
        <Link href="/goals" className="mt-2 text-blue-600 hover:underline">
          Back to goals
        </Link>
      </div>
    )
  }

  const ownerName =
    goal.ownerUser?.displayName ?? goal.ownerUser?.name ?? "Unknown"
  const ownerInitials = ownerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const statusColor = statusColors[goal.status] ?? statusColors["PENDING"]

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/goals" className="hover:text-foreground hover:underline">
          Goals
        </Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 3l5 5-5 5" />
        </svg>
        <span className="text-foreground">{goal.name}</span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — main content */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <div className="mb-2 flex items-start gap-3">
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="size-5 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <h1 className="text-xl font-semibold">{goal.name}</h1>
                  <Badge
                    className={`shrink-0 text-[10px] font-bold uppercase ${statusColor}`}
                  >
                    {goal.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">
                Activity ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-2 rounded-lg border p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Team:</span>{" "}
                  {goal.team}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Owner:</span>{" "}
                  {ownerName}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Target:</span>{" "}
                  {goal.targetDate || "Not set"}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="rounded-lg border p-4">
                <div className="mb-4 space-y-3">
                  {comments.length === 0 && (
                    <p className="py-2 text-sm text-muted-foreground">
                      No activity yet.
                    </p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="mt-0.5 size-7 shrink-0">
                        <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {c.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {c.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {c.time}
                          </span>
                        </div>
                        <div className="rounded-md border bg-muted/30 px-3 py-2">
                          <p className="text-sm whitespace-pre-wrap">
                            {c.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Avatar className="mt-0.5 size-7 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          postComment()
                        }
                      }}
                      className="min-h-[70px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {typeof navigator !== "undefined" &&
                        /Mac/.test(navigator.userAgent)
                          ? "\u2318"
                          : "Ctrl"}
                        +Enter to submit
                      </span>
                      <button
                        type="button"
                        onClick={postComment}
                        disabled={!commentBody.trim()}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT — sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-lg border p-4">
            <span className="mb-2 block text-xs text-muted-foreground">
              Status
            </span>
            <Badge className={`text-xs font-bold uppercase ${statusColor}`}>
              {goal.status}
            </Badge>
          </div>

          {/* Progress */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold">{goal.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          {/* Owner */}
          <div className="rounded-lg border p-4">
            <span className="mb-2 block text-xs text-muted-foreground">
              Owner
            </span>
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-blue-600 text-[10px] font-semibold text-white">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{ownerName}</span>
            </div>
          </div>

          {/* Team */}
          <div className="rounded-lg border p-4">
            <span className="mb-2 block text-xs text-muted-foreground">
              Team
            </span>
            <span className="text-sm font-medium">{goal.team}</span>
          </div>

          {/* Target date */}
          <div className="rounded-lg border p-4">
            <span className="mb-2 block text-xs text-muted-foreground">
              Target date
            </span>
            <div className="flex items-center gap-2">
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-sm font-medium">
                {goal.targetDate || "Not set"}
              </span>
            </div>
          </div>

          {/* Following toggle */}
          <div className="rounded-lg border p-4">
            <span className="mb-2 block text-xs text-muted-foreground">
              Following
            </span>
            <button
              onClick={() => setFollowing(!following)}
              className={`w-full rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${following ? "border border-blue-200 bg-blue-50 text-blue-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:bg-blue-900/20 dark:text-blue-400" : "bg-muted text-muted-foreground hover:bg-blue-50 hover:text-blue-700"}`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4">
              <span className="block text-xs font-semibold tracking-wider text-[#626f86] uppercase">
                Custom fields
              </span>
              {customFields.map((cf) => (
                <div
                  key={cf.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-shrink-0">
                    <span
                      className="mb-1 block max-w-[100px] truncate text-xs text-[#626f86]"
                      title={cf.name}
                    >
                      {cf.name}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <CustomFieldCell
                      fieldId={cf.id}
                      goalId={goalId}
                      type={cf.type}
                      options={cf.options}
                      multi={cf.multi}
                      description={cf.description}
                      value={fieldValues[cf.id]}
                      onSave={handleSaveFieldValue}
                      detailView
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
