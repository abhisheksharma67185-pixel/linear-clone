import { z } from "zod";

/** Trace schema version emitted by this SDK. */
export const SCHEMA_VERSION = "1.0";

export const StepTypeSchema = z.enum([
  "llm",
  "tool",
  "retrieval",
  "robotics",
  "human",
  "annotation",
  "custom",
]);
export type StepType = z.infer<typeof StepTypeSchema>;

export const AttachmentTypeSchema = z.enum([
  "text",
  "image",
  "audio",
  "video",
  "sensor",
  "file",
]);
export type AttachmentType = z.infer<typeof AttachmentTypeSchema>;

export const TraceStatusSchema = z.enum(["success", "error", "running"]);
export type TraceStatus = z.infer<typeof TraceStatusSchema>;

export const TokenUsageSchema = z.object({
  input: z.number().int().nonnegative().optional(),
  output: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
});
export type TokenUsage = z.infer<typeof TokenUsageSchema>;

export const AttachmentSchema = z.object({
  type: AttachmentTypeSchema,
  uri: z.string(),
  mime: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  fps: z.number().positive().optional(),
  modality: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const MessageContentPartSchema = z.union([
  z.object({ type: z.literal("text"), text: z.string() }),
  AttachmentSchema,
]);
export type MessageContentPart = z.infer<typeof MessageContentPartSchema>;

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.array(MessageContentPartSchema),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const SensorFrameSchema = z.object({
  modality: z.string(),
  uri: z.string(),
  mime: z.string().optional(),
  fps: z.number().positive().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type SensorFrame = z.infer<typeof SensorFrameSchema>;

export const ObservedEventSchema = z.object({
  event_id: z.string().optional(),
  parent_event_id: z.string().optional(),
  step_id: z.string().optional(),
  parent_step_id: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  type: z.string(),
  name: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  latency_ms: z.number().int().nonnegative().optional(),
  model: z.string().optional(),
  message: MessageSchema.optional(),
  tool_call: ToolCallSchema.optional(),
  attachment: AttachmentSchema.optional(),
  sensor_frame: SensorFrameSchema.optional(),
  value: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ObservedEvent = z.infer<typeof ObservedEventSchema>;

export const StepSchema = z.object({
  step_id: z.string(),
  parent_step_id: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  type: StepTypeSchema,
  name: z.string(),
  model: z.string().optional(),
  status: TraceStatusSchema.optional(),
  error_message: z.string().optional(),
  started_at: z.string(),
  ended_at: z.string().optional(),
  latency_ms: z.number().int().nonnegative().optional(),
  token_usage: TokenUsageSchema.optional(),
  cost_usd: z.number().nonnegative().optional(),
  messages: z.array(MessageSchema).optional(),
  tool_calls: z.array(ToolCallSchema).optional(),
  events: z.array(ObservedEventSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  sensor_frames: z.array(SensorFrameSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type StepPayload = z.infer<typeof StepSchema>;

export const TraceSchema = z.object({
  schema_version: z.string(),
  trace_id: z.string(),
  project_id: z.string(),
  name: z.string(),
  run_id: z.string().optional(),
  run_type: z.string().optional(),
  use_case: z.string().optional(),
  user_id: z.string().optional(),
  group: z.string().optional(),
  platform: z.string().optional(),
  model: z.string().optional(),
  status: TraceStatusSchema,
  error_message: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  started_at: z.string(),
  ended_at: z.string().optional(),
  latency_ms: z.number().int().nonnegative().optional(),
  token_usage: TokenUsageSchema.optional(),
  cost_usd: z.number().nonnegative().optional(),
  steps: z.array(StepSchema),
  events: z.array(ObservedEventSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});
export type TracePayload = z.infer<typeof TraceSchema>;

export const CorrelationInfoSchema = z.object({
  session_id: z.string().optional(),
  request_id: z.string().optional(),
  parent_trace_id: z.string().optional(),
  root_trace_id: z.string().optional(),
  external_ids: z.record(z.unknown()).optional(),
});
export type CorrelationInfo = z.infer<typeof CorrelationInfoSchema>;

export const CanonicalEventSchema = z.object({
  event_id: z.string().optional(),
  parent_event_id: z.string().optional(),
  step_id: z.string().optional(),
  parent_step_id: z.string().optional(),
  step_type: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  type: z.string(),
  name: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  model: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  latency_ms: z.number().int().nonnegative().optional(),
  message: MessageSchema.optional(),
  tool_call: ToolCallSchema.optional(),
  attachment: AttachmentSchema.optional(),
  sensor_frame: SensorFrameSchema.optional(),
  value: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CanonicalEvent = z.infer<typeof CanonicalEventSchema>;

export const CanonicalEnvelopeSchema = z.object({
  schema_version: z.string().default(SCHEMA_VERSION),
  trace_id: z.string().optional(),
  project_id: z.string().optional(),
  name: z.string().optional(),
  source: z.string().optional(),
  kind: z.string().optional(),
  run_id: z.string().optional(),
  run_type: z.string().optional(),
  use_case: z.string().optional(),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  group: z.string().optional(),
  platform: z.string().optional(),
  model: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  latency_ms: z.number().int().nonnegative().optional(),
  cost_usd: z.number().nonnegative().optional(),
  correlation: CorrelationInfoSchema.optional(),
  events: z.array(CanonicalEventSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});
export type CanonicalEnvelope = z.infer<typeof CanonicalEnvelopeSchema>;

export interface BulkImportItemResult {
  index: number;
  kind: string;
  trace_id?: string;
  status: string;
  error?: string;
}

export interface BulkImportResponse {
  accepted: number;
  failed: number;
  items: BulkImportItemResult[];
}

/** User-facing input types (camelCase ergonomics). */

export interface TraceInput {
  name: string;
  runId?: string;
  runType?: string;
  useCase?: string;
  userId?: string;
  group?: string;
  platform?: string;
  model?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface TraceMetadataFilter {
  key: string;
  value: string;
}

export interface TraceSummary {
  trace_id: string;
  project_id: string;
  name: string;
  run_id?: string;
  run_type?: string;
  use_case?: string;
  group?: string;
  status: TraceStatus;
  platform?: string;
  model?: string;
  user_id?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  started_at: string;
  latency_ms?: number;
  total_tokens?: number;
  cost_usd?: number;
  step_count?: number;
  has_media?: boolean;
}

export interface TraceListFilters {
  projectId?: string;
  status?: string[];
  platform?: string[];
  model?: string[];
  userId?: string;
  runId?: string;
  runType?: string[];
  useCase?: string[];
  group?: string;
  tags?: string[];
  metadata?: TraceMetadataFilter[];
  since?: string;
  until?: string;
  limit?: number;
  cursor?: string;
}

export interface TraceListResponse {
  data: TraceSummary[];
  nextCursor?: string;
}

export interface TraceDetailResponse {
  meta: TraceSummary;
  trace: TracePayload | null;
}

export interface StepInput {
  name: string;
  type: StepType;
  model?: string;
  metadata?: Record<string, unknown>;
}

export interface LogMessageInput {
  role: "system" | "user" | "assistant" | "tool";
  text?: string;
  images?: AttachmentSource[];
  audio?: AttachmentSource[];
  video?: AttachmentSource[];
  attachments?: AttachmentSource[];
  name?: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogToolCallInput {
  name: string;
  arguments?: unknown;
  result?: unknown;
  error?: string;
  id?: string;
}

/** Accepted input sources for attachments. */
export type AttachmentSource =
  | Buffer
  | Uint8Array
  | Blob
  | string
  | ReadableStream<Uint8Array>
  | {
      data: Buffer | Uint8Array | Blob | string | ReadableStream<Uint8Array>;
      mime?: string;
      filename?: string;
    };
