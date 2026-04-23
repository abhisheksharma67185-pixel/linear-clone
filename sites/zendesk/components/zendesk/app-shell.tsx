import * as React from "react"

import { IconRail } from "@/components/zendesk/icon-rail"
import { TopToolbar } from "@/components/zendesk/top-toolbar"
import { TopTrialBar } from "@/components/zendesk/top-trial-bar"

interface AppShellProps {
  agentName: string
  conversations: number
  // Three vertical regions of the body grid: left views sidebar,
  // center main area, right info column. Caller decides what to render.
  left: React.ReactNode
  main: React.ReactNode
  right: React.ReactNode
}

// Shell composition: dark trial bar, white toolbar, then a 4-column body
// (icon rail, views sidebar, main, right column) wrapped in a muted page bg.
export function AppShell({
  agentName,
  conversations,
  left,
  main,
  right,
}: AppShellProps) {
  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-muted text-foreground">
      <TopTrialBar />
      <TopToolbar agentName={agentName} conversations={conversations} />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        {left}
        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
          <div className="flex min-h-0 flex-1 gap-3">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{main}</div>
            <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto pb-2">
              {right}
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
