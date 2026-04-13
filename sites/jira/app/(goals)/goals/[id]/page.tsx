"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const goalsData: Record<string, {
  name: string
  status: string
  statusColor: string
  progress: number
  description: string
  owner: { name: string; initials: string }
  targetDate: string
  team: string
  projects: { name: string; key: string; status: string }[]
}> = {
  "1": {
    name: "Increase platform uptime to 99.9%",
    status: "ON TRACK",
    statusColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    progress: 72,
    description: "Ensure production systems maintain 99.9% uptime through improved monitoring, automated failovers, and infrastructure redundancy.",
    owner: { name: "Abhishek Sharma", initials: "AS" },
    targetDate: "Jun 2026",
    team: "Engineering",
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
    ],
  },
  "2": {
    name: "Reduce customer churn by 15%",
    status: "AT RISK",
    statusColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    progress: 38,
    description: "Improve customer retention through better onboarding, proactive support, and feature adoption tracking across all tiers.",
    owner: { name: "Sam Williams", initials: "SW" },
    targetDate: "Sep 2026",
    team: "Product",
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
  "3": {
    name: "Launch mobile app v2.0",
    status: "ON TRACK",
    statusColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    progress: 55,
    description: "Deliver the next major version of the mobile app with offline mode, push notifications, and redesigned navigation.",
    owner: { name: "Jordan Lee", initials: "JL" },
    targetDate: "Jul 2026",
    team: "Engineering",
    projects: [
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
  "4": {
    name: "Migrate infrastructure to Kubernetes",
    status: "PENDING",
    statusColor: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    progress: 10,
    description: "Move all production workloads from EC2 to a managed Kubernetes cluster for better scaling and deployment automation.",
    owner: { name: "Taylor Brown", initials: "TB" },
    targetDate: "Dec 2026",
    team: "Engineering",
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
    ],
  },
  "5": {
    name: "Achieve SOC 2 Type II compliance",
    status: "AT RISK",
    statusColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    progress: 45,
    description: "Complete all SOC 2 Type II audit requirements including access controls, encryption, incident response, and vendor management.",
    owner: { name: "Abhishek Sharma", initials: "AS" },
    targetDate: "Aug 2026",
    team: "Engineering",
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
    ],
  },
  "6": {
    name: "Grow monthly active users to 50K",
    status: "OFF TRACK",
    statusColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    progress: 22,
    description: "Drive user acquisition and activation through marketing campaigns, referral programs, and product-led growth initiatives.",
    owner: { name: "Sam Williams", initials: "SW" },
    targetDate: "Oct 2026",
    team: "Product",
    projects: [
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
  "7": {
    name: "Reduce average API response time below 200ms",
    status: "DONE",
    statusColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    progress: 100,
    description: "Optimize database queries, add caching layers, and refactor hot paths to bring p95 API latency under 200ms.",
    owner: { name: "Jordan Lee", initials: "JL" },
    targetDate: "Apr 2026",
    team: "Engineering",
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
    ],
  },
  "8": {
    name: "Ship redesigned onboarding flow",
    status: "ON TRACK",
    statusColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    progress: 68,
    description: "Redesign the first-time user experience with guided setup, interactive tutorials, and personalized workspace configuration.",
    owner: { name: "Taylor Brown", initials: "TB" },
    targetDate: "May 2026",
    team: "Design",
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
}

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>()
  const goalId = params.id
  const goal = goalsData[goalId]
  const [activeTab, setActiveTab] = useState("overview")
  const [following, setFollowing] = useState(true)
  const [commentBody, setCommentBody] = useState("")
  const [comments, setComments] = useState<Array<{ id: string; author: string; body: string; time: string }>>([])
  const postComment = () => {
    const text = commentBody.trim()
    if (!text) return
    setComments((prev) => [...prev, { id: `c-${Date.now()}`, author: "Abhishek Sharma", body: text, time: "Just now" }])
    setCommentBody("")
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
        <p>Goal not found.</p>
        <Link href="/goals" className="mt-2 text-blue-600 hover:underline">Back to goals</Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/goals" className="hover:text-foreground hover:underline">Goals</Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5" /></svg>
        <span className="text-foreground">{goal.name}</span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + status badge */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 mt-0.5 shrink-0">
                <svg className="size-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{goal.name}</h1>
                  <Badge className={`shrink-0 text-[10px] font-bold uppercase ${goal.statusColor}`}>{goal.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{goal.description}</p>
          </div>

          {/* Tabs — overview / projects */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Linked projects ({goal.projects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2"><span className="font-medium text-foreground">Team:</span> {goal.team}</div>
                <div className="flex items-center gap-2"><span className="font-medium text-foreground">Owner:</span> {goal.owner.name}</div>
                <div className="flex items-center gap-2"><span className="font-medium text-foreground">Target:</span> {goal.targetDate}</div>
                <div className="flex items-center gap-2"><span className="font-medium text-foreground">Projects:</span> {goal.projects.length} linked</div>
              </div>
            </TabsContent>

            <TabsContent value="projects">
              {goal.projects.length === 0 ? (
                <div className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">No linked projects.</div>
              ) : (
                <div className="rounded-lg border">
                  {goal.projects.map((project) => (
                    <Link key={project.key} href={`/projects/${project.key}/board`} className="flex items-center justify-between border-b last:border-b-0 px-4 py-3 hover:bg-accent/50 transition-colors">
                      <span className="text-sm font-medium">{project.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">{project.key}</span>
                        <Badge variant="outline" className="text-[10px] border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400">{project.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Activity / Comments */}
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold mb-3">Activity ({comments.length})</h3>
            <div className="space-y-3 mb-4">
              {comments.length === 0 && <p className="text-sm text-muted-foreground py-2">No activity yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{c.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.author}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <div className="rounded-md border bg-muted/30 px-3 py-2">
                      <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Comment form */}
            <div className="flex gap-3">
              <Avatar className="size-7 shrink-0 mt-0.5">
                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">A</AvatarFallback>
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
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[70px] resize-none outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘" : "Ctrl"}+Enter to submit
                  </span>
                  <button
                    type="button"
                    onClick={() => { postComment() }}
                    disabled={!commentBody.trim()}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground block mb-2">Status</span>
            <Badge className={`text-xs font-bold uppercase ${goal.statusColor}`}>{goal.status}</Badge>
          </div>

          {/* Progress */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold">{goal.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>

          {/* Owner */}
          <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground block mb-2">Owner</span>
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-blue-600 text-[10px] font-semibold text-white">{goal.owner.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{goal.owner.name}</span>
            </div>
          </div>

          {/* Team */}
          <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground block mb-2">Team</span>
            <span className="text-sm font-medium">{goal.team}</span>
          </div>

          {/* Target date */}
          <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground block mb-2">Target date</span>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span className="text-sm font-medium">{goal.targetDate}</span>
            </div>
          </div>

          {/* Following toggle */}
          <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground block mb-2">Following</span>
            <button
              onClick={() => setFollowing(!following)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors w-full ${
                following
                  ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-muted text-muted-foreground hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>

          {/* Linked projects count */}
          <div className="rounded-lg border p-4">
            <span className="text-xs text-muted-foreground block mb-2">Linked projects</span>
            <span className="text-sm font-medium">{goal.projects.length} project{goal.projects.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
