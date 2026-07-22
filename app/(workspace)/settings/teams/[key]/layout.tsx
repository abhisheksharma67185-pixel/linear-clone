import type { Metadata } from "next"

// Includes the team key (uppercase identifier like "ENG") in the title
// so the browser tab disambiguates between multiple open team-settings
// tabs without needing an API round-trip from this server-only layout.
// The team's display name lives behind /api/data/teams; the page itself
// can call `document.title = team.name` once the fetch resolves if a
// nicer title is wanted, but the SSR fallback here keeps the URL out
// of the tab during the JS-load gap. Nested routes (`./[section]`)
// inherit this metadata.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>
}): Promise<Metadata> {
  const { key } = await params
  return { title: `${key.toUpperCase()} · Team settings` }
}

export default function TeamHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
