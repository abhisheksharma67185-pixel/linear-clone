import { NextResponse } from "next/server"

let notifPrefs = {
  emailEnabled: true,
  watching: true,
  reporter: true,
  assignee: true,
  mentions: true,
  own_changes: false,
}

export async function GET() {
  return NextResponse.json(notifPrefs)
}

export async function PUT(request: Request) {
  const body = await request.json()
  notifPrefs = { ...notifPrefs, ...body }
  return NextResponse.json({ ok: true })
}
