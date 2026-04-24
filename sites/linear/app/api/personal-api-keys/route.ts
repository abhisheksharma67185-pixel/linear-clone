import { NextResponse } from "next/server"
import { apiKeys, addApiKey } from "@/lib/security-mocks"

export async function GET() {
  // Don't return the full secret token in the list — only lastFour.
  const redacted = apiKeys.map(({ token: _token, ...rest }) => rest)
  return NextResponse.json(redacted)
}

export async function POST(request: Request) {
  let body: { name?: string; expiresAt?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  const key = addApiKey(name, body.expiresAt ?? null)
  // Return the full key INCLUDING the token — the client must capture it now.
  return NextResponse.json(key, { status: 201 })
}
