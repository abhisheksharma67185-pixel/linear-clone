import { NextResponse } from "next/server"
import {
  peekDeletionCode,
  sendDeletionCode,
  verifyDeletion,
} from "@/lib/workspace-mocks"

// POST: send a deletion code to the user's email (mock — returns { sent: true }).
// The actual code is retrievable in dev via peekDeletionCode; production would
// only send it through email and never reveal it in the response.
export async function POST() {
  const { expiresAt } = sendDeletionCode()
  return NextResponse.json({
    sent: true,
    expiresAt,
    // Expose the code only in non-production builds so the mock can be
    // exercised end-to-end without a real mailbox.
    devCode: process.env.NODE_ENV === "production" ? undefined : peekDeletionCode()?.code,
  })
}

// PUT: verify the submitted code + acknowledgement checkbox.
export async function PUT(request: Request) {
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
}
