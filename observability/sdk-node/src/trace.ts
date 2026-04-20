import { genId } from "./ids.js";
import { uploadAttachment, type UploadOptions } from "./media.js";
import { getActiveStep, pushStep } from "./async-context.js";
import {
  SCHEMA_VERSION,
  type Attachment,
  type AttachmentSource,
  type LogMessageInput,
  type LogToolCallInput,
  type Message,
  type MessageContentPart,
  type SensorFrame,
  type StepInput,
  type StepPayload,
  type TokenUsage,
  type TraceInput,
  type TracePayload,
  type TraceStatus,
} from "./types.js";

type StepFn<T> = (step: Step) => Promise<T> | T;

interface TraceInternals {
  projectId: string;
  uploadOpts: UploadOptions;
  debug: boolean;
}

/** In-flight trace, passed to the user's handler. */
export class Trace {
  public readonly id: string;
  public readonly name: string;
  public readonly startedAt: Date = new Date();
  public endedAt: Date | null = null;
  public status: TraceStatus = "running";
  public errorMessage: string | undefined;

  private readonly input: TraceInput;
  private readonly internals: TraceInternals;
  private readonly steps: Step[] = [];
  private readonly attachments: Attachment[] = [];
  private tokenUsage: TokenUsage | undefined;
  private costUsd: number | undefined;
  private stepCounter = 0;

  constructor(input: TraceInput, internals: TraceInternals) {
    this.id = genId("tr");
    this.name = input.name;
    this.input = input;
    this.internals = internals;
  }

  /** Create a child step and run `fn` inside it. Parents auto-detected via ALS. */
  async step<T>(input: StepInput, fn: StepFn<T>): Promise<T> {
    const step = new Step(input, {
      parentStepId: currentParentId(),
      index: this.stepCounter++,
      uploadOpts: this.internals.uploadOpts,
      debug: this.internals.debug,
    });
    this.steps.push(step);

    try {
      return await pushStep(step, async () => {
        const out = await fn(step);
        step.finish();
        return out;
      });
    } catch (err) {
      step.fail(err);
      // Re-throw to caller — the top-level trace() wrapper will catch.
      throw err;
    }
  }

  /** Attach an image at the trace level (e.g. final screenshot). */
  async attachImage(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("image", source, meta);
  }

  async attachAudio(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("audio", source, meta);
  }

  async attachVideo(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("video", source, meta);
  }

  async attachFile(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("file", source, meta);
  }

  async attachSensor(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("sensor", source, meta);
  }

