import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function NodeAttachmentsPage() {
  return (
    <>
      <h1>Attachments</h1>
      <p>
        Upload images, audio, video, and files as attachments on traces and steps.
        The SDK accepts a wide range of source types, handles upload to cloud storage
        automatically, and references each attachment by URI in the trace payload.
      </p>

      <h2>Attachment Methods</h2>
      <p>
        Both <code>Trace</code> and <code>Step</code> expose the same set of typed
        attachment helpers:
      </p>
      <CodeBlock lang="typescript">
        {`import { TraceClient } from "@theta/observability";
import fs from "node:fs";

const client = new TraceClient();

await client.trace({ name: "visual-agent" }, async (t) => {
  // Trace-level attachments
  await t.attachImage(fs.readFileSync("./screenshot.png"));
  await t.attachAudio(fs.readFileSync("./recording.wav"));
  await t.attachVideo(fs.readFileSync("./demo.mp4"));
  await t.attachFile(fs.readFileSync("./report.pdf"), {
    mime: "application/pdf",
  });

  // Step-level attachments
  await t.step({ name: "analyze", type: "llm" }, async (s) => {
    await s.attachImage(Buffer.from(imageData));
    await s.attach("file", csvBuffer, { mime: "text/csv" });
  });
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "source", type: "AttachmentSource", required: true, description: "The data to upload. See Source Types below." },
          { name: "meta.mime", type: "string", description: "MIME type override. Auto-detected from file extension when possible." },
          { name: "meta.size", type: "number", description: "Override the byte size." },
          { name: "meta.width", type: "number", description: "Image/video width in pixels." },
          { name: "meta.height", type: "number", description: "Image/video height in pixels." },
          { name: "meta.duration_ms", type: "number", description: "Audio/video duration in milliseconds." },
          { name: "meta.metadata", type: "Record<string, unknown>", description: "Arbitrary metadata attached to the file." },
        ]}
      />

      <h2>Source Types</h2>
      <p>
        The <code>AttachmentSource</code> union accepts several input forms. The SDK
        normalizes them all before upload.
      </p>
      <CodeBlock lang="typescript">
        {`type AttachmentSource =
  | Buffer              // Node.js Buffer
  | Uint8Array          // raw bytes
  | Blob                // browser-compatible Blob
  | string              // file path ("/tmp/img.png") or URL ("https://...")
  | ReadableStream<Uint8Array>   // streaming source
  | {
      data: Buffer | Uint8Array | Blob | string | ReadableStream<Uint8Array>;
      mime?: string;     // explicit MIME type
      filename?: string; // suggested filename
    };`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "Buffer", type: "Buffer", description: "Node.js Buffer with raw file bytes." },
          { name: "Uint8Array", type: "Uint8Array", description: "Raw byte array (converted to Buffer internally)." },
          { name: "Blob", type: "Blob", description: "Browser-compatible Blob. MIME is read from blob.type." },
          { name: "string (path)", type: "string", description: "Local file path -- read with fs.readFile, MIME inferred from extension." },
          { name: "string (URL)", type: "string", description: "HTTP(S) or gs:// URL -- referenced directly, no upload performed." },
          { name: "ReadableStream", type: "ReadableStream<Uint8Array>", description: "Streaming source -- buffered before upload." },
          { name: "{ data, mime?, filename? }", type: "object", description: "Wrapped form for explicit MIME type or filename alongside any data source." },
        ]}
      />

      <Callout type="info" title="URL sources skip upload">
        <p>
          When the source is an <code>https://</code> or <code>gs://</code> URL, the SDK
          stores the URI directly without uploading any bytes. This is useful for
          referencing assets that already live in cloud storage.
        </p>
      </Callout>

      <h2>How Proxy Upload Works</h2>
      <p>
        For binary sources, the SDK uploads through the Theta ingest API's proxy
        endpoint (<code>POST /v1/media/upload</code>). The flow is:
      </p>
      <ol>
        <li>The SDK normalizes the source into a fetch-compatible body.</li>
        <li>It POSTs the bytes to <code>{"{baseUrl}"}/v1/media/upload</code> with your API key.</li>
        <li>The server stores the file in cloud storage and returns a <code>gs://</code> URI.</li>
        <li>The attachment record (type, URI, MIME, size) is embedded in the trace payload.</li>
      </ol>
      <p>
        This means your application never needs direct cloud storage credentials --
        all uploads are authenticated through your Theta API key.
      </p>

      <h2>Inline Message Attachments</h2>
      <p>
        You can attach images and files directly inside <code>logMessage()</code> using
        the <code>images</code> and <code>attachments</code> fields. These are uploaded
        lazily in the background.
      </p>
      <CodeBlock lang="typescript">
        {`await t.step({ name: "vision", type: "llm" }, async (s) => {
  s.logMessage({
    role: "user",
    text: "What do you see in this image?",
    images: [
      Buffer.from(screenshotData),     // raw bytes
      "./photo.png",                   // file path
      "https://example.com/img.jpg",   // remote URL
    ],
    attachments: [
      { data: csvBuffer, mime: "text/csv", filename: "data.csv" },
    ],
  });
  s.logMessage({ role: "assistant", text: "I see a chart." });
});`}
      </CodeBlock>

      <Callout type="tip" title="Lazy uploads">
        <p>
          Inline message attachments are uploaded in the background. The SDK ensures
          all pending uploads complete before the trace is serialized and sent to the
          server. For deterministic ordering, use <code>await s.attachImage(...)</code>
          followed by <code>s.logMessage()</code>.
        </p>
      </Callout>

      <h2>Manual Upload</h2>
      <p>
        Upload attachments independently of a trace using <code>client.upload()</code>.
        This is useful when you want to prepare media before starting a trace.
      </p>
      <CodeBlock lang="typescript">
        {`const attachment = await client.upload("image", imageBuffer);
// attachment.uri contains the storage URI

// Later, reference it in a message
s.logMessage({
  role: "user",
  text: "Analyze this image",
  images: [attachment.uri],
});`}
      </CodeBlock>

      <h2>Full Example</h2>
      <CodeBlock lang="typescript" title="all-modalities.ts">
        {`import { TraceClient } from "@theta/observability";
import { readFileSync } from "node:fs";

const client = new TraceClient();

await client.trace({ name: "multimodal-demo" }, async (t) => {
  // Image from file path (MIME auto-detected as image/png)
  await t.attachImage("./screenshot.png");

  // Audio from Buffer
  const wavData = readFileSync("./speech.wav");
  await t.attachAudio(wavData);

  // Video with explicit metadata
  await t.attachVideo(readFileSync("./recording.mp4"), {
    duration_ms: 12000,
    width: 1920,
    height: 1080,
  });

  // File with wrapped source for explicit MIME
  await t.attachFile(
    { data: readFileSync("./data.parquet"), mime: "application/octet-stream", filename: "data.parquet" },
  );

  // Remote URL -- no upload, just reference
  await t.attachImage("https://cdn.example.com/logo.png");

  await t.step({ name: "describe", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({
      role: "user",
      text: "Describe the attached screenshot",
      images: ["./screenshot.png"],
    });
    s.logMessage({ role: "assistant", text: "The screenshot shows a dashboard." });
    s.setTokenUsage({ input: 800, output: 40 });
  });
});`}
      </CodeBlock>

      <Callout type="info" title="Fail-soft uploads">
        <p>
          If an upload fails, the SDK logs a warning (in debug mode) and returns a
          placeholder attachment with an empty URI. Your application code continues
          without interruption.
        </p>
      </Callout>

      <p>
        See also: <Link href="/docs/api/media">Media API Reference</Link> for the
        underlying upload endpoints, and <Link href="/docs/node/traces">Traces & Steps</Link> for
        the full step API.
      </p>
    </>
  );
}
