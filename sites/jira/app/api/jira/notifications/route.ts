import { NextResponse } from "next/server"

const MOCK_RESPONSE = {
  notifications: [
    {
      id: "1",
      read: false,
      actorInitials: "PP",
      actorColor: "#6554C0",
      text: "Priya Patel assigned SCRUM-5 to you",
      meta: "SCRUM-5 · Jira",
      timeAgo: "2h ago",
      type: "Direct",
      href: "/projects/SCRUM/issues/SCRUM-5",
    },
    {
      id: "2",
      read: true,
      actorInitials: "AS",
      actorColor: "#FF7452",
      text: "You were mentioned in SCRUM-8",
      meta: "SCRUM-8 · Jira",
      timeAgo: "2d ago",
      type: "Direct",
      href: "/projects/SCRUM/issues/SCRUM-8",
    },
  ],
  unreadCount: 1,
}

export async function GET() {
  const base = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN
  const auth = Buffer.from(`${email}:${token}`).toString("base64")

  try {
    const res = await fetch(`${base}/rest/api/3/notification`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      cache: "no-store",
    })

    if (res.status === 404 || !res.ok) {
      return NextResponse.json(MOCK_RESPONSE)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}
