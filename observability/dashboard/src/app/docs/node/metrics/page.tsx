import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function NodeMetricsPage() {
  return (
    <>
      <h1>Metrics</h1>
      <p>
        Record evaluation scores, pass/fail results, and labels against traces
        to track quality over time.
      </p>

      <h2>Recording a Metric Event</h2>
      <CodeBlock lang="typescript">
        {`import { TraceClient } from "@theta/observability";

const client = new TraceClient();

// Record by metric name
await client.recordMetric("task_adherence", "tr_abc123", { passed: true });

// Record a score
await client.recordMetric("response_quality", "tr_abc123", { score: 0.92 });

// Record a label
await client.recordMetric("sentiment", "tr_abc123", { label: "positive" });

// Combine fields
await client.recordMetric("met_xyz789", "tr_abc123", {
  passed: true,
  score: 0.85,
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "metricIdOrName", type: "string", required: true, description: "Metric ID ('met_...') or metric name. Name lookup requires API key auth." },
          { name: "traceId", type: "string", required: true, description: "The trace ID to record the metric against." },
          { name: "value.passed", type: "boolean", description: "Pass/fail result for binary metrics." },
          { name: "value.score", type: "number", description: "Numeric score (0.0 to 1.0)." },
          { name: "value.label", type: "string", description: "Categorical label." },
        ]}
      />

      <Callout type="info" title="Fail-soft behavior">
        <p>
          <code>recordMetric()</code> never throws. Errors are logged in debug mode
          but silently swallowed otherwise, ensuring metric recording never crashes
          your application.
        </p>
      </Callout>

      <h2>Creating a Metric Definition</h2>
      <CodeBlock lang="typescript">
        {`// Create an observed (human/code) metric
await client.createMetric("task_adherence", { type: "observed" });

// Create an automated (LLM-evaluated) metric
await client.createMetric("response_quality", {
  type: "automated",
  evaluatorPrompt: "Rate the quality of the response on a scale of 0 to 1...",
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "string", required: true, description: "Unique metric name within the project." },
          { name: "opts.type", type: "string", description: "Metric type: 'automated' or 'observed'." },
          { name: "opts.evaluatorPrompt", type: "string", description: "Prompt for automated evaluation." },
          { name: "opts.metadata", type: "Record<string, unknown>", description: "Arbitrary metadata." },
        ]}
      />

      <h2>Using with Agents</h2>
      <CodeBlock lang="typescript">
        {`const agent = client.wrapAgent("support-agent", async (ctx, input: string) => {
  // ... agent logic ...
  return answer;
});

const { result, runId } = await agent("How do I reset my password?");

// Evaluate the result
await client.recordMetric("task_adherence", runId, { passed: true });
await client.recordMetric("response_quality", runId, { score: 0.95 });`}
      </CodeBlock>

      <p>
        See also: <Link href="/docs/api/metrics">Metrics API Reference</Link> for
        the underlying REST endpoints.
      </p>
    </>
  );
}
