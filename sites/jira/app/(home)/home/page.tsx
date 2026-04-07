"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

const yourApps = [
  { name: "Goals", instance: "abhisheksharma67185", href: "/goals", icon: <div className="flex size-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30"><svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg></div> },
  { name: "Jira", instance: "abhisheksharma67185", href: "/dashboard", icon: <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700"><svg className="size-4 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg></div> },
  { name: "Projects", instance: "abhisheksharma67185", href: "/project-directory", icon: <div className="flex size-8 items-center justify-center rounded-md bg-pink-100 dark:bg-pink-900/30"><svg className="size-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div> },
  { name: "Teams", instance: "abhisheksharma67185", href: "/teams", icon: <div className="flex size-8 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30"><svg className="size-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div> },
]

export default function HomePage() {
  const [visitedTab, setVisitedTab] = useState<"work" | "teams">("work")
  const [nextTab, setNextTab] = useState<"worked" | "viewed">("worked")
  const { dayName, monthDay } = useMemo(() => {
    const today = new Date()
    return {
      dayName: today.toLocaleDateString("en-US", { weekday: "long" }),
      monthDay: today.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    }
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400 px-8 py-8 text-white">
        <div className="relative z-10">
          <p className="text-sm opacity-90">{dayName}, {monthDay}</p>
          <h1 className="mt-1 text-2xl font-bold">Hello, Abhishek Sharma</h1>
        </div>
        {/* Compass illustration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <svg className="size-36 opacity-80" viewBox="0 0 140 140" fill="none">
            <circle cx="70" cy="70" r="55" stroke="white" strokeWidth="3" opacity="0.3" />
            <circle cx="70" cy="70" r="45" stroke="white" strokeWidth="2" opacity="0.2" />
            <circle cx="70" cy="70" r="5" fill="white" opacity="0.5" />
            <line x1="70" y1="25" x2="70" y2="45" stroke="white" strokeWidth="2" opacity="0.4" />
            <line x1="70" y1="95" x2="70" y2="115" stroke="white" strokeWidth="2" opacity="0.4" />
            <line x1="25" y1="70" x2="45" y2="70" stroke="white" strokeWidth="2" opacity="0.4" />
            <line x1="95" y1="70" x2="115" y2="70" stroke="white" strokeWidth="2" opacity="0.4" />
            <text x="70" y="20" textAnchor="middle" fill="white" fontSize="10" opacity="0.5">N</text>
            <text x="70" y="128" textAnchor="middle" fill="white" fontSize="10" opacity="0.5">S</text>
            <text x="122" y="74" textAnchor="middle" fill="white" fontSize="10" opacity="0.5">E</text>
            <text x="18" y="74" textAnchor="middle" fill="white" fontSize="10" opacity="0.5">W</text>
            <line x1="70" y1="70" x2="60" y2="35" stroke="white" strokeWidth="2.5" />
            <line x1="70" y1="70" x2="95" y2="80" stroke="white" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1 text-xs opacity-80">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
          Play of the day - Daily North Star
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </div>
      </div>

      {/* Your apps */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Your apps</h2>
          <Link href="/home/apps" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            View all apps
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {yourApps.map((app) => (
            <Link
              key={app.name}
              href={app.href}
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
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
              className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${visitedTab === "work" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Your work
            </button>
            <button
              onClick={() => setVisitedTab("teams")}
              className={`px-3 py-1 text-sm font-medium rounded-r-md transition-colors ${visitedTab === "teams" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Teams
            </button>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
            You haven&apos;t visited any places yet. Visit and view your team&apos;s spaces to start seeing your work.
          </div>
        </div>
      </div>

      {/* What's next */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">What&apos;s next</h2>
          <div className="flex rounded-md border">
            <button
              onClick={() => setNextTab("worked")}
              className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${nextTab === "worked" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Worked on
            </button>
            <button
              onClick={() => setNextTab("viewed")}
              className={`px-3 py-1 text-sm font-medium rounded-r-md transition-colors ${nextTab === "viewed" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
            >
              Viewed
            </button>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
            You&apos;re all done for now. Check back soon to find out what&apos;s next.
          </div>
        </div>
      </div>
    </div>
  )
}
