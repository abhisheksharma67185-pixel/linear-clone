"""Demo: wrap_agent + record_metric.

Run with THETA_API_KEY and THETA_PROJECT set in env:

    python examples/agent_demo.py
"""

from theta_observability import TraceClient

client = TraceClient()


@client.wrap_agent("support-agent")
def support(ctx, query):
    # Fake LLM call
    reply = f"I can help with: {query}"
    ctx.on_complete(reply)
    return reply


result, run_id = support("how do I return an item?")
client.record_metric("task_adherence", run_id, passed=True)
client.record_metric("user_satisfaction", run_id, score=0.9)
print(f"result={result}, run_id={run_id}")

client.close()
