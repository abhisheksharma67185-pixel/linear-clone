import { NextResponse } from "next/server"
import { mcpServers, createMcpServer } from "@/lib/agent-mocks"
import { route } from "@/app/lib/route"

export const GET = route(async () => {
  return NextResponse.json(mcpServers)
})

export const POST = route(async (request) => {
  let body: { name?: string; url?: string; authToken?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  if (!body.url?.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }
  const server = createMcpServer({
    name: body.name,
    url: body.url,
    authToken: body.authToken,
  })
  return NextResponse.json(server, { status: 201 })
})
