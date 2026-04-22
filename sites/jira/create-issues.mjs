const BASE = "https://abhisheksharma67185.atlassian.net"
const EMAIL = "abhisheksharma67185@gmail.com"
const TOKEN = process.env.ATLASSIAN_API_TOKEN
const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64")

const PLAT_ISSUES = [
  "Write migration guide for auth v2",
  "Integration test suite expansion",
  "PCI compliance docs",
  "Dependency audit and upgrades",
  "Release notes draft for v2.3.0",
  "Deprecation notice for v1 endpoints",
  "Load test results analysis",
  "Security audit prep",
  "On-call runbook update",
  "Performance benchmark — payment service",
  "Update API documentation for v2.3.0",
]

async function createIssue(summary, projectKey, issueTypeName = "Task") {
  const res = await fetch(`${BASE}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${AUTH}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary,
        issuetype: { name: issueTypeName },
      },
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error(`✗ Failed: ${summary}`, data.errors ?? data)
    return data
  }
  console.log(`✅ Created ${data.key}: ${summary}`)
  return data
}

if (!TOKEN) {
  console.error("Error: ATLASSIAN_API_TOKEN env var is required")
  console.error("Run: ATLASSIAN_API_TOKEN=your_token node create-issues.mjs")
  process.exit(1)
}

for (const summary of PLAT_ISSUES) {
  await createIssue(summary, "PLAT")
  await new Promise((r) => setTimeout(r, 300)) // avoid rate limit
}

console.log("\n🎉 All issues created!")
