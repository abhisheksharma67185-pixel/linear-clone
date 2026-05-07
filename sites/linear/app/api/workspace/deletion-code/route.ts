import { NextResponse } from "next/server"
import {
  peekDeletionCode,
  sendDeletionCode,
  verifyDeletion,
} from "@/lib/workspace-mocks"
import { route } from "@/app/lib/route"

// POST: send a deletion code to the user's email (mock — returns { sent: true }).
// The actual code is retrievable in dev via peekDeletionCode; production would
// only send it through email and never reveal it in the response.
export const POST = route(async () => {
  const { expiresAt } = sendDeletionCode()
  return NextResponse.json({
    sent: true,
    expiresAt,
    devCode:
      process.env.NODE_ENV === "production"
        ? undefined
        : peekDeletionCode()?.code,
  })
})

// PUT: verify the submitted code + acknowledgement checkbox.
export const PUT = route(async (request) => {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = verifyDeletion(body ?? {})
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
})
