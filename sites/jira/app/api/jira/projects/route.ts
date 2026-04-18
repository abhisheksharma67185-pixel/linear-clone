import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderBy = searchParams.get("orderBy") ?? "name"
  const sortOrder = searchParams.get("sortOrder") ?? "ASC"

  const baseUrl = process.env.ATLASSIAN_BASE_URL
  const email   = process.env.ATLASSIAN_EMAIL
  const token   = process.env.ATLASSIAN_API_TOKEN

  if (!baseUrl || !email || !token) {
    return NextResponse.json(
      { error: "Atlassian credentials not configured" },
      { status: 500 }
    )
  }

  const credentials = Buffer.from(`${email}:${token}`).toString("base64")

  try {
    const res = await fetch(
      `${baseUrl}/rest/api/3/project/search` +
      `?orderBy=${orderBy}&sortOrder=${sortOrder}&action=view` +
      `&maxResults=50&expand=lead,description`,
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

export async function POST(request: Request) {
  const { name, key, projectTypeKey = "software" } = await request.json()

  const base  = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN

  if (!base || !email || !token) {
    return NextResponse.json({ error: "Atlassian credentials not configured" }, { status: 500 })
  }

  const auth = Buffer.from(`${email}:${token}`).toString("base64")

  try {
    const res = await fetch(`${base}/rest/api/3/project`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        key,
        projectTypeKey,
        simplified: true,
        leadAccountId: process.env.ATLASSIAN_ACCOUNT_ID,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(err, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
