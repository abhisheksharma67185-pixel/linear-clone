import { getActiveTrace } from "./async-context.js";
import { getDefaultClient, TraceClient } from "./client.js";
import type { StepType, TraceInput } from "./types.js";

export interface ObserveOptions {
  name?: string;
  type?: StepType;
  client?: TraceClient;
}

/**
 * Higher-order function that wraps an async function into an auto-traced
 * step. If called inside an active trace, it adds a child step; otherwise
 * it creates a new trace with `name`.
 */
export function observe<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult> | TResult,
  opts: ObserveOptions = {},
): (...args: TArgs) => Promise<TResult> {
  const name = opts.name ?? fn.name ?? "anonymous";
  const type: StepType = opts.type ?? "custom";

  return async function observed(...args: TArgs): Promise<TResult> {
    const client = opts.client ?? getDefaultClient();
    const active = getActiveTrace();
    if (active) {
      return active.step({ name, type }, async () => fn(...args));
    }
    return client.trace({ name }, async (t) =>
      t.step({ name, type }, async () => fn(...args)),
    );
  };
}

/**
 * Next.js route helper that wraps a handler in a trace. Any thrown errors
 * propagate, but the trace is captured with `status="error"`.
 *
 * ```ts
 * export const POST = withTrace(async (req) => { ... }, { name: "api/checkout" });
 * ```
 */
export function withTrace<
  THandler extends (...args: never[]) => Promise<unknown> | unknown,
>(
  handler: THandler,
  opts: { name?: string; client?: TraceClient } & Partial<TraceInput> = {},
): THandler {
  const name = opts.name ?? handler.name ?? "route";
  const client = opts.client;
  return (async (...args: Parameters<THandler>) => {
    const c = client ?? getDefaultClient();
    return c.trace({ ...opts, name }, async () => handler(...args));
  }) as THandler;
}
