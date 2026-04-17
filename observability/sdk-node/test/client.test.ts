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
});
