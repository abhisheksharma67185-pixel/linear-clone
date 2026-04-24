import { NextResponse } from "next/server"
import { passkeys, addPasskey } from "@/lib/security-mocks"

export async function GET() {
  return NextResponse.json(passkeys)
}

export async function POST(request: Request) {
  let body: { name?: string; credentialId?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine; we'll fall back to a default name
  }
  const name =
    body.name?.trim() || `Passkey · ${new Date().toLocaleString()}`
  const pk = addPasskey(name)
  return NextResponse.json(pk, { status: 201 })
}
