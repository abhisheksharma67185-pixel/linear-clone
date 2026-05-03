import type { Metadata } from "next"

import SettingsClient from "./settings-client"

// Mirror the sidebar's `key → label` map so server-rendered HTML carries
// the right `<title>` for `/settings?section=…`. Without this the SSR
// HTML omits a <title>, browsers fall back to showing the URL during
// the F5 → JS-load gap, then `document.title` flips to the section name
// after hydration. Keeping a duplicate map (rather than importing from
// settings-client.tsx) avoids dragging the entire client bundle into
// the server graph.
const SECTION_TITLES: Record<string, string> = {
  preferences: "Preferences",
  profile: "Profile",
  notifications: "Notifications",
  security: "Security & access",
  "connected-accounts": "Connected accounts",
  "agent-personalization": "Agent personalization",
  "issue-labels": "Labels",
  "issue-templates": "Templates",
  templates: "Templates",
  slas: "SLAs",
  "project-labels": "Labels",
  "project-templates": "Templates",
  statuses: "Statuses",
  updates: "Updates",
  "ai-agents": "AI & Agents",
  initiatives: "Initiatives",
  documents: "Documents",
  "customer-requests": "Customer requests",
  pulse: "Pulse",
  asks: "Asks",
  emojis: "Emojis",
  integrations: "Integrations",
  workspace: "Workspace",
  teams: "Teams",
  members: "Members",
  "admin-security": "Security",
  api: "API",
  applications: "Applications",
  billing: "Billing",
  "import-export": "Import & export",
  "coding-tools": "Coding tools",
  "create-team": "Create a team",
}

// Bare / alternate slugs that the client-side resolver in
// settings-client.tsx rewrites to canonical section keys. Mirror the
// same aliases here so the SSR `<title>` for e.g. `?section=labels`
// reads "Labels" rather than the generic "Settings" fallback.
const SECTION_ALIASES: Record<string, string> = {
  labels: "issue-labels",
  templates: "issue-templates",
  "security-access": "security",
  "project-statuses": "statuses",
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}): Promise<Metadata> {
  const { section } = await searchParams
  const raw = section && section.length > 0 ? section : "preferences"
  const key = SECTION_ALIASES[raw] ?? raw
  // team-hub-<key> sections are dynamic so they're not in the static map.
  // Anything else not in the table falls back to "Settings" — the
  // client resolver will redirect it to Preferences anyway.
  const title = key.startsWith("team-hub-")
    ? "Team settings"
    : (SECTION_TITLES[key] ?? "Settings")
  return { title }
}

export default function SettingsPage() {
  return <SettingsClient />
}
