"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const mockGoals = [
  { id: 1, name: "New employee onboarding update", status: "On track", statusColor: "bg-green-500", score: 0.7, targetDate: "Q2 2025", following: true, lastUpdated: "Today" },
  { id: 2, name: "Improve customer satisfaction score", status: "On track", statusColor: "bg-green-500", score: 0.7, targetDate: "Q3 2025", following: false, lastUpdated: "2 days ago" },
  { id: 3, name: "Launch mobile app v2.0", status: "At risk", statusColor: "bg-yellow-500", score: 0.7, targetDate: "Q2 2025", following: false, lastUpdated: "3 days ago" },
  { id: 4, name: "Reduce infrastructure costs by 20%", status: "On track", statusColor: "bg-green-500", score: 0.7, targetDate: "Q4 2025", following: false, lastUpdated: "1 week ago" },
]

const tabs = ["All goals", "My goals", "Archived"]
const filterButtons = ["Filter by Tag", "Status", "Owner", "Team", "Reporting line"]

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState("All goals")
  const [search, setSearch] = useState("")

  return (
    <div className="p-6">
      {/* Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg className="size-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2" />
            <circle cx="12" cy="12" r="5" />
          </svg>
          <p className="text-sm">
            Goals give teams a single place to track progress toward the outcomes that their work contributes to.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button className="bg-green-600 text-white hover:bg-green-700">
            Create your first goal
          </Button>
          <button className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            More about goals
          </button>
        </div>
      </div>

      {/* Title + tabs */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Goals</h1>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            More views
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          placeholder="Search goals"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filterButtons.map((label) => (
          <button
            key={label}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            {label === "Filter by Tag" && (
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            )}
            {label === "Status" && (
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />
              </svg>
            )}
            {label === "Owner" && (
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            )}
            {label === "Team" && (
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
            {label === "Reporting line" && (
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            )}
            {label}
          </button>
        ))}
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </button>
      </div>

      {/* Count + sort */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{mockGoals.length} goals</p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Sort by following
            <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12l-4-4h8z" /></svg>
          </button>
          <button className="flex items-center gap-1 rounded border px-2 py-1 text-sm text-muted-foreground hover:bg-accent">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Columns
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Goals table */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_100px_80px_100px_100px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Name</span>
          <span>Status</span>
          <span>Target date</span>
          <span>Owner</span>
          <span>Following</span>
          <span>Last updated</span>
        </div>

        {/* Rows */}
        {mockGoals.map((goal) => (
          <div key={goal.id} className="grid grid-cols-[1fr_100px_100px_80px_100px_100px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <button className="text-muted-foreground hover:text-foreground shrink-0">
                <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" /></svg>
              </button>
              <svg className="size-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-sm truncate">{goal.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`size-2 rounded-full ${goal.statusColor}`} />
              <span className="text-xs">{goal.status}</span>
              <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {goal.score}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="h-2.5 w-12 rounded bg-muted" />
            </div>
            <div>
              <svg className="size-6 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            </div>
            <div>
              {goal.following ? (
                <span className="rounded border px-2 py-0.5 text-xs">Following</span>
              ) : (
                <div className="h-2.5 w-16 rounded bg-muted" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{goal.lastUpdated}</span>
              <button className="text-muted-foreground hover:text-foreground">
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
