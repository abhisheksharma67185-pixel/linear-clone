// ---------------------------------------------------------------------------
// Plain — small client-side fetch wrappers around /api/data/*.
// All mutations go through these so error shape and JSON parsing live in
// exactly one place.
// ---------------------------------------------------------------------------

import type {
  Message,
  Thread,
  ThreadPriority,
  ThreadStatus,
} from "@/app/lib/mock-data"

export type ThreadWithMessages = Thread & { messages: Message[] }

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = ""
    try {
      const body = (await res.json()) as { error?: string }
      detail = body?.error ?? ""
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchThread(id: string): Promise<ThreadWithMessages> {
  const res = await fetch(`/api/data/threads/${id}`, { cache: "no-store" })
  return jsonOrThrow<ThreadWithMessages>(res)
}

export async function fetchThreads(): Promise<Thread[]> {
  const res = await fetch(`/api/data/threads`, { cache: "no-store" })
  return jsonOrThrow<Thread[]>(res)
}

// ---------------------------------------------------------------------------
// PATCH /api/data/threads/[id] — accepts a partial body matching the route's
// shape: { status?, priority?, assigneeId?, labelIds?, snoozedUntil? }.
// We intentionally keep this loose; the route validates.
// ---------------------------------------------------------------------------

export interface UpdateThreadBody {
  status?: ThreadStatus
  priority?: ThreadPriority
  assigneeId?: string | null
  labelIds?: string[]
  snoozedUntil?: string
}

export async function updateThread(
  id: string,
  body: UpdateThreadBody
): Promise<Thread> {
  const res = await fetch(`/api/data/threads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return jsonOrThrow<Thread>(res)
}

// ---------------------------------------------------------------------------
// POST /api/data/threads/[id]/messages — agent reply
// ---------------------------------------------------------------------------

export interface SendReplyBody {
  body: string
  authorId: string
}

export async function sendReply(
  threadId: string,
  body: SendReplyBody
): Promise<Message> {
  const res = await fetch(`/api/data/threads/${threadId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return jsonOrThrow<Message>(res)
}
