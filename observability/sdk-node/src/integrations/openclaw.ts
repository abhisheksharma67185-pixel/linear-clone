import { getActiveTrace } from "../async-context.js";
import { getDefaultClient, type TraceClient } from "../client.js";
import type { Message, MessageContentPart, TokenUsage } from "../types.js";

interface OpenClawContentItem {
  type?: string;
  text?: string;
  image_url?: string;
  url?: string;
}

interface OpenClawInputMessage {
  type?: string;
  role?: "system" | "user" | "assistant" | "tool";
  content?: string | OpenClawContentItem[];
}

interface OpenClawResponsesParams {
  model?: string;
  instructions?: string;
  input?: string | OpenClawInputMessage[];
  stream?: boolean;
  [k: string]: unknown;
}

interface OpenClawOutputItem {
  type?: string;
  role?: "assistant" | "tool";
  content?: Array<{ type?: string; text?: string }>;
}

interface OpenClawResponsesResponse {
  output_text?: string;
  output?: OpenClawOutputItem[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

interface OpenClawStreamEvent {
  type?: string;
  delta?: string;
  text?: string;
  response?: OpenClawResponsesResponse;
  usage?: OpenClawResponsesResponse["usage"];
}

interface OpenClawLike {
  responses: {
    create: (params: OpenClawResponsesParams) => Promise<unknown>;
  };
}

export interface WrapOpenClawOptions {
  client?: TraceClient;
  name?: string;
}

function isTextPart(
  part: MessageContentPart,
): part is Extract<MessageContentPart, { type: "text" }> {
  return part.type === "text";
}

function isAttachmentPart(
  part: MessageContentPart,
): part is Exclude<MessageContentPart, Extract<MessageContentPart, { type: "text" }>> {
  return part.type !== "text";
}

function replayMessage(step: import("../trace.js").Step, message: Message): void {
  const text = message.content
    .filter(isTextPart)
    .map((part) => part.text)
    .join("");
  const images = message.content
    .filter(isAttachmentPart)
    .filter((part) => part.type === "image")
    .map((part) => part.uri);
  const attachments = message.content
    .filter(isAttachmentPart)
    .filter((part) => part.type !== "image")
    .map((part) => part.uri);
  step.logMessage({
    role: message.role,
    text: text || undefined,
    images: images.length > 0 ? images : undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}

function contentParts(content: string | OpenClawContentItem[] | undefined): MessageContentPart[] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  if (!Array.isArray(content)) return [];
  const parts: MessageContentPart[] = [];
  for (const item of content) {
    if (item.type === "input_image" || item.type === "image") {
      parts.push({ type: "image", uri: item.image_url ?? item.url ?? "" });
      continue;
    }
    if (item.text) {
      parts.push({ type: "text", text: item.text });
    }
  }
  return parts;
}

function inputToTheta(input: OpenClawResponsesParams["input"], instructions?: string): Message[] {
  const out: Message[] = [];
  if (instructions) {
    out.push({ role: "system", content: [{ type: "text", text: instructions }] });
  }
  if (typeof input === "string") {
    out.push({ role: "user", content: [{ type: "text", text: input }] });
    return out;
  }
  if (!Array.isArray(input)) return out;
  for (const item of input) {
    const role = item.role ?? "user";
    out.push({ role, content: contentParts(item.content) });
  }
  return out;
}

function extractOutputText(res: OpenClawResponsesResponse): string {
  if (typeof res.output_text === "string" && res.output_text.length > 0) {
    return res.output_text;
  }
  return (
    res.output
      ?.flatMap((item) => item.content ?? [])
      .map((item) => item.text ?? "")
      .join("") ?? ""
  );
}

function tokenUsageFrom(
  usage: OpenClawResponsesResponse["usage"] | undefined,
): TokenUsage | undefined {
  if (!usage) return undefined;
  return {
    input: usage.input_tokens,
    output: usage.output_tokens,
    total:
      usage.total_tokens ??
      ((usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)),
  };
}

export function wrapOpenClaw<T extends OpenClawLike>(
  openclaw: T,
  opts: WrapOpenClawOptions = {},
): T {
  const stepName = opts.name ?? "openclaw.responses";
  const origCreate = openclaw.responses.create.bind(openclaw.responses);

  const wrappedCreate = async (params: OpenClawResponsesParams): Promise<unknown> => {
    const client = opts.client ?? getDefaultClient();
    const trace = getActiveTrace();

    const run = async (onStep: (apply: (s: import("../trace.js").Step) => void) => void) => {
      if (params.stream) {
        const stream = (await origCreate(params)) as AsyncIterable<OpenClawStreamEvent>;
        return instrumentStream(stream, onStep);
      }
      const res = (await origCreate(params)) as OpenClawResponsesResponse;
      onStep((s) => {
        const text = extractOutputText(res);
        if (text) s.logMessage({ role: "assistant", text });
        const usage = tokenUsageFrom(res.usage);
        if (usage) s.setTokenUsage(usage);
      });
      return res;
    };

    if (trace) {
      return trace.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const message of inputToTheta(params.input, params.instructions)) {
          replayMessage(s, message);
        }
        return run((apply) => apply(s));
      });
    }

    if (params.stream) {
      return streamWithoutActiveTrace(client, stepName, params, origCreate);
    }

    return client.trace({ name: stepName, model: params.model }, async (t) =>
      t.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const message of inputToTheta(params.input, params.instructions)) {
          replayMessage(s, message);
        }
        return run((apply) => apply(s));
      }),
    );
  };

  return new Proxy(openclaw, {
    get(target, prop, recv) {
      if (prop === "responses") {
        return new Proxy(target.responses, {
          get(rTarget, rProp) {
            if (rProp === "create") return wrappedCreate;
            return Reflect.get(rTarget, rProp);
          },
        });
      }
      return Reflect.get(target, prop, recv);
    },
  });
}

