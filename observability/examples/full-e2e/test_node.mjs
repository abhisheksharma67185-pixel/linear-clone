/**
 * Full E2E test: Node SDK + Claude Sonnet 4.6 + all modalities.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { TraceClient } from "@theta/observability";

const MODEL = "claude-sonnet-4-6";
const HERE = dirname(fileURLToPath(import.meta.url));

// ── Fixtures ─────────────────────────────────────────────

function makePng() {
  // Read from multimodal fixtures
  try {
    return readFileSync(join(HERE, "../multimodal/fixtures/scene.png"));
  } catch {
    return Buffer.from("89504e470d0a1a0a0000000d4948445200000010000000100806000000", "hex");
  }
}
function makeWav() {
  try { return readFileSync(join(HERE, "../multimodal/fixtures/voice.wav")); }
  catch { return Buffer.alloc(256); }
}
function makeMp4() {
  try { return readFileSync(join(HERE, "../multimodal/fixtures/clip.mp4")); }
  catch { return Buffer.from("0000002066747970", "hex"); }
}
function makeSensor() {
  try { return readFileSync(join(HERE, "../multimodal/fixtures/joint_states.bin")); }
  catch { return Buffer.alloc(128); }
}
function makeJson() {
  return Buffer.from(JSON.stringify({ tool: "search", results: ["a", "b"] }));
}

// ── Setup ─────────────────────────────────────────────────

const obs = new TraceClient({
  apiKey: process.env.THETA_API_KEY,
  project: process.env.THETA_PROJECT,
  baseUrl: process.env.THETA_BASE_URL ?? "http://localhost:8080",
});
const llm = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let passed = 0;
let failed = 0;

async function test(name, fn) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST: ${name}`);
  console.log(`${"=".repeat(60)}`);
  try {
    await fn();
    console.log("  ✓ PASSED");
    passed++;
  } catch (e) {
    console.log(`  ✗ FAILED: ${e.message}`);
    failed++;
  }
}

// ── Tests ─────────────────────────────────────────────────

await test("1. wrapAgent with Claude Sonnet 4.6", async () => {
  const agent = obs.wrapAgent("sonnet-agent-node", async (ctx, query) => {
    const resp = await llm.messages.create({
      model: MODEL, max_tokens: 200,
      messages: [{ role: "user", content: query }],
    });
    const reply = resp.content[0].text;
    ctx.onComplete(reply);
    await ctx.trace.step({ name: "llm-call", type: "llm", model: MODEL }, (s) => {
      s.logMessage({ role: "user", text: query });
      s.logMessage({ role: "assistant", text: reply });
      s.setTokenUsage({ input: resp.usage.input_tokens, output: resp.usage.output_tokens });
    });
    return reply;
  });

  const { result, runId } = await agent("Say hello in exactly 5 words");
  if (!runId) throw new Error("missing runId");
  if (!result) throw new Error("empty result");
  console.log(`  runId=${runId.slice(0, 30)}...`);
  console.log(`  result=${result.slice(0, 80)}`);

  await obs.recordMetric("task_adherence", runId, { passed: true });
  await obs.recordMetric("user_satisfaction", runId, { score: 0.92 });
  console.log("  metrics recorded");
});

await test("2. Multimodal: image + audio + video + sensor + file", async () => {
  const png = makePng();
  const wav = makeWav();
  const mp4 = makeMp4();
  const sensor = makeSensor();
  const json = makeJson();

  await obs.trace({
    name: "multimodal-sonnet-node",
    runType: "eval",
    useCase: "all-modalities",
    tags: ["e2e", "sonnet", "node", "multimodal"],
    userId: "e2e-node@theta.dev",
    metadata: { platform: "web", model: MODEL },
  }, async (t) => {
    const imgUri = await t.attachImage({ data: png, mime: "image/png", filename: "scene.png" });
    const audUri = await t.attachAudio({ data: wav, mime: "audio/wav", filename: "voice.wav" });
    const vidUri = await t.attachVideo({ data: mp4, mime: "video/mp4", filename: "clip.mp4" });
    const filUri = await t.attachFile({ data: json, mime: "application/json", filename: "tool.json" });
    const senUri = await t.attachFile({ data: sensor, mime: "application/octet-stream", filename: "joints.bin" });

    console.log(`  image: ${imgUri?.uri?.slice(0, 40) ?? "ok"}...`);
    console.log(`  audio: ${audUri?.uri?.slice(0, 40) ?? "ok"}...`);

    await t.step({ name: "vision", type: "llm", model: MODEL }, async (s) => {
      const imgB64 = png.toString("base64");
      const resp = await llm.messages.create({
        model: MODEL, max_tokens: 100,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imgB64 } },
          { type: "text", text: "What color is this?" },
        ]}],
      });
      const reply = resp.content[0].text;
      s.logMessage({ role: "user", text: "What color is this?", images: [png] });
      s.logMessage({ role: "assistant", text: reply });
      s.setTokenUsage({ input: resp.usage.input_tokens, output: resp.usage.output_tokens });
      console.log(`  vision: ${reply.slice(0, 60)}`);
    });

    await t.step({ name: "tool-use", type: "tool" }, (s) => {
      s.logToolCall({
        name: "web.search",
        arguments: { query: "color meaning" },
        result: { results: ["trust", "calm"] },
        latencyMs: 120,
      });
    });

    await t.step({ name: "robotics", type: "robotics" }, (s) => {
      s.logToolCall({
        name: "arm.execute",
        arguments: { goal: [0.5, 0.2] },
        result: { ok: true },
        latencyMs: 900,
      });
    });
  });
});

await test("3. Error trace", async () => {
  try {
    await obs.trace({ name: "error-sonnet-node", runType: "eval", tags: ["e2e", "error"] }, async (t) => {
      await t.step({ name: "fail", type: "llm", model: MODEL }, () => {
        throw new Error("Simulated timeout");
      });
    });
  } catch {}
  console.log("  error trace committed");
});

await test("4. Chatbot (3 turns) with Claude Sonnet 4.6", async () => {
  const png = makePng();
  const history = [];
  const questions = [
    "Describe this image briefly.",
    "What emotions does the color evoke?",
    "Summarize in one word.",
  ];

  for (let turn = 0; turn < 3; turn++) {
    const userMsg = questions[turn];
    history.push({ role: "user", content: userMsg });

    await obs.trace({
      name: `chatbot-node-turn-${turn}`,
      runType: "eval",
      tags: ["e2e", "chatbot", "node"],
      userId: "chatbot-node@theta.dev",
      metadata: { model: MODEL, turn },
    }, async (t) => {
      if (turn === 0) await t.attachImage({ data: png, mime: "image/png" });

      await t.step({ name: "generate", type: "llm", model: MODEL }, async (s) => {
        const apiMsgs = history.map(h => ({ role: h.role, content: h.content }));
        if (turn === 0) {
          apiMsgs[0] = { role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/png", data: png.toString("base64") } },
            { type: "text", text: userMsg },
          ]};
        }
        const resp = await llm.messages.create({ model: MODEL, max_tokens: 100, messages: apiMsgs });
        const reply = resp.content[0].text;
        s.logMessage({ role: "user", text: userMsg });
        s.logMessage({ role: "assistant", text: reply });
        s.setTokenUsage({ input: resp.usage.input_tokens, output: resp.usage.output_tokens });
        history.push({ role: "assistant", content: reply });
        console.log(`  turn ${turn}: ${reply.slice(0, 60)}`);
      });
    });
  }
});

// ── Flush + report ───────────────────────────────────────

await obs.flush();
console.log(`\n${"=".repeat(60)}`);
console.log(`NODE E2E RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(60)}`);
if (failed > 0) process.exit(1);
