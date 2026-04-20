import { getDefaultClient, type TraceClient } from "../client.js";
import { Step, Trace } from "../trace.js";

type JsonRecord = Record<string, unknown>;

interface RunnableLike {
  invoke?: (input: unknown, config?: unknown) => Promise<unknown> | unknown;
  stream?: (input: unknown, config?: unknown) => Promise<AsyncIterable<unknown>> | AsyncIterable<unknown>;
}

interface ClientInternals {
  project: string;
  debug: boolean;
  sender: { enqueue: (payload: unknown) => void } | null;
  uploadOpts: unknown;
}

export interface WrapLangChainOptions {
  client?: TraceClient;
  name?: string;
  stepType?: "llm" | "tool" | "retrieval" | "custom";
}

function resolveClient(client?: TraceClient): TraceClient {
  return client ?? getDefaultClient();
}

function normalizeMetadata(config: unknown): JsonRecord | undefined {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return undefined;
  }
  const record = config as JsonRecord;
  return {
    integration: "langchain",
    config,
    tags: Array.isArray(record.tags) ? record.tags : undefined,
    metadata: typeof record.metadata === "object" ? record.metadata : undefined,
  };
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractRole(value: JsonRecord): "system" | "user" | "assistant" | "tool" {
  const role = value.role;
  if (role === "system" || role === "assistant" || role === "tool") {
    return role;
  }
  return "user";
}

function logStructuredMessage(step: Step, value: unknown, fallbackRole: "user" | "assistant"): void {
  if (typeof value === "string") {
    step.logMessage({ role: fallbackRole, text: value });
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      logStructuredMessage(step, item, fallbackRole);
    }
    return;
  }
  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    const content = record.content;
    if (typeof content === "string") {
      step.logMessage({ role: extractRole(record), text: content });
      return;
    }
    if (Array.isArray(content)) {
      const text = content
        .map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object" && "text" in (part as JsonRecord)) {
            return String((part as JsonRecord).text ?? "");
          }
          return "";
        })
        .filter(Boolean)
        .join("");
      step.logMessage({ role: extractRole(record), text: text || stringifyValue(record) });
      return;
    }
  }
  step.logMessage({ role: fallbackRole, text: stringifyValue(value) });
}

function logInput(step: Step, input: unknown): void {
  logStructuredMessage(step, input, "user");
}

function logOutput(step: Step, output: unknown): void {
  logStructuredMessage(step, output, "assistant");
}

function createManualTrace(
  client: TraceClient,
  name: string,
  stepType: "llm" | "tool" | "retrieval" | "custom",
  input: unknown,
  config: unknown,
): { trace: Trace; step: Step; clientInternals: ClientInternals } {
  const clientInternals = client as unknown as ClientInternals;
  const trace = new Trace(
    {
      name,
      runType: "chain",
      metadata: normalizeMetadata(config),
    },
    {
      projectId: clientInternals.project,
      uploadOpts: clientInternals.uploadOpts as never,
      debug: clientInternals.debug,
    },
  );
  const step = new Step(
    {
      name,
      type: stepType,
      metadata: { integration: "langchain" },
    },
    {
      parentStepId: undefined,
      index: 0,
      uploadOpts: clientInternals.uploadOpts as never,
      debug: clientInternals.debug,
    },
  );
  (trace as unknown as { steps: Step[] }).steps.push(step);
  logInput(step, input);
  return { trace, step, clientInternals };
}

async function finalizeManualTrace(
  trace: Trace,
  step: Step,
  clientInternals: ClientInternals,
  error?: unknown,
): Promise<void> {
  if (error !== undefined) {
    step.fail(error);
    trace._finish("error", error instanceof Error ? error.message : String(error));
  } else {
    step.finish();
    trace._finish("success");
  }
  await step.drainUploads();
  await trace._drainUploads();
  clientInternals.sender?.enqueue(trace.toPayload());
}

async function* instrumentStream(
  source: AsyncIterable<unknown>,
  state: { trace: Trace; step: Step; clientInternals: ClientInternals },
): AsyncGenerator<unknown> {
  let combined = "";
  try {
    for await (const chunk of source) {
      const text = stringifyValue((chunk as JsonRecord)?.content ?? (chunk as JsonRecord)?.text ?? (chunk as JsonRecord)?.chunk ?? chunk);
      if (text) {
        combined += text;
      }
      yield chunk;
    }
    if (combined) {
      state.step.logMessage({ role: "assistant", text: combined });
    }
    await finalizeManualTrace(state.trace, state.step, state.clientInternals);
  } catch (error) {
    await finalizeManualTrace(state.trace, state.step, state.clientInternals, error);
    throw error;
  }
}

export function wrapLangChainRunnable<T extends RunnableLike>(
  runnable: T,
  opts: WrapLangChainOptions = {},
): T {
  const client = resolveClient(opts.client);
  const name = opts.name ?? runnable.constructor?.name ?? "langchain.runnable";
  const stepType = opts.stepType ?? "custom";

  const origInvoke = runnable.invoke?.bind(runnable);
  const origStream = runnable.stream?.bind(runnable);

  return new Proxy(runnable, {
    get(target, prop, receiver) {
      if (prop === "invoke" && origInvoke) {
        return async (input: unknown, config?: unknown) =>
          client.trace(
            {
              name,
              runType: "chain",
              metadata: normalizeMetadata(config),
            },
            async (trace) =>
              trace.step({ name, type: stepType, metadata: { integration: "langchain" } }, async (step) => {
                logInput(step, input);
                const output = await origInvoke(input, config);
                logOutput(step, output);
                return output;
              }),
          );
      }

      if (prop === "stream" && origStream) {
        return async (input: unknown, config?: unknown) => {
          const state = createManualTrace(client, name, stepType, input, config);
          const source = await origStream(input, config);
          return instrumentStream(source, state);
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}
