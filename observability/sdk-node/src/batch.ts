import type { TracePayload } from "./types.js";

export interface BatchSenderOptions {
  apiKey: string;
  baseUrl: string;
  flushInterval: number;
  maxBatch: number;
  timeout: number;
  debug: boolean;
  /** Optional fetch override (mainly for testing). */
  fetchImpl?: typeof fetch;
  /** Max retry attempts for transient failures. */
  maxRetries?: number;
}

interface Pending {
  trace: TracePayload;
  attempts: number;
}

/**
 * BatchSender buffers completed traces and flushes them to the ingest API.
 *
 * - Background interval timer fires every `flushInterval` ms.
 * - `maxBatch` traces trigger an immediate flush.
 * - Transient (5xx, network) errors retry with exponential backoff.
 * - All errors are logged (when debug=true) but never thrown into user code.
 * - `beforeExit` hook auto-flushes the queue.
 */
export class BatchSender {
  private queue: Pending[] = [];
  private timer: NodeJS.Timeout | null = null;
  private closed = false;
  private inFlight: Promise<void> | null = null;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly beforeExitHandler: () => void;

  constructor(private readonly opts: BatchSenderOptions) {
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.maxRetries = opts.maxRetries ?? 3;
    this.beforeExitHandler = () => {
      // Fire and forget; Node keeps the loop alive until the promise settles.
      void this.flush();
    };
    if (typeof process !== "undefined" && typeof process.on === "function") {
      process.on("beforeExit", this.beforeExitHandler);
    }
    this.startTimer();
  }

  enqueue(trace: TracePayload): void {
    if (this.closed) return;
    this.queue.push({ trace, attempts: 0 });
    if (this.queue.length >= this.opts.maxBatch) {
      void this.flush();
    }
  }

  private startTimer(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.queue.length > 0) void this.flush();
    }, this.opts.flushInterval);
    // Don't hold the process open just for the flusher.
    if (typeof this.timer.unref === "function") this.timer.unref();
  }

  async flush(): Promise<void> {
    if (this.inFlight) {
      await this.inFlight;
    }
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    this.inFlight = this.sendBatch(batch).finally(() => {
      this.inFlight = null;
    });
    await this.inFlight;
  }

  private async sendBatch(batch: Pending[]): Promise<void> {
    for (const item of batch) {
      await this.sendOne(item);
    }
  }

  private async sendOne(item: Pending): Promise<void> {
    try {
      const res = await this.doFetch(item.trace);
      if (!res.ok) {
        if (this.isRetryable(res.status) && item.attempts < this.maxRetries) {
          await this.backoff(item.attempts);
          item.attempts += 1;
          return this.sendOne(item);
        }
        this.log(
          `Drop trace ${item.trace.trace_id}: HTTP ${res.status} ${res.statusText}`,
        );
      }
    } catch (err) {
      if (item.attempts < this.maxRetries) {
        await this.backoff(item.attempts);
        item.attempts += 1;
        return this.sendOne(item);
      }
      this.log(`Drop trace ${item.trace.trace_id}: ${String(err)}`);
    }
  }

  private async doFetch(trace: TracePayload): Promise<Response> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.opts.timeout);
    try {
      const res = await this.fetchImpl(`${this.opts.baseUrl}/v1/traces`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.opts.apiKey,
          "user-agent": "theta-observability-node/0.1.0",
        },
        body: JSON.stringify(trace),
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(t);
    }
  }

  private isRetryable(status: number): boolean {
    return status === 408 || status === 429 || (status >= 500 && status < 600);
  }

  private backoff(attempt: number): Promise<void> {
    const base = 250 * Math.pow(2, attempt);
    const jitter = Math.random() * 100;
    return new Promise((resolve) => setTimeout(resolve, base + jitter));
  }

  private log(msg: string): void {
    if (this.opts.debug) {
      // eslint-disable-next-line no-console
      console.warn(`[theta/observability] ${msg}`);
    }
  }

  async shutdown(): Promise<void> {
    this.closed = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (typeof process !== "undefined" && typeof process.off === "function") {
      process.off("beforeExit", this.beforeExitHandler);
    }
    await this.flush();
  }
}
