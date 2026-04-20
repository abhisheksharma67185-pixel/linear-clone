import { describe, expect, it, vi } from "vitest";
import { TraceClient } from "../src/client.js";
import { wrapLangChainRunnable } from "../src/integrations/langchain.js";

describe("wrapLangChainRunnable", () => {
  it("records invoke calls into a trace", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const client = new TraceClient({
      apiKey: "k",
      project: "proj_1",
      baseUrl: "https://example.test",
      flushInterval: 10,
      maxBatch: 1,
      fetchImpl,
    });

    const runnable = {
      invoke: vi.fn(async (input: unknown) => ({ content: `answer:${String(input)}` })),
    };

    const wrapped = wrapLangChainRunnable(runnable, { client, name: "langchain-demo" });
    const output = await wrapped.invoke?.("hello world");
    expect(output).toEqual({ content: "answer:hello world" });

    await client.flush();
    await client.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.name).toBe("langchain-demo");
    expect(body.steps[0].messages[0].content[0].text).toBe("hello world");
    expect(body.steps[0].messages.at(-1).content[0].text).toBe("answer:hello world");
  });

  it("records streamed output into a trace", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const client = new TraceClient({
      apiKey: "k",
      project: "proj_1",
      baseUrl: "https://example.test",
      flushInterval: 10,
      maxBatch: 1,
      fetchImpl,
    });

    const runnable = {
      stream: vi.fn(async function* stream() {
        yield { content: "hello " };
        yield { content: "langchain" };
      }),
    };

    const wrapped = wrapLangChainRunnable(runnable, { client, name: "langchain-stream" });
    const stream = await wrapped.stream?.("stream input");
    for await (const _chunk of stream ?? []) {
      // consume
    }

    await client.flush();
    await client.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.name).toBe("langchain-stream");
    expect(body.steps[0].messages[0].content[0].text).toBe("stream input");
    expect(body.steps[0].messages.at(-1).content[0].text).toBe("hello langchain");
  });
});
