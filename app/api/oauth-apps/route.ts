import { NextResponse } from "next/server"
import { createOAuthApp, oauthApps } from "@/lib/api-settings-mocks"

export async function GET() {
  const sorted = [...oauthApps].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  )
  return NextResponse.json(sorted)
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = createOAuthApp(body ?? {})
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
