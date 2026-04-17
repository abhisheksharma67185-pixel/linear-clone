"""Generate tiny fixture files for every modality: image, audio, video, sensor, file."""
from __future__ import annotations

import os
import struct
import wave
import zlib
import json
import random
from pathlib import Path

OUT = Path(__file__).parent / "fixtures"
OUT.mkdir(exist_ok=True)


def png(path: Path, w: int, h: int, color=(255, 140, 60)) -> None:
    raw = b""
    for _ in range(h):
        raw += b"\x00" + bytes(color) * w
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    idat = zlib.compress(raw)
    path.write_bytes(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b""))


def wav(path: Path, seconds: float = 0.5, freq: float = 440.0, rate: int = 16000) -> None:
    import math
    nframes = int(rate * seconds)
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        for i in range(nframes):
            sample = int(32767 * 0.3 * math.sin(2 * math.pi * freq * (i / rate)))
            f.writeframesraw(struct.pack("<h", sample))


def mp4(path: Path) -> None:
    # Minimal valid MP4 box structure (empty but parseable as video/mp4).
    ftyp = b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2avc1mp41"
    moov = b"\x00\x00\x00\x08moov"
    path.write_bytes(ftyp + moov)


def sensor_parquet_like(path: Path) -> None:
    # Pretend a tiny binary sensor stream. Header + 128 random joint states.
    buf = b"JOINTv1\x00"
    for _ in range(128):
        for _ in range(7):
            buf += struct.pack("<f", random.uniform(-3.14, 3.14))
    path.write_bytes(buf)


def tool_output_json(path: Path) -> None:
    path.write_text(json.dumps({
        "tool": "web.search",
        "query": "sunset photography tips",
        "results": [
            {"title": "Golden hour basics", "url": "https://example.com/a"},
            {"title": "Color temperature 101", "url": "https://example.com/b"},
        ],
    }, indent=2))


def main() -> None:
    random.seed(0)
    png(OUT / "scene.png", 48, 48, (220, 80, 80))
    wav(OUT / "voice.wav", seconds=0.4, freq=550)
    mp4(OUT / "clip.mp4")
    sensor_parquet_like(OUT / "joint_states.bin")
    tool_output_json(OUT / "tool_output.json")
    print("wrote:", os.listdir(OUT))


if __name__ == "__main__":
    main()
