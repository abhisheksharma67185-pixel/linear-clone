"""Multimodal chatbot demo using the Theta Observability Python SDK + real Anthropic Claude.

Walks through 5 conversation turns where the user uploads an image and chats
about it. Each turn = one Trace with two Steps (retrieval + llm), and the
image is attached to the trace.

Run:
    THETA_API_KEY=tk_... THETA_PROJECT=proj_... \
    THETA_BASE_URL=http://localhost:8080 \
    ANTHROPIC_API_KEY=sk-ant-... \
    python observability/examples/chatbot-python/chatbot.py
"""

from __future__ import annotations

import base64
import os
import random
import time
from pathlib import Path

from anthropic import Anthropic
from theta_observability import TraceClient

HERE = Path(__file__).parent
IMAGES = sorted((HERE / "images").glob("*.png"))
MODEL = "claude-opus-4-5"  # latest Opus alias

USER_MESSAGES = [
    "Here's an image — what do you see?",
    "Describe the dominant colors more precisely.",
    "Could this be a sunset, ocean, or forest?",
    "Summarise everything we've discussed so far in two lines.",
    "Write a one-line caption I could use on Instagram.",
]


def call_claude(client: Anthropic, image_bytes: bytes, history: list[dict]) -> tuple[str, dict]:
    img_b64 = base64.b64encode(image_bytes).decode()
    messages = []
    for h in history:
        messages.append({"role": h["role"], "content": [{"type": "text", "text": h["text"]}]})
    # last user message also carries the image
    if messages and messages[-1]["role"] == "user":
        messages[-1]["content"].insert(
            0,
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_b64}},
        )
    resp = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system="You are a friendly multimodal assistant. Keep answers concise.",
        messages=messages,
    )
    text = "".join(b.text for b in resp.content if b.type == "text")
    usage = {"input": resp.usage.input_tokens, "output": resp.usage.output_tokens}
    return text, usage


def fake_retrieval(query: str) -> list[str]:
    time.sleep(0.02)
    return [
        f"Memory hit: previously discussed '{query.split()[0]}'",
        "Memory hit: user prefers concise answers",
    ]


def conversation_turn(
    obs: TraceClient,
    llm: Anthropic,
    user_id: str,
    turn: int,
    image_path: Path,
    history: list[dict],
) -> str:
    user_msg = USER_MESSAGES[turn]
    history.append({"role": "user", "text": user_msg})

    with obs.trace(
        name="chat-turn",
        run_type="prod",
        use_case="multimodal-chat",
        metadata={"turn": turn, "session_id": f"sess_{user_id}"},
        tags=["chatbot", "claude"],
    ) as t:
        t.set_user(user_id)
        t.set_metadata(platform="web", model=MODEL)

        try:
            t.attach_image(image_path.read_bytes(), mime="image/png")
        except Exception:
            pass

        with t.step(name="retrieve memory", type="retrieval") as s:
            hits = fake_retrieval(user_msg)
            s.log_message(role="system", text="Searching memory...")
            for h in hits:
                s.log_message(role="system", text=h)
            s.set_metadata(hits=len(hits))

        with t.step(name="claude generate", type="llm", model=MODEL) as s:
            s.log_message(role="user", text=user_msg, images=[image_path.read_bytes()])
            t0 = time.time()
            try:
                reply, usage = call_claude(llm, image_path.read_bytes(), history)
            except Exception as e:
                s.set_status("error")
                s.log_message(role="assistant", text=f"[error] {e!s}")
                raise
            s.log_message(role="assistant", text=reply)
            s.set_token_usage(input=usage["input"], output=usage["output"])
            s.set_metadata(latency_ms=int((time.time() - t0) * 1000))

        if turn == 4:
            t.annotate(label="conversation_complete", score=1.0, user="demo@theta.dev")

    history.append({"role": "assistant", "text": reply})
    return reply


def main() -> None:
    if not IMAGES:
        raise SystemExit(f"No images under {HERE/'images'}/")
    obs = TraceClient(
        api_key=os.environ["THETA_API_KEY"],
        project=os.environ["THETA_PROJECT"],
        base_url=os.environ.get("THETA_BASE_URL", "http://localhost:8080"),
        debug=False,
    )
    llm = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    user_id = "alice@example.com"
    history: list[dict] = []
    for turn in range(5):
        img = IMAGES[turn % len(IMAGES)]
        print(f"\n-> turn {turn} ({img.name})  user: {USER_MESSAGES[turn]!r}")
        try:
            reply = conversation_turn(obs, llm, user_id, turn, img, history)
            print(f"   claude: {reply.splitlines()[0][:120]}")
        except Exception as e:
            print(f"   ! turn failed: {e!s}")
            break
    obs.flush(timeout=30)
    print("\ndone.")


if __name__ == "__main__":
    random.seed(42)
    main()
