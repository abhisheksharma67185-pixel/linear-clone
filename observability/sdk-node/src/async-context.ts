import { AsyncLocalStorage } from "node:async_hooks";
import type { Trace, Step } from "./trace.js";
// Note: type-only import breaks the runtime cycle with trace.ts.

/**
 * AsyncLocalStorage-backed stack of active steps, used for nested
 * auto-parenting when user code creates steps without an explicit parent.
 */
export interface TraceContext {
  trace: Trace;
  stepStack: Step[];
}

const storage = new AsyncLocalStorage<TraceContext>();

export function getContext(): TraceContext | undefined {
  return storage.getStore();
}

export function getActiveTrace(): Trace | undefined {
  return storage.getStore()?.trace;
}

export function getActiveStep(): Step | undefined {
  const ctx = storage.getStore();
  if (!ctx || ctx.stepStack.length === 0) return undefined;
  return ctx.stepStack[ctx.stepStack.length - 1];
}

export function runWithContext<T>(ctx: TraceContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(ctx, fn);
}

export function pushStep<T>(step: Step, fn: () => Promise<T>): Promise<T> {
  const current = storage.getStore();
  if (!current) {
    // No active trace context — just run without parenting.
    return fn();
  }
  const nextCtx: TraceContext = {
    trace: current.trace,
    stepStack: [...current.stepStack, step],
  };
  return storage.run(nextCtx, fn);
}
