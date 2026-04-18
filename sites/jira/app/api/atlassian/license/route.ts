import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN

  if (!baseUrl || !email || !token) {
    return NextResponse.json({ isTrial: true, applications: [] })
  }

  const url = `https://${baseUrl}/rest/api/3/instance/license`
  const auth = Buffer.from(`${email}:${token}`).toString("base64")

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ isTrial: false, applications: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ isTrial: false, applications: [] })
  }
}
