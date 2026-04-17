export type TraceColumn =
  | "name"
  | "status"
  | "metadata"
  | "latency"
  | "tokens"
  | "cost"
  | "started";

export type TraceDensity = "comfortable" | "compact";

export const TRACE_COLUMNS: TraceColumn[] = [
  "name",
  "status",
  "metadata",
  "latency",
  "tokens",
  "cost",
  "started",
];

export const TRACE_COLUMN_LABELS: Record<TraceColumn, string> = {
  name: "Name",
  status: "Status",
  metadata: "Metadata",
  latency: "Latency",
  tokens: "Tokens",
  cost: "Cost",
  started: "Started",
};

export const DEFAULT_TRACE_COLUMNS: TraceColumn[] = [...TRACE_COLUMNS];
export const DEFAULT_TRACE_DENSITY: TraceDensity = "comfortable";
