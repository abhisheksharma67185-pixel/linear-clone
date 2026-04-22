// ---------------------------------------------------------------------------
// Helpers for building /api/proxy/<siteId>/<path> URLs.
// All HTTP calls from the browser go through the Next.js proxy so we don't
// hit CORS issues in dev and the base URL lives exclusively in localStorage.
// ---------------------------------------------------------------------------

export function proxyUrl(
  siteId: string,
  path: string,
  query?: Record<string, string | number | undefined | null>,
): string {
  const cleaned = path.startsWith("/") ? path.slice(1) : path
  const base = `/api/proxy/${encodeURIComponent(siteId)}/${cleaned}`

  if (!query) return base
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue
    params.set(k, String(v))
  }
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
