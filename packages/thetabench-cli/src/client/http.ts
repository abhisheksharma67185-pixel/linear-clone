// ---------------------------------------------------------------------------
// Tiny fetch wrapper with consistent error handling.
//
// All HTTP-related failures (network, non-2xx, JSON parse) surface as a
// `HttpError` carrying the URL + status + best-effort message. The CLI catches
// these at the command boundary and prints a friendly one-liner instead of a
// stack trace.
// ---------------------------------------------------------------------------

export const DEFAULT_URL = "http://localhost:3000";

export class HttpError extends Error {
  readonly url: string;
  readonly status: number; // 0 if network error
  readonly body: unknown;

  constructor(url: string, status: number, message: string, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.url = url;
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions {
  /** Absolute or relative path; if relative it is resolved against `baseUrl`. */
  path: string;
  baseUrl?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  /** Per-request timeout in ms. Defaults to 15s. */
  timeoutMs?: number;
  headers?: Record<string, string>;
}

function buildUrl(base: string, path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, base.endsWith("/") ? base : base + "/");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function describeNetworkError(e: unknown): string {
  if (e instanceof Error) {
    // Node's fetch surfaces these typical causes:
    // - ECONNREFUSED — server not running
    // - ENOTFOUND — DNS lookup failed
    // - ETIMEDOUT / AbortError — timed out
    const cause = (e as { cause?: { code?: string; message?: string } }).cause;
    if (cause?.code === "ECONNREFUSED") return "Connection refused (is the dev server running?)";
    if (cause?.code === "ENOTFOUND") return `DNS lookup failed (host not found)`;
    if (cause?.code === "ETIMEDOUT") return "Connection timed out";
    if (e.name === "AbortError") return "Request timed out";
    if (cause?.message) return cause.message;
    return e.message;
  }
  return "Unknown network error";
}

export async function request<T = unknown>(opts: RequestOptions): Promise<T> {
  const base = opts.baseUrl ?? DEFAULT_URL;
  const url = buildUrl(base, opts.path, opts.query);
  const method = opts.method ?? "GET";
  const timeoutMs = opts.timeoutMs ?? 15_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        accept: "application/json",
        ...(opts.json !== undefined ? { "content-type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.json !== undefined ? JSON.stringify(opts.json) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    throw new HttpError(url, 0, describeNetworkError(e));
  }
  clearTimeout(timer);

  // Try to parse the body as JSON; fall back to text.
  const contentType = res.headers.get("content-type") ?? "";
  let body: unknown = undefined;
  let text = "";
  try {
    text = await res.text();
    if (text && contentType.includes("application/json")) {
      body = JSON.parse(text);
    } else if (text) {
      body = text;
    }
  } catch {
    body = text;
  }

  if (!res.ok) {
    const errorMsg =
      (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : null) ?? `HTTP ${res.status} ${res.statusText}`;
    throw new HttpError(url, res.status, errorMsg, body);
  }

  return body as T;
}

/** GET helper. */
export function getJson<T = unknown>(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
  timeoutMs?: number,
): Promise<T> {
  return request<T>({ baseUrl, path, query, method: "GET", timeoutMs });
}

/** POST helper. */
export function postJson<T = unknown>(
  baseUrl: string,
  path: string,
  json?: unknown,
  timeoutMs?: number,
): Promise<T> {
  return request<T>({ baseUrl, path, method: "POST", json, timeoutMs });
}
