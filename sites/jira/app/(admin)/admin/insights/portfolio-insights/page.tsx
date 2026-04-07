"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PortfolioInsightsPage() {
  const [activeTab, setActiveTab] = useState<"apps" | "detected">("apps")

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Portfolio insights</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Give feedback
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Connect Data Center</Button>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        Manage and optimize your Atlassian portfolio by adding, discovering, and assessing your Atlassian apps for cloud readiness and instance optimization.{" "}
        <button type="button" className="text-blue-600 hover:underline">Get started with Portfolio insights</button>
      </p>

      {/* Tip banner */}
      <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 px-4 py-3 mb-6">
        <svg className="size-5 text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <p className="text-sm">
          Get insights and recommendations on how to improve your Data Center performance and cloud readiness.{" "}
          <button type="button" className="text-blue-600 hover:underline">Connect Data Center</button>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-4">
        <button
          onClick={() => setActiveTab("apps")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            activeTab === "apps"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Apps
        </button>
        <button
          onClick={() => setActiveTab("detected")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            activeTab === "detected"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Detected apps
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Atlassian apps that you connected to or confirmed as part of your portfolio.
      </p>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input placeholder="Find by URL" className="pl-9" />
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          App
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Deployment
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Connectivity status
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Insight status
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>Showing 1 result out of 1 item</span>
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  App
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14" />
                    <path d="M19 12l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Deployment</th>
              <th className="px-4 py-2.5 text-left font-medium">Connectivity status</th>
              <th className="px-4 py-2.5 text-left font-medium">Insight status</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                    <svg className="size-4" viewBox="0 0 32 32" fill="white">
                      <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Jira</p>
                    <p className="text-xs text-muted-foreground">https://abhisheksharma67185.atlassian.net</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">Cloud</td>
              <td className="px-4 py-3 text-sm"></td>
              <td className="px-4 py-3 text-sm"></td>
              <td className="px-4 py-3">
                <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
