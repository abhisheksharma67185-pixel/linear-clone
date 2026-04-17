import { describe, expect, it, vi } from "vitest";
import { TraceClient } from "../src/client.js";
import { wrapOpenClaw } from "../src/integrations/openclaw.js";

describe("wrapOpenClaw", () => {
  it("records responses.create calls on an active trace", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const obs = new TraceClient({
      apiKey: "k",
      project: "proj_1",
      baseUrl: "https://example.test",
      flushInterval: 10,
      maxBatch: 1,
      fetchImpl,
    });

    const openclaw = {
      responses: {
        create: vi.fn(async () => ({
          output_text: "hello from openclaw",
          usage: { input_tokens: 3, output_tokens: 2, total_tokens: 5 },
        })),
      },
    };

    const wrapped = wrapOpenClaw(openclaw, { client: obs });

    await obs.trace({ name: "outer" }, async () => {
      await wrapped.responses.create({
        model: "openclaw-sonic",
        instructions: "You are concise",
        input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "hi" }] }],
      });
    });
    await obs.flush();
    await obs.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    const step = body.steps[0];
    expect(step.name).toBe("openclaw.responses");
    expect(step.messages[0].role).toBe("system");
    expect(step.messages[1].role).toBe("user");
    expect(step.messages[1].content[0].text).toBe("hi");
    expect(step.messages.at(-1).content[0].text).toBe("hello from openclaw");
    expect(step.token_usage.total).toBe(5);
  });

  it("captures streamed text when no trace is active", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const obs = new TraceClient({
      apiKey: "k",
      project: "proj_1",
      baseUrl: "https://example.test",
      flushInterval: 10,
      maxBatch: 1,
      fetchImpl,
    });

    async function* stream() {
      yield { type: "response.output_text.delta", delta: "hello " };
      yield { type: "response.output_text.delta", delta: "world" };
      yield { type: "response.completed", response: { usage: { input_tokens: 1, output_tokens: 2 } } };
    }

    const openclaw = {
      responses: {
        create: vi.fn(async () => stream()),
      },
    };

    const wrapped = wrapOpenClaw(openclaw, { client: obs });
    const result = (await wrapped.responses.create({
      model: "openclaw-sonic",
      input: "hello",
      stream: true,
    })) as AsyncIterable<unknown>;

    for await (const _chunk of result) {
      // consume stream
    }

    await obs.flush();
    await obs.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.name).toBe("openclaw.responses");
    expect(body.steps[0].messages.at(-1).content[0].text).toBe("hello world");
    expect(body.steps[0].token_usage.total).toBe(3);
  });
});
