import { headers } from "next/headers"

// ---------------------------------------------------------------------------
// Server-side helper for /api/proxy/[site]/* — resolves the configured base
// URL for a site ID. The localStorage-backed sites list lives in the browser;
// we can't read it server-side, so the client passes the URL in a header when
// it matters (x-inspector-site-url). Otherwise we fall back to a default map.
// ---------------------------------------------------------------------------

function siteUrl(id: string, fallback: string): string {
  const key = `NEXT_PUBLIC_SITE_URL_${id.toUpperCase().replace(/-/g, "_")}`
  return process.env[key] ?? fallback
}

export const DEFAULT_PROXY_MAP: Record<string, string> = {
  "shopify-admin": siteUrl("shopify-admin", "http://localhost:3000"),
  linear: siteUrl("linear", "http://localhost:3001"),
  jira: siteUrl("jira", "http://localhost:3002"),
  slack: siteUrl("slack", "http://localhost:3003"),
  zendesk: siteUrl("zendesk", "http://localhost:3004"),
  plain: siteUrl("plain", "http://localhost:3005"),
}

export async function resolveSiteBaseUrl(
  siteId: string
): Promise<string | null> {
  const h = await headers()
  const override = h.get("x-inspector-site-url")
  if (override) {
    try {
      // Validate it's an absolute URL.
      const u = new URL(override)
      return `${u.protocol}//${u.host}`
    } catch {
      // Fall through to default map.
    }
  }

  const mapped = DEFAULT_PROXY_MAP[siteId]
  return mapped ?? null
}
