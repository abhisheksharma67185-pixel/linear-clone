"""Media upload helpers.

Given a local path / bytes / file-like / PIL image, request a signed URL from
the Theta API and PUT the blob to GCS, returning the resulting ``gs://`` uri.
"""

from __future__ import annotations

import io
import mimetypes
import os
from pathlib import Path
from typing import TYPE_CHECKING, Any, Optional, Tuple, Union

import httpx

from .errors import ThetaMediaUploadError
from .types import SignedUrlResponse

if TYPE_CHECKING:  # pragma: no cover
    from .client import TraceClient

MediaInput = Union[str, Path, bytes, io.IOBase, Any]


def _pil_to_bytes(img: Any) -> Tuple[bytes, str]:
    buf = io.BytesIO()
    fmt = (getattr(img, "format", None) or "PNG").upper()
    img.save(buf, format=fmt)
    mime = f"image/{fmt.lower()}"
    return buf.getvalue(), mime


def resolve_media(source: MediaInput, mime: Optional[str] = None) -> Tuple[bytes, str, Optional[str]]:
    """Normalize ``source`` to ``(data, mime, filename)``.

    Accepts ``str | Path | bytes | BufferedReader | PIL.Image.Image``.
    """
    # PIL image (duck-typed to avoid a hard dep)
    if hasattr(source, "save") and hasattr(source, "size") and not isinstance(source, (str, bytes, Path)):
        data, default_mime = _pil_to_bytes(source)
        return data, mime or default_mime, None

    if isinstance(source, (str, Path)):
        path = Path(source)
        data = path.read_bytes()
        detected = mime or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        return data, detected, path.name

    if isinstance(source, bytes):
        return source, mime or "application/octet-stream", None

    if isinstance(source, io.IOBase):
        data = source.read()
        if isinstance(data, str):
            data = data.encode()
        name = getattr(source, "name", None)
        filename = os.path.basename(name) if isinstance(name, str) else None
        detected = mime or (mimetypes.guess_type(filename)[0] if filename else None) or "application/octet-stream"
        return data, detected, filename

    raise TypeError(f"Unsupported media source: {type(source)!r}")


def upload_media(
    client: "TraceClient",
    source: MediaInput,
    mime: Optional[str] = None,
    trace_id: Optional[str] = None,
) -> Tuple[str, str, int]:
    """Upload ``source`` via the proxy endpoint. Returns ``(gs_uri, mime, size_bytes)``."""
    data, resolved_mime, filename = resolve_media(source, mime)
    size = len(data)

    # Default path: stream bytes through the ingest API's proxy upload endpoint.
    # Works in all environments (prod GCS, fake-gcs, self-hosted).
    try:
        params: dict[str, str] = {}
        if trace_id:
            params["trace_id"] = trace_id
        if filename:
            params["name"] = filename
        resp = client._http.post(
            "/v1/media/upload",
            params=params,
            content=data,
            headers={"Content-Type": resolved_mime},
            timeout=client.timeout,
        )
        if resp.status_code >= 300:
            raise ThetaMediaUploadError(
                f"Upload failed: {resp.status_code} {resp.text[:200]}",
                status_code=resp.status_code,
            )
        body = resp.json()
        return body.get("gs_uri", ""), resolved_mime, size
    except httpx.HTTPError as exc:
        raise ThetaMediaUploadError(f"Network error during media upload: {exc}") from exc


__all__ = ["MediaInput", "resolve_media", "upload_media"]
