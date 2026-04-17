import { describe, it, expect, vi } from "vitest";
import { BatchSender } from "../src/batch.js";
import type { TracePayload } from "../src/types.js";

function makeTrace(id = "tr_1"): TracePayload {
  return {
    schema_version: "1.0",
    trace_id: id,
    project_id: "p",
    name: "t",
    status: "success",
    started_at: new Date().toISOString(),
    steps: [],
  };
}

describe("BatchSender", () => {
  it("retries on 5xx then succeeds", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls++;
      if (calls < 2) return new Response("err", { status: 503 });
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;

    const s = new BatchSender({
      apiKey: "k",
      baseUrl: "https://x",
      flushInterval: 10_000,
      maxBatch: 100,
      timeout: 5000,
      debug: false,
      fetchImpl,
      maxRetries: 3,
    });
    s.enqueue(makeTrace());
    await s.flush();
    await s.shutdown();
    expect(calls).toBe(2);
  });

  it("does not retry on 4xx", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls++;
      return new Response("bad", { status: 400 });
    }) as unknown as typeof fetch;

    const s = new BatchSender({
      apiKey: "k",
      baseUrl: "https://x",
      flushInterval: 10_000,
      maxBatch: 100,
      timeout: 5000,
      debug: false,
      fetchImpl,
      maxRetries: 3,
    });
    s.enqueue(makeTrace());
    await s.flush();
    await s.shutdown();
    expect(calls).toBe(1);
  });

  it("swallows fetch exceptions without throwing into user code", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network dead");
    }) as unknown as typeof fetch;

    const s = new BatchSender({
      apiKey: "k",
      baseUrl: "https://x",
      flushInterval: 10_000,
      maxBatch: 100,
      timeout: 5000,
      debug: false,
      fetchImpl,
      maxRetries: 1,
    });
    s.enqueue(makeTrace());
    await expect(s.flush()).resolves.toBeUndefined();
    await s.shutdown();
  });
});
