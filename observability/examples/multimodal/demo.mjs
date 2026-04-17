/**
 * Node equivalent of observability/examples/multimodal/demo.py — exercises
 * every modality through @theta/observability.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TraceClient } from "@theta/observability";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, "fixtures");

async function main() {
  const obs = new TraceClient({
    apiKey: process.env.THETA_API_KEY,
    project: process.env.THETA_PROJECT,
    baseUrl: process.env.THETA_BASE_URL ?? "http://localhost:8080",
  });

  const scene = readFileSync(join(FIX, "scene.png"));
  const voice = readFileSync(join(FIX, "voice.wav"));
  const clip = readFileSync(join(FIX, "clip.mp4"));
  const joints = readFileSync(join(FIX, "joint_states.bin"));
  const tool = readFileSync(join(FIX, "tool_output.json"));

  await obs.trace(
    {
      name: "multimodal-omni-node",
      runType: "prod",
      useCase: "demo",
      metadata: { demo: "every-modality-node", platform: "web", model: "claude-opus-4-5" },
      tags: ["multimodal", "node", "image", "audio", "video", "sensor", "file"],
      userId: "dana@example.com",
    },
    async (t) => {
      await t.attachImage({ data: scene, mime: "image/png", filename: "scene.png" });
      await t.attachAudio({ data: voice, mime: "audio/wav", filename: "voice.wav" });
      await t.attachVideo({ data: clip, mime: "video/mp4", filename: "clip.mp4" });
      await t.attachFile({ data: tool, mime: "application/json", filename: "tool_output.json" });
      await t.attachFile({ data: joints, mime: "application/octet-stream", filename: "joint_states.bin" });

      await t.step({ name: "perceive", type: "llm", model: "claude-opus-4-5" }, (s) => {
        s.logMessage({
          role: "user",
          text: "What do you see, hear, and feel?",
          images: [scene],
          audio: [voice],
        });
        s.logMessage({
          role: "assistant",
          text: "Red hue, 550 Hz tone, arm mid-reach.",
        });
        s.setTokenUsage({ input: 200, output: 55 });
      });

      await t.step({ name: "execute", type: "robotics" }, (s) => {
        s.logToolCall({
          name: "arm.execute",
          arguments: { trajectory_id: "rrt_node_42" },
          result: { success: true },
          latencyMs: 1100,
        });
      });
    }
  );

  await obs.flush();
  console.log("done.");
}

main().catch((e) => {
  console.error("failed:", e);
  process.exit(1);
});
