import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ImageFrame } from "./modalities/image-frame";
import { AudioPlayer } from "./modalities/audio-player";
import { VideoPlayer } from "./modalities/video-player";
import { SensorPlot } from "./modalities/sensor-plot";
import { ToolCallCard } from "./tool-call-card";
import { JsonViewer } from "./json-viewer";
import type {
  Attachment,
  Message,
  MessageContent,
  ObservedEvent,
  Step,
  Trace,
  ToolCall,
} from "@/lib/types";
import {
  ArrowRight,
  Bot,
  Cpu,
  FileIcon,
  Globe,
  Hash,
  ImageIcon,
  Music,
  TriangleAlert,
  Video,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Convert a gs:// URI to a browser-fetchable URL via the media serve endpoint */
function mediaUrl(gsUri: string): string {
  return `${API_URL}/v1/media/serve?uri=${encodeURIComponent(gsUri)}`;
}

function resolveUri(uri?: string): string | null {
  if (!uri) return null;
  if (uri.startsWith("gs://")) return mediaUrl(uri);
  if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("data:")) {
    return uri;
  }
  return null;
}

/** Get the displayable URL for a content part — prefers url, falls back to gs:// proxy */
function resolveUrl(c: MessageContent): string | null {
  if (c.url) return c.url;
  return resolveUri(c.uri);
}

function isImageType(c: MessageContent): boolean {
  return c.type === "image" || c.mime?.startsWith("image/") === true;
}
function isAudioType(c: MessageContent): boolean {
  return c.type === "audio" || c.mime?.startsWith("audio/") === true;
}
function isVideoType(c: MessageContent): boolean {
  return c.type === "video" || c.mime?.startsWith("video/") === true;
}

function stepHasRenderableContent(step?: Step): boolean {
  if (!step) {
    return false;
  }

  return Boolean(
    step.messages?.length ||
      step.tool_calls?.length ||
      step.events?.length ||
      step.attachments?.length ||
      step.sensor_frames?.length ||
      step.error_message
  );
}

function stepHasSummaryContent(step?: Step): boolean {
  if (!step) {
    return false;
  }

  if (step.error_message) {
    return true;
  }

  const metadata = step.metadata ?? {};
  return Object.keys(metadata).some((key) => {
    if (key === "source_input" || key === "source_output" || key === "usage") {
      return false;
    }
    const value = metadata[key];
    return value !== undefined && value !== null && value !== "";
  });
}

function resolveAttachmentUrl(attachment: Pick<Attachment, "url" | "uri">): string | null {
  if (attachment.url) {
    return attachment.url;
  }
  return resolveUri(attachment.uri);
}

function renderAttachment(
  attachment: Attachment,
  trace: Trace,
  key: string | number,
  label = "attachment",
) {
  const url = resolveAttachmentUrl(attachment);
  if (isImageType(attachment as MessageContent) && url) {
    return (
      <ImageFrame
        key={key}
        url={url}
        alt={label}
        platform={trace.platform}
        width={attachment.width}
        height={attachment.height}
      />
    );
  }
  if (isAudioType(attachment as MessageContent) && url) {
    return <AudioPlayer key={key} url={url} />;
  }
  if (isVideoType(attachment as MessageContent) && url) {
    return <VideoPlayer key={key} url={url} />;
  }
  if (attachment.uri && url) {
    return (
      <AttachmentCard
        key={key}
        type={attachment.type}
        uri={attachment.uri}
        url={url}
        mime={attachment.mime}
        modality={attachment.modality}
      />
    );
  }
  return null;
}

function messagePartFingerprint(part: MessageContent): string {
  return JSON.stringify({
    type: part.type,
    text: part.text ?? "",
    uri: part.uri ?? "",
    url: part.url ?? "",
    mime: part.mime ?? "",
    width: part.width ?? null,
    height: part.height ?? null,
  });
}

function messageFingerprint(message: Message): string {
  return JSON.stringify({
    role: message.role,
    name: message.name ?? "",
    tool_call_id: message.tool_call_id ?? "",
    content: message.content.map(messagePartFingerprint),
  });
}

function sharedMessagePrefix(previous: Message[], current: Message[]): number {
  const max = Math.min(previous.length, current.length);
  let index = 0;
  while (index < max && messageFingerprint(previous[index]) === messageFingerprint(current[index])) {
    index += 1;
  }
  return index;
}

