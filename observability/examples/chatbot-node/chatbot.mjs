/**
 * Multimodal chatbot demo using @theta/observability + real Anthropic Claude.
 *
 * 5 conversation turns where the user uploads an image and asks questions.
 * Each turn = one Trace with 2 Steps (retrieval + llm), image attached.
 *
 * Run:
 *   THETA_API_KEY=tk_... THETA_PROJECT=proj_... THETA_BASE_URL=http://localhost:8080 \
 *   ANTHROPIC_API_KEY=sk-ant-... \
 *   node observability/examples/chatbot-node/chatbot.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { TraceClient } from "@theta/observability";

const HERE = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(HERE, "images");
const IMAGES = readdirSync(IMAGES_DIR)
  .filter((f) => f.endsWith(".png"))
  .sort()
  .map((f) => join(IMAGES_DIR, f));

const MODEL = "claude-opus-4-5";
const USER_MESSAGES = [
  "Here's an image — what do you see?",
  "Describe the dominant colors more precisely.",
  "Could this be a sunset, ocean, or forest?",
  "Summarise everything we've discussed so far in two lines.",
  "Write a one-line caption I could use on Instagram.",
];

async function callClaude(llm, imageBytes, history) {
  const imgB64 = Buffer.from(imageBytes).toString("base64");
  const messages = history.map((h) => ({
    role: h.role,
    content: [{ type: "text", text: h.text }],
  }));
  if (messages.length && messages.at(-1).role === "user") {
    messages.at(-1).content.unshift({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: imgB64 },
    });
  }
  const resp = await llm.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: "You are a friendly multimodal assistant. Keep answers concise.",
    messages,
  });
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return { text, usage: { input: resp.usage.input_tokens, output: resp.usage.output_tokens } };
}

async function fakeRetrieval(query) {
  await new Promise((r) => setTimeout(r, 20));
  return [
    `Memory hit: previously discussed '${query.split(" ")[0]}'`,
    "Memory hit: user prefers concise answers",
  ];
}

async function conversationTurn(obs, llm, userId, turn, imagePath, history) {
  const userMsg = USER_MESSAGES[turn];
  history.push({ role: "user", text: userMsg });
  const imageBytes = readFileSync(imagePath);

  let reply = "";
  await obs.trace(
    {
      name: "chat-turn",
      runType: "prod",
      useCase: "multimodal-chat",
      metadata: { turn, session_id: `sess_${userId}`, model: MODEL, platform: "web" },
      tags: ["chatbot", "claude", "node"],
      userId,
    },
    async (t) => {
      try {
        await t.attachImage(imageBytes, { mime: "image/png" });
      } catch {}

      await t.step({ name: "retrieve memory", type: "retrieval" }, async (s) => {
        const hits = await fakeRetrieval(userMsg);
        s.logMessage({ role: "system", text: "Searching memory..." });
        for (const h of hits) s.logMessage({ role: "system", text: h });
      });

      await t.step({ name: "claude generate", type: "llm", model: MODEL }, async (s) => {
        s.logMessage({ role: "user", text: userMsg, images: [imageBytes] });
        const t0 = Date.now();
        const { text, usage } = await callClaude(llm, imageBytes, history);
        reply = text;
        s.logMessage({ role: "assistant", text });
        s.setTokenUsage({ input: usage.input, output: usage.output });
      });
    }
  );

  history.push({ role: "assistant", text: reply });
  return reply;
}

async function main() {
  if (!IMAGES.length) {
    console.error(`No images under ${IMAGES_DIR}`);
    process.exit(1);
  }
  const obs = new TraceClient({
    apiKey: process.env.THETA_API_KEY,
    project: process.env.THETA_PROJECT,
    baseUrl: process.env.THETA_BASE_URL ?? "http://localhost:8080",
  });
  const llm = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userId = "bob@example.com";
  const history = [];
  for (let turn = 0; turn < 5; turn++) {
    const img = IMAGES[turn % IMAGES.length];
    console.log(`\n-> turn ${turn} (${img.split("/").pop()})  user: ${JSON.stringify(USER_MESSAGES[turn])}`);
    try {
      const reply = await conversationTurn(obs, llm, userId, turn, img, history);
      console.log(`   claude: ${reply.split("\n")[0].slice(0, 120)}`);
    } catch (e) {
      console.error(`   ! turn failed:`, e.message);
      break;
    }
  }
  await obs.flush();
  console.log("\ndone.");
}

main();
