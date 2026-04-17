import { TraceClient } from "@theta/observability";

const client = new TraceClient({ apiKey: "...", project: "..." });

const support = client.wrapAgent("support-agent", async (ctx, query: string) => {
  const reply = `I can help with: ${query}`;
  ctx.onComplete(reply);
  return reply;
});

const { result, runId } = await support("how do I return?");
await client.recordMetric("task_adherence", runId, { passed: true });
console.log({ result, runId });
