/**
 * Deterministic end-to-end validation for the published Node SDK surface.
 *
 * This script uses only the Theta SDK API against a running Theta stack:
 * - creates long-form conversation traces
 * - uploads every modality
 * - records metrics
 * - filters traces by metadata
 * - fetches full trace detail
 * - validates an error trace
 *
 * Run after building the SDK:
 *   cd sdk-node && npm run build
 *   THETA_API_KEY=tk_... THETA_PROJECT=proj_... THETA_BASE_URL=http://localhost:8080 \
 *   node examples/full-e2e/test_node.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TraceClient } from "../../sdk-node/dist/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "../multimodal/fixtures");
const BASE_URL = process.env.THETA_BASE_URL ?? "http://localhost:8080";
const API_KEY = requiredEnv("THETA_API_KEY");
const PROJECT = requiredEnv("THETA_PROJECT");

const client = new TraceClient({
  apiKey: API_KEY,
  project: PROJECT,
  baseUrl: BASE_URL,
  flushInterval: 100,
  maxBatch: 1,
});

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readFixture(name) {
  return readFileSync(join(FIXTURES, name));
}

function longText(prefix, repeat = 6) {
  return Array.from({ length: repeat }, (_, index) =>
    `${prefix} paragraph ${index + 1}: the customer is reviewing multimodal evidence, comparing refunds, shipping, voice instructions, and robotic inspection data before approving the final action.`,
  ).join("\n\n");
}

async function waitForTrace(traceId, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const detail = await client.getTrace(traceId);
    if (detail?.trace) {
      return detail;
    }
    await sleep(500);
  }
  throw new Error(`Timed out waiting for trace ${traceId}`);
}

async function waitForTraceInList(runTag, traceId, status) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const result = await client.listTraces({
      status: status ? [status] : undefined,
      metadata: [{ key: "e2e.run_id", value: runTag }],
      limit: 20,
    });
    if (result.data.some((item) => item.trace_id === traceId)) {
      return result;
    }
    await sleep(500);
  }
  throw new Error(`Timed out waiting for filtered trace ${traceId}`);
}

async function emitConversationTrace(runTag) {
  const scene = readFixture("scene.png");
  const voice = readFixture("voice.wav");
  const clip = readFixture("clip.mp4");
  const joints = readFixture("joint_states.bin");
  const toolOutput = readFixture("tool_output.json");

  return client.trace(
    {
      name: "node-sdk-e2e-conversation",
      runType: "eval",
      useCase: "sdk-e2e-validation",
      platform: "server",
      model: "theta-sim-1",
      userId: "node-sdk-e2e@example.com",
      tags: ["sdk-e2e", "node", "multimodal", "long-chat"],
      metadata: {
        suite: "sdk-node",
        scenario: "conversation",
      },
    },
    async (t) => {
      t.setMetadataPath("e2e.run_id", runTag);
      t.setMetadataPath("tenant.org_slug", "theta-demo");
      t.setMetadataPath("customer.segment", "enterprise");
      t.setMetadataPath("conversation.length_bucket", "long");

      const traceManifest = await t.attachFile(
        {
          data: toolOutput,
          mime: "application/json",
          filename: "conversation-manifest.json",
        },
      );
      assert(traceManifest.uri.startsWith("gs://"), "trace-level attachment upload failed");

      await t.step(
        {
          name: "customer-conversation",
          type: "llm",
          model: "theta-sim-1",
        },
        async (s) => {
          await s.attachImage({ data: scene, mime: "image/png", filename: "scene.png" });
          await s.attachAudio({ data: voice, mime: "audio/wav", filename: "voice.wav" });
          await s.attachVideo({ data: clip, mime: "video/mp4", filename: "clip.mp4" });
          await s.attachFile({
            data: toolOutput,
            mime: "application/json",
            filename: "tool-output.json",
          });

          s.logMessage({
            role: "system",
            text: longText("System guardrail"),
          });
          s.logMessage({
            role: "user",
            text: longText("User request"),
            images: [{ data: scene, mime: "image/png", filename: "inline-scene.png" }],
            audio: [{ data: voice, mime: "audio/wav", filename: "inline-voice.wav" }],
            video: [{ data: clip, mime: "video/mp4", filename: "inline-clip.mp4" }],
            attachments: [
              {
                data: toolOutput,
                mime: "application/json",
                filename: "inline-tool-output.json",
              },
            ],
          });
          s.logMessage({
            role: "assistant",
            text: longText("Assistant response"),
          });
          s.setTokenUsage({ input: 3200, output: 980 });
          s.setMetadataPath("conversation.turn_count", 8);
          s.setMetadataPath("conversation.channel", "support-escalation");
        },
      );

      await t.step({ name: "planner", type: "tool" }, async (s) => {
        await s.attachFile({
          data: toolOutput,
          mime: "application/json",
          filename: "planner-output.json",
        });
        s.logToolCall({
          name: "retrieval.search",
          arguments: { query: "refund policy for damaged multimodal order" },
          result: {
            sources: ["policy/refunds", "policy/media-evidence"],
            decision: "eligible_with_manual_review",
          },
        });
        s.setMetadataPath("planner.strategy", "grounded");
      });

      await t.step({ name: "robot-inspection", type: "robotics" }, async (s) => {
        await s.attachSensor(
          {
            data: joints,
            mime: "application/octet-stream",
            filename: "joint_states.bin",
          },
          { modality: "joint_state" },
        );
        await s.logSensorFrame({
          modality: "joint_state",
          source: {
            data: joints,
            mime: "application/octet-stream",
            filename: "joint_states.bin",
          },
          mime: "application/octet-stream",
          durationMs: 1500,
          metadata: { sample_count: 64 },
        });
        await s.logSensorFrame({
          modality: "camera",
          source: { data: clip, mime: "video/mp4", filename: "robot-camera.mp4" },
          mime: "video/mp4",
          fps: 30,
          durationMs: 1000,
          metadata: { lens: "front" },
        });
        s.logMessage({
          role: "assistant",
          text: "Robot inspection complete. Camera and joint-state recordings were attached for audit.",
        });
      });

      return t.id;
    },
  );
}

async function emitErrorTrace(runTag) {
  let traceId = "";
  try {
    await client.trace(
      {
        name: "node-sdk-e2e-error",
        runType: "eval",
        tags: ["sdk-e2e", "node", "error"],
        metadata: { suite: "sdk-node", scenario: "error" },
      },
      async (t) => {
        traceId = t.id;
        t.setMetadataPath("e2e.run_id", runTag);
        await t.step({ name: "fail-fast", type: "tool" }, async () => {
          throw new Error("Simulated node SDK E2E failure");
        });
        return t.id;
      },
    );
  } catch {
    // Expected: the trace should be marked as error and still ingest.
  }
  return traceId;
}

async function main() {
  const runTag = `node-${Date.now()}`;
  const metricName = `sdk_e2e_node_quality_${runTag.replace(/-/g, "_")}`;

  await client.createMetric(metricName, {
    type: "observed",
    description: "Node SDK deterministic E2E validation metric",
  });

  const successTraceId = await emitConversationTrace(runTag);
  const errorTraceId = await emitErrorTrace(runTag);

  await client.flush();

  await client.recordMetric(metricName, successTraceId, {
    passed: true,
    label: "validated",
    metadata: {
      run_tag: runTag,
      sdk: "node",
    },
  });

  const listed = await waitForTraceInList(runTag, successTraceId, "success");
  assert(listed.data.some((item) => item.trace_id === successTraceId), "success trace not returned by listTraces");

  const successDetail = await waitForTrace(successTraceId);
  const errorDetail = await waitForTrace(errorTraceId);

  assert(successDetail.trace?.attachments?.length === 1, "missing trace-level attachment");

  const conversationStep = successDetail.trace?.steps.find((step) => step.name === "customer-conversation");
  assert(conversationStep, "missing conversation step");
  assert(conversationStep.messages?.length === 3, "conversation step should contain three messages");
  assert(
    (conversationStep.messages?.[1]?.content ?? []).map((part) => part.type).join(",") ===
      "text,image,audio,video,file",
    "inline multimodal message content did not persist correctly",
  );
  assert(conversationStep.attachments?.length === 4, "step-level media attachments did not persist");
  assert(
    (conversationStep.messages?.[2]?.content?.[0]?.text?.length ?? 0) > 300,
    "assistant message was not persisted as a long-form response",
  );

  const robotStep = successDetail.trace?.steps.find((step) => step.name === "robot-inspection");
  assert(robotStep, "missing robotics step");
  assert(robotStep.attachments?.some((attachment) => attachment.type === "sensor"), "missing robotics sensor attachment");
  assert(robotStep.sensor_frames?.length === 2, "expected two robotics sensor frames");

  assert(errorDetail.trace?.status === "error", "error trace did not persist with error status");

  console.log(JSON.stringify({
    sdk: "node",
    run_tag: runTag,
    success_trace_id: successTraceId,
    error_trace_id: errorTraceId,
    listed_count: listed.data.length,
    success_steps: successDetail.trace?.steps.length ?? 0,
    trace_attachments: successDetail.trace?.attachments?.length ?? 0,
    robotics_sensor_frames: robotStep.sensor_frames?.length ?? 0,
    error_status: errorDetail.trace?.status,
  }, null, 2));

  await client.shutdown();
}

main().catch(async (error) => {
  console.error(error);
  await client.shutdown().catch(() => {});
  process.exit(1);
});
