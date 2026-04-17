import { getActiveTrace } from "../async-context.js";
import { getDefaultClient, type TraceClient } from "../client.js";
import type { Message, MessageContentPart, TokenUsage } from "../types.js";

interface AnthropicContentBlock {
  type: "text" | "image" | "tool_use" | "tool_result";
  text?: string;
  source?: { type: "base64" | "url"; media_type?: string; data?: string; url?: string };
  name?: string;
  input?: unknown;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

interface AnthropicMessagesParams {
  model: string;
  messages: AnthropicMessage[];
  system?: string;
  stream?: boolean;
  max_tokens?: number;
  [k: string]: unknown;
}

interface AnthropicMessagesResponse {
  content: AnthropicContentBlock[];
  usage?: { input_tokens?: number; output_tokens?: number };
  model?: string;
  stop_reason?: string | null;
}

interface AnthropicStreamEvent {
  type: string;
  delta?: { type?: string; text?: string };
  message?: { usage?: AnthropicMessagesResponse["usage"] };
  usage?: AnthropicMessagesResponse["usage"];
}

interface AnthropicLike {
  messages: {
    create: (params: AnthropicMessagesParams) => Promise<unknown>;
  };
}

export interface WrapAnthropicOptions {
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

function anthropicToTheta(msgs: AnthropicMessage[], system?: string): Message[] {
  const out: Message[] = [];
  if (system) out.push({ role: "system", content: [{ type: "text", text: system }] });
  for (const m of msgs) {
    const parts: MessageContentPart[] = [];
    if (typeof m.content === "string") {
      parts.push({ type: "text", text: m.content });
    } else {
      for (const block of m.content) {
        if (block.type === "text" && block.text) {
          parts.push({ type: "text", text: block.text });
        } else if (block.type === "image" && block.source) {
          const uri =
            block.source.type === "url"
              ? block.source.url ?? ""
              : `data:${block.source.media_type ?? "image/png"};base64,${block.source.data ?? ""}`;
          parts.push({ type: "image", uri, mime: block.source.media_type });
        }
      }
    }
    out.push({ role: m.role, content: parts });
  }
  return out;
}

function tokenUsage(u: AnthropicMessagesResponse["usage"] | undefined): TokenUsage | undefined {
  if (!u) return undefined;
  const input = u.input_tokens ?? 0;
  const output = u.output_tokens ?? 0;
  return { input, output, total: input + output };
}

export function wrapAnthropic<T extends AnthropicLike>(
  anthropic: T,
  opts: WrapAnthropicOptions = {},
): T {
  const stepName = opts.name ?? "anthropic.messages";
  const origCreate = anthropic.messages.create.bind(anthropic.messages);

  const wrappedCreate = async (params: AnthropicMessagesParams): Promise<unknown> => {
    const client = opts.client ?? getDefaultClient();
    const trace = getActiveTrace();

    const run = async (onStep: (apply: (s: import("../trace.js").Step) => void) => void) => {
      if (params.stream) {
        const stream = (await origCreate(params)) as AsyncIterable<AnthropicStreamEvent>;
        return instrumentStream(stream, onStep);
      }
      const res = (await origCreate(params)) as AnthropicMessagesResponse;
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("");
      onStep((s) => {
        s.logMessage({ role: "assistant", text });
        const u = tokenUsage(res.usage);
        if (u) s.setTokenUsage(u);
      });
      return res;
    };

    if (trace) {
      return trace.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const m of anthropicToTheta(params.messages, params.system)) replayMessage(s, m);
        return run((apply) => apply(s));
      });
    }
    return client.trace({ name: stepName, model: params.model }, async (t) =>
      t.step({ name: stepName, type: "llm", model: params.model }, async (s) => {
        for (const m of anthropicToTheta(params.messages, params.system)) replayMessage(s, m);
        return run((apply) => apply(s));
      }),
    );
  };

  return new Proxy(anthropic, {
    get(target, prop, recv) {
      if (prop === "messages") {
        return new Proxy(target.messages, {
          get(mTarget, mProp) {
            if (mProp === "create") return wrappedCreate;
            return Reflect.get(mTarget, mProp);
          },
        });
      }
      return Reflect.get(target, prop, recv);
    },
  });
}

async function* instrumentStream(
  stream: AsyncIterable<AnthropicStreamEvent>,
  onStep: (apply: (s: import("../trace.js").Step) => void) => void,
): AsyncGenerator<AnthropicStreamEvent> {
  let acc = "";
  let usage: AnthropicMessagesResponse["usage"] | undefined;
  try {
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) {
        acc += ev.delta.text;
      }
      if (ev.type === "message_delta" && ev.usage) usage = ev.usage;
      if (ev.type === "message_start" && ev.message?.usage) usage = ev.message.usage;
      yield ev;
    }
  } finally {
    onStep((s) => {
      s.logMessage({ role: "assistant", text: acc });
      const u = tokenUsage(usage);
      if (u) s.setTokenUsage(u);
    });
  }
}
