/**
 * Site proxy route (`/api/proxy/[site]/[...path]`)
 *
 * PURPOSE  Catch-all reverse proxy that lets the browser hit any
 *          configured site without CORS pain. Maps:
 *            /api/proxy/<siteId>/<...path>?...
 *              →  <siteBaseUrl>/<...path>?...
 *          Forwards all HTTP methods, query strings, and bodies.
 * USAGE    Every client-side fetch in the inspector goes through this
 *          (`lib/proxy-url.ts` builds the URL, `lib/api-client.ts`
 *          sends the request). The base URL for each site is resolved
 *          server-side by `lib/site-resolver.ts`:
 *            1. `x-inspector-site-url` request header (set by the
 *               browser when the user customized the URL in
 *               localStorage), OR
 *            2. `DEFAULT_PROXY_MAP` (env-driven via
 *               NEXT_PUBLIC_SITE_URL_<ID>, with localhost fallback).
 * SECURITY Path is a wildcard segment so any sub-path on the upstream
 *          site is reachable. The site list is operator-trusted; do not
 *          expose this proxy to untrusted callers.
 */

import { NextRequest, NextResponse } from "next/server"
import { resolveSiteBaseUrl } from "@/lib/site-resolver"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ site: string; path: string[] }> }

async function forward(request: NextRequest, ctx: Ctx) {
  const { site, path } = await ctx.params
  const baseUrl = await resolveSiteBaseUrl(site)

  if (!baseUrl) {
    return NextResponse.json(
      {
        error: `Unknown site '${site}'. Pass x-inspector-site-url header or add a default entry.`,
      },
      { status: 404 }
    )
  }

  const tail = (path ?? []).join("/")
  const qs = request.nextUrl.search
  const targetUrl = `${baseUrl}/${tail}${qs}`

  // Forward body for methods that carry one. Avoid copying hop-by-hop headers
  // or the browser's host header (which Next already strips, but be explicit).
  const method = request.method
  const forwardHeaders = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) forwardHeaders.set("content-type", contentType)
  const accept = request.headers.get("accept")
  if (accept) forwardHeaders.set("accept", accept)

  const init: RequestInit = {
    method,
    headers: forwardHeaders,
    // cache:no-store so we never serve a stale engine response.
    cache: "no-store",
  }

  if (method !== "GET" && method !== "HEAD") {
    // Read as a buffer so we don't tamper with encoding.
    const buf = await request.arrayBuffer()
    if (buf.byteLength > 0) init.body = buf
  }

  let upstream: Response
  try {
    upstream = await fetch(targetUrl, init)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: `Upstream fetch failed: ${message}`,
        target: targetUrl,
      },
      { status: 502 }
    )
  }

  // Re-emit status + content-type. Stream body through.
  const resp = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
  })
  const upstreamCT = upstream.headers.get("content-type")
  if (upstreamCT) resp.headers.set("content-type", upstreamCT)
  return resp
}

export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
export const OPTIONS = forward
