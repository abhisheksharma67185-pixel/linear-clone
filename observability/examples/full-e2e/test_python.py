"""Full E2E test: Python SDK + Claude Sonnet 4.6 + all modalities.

Tests: wrapAgent, recordMetric, attach_image, attach_audio, attach_video,
       attach_sensor, attach_file, tool_calls, nested steps, error traces.
"""
from __future__ import annotations

import base64
import io
import math
import os
import struct
import time
import wave
import zlib
from pathlib import Path

from anthropic import Anthropic
from theta_observability import TraceClient

MODEL = "claude-sonnet-4-6"
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
BASE_URL = os.environ.get("THETA_BASE_URL", "http://localhost:8080")

# ── Fixture generators ──────────────────────────────────────────────────

def make_png(w=32, h=32, color=(0, 120, 255)) -> bytes:
    raw = b""
    for _ in range(h):
        raw += b"\x00" + bytes(color) * w
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")

def make_wav(seconds=0.3, freq=440, rate=16000) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        for i in range(int(rate * seconds)):
            sample = int(32767 * 0.3 * math.sin(2 * math.pi * freq * (i / rate)))
            f.writeframesraw(struct.pack("<h", sample))
    return buf.getvalue()

def make_mp4() -> bytes:
    ftyp = b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2avc1mp41"
    moov = b"\x00\x00\x00\x08moov"
    return ftyp + moov

def make_sensor() -> bytes:
    buf = b"JOINTv1\x00"
    import random
    for _ in range(64):
        for _ in range(7):
            buf += struct.pack("<f", random.uniform(-3.14, 3.14))
    return buf

# ── Tests ────────────────────────────────────────────────────────────────

client = TraceClient(
    api_key=os.environ["THETA_API_KEY"],
    project=os.environ["THETA_PROJECT"],
    base_url=BASE_URL,
)
llm = Anthropic(api_key=ANTHROPIC_KEY)

passed = 0
failed = 0

def test(name):
    global passed, failed
    def decorator(fn):
        global passed, failed
        print(f"\n{'='*60}")
        print(f"TEST: {name}")
        print(f"{'='*60}")
        try:
            fn()
            print(f"  ✓ PASSED")
            passed += 1
        except Exception as e:
            print(f"  ✗ FAILED: {e}")
            failed += 1
    return decorator

@test("1. wrapAgent with Claude Sonnet 4.6")
def _():
    @client.wrap_agent("sonnet-agent")
    def agent(ctx, query):
        resp = llm.messages.create(
            model=MODEL, max_tokens=200,
            messages=[{"role": "user", "content": query}],
        )
        reply = resp.content[0].text
        ctx.on_complete(reply)
        with ctx.trace.step(name="llm-call", type="llm", model=MODEL) as s:
            s.log_message(role="user", text=query)
            s.log_message(role="assistant", text=reply)
            s.set_token_usage(input=resp.usage.input_tokens, output=resp.usage.output_tokens)
        return reply

    result, run_id = agent("Say hello in exactly 5 words")
    assert run_id.startswith("tr_"), f"run_id should start with tr_, got {run_id}"
    assert len(result) > 0, "empty result"
    print(f"  run_id={run_id[:30]}...")
    print(f"  result={result[:80]}")

    client.record_metric("task_adherence", run_id, passed=True)
    client.record_metric("user_satisfaction", run_id, score=0.95)
    print(f"  metrics recorded")

