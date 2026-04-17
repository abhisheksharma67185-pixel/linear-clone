"""OpenAI integration example.

    export THETA_API_KEY=...  THETA_PROJECT=proj_abc  OPENAI_API_KEY=...
    python examples/openai_example.py
"""

from __future__ import annotations

from openai import OpenAI  # type: ignore

from theta_observability import TraceClient
from theta_observability.integrations.openai import wrap_openai


def main() -> None:
    obs = TraceClient()
    oai = wrap_openai(OpenAI(), obs)

    with obs.trace(name="qa-agent", run_type="prod", tags=["openai"]):
        response = oai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are concise."},
                {"role": "user", "content": "What is the capital of France?"},
            ],
        )
        print(response.choices[0].message.content)

    obs.flush()


if __name__ == "__main__":
    main()
