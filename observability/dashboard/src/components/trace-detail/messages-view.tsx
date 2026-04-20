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
import type { Attachment, MessageContent, ObservedEvent, Step, Trace, ToolCall } from "@/lib/types";
import {
  ArrowRight,
  Bot,
  Cpu,
  FileIcon,
  ImageIcon,
  Music,
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
  const traceAttachments = trace.attachments ?? [];
  const traceEvents = trace.events ?? [];
  const selectedStep = showAll ? undefined : step;
  const shouldShowStepEmptyState =
    !showAll &&
    traceAttachments.length === 0 &&
    traceEvents.length === 0 &&
    selectedStep &&
    !stepHasRenderableContent(selectedStep);

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

          {/* Messages */}
          {s.messages?.map((m, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {m.role}
              </p>
              <div className="mt-2 flex flex-col gap-3 text-sm">
                {m.content.map((c, j) => {
                  if (c.type === "text" && c.text) {
                    return <p key={j} className="whitespace-pre-wrap leading-relaxed">{c.text}</p>;
                  }

                  const url = resolveUrl(c);

                  if (isImageType(c) && url) {
                    return (
                      <ImageFrame
                        key={j}
                        url={url}
                        alt="attachment"
                        platform={trace.platform}
                        width={c.width}
                        height={c.height}
                      />
                    );
                  }
                  if (isAudioType(c) && url) {
                    return <AudioPlayer key={j} url={url} />;
                  }
                  if (isVideoType(c) && url) {
                    return <VideoPlayer key={j} url={url} />;
                  }

                  // Generic attachment with gs:// URI
                  if (c.uri) {
                    const fetchUrl = resolveUri(c.uri);
                    if (!fetchUrl) {
                      return null;
                    }
                    return (
                      <AttachmentCard key={j} type={c.type} uri={c.uri} url={fetchUrl} mime={c.mime} />
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {/* Tool calls */}
          {s.tool_calls?.map((c) => (
            <ToolCallCard key={c.id} call={c} />
          ))}

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
