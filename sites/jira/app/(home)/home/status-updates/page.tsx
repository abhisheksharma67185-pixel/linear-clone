"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const projectUpdates = [
  {
    project: "Space shuttle autopilot AI",
    emoji: "🍉",
    author: "Lia Arroyo",
    initials: "LA",
    color: "bg-purple-200",
    time: "3 days ago",
    status: "ON TRACK",
    statusColor: "bg-green-100 text-green-800",
    period: "February",
    items: [
      "🏆 Developed a basic autopilot algorithm that can control the shuttle's velocity, altitude, and orientation.",
      "🔍 Currently researching and studying existing competitor autopilot systems. More info next week.",
      "🍉 More on how the algorithm works",
    ],
    comments: [
      {
        author: "Omar Darboe",
        initials: "OD",
        color: "bg-green-200",
        time: "edited 2 days ago",
        text: "So exciting team! Lovely work",
      },
      {
        author: "Jane Rotanson",
        initials: "JR",
        color: "bg-blue-200",
        time: "3 days ago",
        text: "Huge accomplishment! Excited to test this in person.",
      },
    ],
  },
  {
    project: "Sales enablement for pilot launch",
    emoji: "🍉",
    author: "Omar Darboe",
    initials: "OD",
    color: "bg-green-200",
    time: "3 days ago",
    status: "AT RISK",
    statusColor: "bg-yellow-100 text-yellow-800",
    period: "February",
    items: [
      "✅ The pitch deck is finally complete!",
      "▶️ Share with sales team",
    ],
    learnings:
      "We found that physical training fostered a sense of teamwork & cooperation among the crew.",
    comments: [],
  },
  {
    project: "Crew training",
    emoji: "🍉",
    author: "Lia Arroyo",
    initials: "LA",
    color: "bg-purple-200",
    time: "3 days ago",
    status: "COMPLETED",
    statusColor: "bg-green-100 text-green-800",
    period: "",
    items: [
      "👏 Astronauts have started a rigorous exercise program to maintain their strength and endurance.",
      "🧪 Extensive psychological screening has begun for all astronauts. This will be followed up by extensive training in stress management, team dynamics, and problem-solving.",
    ],
    comments: [],
  },
]

const statusStats = [
  {
    count: 1,
    label: "On track",
    change: "-2 from last week",
    color: "text-green-600",
  },
  {
    count: 1,
    label: "At risk",
    change: "+1 from last week",
    color: "text-yellow-600",
  },
  { count: 1, label: "Off track", change: "No change", color: "text-red-600" },
  {
    count: 0,
    label: "No update",
    change: "No change",
    color: "text-muted-foreground",
  },
  {
    count: 0,
    label: "Cancelled",
    change: "No change",
    color: "text-muted-foreground",
  },
  {
    count: 1,
    label: "Completed 🎉",
    change: "+1 from last week",
    color: "text-muted-foreground",
  },
]

const goalStats = [
  {
    count: 1,
    label: "On track",
    change: "+1 from last month",
    color: "text-green-600",
  },
  { count: 0, label: "At risk", change: "No change", color: "text-yellow-600" },
  { count: 1, label: "Off track", change: "No change", color: "text-red-600" },
  {
    count: 0,
    label: "No update",
    change: "-1 from last month",
    color: "text-muted-foreground",
  },
  {
    count: 0,
    label: "Cancelled",
    change: "No change",
    color: "text-muted-foreground",
  },
  {
    count: 0,
    label: "Completed 🎉",
    change: "No change",
    color: "text-muted-foreground",
  },
]

