import { describe, it, expect, vi } from "vitest";
import { TraceClient } from "../src/client.js";
import { getActiveStep } from "../src/async-context.js";

describe("Trace nesting", () => {
  it("parents nested steps via AsyncLocalStorage", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const c = new TraceClient({
      apiKey: "k",
      project: "p",
      baseUrl: "https://x",
      fetchImpl,
    });

    let outerId = "";
    let innerParent = "";
    await c.trace({ name: "root" }, async (t) => {
      await t.step({ name: "outer", type: "tool" }, async (s) => {
        outerId = s.id;
        await t.step({ name: "inner", type: "llm" }, async () => {
          innerParent = getActiveStep()?.id ?? "";
        });
      });
    });
    await c.flush();
    await c.shutdown();

    // getActiveStep inside inner should be the inner step itself.
    expect(innerParent).not.toBe("");

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    const inner = body.steps.find((s: { name: string }) => s.name === "inner");
    expect(inner.parent_step_id).toBe(outerId);
  });

  it("writes nested metadata paths on traces and steps", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const c = new TraceClient({
      apiKey: "k",
      project: "p",
      baseUrl: "https://x",
      fetchImpl,
    });

    await c.trace({ name: "root" }, async (t) => {
      t.setMetadataPath("workflow.stage", "checkout");
      await t.step({ name: "inner", type: "tool" }, async (s) => {
        s.setMetadataPath("agent.version", "v2");
      });
    });
    await c.flush();
    await c.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.metadata).toEqual({ workflow: { stage: "checkout" } });
    expect(body.steps[0].metadata).toEqual({ agent: { version: "v2" } });
  });
});
