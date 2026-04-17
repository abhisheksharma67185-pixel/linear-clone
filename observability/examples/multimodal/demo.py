"""Full multimodal demo: emits traces that cover every attachment type.

Modalities exercised:
  - text (messages)
  - image (PNG attached at trace + message level)
  - audio (WAV attached)
  - video (MP4 attached)
  - sensor (joint-state binary attached, modality="joint_state")
  - file (JSON tool output attached)

Run:
    # 1. make fixtures once
    python observability/examples/multimodal/make_fixtures.py
    # 2. run
    THETA_API_KEY=tk_... THETA_PROJECT=proj_... \
    THETA_BASE_URL=http://localhost:8080 \
    python observability/examples/multimodal/demo.py
"""

from __future__ import annotations

import os
import time
from pathlib import Path

from theta_observability import TraceClient

HERE = Path(__file__).parent
FIX = HERE / "fixtures"


def all_modalities_trace(obs: TraceClient) -> None:
    with obs.trace(
        name="multimodal-omni",
        run_type="prod",
        use_case="demo",
        metadata={"demo": "every-modality"},
        tags=["multimodal", "image", "audio", "video", "sensor", "file"],
    ) as t:
        t.set_user("charlie@example.com")
        t.set_metadata(platform="web", model="claude-opus-4-5")

        # Trace-level attachments (one per modality).
        img_uri = t.attach_image(FIX / "scene.png", mime="image/png")
        aud_uri = t.attach_audio(FIX / "voice.wav", mime="audio/wav")
        vid_uri = t.attach_video(FIX / "clip.mp4", mime="video/mp4")
        sen_uri = t.attach_sensor(FIX / "joint_states.bin", modality="joint_state")
        fil_uri = t.attach_file(FIX / "tool_output.json", mime="application/json")

        with t.step(name="perceive scene", type="llm", model="claude-opus-4-5") as s:
            s.log_message(
                role="user",
                text="What do you see, hear, and feel in this scene?",
                images=[(FIX / "scene.png").read_bytes()],
                audio=[(FIX / "voice.wav").read_bytes()],
            )
            s.log_message(
                role="assistant",
                text=(
                    "I can see a warm red hue, hear a short 440 Hz tone, and "
                    "the joint state sensor suggests the arm is mid-reach."
                ),
            )
            s.set_token_usage(input=220, output=60)
            s.set_metadata(
                image_uri=img_uri,
                audio_uri=aud_uri,
                video_uri=vid_uri,
                sensor_uri=sen_uri,
                tool_output_uri=fil_uri,
            )

        with t.step(name="plan action", type="custom") as s:
            s.log_tool_call(
                name="planner.rrt",
                arguments={"goal": [0.5, 0.2, 0.3]},
                result={"steps": 17},
                latency_ms=120,
            )

        with t.step(name="execute robotics", type="robotics") as s:
            s.log_sensor_frame(
                modality="joint_state",
                source=FIX / "joint_states.bin",
                mime="application/octet-stream",
                duration_ms=1200,
            )
            s.log_sensor_frame(
                modality="camera",
                source=FIX / "clip.mp4",
                mime="video/mp4",
                fps=30,
            )
            s.log_tool_call(
                name="arm.execute",
                arguments={"trajectory_id": "rrt_17"},
                result={"success": True},
                latency_ms=1200,
            )

        with t.step(name="post-flight", type="annotation") as s:
            s.log_message(role="system", text="Operator reviewed recording, all good.")

        t.annotate(
            label="multimodal_complete",
            score=1.0,
            comment="Image + audio + video + sensor + file all uploaded",
            user="demo@theta.dev",
        )


def main() -> None:
    if not FIX.exists() or not any(FIX.iterdir()):
        raise SystemExit(
            f"Fixtures missing. Run: python {HERE/'make_fixtures.py'} first."
        )
    obs = TraceClient(
        api_key=os.environ["THETA_API_KEY"],
        project=os.environ["THETA_PROJECT"],
        base_url=os.environ.get("THETA_BASE_URL", "http://localhost:8080"),
    )
    t0 = time.time()
    all_modalities_trace(obs)
    obs.flush(timeout=30)
    print(f"done in {time.time()-t0:.2f}s.")


if __name__ == "__main__":
    main()
