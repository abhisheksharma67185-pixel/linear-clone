import type { Metadata } from "next"

// Slug → display-name map for the browser tab `<title>`. Generated from
// the IntCard entries in settings-client.tsx (see INTEG_ALL_SECTIONS) so
// brand names render with their canonical capitalisation rather than the
// raw URL fragment. The page itself stays "use client", so we add this
// thin server-component layout only to expose `generateMetadata` for
// `?slug=`-routed integrations.
const INTEGRATION_TITLES: Record<string, string> = {
  adk: "ADK",
  aikido: "Aikido Security",
  airbyte: "Airbyte",
  arc: "Arc",
  atlas: "Atlas Support",
  axolo: "Axolo",
  birdeats: "Bird Eats Bug",
  canny: "Canny",
  canva: "Canva AI Connector",
  capybara: "Capybara",
  charlie: "Charlie",
  chatgpt: "ChatGPT",
  chatprd: "ChatPRD",
  circleback: "Circleback",
  claap: "Claap",
  "claude-ai": "Claude",
  cloudback: "Cloudback",
  coda: "Coda by Packs4Coda",
  codex: "Codex",
  copilot: "GitHub Copilot",
  cursor: "Cursor",
  "cursor-mcp": "Cursor MCP",
  cyclereport: "Cycle Report",
  datadog: "Datadog",
  descript: "Descript",
  devin: "Devin",
  discord: "Discord",
  drata: "Drata",
  dust: "Dust",
  "email-au": "Create issues via email",
  factory: "Factory",
  fencer: "Fencer",
  figma: "Figma",
  "figma-md": "Figma",
  fivetran: "Fivetran",
  "fivetran-an": "Fivetran",
  front: "Front",
  github: "GitHub",
  "github-eng": "GitHub",
  "github-lc": "GitHub",
  gitlab: "GitLab",
  "gitlab-eng": "GitLab",
  "gitlab-lc": "GitLab",
  glean: "Glean",
  gsheets: "Google Sheets",
  "gsheets-an": "Google Sheets",
  honeybadger: "Honeybadger",
  incidentio: "incident.io",
  index: "Index",
  intercom: "Intercom",
  "intercom-cx": "Intercom",
  jam: "Jam",
  jellyfish: "Jellyfish",
  jira: "Jira",
  "jira-au": "Jira",
  kawach: "Kawach AI",
  "linear-asks": "Linear Asks for Slack",
  "linear-asks-br": "Linear Asks for Slack",
  "linear-asks-co": "Linear Asks for Slack",
  loom: "Loom",
  miro: "Miro",
  msteams: "Microsoft Teams",
  notion: "Notion",
  "notion-co": "Notion",
  "notion-lc": "Notion",
  orca: "Orca Security",
  pagerduty: "PagerDuty",
  "pagerduty-lc": "PagerDuty",
  productlane: "Productlane",
  "productlane-co": "Productlane",
  range: "Range",
  raycast: "Raycast",
  "raycast-au": "Raycast",
  "raycast-eng": "Raycast",
  replit: "Replit",
  retool: "Retool",
  salesforce: "Salesforce",
  screenpresso: "Screenpresso",
  secureslate: "SecureSlate",
  "sentry-ag": "Sentry",
  "sentry-eng": "Sentry",
  slack: "Slack",
  "slack-co": "Slack",
  "slack-lc": "Slack",
  span: "Span",
  tella: "Tella",
  v0: "v0 by Vercel",
  vanta: "Vanta",
  "vercel-br": "Vercel",
  vscode: "VS Code",
  windsurf: "Windsurf",
  youtube: "YouTube",
  zapier: "Zapier",
  "zapier-au": "Zapier",
  "zapier-lc": "Zapier",
  zendesk: "Zendesk",
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ")
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = INTEGRATION_TITLES[slug] ?? titleCaseFromSlug(slug)
  return { title: `${name} · Integrations` }
}

export default function IntegrationSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
