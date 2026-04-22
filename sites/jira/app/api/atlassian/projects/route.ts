import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN

  if (!baseUrl || !email || !token) {
    return NextResponse.json(
      {
        error:
          "Missing ATLASSIAN_BASE_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN env vars",
        values: [],
      },
      { status: 503 }
    )
  }

  const url = `https://${baseUrl}/rest/api/3/project/search?orderBy=name&sortOrder=ASC&types=software%2Cbusiness&expand=lead%2Cdescription%2Curl&maxResults=50`
  const auth = Buffer.from(`${email}:${token}`).toString("base64")

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Atlassian API error ${res.status}: ${text}`, values: [] },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: String(err), values: [] },
      { status: 500 }
    )
  }
}
