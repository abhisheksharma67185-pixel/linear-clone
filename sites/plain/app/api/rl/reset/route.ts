import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { resetRLState } from "../route"

export async function POST() {
  store.reset()
  resetRLState()

  const threads = store.getThreads()
  return NextResponse.json({
    message: "Environment reset",
    observation: {
      currentPage: "/inbox",
      stepCount: 0,
      totalThreads: threads.length,
      openThreads: threads.filter((t) => t.status === "open").length,
      snoozedThreads: threads.filter((t) => t.status === "snoozed").length,
      doneThreads: threads.filter((t) => t.status === "done").length,
      totalCustomers: store.getCustomers().length,
      totalTenants: store.getTenants().length,
      totalLabels: store.getLabels().length,
    },
  })
}
