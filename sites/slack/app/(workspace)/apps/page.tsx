"use client"

import { SimplePageHeader } from "@/components/simple-page-header"
import { Grid3x3 } from "lucide-react"

const apps = [
  { name: "Google Calendar", description: "Sync your calendar to Slack" },
  { name: "GitHub", description: "GitHub notifications in channels" },
  { name: "Jira Cloud", description: "Track Jira issues" },
  { name: "Zoom", description: "Start Zoom calls with /zoom" },
  { name: "Polly", description: "Create polls and surveys" },
  { name: "Loom", description: "Share Loom videos" },
]

export default function AppsPage() {
  return (
    <>
      <SimplePageHeader title="Apps" subtitle={`${apps.length} installed`} />
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((a) => (
          <div
            key={a.name}
            className="flex items-start gap-3 rounded-md border border-border bg-card p-4"
          >
            <Grid3x3 className="size-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-bold">{a.name}</span>
              <span className="text-xs text-muted-foreground">
                {a.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
