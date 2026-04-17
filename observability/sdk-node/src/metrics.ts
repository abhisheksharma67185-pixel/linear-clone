/**
 * Types for the metrics API surface exposed on TraceClient.
 */

export interface CreateMetricOptions {
  /** "automated" or "observed". */
  type?: "automated" | "observed";
  /** Optional evaluator prompt for LLM-based metrics. */
  evaluatorPrompt?: string;
  /** Optional metric description. */
  description?: string;
  /** Override the target project when using a dashboard token. */
  projectId?: string;
}

export interface MetricValue {
  passed?: boolean;
  score?: number;
  label?: string;
  metadata?: Record<string, unknown>;
  [k: string]: unknown;
}
