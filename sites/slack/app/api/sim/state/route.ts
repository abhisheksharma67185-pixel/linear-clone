import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  captureSnapshot,
  computeDiff,
  getActiveEpisode,
} from "@thetabench/core"
import * as store from "../../../lib/store"
import { withSession } from "../../../lib/session"

const COLLECTIONS = [
  "users",
  "channels",
  "directMessages",
  "messages",
  "notifications",
  "readStates",
  "userGroups",
  "savedItems",
  "bookmarks",
  "canvases",
  "lists",
  "workflows",
  "huddles",
]
const SINGLETONS = ["workspace", "preferences"]

const getState = () => ({
  workspace: store.getWorkspace(),
  preferences: store.getPreferences(),
  users: store.getUsers(),
  channels: store.getChannels(),
  directMessages: store.getDirectMessages(),
  messages: store.getMessages(),
  notifications: store.getNotifications(),
  readStates: store.getReadStates(),
  userGroups: store.getUserGroups(),
  savedItems: store.getSavedItems(),
  bookmarks: store.getBookmarks(),
  canvases: store.getCanvases(),
  lists: store.getLists(),
  workflows: store.getWorkflows(),
  huddles: store.getHuddles(),
})

export const GET = withSession(async (request: NextRequest) => {
  const url = new URL(request.url)
  const wantDiff = url.searchParams.get("diff") === "true"

  const current = captureSnapshot(getState)

  if (wantDiff) {
    const episode = getActiveEpisode()
    if (!episode) {
      return NextResponse.json(
        { error: "No active episode for diff computation" },
        { status: 400 }
      )
    }
    const diff = computeDiff(
      episode.initialSnapshot,
      current,
      COLLECTIONS,
      SINGLETONS
    )
    return NextResponse.json({ state: current, diff })
  }

  return NextResponse.json(current)
})
