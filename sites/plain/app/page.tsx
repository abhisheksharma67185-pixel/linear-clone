import "./lib/init-sim"

import * as store from "./lib/store"
import { WorkspaceShell } from "@/components/plain/workspace-shell"

export const dynamic = "force-dynamic"

export default function Page() {
  const threads = store.getThreads()
  const messages = store.getMessages()
  const customers = store.getCustomers()
  const tenants = store.getTenants()
  const labels = store.getLabels()
  const agents = store.getAgents()
  const currentAgent = store.getCurrentAgent()

  return (
    <WorkspaceShell
      threads={threads}
      messages={messages}
      customers={customers}
      tenants={tenants}
      labels={labels}
      agents={agents}
      currentAgent={currentAgent}
    />
  )
}
