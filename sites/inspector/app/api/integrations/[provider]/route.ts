import { NextResponse } from "next/server"
import { disconnectIntegration, integrations } from "@/lib/security-mocks"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  if (!integrations[provider]) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 })
  }
  disconnectIntegration(provider)
  return NextResponse.json({ disconnected: true, provider })
}
