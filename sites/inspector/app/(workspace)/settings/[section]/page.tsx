import { redirect } from "next/navigation"

// Path-routed shell for `/settings/<section>` URLs that previously
// 404'd (e.g. `/settings/billing`, `/settings/preferences`,
// `/settings/notifications`, …). Every entry in `KNOWN_SECTIONS` from
// settings-client.tsx is reachable both as `?section=<key>` and as
// `/settings/<key>` — real Linear supports both forms — so this
// dynamic segment 307s back to the canonical query-string route.
//
// Static sub-segments under `/settings/` (project-labels,
// project-statuses, project-templates, new-team, integrations,
// templates, billing, teams, import-export) keep their dedicated
// `page.tsx` (and tend to render their own UI rather than redirect),
// so they take precedence over this catch-all per Next.js routing
// rules. A user URL-typing `/settings/billing` lands in the
// `billing/` segment which has no `page.tsx` of its own, so the
// router falls through to this `[section]/page.tsx` and redirects.
const KNOWN_SECTIONS = new Set<string>([
  "workspace",
  "teams",
  "members",
  "admin-security",
  "api",
  "applications",
  "billing",
  "import-export",
  "issue-labels",
  "issue-templates",
  "slas",
  "project-labels",
  "project-templates",
  "statuses",
  "updates",
  "ai-agents",
  "initiatives",
  "documents",
  "customer-requests",
  "pulse",
  "asks",
  "emojis",
  "integrations",
  "preferences",
  "coding-tools",
  "profile",
  "notifications",
  "security",
  "connected-accounts",
  "agent-personalization",
  "create-team",
])

const SECTION_ALIASES: Record<string, string> = {
  labels: "issue-labels",
  templates: "issue-templates",
  "security-access": "security",
  "project-statuses": "statuses",
}

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const resolved = SECTION_ALIASES[section] ?? section
  if (KNOWN_SECTIONS.has(resolved)) {
    redirect(`/settings?section=${resolved}`)
  }
  // Unknown sub-paths fall back to the bare /settings page (which
  // itself defaults to Preferences) — same shape as the round-5
  // unknown-slug behaviour.
  redirect("/settings")
}
