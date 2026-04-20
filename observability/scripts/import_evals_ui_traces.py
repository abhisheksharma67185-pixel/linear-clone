#!/usr/bin/env python3
"""
Import evals-ui Firestore/GCS traces into a local Theta Observability project.

This script is meant for local migration/backfill work against the dev stack.
It:
1. reads evals-ui credentials from an env file
2. resolves or creates a Theta project under a local org
3. creates a fresh API key for that project
4. streams source traces from Firestore
5. downloads full trace JSON from source GCS
6. maps traces into Theta's schema and ingests them through POST /v1/traces

Example:
  uv run \
    --with google-cloud-firestore \
    --with google-cloud-storage \
    --with requests \
    --with PyJWT \
    --with "psycopg[binary]" \
    python scripts/import_evals_ui_traces.py \
      --source-env /Users/yugg/Code/evals-ui/.env.local \
      --org-slug theta-demo \
      --project-name "Evals UI Desktop"
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import mimetypes
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import quote, unquote, urlparse

try:
    import requests
except ModuleNotFoundError:  # pragma: no cover - exercised only in lightweight test envs
    requests = None  # type: ignore[assignment]

try:
    import psycopg
except ModuleNotFoundError:  # pragma: no cover - exercised only in lightweight test envs
    psycopg = None  # type: ignore[assignment]

try:
    from google.cloud import firestore
    from google.cloud import storage
    from google.cloud.firestore_v1.base_query import FieldFilter
    from google.oauth2 import service_account
except ModuleNotFoundError:  # pragma: no cover - exercised only in lightweight test envs
    firestore = None  # type: ignore[assignment]
    storage = None  # type: ignore[assignment]
    FieldFilter = Any  # type: ignore[assignment]
    service_account = None  # type: ignore[assignment]


LOCAL_THETA_DSN = "postgres://theta:theta@localhost:5432/theta_obs?sslmode=disable"
LOCAL_THETA_API = "http://localhost:8080"
LOCAL_THETA_JWT_SECRET = "dev-jwt-secret-change-me"
LOCAL_TARGET_GCS_ENDPOINT = "http://localhost:4443/storage/v1/"
LOCAL_TARGET_GCS_BUCKET = "theta-obs-dev"


def log(message: str) -> None:
    print(message, flush=True)


@dataclass
class ThetaContext:
    org_id: str
    org_slug: str
    user_id: str
    user_email: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import evals-ui traces into Theta.")
    parser.add_argument(
        "--source-env",
        default="/Users/yugg/Code/evals-ui/.env.local",
        help="Path to evals-ui env file containing GCP credentials.",
    )
    parser.add_argument(
        "--run-type",
        default="desktop",
        help="Source Firestore run_type filter. Defaults to desktop.",
    )
    parser.add_argument(
        "--theta-base-url",
        default=LOCAL_THETA_API,
        help="Theta API base URL.",
    )
    parser.add_argument(
        "--theta-api-key",
        default="",
        help="Optional pre-minted Theta API key. When set, the importer skips control-plane API key creation.",
    )
    parser.add_argument(
        "--theta-db-url",
        default=LOCAL_THETA_DSN,
        help="Theta Postgres URL used only to resolve org/user context.",
    )
    parser.add_argument(
        "--theta-jwt-secret",
        default=LOCAL_THETA_JWT_SECRET,
        help="Local Theta dashboard JWT secret.",
    )
    parser.add_argument(
        "--org-slug",
        default="theta-demo",
        help="Theta org slug to import into.",
    )
    parser.add_argument(
        "--project-name",
        default="Evals UI Desktop",
        help="Theta project name to create or reuse.",
    )
    parser.add_argument(
        "--project-slug",
        default="evals-ui-desktop",
        help="Theta project slug to create or reuse.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Optional max traces to import.",
    )
    parser.add_argument(
        "--shard-count",
        type=int,
        default=1,
        help="Total number of deterministic shards to split the source trace list across.",
    )
    parser.add_argument(
        "--shard-index",
        type=int,
        default=0,
        help="Zero-based shard index to execute when shard-count > 1.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        default=True,
        help="Skip traces already present in Theta. Enabled by default.",
    )
    parser.add_argument(
        "--no-skip-existing",
        dest="skip_existing",
        action="store_false",
        help="Disable existence checks and force re-import.",
    )
    parser.add_argument(
        "--mirror-media",
        action="store_true",
        default=True,
        help="Mirror imported remote media into Theta storage. Enabled by default.",
    )
    parser.add_argument(
        "--no-mirror-media",
        dest="mirror_media",
        action="store_false",
        help="Keep remote media URIs as-is instead of copying them into Theta storage.",
    )
    parser.add_argument(
        "--target-gcs-endpoint",
        default=LOCAL_TARGET_GCS_ENDPOINT,
        help="Target Theta GCS/fake-gcs endpoint used when mirroring media.",
    )
    parser.add_argument(
        "--target-gcs-bucket",
        default=LOCAL_TARGET_GCS_BUCKET,
        help="Target Theta GCS/fake-gcs bucket used when mirroring media.",
    )
    return parser.parse_args()


def load_env_file(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key] = value
    return env


def parse_google_credentials(raw: str) -> dict[str, Any]:
    raw = raw.strip()
    if raw.startswith("{"):
        return json.loads(raw)
    decoded = base64.b64decode(raw).decode("utf-8")
    return json.loads(decoded)


def json_safe(value: Any) -> Any:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.astimezone(UTC).isoformat()
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(v) for v in value]
    return value


def ensure_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def strip_nones(value: Any) -> Any:
    if isinstance(value, dict):
        cleaned: dict[str, Any] = {}
        for key, inner in value.items():
            if inner is None:
                continue
            stripped = strip_nones(inner)
            if stripped is None:
                continue
            cleaned[key] = stripped
        return cleaned
    if isinstance(value, list):
        return [strip_nones(inner) for inner in value if inner is not None]
    return value


def iso_from_any(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.astimezone(UTC).isoformat()
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value), tz=UTC).isoformat()
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return value
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC).isoformat()
    return str(value)


def normalize_id(prefix: str, source_id: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]+", "", source_id or "")
    if len(cleaned) < 8:
        digest = hashlib.sha1((source_id or prefix).encode("utf-8")).hexdigest()[:16]
        cleaned = f"{cleaned}{digest}"
    return f"{prefix}{cleaned}"


def guess_mime(uri: str | None) -> str | None:
    if not uri:
        return None
    mime, _ = mimetypes.guess_type(uri)
    return mime


def data_uri(media_type: str | None, data: str | None, fallback: str) -> str | None:
    if not data:
        return None
    return f"data:{media_type or fallback};base64,{data}"


def parse_gs_uri(uri: str, default_bucket: str) -> tuple[str, str]:
    if uri.startswith("gs://"):
        path = uri[len("gs://") :]
        bucket, _, key = path.partition("/")
        return bucket, key
    return default_bucket, uri.lstrip("/")


def sanitize_filename(name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")
    return cleaned or "attachment"


def extension_for_mime(mime: str | None, default: str = ".bin") -> str:
    if not mime:
        return default
    guessed = mimetypes.guess_extension(mime.split(";", 1)[0].strip())
    if guessed == ".jpe":
        return ".jpg"
    return guessed or default


def attachment_filename(uri: str, mime: str | None, digest: str) -> str:
    if uri.startswith("data:"):
        return f"{digest}{extension_for_mime(mime)}"
    parsed = urlparse(uri)
    name = sanitize_filename(Path(parsed.path).name)
    if not name or "." not in name:
        stem = sanitize_filename(Path(parsed.path).stem or "attachment")
        return f"{digest}-{stem}{extension_for_mime(mime)}"
    return f"{digest}-{name}"


def upload_media_to_theta(endpoint: str, bucket: str, key: str, content: bytes, content_type: str) -> None:
    base = endpoint.rstrip("/")
    base = re.sub(r"/storage/v1/?$", "", base)
    url = f"{base}/upload/storage/v1/b/{bucket}/o?uploadType=media&name={quote(key, safe='')}"
    response = requests.post(
        url,
        headers={"content-type": content_type},
        data=content,
        timeout=120,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"target media upload failed: {response.status_code} {response.text}")


def parse_public_gcs_url(uri: str) -> tuple[str, str] | None:
    parsed = urlparse(uri)
    if parsed.scheme != "https":
        return None
    path = parsed.path.lstrip("/")

    if parsed.netloc == "storage.googleapis.com":
        parts = path.split("/", 1)
        if len(parts) == 2:
            return parts[0], parts[1]

    if path.startswith("download/storage/v1/b/") and "/o/" in path:
        parts = path.split("/")
        bucket = parts[4]
        object_index = parts.index("o") + 1
        if object_index < len(parts):
            return bucket, unquote("/".join(parts[object_index:]))

    return None


def download_media_bytes(
    uri: str,
    *,
    source_storage_client: storage.Client | None = None,
) -> tuple[bytes, str | None]:
    if uri.startswith("data:"):
        header, _, encoded = uri.partition(",")
        mime = header[5:].split(";", 1)[0] or None
        if ";base64" in header:
            return base64.b64decode(encoded), mime
        return encoded.encode("utf-8"), mime

    gcs_ref = parse_public_gcs_url(uri)
    if gcs_ref and source_storage_client is not None:
        bucket, key = gcs_ref
        blob = source_storage_client.bucket(bucket).blob(key)
        content = blob.download_as_bytes(timeout=120)
        return content, blob.content_type or guess_mime(key)

    response = requests.get(uri, timeout=120)
    if response.status_code >= 400:
        raise RuntimeError(f"source media download failed: {response.status_code} {response.text[:200]}")
    mime = response.headers.get("content-type")
    return response.content, mime.split(";", 1)[0].strip() if mime else None


def mirror_uri_to_theta(
    uri: str,
    *,
    mime: str | None,
    org_id: str,
    project_id: str,
    trace_id: str,
    target_gcs_endpoint: str,
    target_gcs_bucket: str,
    cache: dict[str, str],
    source_storage_client: storage.Client | None = None,
) -> str:
    if not uri or uri.startswith("gs://"):
        return uri
    if uri in cache:
        return cache[uri]

    content, detected_mime = download_media_bytes(
        uri,
        source_storage_client=source_storage_client,
    )
    final_mime = mime or detected_mime or guess_mime(uri) or "application/octet-stream"
    digest = hashlib.sha1(uri.encode("utf-8")).hexdigest()[:16]
    filename = attachment_filename(uri, final_mime, digest)
    key = f"orgs/{org_id}/projects/{project_id}/traces/{trace_id}/attachments/{filename}"
    upload_media_to_theta(target_gcs_endpoint, target_gcs_bucket, key, content, final_mime)
    mirrored = f"gs://{target_gcs_bucket}/{key}"
    cache[uri] = mirrored
    return mirrored


def mirror_trace_media(
    payload: dict[str, Any],
    *,
    org_id: str,
    target_gcs_endpoint: str,
    target_gcs_bucket: str,
    source_storage_client: storage.Client | None = None,
) -> dict[str, Any]:
    cache: dict[str, str] = {}
    trace_id = str(payload.get("trace_id") or "")
    project_id = str(payload.get("project_id") or "")

    def rewrite_parts(parts: list[dict[str, Any]]) -> None:
        for part in parts:
            uri = part.get("uri")
            if not uri:
                continue
            part["uri"] = mirror_uri_to_theta(
                str(uri),
                mime=part.get("mime"),
                org_id=org_id,
                project_id=project_id,
                trace_id=trace_id,
                target_gcs_endpoint=target_gcs_endpoint,
                target_gcs_bucket=target_gcs_bucket,
                cache=cache,
                source_storage_client=source_storage_client,
            )

    rewrite_parts(payload.get("attachments") or [])
    for step in payload.get("steps") or []:
        for message in step.get("messages") or []:
            rewrite_parts(message.get("content") or [])
        for event in step.get("events") or []:
            attachment = event.get("attachment")
            if isinstance(attachment, dict):
                rewrite_parts([attachment])
            sensor_frame = event.get("sensor_frame")
            if isinstance(sensor_frame, dict):
                uri = sensor_frame.get("uri")
                if not uri:
                    continue
                sensor_frame["uri"] = mirror_uri_to_theta(
                    str(uri),
                    mime=sensor_frame.get("mime"),
                    org_id=org_id,
                    project_id=project_id,
                    trace_id=trace_id,
                    target_gcs_endpoint=target_gcs_endpoint,
                    target_gcs_bucket=target_gcs_bucket,
                    cache=cache,
                    source_storage_client=source_storage_client,
                )
        rewrite_parts(step.get("attachments") or [])
        for frame in step.get("sensor_frames") or []:
            uri = frame.get("uri")
            if not uri:
                continue
            frame["uri"] = mirror_uri_to_theta(
                str(uri),
                mime=frame.get("mime"),
                org_id=org_id,
                project_id=project_id,
                trace_id=trace_id,
                target_gcs_endpoint=target_gcs_endpoint,
                target_gcs_bucket=target_gcs_bucket,
                cache=cache,
                source_storage_client=source_storage_client,
            )
    return payload


def map_source_platform(source_run_type: str | None, source_platform: str | None) -> str:
    allowed = {"web", "mobile", "desktop", "server", "robot", "sim", "cli", "other"}
    if source_platform in allowed:
        return source_platform
    if source_run_type == "desktop":
        return "desktop"
    return "other"


def map_status(doc: dict[str, Any], raw_trace: dict[str, Any]) -> tuple[str, str | None]:
    success = doc.get("success")
    if success is True:
        return "success", None
    if success is False:
        return "error", str(doc.get("rejection_reason") or doc.get("stop_reason") or "source trace marked unsuccessful")
    if doc.get("status") == "active":
        return "running", None
    metadata = ensure_dict(raw_trace.get("metadata"))
    if metadata.get("error"):
        return "error", str(metadata.get("error"))
    if raw_trace.get("end_time"):
        return "success", None
    return "running", None


def summarize_source_trace_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    metadata = ensure_dict(metadata)
    agent_kwargs = ensure_dict(metadata.get("agent_kwargs"))
    summary = {
        "status": metadata.get("status"),
        "stop_reason": metadata.get("stop_reason"),
        "total_steps": metadata.get("total_steps"),
        "final_url": metadata.get("final_url"),
        "goal": metadata.get("goal"),
        "url": metadata.get("url"),
        "error": metadata.get("error"),
        "success": metadata.get("success"),
        "finished": metadata.get("finished"),
        "step_count": metadata.get("step_count"),
        "agent_class": metadata.get("agent_class"),
        "agent_model": agent_kwargs.get("model"),
        "run_id": metadata.get("run_id"),
        "task_idx": metadata.get("task_idx"),
        "sample_idx": metadata.get("sample_idx"),
    }
    return json_safe(summary)


def map_content_parts(
    content: Any,
    *,
    skip_block_types: set[str] | None = None,
) -> list[dict[str, Any]]:
    skip_block_types = skip_block_types or set()
    if content is None:
        return []
    if isinstance(content, str):
        return [{"type": "text", "text": content}]
    if isinstance(content, list):
        parts: list[dict[str, Any]] = []
        for item in content:
            if isinstance(item, str):
                parts.append({"type": "text", "text": item})
                continue
            if not isinstance(item, dict):
                parts.append({"type": "text", "text": json.dumps(item, ensure_ascii=False)})
                continue
            item_type = item.get("type")
            if item_type in skip_block_types:
                continue
            if item_type in {"text", "input_text"} and item.get("text"):
                parts.append({"type": "text", "text": str(item["text"])})
                continue
            if item_type == "image":
                source = ensure_dict(item.get("source"))
                if source.get("type") == "url" and source.get("url"):
                    url = str(source["url"])
                    parts.append({"type": "image", "uri": url, "mime": source.get("media_type") or guess_mime(url) or "image/jpeg"})
                    continue
                if source.get("type") == "base64":
                    uri = data_uri(source.get("media_type"), source.get("data"), "image/png")
                    if uri:
                        parts.append({"type": "image", "uri": uri, "mime": source.get("media_type") or "image/png"})
                        continue
            if item_type == "image_url":
                image_url = item.get("image_url") or {}
                url = image_url.get("url")
                if url:
                    parts.append({"type": "image", "uri": url, "mime": guess_mime(url) or "image/jpeg"})
                continue
            if item_type == "input_audio":
                audio = item.get("input_audio") or {}
                url = audio.get("url")
                if url:
                    parts.append({"type": "audio", "uri": url, "mime": guess_mime(url) or "audio/mpeg"})
                elif audio.get("transcript"):
                    parts.append({"type": "text", "text": str(audio["transcript"])})
                continue
            if item_type == "audio":
                source = ensure_dict(item.get("source"))
                if source.get("type") == "url" and source.get("url"):
                    url = str(source["url"])
                    parts.append({"type": "audio", "uri": url, "mime": source.get("media_type") or guess_mime(url) or "audio/mpeg"})
                    continue
                if source.get("type") == "base64":
                    uri = data_uri(source.get("media_type"), source.get("data"), "audio/mpeg")
                    if uri:
                        parts.append({"type": "audio", "uri": uri, "mime": source.get("media_type") or "audio/mpeg"})
                        continue
            if item_type == "video_url":
                video = item.get("video_url") or {}
                url = video.get("url")
                if url:
                    parts.append({"type": "video", "uri": url, "mime": guess_mime(url) or "video/mp4"})
                continue
            if item_type == "video":
                source = ensure_dict(item.get("source"))
                if source.get("type") == "url" and source.get("url"):
                    url = str(source["url"])
                    parts.append({"type": "video", "uri": url, "mime": source.get("media_type") or guess_mime(url) or "video/mp4"})
                    continue
                if source.get("type") == "base64":
                    uri = data_uri(source.get("media_type"), source.get("data"), "video/mp4")
                    if uri:
                        parts.append({"type": "video", "uri": uri, "mime": source.get("media_type") or "video/mp4"})
                        continue
            if item_type == "document":
                source = ensure_dict(item.get("source"))
                if source.get("type") == "url" and source.get("url"):
                    url = str(source["url"])
                    parts.append({"type": "file", "uri": url, "mime": source.get("media_type") or guess_mime(url) or "application/octet-stream"})
                    continue
                if source.get("type") == "base64":
                    uri = data_uri(source.get("media_type"), source.get("data"), "application/octet-stream")
                    if uri:
                        parts.append({"type": "file", "uri": uri, "mime": source.get("media_type") or "application/octet-stream"})
                        continue
            parts.append({"type": "text", "text": json.dumps(json_safe(item), ensure_ascii=False)})
        return parts
    if isinstance(content, dict):
        if content.get("type") in skip_block_types:
            return []
        if content.get("text"):
            return [{"type": "text", "text": str(content["text"])}]
        return [{"type": "text", "text": json.dumps(json_safe(content), ensure_ascii=False)}]
    return [{"type": "text", "text": str(content)}]


def extract_tool_use(block: dict[str, Any]) -> dict[str, Any] | None:
    if block.get("type") != "tool_use":
        return None
    return {
        "id": block.get("id") or normalize_id("tc_", json.dumps(block, sort_keys=True)),
        "name": block.get("name") or "tool_call",
        "arguments": json_safe(block.get("input")),
    }


def tool_result_message(block: dict[str, Any]) -> dict[str, Any] | None:
    if block.get("type") != "tool_result":
        return None

    content = map_content_parts(
        block.get("content"),
        skip_block_types={"tool_use", "tool_result"},
    )
    if not content and block.get("content"):
        content = [{"type": "text", "text": json.dumps(json_safe(block.get("content")), ensure_ascii=False)}]
    if not content:
        return None

    message: dict[str, Any] = {
        "role": "tool",
        "content": content,
    }
    if block.get("tool_use_id"):
        message["tool_call_id"] = str(block["tool_use_id"])
    return message


def dedupe_tool_calls(tool_calls: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for call in tool_calls:
        call_id = str(call.get("id") or "")
        if call_id and call_id in seen:
            continue
        if call_id:
            seen.add(call_id)
        deduped.append(call)
    return deduped


def extract_last_generation_messages(trace_json: dict[str, Any]) -> list[dict[str, Any]]:
    observations = trace_json.get("observations") or []
    for obs in reversed(observations):
        if obs.get("type") != "generation":
            continue
        kwargs = ensure_dict(ensure_dict(obs.get("input")).get("kwargs"))
        messages = kwargs.get("messages")
        if isinstance(messages, list):
            return [msg for msg in messages if isinstance(msg, dict)]
    return []


def extract_image_urls_from_content(content: Any) -> list[str]:
    urls: list[str] = []

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            source = ensure_dict(node.get("source"))
            source_url = source.get("url")
            if isinstance(source_url, str) and source_url:
                urls.append(source_url)
            image_url = ensure_dict(node.get("image_url")).get("url")
            if isinstance(image_url, str) and image_url:
                urls.append(image_url)
            uri = node.get("uri")
            if isinstance(uri, str) and uri.startswith(("http://", "https://", "gs://", "data:")):
                urls.append(uri)
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(content)
    deduped: list[str] = []
    seen: set[str] = set()
    for url in urls:
        if url in seen:
            continue
        seen.add(url)
        deduped.append(url)
    return deduped


def extract_actions_by_step_from_messages(messages: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    actions: dict[int, dict[str, Any]] = {}
    assistant_step_counter = 0
    for message in messages:
        if message.get("role") != "assistant":
            continue
        assistant_step_counter += 1
        for block in message.get("content") or []:
            if isinstance(block, dict) and block.get("type") == "tool_use":
                actions[assistant_step_counter] = {
                    "tool": block.get("name"),
                    "args": json_safe(block.get("input") or {}),
                }
                break
    return actions


def extract_step_images(trace_json: dict[str, Any]) -> list[dict[str, Any]]:
    messages = extract_last_generation_messages(trace_json)
    if messages:
        step_images: list[dict[str, Any]] = []
        assistant_step_counter = 0
        actions_by_step = extract_actions_by_step_from_messages(messages)
        for message in messages:
            role = message.get("role")
            if role == "assistant":
                assistant_step_counter += 1
                continue
            if role != "user":
                continue
            image_urls = extract_image_urls_from_content(message.get("content"))
            if not image_urls or assistant_step_counter <= 0:
                continue
            step_images.append(
                {
                    "step_index": assistant_step_counter,
                    "image_url": image_urls[-1],
                    "all_image_urls": image_urls,
                    "action": actions_by_step.get(assistant_step_counter),
                }
            )
        deduped: dict[int, dict[str, Any]] = {}
        for entry in step_images:
            deduped[int(entry["step_index"])] = entry
        return [deduped[index] for index in sorted(deduped)]

    step_images = []
    for obs in trace_json.get("observations") or []:
        if obs.get("type") != "span":
            continue
        metadata = ensure_dict(obs.get("metadata"))
        step_number = metadata.get("step_number")
        image_url = ensure_dict(ensure_dict(obs.get("input")).get("image")).get("source", {}).get("url")
        if not step_number or not image_url:
            continue
        step_images.append(
            {
                "step_index": int(step_number),
                "image_url": image_url,
                "action": json_safe(ensure_dict(obs.get("output")).get("action")),
            }
        )
    return [entry for entry in step_images if entry.get("step_index") is not None]


def extract_generation_messages(obs: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    messages: list[dict[str, Any]] = []
    tool_calls: list[dict[str, Any]] = []

    kwargs = ensure_dict(ensure_dict(obs.get("input")).get("kwargs"))
    input_messages = kwargs.get("messages") or []
    for message in input_messages:
        if not isinstance(message, dict):
            continue
        role = str(message.get("role") or "user")
        raw_content = message.get("content")
        content = map_content_parts(raw_content, skip_block_types={"tool_use", "tool_result"})
        if not content:
            content = []
        if content:
            messages.append({"role": role, "content": content})
        if isinstance(raw_content, list):
            for block in raw_content:
                if not isinstance(block, dict):
                    continue
                result_message = tool_result_message(block)
                if result_message:
                    messages.append(result_message)

    output = ensure_dict(obs.get("output"))
    for choice in output.get("choices") or []:
        if not isinstance(choice, dict):
            continue
        response = choice.get("message") or {}
        if not isinstance(response, dict):
            continue
        role = str(response.get("role") or "assistant")
        content = map_content_parts(response.get("content"), skip_block_types={"tool_use", "tool_result"})
        if content:
            messages.append({"role": role, "content": content})
        if isinstance(response.get("content"), list):
            for block in response["content"]:
                if not isinstance(block, dict):
                    continue
                tool_call = extract_tool_use(block)
                if tool_call:
                    tool_calls.append(tool_call)
        for call in response.get("tool_calls") or []:
            if not isinstance(call, dict):
                continue
            fn = call.get("function") or {}
            tool_calls.append(
                {
                    "id": call.get("id") or normalize_id("tc_", json.dumps(call, sort_keys=True)),
                    "name": fn.get("name") or call.get("name") or "tool_call",
                    "arguments": fn.get("arguments") if fn.get("arguments") is not None else call.get("arguments"),
                }
            )

    if output.get("role") or output.get("type") == "message":
        role = str(output.get("role") or "assistant")
        content = map_content_parts(output.get("content"), skip_block_types={"tool_use", "tool_result"})
        if content:
            messages.append({"role": role, "content": content})
        if isinstance(output.get("content"), list):
            for block in output["content"]:
                if not isinstance(block, dict):
                    continue
                tool_call = extract_tool_use(block)
                if tool_call:
                    tool_calls.append(tool_call)

    return messages, dedupe_tool_calls(tool_calls)


def step_contains_image_uri(step: dict[str, Any], uri: str) -> bool:
    for message in step.get("messages") or []:
        for part in message.get("content") or []:
            if ensure_dict(part).get("uri") == uri:
                return True
    for attachment in step.get("attachments") or []:
        if ensure_dict(attachment).get("uri") == uri:
            return True
    for event in step.get("events") or []:
        attachment = ensure_dict(ensure_dict(event).get("attachment"))
        if attachment.get("uri") == uri:
            return True
    return False


def attach_desktop_step_images(payload: dict[str, Any], raw_trace: dict[str, Any], source_run_type: str) -> dict[str, Any]:
    if source_run_type != "desktop":
        return payload

    steps = payload.get("steps") or []
    generation_steps = [step for step in steps if ensure_dict(step).get("type") == "llm"]
    if not generation_steps:
        return payload

    for entry in extract_step_images(raw_trace):
        step_index = int(entry.get("step_index") or 0)
        if step_index <= 0 or step_index > len(generation_steps):
            continue
        image_url = entry.get("image_url")
        if not image_url or not isinstance(image_url, str):
            continue
        step = generation_steps[step_index - 1]
        if step_contains_image_uri(step, image_url):
            continue
        event_id = normalize_id("ev_", f"{payload.get('trace_id')}-desktop-shot-{step_index}")
        step.setdefault("events", []).append(
            {
                "event_id": event_id,
                "step_id": step.get("step_id"),
                "index": step_index,
                "type": "artifact",
                "name": "desktop_screenshot",
                "status": step.get("status"),
                "attachment": {
                    "type": "image",
                    "uri": image_url,
                    "mime": guess_mime(image_url) or "image/jpeg",
                    "width": 1920,
                    "height": 1080,
                    "metadata": {
                        "theta_desktop": {
                            "step_index": step_index,
                            "action": json_safe(entry.get("action")),
                        }
                    },
                },
                "metadata": {
                    "theta_desktop": {
                        "step_index": step_index,
                        "action": json_safe(entry.get("action")),
                    }
                },
            }
        )
    return payload


def observation_type_to_theta(obs_type: str | None) -> str:
    mapping = {
        "generation": "llm",
        "tool": "tool",
        "retrieval": "retrieval",
        "human": "human",
        "annotation": "annotation",
        "robotics": "robotics",
        "agent": "custom",
    }
    return mapping.get(obs_type or "", "custom")


def step_model(obs: dict[str, Any]) -> str | None:
    metadata = ensure_dict(obs.get("metadata"))
    if metadata.get("model"):
        return str(metadata["model"])
    kwargs = ensure_dict(ensure_dict(obs.get("input")).get("kwargs"))
    if kwargs.get("model"):
        return str(kwargs["model"])
    output = ensure_dict(obs.get("output"))
    if output.get("model"):
        return str(output["model"])
    return None


def step_status(obs: dict[str, Any]) -> str:
    metadata = ensure_dict(obs.get("metadata"))
    if metadata.get("error"):
        return "error"
    if obs.get("end_time") is None:
        return "running"
    return "success"


def build_step(obs: dict[str, Any], index: int) -> dict[str, Any]:
    messages: list[dict[str, Any]] = []
    tool_calls: list[dict[str, Any]] = []
    if obs.get("type") == "generation":
        messages, tool_calls = extract_generation_messages(obs)
    step_metadata = json_safe(ensure_dict(obs.get("metadata")))
    if obs.get("type") not in {"generation"} and obs.get("input") is not None:
        step_metadata["source_input"] = json_safe(obs.get("input"))
    if obs.get("type") not in {"generation"} and obs.get("output") is not None:
        step_metadata["source_output"] = json_safe(obs.get("output"))

    step: dict[str, Any] = {
        "step_id": normalize_id("st_", str(obs.get("id") or f"obs-{index}")),
        "index": index,
        "type": observation_type_to_theta(obs.get("type")),
        "name": obs.get("name") or obs.get("type") or f"step-{index}",
        "status": step_status(obs),
        "started_at": iso_from_any(obs.get("start_time")),
        "ended_at": iso_from_any(obs.get("end_time")),
        "latency_ms": int(obs.get("duration_ms") or 0),
        "metadata": step_metadata,
    }
    if obs.get("parent_id"):
        step["parent_step_id"] = normalize_id("st_", str(obs["parent_id"]))
    model = step_model(obs)
    if model:
        step["model"] = model
    usage = ensure_dict(ensure_dict(obs.get("metadata")).get("usage")) or ensure_dict(ensure_dict(obs.get("output")).get("usage"))
    if usage:
        step["token_usage"] = {
            "input": int(usage.get("prompt_tokens") or usage.get("input_tokens") or 0),
            "output": int(usage.get("completion_tokens") or usage.get("output_tokens") or 0),
            "total": int(usage.get("total_tokens") or 0),
        }
    if messages:
        step["messages"] = messages
    if tool_calls:
        step["tool_calls"] = tool_calls
    return step


def build_trace_payload(
    doc_id: str,
    doc_data: dict[str, Any],
    raw_trace: dict[str, Any],
    project_id: str,
    source_run_type: str,
) -> dict[str, Any]:
    theta_trace_id = normalize_id("tr_", doc_id)
    source_metadata = ensure_dict(raw_trace.get("metadata"))
    run_id = doc_data.get("run_id") or source_metadata.get("run_id") or raw_trace.get("session_id") or doc_id
    status, error_message = map_status(doc_data, raw_trace)
    top_level_tokens = {
        "input": int(doc_data.get("input_tokens") or 0),
        "output": int(doc_data.get("output_tokens") or 0),
        "total": int(doc_data.get("total_tokens") or 0),
    }
    if not any(top_level_tokens.values()):
        for obs in raw_trace.get("observations") or []:
            usage = ensure_dict(ensure_dict(obs.get("metadata")).get("usage")) or ensure_dict(ensure_dict(obs.get("output")).get("usage"))
            top_level_tokens["input"] += int(usage.get("prompt_tokens") or usage.get("input_tokens") or 0)
            top_level_tokens["output"] += int(usage.get("completion_tokens") or usage.get("output_tokens") or 0)
            top_level_tokens["total"] += int(usage.get("total_tokens") or 0)

    observations = raw_trace.get("observations") or []
    steps = [build_step(obs, index) for index, obs in enumerate(observations)]

    payload: dict[str, Any] = {
        "schema_version": "1.0",
        "trace_id": theta_trace_id,
        "project_id": project_id,
        "name": doc_data.get("name") or raw_trace.get("name") or doc_id,
        "run_id": str(run_id),
        "run_type": "backfill",
        "platform": map_source_platform(source_run_type, doc_data.get("platform") or source_metadata.get("platform")),
        "model": doc_data.get("model") or source_metadata.get("model") or None,
        "status": status,
        "started_at": iso_from_any(raw_trace.get("start_time") or raw_trace.get("created_at") or doc_data.get("created_at")) or datetime.now(tz=UTC).isoformat(),
        "steps": steps,
        "metadata": {
            "source": {
                "system": "evals-ui",
                "firestore_trace_id": doc_id,
                "gcs_path": doc_data.get("gcs_path"),
                "folder_name": doc_data.get("folder_name"),
                "run_type": doc_data.get("run_type"),
                "platform": doc_data.get("platform"),
                "status": doc_data.get("status"),
                "imported_at": datetime.now(tz=UTC).isoformat(),
            },
            "source_index": json_safe(
                {
                    "session_id": doc_data.get("session_id"),
                    "name": doc_data.get("name"),
                    "success": doc_data.get("success"),
                    "stop_reason": doc_data.get("stop_reason"),
                    "observation_count": doc_data.get("observation_count"),
                    "generation_count": doc_data.get("generation_count"),
                    "total_steps": doc_data.get("total_steps"),
                    "duration_ms": doc_data.get("duration_ms"),
                    "session_duration_ms": doc_data.get("session_duration_ms"),
                    "agent_duration_ms": doc_data.get("agent_duration_ms"),
                    "model": doc_data.get("model"),
                    "total_tokens": doc_data.get("total_tokens"),
                    "input_tokens": doc_data.get("input_tokens"),
                    "output_tokens": doc_data.get("output_tokens"),
                    "cached_tokens": doc_data.get("cached_tokens"),
                    "user_id": doc_data.get("user_id"),
                    "agent_name": doc_data.get("agent_name"),
                    "environment": doc_data.get("environment"),
                    "eval_name": doc_data.get("eval_name"),
                    "run_id": doc_data.get("run_id"),
                    "platform": doc_data.get("platform"),
                    "run_type": doc_data.get("run_type"),
                    "query_category": doc_data.get("query_category"),
                    "user_query": doc_data.get("user_query"),
                    "created_at": doc_data.get("created_at"),
                    "updated_at": doc_data.get("updated_at"),
                }
            ),
            "source_trace_metadata": summarize_source_trace_metadata(source_metadata),
        },
    }
    if error_message:
        payload["error_message"] = error_message
    if doc_data.get("user_id"):
        payload["user_id"] = str(doc_data["user_id"])
    if doc_data.get("query_category") or doc_data.get("eval_name"):
        payload["use_case"] = str(doc_data.get("query_category") or doc_data.get("eval_name"))
    if any(top_level_tokens.values()):
        payload["token_usage"] = top_level_tokens
    latency_ms = int(raw_trace.get("duration_ms") or doc_data.get("duration_ms") or 0)
    if latency_ms > 0:
        payload["latency_ms"] = latency_ms
    ended_at = iso_from_any(raw_trace.get("end_time"))
    if ended_at:
        payload["ended_at"] = ended_at
    tags = ["evals-ui", "imported", source_run_type]
    extra_tags = doc_data.get("tags") or []
    payload["tags"] = sorted({*(str(tag) for tag in tags), *(str(tag) for tag in extra_tags)})
    payload = attach_desktop_step_images(payload, raw_trace, source_run_type)
    return strip_nones(payload)


def resolve_theta_context(db_url: str, org_slug: str) -> ThetaContext:
    query = """
        SELECT o.id, o.slug, u.id, u.email
        FROM orgs o
        JOIN org_members m ON m.org_id = o.id
        JOIN users u ON u.id = m.user_id
        WHERE o.slug = %s AND m.role IN ('owner', 'admin')
        ORDER BY m.role = 'owner' DESC, u.created_at ASC
        LIMIT 1
    """
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(query, (org_slug,))
            row = cur.fetchone()
    if row is None:
        raise RuntimeError(f"could not resolve an owner/admin user for org slug '{org_slug}'")
    return ThetaContext(org_id=row[0], org_slug=row[1], user_id=row[2], user_email=row[3])


def mint_dashboard_jwt(secret: str, ctx: ThetaContext) -> str:
    now = int(datetime.now(tz=UTC).timestamp())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": ctx.user_id,
        "email": ctx.user_email,
        "orgs": [ctx.org_id],
        "iat": now,
        "exp": now + 3600,
    }
    signing_input = ".".join(
        [
            _jwt_b64url(json.dumps(header, separators=(",", ":")).encode()),
            _jwt_b64url(json.dumps(payload, separators=(",", ":")).encode()),
        ]
    )
    signature = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{_jwt_b64url(signature)}"


def _jwt_b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def theta_session(base_url: str, token: str) -> requests.Session:
    session = requests.Session()
    session.headers.update({"authorization": f"Bearer {token}", "content-type": "application/json"})
    session.base_url = base_url.rstrip("/")  # type: ignore[attr-defined]
    return session


def theta_request(session: requests.Session, method: str, path: str, **kwargs: Any) -> requests.Response:
    url = f"{session.base_url}{path}"  # type: ignore[attr-defined]
    response = session.request(method, url, timeout=60, **kwargs)
    if response.status_code >= 400:
        raise RuntimeError(f"{method} {path} failed: {response.status_code} {response.text}")
    return response


def ensure_project(session: requests.Session, ctx: ThetaContext, project_name: str, project_slug: str) -> dict[str, Any]:
    existing = theta_request(session, "GET", f"/v1/projects?org_id={ctx.org_id}").json()["items"]
    for project in existing:
        if project.get("slug") == project_slug or project.get("name") == project_name:
            return project
    payload = {
        "org_id": ctx.org_id,
        "name": project_name,
        "slug": project_slug,
        "description": "Imported from evals-ui Firestore/GCS desktop traces.",
    }
    return theta_request(session, "POST", "/v1/projects", json=payload).json()


def create_api_key(session: requests.Session, project_id: str) -> str:
    key_name = f"evals-ui-import-{datetime.now(tz=UTC).strftime('%Y%m%d-%H%M%S')}"
    payload = {"name": key_name}
    response = theta_request(session, "POST", f"/v1/projects/{project_id}/keys", json=payload).json()
    secret = response.get("secret") or response.get("plaintext")
    if not secret:
        raise RuntimeError("key creation succeeded but no plaintext secret was returned")
    return secret


def trace_exists(session: requests.Session, trace_id: str) -> bool:
    response = session.get(f"{session.base_url}/v1/traces/{trace_id}", timeout=30)  # type: ignore[attr-defined]
    if response.status_code == 404:
        return False
    if response.status_code >= 400:
        raise RuntimeError(f"GET /v1/traces/{trace_id} failed: {response.status_code} {response.text}")
    return True


def wait_for_trace(session: requests.Session, trace_id: str, timeout_seconds: int = 20) -> bool:
    deadline = datetime.now(tz=UTC).timestamp() + timeout_seconds
    while datetime.now(tz=UTC).timestamp() < deadline:
        if trace_exists(session, trace_id):
            return True
        import time

        time.sleep(1)
    return False


def iter_source_docs(db: firestore.Client, run_type: str) -> Iterable[tuple[str, dict[str, Any]]]:
    query = db.collection("traces").where(filter=FieldFilter("run_type", "==", run_type))
    for snap in query.stream():
        yield snap.id, snap.to_dict() or {}


def ingest_trace(base_url: str, api_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = requests.post(
        f"{base_url.rstrip('/')}/v1/traces",
        headers={"x-api-key": api_key, "content-type": "application/json"},
        json=payload,
        timeout=120,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"POST /v1/traces failed: {response.status_code} {response.text}")
    return response.json()


def fetch_source_trace(storage_client: storage.Client, default_bucket: str, gcs_uri: str) -> dict[str, Any]:
    bucket_name, key = parse_gs_uri(gcs_uri, default_bucket)
    blob = storage_client.bucket(bucket_name).blob(key)
    content = blob.download_as_bytes(timeout=60)
    return json.loads(content.decode("utf-8"))


def main() -> None:
    missing: list[str] = []
    if psycopg is None:
        missing.append("psycopg")
    if requests is None:
        missing.append("requests")
    if firestore is None or storage is None or service_account is None:
        missing.extend(["google-cloud-firestore", "google-cloud-storage"])
    if missing:
        joined = ", ".join(dict.fromkeys(missing))
        raise SystemExit(f"Missing required import dependencies: {joined}")

    args = parse_args()
    source_env_path = Path(args.source_env)
    if not source_env_path.exists():
        raise SystemExit(f"source env file not found: {source_env_path}")

    source_env = load_env_file(source_env_path)
    raw_creds = (
        source_env.get("GOOGLE_SERVICE_ACCOUNT_JSON")
        or source_env.get("GCP_KEY_BASE64")
        or source_env.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    )
    if not raw_creds:
        raise SystemExit("source env file does not contain Google service account credentials")

    credentials = parse_google_credentials(raw_creds)
    source_project = (
        source_env.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
        or source_env.get("GCP_PROJECT_ID")
        or credentials.get("project_id")
    )
    source_bucket = source_env.get("GCS_BUCKET_NAME") or source_env.get("GCS_BUCKET") or "agi-inc-generations"
    if not source_project:
        raise SystemExit("could not resolve source Firebase/GCP project id")

    log(f"Resolving Theta org '{args.org_slug}'...")
    theta_ctx = resolve_theta_context(args.theta_db_url, args.org_slug)
    token = mint_dashboard_jwt(args.theta_jwt_secret, theta_ctx)
    theta = theta_session(args.theta_base_url, token)
    project = ensure_project(theta, theta_ctx, args.project_name, args.project_slug)
    api_key = args.theta_api_key or create_api_key(theta, project["id"])
    log(f"Using Theta project {project['name']} ({project['id']})")

    google_credentials = service_account.Credentials.from_service_account_info(credentials)
    firestore_db = firestore.Client(project=source_project, credentials=google_credentials, database="(default)")
    storage_client = storage.Client(project=source_project, credentials=google_credentials)

    docs = list(iter_source_docs(firestore_db, args.run_type))
    if args.limit > 0:
        docs = docs[: args.limit]
    if args.shard_count < 1:
        raise SystemExit("--shard-count must be >= 1")
    if args.shard_index < 0 or args.shard_index >= args.shard_count:
        raise SystemExit("--shard-index must be between 0 and shard-count - 1")
    if args.shard_count > 1:
        docs = [doc for idx, doc in enumerate(docs) if idx % args.shard_count == args.shard_index]
    log(
        f"Found {len(docs)} source traces for run_type={args.run_type}"
        + (
            f" on shard {args.shard_index + 1}/{args.shard_count}"
            if args.shard_count > 1
            else ""
        )
    )

    imported = 0
    skipped = 0
    failed = 0
    last_trace_id = None

    for index, (doc_id, doc_data) in enumerate(docs, start=1):
        theta_trace_id = normalize_id("tr_", doc_id)
        last_trace_id = theta_trace_id
        try:
            if args.skip_existing and trace_exists(theta, theta_trace_id):
                skipped += 1
                log(f"[{index}/{len(docs)}] skip {doc_id} -> {theta_trace_id} (already present)")
                continue
            gcs_path = doc_data.get("gcs_path")
            if not gcs_path:
                failed += 1
                log(f"[{index}/{len(docs)}] fail {doc_id}: missing gcs_path")
                continue
            raw_trace = fetch_source_trace(storage_client, source_bucket, str(gcs_path))
            payload = build_trace_payload(doc_id, doc_data, raw_trace, project["id"], args.run_type)
            if args.mirror_media:
                payload = mirror_trace_media(
                    payload,
                    org_id=theta_ctx.org_id,
                    target_gcs_endpoint=args.target_gcs_endpoint,
                    target_gcs_bucket=args.target_gcs_bucket,
                    source_storage_client=storage_client,
                )
            ingest_trace(args.theta_base_url, api_key, payload)
            imported += 1
            log(f"[{index}/{len(docs)}] imported {doc_id} -> {theta_trace_id}")
        except Exception as exc:  # noqa: BLE001
            failed += 1
            log(f"[{index}/{len(docs)}] fail {doc_id}: {exc}")

    visible = wait_for_trace(theta, last_trace_id, timeout_seconds=30) if last_trace_id else False
    verify = theta.get(f"{theta.base_url}/v1/traces", params={"project_id": project["id"], "limit": 1000}, timeout=60)  # type: ignore[attr-defined]
    if verify.status_code >= 400:
        raise RuntimeError(f"verification list failed: {verify.status_code} {verify.text}")
    items = verify.json().get("items", [])

    log("")
    log("Import summary")
    log(f"  org:      {theta_ctx.org_slug} ({theta_ctx.org_id})")
    log(f"  project:  {project['name']} ({project['id']})")
    log(f"  imported: {imported}")
    log(f"  skipped:  {skipped}")
    log(f"  failed:   {failed}")
    log(f"  theta list count: {len(items)}")
    if last_trace_id:
        log(f"  last trace visible: {visible}")
    log(f"  dashboard project slug: /{theta_ctx.org_slug}/{project['slug']}/traces")


if __name__ == "__main__":
    main()
