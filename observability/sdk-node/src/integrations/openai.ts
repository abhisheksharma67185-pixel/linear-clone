import { getActiveTrace } from "../async-context.js";
import { getDefaultClient, type TraceClient } from "../client.js";
import type { Message, MessageContentPart, TokenUsage } from "../types.js";

/**
 * Minimal structural types for the subset of the OpenAI SDK surface we touch.
 * We avoid a hard dep on the `openai` package so this file compiles
 * standalone; users pass their own `openai` client instance.
 */
interface OpenAIChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
        | { type: "input_image"; image_url: string }
      >
    | null;
  name?: string;
  tool_call_id?: string;
}

interface OpenAIChatParams {
  model: string;
  messages: OpenAIChatMessage[];
  stream?: boolean;
  [k: string]: unknown;
}

interface OpenAIChatResponse {
  choices: Array<{
    message?: { role: string; content?: string | null };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

interface OpenAIStreamChunk {
  choices: Array<{ delta?: { role?: string; content?: string } }>;
  usage?: OpenAIChatResponse["usage"];
  model?: string;
}

interface OpenAILike {
  chat: {
    completions: {
      create: (params: OpenAIChatParams) => Promise<unknown>;
    };
  };
}

export interface WrapOpenAIOptions {
  client?: TraceClient;
  /** Override the step name (default: "openai.chat"). */
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
    name: message.name,
    toolCallId: message.tool_call_id,
    metadata: message.metadata,
  });
}

function openaiMessagesToTheta(msgs: OpenAIChatMessage[]): Message[] {
  return msgs.map((m) => {
    const parts: MessageContentPart[] = [];
    if (typeof m.content === "string") {
      parts.push({ type: "text", text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const c of m.content) {
        if (c.type === "text") parts.push({ type: "text", text: c.text });
        else if (c.type === "image_url")
          parts.push({ type: "image", uri: c.image_url.url });
        else if (c.type === "input_image")
          parts.push({ type: "image", uri: c.image_url });
      }
    }
    return {
      role: m.role,
      content: parts,
      name: m.name,
      tool_call_id: m.tool_call_id,
    };
  });
}

function tokenUsageFrom(u: OpenAIChatResponse["usage"] | undefined): TokenUsage | undefined {
  if (!u) return undefined;
  return {
    input: u.prompt_tokens,
    output: u.completion_tokens,
    total: u.total_tokens,
  };
}

/**
 * Wrap an `openai` SDK client so every `chat.completions.create` call emits
 * an `llm` step on the active trace. Supports both non-streaming and
 * streaming modes. Returns a new proxy — the original client is untouched.
 */
export function wrapOpenAI<T extends OpenAILike>(openai: T, opts: WrapOpenAIOptions = {}): T {
  const stepName = opts.name ?? "openai.chat";
  const origCreate = openai.chat.completions.create.bind(openai.chat.completions);

  const wrappedCreate = async (params: OpenAIChatParams): Promise<unknown> => {
    const client = opts.client ?? getDefaultClient();
    const trace = getActiveTrace();

    const run = async (onStep: (apply: (s: import("../trace.js").Step) => void) => void) => {
      if (params.stream) {
        const stream = (await origCreate(params)) as AsyncIterable<OpenAIStreamChunk>;
        return instrumentStream(stream, params, onStep);
      }
      const res = (await origCreate(params)) as OpenAIChatResponse;
      onStep((s) => {
        s.logMessage({
          role: "assistant",
          text: res.choices[0]?.message?.content ?? "",
        });
        s.setTokenUsage(tokenUsageFrom(res.usage) ?? {});
      });
      return res;
    };

    if (trace) {
      return trace.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const m of openaiMessagesToTheta(params.messages)) replayMessage(s, m);
        return run((apply) => apply(s));
      });
    }

    return client.trace({ name: stepName, model: params.model }, async (t) =>
      t.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const m of openaiMessagesToTheta(params.messages)) replayMessage(s, m);
        return run((apply) => apply(s));
      }),
    );
  };

  return new Proxy(openai, {
    get(target, prop, recv) {
      if (prop === "chat") {
        return new Proxy(target.chat, {
          get(chatTarget, chatProp) {
            if (chatProp === "completions") {
              return new Proxy(chatTarget.completions, {
                get(cTarget, cProp) {
                  if (cProp === "create") return wrappedCreate;
                  return Reflect.get(cTarget, cProp);
                },
              });
            }
            return Reflect.get(chatTarget, chatProp);
          },
        });
      }
      return Reflect.get(target, prop, recv);
    },
  });
}

async function* instrumentStream(
  stream: AsyncIterable<OpenAIStreamChunk>,
  _params: OpenAIChatParams,
  onStep: (apply: (s: import("../trace.js").Step) => void) => void,
): AsyncGenerator<OpenAIStreamChunk> {
  let acc = "";
  let usage: OpenAIChatResponse["usage"] | undefined;
  try {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) acc += delta;
      if (chunk.usage) usage = chunk.usage;
      yield chunk;
    }
  } finally {
    onStep((s) => {
      s.logMessage({ role: "assistant", text: acc });
      const u = tokenUsageFrom(usage);
      if (u) s.setTokenUsage(u);
    });
  }
}
