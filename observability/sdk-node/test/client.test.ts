import { describe, it, expect, vi } from "vitest";
import { TraceClient } from "../src/client.js";

describe("TraceClient", () => {
  it("disables when no api key / project", async () => {
    const c = new TraceClient({});
    expect(c.disabled).toBe(true);
    const result = await c.trace({ name: "t1" }, async () => 42);
    expect(result).toBe(42);
  });

  it("posts a trace payload to /v1/traces with api key", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const c = new TraceClient({
      apiKey: "sk_test",
      project: "proj_1",
      baseUrl: "https://example.test",
      flushInterval: 10,
      maxBatch: 1,
      fetchImpl,
    });

    await c.trace({ name: "hello" }, async (t) => {
      await t.step({ name: "sub", type: "llm" }, async (s) => {
        s.logMessage({ role: "user", text: "hi" });
        s.setTokenUsage({ input: 10, output: 2 });
      });
    });
    await c.flush();
    await c.shutdown();

    expect(fetchImpl).toHaveBeenCalled();
    const call = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe("https://example.test/v1/traces");
    const init = call[1] as RequestInit;
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk_test");
    const body = JSON.parse(init.body as string);
    expect(body.project_id).toBe("proj_1");
    expect(body.name).toBe("hello");
    expect(body.status).toBe("success");
    expect(body.steps).toHaveLength(1);
    expect(body.steps[0].token_usage.total).toBe(12);
  });

  it("captures errors as status=error and re-throws", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const c = new TraceClient({
      apiKey: "k",
      project: "p",
      baseUrl: "https://x",
      fetchImpl,
    });

    await expect(
      c.trace({ name: "boom" }, async () => {
        throw new Error("nope");
      }),
    ).rejects.toThrow("nope");
    await c.flush();
    await c.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.status).toBe("error");
    expect(body.error_message).toBe("nope");
  });

  it("lists traces with metadata filters", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toContain("/v1/traces?");
      expect(url).toContain("project_id=proj_1");
      expect(url).toContain("run_type=prod");
      expect(url).toContain("meta_key=workflow.stage");
      expect(url).toContain("meta_value=checkout");
      return new Response(
        JSON.stringify({
          items: [
            {
              trace_id: "tr_1",
              project_id: "proj_1",
              name: "checkout",
              status: "success",
              metadata: { workflow: { stage: "checkout" } },
              started_at: "2026-04-17T00:00:00Z",
            },
          ],
          next_cursor: "next-1",
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const client = new TraceClient({
      apiKey: "sk_test",
      project: "proj_1",
      baseUrl: "https://example.test",
      fetchImpl,
    });

    const result = await client.listTraces({
      runType: ["prod"],
      metadata: [{ key: "workflow.stage", value: "checkout" }],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].metadata).toEqual({ workflow: { stage: "checkout" } });
    expect(result.nextCursor).toBe("next-1");
  });

  it("fetches a full trace by id", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toBe("https://example.test/v1/traces/tr_123");
      return new Response(
        JSON.stringify({
          meta: {
            trace_id: "tr_123",
            project_id: "proj_1",
            name: "checkout",
            status: "success",
            started_at: "2026-04-18T00:00:00Z",
          },
          trace: {
            schema_version: "1.0",
            trace_id: "tr_123",
            project_id: "proj_1",
            name: "checkout",
            status: "success",
            started_at: "2026-04-18T00:00:00Z",
            steps: [
              {
                step_id: "st_1",
                type: "llm",
                name: "plan",
                started_at: "2026-04-18T00:00:00Z",
              },
            ],
          },
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const client = new TraceClient({
      apiKey: "sk_test",
      project: "proj_1",
      baseUrl: "https://example.test",
      fetchImpl,
    });

    const result = await client.getTrace("tr_123");

    expect(result?.meta.trace_id).toBe("tr_123");
    expect(result?.trace?.steps).toHaveLength(1);
    expect(result?.trace?.steps[0]?.name).toBe("plan");
  });

  it("ingests canonical event envelopes", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toBe("https://example.test/v1/events");
      const body = JSON.parse(init?.body as string);
      expect(body.project_id).toBe("proj_1");
      expect(body.events).toHaveLength(1);
      return new Response(
        JSON.stringify({
          trace_id: "tr_canonical",
          ingest_status: "accepted",
          normalized: true,
        }),
        { status: 202 },
      );
    }) as unknown as typeof fetch;

    const client = new TraceClient({
      apiKey: "sk_test",
      project: "proj_1",
      baseUrl: "https://example.test",
      fetchImpl,
    });

    const result = await client.ingestEvents({
      name: "canonical-run",
      events: [{ type: "message", role: "user", message: { role: "user", content: [{ type: "text", text: "hi" }] } }],
    });

    expect(result.trace_id).toBe("tr_canonical");
    expect(result.normalized).toBe(true);
  });

  it("bulk imports traces and canonical envelopes", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      expect(url).toBe("https://example.test/v1/imports/traces");
      expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
      const body = JSON.parse(init?.body as string);
      expect(body).toHaveLength(2);
      return new Response(
        JSON.stringify({
          accepted: 2,
          failed: 0,
          items: [
            { index: 0, kind: "trace", trace_id: "tr_1", status: "accepted" },
            { index: 1, kind: "canonical_envelope", trace_id: "tr_2", status: "accepted" },
          ],
        }),
        { status: 202 },
      );
    }) as unknown as typeof fetch;

    const client = new TraceClient({
      apiKey: "sk_test",
      project: "proj_1",
      baseUrl: "https://example.test",
      fetchImpl,
    });

    const result = await client.importTraces([
      {
        schema_version: "1.0",
        trace_id: "tr_1",
        project_id: "proj_1",
        name: "native",
        status: "success",
        started_at: "2026-04-18T00:00:00Z",
        steps: [],
      },
      {
        name: "canonical",
        events: [],
      },
    ]);

    expect(result.accepted).toBe(2);
    expect(result.failed).toBe(0);
  });
});
