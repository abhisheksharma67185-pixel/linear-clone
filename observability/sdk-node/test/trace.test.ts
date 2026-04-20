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

  it("serializes message media, step attachments, and sensor frames", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.endsWith("/v1/traces")) {
        return new Response("{}", { status: 200 });
      }
      return new Response(
        JSON.stringify({
          gs_uri: "gs://theta-obs/uploads/fixture.bin",
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const c = new TraceClient({
      apiKey: "k",
      project: "p",
      baseUrl: "https://x",
      fetchImpl,
    });

    await c.trace({ name: "media" }, async (t) => {
      await t.step({ name: "robot", type: "robotics" }, async (s) => {
        s.logMessage({
          role: "user",
          text: "Review all modalities.",
          audio: ["gs://theta-obs/voice.wav"],
          video: ["gs://theta-obs/clip.mp4"],
          attachments: ["gs://theta-obs/tool.json"],
        });
        await s.attachImage("gs://theta-obs/scene.png");
        await s.attachSensor("gs://theta-obs/joints.bin", { modality: "joint_state" });
        await s.logSensorFrame({
          modality: "camera",
          source: "gs://theta-obs/camera.mp4",
          mime: "video/mp4",
          fps: 30,
          durationMs: 1200,
        });
      });
    });
    await c.flush();
    await c.shutdown();

    const body = JSON.parse(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === "https://x/v1/traces",
      )?.[1].body,
    );
    const step = body.steps[0];
    const contentTypes = step.messages[0].content.map((part: { type: string }) => part.type);

    expect(contentTypes).toEqual(["text", "audio", "video", "file"]);
    expect(step.attachments).toHaveLength(2);
    expect(step.attachments[0].type).toBe("image");
    expect(step.attachments[1].type).toBe("sensor");
    expect(step.sensor_frames).toHaveLength(1);
    expect(step.sensor_frames[0].modality).toBe("camera");
  });
});
