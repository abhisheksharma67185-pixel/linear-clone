export {
  TraceClient,
  trace,
  flush,
  getDefaultClient,
  setDefaultClient,
  type TraceClientOptions,
} from "./client.js";
export { Trace, Step } from "./trace.js";
export { observe, withTrace, type ObserveOptions } from "./observe.js";
export { ThetaObservabilityError } from "./errors.js";
export { genId } from "./ids.js";
export {
  getActiveTrace,
  getActiveStep,
} from "./async-context.js";
export type { AgentContext, AgentResult, WrappedAgent, AgentFn } from "./agent.js";
export type { CreateMetricOptions, MetricValue } from "./metrics.js";
export type {
  Attachment,
  AttachmentSource,
  AttachmentType,
  LogMessageInput,
  LogToolCallInput,
  Message,
  MessageContentPart,
  SensorFrame,
  StepInput,
  StepPayload,
  StepType,
  TraceListFilters,
  TraceListResponse,
  TraceMetadataFilter,
  TraceSummary,
  TokenUsage,
  ToolCall,
  TraceInput,
  TracePayload,
  TraceStatus,
} from "./types.js";
export { SCHEMA_VERSION } from "./types.js";
