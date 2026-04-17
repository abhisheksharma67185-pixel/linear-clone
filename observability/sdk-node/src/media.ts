import { readFile } from "node:fs/promises";
import type { Attachment, AttachmentSource, AttachmentType } from "./types.js";

export interface SignedUrlResponse {
  url: string;
  gs_uri: string;
  expires_at: string;
}

export interface UploadOptions {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  debug: boolean;
  fetchImpl?: typeof fetch;
}

interface NormalizedSource {
  body: Buffer | Blob | ReadableStream<Uint8Array>;
  size: number | undefined;
  mime: string | undefined;
  filename: string | undefined;
}

function isReadableStream(x: unknown): x is ReadableStream<Uint8Array> {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as ReadableStream).getReader === "function"
  );
}

function isBlob(x: unknown): x is Blob {
  return typeof Blob !== "undefined" && x instanceof Blob;
}

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || /^gs:\/\//i.test(s);
}

function extMime(filename: string): string | undefined {
  const m = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!m) return undefined;
  const ext = m[1];
  const table: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    parquet: "application/octet-stream",
    json: "application/json",
    txt: "text/plain",
  };
  return ext ? table[ext] : undefined;
}

/**
 * Normalize an AttachmentSource into a fetch-compatible body + metadata.
 * Note: returns { remoteUri } if the source is already a URL (http(s)/gs).
 */
export async function normalizeSource(
  source: AttachmentSource,
): Promise<NormalizedSource | { remoteUri: string; mime?: string }> {
  // Wrapped form
  if (
    typeof source === "object" &&
    source !== null &&
    !Buffer.isBuffer(source) &&
    !(source instanceof Uint8Array) &&
    !isBlob(source) &&
    !isReadableStream(source) &&
    "data" in source
  ) {
    const inner = await normalizeSource(source.data);
    if ("remoteUri" in inner) {
      return { remoteUri: inner.remoteUri, mime: source.mime ?? inner.mime };
    }
    return {
      body: inner.body,
      size: inner.size,
      mime: source.mime ?? inner.mime,
      filename: source.filename ?? inner.filename,
    };
  }

  if (typeof source === "string") {
    if (looksLikeUrl(source)) {
      return { remoteUri: source, mime: extMime(source) };
    }
    // Treat as file path.
    const buf = await readFile(source);
    return {
      body: buf,
      size: buf.byteLength,
      mime: extMime(source),
      filename: source.split("/").pop(),
    };
  }

  if (Buffer.isBuffer(source)) {
    return { body: source, size: source.byteLength, mime: undefined, filename: undefined };
  }

  if (source instanceof Uint8Array) {
    const buf = Buffer.from(source.buffer, source.byteOffset, source.byteLength);
    return { body: buf, size: buf.byteLength, mime: undefined, filename: undefined };
  }

  if (isBlob(source)) {
    return {
      body: source,
      size: source.size,
      mime: source.type || undefined,
      filename: undefined,
    };
  }

  if (isReadableStream(source)) {
    return { body: source, size: undefined, mime: undefined, filename: undefined };
  }

  throw new Error("Unsupported attachment source");
}

/**
 * Request a signed upload URL from the ingest API, PUT the bytes to GCS,
 * and return the resulting Attachment record.
 */
export async function uploadAttachment(
  opts: UploadOptions,
  type: AttachmentType,
  source: AttachmentSource,
  overrides: Partial<Attachment> = {},
): Promise<Attachment> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const normalized = await normalizeSource(source);

  // Already remote — just reference it directly.
  if ("remoteUri" in normalized) {
    return {
      type,
      uri: normalized.remoteUri,
      mime: overrides.mime ?? normalized.mime,
      ...overrides,
    };
  }

  const mime = overrides.mime ?? normalized.mime ?? "application/octet-stream";
  const size = overrides.size ?? normalized.size;

  // Stream straight through the ingest API's proxy upload endpoint — works in
  // prod (real GCS) and against emulators alike.
  const traceId = (overrides as { trace_id?: string }).trace_id;
  const filename = (overrides as { filename?: string }).filename ?? normalized.filename;
  const params = new URLSearchParams();
  if (traceId) params.set("trace_id", traceId);
  if (filename) params.set("name", filename);
  const qs = params.toString();

  const body = await toFetchBody(normalized.body);
  const upRes = await fetchImpl(
    `${opts.baseUrl}/v1/media/upload${qs ? `?${qs}` : ""}`,
    {
      method: "POST",
      headers: {
        "content-type": mime,
        "x-api-key": opts.apiKey,
      },
      body,
      signal: AbortSignal.timeout(opts.timeout),
    }
  );
  if (!upRes.ok) {
    throw new Error(`upload failed: ${upRes.status} ${upRes.statusText}`);
  }
  const signed = (await upRes.json()) as SignedUrlResponse;

  return {
    type,
    uri: signed.gs_uri,
    mime,
    size,
    ...overrides,
  };
}

async function toFetchBody(
  body: Buffer | Blob | ReadableStream<Uint8Array>,
): Promise<BodyInit> {
  if (Buffer.isBuffer(body)) {
    // Wrap in a Blob so the type fits BodyInit across Node + DOM lib defs.
    return new Blob([bufferToArrayBuffer(body)]);
  }
  if (isBlob(body)) return body;
  if (isReadableStream(body)) {
    // Buffer the stream — most ingest endpoints want a known length.
    const chunks: Uint8Array[] = [];
    const reader = body.getReader();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    return new Blob([bufferToArrayBuffer(buf)]);
  }
  throw new Error("unsupported body");
}

function bufferToArrayBuffer(buf: Buffer | Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  return ab;
}