async function* instrumentStream(
  stream: AsyncIterable<OpenClawStreamEvent>,
  onStep: (apply: (s: import("../trace.js").Step) => void) => void,
  onDone?: () => void,
): AsyncGenerator<OpenClawStreamEvent> {
  let acc = "";
  let usage: OpenClawResponsesResponse["usage"] | undefined;
  try {
    for await (const event of stream) {
      if (event.type?.endsWith(".delta")) {
        acc += event.delta ?? event.text ?? "";
      }
      if (event.response?.usage) usage = event.response.usage;
      if (event.usage) usage = event.usage;
      yield event;
    }
  } finally {
    onStep((s) => {
      if (acc) s.logMessage({ role: "assistant", text: acc });
      const tokenUsage = tokenUsageFrom(usage);
      if (tokenUsage) s.setTokenUsage(tokenUsage);
    });
    onDone?.();
  }
}

function streamWithoutActiveTrace(
  client: TraceClient,
  stepName: string,
  params: OpenClawResponsesParams,
  origCreate: (params: OpenClawResponsesParams) => Promise<unknown>,
): AsyncIterable<OpenClawStreamEvent> {
  let releaseDone = () => {};
  const done = new Promise<void>((resolve) => {
    releaseDone = resolve;
  });
  let resolveStream!: (stream: AsyncIterable<OpenClawStreamEvent>) => void;
  let rejectStream!: (error: unknown) => void;
  const streamReady = new Promise<AsyncIterable<OpenClawStreamEvent>>((resolve, reject) => {
    resolveStream = resolve;
    rejectStream = reject;
  });

  const traceRun = client
    .trace({ name: stepName, model: params.model }, async (t) =>
      t.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const message of inputToTheta(params.input, params.instructions)) {
          replayMessage(s, message);
        }
        try {
          const stream = (await origCreate(params)) as AsyncIterable<OpenClawStreamEvent>;
          resolveStream(instrumentStream(stream, (apply) => apply(s), releaseDone));
        } catch (error) {
          rejectStream(error);
          throw error;
        }
        return done;
      }),
    )
    .catch((error) => {
      rejectStream(error);
      throw error;
    });

  return {
    async *[Symbol.asyncIterator]() {
      const stream = await streamReady;
      try {
        for await (const event of stream) {
          yield event;
        }
      } finally {
        releaseDone();
        await traceRun.catch(() => undefined);
      }
    },
  };
}