  async attach(
    type: Attachment["type"],
    source: AttachmentSource,
    meta: Partial<Attachment> = {},
  ): Promise<Attachment> {
    try {
      const att = await uploadAttachment(this.internals.uploadOpts, type, source, meta);
      this.attachments.push(att);
      return att;
    } catch (err) {
      if (this.internals.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[theta/observability] attach failed: ${String(err)}`);
      }
      // Fail-soft: return a placeholder so user code continues.
      return { type, uri: "", ...meta };
    }
  }

  setTokenUsage(u: TokenUsage): void {
    this.tokenUsage = { ...this.tokenUsage, ...u };
    if (this.tokenUsage.input !== undefined && this.tokenUsage.output !== undefined) {
      this.tokenUsage.total =
        this.tokenUsage.total ?? this.tokenUsage.input + this.tokenUsage.output;
    }
  }

  setCost(usd: number): void {
    this.costUsd = usd;
  }

  setMetadata(meta: Record<string, unknown>): void {
    this.input.metadata = { ...this.input.metadata, ...meta };
  }

  setMetadataPath(path: string, value: unknown): void {
    this.input.metadata = setMetadataPath(this.input.metadata, path, value);
  }

  setStatus(status: TraceStatus, errorMessage?: string): void {
    this.status = status;
    if (errorMessage) this.errorMessage = errorMessage;
  }

  /** @internal — finalize and produce the wire payload. */
  toPayload(): TracePayload {
    const ended = this.endedAt ?? new Date();
    return {
      schema_version: SCHEMA_VERSION,
      trace_id: this.id,
      project_id: this.internals.projectId,
      name: this.name,
      run_id: this.input.runId,
      run_type: this.input.runType,
      use_case: this.input.useCase,
      user_id: this.input.userId,
      group: this.input.group,
      platform: this.input.platform,
      model: this.input.model,
      tags: this.input.tags,
      metadata: this.input.metadata,
      status: this.status,
      error_message: this.errorMessage,
      started_at: this.startedAt.toISOString(),
      ended_at: ended.toISOString(),
      latency_ms: ended.getTime() - this.startedAt.getTime(),
      token_usage: this.tokenUsage,
      cost_usd: this.costUsd,
      steps: this.steps.map((s) => s.toPayload()),
      attachments: this.attachments.length > 0 ? this.attachments : undefined,
    };
  }

  /** @internal */
  _finish(status: TraceStatus, errorMessage?: string): void {
    this.endedAt = new Date();
    this.status = status;
    if (errorMessage) this.errorMessage = errorMessage;
  }

  /** @internal — drain all pending lazy uploads across child steps. */
  async _drainUploads(): Promise<void> {
    await Promise.allSettled(this.steps.map((s) => s.drainUploads()));
  }
}

interface StepInternals {
  parentStepId: string | undefined;
  index: number;
  uploadOpts: UploadOptions;
  debug: boolean;
}

export class Step {
  public readonly id: string;
  public readonly name: string;
  public readonly type: StepInput["type"];
  public readonly startedAt: Date = new Date();
  public endedAt: Date | null = null;
  public status: TraceStatus = "running";
  public errorMessage: string | undefined;

  private readonly input: StepInput;
  private readonly internals: StepInternals;
  private readonly messages: Message[] = [];
  private readonly toolCalls: NonNullable<StepPayload["tool_calls"]> = [];
  private readonly attachments: Attachment[] = [];
  private readonly sensorFrames: SensorFrame[] = [];
  private tokenUsage: TokenUsage | undefined;
  private costUsd: number | undefined;
  private metadata: Record<string, unknown> | undefined;

  constructor(input: StepInput, internals: StepInternals) {
    this.id = genId("st");
    this.name = input.name;
    this.type = input.type;
    this.input = input;
    this.internals = internals;
    this.metadata = input.metadata;
  }

  logMessage(input: LogMessageInput): void {
    const parts: MessageContentPart[] = [];
    if (input.text !== undefined) parts.push({ type: "text", text: input.text });

    // Media uploads are lazy, but we preserve caller order by reserving
    // each content slot up front and filling it when the upload resolves.
    const queued: Promise<void>[] = [];
    const queueUpload = (
      type: Attachment["type"],
      source: AttachmentSource,
      failureLabel: string,
    ): void => {
      const slot = parts.length;
      parts.push({ type, uri: "" });
      queued.push(
        uploadAttachment(this.internals.uploadOpts, type, source)
          .then((attachment) => {
            parts[slot] = attachment;
          })
          .catch((err) => {
            parts[slot] = { type, uri: "" };
            this.debugWarn(failureLabel, err);
          }),
      );
    };

    for (const img of input.images ?? []) {
      queueUpload("image", img, "image upload failed");
    }
    for (const audio of input.audio ?? []) {
      queueUpload("audio", audio, "audio upload failed");
    }
    for (const video of input.video ?? []) {
      queueUpload("video", video, "video upload failed");
    }
    for (const att of input.attachments ?? []) {
      queueUpload("file", att, "attachment upload failed");
    }

    const message: Message = {
      role: input.role,
      content: parts,
      name: input.name,
      tool_call_id: input.toolCallId,
      metadata: input.metadata,
    };
    this.messages.push(message);

    // Ensure uploads settle before this step serializes. We park the promise
    // on the step itself so `finish()` can await it.
    if (queued.length > 0) this.pendingUploads.push(...queued);
  }

  logToolCall(input: LogToolCallInput): void {
    this.toolCalls.push({
      id: input.id ?? genId("tc"),
      name: input.name,
      arguments: input.arguments,
      result: input.result,
      error: input.error,
    });
  }

  async attachImage(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("image", source, meta);
  }

  async attachAudio(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("audio", source, meta);
  }

  async attachVideo(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("video", source, meta);
  }

  async attachFile(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("file", source, meta);
  }

  async attachSensor(source: AttachmentSource, meta?: Partial<Attachment>): Promise<Attachment> {
    return this.attach("sensor", source, meta);
  }

  async logSensorFrame(input: {
    modality: string;
    source: AttachmentSource;
    mime?: string;
    fps?: number;
    durationMs?: number;
    metadata?: Record<string, unknown>;
  }): Promise<SensorFrame> {
    try {
      const frame = await uploadAttachment(this.internals.uploadOpts, "sensor", input.source, {
        mime: input.mime,
        modality: input.modality,
        metadata: input.metadata,
      });
      const sensorFrame: SensorFrame = {
        modality: input.modality,
        uri: frame.uri,
        mime: frame.mime,
        fps: input.fps,
        duration_ms: input.durationMs,
        metadata: input.metadata,
      };
      this.sensorFrames.push(sensorFrame);
      return sensorFrame;
    } catch (err) {
      this.debugWarn("sensor upload failed", err);
      const sensorFrame: SensorFrame = {
        modality: input.modality,
        uri: "",
        mime: input.mime,
        fps: input.fps,
        duration_ms: input.durationMs,
        metadata: input.metadata,
      };
      this.sensorFrames.push(sensorFrame);
      return sensorFrame;
    }
  }

  async attach(
    type: Attachment["type"],
    source: AttachmentSource,
    meta: Partial<Attachment> = {},
  ): Promise<Attachment> {
    try {
      const att = await uploadAttachment(this.internals.uploadOpts, type, source, meta);
      this.attachments.push(att);
      return att;
    } catch (err) {
      this.debugWarn("attach failed", err);
      return { type, uri: "", ...meta };
    }
  }

  setTokenUsage(u: TokenUsage): void {
    this.tokenUsage = { ...this.tokenUsage, ...u };
    if (this.tokenUsage.input !== undefined && this.tokenUsage.output !== undefined) {
      this.tokenUsage.total =
        this.tokenUsage.total ?? this.tokenUsage.input + this.tokenUsage.output;
    }
  }

  setCost(usd: number): void {
    this.costUsd = usd;
  }

  setMetadata(meta: Record<string, unknown>): void {
    this.metadata = { ...this.metadata, ...meta };
  }

  setMetadataPath(path: string, value: unknown): void {
    this.metadata = setMetadataPath(this.metadata, path, value);
  }

  private pendingUploads: Promise<void>[] = [];

  /** @internal */
  finish(): void {
    this.endedAt = new Date();
    if (this.status === "running") this.status = "success";
  }

  /** @internal */
  fail(err: unknown): void {
    this.endedAt = new Date();
    this.status = "error";
    this.errorMessage = err instanceof Error ? err.message : String(err);
  }

  /** @internal — awaited before serialization to flush lazy uploads. */
  async drainUploads(): Promise<void> {
    if (this.pendingUploads.length === 0) return;
    await Promise.allSettled(this.pendingUploads);
    this.pendingUploads = [];
  }

  /** @internal */
  toPayload(): StepPayload {
    const ended = this.endedAt ?? new Date();
    return {
      step_id: this.id,
      parent_step_id: this.internals.parentStepId,
      index: this.internals.index,
      type: this.type,
      name: this.name,
      model: this.input.model,
      status: this.status,
      error_message: this.errorMessage,
      started_at: this.startedAt.toISOString(),
      ended_at: ended.toISOString(),
      latency_ms: ended.getTime() - this.startedAt.getTime(),
      token_usage: this.tokenUsage,
      cost_usd: this.costUsd,
      messages: this.messages.length > 0 ? this.messages : undefined,
      tool_calls: this.toolCalls.length > 0 ? this.toolCalls : undefined,
      attachments: this.attachments.length > 0 ? this.attachments : undefined,
      sensor_frames: this.sensorFrames.length > 0 ? this.sensorFrames : undefined,
      metadata: this.metadata,
    };
  }

  private debugWarn(tag: string, err: unknown): void {
    if (this.internals.debug) {
      // eslint-disable-next-line no-console
      console.warn(`[theta/observability] ${tag}: ${String(err)}`);
    }
  }
}

function currentParentId(): string | undefined {
  return getActiveStep()?.id;
}

function setMetadataPath(
  source: Record<string, unknown> | undefined,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = path
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return source ?? {};
  }

  const next = { ...(source ?? {}) };
  let current: Record<string, unknown> = next;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]!;
    if (index === parts.length - 1) {
      current[part] = value;
      break;
    }

    const existing = current[part];
    const branch =
      existing && typeof existing === "object" && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>) }
        : {};

    current[part] = branch;
    current = branch;
  }

  return next;
}
