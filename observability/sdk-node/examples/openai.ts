/**
 * OpenAI integration example.
 *
 * Run with:
 *   OPENAI_API_KEY=... THETA_API_KEY=... THETA_PROJECT=proj_abc \
 *     npx tsx examples/openai.ts
 */
import OpenAI from "openai";
import { TraceClient } from "../src/index.js";
import { wrapOpenAI } from "../src/integrations/openai.js";

const client = new TraceClient();
const openai = wrapOpenAI(new OpenAI(), { client });

await client.trace({ name: "answer-question" }, async () => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "What's the capital of France?" }],
  });
  // @ts-expect-error — runtime shape
  console.log(res.choices[0].message.content);
});

await client.shutdown();
