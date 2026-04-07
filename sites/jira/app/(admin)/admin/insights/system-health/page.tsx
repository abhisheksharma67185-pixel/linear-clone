"use client"

import { Button } from "@/components/ui/button"

const apps = [
  {
    name: "Goals",
    icon: (
      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
    ),
  },
  {
    name: "Jira",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    icon: (
      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
]

export default function SystemHealthPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">System health</h1>
          <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">BETA</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Notification settings</Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Give feedback
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-1">
        View events affecting your app portfolio and their impact on your organization here.
      </div>
      <div className="text-sm text-muted-foreground mb-1">
        Go to{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
          status.atlassian.com
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>{" "}
        for a full list of Atlassian incidents.
      </div>
      <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline inline-flex items-center gap-0.5 mb-4">
        Understand how we detect and classify incidents
        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>

      <div className="flex items-center justify-end gap-2 mb-2">
        <span className="text-sm text-muted-foreground">Last updated: just now</span>
        <Button variant="outline" size="sm">Refresh</Button>
      </div>

      {/* All systems operational banner */}
      <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3 mb-6">
        <svg className="size-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="text-sm font-medium">All systems operational</span>
      </div>

      {/* Status by app */}
      <h2 className="text-base font-semibold mb-4">Status by app</h2>

      <div className="flex flex-col gap-3">
        {apps.map((app) => (
          <div key={app.name} className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-accent/30 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              {app.icon}
              <span className="text-sm font-medium">{app.name}</span>
              <span className="rounded bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-800 dark:text-green-300 uppercase">Operational</span>
            </div>
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
