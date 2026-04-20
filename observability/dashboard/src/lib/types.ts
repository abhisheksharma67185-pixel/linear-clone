// Mirrors observability/schema/trace.schema.json
// Keep in sync with plan §1 and the Go API response shapes.

export type TraceStatus = "success" | "error" | "running";
export type Platform = "web" | "mobile" | "desktop" | "api" | "robotics" | "voice";
export type RunType = "eval" | "prod" | "dev" | "debug";

export type StepType =
  | "llm"
  | "tool"
  | "retrieval"
  | "robotics"
  | "human"
  | "annotation"
  | "custom";

export type AttachmentType = "text" | "image" | "audio" | "video" | "sensor" | "file";

export interface Attachment {
  type: AttachmentType;
  uri?: string; // gs:// ref
  url?: string; // signed URL for the dashboard
  text?: string;
  mime?: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  sample_rate?: number;
  fps?: number;
  bytes?: number;
  modality?: string; // for sensor frames: joint_state, camera, imu, ...
  metadata?: Record<string, unknown>;
}

export interface MessageContent {
  type: AttachmentType;
  text?: string;
  uri?: string;
  url?: string;
  mime?: string;
  width?: number;
  height?: number;
}

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: MessageContent[];
  name?: string;
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments?: unknown;
  result?: unknown;
  error?: string;
  latency_ms?: number;
}

export interface TokenUsage {
  input?: number;
  output?: number;
  total?: number;
}

export interface ObservedEvent {
  event_id?: string;
  parent_event_id?: string;
  step_id?: string;
  parent_step_id?: string;
  index?: number;
  type: string;
  name?: string;
  role?: Message["role"];
  status?: TraceStatus | "cancelled";
  started_at?: string;
  ended_at?: string;
  latency_ms?: number;
  model?: string;
  message?: Message;
  tool_call?: ToolCall;
  attachment?: Attachment;
  sensor_frame?: Attachment;
  value?: unknown;
  metadata?: Record<string, unknown>;
}

export interface Step {
  step_id: string;
  parent_step_id?: string;
  index: number;
  type: StepType;
  name?: string;
  model?: string;
  status?: TraceStatus;
  started_at?: string;
  ended_at?: string;
  latency_ms?: number;
  token_usage?: TokenUsage;
  cost_usd?: number;
  messages?: Message[];
  tool_calls?: ToolCall[];
  events?: ObservedEvent[];
  attachments?: Attachment[];
  sensor_frames?: Attachment[];
  metadata?: Record<string, unknown>;
  error_message?: string;
}

export interface Trace {
  schema_version: string;
  trace_id: string;
  project_id: string;
  org_id?: string;
  name: string;
  run_id?: string;
  run_type?: RunType;
  use_case?: string;
  user_id?: string;
  group?: string;
  platform?: Platform;
  model?: string;
  status: TraceStatus;
  error_message?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  started_at: string;
  ended_at?: string;
  latency_ms?: number;
  token_usage?: TokenUsage;
  cost_usd?: number;
  step_count?: number;
  has_media?: boolean;
  attachments?: Attachment[];
  events?: ObservedEvent[];
  steps?: Step[];
}

export interface TraceSummary {
  trace_id: string;
  project_id: string;
  name: string;
  status: TraceStatus;
  platform?: Platform;
  model?: string;
  user_id?: string;
  run_id?: string;
  run_type?: RunType;
  use_case?: string;
  group?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  started_at: string;
  latency_ms?: number;
  total_tokens?: number;
  cost_usd?: number;
  step_count?: number;
}

export interface TraceMetadataFilter {
  key: string;
  value: string;
}

export interface TraceMetadataField {
  key: string;
  value_type: "string" | "number" | "boolean" | "null" | "mixed";
  occurrences: number;
  example_values?: string[];
}