@test("2. Multimodal trace: image + audio + video + sensor + file")
def _():
    png = make_png()
    wav = make_wav()
    mp4 = make_mp4()
    sensor = make_sensor()
    tool_json = b'{"tool":"web.search","results":["a","b"]}'

    with client.trace(
        name="multimodal-sonnet-test",
        run_type="eval",
        use_case="all-modalities",
        tags=["e2e", "sonnet", "multimodal"],
    ) as t:
        t.set_user("e2e-test@theta.dev")
        t.set_metadata(platform="web", model=MODEL)

        img_uri = t.attach_image(png, mime="image/png")
        aud_uri = t.attach_audio(wav, mime="audio/wav")
        vid_uri = t.attach_video(mp4, mime="video/mp4")
        sen_uri = t.attach_sensor(sensor, modality="joint_state", mime="application/octet-stream")
        fil_uri = t.attach_file(tool_json, mime="application/json")

        print(f"  image: {img_uri[:40]}...")
        print(f"  audio: {aud_uri[:40]}...")
        print(f"  video: {vid_uri[:40]}...")
        print(f"  sensor: {sen_uri[:40]}...")
        print(f"  file: {fil_uri[:40]}...")

        with t.step(name="vision", type="llm", model=MODEL) as s:
            img_b64 = base64.b64encode(png).decode()
            resp = llm.messages.create(
                model=MODEL, max_tokens=100,
                messages=[{"role": "user", "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_b64}},
                    {"type": "text", "text": "What color is this image?"},
                ]}],
            )
            reply = resp.content[0].text
            s.log_message(role="user", text="What color is this image?", images=[png])
            s.log_message(role="assistant", text=reply)
            s.set_token_usage(input=resp.usage.input_tokens, output=resp.usage.output_tokens)
            print(f"  vision reply: {reply[:60]}")

        with t.step(name="tool-use", type="tool") as s:
            s.log_tool_call(
                name="web.search",
                arguments={"query": "blue color meaning"},
                result={"results": ["calm", "trust"]},
                latency_ms=150,
            )

        with t.step(name="robotics-arm", type="robotics") as s:
            s.log_sensor_frame(modality="joint_state", source=sensor, mime="application/octet-stream", duration_ms=1200)
            s.log_sensor_frame(modality="camera", source=mp4, mime="video/mp4", fps=30)
            s.log_tool_call(name="arm.execute", arguments={"goal": [0.5, 0.2]}, result={"ok": True}, latency_ms=800)

        t.annotate(label="multimodal_pass", score=1.0, user="e2e@theta.dev")

    assert img_uri.startswith("gs://"), f"image uri should start with gs://, got {img_uri}"

@test("3. Error trace with Claude Sonnet 4.6")
def _():
    try:
        with client.trace(name="error-sonnet-test", run_type="eval", tags=["e2e", "error"]) as t:
            with t.step(name="failing-call", type="llm", model=MODEL) as s:
                s.log_message(role="user", text="This will fail")
                raise RuntimeError("Simulated Claude timeout after 30s")
    except RuntimeError:
        pass
    print(f"  error trace committed (status should be 'error')")

@test("4. Nested steps with real Claude")
def _():
    with client.trace(name="nested-sonnet-test", run_type="eval", tags=["e2e", "nested"]) as t:
        with t.step(name="outer-plan", type="llm", model=MODEL) as outer:
            resp = llm.messages.create(
                model=MODEL, max_tokens=50,
                messages=[{"role": "user", "content": "Count to 3"}],
            )
            outer.log_message(role="user", text="Count to 3")
            outer.log_message(role="assistant", text=resp.content[0].text)
            outer.set_token_usage(input=resp.usage.input_tokens, output=resp.usage.output_tokens)

            with t.step(name="inner-execute", type="tool") as inner:
                inner.log_tool_call(name="counter.run", arguments={"max": 3}, result={"done": True})

        with t.step(name="final-summary", type="llm", model=MODEL) as s:
            s.log_message(role="assistant", text="All steps complete")
            s.set_token_usage(input=20, output=10)

    print(f"  3 steps (outer → inner nested + final)")

@test("5. Chatbot conversation (3 turns) with Claude Sonnet 4.6")
def _():
    history = []
    png = make_png(16, 16, (255, 0, 0))
    for turn in range(3):
        msgs = [
            "Describe this red square image in one sentence.",
            "Now describe it as if you were a poet.",
            "Summarize our conversation in one line.",
        ]
        user_msg = msgs[turn]
        history.append({"role": "user", "content": user_msg})

        with client.trace(name=f"chatbot-turn-{turn}", run_type="eval", tags=["e2e", "chatbot"]) as t:
            t.set_user("chatbot-e2e@theta.dev")
            t.set_metadata(model=MODEL, turn=turn)
            if turn == 0:
                t.attach_image(png, mime="image/png")

            with t.step(name="generate", type="llm", model=MODEL) as s:
                api_msgs = [{"role": h["role"], "content": h["content"]} for h in history]
                if turn == 0:
                    api_msgs[0] = {"role": "user", "content": [
                        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": base64.b64encode(png).decode()}},
                        {"type": "text", "text": user_msg},
                    ]}
                resp = llm.messages.create(model=MODEL, max_tokens=150, messages=api_msgs)
                reply = resp.content[0].text
                s.log_message(role="user", text=user_msg)
                s.log_message(role="assistant", text=reply)
                s.set_token_usage(input=resp.usage.input_tokens, output=resp.usage.output_tokens)

            history.append({"role": "assistant", "content": reply})
            print(f"  turn {turn}: {reply[:60]}")

# ── Flush + report ───────────────────────────────────────────────────────

client.flush(timeout=30)
time.sleep(2)

print(f"\n{'='*60}")
print(f"PYTHON E2E RESULTS: {passed} passed, {failed} failed")
print(f"{'='*60}")
if failed > 0:
    exit(1)
