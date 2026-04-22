import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { resetRLState } from "../route"

export async function POST() {
  store.reset()
  resetRLState()

  const channels = store.getChannels()
  const messages = store.getMessages()
  const directMessages = store.getDirectMessages()

  return NextResponse.json({
    message: "Environment reset",
    observation: {
      currentPage: "/c/general",
      stepCount: 0,
      totalChannels: channels.length,
      publicChannels: channels.filter(
        (c: Record<string, unknown>) => c.type === "public"
      ).length,
      privateChannels: channels.filter(
        (c: Record<string, unknown>) => c.type === "private"
      ).length,
      totalDms: directMessages.length,
      totalMessages: messages.length,
      totalUsers: store.getUsers().length,
    },
  })
}
