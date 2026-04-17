import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function PythonAttachmentsPage() {
  return (
    <>
      <h1>Attachments</h1>
      <p>
        Theta supports uploading images, audio, video, files, and sensor data as attachments
        on traces. Attachments are uploaded to cloud storage and referenced by URI in the trace.
      </p>

      <h2>Trace-Level Attachments</h2>
      <p>
        Attach media directly to a trace using the <code>attach_*</code> methods.
        These accept file paths, bytes, or file-like objects.
      </p>
      <CodeBlock lang="python">
        {`with client.trace(name="visual-agent") as t:
    # Attach an image
    uri = t.attach_image("./screenshot.png")

    # Attach audio
    uri = t.attach_audio("./recording.wav")

    # Attach video
    uri = t.attach_video("./demo.mp4")

    # Attach any file
    uri = t.attach_file("./report.pdf", mime="application/pdf")

    # Attach sensor data with modality label
    uri = t.attach_sensor("./lidar_scan.bin", modality="lidar")`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "source", type: "str | bytes | BinaryIO", required: true, description: "File path, raw bytes, or file-like object to upload." },
          { name: "mime", type: "str | None", description: "MIME type override. Auto-detected from file extension if not provided." },
        ]}
      />

      <p>Each method returns the GCS URI of the uploaded file.</p>

      <h2>Message-Level Attachments</h2>
      <p>
        You can also attach media inline within messages using the <code>images</code>,
        <code>audio</code>, and <code>video</code> parameters on <code>log_message()</code>:
      </p>
      <CodeBlock lang="python">
        {`with t.step(name="vision", type="llm") as s:
    s.log_message(
        role="user",
        text="What do you see in this image?",
        images=["./photo.jpg", open("./diagram.png", "rb")],
    )
    s.log_message(
        role="assistant",
        text="I see a cat on a desk next to a monitor.",
    )`}
      </CodeBlock>

      <h2>Sensor Frames</h2>
      <p>
        For robotics and IoT applications, use <code>step.log_sensor_frame()</code> to
        attach sensor data with rich metadata:
      </p>
      <CodeBlock lang="python">
        {`with t.step(name="perception", type="custom") as s:
    s.log_sensor_frame(
        modality="camera",
        source="./frame_001.jpg",
        fps=30.0,
        duration_ms=33,
        metadata={"camera_id": "front_left", "resolution": "1920x1080"},
    )
    s.log_sensor_frame(
        modality="lidar",
        source="./pointcloud.bin",
        mime="application/octet-stream",
        metadata={"num_points": 128000},
    )`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "modality", type: "str", required: true, description: "Sensor modality: 'camera', 'lidar', 'imu', 'depth', etc." },
          { name: "source", type: "str | bytes | BinaryIO", required: true, description: "File path, raw bytes, or file-like object." },
          { name: "mime", type: "str | None", description: "MIME type override." },
          { name: "fps", type: "float | None", description: "Frames per second for video/streaming sensors." },
          { name: "duration_ms", type: "int | None", description: "Duration of the sensor capture in milliseconds." },
          { name: "metadata", type: "dict | None", description: "Arbitrary metadata about the sensor frame." },
        ]}
      />

      <Callout type="info" title="Upload behavior">
        <p>
          Media uploads happen synchronously during trace execution. If an upload fails,
          the SDK logs a warning and continues without the attachment -- it never crashes
          your application.
        </p>
      </Callout>

      <h2>Supported Input Types</h2>
      <p>
        The <code>source</code> parameter on all attachment methods accepts:
      </p>
      <ul>
        <li><strong>File path (str)</strong> -- e.g., <code>"./image.png"</code>. MIME type is auto-detected.</li>
        <li><strong>Bytes</strong> -- raw <code>bytes</code> object. You must provide the <code>mime</code> parameter.</li>
        <li><strong>File-like object</strong> -- any object with a <code>read()</code> method.</li>
      </ul>

      <p>
        See also: <Link href="/docs/api/media">Media API Reference</Link> for the
        underlying upload endpoints.
      </p>
    </>
  );
}