function ProjectCard({ update }: { update: (typeof projectUpdates)[0] }) {
  const [following, setFollowing] = useState(true)
  const [shared, setShared] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  return (
    <div className="rounded-lg border">
      {/* Project header */}
      <div className="border-b px-5 py-3">
        <p className="text-xs text-muted-foreground">Project</p>
        <p className="text-sm font-medium">{update.project}</p>
      </div>

      {/* Author + status */}
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback
                className={`${update.color} text-[10px] font-semibold`}
              >
                {update.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-medium">{update.author}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {update.time}
              </span>
            </div>
          </div>
          {update.status && update.period && (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`rounded px-1.5 py-0.5 font-bold ${update.statusColor}`}
              >
                {update.status}
              </span>
              <span className="text-muted-foreground">for</span>
              <span className="flex items-center gap-1 rounded border px-1.5 py-0.5">
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
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {update.period}
              </span>
            </div>
          )}
          {update.status === "COMPLETED" && (
            <span className="text-xs font-bold text-muted-foreground">
              COMPLETED 🎉
            </span>
          )}
        </div>

        {/* Content items */}
        <div className="space-y-1.5">
          {update.items.map((item, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {item}
            </p>
          ))}
        </div>

        {/* Learnings */}
        {update.learnings && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold">New learnings</h4>
            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3">
              <span>💡</span>
              <p className="text-sm text-muted-foreground">
                {update.learnings}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => setShared(!shared)}
            className={
              shared ? "font-medium text-blue-600" : "hover:text-foreground"
            }
          >
            {shared ? "Shared!" : "Share"}
          </button>
          <span>&middot;</span>
          <button
            onClick={() => setFollowing(!following)}
            className="hover:text-foreground"
          >
            {following ? "Unfollow" : "Follow"}
          </button>
        </div>

        {/* Comments */}
        {update.comments.length > 0 && (
          <div className="mt-4 space-y-3 border-t pt-4">
            {update.comments.map((comment, i) => (
              <div key={i} className="flex items-start gap-2">
                <Avatar className="size-6">
                  <AvatarFallback
                    className={`${comment.color} text-[9px] font-semibold`}
                  >
                    {comment.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs">
                    <span className="font-medium">{comment.author}</span>
                    <span className="ml-1 text-muted-foreground">
                      {comment.time}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {comment.text}
                  </p>
                  <button
                    onClick={() => setReplyingTo(replyingTo === i ? null : i)}
                    className={`text-xs ${replyingTo === i ? "text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {replyingTo === i ? "Cancel" : "Reply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <Avatar className="size-6">
            <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">
              AS
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">
            Add a comment... ask a question
          </p>
        </div>
      </div>
    </div>
  )
}

function CatchUpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
      {/* Confetti background - deterministic positions to avoid hydration mismatch */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => {
          const colors = [
            "bg-blue-400",
            "bg-pink-300",
            "bg-yellow-400",
            "bg-green-400",
            "bg-purple-400",
            "bg-cyan-300",
            "bg-orange-300",
            "bg-red-300",
          ]
          const shapes = ["rounded-full", "rounded-sm", "rounded-none"]
          const color = colors[i % colors.length]
          const shape = shapes[i % shapes.length]
          const seed = (i * 137 + 43) % 100
          const size = 4 + (seed / 100) * 8
          const left = (i * 31 + 17) % 100
          const top = (i * 53 + 7) % 100
          const rotation = (i * 67 + 23) % 360
          return (
            <div
              key={i}
              className={`absolute ${color} ${shape} opacity-60`}
              style={{
                width: size,
                height: size * (shape === "rounded-none" ? 2.5 : 1),
                left: `${left}%`,
                top: `${top}%`,
                transform: `rotate(${rotation}deg)`,
              }}
            />
          )
        })}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 rounded p-1.5 text-muted-foreground hover:bg-accent"
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

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl border bg-background px-8 py-12 text-center shadow-lg">
        {/* Checkmark */}
        <div className="mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500">
          <svg
            className="size-16 text-white"
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
        {/* Sparkles */}
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2">
          <svg className="size-64" viewBox="0 0 200 200" fill="none">
            <path d="M60 30L63 40L60 50L57 40Z" fill="#5EEAD4" />
            <path d="M140 40L143 50L140 60L137 50Z" fill="#5EEAD4" />
            <path d="M150 150L153 160L150 170L147 160Z" fill="#5EEAD4" />
          </svg>
        </div>

        <h2 className="mb-3 text-xl font-bold">You&apos;re all caught up</h2>
        <p className="text-sm text-muted-foreground">
          Thanks for{" "}
          <span className="text-blue-600 underline">
            showing teams that you&apos;re paying attention
          </span>{" "}
          by engaging with status updates. See you next week!
        </p>
      </div>
    </div>
  )
}

function WriteUpdatesOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Top right buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button className="rounded p-1.5 text-muted-foreground hover:bg-accent">
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent"
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

      {/* Card */}
      <div className="w-full max-w-2xl rounded-xl border bg-background px-8 py-12 text-center shadow-lg">
        {/* Checkmark */}
        <div className="mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500">
          <svg
            className="size-16 text-white"
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
        {/* Sparkles */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2">
          <svg className="size-48" viewBox="0 0 200 200" fill="none">
            <path d="M60 20L63 30L60 40L57 30Z" fill="#5EEAD4" />
            <path d="M140 30L143 40L140 50L137 40Z" fill="#5EEAD4" />
            <path d="M150 140L153 150L150 160L147 150Z" fill="#5EEAD4" />
          </svg>
        </div>

        <h2 className="mb-4 text-xl font-bold">
          You don&apos;t have any updates due in the next 7 days
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Expecting to see updates? Try changing{" "}
          <Button variant="outline" size="sm" className="mx-1">
            Update Filters
          </Button>
        </p>

        <p className="mb-6 text-sm text-muted-foreground">
          We recommend writing your project and goal updates on Friday, ready
          for the team to read on Monday.{" "}
          <Link
            href="/home/status-updates"
            className="inline-flex items-center gap-0.5 text-blue-600 underline"
          >
            Learn more about The Loop
            <svg
              className="size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>
        </p>

        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

const weekLabels = ["3 weeks ago", "2 weeks ago", "Last week", "This week"]
const monthLabels = ["January", "February", "March", "April", "May", "June"]

export default function StatusUpdatesPage() {
  const [tab, setTab] = useState<"projects" | "goals" | "saved">("projects")
  const [catchUpOpen, setCatchUpOpen] = useState(false)
  const [writeOpen, setWriteOpen] = useState(false)
  const [weekIdx, setWeekIdx] = useState(2)
  const [monthIdx, setMonthIdx] = useState(3)
  const [starred, setStarred] = useState(true)

  return (
    <>
      {catchUpOpen && <CatchUpOverlay onClose={() => setCatchUpOpen(false)} />}
      {writeOpen && <WriteUpdatesOverlay onClose={() => setWriteOpen(false)} />}
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Status updates</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCatchUpOpen(true)}
            >
              Catch up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWriteOpen(true)}
            >
              Write updates
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-6 border-b">
          <button
            onClick={() => setTab("projects")}
            className={`pb-2.5 text-sm font-medium transition-colors ${tab === "projects" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            Projects
          </button>
          <button
            onClick={() => setTab("goals")}
            className={`pb-2.5 text-sm font-medium transition-colors ${tab === "goals" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            Goals
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`flex items-center gap-1.5 pb-2.5 text-sm font-medium transition-colors ${tab === "saved" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
              <path d="M14 8h4" />
              <path d="M14 12h4" />
              <path d="M14 16h4" />
            </svg>
            abhisheksharma67185
          </button>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1">
            {tab === "saved" ? (
              <>
                {/* Saved view header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="size-6 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18" />
                      <path d="M14 8h4" />
                      <path d="M14 12h4" />
                      <path d="M14 16h4" />
                    </svg>
                    <h2 className="text-xl font-bold">abhisheksharma67185</h2>
                    <button
                      onClick={() => setStarred(!starred)}
                      className="transition-colors"
                    >
                      {starred ? (
                        <svg
                          className="size-5 text-yellow-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ) : (
                        <svg
                          className="size-5 text-muted-foreground hover:text-yellow-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <Link
                    href="/project-directory"
                    className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    See directory view
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </div>

                <h3 className="mb-4 text-base font-semibold">
                  Latest goal updates
                </h3>

                {/* Empty state */}
                <div className="flex flex-col items-center py-8">
                  <svg
                    className="mb-6 size-48"
                    viewBox="0 0 200 200"
                    fill="none"
                  >
                    <rect
                      x="30"
                      y="60"
                      width="140"
                      height="120"
                      rx="8"
                      fill="#f4f5f7"
                    />
                    <rect
                      x="40"
                      y="80"
                      width="80"
                      height="6"
                      rx="3"
                      fill="#dfe1e6"
                    />
                    <rect
                      x="40"
                      y="95"
                      width="60"
                      height="6"
                      rx="3"
                      fill="#dfe1e6"
                    />
                    <rect
                      x="40"
                      y="110"
                      width="100"
                      height="6"
                      rx="3"
                      fill="#dfe1e6"
                    />
                    <rect
                      x="40"
                      y="125"
                      width="40"
                      height="6"
                      rx="3"
                      fill="#dfe1e6"
                    />
                    <rect
                      x="40"
                      y="140"
                      width="70"
                      height="6"
                      rx="3"
                      fill="#dfe1e6"
                    />
                    <circle cx="50" cy="72" r="8" fill="#4FC3F7" />
                    <circle cx="65" cy="165" r="10" fill="#F5A623" />
                    <rect
                      x="55"
                      y="173"
                      width="20"
                      height="15"
                      rx="4"
                      fill="#F5A623"
                    />
                    <rect
                      x="58"
                      y="130"
                      width="24"
                      height="20"
                      rx="10"
                      fill="#F5A623"
                    />
                    <rect
                      x="62"
                      y="136"
                      width="16"
                      height="3"
                      rx="1.5"
                      fill="white"
                    />
                    <rect
                      x="62"
                      y="142"
                      width="10"
                      height="3"
                      rx="1.5"
                      fill="white"
                    />
                    <rect
                      x="130"
                      y="50"
                      width="50"
                      height="20"
                      rx="6"
                      fill="#26A69A"
                    />
                    <rect
                      x="135"
                      y="55"
                      width="30"
                      height="4"
                      rx="2"
                      fill="white"
                      opacity="0.5"
                    />
                    <line
                      x1="145"
                      y1="70"
                      x2="145"
                      y2="160"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <line
                      x1="160"
                      y1="70"
                      x2="160"
                      y2="160"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <line
                      x1="145"
                      y1="85"
                      x2="160"
                      y2="85"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <line
                      x1="145"
                      y1="100"
                      x2="160"
                      y2="100"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <line
                      x1="145"
                      y1="115"
                      x2="160"
                      y2="115"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <line
                      x1="145"
                      y1="130"
                      x2="160"
                      y2="130"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <line
                      x1="145"
                      y1="145"
                      x2="160"
                      y2="145"
                      stroke="#253858"
                      strokeWidth="2"
                    />
                    <circle cx="152" cy="68" r="6" fill="#7C4DFF" />
                    <rect
                      x="147"
                      y="74"
                      width="10"
                      height="12"
                      rx="3"
                      fill="#7C4DFF"
                    />
                  </svg>

                  <h3 className="mb-2 text-center text-lg font-bold">
                    No one wrote any updates?!
                  </h3>
                  <p className="max-w-lg text-center text-sm text-muted-foreground">
                    Oh no, we couldn&apos;t find any updates to show you for
                    this view 😔
                  </p>
                  <p className="mt-1 max-w-lg text-center text-sm text-muted-foreground">
                    Project and goal owners need to know someone&apos;s
                    listening to invest time in writing updates.
                  </p>
                  <p className="mt-1 max-w-lg text-center text-sm text-muted-foreground">
                    Learn how you can encourage more effective team-to-team
                    communication via{" "}
                    <Link
                      href="/home/status-updates"
                      className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                    >
                      The Loop framework
                      <svg
                        className="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </Link>
                  </p>
                </div>
              </>
            ) : tab === "projects" ? (
              <>
                {/* Info banner */}
                <div className="mb-6 rounded-lg border bg-muted/30 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📋</span>
                    <div>
                      <p className="text-sm font-semibold">
                        There aren&apos;t any new project updates to show yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Every Monday, this feed will show the latest updates
                        from projects and topics you follow.
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <Link href="/projects">
                          <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            size="sm"
                          >
                            Create project
                          </Button>
                        </Link>
                        <Link
                          href="/project-directory"
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          More about projects
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week navigation header */}
                <div className="mb-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}
                    className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                    disabled={weekIdx === 0}
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
                  <h3 className="w-32 text-center text-lg font-medium text-muted-foreground">
                    {weekLabels[weekIdx]}
                  </h3>
                  <button
                    onClick={() =>
                      setWeekIdx(Math.min(weekLabels.length - 1, weekIdx + 1))
                    }
                    className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                    disabled={weekIdx === weekLabels.length - 1}
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

                <p className="mb-4 text-sm text-muted-foreground">
                  You&apos;re following 4 active projects, here&apos;s the
                  breakdown.
                </p>

                {/* Stats grid */}
                <div className="mb-8 grid grid-cols-3 gap-3">
                  {statusStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border px-4 py-3"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${stat.color}`}>
                          {stat.count}
                        </span>
                        <span className="text-sm font-medium">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Project updates */}
                <div className="space-y-6">
                  {projectUpdates.map((update) => (
                    <ProjectCard key={update.project} update={update} />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Goals info banner */}
                <div className="mb-6 rounded-lg border bg-muted/30 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        On the 8th of each month, you&apos;ll see the latest
                        updates on goals and topics you follow in this feed.
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <Link href="/goals">
                          <Button
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            size="sm"
                          >
                            Create your first goal
                          </Button>
                        </Link>
                        <Link
                          href="/goals"
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          More about goals
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Month navigation header */}
                <div className="mb-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                    className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                    disabled={monthIdx === 0}
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
                  <h3 className="w-28 text-center text-lg font-medium text-muted-foreground">
                    {monthLabels[monthIdx]}
                  </h3>
                  <button
                    onClick={() =>
                      setMonthIdx(
                        Math.min(monthLabels.length - 1, monthIdx + 1)
                      )
                    }
                    className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                    disabled={monthIdx === monthLabels.length - 1}
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

                <p className="mb-4 text-sm text-muted-foreground">
                  You&apos;re following 2 active goals, here&apos;s the
                  breakdown.
                </p>

                {/* Goal stats grid */}
                <div className="mb-8 grid grid-cols-3 gap-3">
                  {goalStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border px-4 py-3"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${stat.color}`}>
                          {stat.count}
                        </span>
                        <span className="text-sm font-medium">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Goal update */}
                <div className="rounded-lg border">
                  <div className="border-b px-5 py-3">
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="text-sm font-medium">
                      Operate 42 commercial flights to space
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-indigo-200 text-[10px] font-semibold">
                            AH
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium">
                            Andy Harrell
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            4 days ago
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-800">
                          ON TRACK
                        </span>
                        <span className="text-muted-foreground">for</span>
                        <span className="flex items-center gap-1 rounded border px-1.5 py-0.5">
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
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Jan 2025
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted-foreground">
                        🚀 Kicking off our goal to launch 42 commercial space
                        flights by end of Q2 2025, generating $500 million in
                        revenue.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🏨 Partnership negotiations with Planetary Hotels
                        underways.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-56 shrink-0">
            {tab === "saved" ? (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Goals</h3>
                <Link
                  href="/goals"
                  className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="text-sm">uvvigigi</span>
                  </div>
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">
                      AS
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold">
                    {tab === "projects" ? "New projects" : "New goals"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-6 rounded bg-muted" />
                    <span>
                      {tab === "projects"
                        ? "No new projects this week"
                        : "No new goals this month"}
                    </span>
                    <div className="ml-auto size-4 rounded-full border" />
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    {tab === "projects"
                      ? "Completed projects"
                      : "Completed goals"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-6 rounded bg-muted" />
                    <span>
                      {tab === "projects"
                        ? "No completed projects this week"
                        : "No completed goals this month"}
                    </span>
                    <div className="ml-auto size-4 rounded-full border" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
