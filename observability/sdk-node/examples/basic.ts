/**
 * Basic usage example.
 *
 * Run with:
 *   THETA_API_KEY=... THETA_PROJECT=proj_abc npx tsx examples/basic.ts
 */
import { TraceClient } from "../src/index.js";

const client = new TraceClient({ debug: true });

await client.trace(
  { name: "checkout", runType: "eval", metadata: { gitSha: "abc123" } },
  async (t) => {
    await t.step({ name: "plan", type: "llm", model: "claude-opus-4.6" }, async (s) => {
      s.logMessage({ role: "user", text: "Buy milk" });
      s.logMessage({ role: "assistant", text: "Ok, navigating to store." });
      s.logToolCall({ name: "browser.click", arguments: { selector: "#buy" } });
      s.setTokenUsage({ input: 900, output: 120 });
    });

    await t.step({ name: "verify", type: "tool" }, async (s) => {
      s.logToolCall({ name: "db.query", arguments: { table: "orders" }, result: { rows: 1 } });
    });
  },
);

await client.shutdown();
console.log("trace flushed");
