"use client"

import type { SiteConnection } from "./types"
import { proxyUrl } from "./proxy-url"

// ---------------------------------------------------------------------------
// Thin fetch wrapper for talking to a site through our Next.js proxy.
// Always attaches the site's base URL via header so the proxy doesn't have
// to guess (it prefers header over its default map).
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

async function request<T>(
  site: Pick<SiteConnection, "id" | "url">,
  path: string,
  init: RequestInit & {
    query?: Record<string, string | number | undefined | null>
  } = {},
): Promise<T> {
  const { query, headers, ...rest } = init
  const url = proxyUrl(site.id, path, query)

  const mergedHeaders = new Headers(headers)
  mergedHeaders.set("x-inspector-site-url", site.url)
  if (
    rest.body != null &&
    !mergedHeaders.has("content-type") &&
    typeof rest.body === "string"
  ) {
    mergedHeaders.set("content-type", "application/json")
  }
  mergedHeaders.set("accept", "application/json")

  const res = await fetch(url, { ...rest, headers: mergedHeaders })

  let body: unknown = null
  const ct = res.headers.get("content-type") ?? ""
  try {
    body = ct.includes("application/json") ? await res.json() : await res.text()
  } catch {
    body = null
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `HTTP ${res.status}`) || `HTTP ${res.status}`
    throw new ApiError(message, res.status, body)
  }

  return body as T
}

export const api = {
  get: <T>(
    site: Pick<SiteConnection, "id" | "url">,
    path: string,
    query?: Record<string, string | number | undefined | null>,
  ) => request<T>(site, path, { method: "GET", query }),
  post: <T>(
    site: Pick<SiteConnection, "id" | "url">,
    path: string,
    body?: unknown,
  ) =>
    request<T>(site, path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
}
