"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const tabs = [
  { id: "ai-usage", label: "AI usage" },
  { id: "users", label: "Users" },
  { id: "user-security", label: "User security" },
  { id: "mobile-usage", label: "Mobile usage" },
  { id: "user-activity", label: "User activity" },
  { id: "jira-usage", label: "Jira usage" },
]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("ai-usage")

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Analytics</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        View analytics for insights about the users of your organization&apos;s Atlassian apps and your security practices.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Tell me more about organizational insights.</a>
      </p>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active AI users card */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">Active AI users</h3>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Monthly active users who used AI-enabled features at least once across any apps with AI activated.
        </p>

        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" size="sm" className="gap-1.5">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Last 4 weeks
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            All sites
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </Button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="size-12 mb-3 rounded-full bg-muted flex items-center justify-center">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="8" x2="14" y2="14" />
              <line x1="14" y1="8" x2="8" y2="14" />
            </svg>
          </div>
          <p className="text-sm">We have no insights to show yet</p>
        </div>
      </div>
    </div>
  )
}
