import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { resetRLState } from "../route"

export async function POST() {
  store.reset()
  resetRLState()

  const tickets = store.getTickets()
  return NextResponse.json({
    message: "Environment reset",
    observation: {
      currentPage: "/home",
      stepCount: 0,
      totalTickets: tickets.length,
      newTickets: tickets.filter((t) => t.status === "new").length,
      openTickets: tickets.filter((t) => t.status === "open").length,
      pendingTickets: tickets.filter((t) => t.status === "pending").length,
      onHoldTickets: tickets.filter((t) => t.status === "on-hold").length,
      solvedTickets: tickets.filter((t) => t.status === "solved").length,
      closedTickets: tickets.filter((t) => t.status === "closed").length,
      totalUsers: store.getUsers().length,
      totalGroups: store.getGroups().length,
      totalMacros: store.getMacros().length,
    },
  })
}
