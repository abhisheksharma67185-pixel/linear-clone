import { NextResponse } from "next/server"
import { getProjects, getUsers } from "@/app/lib/store"

const PLACEHOLDER_AVATAR =
  "https://api.atlassian.com/ex/jira/10000/rest/api/3/universal_avatar/view/type/project/avatar/10415?size=medium"

function storeProjectsToJiraFormat(sortOrder: string) {
  const allProjects = getProjects()
  const allUsers = getUsers()
  const BUSINESS_KEYS = new Set(["SUS", "SEU", "SAP"])
  const projects = allProjects.map((p) => {
    const lead = allUsers.find((u) => u.id === p.lead)
    const projectTypeKey = BUSINESS_KEYS.has(p.key)
      ? ("business" as const)
      : ("software" as const)
    return {
      id: p.id,
      key: p.key,
      name: p.name,
      projectTypeKey,
      simplified: p.teamManaged ?? false,
      avatarUrls: {
        "16x16": PLACEHOLDER_AVATAR,
        "24x24": PLACEHOLDER_AVATAR,
        "32x32": PLACEHOLDER_AVATAR,
        "48x48": PLACEHOLDER_AVATAR,
      },
      lead: lead
        ? {
            displayName: lead.displayName,
            avatarUrls: { "24x24": "", "32x32": "", "48x48": "" },
          }
        : undefined,
    }
  })
  if (sortOrder === "DESC") {
    projects.sort((a, b) => b.name.localeCompare(a.name))
  } else {
    projects.sort((a, b) => a.name.localeCompare(b.name))
  }
  return {
    values: projects,
    total: projects.length,
    maxResults: 50,
    startAt: 0,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderBy = searchParams.get("orderBy") ?? "name"
  const sortOrder = searchParams.get("sortOrder") ?? "ASC"

  const baseUrl = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN

  if (!baseUrl || !email || !token) {
    return NextResponse.json(storeProjectsToJiraFormat(sortOrder))
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

  const base = process.env.ATLASSIAN_BASE_URL
  const email = process.env.ATLASSIAN_EMAIL
  const token = process.env.ATLASSIAN_API_TOKEN

  if (!base || !email || !token) {
    return NextResponse.json(
      { error: "Atlassian credentials not configured" },
      { status: 500 }
    )
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
