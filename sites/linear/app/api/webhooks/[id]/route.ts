import { NextResponse } from "next/server"
import {
  deleteWebhook,
  rotateWebhookSecret,
  updateWebhook,
  type WebhookResource,
} from "@/lib/api-settings-mocks"

type PatchBody =
  | { action: "rotate-secret" }
  | {
      action: "update"
      url?: string
      resources?: WebhookResource[]
      teamId?: string | null
      secret?: string
    }

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (body.action === "rotate-secret") {
    const r = rotateWebhookSecret(id)
    if (!r.success) {
      return NextResponse.json({ error: r.error }, { status: 404 })
    }
    return NextResponse.json(r.data)
  }
  if (body.action === "update") {
    const { action: _action, ...rest } = body
    const r = updateWebhook(id, rest)
    if (!r.success) {
      return NextResponse.json(
        { error: r.error },
        { status: r.error === "Webhook not found" ? 404 : 400 }
      )
    }
    return NextResponse.json(r.data)
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const r = deleteWebhook(id)
  if (!r.success) {
    return NextResponse.json({ error: r.error }, { status: 404 })
  }
  return NextResponse.json(r.data)
}