function displayedMessagesForSteps(trace: Trace, steps: Step[], showAll?: boolean): Map<string, Message[]> {
  const byStep = new Map<string, Message[]>();
  let previousLLMMessages: Message[] | undefined;

  for (const currentStep of steps) {
    const messages = currentStep.messages ?? [];
    if (!showAll || trace.platform !== "desktop" || currentStep.type !== "llm" || !previousLLMMessages?.length) {
      byStep.set(currentStep.step_id, messages);
      if (currentStep.type === "llm" && messages.length > 0) {
        previousLLMMessages = messages;
      }
      continue;
    }

    const prefixLength = sharedMessagePrefix(previousLLMMessages, messages);
    byStep.set(currentStep.step_id, prefixLength > 0 ? messages.slice(prefixLength) : messages);
    if (messages.length > 0) {
      previousLLMMessages = messages;
    }
  }

  return byStep;
}

function stepSummaryEntries(step: Step): Array<{ key: string; value: string }> {
  const metadata = step.metadata ?? {};
  const entries: Array<{ key: string; value: string }> = [];

  for (const [key, rawValue] of Object.entries(metadata)) {
    if (key === "url" || key === "source_input" || key === "source_output" || key === "usage") {
      continue;
    }
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      continue;
    }
    if (typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean") {
      entries.push({ key, value: String(rawValue) });
    }
  }

  return entries.slice(0, 6);
}

function eventHasDistinctRenderableContent(event: ObservedEvent, step?: Step): boolean {
  if (event.value !== undefined) return true;
  if (event.metadata && Object.keys(event.metadata).length > 0) return true;
  if (event.attachment && !(step?.attachments?.length)) return true;
  if (event.sensor_frame && !(step?.sensor_frames?.length)) return true;
  if (event.tool_call && !(step?.tool_calls?.length)) return true;
  if (event.message && !(step?.messages?.length)) return true;
  return false;
}

function renderEventContent(event: ObservedEvent, trace: Trace, step?: Step) {
  const blocks: React.ReactNode[] = [];
  if (event.message) {
    blocks.push(
      <div key="message" className="rounded-lg border border-border bg-card p-4">
        <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {event.message.role}
        </p>
        <div className="mt-2 flex flex-col gap-3 text-sm">
          {event.message.content.map((part, index) => {
            if (part.type === "text" && part.text) {
              return <p key={index} className="whitespace-pre-wrap leading-relaxed">{part.text}</p>;
            }
            return renderAttachment(part as Attachment, trace, `msg-${index}`, "event attachment");
          })}
        </div>
      </div>
    );
  }
  if (event.tool_call) {
    const call: ToolCall = {
      ...event.tool_call,
      latency_ms: event.tool_call.latency_ms ?? event.latency_ms,
    };
    blocks.push(<ToolCallCard key="tool_call" call={call} />);
  }
  if (event.attachment) {
    const attachmentNode = renderAttachment(event.attachment, trace, "attachment", event.name ?? event.type);
    if (attachmentNode) {
      blocks.push(attachmentNode);
    }
  }
  if (event.sensor_frame) {
    if (event.sensor_frame.modality === "joint_state") {
      blocks.push(<SensorPlot key="sensor" label={event.sensor_frame.modality} />);
    } else {
      const sensorNode = renderAttachment(
        { ...event.sensor_frame, type: "sensor" },
        trace,
        "sensor",
        event.sensor_frame.modality ?? "sensor frame"
      );
      if (sensorNode) {
        blocks.push(sensorNode);
      }
    }
  }
  if (event.value !== undefined || (event.metadata && Object.keys(event.metadata).length > 0)) {
    const payload = {
      ...(event.value !== undefined ? { value: event.value } : {}),
      ...(event.metadata && Object.keys(event.metadata).length > 0 ? { metadata: event.metadata } : {}),
    };
    blocks.push(
      <div key="json" className="rounded-lg border border-border bg-card p-4">
        <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Event payload
        </p>
        <JsonViewer value={payload} initialDepth={1} />
      </div>
    );
  }

  if (blocks.length === 0 && step && !eventHasDistinctRenderableContent(event, step)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.length > 0 ? blocks : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          No renderable content for this event.
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  trace,
  step,
}: {
  event: ObservedEvent;
  trace: Trace;
  step?: Step;
}) {
  if (!eventHasDistinctRenderableContent(event, step)) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Badge variant="outline" className="uppercase">
          {event.type}
        </Badge>
        <span className="text-sm font-semibold">{event.name ?? event.tool_call?.name ?? event.message?.role ?? "event"}</span>
        {event.status ? <Badge variant={event.status === "error" ? "destructive" : "success"}>{event.status}</Badge> : null}
        {event.latency_ms !== undefined ? (
          <span className="ml-auto text-[0.625rem] text-muted-foreground">
            {event.latency_ms}ms
          </span>
        ) : null}
      </div>
      <div className="p-4">
        {renderEventContent(event, trace, step)}
      </div>
    </div>
  );
}

