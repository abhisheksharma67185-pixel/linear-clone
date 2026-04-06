"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function StatusUpdatesPage() {
  return (
    <div className="p-6">
      {/* Title + actions */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Status updates</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Catch up</Button>
          <Button variant="outline">Write updates</Button>
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
          <svg className="size-6 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2" /><circle cx="12" cy="12" r="5" />
          </svg>
          <div>
            <p className="text-sm leading-relaxed">
              On the 8th of each month, you&apos;ll see the latest updates on goals and topics you follow in this feed.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Button className="bg-green-600 text-white hover:bg-green-700" size="sm">
                Create your first goal
              </Button>
              <button className="text-sm text-muted-foreground hover:underline">More about goals</button>
            </div>
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button className="rounded p-1 text-muted-foreground hover:bg-accent">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h2 className="text-xl font-semibold">April</h2>
        <button className="rounded p-1 text-muted-foreground hover:bg-accent">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Summary */}
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        You&apos;re following 2 active goals, here&apos;s the breakdown.
      </p>

      {/* Status grid */}
      <div className="mb-8 grid grid-cols-3 gap-px rounded-lg border overflow-hidden">
        {[
          { count: 1, label: "On track", sub: "+1 from last month", color: "text-green-600" },
          { count: 0, label: "At risk", sub: "No change", color: "text-yellow-600" },
          { count: 1, label: "Off track", sub: "No change", color: "text-red-600" },
          { count: 0, label: "No update", sub: "-1 from last month", color: "text-gray-500" },
          { count: 0, label: "Cancelled", sub: "No change", color: "text-gray-500" },
          { count: 0, label: "Completed", sub: "No change", color: "text-gray-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 border-b border-r p-4 last:border-r-0">
            <span className={`text-2xl font-bold ${item.color}`}>{item.count}</span>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Example goal update */}
      <div className="rounded-lg border p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span>Goal</span>
        </div>
        <p className="mb-4 text-sm font-medium">Operate 42 commercial flights to space</p>

        <div className="flex items-start gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-purple-600 text-xs text-white">AH</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium">Andy Harrell</span>
              <span className="text-xs text-muted-foreground">4 days ago</span>
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">On track</span>
              <span className="text-xs text-muted-foreground">for</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                </svg>
                Jan 2025
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kicking off our goal to launch 42 commercial space flights by end of Q2 2025, generating $500 million in revenue.
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Partnership negotiations with Planetary Hotels underways.
            </p>
          </div>
        </div>
      </div>

      {/* Right sidebar summary */}
      <div className="fixed right-6 top-32 w-64 hidden xl:block">
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">New goals</h3>
          <p className="text-xs text-muted-foreground">No new goals this month</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Completed goals</h3>
          <p className="text-xs text-muted-foreground">No completed goals this month</p>
        </div>
      </div>
    </div>
  )
}
