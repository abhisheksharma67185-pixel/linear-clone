import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN

  if (!baseUrl || !email || !token) {
    return NextResponse.json(
      { error: "Atlassian credentials not configured" },
      { status: 500 }
    )
  }

  const credentials = Buffer.from(`${email}:${token}`).toString("base64")
  const jql = encodeURIComponent(
    "project in (SCRUM, PLAT) ORDER BY updated DESC"
  )

  try {
    const res = await fetch(
      `${baseUrl}/rest/api/3/search?jql=${jql}&maxResults=50&fields=summary,status,issuetype,project,assignee,reporter,updated,created`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json(
        { error: `Atlassian API error: ${res.status}`, detail: body },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to connect to Atlassian", detail: String(err) },
      { status: 502 }
    )
  }
}