function StepContextCard({ step }: { step: Step }) {
  if (!stepHasSummaryContent(step)) {
    return null;
  }

  const metadata = step.metadata ?? {};
  const url = typeof metadata.url === "string" ? metadata.url : undefined;
  const summaryEntries = stepSummaryEntries(step);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Badge variant="outline" className="uppercase">
          Step context
        </Badge>
        {step.error_message ? <Badge variant="destructive">error</Badge> : null}
        {step.status === "running" ? <Badge variant="outline">running</Badge> : null}
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {url ? (
          <div className="rounded-lg border border-border bg-muted/25 p-3">
            <div className="mb-1 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe className="size-3" />
              URL
            </div>
            <p className="break-all font-mono text-xs text-foreground">{url}</p>
          </div>
        ) : null}

        {summaryEntries.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {summaryEntries.map((entry) => (
              <div key={entry.key} className="rounded-lg border border-border bg-muted/25 p-3">
                <div className="mb-1 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Hash className="size-3" />
                  {entry.key.replaceAll("_", " ")}
                </div>
                <p className="break-words text-sm text-foreground">{entry.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {step.error_message ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="mb-1 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-wider text-destructive">
              <TriangleAlert className="size-3" />
              Error
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground">{step.error_message}</p>
          </div>
        ) : null}

        {Object.keys(metadata).length > 0 ? (
          <div className="rounded-lg border border-border bg-muted/15 p-3">
            <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Raw metadata
            </p>
            <JsonViewer value={metadata} initialDepth={1} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MessageCard({
  message,
  trace,
  toolName,
}: {
  message: Message;
  trace: Trace;
  toolName?: string;
}) {
  const roleLabel = message.role === "tool" ? "tool result" : message.role;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {roleLabel}
        </p>
        {toolName ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            {toolName}
          </Badge>
        ) : null}
      </div>
      <div className="mt-2 flex flex-col gap-3 text-sm">
        {message.content.map((content, index) => {
          if (content.type === "text" && content.text) {
            return (
              <p key={index} className="whitespace-pre-wrap leading-relaxed">
                {content.text}
              </p>
            );
          }

          const url = resolveUrl(content);

          if (isImageType(content) && url) {
            return (
              <ImageFrame
                key={index}
                url={url}
                alt={toolName ? `${toolName} output` : "attachment"}
                platform={trace.platform}
                width={content.width}
                height={content.height}
              />
            );
          }
          if (isAudioType(content) && url) {
            return <AudioPlayer key={index} url={url} />;
          }
          if (isVideoType(content) && url) {
            return <VideoPlayer key={index} url={url} />;
          }

          if (content.uri) {
            const fetchUrl = resolveUri(content.uri);
            if (!fetchUrl) {
              return null;
            }
            return (
              <AttachmentCard
                key={index}
                type={content.type}
                uri={content.uri}
                url={fetchUrl}
                mime={content.mime}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function renderStepConversation(step: Step, messages: Message[], trace: Trace): React.ReactNode[] {
  const renderedToolCalls = new Set<string>();
  const toolCallsById = new Map((step.tool_calls ?? []).map((call) => [call.id, call] as const));
  const nodes: React.ReactNode[] = [];

  messages.forEach((message, index) => {
    const matchingCall = message.tool_call_id ? toolCallsById.get(message.tool_call_id) : undefined;
    if (matchingCall && !renderedToolCalls.has(matchingCall.id)) {
      nodes.push(<ToolCallCard key={`${step.step_id}-tool-${matchingCall.id}`} call={matchingCall} />);
      renderedToolCalls.add(matchingCall.id);
    }
    nodes.push(
      <MessageCard
        key={`${step.step_id}-message-${index}`}
        message={message}
        trace={trace}
        toolName={matchingCall?.name}
      />
    );
  });

  (step.tool_calls ?? []).forEach((call) => {
    if (renderedToolCalls.has(call.id)) {
      return;
    }
    nodes.push(<ToolCallCard key={`${step.step_id}-tool-${call.id}`} call={call} />);
  });

  return nodes;
}

export function MessagesView({
  step,
  trace,
  showAll,
  preferredStep,
  onSelectStep,
}: {
  step?: Step;
  trace: Trace;
  showAll?: boolean;
  preferredStep?: Step;
  onSelectStep?: (stepId: string) => void;
}) {
  if (!step && !showAll) {
    return (
      <div className="p-5">
        <TraceStepEmptyState />
      </div>
    );
  }

  const steps = showAll ? trace.steps ?? [] : step ? [step] : [];
  const displayMessages = displayedMessagesForSteps(trace, steps, showAll);
  const traceAttachments = trace.attachments ?? [];
  const traceEvents = trace.events ?? [];
  const selectedStep = showAll ? undefined : step;
  const shouldShowStepEmptyState =
    !showAll &&
    traceAttachments.length === 0 &&
    traceEvents.length === 0 &&
    selectedStep &&
    !stepHasRenderableContent(selectedStep) &&
    !stepHasSummaryContent(selectedStep);

  if (shouldShowStepEmptyState) {
    const canJumpToPreferredStep =
      preferredStep &&
      preferredStep.step_id !== selectedStep.step_id &&
      stepHasRenderableContent(preferredStep);

    return (
      <div className="p-5">
        <TraceStepEmptyState
          title={`"${selectedStep.name ?? selectedStep.type}" has no visible payload`}
          description="This step is a wrapper or control step, so it doesn't contain chat messages, tool calls, or attachments on its own."
          actionLabel={
            canJumpToPreferredStep
              ? `Open ${preferredStep.name ?? preferredStep.type}`
              : undefined
          }
          onAction={
            canJumpToPreferredStep && onSelectStep
              ? () => onSelectStep(preferredStep.step_id)
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      {traceAttachments.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Badge variant="outline" className="uppercase">trace</Badge>
            <p className="text-sm font-semibold">Attachments</p>
          </div>
          <div className="flex flex-col gap-3">
            {traceAttachments.map((attachment, index) =>
              renderAttachment(attachment, trace, `trace-attachment-${index}`, "trace attachment")
            )}
          </div>
        </section>
      )}
      {traceEvents.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Badge variant="outline" className="uppercase">trace</Badge>
            <p className="text-sm font-semibold">Events</p>
          </div>
          <div className="flex flex-col gap-3">
            {traceEvents.map((event, index) => (
              <EventCard key={event.event_id ?? `trace-event-${index}`} event={event} trace={trace} />
            ))}
          </div>
        </section>
      )}
      {steps.map((s) => (
        <section key={s.step_id} className="flex flex-col gap-3">
          {showAll && (
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Badge variant="outline" className="uppercase">{s.type}</Badge>
              <p className="text-sm font-semibold">{s.name ?? s.type}</p>
              {s.model && (
                <Badge variant="ghost" className="font-mono text-xs">{s.model}</Badge>
              )}
            </div>
          )}

          <StepContextCard step={s} />

          {renderStepConversation(s, displayMessages.get(s.step_id) ?? [], trace)}

          {s.events?.map((event, index) => (
            <EventCard
              key={event.event_id ?? `${s.step_id}-event-${index}`}
              event={event}
              trace={trace}
              step={s}
            />
          ))}

          {/* Sensor frames */}
          {s.sensor_frames?.map((a, i) => {
            const url = resolveAttachmentUrl(a);
            if (a.modality === "camera" && url) {
              return (
                <div key={i}>
                  <p className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    sensor · {a.modality}
                  </p>
                  <ImageFrame url={url} platform={trace.platform} />
                </div>
              );
            }
            if (a.modality === "joint_state") {
              return <SensorPlot key={i} label={a.modality} />;
            }
            if (a.uri && url) {
              return (
                <AttachmentCard key={i} type="sensor" uri={a.uri} url={url} mime={a.mime} modality={a.modality} />
              );
            }
            return null;
          })}

          {/* Step-level attachments */}
          {s.attachments?.map((attachment, index) =>
            renderAttachment(attachment, trace, `${s.step_id}-attachment-${index}`, "step attachment")
          )}
        </section>
      ))}
    </div>
  );
}

function TraceStepEmptyState({
  title = "Select a step to inspect the trace",
  description = "Choose a step from the left rail to view its messages, tool calls, and multimodal attachments.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Empty className="min-h-[320px] border bg-muted/20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Bot />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {actionLabel && onAction ? (
        <EmptyContent>
          <Button onClick={onAction}>
            <ArrowRight data-icon="inline-end" />
            {actionLabel}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

function AttachmentCard({
  type,
  uri,
  url,
  mime,
  modality,
}: {
  type: string;
  uri: string;
  url: string;
  mime?: string;
  modality?: string;
}) {
  const Icon = type === "image" ? ImageIcon
    : type === "audio" ? Music
    : type === "video" ? Video
    : type === "sensor" ? Cpu
    : FileIcon;

  const label = modality ? `${type} · ${modality}` : type;
  const shortUri = uri.length > 60 ? uri.slice(0, 30) + "…" + uri.slice(-25) : uri;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">{shortUri}</p>
        {mime && <p className="text-[10px] text-muted-foreground/60">{mime}</p>}
      </div>
      <Badge variant="outline" className="ml-auto shrink-0 text-[9px]">View</Badge>
    </a>
  );
}
