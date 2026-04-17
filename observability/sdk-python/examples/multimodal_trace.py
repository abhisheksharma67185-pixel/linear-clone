"""End-to-end multimodal example.

Emits a 3-step trace:
  1. llm step — user sends a PNG screenshot + text; assistant replies + tokens.
  2. tool step — a mocked browser click with arguments + result.
  3. robotics step — a short mp4 attached as a camera sensor frame.

Run:
    export THETA_API_KEY=... THETA_PROJECT=proj_abc
    python examples/multimodal_trace.py
"""

from __future__ import annotations

import os
from pathlib import Path

from theta_observability import TraceClient


def _ensure_png(path: Path) -> Path:
    if not path.exists():
        # 1x1 PNG
        path.write_bytes(
            bytes.fromhex(
                "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
                "890000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082"
            )
        )
    return path


def _ensure_mp4(path: Path) -> Path:
    if not path.exists():
        # Minimal fake mp4 box — real files should be used in production.
        path.write_bytes(b"\x00\x00\x00\x14ftypisom\x00\x00\x02\x00isomiso2")
    return path


def main() -> None:
    assets = Path(__file__).parent / "assets"
    assets.mkdir(exist_ok=True)
    png = _ensure_png(assets / "screen.png")
    mp4 = _ensure_mp4(assets / "rgb.mp4")

    with TraceClient() as client:
        with client.trace(
            name="checkout-agent",
            run_type="eval",
            use_case="web-shopping",
            platform="web",
            tags=["demo", "multimodal"],
            metadata={"git_sha": os.environ.get("GIT_SHA", "local")},
        ) as t:
            # 1. LLM step with PNG image
            with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
                s.log_message(role="user", text="Buy milk", images=[png])
                s.log_message(role="assistant", text="I'll click the Buy button.")
                s.set_token_usage(input=1820, output=412)

            # 2. Tool step
            with t.step(name="click", type="tool") as s:
                s.log_tool_call(
                    name="browser.click",
                    arguments={"selector": "#buy"},
                    result={"ok": True},
                    latency_ms=45,
                )

            # 3. Robotics step with mp4 camera frame
            with t.step(name="capture", type="robotics") as s:
                s.log_sensor_frame(modality="camera", source=mp4, fps=30.0)

            t.annotate(label="good", score=1.0, comment="demo run")
            t.set_cost(0.0133)


if __name__ == "__main__":
    main()
