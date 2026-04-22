import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_URL,
  HttpError,
  getJson,
  postJson,
  request,
} from "./http.js";

// Helper: build a Response stand-in. The real `Response` constructor is
// available globally in Node 20+, but we keep the shape minimal so the http
// wrapper exercises the `text()` / `headers.get()` paths it cares about.
function jsonResponse(body: unknown, init?: { status?: number; statusText?: string }): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    statusText: init?.statusText ?? "OK",
    headers: { "content-type": "application/json" },
  });
}

function textResponse(text: string, init?: { status?: number; contentType?: string }): Response {
  return new Response(text, {
    status: init?.status ?? 200,
    headers: { "content-type": init?.contentType ?? "text/plain" },
  });
}

describe("HttpError", () => {
  it("captures url, status, message, and body", () => {
    const e = new HttpError("https://x.test/api/health", 503, "boom", { error: "boom" });
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("HttpError");
    expect(e.url).toBe("https://x.test/api/health");
    expect(e.status).toBe(503);
    expect(e.message).toBe("boom");
    expect(e.body).toEqual({ error: "boom" });
  });

  it("uses status=0 to signal a network-level failure", () => {
    const e = new HttpError("https://x.test/", 0, "Connection refused");
    expect(e.status).toBe(0);
  });
});

describe("DEFAULT_URL", () => {
  it("points at the local dev server convention", () => {
    expect(DEFAULT_URL).toBe("http://localhost:3000");
  });
});

describe("request — success paths", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("GETs JSON and returns the parsed body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true, n: 1 }));
    const out = await request<{ ok: boolean; n: number }>({
      baseUrl: "http://api.local",
      path: "api/health",
    });
    expect(out).toEqual({ ok: true, n: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://api.local/api/health");
    expect((init as RequestInit).method).toBe("GET");
  });

  it("appends query params (skipping undefined / null / empty)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ items: [] }));
    await request({
      baseUrl: "http://api.local",
      path: "api/sim/tasks",
      query: { limit: 10, site: "shopify", domain: undefined, q: null, blank: "" },
    });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toBe("http://api.local/api/sim/tasks?limit=10&site=shopify");
  });

  it("POSTs a JSON body with the right content-type", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await request({
      baseUrl: "http://api.local",
      path: "api/sim/config",
      method: "POST",
      json: { task_id: "t1", seed: 7 },
    });
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ task_id: "t1", seed: 7 }));
    const headers = init.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
    expect(headers.accept).toBe("application/json");
  });

  it("does not set content-type when there is no JSON body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await request({ baseUrl: "http://api.local", path: "api/health" });
    const headers = fetchMock.mock.calls[0]![1]!.headers as Record<string, string>;
    expect(headers).not.toHaveProperty("content-type");
  });

  it("merges custom headers without clobbering accept", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await request({
      baseUrl: "http://api.local",
      path: "api/health",
      headers: { "x-trace": "abc" },
    });
    const headers = fetchMock.mock.calls[0]![1]!.headers as Record<string, string>;
    expect(headers["x-trace"]).toBe("abc");
    expect(headers.accept).toBe("application/json");
  });

  it("returns a string body when content-type is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("ok"));
    const out = await request({ baseUrl: "http://api.local", path: "api/ping" });
    expect(out).toBe("ok");
  });

  it("returns undefined body when response is empty", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const out = await request({ baseUrl: "http://api.local", path: "api/empty" });
    expect(out).toBeUndefined();
  });

  it("uses the default base URL when baseUrl is omitted", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await request({ path: "api/health" });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url.startsWith(DEFAULT_URL)).toBe(true);
  });

  it("supports baseUrl that already ends with a slash", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await request({ baseUrl: "http://api.local/", path: "api/health" });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toBe("http://api.local/api/health");
  });
});

