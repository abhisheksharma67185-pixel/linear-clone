import { redirect } from "next/navigation"

const ADMIN_URLS: Record<string, string> = {
  system: "https://thetacomputer01.atlassian.net/jira/settings/system",
  apps: "https://thetacomputer01.atlassian.net/jira/settings/apps",
  spaces: "https://thetacomputer01.atlassian.net/jira/settings/projects",
  issues: "https://thetacomputer01.atlassian.net/jira/settings/issues",
  marketplace:
    "https://thetacomputer01.atlassian.net/jira/settings/marketplace",
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const url = ADMIN_URLS[slug]
  if (url) redirect(url)

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p style={{ fontSize: 16, color: "#172B4D" }}>
        Admin settings are managed in Atlassian.
      </p>
      <a
        href={`https://thetacomputer01.atlassian.net/jira/settings/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#0052CC", fontSize: 14 }}
      >
        Open in Atlassian ↗
      </a>
    </div>
  )
}