export interface Project {
  id: string;
  slug: string;
  org_id: string;
  name: string;
  description?: string;
  retention_days: number;
  created_at: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "pro" | "team" | "enterprise";
  created_at: string;
}

export interface ApiKey {
  id: string;
  project_id: string;
  name: string;
  prefix: string;
  last_used_at?: string;
  created_at: string;
  created_by?: string;
  scopes: string[];
  revoked_at?: string;
}

export type Role = "owner" | "admin" | "member" | "viewer";

export interface Member {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: Role;
  added_at: string;
}

export interface Annotation {
  id: string;
  trace_id: string;
  step_id?: string;
  project_id: string;
  label?: string;
  score?: number;
  comment?: string;
  annotation_type: "manual" | "automated" | "feedback";
  user_id?: string;
  created_at: string;
}

export type AnnotationType = "manual" | "automated" | "feedback";

export interface ListTracesFilters {
  search?: string;
  status?: TraceStatus[];
  platform?: Platform[];
  model?: string[];
  run_type?: RunType[];
  use_case?: string[];
  user_id?: string;
  run_id?: string;
  group?: string;
  metadata?: TraceMetadataFilter[];
  annotation_labels?: string[];
  time_range?: "1h" | "24h" | "7d" | "30d" | "all";
  sort?: "newest" | "oldest" | "slowest" | "most_expensive";
  cursor?: string;
  limit?: number;
}

export interface Metric {
  id: string;
  project_id: string;
  name: string;
  type: "automated" | "observed";
  evaluator_prompt?: string;
  description?: string;
  created_at: string;
}

export interface MetricEvent {
  id: string;
  metric_id: string;
  metric_name?: string;
  trace_id: string;
  passed?: boolean;
  score?: number;
  label?: string;
  metadata?: Record<string, unknown>;
  evaluated_at: string;
}

export interface ConversationThread {
  id: string;
  project_id: string;
  title: string;
  external_id?: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
  trace_ids: string[];
  trace_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorConfig {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  signal_key: string;
  operator: string;
  warn_threshold?: number;
  critical_threshold?: number;
  window_minutes: number;
  group_by?: string;
  filters?: Record<string, unknown>;
  active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  latest_evaluation?: MonitorEvaluation;
}

export interface MonitorEvaluation {
  state: "ok" | "warn" | "critical" | "paused" | "no_data" | "unsupported" | "error";
  value?: number;
  sample_size: number;
  window_start: string;
  window_end: string;
  evaluated_at: string;
  group_states?: MonitorGroupState[];
}

export interface MonitorGroupState {
  group: string;
  value: number;
  state: "ok" | "warn" | "critical" | "paused" | "no_data" | "unsupported" | "error";
  sample_size: number;
}

export interface Usage {
  org_id: string;
  events_ingested: number;
  media_bytes: number;
  api_requests: number;
  period_start: string;
  period_end: string;
}

export interface Webhook {
  id: string;
  project_id: string;
  url: string;
  events: string[];
  active: boolean;
  last_delivery_at?: string;
  last_delivery_status?: number;
  created_at: string;
}

export interface Incident {
  id: string;
  project_id: string;
  title: string;
  summary?: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  root_cause?: string;
  severity: "low" | "medium" | "high" | "critical";
  error_pattern?: string;
  first_seen_at: string;
  last_seen_at: string;
  trace_count: number;
  trace_ids?: string[];
  created_at: string;
}

export interface Cluster {
  id: string;
  project_id: string;
  label: string;
  description?: string;
  category: "input" | "behavior" | "error" | "unknown";
  trace_count: number;
  representative_trace_id?: string;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  traces?: { trace_id: string; distance: number }[];
}

export interface SavedFilter {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  filters: ListTracesFilters;
  color?: string;
  is_default: boolean;
  created_by?: string;
  created_at: string;
}

export interface SearchResult {
  trace_id: string;
  name: string;
  status: string;
  score: number;
  user_id?: string;
  started_at?: string;
  tags?: string[];
}
