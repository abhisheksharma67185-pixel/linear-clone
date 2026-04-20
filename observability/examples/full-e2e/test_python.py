"""Deterministic end-to-end validation for the published Python SDK surface.

This script uses only the Theta SDK API against a running Theta stack:
- creates long-form conversation traces
- uploads every modality
- records metrics
- filters traces by metadata
- fetches full trace detail
- validates an error trace

Run:
    PYTHONPATH=sdk-python/src \
    THETA_API_KEY=tk_... THETA_PROJECT=proj_... THETA_BASE_URL=http://localhost:8080 \
    python examples/full-e2e/test_python.py
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path

from theta_observability import TraceClient


HERE = Path(__file__).parent
FIXTURES = HERE.parent / "multimodal" / "fixtures"
BASE_URL = os.environ.get("THETA_BASE_URL", "http://localhost:8080")
API_KEY = os.environ.get("THETA_API_KEY", "")
PROJECT = os.environ.get("THETA_PROJECT", "")


def read_fixture(name: str) -> bytes:
    return (FIXTURES / name).read_bytes()


def long_text(prefix: str, repeat: int = 6) -> str:
    return "\n\n".join(
        f"{prefix} paragraph {index + 1}: the customer is reviewing multimodal evidence, comparing refunds, shipping, voice instructions, and robotic inspection data before approving the final action."
        for index in range(repeat)
    )


def wait_for_trace(client: TraceClient, trace_id: str, timeout_s: float = 20.0):
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        detail = client.get_trace(trace_id)
        if detail is not None and detail.trace is not None:
            return detail
        time.sleep(0.5)
    raise TimeoutError(f"Timed out waiting for trace {trace_id}")


def wait_for_trace_in_list(client: TraceClient, run_tag: str, trace_id: str, status: str | None = None):
    deadline = time.time() + 20.0
    while time.time() < deadline:
        result = client.list_traces(
            status=status,
            metadata_filters=[{"key": "e2e.run_id", "value": run_tag}],
            limit=20,
        )
        if any(item.trace_id == trace_id for item in result.data):
            return result
        time.sleep(0.5)
    raise TimeoutError(f"Timed out waiting for filtered trace {trace_id}")


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def emit_conversation_trace(client: TraceClient, run_tag: str) -> str:
    scene = read_fixture("scene.png")
    voice = read_fixture("voice.wav")
    clip = read_fixture("clip.mp4")
    joints = read_fixture("joint_states.bin")
    tool_output = read_fixture("tool_output.json")

    with client.trace(
        name="python-sdk-e2e-conversation",
        run_type="eval",
        use_case="sdk-e2e-validation",
        platform="server",
        model="theta-sim-1",
        user_id="python-sdk-e2e@example.com",
        tags=["sdk-e2e", "python", "multimodal", "long-chat"],
        metadata={"suite": "sdk-python", "scenario": "conversation"},
    ) as trace:
        trace_id = trace.model.trace_id
        trace.set_metadata_path("e2e.run_id", run_tag)
        trace.set_metadata_path("tenant.org_slug", "theta-demo")
        trace.set_metadata_path("customer.segment", "enterprise")
        trace.set_metadata_path("conversation.length_bucket", "long")

        trace_attachment_uri = trace.attach_file(tool_output, mime="application/json")
        assert_true(trace_attachment_uri.startswith("gs://"), "trace-level attachment upload failed")

        with trace.step(name="customer-conversation", type="llm", model="theta-sim-1") as step:
            step.attach_image(scene, mime="image/png")
            step.attach_audio(voice, mime="audio/wav")
            step.attach_video(clip, mime="video/mp4")
            step.attach_file(tool_output, mime="application/json")

            step.log_message(role="system", text=long_text("System guardrail"))
            step.log_message(
                role="user",
                text=long_text("User request"),
                images=[scene],
                audio=[voice],
                video=[clip],
                attachments=[tool_output],
            )
            step.log_message(role="assistant", text=long_text("Assistant response"))
            step.set_token_usage(input=3200, output=980)
            step.set_metadata_path("conversation.turn_count", 8)
            step.set_metadata_path("conversation.channel", "support-escalation")

        with trace.step(name="planner", type="tool") as step:
            step.attach_file(tool_output, mime="application/json")
            step.log_tool_call(
                name="retrieval.search",
                arguments={"query": "refund policy for damaged multimodal order"},
                result={
                    "sources": ["policy/refunds", "policy/media-evidence"],
                    "decision": "eligible_with_manual_review",
                },
            )
            step.set_metadata_path("planner.strategy", "grounded")

        with trace.step(name="robot-inspection", type="robotics") as step:
            step.attach_sensor(joints, modality="joint_state", mime="application/octet-stream")
            step.log_sensor_frame(
                modality="joint_state",
                source=joints,
                mime="application/octet-stream",
                duration_ms=1500,
                metadata={"sample_count": 64},
            )
            step.log_sensor_frame(
                modality="camera",
                source=clip,
                mime="video/mp4",
                fps=30,
                duration_ms=1000,
                metadata={"lens": "front"},
            )
            step.log_message(
                role="assistant",
                text="Robot inspection complete. Camera and joint-state recordings were attached for audit.",
            )

    return trace_id


def emit_error_trace(client: TraceClient, run_tag: str) -> str:
    trace_id = ""
    try:
        with client.trace(
            name="python-sdk-e2e-error",
            run_type="eval",
            tags=["sdk-e2e", "python", "error"],
            metadata={"suite": "sdk-python", "scenario": "error"},
        ) as trace:
            trace_id = trace.model.trace_id
            trace.set_metadata_path("e2e.run_id", run_tag)
            with trace.step(name="fail-fast", type="tool"):
                raise RuntimeError("Simulated python SDK E2E failure")
    except RuntimeError:
        pass
    return trace_id


def main() -> None:
    if not API_KEY or not PROJECT:
        raise SystemExit("THETA_API_KEY and THETA_PROJECT are required")
    client = TraceClient(
        api_key=API_KEY,
        project=PROJECT,
        base_url=BASE_URL,
        flush_interval=0.1,
        max_batch=1,
    )
    run_tag = f"python-{int(time.time() * 1000)}"
    metric_name = f"sdk_e2e_python_quality_{run_tag.replace('-', '_')}"

    client.create_metric(
        metric_name,
        "observed",
        description="Python SDK deterministic E2E validation metric",
    )

    success_trace_id = emit_conversation_trace(client, run_tag)
    error_trace_id = emit_error_trace(client, run_tag)

    assert_true(client.flush(timeout=10.0), "flush timed out")

    client.record_metric(
        metric_name,
        success_trace_id,
        passed=True,
        label="validated",
    )

    listed = wait_for_trace_in_list(client, run_tag, success_trace_id, status="success")
    success_detail = wait_for_trace(client, success_trace_id)
    error_detail = wait_for_trace(client, error_trace_id)

    assert_true(len(success_detail.trace.attachments) == 1, "missing trace-level attachment")

    conversation_step = next(
        step for step in success_detail.trace.steps if step.name == "customer-conversation"
    )
    assert_true(len(conversation_step.messages) == 3, "conversation step should contain three messages")
    assert_true(
        [part.type for part in conversation_step.messages[1].content] == ["text", "image", "audio", "video", "file"],
        "inline multimodal message content did not persist correctly",
    )
    assert_true(len(conversation_step.attachments) == 4, "step-level media attachments did not persist")
    assert_true(
        len(conversation_step.messages[2].content[0].text or "") > 300,
        "assistant message was not persisted as a long-form response",
    )

    robot_step = next(step for step in success_detail.trace.steps if step.name == "robot-inspection")
    assert_true(any(att.type == "sensor" for att in robot_step.attachments), "missing robotics sensor attachment")
    assert_true(len(robot_step.sensor_frames) == 2, "expected two robotics sensor frames")
    assert_true(error_detail.trace.status == "error", "error trace did not persist with error status")

    print(
        json.dumps(
            {
                "sdk": "python",
                "run_tag": run_tag,
                "success_trace_id": success_trace_id,
                "error_trace_id": error_trace_id,
                "listed_count": len(listed.data),
                "success_steps": len(success_detail.trace.steps),
                "trace_attachments": len(success_detail.trace.attachments),
                "robotics_sensor_frames": len(robot_step.sensor_frames),
                "error_status": error_detail.trace.status,
            },
            indent=2,
        )
    )

    client.close(timeout=5.0)


if __name__ == "__main__":
    main()
