"""Tiny end-to-end demo app for Theta Observability.

Emits three multimodal traces so the dashboard has something to show:
  1. a 3-step "web agent" trace (plan -> tool -> summarize) with a PNG image
  2. a robotics trace with a fake joint-state sensor blob
  3. an error trace (tool fails mid-run)

Run:
    THETA_API_KEY=tk_... THETA_PROJECT=proj_... \
    THETA_BASE_URL=http://localhost:8080 \
    python observability/examples/demo_app.py
"""

from __future__ import annotations

import os
import random
import time
from io import BytesIO

from theta_observability import TraceClient


def _tiny_png() -> bytes:
    # 1x1 transparent PNG — enough for the dashboard's image renderer.
    return bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
        "890000000d49444154789c6300010000000500010d0a2db40000000049454e44"
        "ae426082"
    )


def _fake_sensor_blob() -> bytes:
    # Pretend this is a parquet-like sensor dump.
    return b"joint_state_v1\n" + os.urandom(256)


def web_agent_trace(client: TraceClient) -> None:
    with client.trace(
        name="checkout-agent",
        run_type="eval",
        use_case="web-shopping",
        metadata={"git_sha": "deadbeef", "env": "dev"},
        tags=["demo", "mobile"],
    ) as t:
        t.set_user("somu@theagi.company")
        t.set_metadata(platform="mobile", model="claude-opus-4.6")

        with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
            s.log_message(role="system", text="You are a helpful shopping agent.")
            s.log_message(
                role="user",
                text="Open Uber and order a ride to the airport.",
                images=[_tiny_png()],
            )
            s.log_message(
                role="assistant",
                text='start_app({"package": "com.google.android.googlequicksearchbox"})',
            )
            s.set_token_usage(input=1820, output=412)
            time.sleep(0.05)

        with t.step(name="click home button", type="tool") as s:
            s.log_tool_call(
                name="ui.click",
                arguments={"selector": "#home"},
                result={"ok": True},
                latency_ms=120,
            )

        with t.step(name="verify screen", type="tool") as s:
            s.log_tool_call(
                name="screen.capture",
                arguments={},
                result={"uri": "screenshot saved"},
                latency_ms=80,
            )
            t.attach_image(_tiny_png(), mime="image/png")

        with t.step(name="summarize", type="llm", model="claude-opus-4.6") as s:
            s.log_message(role="assistant", text="Uber app opened successfully.")
            s.set_token_usage(input=200, output=50)

        t.annotate(label="pass", score=1.0, user="demo@theta.dev")


def robotics_trace(client: TraceClient) -> None:
    with client.trace(
        name="arm-reach-cup",
        run_type="eval",
        use_case="robotics",
        metadata={"robot": "franka-panda", "scene": "kitchen"},
        tags=["robotics"],
    ) as t:
        t.set_user("robotics@theagi.company")
        with t.step(name="perceive", type="llm", model="claude-opus-4.6") as s:
            s.log_message(role="user", text="Pick up the red cup.")
            s.set_token_usage(input=300, output=80)
        with t.step(name="plan trajectory", type="custom") as s:
            s.log_tool_call(
                name="plan.rrt",
                arguments={"target": [0.4, 0.1, 0.2]},
                result={"steps": 42},
                latency_ms=320,
            )
        with t.step(name="execute", type="robotics") as s:
            t.attach_sensor(
                _fake_sensor_blob(),
                modality="joint_state",
                mime="application/octet-stream",
            )
            s.log_tool_call(
                name="arm.execute",
                arguments={"trajectory_id": "rrt_42"},
                result={"success": True},
                latency_ms=1240,
            )


def error_trace(client: TraceClient) -> None:
    try:
        with client.trace(
            name="payment-agent",
            run_type="prod",
            use_case="web-shopping",
            tags=["error"],
        ) as t:
            with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
                s.log_message(role="user", text="Buy the cart.")
                s.set_token_usage(input=400, output=90)
            with t.step(name="charge card", type="tool") as s:
                s.log_tool_call(
                    name="stripe.charge",
                    arguments={"amount": 1299},
                    result={"error": "card_declined"},
                )
                raise RuntimeError("card_declined")
    except RuntimeError:
        pass  # swallow so the demo keeps running


def main() -> None:
    client = TraceClient(
        api_key=os.environ["THETA_API_KEY"],
        project=os.environ["THETA_PROJECT"],
        base_url=os.environ.get("THETA_BASE_URL", "http://localhost:8080"),
        debug=True,
    )
    web_agent_trace(client)
    robotics_trace(client)
    error_trace(client)
    client.flush(timeout=10)
    print("done.")


if __name__ == "__main__":
    random.seed(0)
    main()
