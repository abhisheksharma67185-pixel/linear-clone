import { NextResponse } from "next/server"

const BASE = process.env.ATLASSIAN_BASE_URL
const EMAIL = process.env.ATLASSIAN_EMAIL
const TOKEN = process.env.ATLASSIAN_API_TOKEN
const AUTH = () => Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64")

export async function GET() {
  if (!BASE || !EMAIL || !TOKEN) {
    return NextResponse.json({
      language: "en_US",
      timezone: "Asia/Kolkata",
      watchOwn: true,
    })
  }

  try {
    const [lang, tz, watch] = await Promise.all([
      fetch(`${BASE}/rest/api/3/mypreferences?key=user.language`, {
        headers: {
          Authorization: `Basic ${AUTH()}`,
          Accept: "application/json",
        },
      })
        .then((r) => r.text())
        .catch(() => '"en_US"'),
      fetch(`${BASE}/rest/api/3/mypreferences?key=user.timezone`, {
        headers: {
          Authorization: `Basic ${AUTH()}`,
          Accept: "application/json",
        },
      })
        .then((r) => r.text())
        .catch(() => '"Asia/Kolkata"'),
      fetch(`${BASE}/rest/api/3/mypreferences?key=user.notify.own.changes`, {
        headers: {
          Authorization: `Basic ${AUTH()}`,
          Accept: "application/json",
        },
      })
        .then((r) => r.text())
        .catch(() => "true"),
    ])

    return NextResponse.json({
      language: JSON.parse(lang) ?? "en_US",
      timezone: JSON.parse(tz) ?? "Asia/Kolkata",
      watchOwn: JSON.parse(watch) ?? true,
    })
  } catch {
    return NextResponse.json({
      language: "en_US",
      timezone: "Asia/Kolkata",
      watchOwn: true,
    })
  }
}

export async function PUT(request: Request) {
  const { language, timezone, watchOwn } = await request.json()

  if (!BASE || !EMAIL || !TOKEN) {
    return NextResponse.json({ ok: true })
  }

  await Promise.all([
    fetch(`${BASE}/rest/api/3/mypreferences?key=user.language`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${AUTH()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(language),
    }),
    fetch(`${BASE}/rest/api/3/mypreferences?key=user.timezone`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${AUTH()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(timezone),
    }),
    fetch(`${BASE}/rest/api/3/mypreferences?key=user.notify.own.changes`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${AUTH()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(watchOwn),
    }),
  ])

  return NextResponse.json({ ok: true })
}
