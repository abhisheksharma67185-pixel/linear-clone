import { NextRequest, NextResponse } from "next/server"
import { resolveSiteBaseUrl } from "@/lib/site-resolver"

// ---------------------------------------------------------------------------
// Catch-all proxy: /api/proxy/<siteId>/<...path>  →  <siteBaseUrl>/<...path>
// Supports all HTTP methods + arbitrary query strings. The client can pass
// x-inspector-site-url on a per-request basis to override the default URL
// map (needed because the real sites list lives in browser localStorage).
// ---------------------------------------------------------------------------

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
      { status: 404 },
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
      { status: 502 },
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
