import { Badge } from "@/components/ui/badge";
import { ImageFrame } from "./modalities/image-frame";
import { AudioPlayer } from "./modalities/audio-player";
import { VideoPlayer } from "./modalities/video-player";
import { SensorPlot } from "./modalities/sensor-plot";
import { ToolCallCard } from "./tool-call-card";
import type { MessageContent, Step, Trace } from "@/lib/types";
import { FileIcon, ImageIcon, Music, Video, Cpu } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Convert a gs:// URI to a browser-fetchable URL via the media serve endpoint */
function mediaUrl(gsUri: string): string {
  return `${API_URL}/v1/media/serve?uri=${encodeURIComponent(gsUri)}`;
}

/** Get the displayable URL for a content part — prefers url, falls back to gs:// proxy */
function resolveUrl(c: MessageContent): string | null {
  if (c.url) return c.url;
  if (c.uri?.startsWith("gs://")) return mediaUrl(c.uri);
  return null;
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

export function MessagesView({
  step,
  trace,
  showAll,
}: {
  step?: Step;
  trace: Trace;
  showAll?: boolean;
}) {
  if (!step && !showAll) {
    return <p className="p-6 text-sm text-muted-foreground">Select a step to view messages.</p>;
  }

  const steps = showAll ? trace.steps ?? [] : step ? [step] : [];

  return (
    <div className="space-y-5 p-5">
      {steps.map((s) => (
        <section key={s.step_id} className="space-y-3">
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
              <div className="mt-2 space-y-3 text-sm">
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
                    const fetchUrl = c.uri.startsWith("gs://") ? mediaUrl(c.uri) : c.uri;
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

          {/* Sensor frames */}
          {s.sensor_frames?.map((a, i) => {
            const url = a.url ?? (a.uri?.startsWith("gs://") ? mediaUrl(a.uri) : null);
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
            if (a.uri) {
              const fetchUrl = a.uri.startsWith("gs://") ? mediaUrl(a.uri) : a.uri;
              return (
                <AttachmentCard key={i} type="sensor" uri={a.uri} url={fetchUrl} mime={a.mime} modality={a.modality} />
              );
            }
            return null;
          })}

          {/* Step-level attachments */}
          {s.attachments?.map((a, i) => {
            const url = a.url ?? (a.uri?.startsWith("gs://") ? mediaUrl(a.uri) : null);
            if (isImageType(a as MessageContent) && url) {
              return <ImageFrame key={i} url={url} alt="attachment" platform={trace.platform} />;
            }
            if (isAudioType(a as MessageContent) && url) {
              return <AudioPlayer key={i} url={url} />;
            }
            if (isVideoType(a as MessageContent) && url) {
              return <VideoPlayer key={i} url={url} />;
            }
            if (a.uri) {
              const fetchUrl = a.uri.startsWith("gs://") ? mediaUrl(a.uri) : a.uri;
              return <AttachmentCard key={i} type={a.type} uri={a.uri} url={fetchUrl} mime={a.mime} />;
            }
            return null;
          })}
        </section>
      ))}
    </div>
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
