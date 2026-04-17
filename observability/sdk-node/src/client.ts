import { BatchSender } from "./batch.js";
import { DEFAULT_BASE_URL, envApiKey, envBaseUrl, envDebug, envProject } from "./env.js";
import { ThetaObservabilityError } from "./errors.js";
import { uploadAttachment, type UploadOptions } from "./media.js";
import { runWithContext } from "./async-context.js";
import { Trace } from "./trace.js";
import type {
  Attachment,
  AttachmentSource,
  AttachmentType,
  TraceInput,
  TraceListFilters,
  TraceListResponse,
} from "./types.js";
import type { AgentContext, AgentFn, AgentResult, WrappedAgent } from "./agent.js";
import type { CreateMetricOptions, MetricValue } from "./metrics.js";

export interface TraceClientOptions {
  apiKey?: string;
  project?: string;
  baseUrl?: string;
  /** Background flush interval in ms (default: 1000). */
  flushInterval?: number;
  /** Max queued traces before forced flush (default: 20). */
  maxBatch?: number;
  /** Per-request timeout in ms (default: 30000). */
  timeout?: number;
  debug?: boolean;
  /** Disable all network I/O — useful in tests or offline dev. */
  disabled?: boolean;
  /** Custom fetch (mainly for tests). */
  fetchImpl?: typeof fetch;
}

type TraceHandler<T> = (trace: Trace) => Promise<T> | T;

/**
 * TraceClient is the main entry point of the Theta Observability SDK.
 *
 * ```ts
 * const client = new TraceClient({ apiKey, project });
 * await client.trace({ name: "checkout" }, async (t) => {
 *   await t.step({ name: "plan", type: "llm" }, async (s) => {
 *     s.logMessage({ role: "user", text: "Buy milk" });
 *   });
 * });
 * ```
 */
export class TraceClient {
  public readonly apiKey: string;
  public readonly project: string;
  public readonly baseUrl: string;
  public readonly debug: boolean;
  public readonly disabled: boolean;

  private readonly sender: BatchSender | null;
  private readonly uploadOpts: UploadOptions;

  constructor(opts: TraceClientOptions = {}) {
    const apiKey = opts.apiKey ?? envApiKey();
    const project = opts.project ?? envProject();
    const baseUrl = opts.baseUrl ?? envBaseUrl() ?? DEFAULT_BASE_URL;
    const debug = opts.debug ?? envDebug();
    const disabled = opts.disabled ?? false;

    if (!disabled && !apiKey) {
      if (debug) {
        // eslint-disable-next-line no-console
        console.warn(
          "[theta/observability] no API key (THETA_API_KEY) — client will run in disabled mode",
        );
      }
    }

    this.apiKey = apiKey ?? "";
    this.project = project ?? "";
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.debug = debug;
    // Auto-disable if missing credentials so user code never crashes in dev.
    this.disabled = disabled || !apiKey || !project;

    this.uploadOpts = {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: opts.timeout ?? 30_000,
      debug: this.debug,
      fetchImpl: opts.fetchImpl,
    };

    this.sender = this.disabled
      ? null
      : new BatchSender({
          apiKey: this.apiKey,
          baseUrl: this.baseUrl,
          flushInterval: opts.flushInterval ?? 1_000,
          maxBatch: opts.maxBatch ?? 20,
          timeout: opts.timeout ?? 30_000,
          debug: this.debug,
          fetchImpl: opts.fetchImpl,
        });
  }