describe("request — error paths", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("throws HttpError with status from a 404", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        statusText: "Not Found",
        headers: { "content-type": "application/json" },
      }),
    );
    await expect(
      request({ baseUrl: "http://api.local", path: "api/missing" }),
    ).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
      message: "not found",
      url: "http://api.local/api/missing",
    });
  });

  it("falls back to a generic 'HTTP <status> <text>' when there is no error body", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("oops", { status: 500, statusText: "Internal Server Error" }),
    );
    await expect(
      request({ baseUrl: "http://api.local", path: "api/sim" }),
    ).rejects.toMatchObject({
      status: 500,
      message: "HTTP 500 Internal Server Error",
    });
  });

  it("preserves a non-string error field as the body but uses the fallback message", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { code: 42 } }), {
        status: 400,
        statusText: "Bad Request",
        headers: { "content-type": "application/json" },
      }),
    );
    const err = await request({ baseUrl: "http://api.local", path: "api/x" }).catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(400);
    expect((err as HttpError).message).toBe("HTTP 400 Bad Request");
    expect((err as HttpError).body).toEqual({ error: { code: 42 } });
  });

  it("maps ECONNREFUSED to a friendly message with status=0", async () => {
    const e = Object.assign(new TypeError("fetch failed"), {
      cause: { code: "ECONNREFUSED" } as Record<string, string>,
    });
    fetchMock.mockRejectedValueOnce(e);
    const err = await request({ baseUrl: "http://api.local", path: "api/health" }).catch((x) => x);
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(0);
    expect((err as HttpError).message).toMatch(/connection refused/i);
  });

  it("maps ENOTFOUND to a DNS message", async () => {
    fetchMock.mockRejectedValueOnce(
      Object.assign(new TypeError("fetch failed"), {
        cause: { code: "ENOTFOUND" } as Record<string, string>,
      }),
    );
    const err = await request({ baseUrl: "http://nowhere.invalid", path: "api/health" }).catch((x) => x);
    expect((err as HttpError).message).toMatch(/dns/i);
  });

  it("maps ETIMEDOUT to a timeout message", async () => {
    fetchMock.mockRejectedValueOnce(
      Object.assign(new TypeError("fetch failed"), {
        cause: { code: "ETIMEDOUT" } as Record<string, string>,
      }),
    );
    const err = await request({ baseUrl: "http://api.local", path: "api/health" }).catch((x) => x);
    expect((err as HttpError).message).toMatch(/timed out/i);
  });

  it("maps AbortError (from timeout) to 'Request timed out'", async () => {
    const ab = new Error("aborted");
    ab.name = "AbortError";
    fetchMock.mockRejectedValueOnce(ab);
    const err = await request({ baseUrl: "http://api.local", path: "api/health" }).catch((x) => x);
    expect((err as HttpError).message).toBe("Request timed out");
  });

  it("falls back to cause.message when present", async () => {
    fetchMock.mockRejectedValueOnce(
      Object.assign(new TypeError("fetch failed"), {
        cause: { message: "socket hang up" } as Record<string, string>,
      }),
    );
    const err = await request({ baseUrl: "http://api.local", path: "api/health" }).catch((x) => x);
    expect((err as HttpError).message).toBe("socket hang up");
  });

  it("falls back to error.message when there is no cause", async () => {
    fetchMock.mockRejectedValueOnce(new Error("plain old error"));
    const err = await request({ baseUrl: "http://api.local", path: "api/health" }).catch((x) => x);
    expect((err as HttpError).message).toBe("plain old error");
  });

  it("handles a non-Error throw", async () => {
    fetchMock.mockRejectedValueOnce("nope");
    const err = await request({ baseUrl: "http://api.local", path: "api/health" }).catch((x) => x);
    expect((err as HttpError).message).toBe("Unknown network error");
  });

  it("aborts the request when timeout elapses", async () => {
    // Track signal so we can assert it was aborted. We avoid fake timers here:
    // when fetch returns a promise that listens to AbortSignal, mixing
    // vi.useFakeTimers + microtask queue ordering produces an unhandled
    // rejection during teardown. A real ~50ms timeout is reliable and quick.
    let observedSignal: AbortSignal | undefined;
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      observedSignal = init.signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        observedSignal!.addEventListener("abort", () => {
          const e = new Error("aborted");
          e.name = "AbortError";
          reject(e);
        });
      });
    });
    const err = await request({
      baseUrl: "http://api.local",
      path: "api/slow",
      timeoutMs: 50,
    }).catch((e) => e);
    expect((err as HttpError).message).toBe("Request timed out");
    expect(observedSignal?.aborted).toBe(true);
  });

  it("treats malformed JSON in success bodies as raw text rather than throwing", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("{bad json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    // The implementation catches the parse failure and falls back to the raw text.
    const out = await request({ baseUrl: "http://api.local", path: "api/raw" });
    expect(out).toBe("{bad json");
  });
});

describe("getJson / postJson convenience helpers", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getJson uses GET", async () => {
    await getJson("http://x.test", "api/foo", { a: 1 });
    expect(fetchMock.mock.calls[0]![1]!.method).toBe("GET");
    expect(fetchMock.mock.calls[0]![0]).toBe("http://x.test/api/foo?a=1");
  });

  it("postJson uses POST and sends a JSON body", async () => {
    await postJson("http://x.test", "api/foo", { x: 1 });
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ x: 1 }));
  });

  it("postJson with no body still uses POST without a content-type header", async () => {
    await postJson("http://x.test", "api/sim/finish");
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
  });
});
