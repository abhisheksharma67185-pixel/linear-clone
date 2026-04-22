"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Workflow as WorkflowIcon } from "lucide-react"

type Workflow = {
  id: string
  name: string
  trigger: string
  isEnabled: boolean
  runCount: number
  lastRunAt: string | null
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const load = () =>
    fetch("/api/data/workflows")
      .then((r) => r.json())
      .then(setWorkflows)
  useEffect(() => {
    load()
  }, [])

  const toggle = async (w: Workflow) => {
    await fetch(`/api/data/workflows/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !w.isEnabled }),
    })
    load()
  }

  return (
    <>
      <SimplePageHeader
        title="Workflow Builder"
        subtitle={`${workflows.length} workflows`}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {workflows.map((w) => (
            <div key={w.id} className="flex items-center gap-3 px-4 py-3">
              <WorkflowIcon className="size-4 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">{w.name}</span>
                <span className="text-xs text-muted-foreground">
                  {w.trigger} · {w.runCount} runs
                </span>
              </div>
              <Switch checked={w.isEnabled} onCheckedChange={() => toggle(w)} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
