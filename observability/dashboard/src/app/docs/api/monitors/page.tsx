import { CodeBlock } from "@/components/docs/code-block";

export default function APIMonitorsPage() {
  return (
    <>
      <h1>Monitor Configs API</h1>
      <p>
        Monitor configs define project-scoped alert thresholds over trace-derived
        signals such as latency, error rate, token spend, or custom mapped metrics.
      </p>

      <h2>Create Monitor</h2>
      <CodeBlock lang="json">
        {`{
  "name": "Slow desktop runs",
  "signal_key": "latency_ms",
  "operator": "gt",
  "warn_threshold": 5000,
  "critical_threshold": 10000,
  "window_minutes": 10,
  "group_by": "platform",
  "filters": {
    "platform": ["desktop"]
  },
  "active": true
}`}
      </CodeBlock>

      <h2>List, Update, Delete</h2>
      <p>
        Use <code>GET /v1/projects/:id/monitors</code> to list configs, then
        <code>PATCH /v1/monitors/:monitor_id</code> or
        <code>DELETE /v1/monitors/:monitor_id</code> to manage them.
      </p>

      <h2>Intended Use</h2>
      <p>
        Monitor configs are the control-plane layer for alerting. They define the
        threshold policy even when the data arrives through SDKs, generic event
        ingest, or external adapters.
      </p>
    </>
  );
}