  /**
   * Start a new trace and run `fn` inside it. Exceptions are captured into
   * the trace status, then re-thrown to the caller.
   */
  async trace<T>(input: TraceInput, fn: TraceHandler<T>): Promise<T> {
    const t = new Trace(input, {
      projectId: this.project,
      uploadOpts: this.uploadOpts,
      debug: this.debug,
    });

    let rethrow: unknown;
    let result: T | undefined;
    try {
      result = await runWithContext({ trace: t, stepStack: [] }, async () => fn(t));
      t._finish("success");
    } catch (err) {
      rethrow = err;
      t._finish("error", err instanceof Error ? err.message : String(err));
    }

    // Drain lazy uploads on every step before serializing.
    try {
      await t._drainUploads();
      if (this.sender) this.sender.enqueue(t.toPayload());
    } catch (err) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[theta/observability] enqueue failed: ${String(err)}`);
      }
    }

    if (rethrow !== undefined) throw rethrow;
    return result as T;
  }

  /**
   * Manually upload an attachment (e.g. before a trace exists). Returns
   * an Attachment you can splice into messages yourself.
   */
  async upload(
    type: AttachmentType,
    source: AttachmentSource,
    overrides: Partial<Attachment> = {},
  ): Promise<Attachment> {
    if (this.disabled) {
      return { type, uri: "", ...overrides };
    }
    return uploadAttachment(this.uploadOpts, type, source, overrides);
  }

  /** Flush queued traces immediately. */
  async flush(): Promise<void> {
    if (this.sender) await this.sender.flush();
  }

  /** Flush + tear down the batch sender (call in tests / short-lived scripts). */
  async shutdown(): Promise<void> {
    if (this.sender) await this.sender.shutdown();
  }

  /**
   * Wrap an async agent function so every call automatically creates a trace,
   * captures input/output, and returns `{ result, runId }`.
   *
   * ```ts
   * const agent = client.wrapAgent("support-agent", async (ctx, input) => {
   *   const reply = await callLLM(input);
   *   ctx.onComplete(reply);
   *   return reply;
   * });
   * const { result, runId } = await agent("help me");
   * ```
   */
  wrapAgent<TInput, TOutput>(
    name: string,
    fn: AgentFn<TInput, TOutput>,
  ): WrappedAgent<TInput, TOutput> {
    return async (input: TInput): Promise<AgentResult<TOutput>> => {
      let agentResult: TOutput | undefined;
      let traceId: string | undefined;

      const traceInput: TraceInput = {
        name,
        runType: "agent",
        metadata: { agent_input: input },
      };

      const t = new Trace(traceInput, {
        projectId: this.project,
        uploadOpts: this.uploadOpts,
        debug: this.debug,
      });
      traceId = t.id;

      const ctx: AgentContext = {
        trace: t,
        runId: t.id,
        onComplete(result: unknown) {
          t.setStatus("success");
          // Stash agent output in trace metadata for server-side inspection.
          (traceInput.metadata as Record<string, unknown>).agent_output = result;
        },
      };

      let rethrow: unknown;
      try {
        agentResult = await runWithContext({ trace: t, stepStack: [] }, async () =>
          fn(ctx, input),
        );
        t._finish("success");
      } catch (err) {
        rethrow = err;
        t._finish("error", err instanceof Error ? err.message : String(err));
      }

      // Enqueue the trace payload.
      try {
        await t._drainUploads();
        if (this.sender) this.sender.enqueue(t.toPayload());
      } catch (err) {
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.warn(`[theta/observability] agent enqueue failed: ${String(err)}`);
        }
      }

      if (rethrow !== undefined) {
        // Still return runId so the caller can record metrics against the failed run.
        return { result: undefined, runId: traceId };
      }
      return { result: agentResult, runId: traceId };
    };
  }

  /**
   * Record a metric event against a trace.
   *
   * Fail-soft: errors are logged (in debug mode) but never thrown into user code.
   *
   * ```ts
   * await client.recordMetric("task_adherence", traceId, { passed: true });
   * ```
   */
  async recordMetric(
    metricIdOrName: string,
    traceId: string,
    value: MetricValue,
  ): Promise<void> {
    if (this.disabled) return;
    try {
      const url = `${this.baseUrl}/v1/metrics/${encodeURIComponent(metricIdOrName)}/events`;
      const fetchFn = this.uploadOpts.fetchImpl ?? fetch;
      const metadata =
        value.metadata ??
        Object.fromEntries(
          Object.entries(value).filter(([key, raw]) =>
            !["passed", "score", "label", "metadata"].includes(key) && raw !== undefined,
          ),
        );
      const res = await fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          trace_id: traceId,
          passed: value.passed,
          score: value.score,
          label: value.label,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        }),
        signal: AbortSignal.timeout(this.uploadOpts.timeout),
      });
      if (!res.ok && this.debug) {
        // eslint-disable-next-line no-console
        console.warn(
          `[theta/observability] recordMetric ${metricIdOrName} responded ${res.status}`,
        );
      }
    } catch (err) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[theta/observability] recordMetric failed: ${String(err)}`);
      }
    }
  }

  /**
   * Create (or upsert) a metric definition on the server.
   *
   * Fail-soft: errors are logged (in debug mode) but never thrown into user code.
   *
   * ```ts
   * await client.createMetric("task_adherence", { type: "automated", evaluatorPrompt: "..." });
   * ```
   */
  async createMetric(
    name: string,
    opts: CreateMetricOptions = {},
  ): Promise<void> {
    if (this.disabled) return;
    try {
      const url = `${this.baseUrl}/v1/metrics`;
      const fetchFn = this.uploadOpts.fetchImpl ?? fetch;
      const res = await fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          project_id: opts.projectId ?? this.project,
          name,
          type: opts.type ?? "observed",
          evaluator_prompt: opts.evaluatorPrompt,
          description: opts.description,
        }),
        signal: AbortSignal.timeout(this.uploadOpts.timeout),
      });
      if (!res.ok && this.debug) {
        // eslint-disable-next-line no-console
        console.warn(
          `[theta/observability] createMetric ${name} responded ${res.status}`,
        );
      }
    } catch (err) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[theta/observability] createMetric failed: ${String(err)}`);
      }
    }
  }

  /**
   * List trace summaries from the Theta API with server-side filtering.
   *
   * ```ts
   * const { data } = await client.listTraces({
   *   runType: ["prod"],
   *   metadata: [{ key: "workflow.stage", value: "checkout" }],
   * });
   * ```
   */
  async listTraces(filters: TraceListFilters = {}): Promise<TraceListResponse> {
    if (this.disabled) return { data: [] };

    const params = new URLSearchParams();
    params.set("project_id", filters.projectId ?? this.project);
    filters.status?.forEach((value) => params.append("status", value));
    filters.platform?.forEach((value) => params.append("platform", value));
    filters.model?.forEach((value) => params.append("model", value));
    filters.runType?.forEach((value) => params.append("run_type", value));
    filters.useCase?.forEach((value) => params.append("use_case", value));
    filters.tags?.forEach((value) => params.append("tags", value));
    filters.metadata?.forEach((filter) => {
      if (!filter.key || filter.value === undefined) return;
      params.append("meta_key", filter.key);
      params.append("meta_value", String(filter.value));
    });
    if (filters.userId) params.set("user_id", filters.userId);
    if (filters.runId) params.set("run_id", filters.runId);
    if (filters.group) params.set("group", filters.group);
    if (filters.since) params.set("since", filters.since);
    if (filters.until) params.set("until", filters.until);
    if (filters.cursor) params.set("cursor", filters.cursor);
    params.set("limit", String(filters.limit ?? 100));

    try {
      const fetchFn = this.uploadOpts.fetchImpl ?? fetch;
      const res = await fetchFn(`${this.baseUrl}/v1/traces?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(this.uploadOpts.timeout),
      });
      if (!res.ok) {
        throw new ThetaObservabilityError(
          `listTraces responded ${res.status}: ${await res.text().catch(() => "")}`,
        );
      }
      const body = (await res.json()) as { items?: TraceListResponse["data"]; next_cursor?: string };
      return {
        data: body.items ?? [],
        nextCursor: body.next_cursor,
      };
    } catch (err) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[theta/observability] listTraces failed: ${String(err)}`);
      }
      return { data: [] };
    }
  }

  /** @internal — expose sender for integration tests. */
  get _sender(): BatchSender | null {
    return this.sender;
  }
}

/**
 * Module-level default client, lazily initialized from env vars on first use.
 * Enables the zero-config `import { trace } from "@theta/observability"` API.
 */
let defaultClient: TraceClient | undefined;

export function getDefaultClient(): TraceClient {
  if (!defaultClient) {
    defaultClient = new TraceClient();
  }
  return defaultClient;
}

export function setDefaultClient(client: TraceClient): void {
  defaultClient = client;
}

/**
 * Zero-config trace entry point.
 *
 * ```ts
 * import { trace } from "@theta/observability";
 * await trace("my-agent", async (t) => { ... });
 * ```
 */
export async function trace<T>(
  name: string | TraceInput,
  fn: TraceHandler<T>,
): Promise<T> {
  const input: TraceInput = typeof name === "string" ? { name } : name;
  return getDefaultClient().trace(input, fn);
}

/** Flush the default client's queue. */
export async function flush(): Promise<void> {
  await getDefaultClient().flush();
}

// Re-export used by trace.ts typing.
export { ThetaObservabilityError };
