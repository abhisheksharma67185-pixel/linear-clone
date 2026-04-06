"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ProjectStatusUpdatesPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Status updates</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Catch up</Button>
          <Button variant="outline">Write updates</Button>
        </div>
      </div>

      <div className="mb-6 border-b">
        <button className="border-b-2 border-blue-600 pb-2 text-sm font-medium text-blue-600">Following</button>
      </div>

      <div className="mb-8 rounded-lg border p-5">
        <div className="flex items-start gap-3">
          <svg className="size-6 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <div>
            <p className="text-sm font-semibold">There aren&apos;t any new project updates to show yet</p>
            <p className="text-sm text-muted-foreground mt-1">Every Monday, this feed will show the latest updates from projects and topics you follow.</p>
            <div className="mt-3 flex items-center gap-3">
              <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm">Create project</Button>
              <button className="text-sm text-muted-foreground hover:underline">More about projects</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-center gap-4">
        <button className="rounded p-1 text-muted-foreground hover:bg-accent">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h2 className="text-xl font-semibold">Last week</h2>
        <button className="rounded p-1 text-muted-foreground hover:bg-accent">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <p className="mb-4 text-sm font-medium text-muted-foreground">
        You&apos;re following 4 active projects, here&apos;s the breakdown.
      </p>

      <div className="mb-8 grid grid-cols-3 gap-px rounded-lg border overflow-hidden">
        {[
          { count: 1, label: "On track", sub: "-2 from last week", color: "text-green-600" },
          { count: 1, label: "At risk", sub: "+1 from last week", color: "text-yellow-600" },
          { count: 1, label: "Off track", sub: "No change", color: "text-red-600" },
          { count: 0, label: "No update", sub: "No change", color: "text-gray-500" },
          { count: 0, label: "Cancelled", sub: "No change", color: "text-gray-500" },
          { count: 1, label: "Completed", sub: "+1 from last week", color: "text-gray-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 border-b border-r p-4 last:border-r-0">
            <span className={`text-2xl font-bold ${item.color}`}>{item.count}</span>
            <div>
              <p className="text-sm font-medium">{item.label} {item.label === "Completed" && "🎉"}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>🍜</span>
          <span>Project</span>
        </div>
        <p className="mb-4 text-sm font-medium">Space shuttle autopilot AI</p>
        <div className="flex items-start gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-indigo-600 text-xs text-white">LA</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium">Lia Arroyo</span>
              <span className="text-xs text-muted-foreground">3 days ago</span>
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">On track</span>
              <span className="text-xs text-muted-foreground">for</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
                February
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              🏆 Developed a basic autopilot algorithm that can control the shuttle&apos;s velocity, altitude, and orientation.
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              🔍 Currently researching and studying existing competitor autopilot systems. More info next week.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
