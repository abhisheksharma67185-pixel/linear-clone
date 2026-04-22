"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import type { Issue, Project } from "@/app/lib/mock-data"
import { formatStatus } from "@/lib/badge-styles"

const yourApps = [
  {
    name: "Assets",
    instance: "abhisheksharma67185",
    href: "/dashboard",
    icon: (
      <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
        <svg
          className="size-5 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
    ),
  },
  {
    name: "Customer Service Mana...",
    instance: "abhisheksharma67185",
    href: "/dashboard",
    icon: (
      <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
        <svg
          className="size-5 text-orange-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </div>
    ),
  },
  {
    name: "Goals",
    instance: "abhisheksharma67185",
    href: "/goals",
    icon: (
      <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
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
    ),
  },
  {
    name: "Jira",
    instance: "abhisheksharma67185",
    href: "/dashboard",
    icon: (
      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-5 text-white" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`
}

const STATUS_BADGE: Record<string, string> = {
  to_do: "bg-gray-100 text-gray-700 border border-gray-300",
  in_progress: "bg-blue-100 text-blue-700 border border-blue-300",
  in_review: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  done: "bg-green-100 text-green-700 border border-green-300",
}

export default function HomePage() {
  const [visitedTab, setVisitedTab] = useState<"work" | "teams">("work")
  const [nextTab, setNextTab] = useState<"worked" | "viewed">("worked")
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [projectMap, setProjectMap] = useState<Map<string, Project>>(new Map())

  const { dayName, monthDay } = useMemo(() => {
    const today = new Date()
    return {
      dayName: today.toLocaleDateString("en-US", { weekday: "long" }),
      monthDay: today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ]).then(([issues, projects]: [Issue[], Project[]]) => {
      setProjectMap(new Map(projects.map((p) => [p.id, p])))
      const sorted = [...issues].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setRecentIssues(sorted.slice(0, 5))
    })
  }, [])

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Banner */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#0052CC] via-[#2684FF] to-[#4C9AFF] px-8 py-8 text-white">
        <div className="relative z-10">
          <p className="text-sm opacity-90">
            {dayName}, {monthDay}
          </p>
          <h1 className="mt-1 text-2xl font-bold">Hello, Abhishek Sharma</h1>
        </div>

        {/* Illustration — person working at desk with monitor and plant */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-90">
          <svg className="h-32 w-52" viewBox="0 0 220 130" fill="none">
            {/* Desk */}
            <rect
              x="40"
              y="85"
              width="140"
              height="6"
              rx="3"
              fill="white"
              fillOpacity="0.35"
            />
            <rect
              x="60"
              y="91"
              width="6"
              height="30"
              rx="2"
              fill="white"
              fillOpacity="0.25"
            />
            <rect
              x="154"
              y="91"
              width="6"
              height="30"
              rx="2"
              fill="white"
              fillOpacity="0.25"
            />

            {/* Monitor */}
            <rect
              x="80"
              y="45"
              width="60"
              height="38"
              rx="4"
              fill="white"
              fillOpacity="0.3"
            />
            <rect
              x="84"
              y="49"
              width="52"
              height="28"
              rx="2"
              fill="white"
              fillOpacity="0.15"
            />
            <rect
              x="105"
              y="83"
              width="10"
              height="5"
              rx="1"
              fill="white"
              fillOpacity="0.25"
            />
            {/* Screen content lines */}
            <rect
              x="89"
              y="55"
              width="30"
              height="3"
              rx="1.5"
              fill="white"
              fillOpacity="0.3"
            />
            <rect
              x="89"
              y="62"
              width="42"
              height="3"
              rx="1.5"
              fill="white"
              fillOpacity="0.2"
            />
            <rect
              x="89"
              y="69"
              width="25"
              height="3"
              rx="1.5"
              fill="white"
              fillOpacity="0.25"
            />
            {/* Blue accent on screen */}
            <rect
              x="122"
              y="55"
              width="10"
              height="3"
              rx="1.5"
              fill="#60A5FA"
              fillOpacity="0.6"
            />

            {/* Person — sitting */}
            {/* Head */}
            <circle cx="55" cy="42" r="10" fill="white" fillOpacity="0.4" />
            {/* Body */}
            <rect
              x="47"
              y="52"
              width="16"
              height="20"
              rx="5"
              fill="white"
              fillOpacity="0.35"
            />
            {/* Arm reaching to keyboard */}
            <path
              d="M63 60 Q72 62 80 68"
              stroke="white"
              strokeOpacity="0.35"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Keyboard */}
            <rect
              x="78"
              y="78"
              width="30"
              height="6"
              rx="2"
              fill="white"
              fillOpacity="0.2"
            />

            {/* Coffee mug */}
            <rect
              x="150"
              y="72"
              width="12"
              height="13"
              rx="3"
              fill="white"
              fillOpacity="0.25"
            />
            <path
              d="M162 75 Q167 75 167 80 Q167 85 162 85"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="2"
              fill="none"
            />
            {/* Steam */}
            <path
              d="M154 70 Q155 66 156 68 Q157 64 158 67"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Plant */}
            <rect
              x="175"
              y="72"
              width="10"
              height="14"
              rx="3"
              fill="white"
              fillOpacity="0.2"
            />
            <circle cx="180" cy="66" r="8" fill="white" fillOpacity="0.15" />
            <circle cx="175" cy="62" r="5" fill="white" fillOpacity="0.12" />
            <circle cx="186" cy="63" r="5" fill="white" fillOpacity="0.12" />
            {/* Leaf detail */}
            <path
              d="M180 66 L180 74"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />

            {/* Floating decorative elements */}
            <circle cx="30" cy="25" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="195" cy="30" r="4" fill="white" fillOpacity="0.12" />
            <rect
              x="15"
              y="60"
              width="12"
              height="3"
              rx="1.5"
              fill="white"
              fillOpacity="0.1"
              transform="rotate(-20 21 61.5)"
            />
            <rect
              x="200"
              y="55"
              width="10"
              height="3"
              rx="1.5"
              fill="white"
              fillOpacity="0.1"
              transform="rotate(15 205 56.5)"
            />
          </svg>
        </div>

        <Link
          href="/products"
          className="absolute right-4 bottom-3 z-10 flex items-center gap-1 text-xs opacity-80 transition-opacity hover:opacity-100"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Play of the day - Sparring
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
      </div>

      {/* Your apps */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Your apps</h2>
          <Link
            href="/home/apps"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all apps
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {yourApps.map((app) => (
            <Link
              key={app.name}
              href={app.href}
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              {app.icon}
              <div>
                <p className="text-sm font-medium">{app.name}</p>
                <p className="text-xs text-muted-foreground">{app.instance}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Frequently visited */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Frequently visited</h2>
          <div className="flex rounded-md border">
            <button
              onClick={() => setVisitedTab("work")}
              className={`rounded-l-md px-3 py-1 text-sm font-medium transition-colors ${visitedTab === "work" ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Your work
            </button>
            <button
              onClick={() => setVisitedTab("teams")}
              className={`rounded-r-md px-3 py-1 text-sm font-medium transition-colors ${visitedTab === "teams" ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Teams
            </button>
          </div>
        </div>
        {visitedTab === "work" ? (
          <div className="rounded-lg border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              You haven&apos;t visited any places yet. Visit and view your
              team&apos;s spaces to start seeing your work.
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <div className="flex">
              <div className="flex-1 p-6">
                <h3 className="mb-2 text-base font-semibold">
                  Join a team to add team spaces
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  Once you&apos;re on a team, you can add shortcuts to the
                  places where your team works. Find a team in the directory, or
                  create a new team to get started.
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href="/teams"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Create a new team
                  </Link>
                  <Link
                    href="/teams/directory"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Browse teams
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What's next */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">What&apos;s next</h2>
          <div className="flex rounded-md border">
            <button
              onClick={() => setNextTab("worked")}
              className={`rounded-l-md px-3 py-1 text-sm font-medium transition-colors ${nextTab === "worked" ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Worked on
            </button>
            <button
              onClick={() => setNextTab("viewed")}
              className={`rounded-r-md px-3 py-1 text-sm font-medium transition-colors ${nextTab === "viewed" ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Viewed
            </button>
          </div>
        </div>

        {(() => {
          const displayIssues =
            nextTab === "worked" ? recentIssues : [...recentIssues].reverse()

          return displayIssues.length > 0 ? (
            <div>
              <p className="mb-3 text-xs text-muted-foreground">
                {nextTab === "worked" ? "This week" : "Recently viewed"}
              </p>
              <div className="flex flex-col">
                {displayIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/issue/${issue.key}`}
                    className="flex items-center gap-3 rounded-md border-b px-2 py-3 transition-colors last:border-b-0 hover:bg-accent/50"
                  >
                    <div className="shrink-0">
                      {issue.type === "bug" ? (
                        <svg
                          className="size-6 text-red-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      ) : issue.type === "story" ? (
                        <svg
                          className="size-6 text-green-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M5 2h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v16h12V4H6z" />
                        </svg>
                      ) : (
                        <svg
                          className="size-6 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {issue.summary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {issue.type.charAt(0).toUpperCase() +
                          issue.type.slice(1)}{" "}
                        &middot;{" "}
                        {projectMap.get(issue.projectId)?.name ?? "Project"}{" "}
                        &middot; {issue.key}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[issue.status] || STATUS_BADGE.to_do}`}
                      >
                        {formatStatus(issue.status)}
                      </span>
                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                        {timeAgo(issue.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/dashboard"
                className="mt-3 inline-block rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                View all
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                You&apos;re all done for now. Check back soon to find out
                what&apos;s next.
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
