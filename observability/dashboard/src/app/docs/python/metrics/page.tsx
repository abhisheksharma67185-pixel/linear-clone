import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function PythonMetricsPage() {
  return (
    <>
      <h1>Metrics</h1>
      <p>
        Theta metrics let you record evaluation scores, pass/fail results, and labels
        against traces. Use them to track quality over time, set up automated evaluations,
        and build dashboards.
      </p>

      <h2>Recording a Metric Event</h2>
      <p>
        Use <code>client.record_metric()</code> to record a metric event against a trace.
        You can reference the metric by ID or by name.
      </p>
      <CodeBlock lang="python">
        {`from theta_observability import TraceClient

client = TraceClient()

# Record by metric name
client.record_metric("task_adherence", "tr_abc123", passed=True)

# Record a score
client.record_metric("response_quality", "tr_abc123", score=0.92)

# Record a label
client.record_metric("sentiment", "tr_abc123", label="positive")

# Record by metric ID
client.record_metric("met_xyz789", "tr_abc123", passed=True, score=0.85)`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "metric_id_or_name", type: "str", required: true, description: "Metric ID (e.g. 'met_xyz') or metric name (e.g. 'task_adherence'). Name lookup requires API key auth for project context." },
          { name: "trace_id", type: "str", required: true, description: "The trace ID to record the metric against." },
          { name: "passed", type: "bool | None", description: "Pass/fail result for binary metrics." },
          { name: "score", type: "float | None", description: "Numeric score (0.0 to 1.0) for scored metrics." },
          { name: "label", type: "str | None", description: "Categorical label for classification metrics." },
        ]}
      />

      <Callout type="info" title="Fail-soft behavior">
        <p>
          <code>record_metric()</code> never raises exceptions. If the API call fails,
          it logs a warning and continues. This ensures metric recording never crashes
          your application.
        </p>
      </Callout>

      <h2>Creating a Metric Definition</h2>
      <p>
        Before recording events, create a metric definition. This is typically done once
        during setup.
      </p>
      <CodeBlock lang="python">
        {`# Create a manual/observed metric
client.create_metric(
    name="task_adherence",
    type="observed",
)

# Create an automated metric with an evaluator prompt
client.create_metric(
    name="response_quality",
    type="automated",
    evaluator_prompt="Rate the quality of the response on a scale of 0 to 1...",
)`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "str", required: true, description: "Unique name for the metric within the project." },
          { name: "type", type: "str", required: true, description: "Metric type: 'automated' (LLM-evaluated) or 'observed' (human/code-recorded)." },
          { name: "evaluator_prompt", type: "str | None", description: "Prompt template for automated evaluation. Only used when type='automated'." },
        ]}
      />

      <h2>Using with Agents</h2>
      <p>
        The most common pattern is recording metrics after an agent run using the
        <code>run_id</code> from <code>AgentResult</code>:
      </p>
      <CodeBlock lang="python">
        {`@client.wrap_agent("support-agent")
def my_agent(ctx, question: str) -> str:
    # ... agent logic ...
    return answer

result, run_id = my_agent("How do I reset my password?")

# Evaluate the result
client.record_metric("task_adherence", run_id, passed=True)
client.record_metric("response_quality", run_id, score=0.95)`}
      </CodeBlock>

      <p>
        See also: <Link href="/docs/api/metrics">Metrics API Reference</Link> for
        the underlying REST endpoints.
      </p>
    </>
  );
}
