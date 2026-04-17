import type { Trace } from "./trace.js";

/**
 * Context passed to wrapped agent functions.
 */
export interface AgentContext {
  /** The trace backing this agent invocation. */
  trace: Trace;
  /** Unique identifier for this run — use with `recordMetric`. */
  runId: string;
  /** Call when the agent produces its final output (stored in trace metadata). */
  onComplete(result: unknown): void;
}

/**
 * Return value of a wrapped agent call.
 */
export interface AgentResult<TOutput> {
  /** The value returned by the agent function (undefined when the agent threw). */
  result: TOutput | undefined;
  /** Trace / run ID for this invocation — pass to `recordMetric`. */
  runId: string;
}

/**
 * Signature of a wrapped agent function: call it with the agent's input and
 * get back `{ result, runId }`.
 */
export type WrappedAgent<TInput, TOutput> = (
  input: TInput,
) => Promise<AgentResult<TOutput>>;

/**
 * Type of the user-supplied agent handler.
 */
export type AgentFn<TInput, TOutput> = (
  ctx: AgentContext,
  input: TInput,
) => Promise<TOutput>;
