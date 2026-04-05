#!/usr/bin/env python3
"""
SimBench Demo — Run a curated set of tasks to showcase the platform.

Usage:
    1. Start the server:  cd sites/shopify-admin && npm run dev
    2. Run this script:   python examples/run_demo.py [--url http://localhost:3000]
"""

from __future__ import annotations
import sys
import os
import time
import argparse

# Add parent dir so we can import simbench and demo_agent
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from simbench.client import SimBenchClient, SimBenchError
from simbench.env import SimBenchEnv

# ─── Colors ──────────────────────────────────────────────────────────
BOLD = "\033[1m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
DIM = "\033[2m"
RESET = "\033[0m"

# ─── Curated demo tasks ─────────────────────────────────────────────
DEMO_TASKS = [
    "nav-001",    # Navigation (easy)
    "prod-001",   # Update product price (easy)
    "ord-001",    # Fulfill order (medium)
    "ret-001",    # Retrieval: product price (easy)
    "cust-001",   # Create customer (medium)
    "imp-001",    # Impossible: refund already-refunded (medium)
    "disc-001",   # Create discount (medium)
    "set-001",    # Update settings (easy)
]


def main():
    parser = argparse.ArgumentParser(description="SimBench Demo")
    parser.add_argument("--url", default="http://localhost:3000", help="Server URL")
    args = parser.parse_args()

    # Import demo agent
    import demo_agent

    print()
    print(f"{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  SimBench v0.1.0 — Web Agent Benchmark Platform{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")
    print()

    # Connection check
    try:
        import httpx
        health = httpx.get(f"{args.url}/api/health", timeout=5).json()
        print(f"  Server:     {CYAN}{args.url}{RESET}")
        print(f"  Site:       {health.get('site', '?')}")
        print(f"  Tasks:      {health.get('tasks', '?')}")
        print(f"  Domains:    {health.get('domains', '?')}")
        print(f"  Agent:      {CYAN}rule-based-v1{RESET} (no LLM)")
        print()
    except Exception:
        print(f"{RED}Cannot connect to server at {args.url}{RESET}")
        print(f"Start it: cd sites/shopify-admin && npm run dev")
        sys.exit(1)

    client = SimBenchClient(args.url)
    results = []
    total_start = time.time()

    for i, task_id in enumerate(DEMO_TASKS):
        task_info = client.get_task(task_id)
        task_type = task_info.get("type", "?")
        difficulty = task_info.get("difficulty", "?")
        goal = task_info.get("goal", "?")

        print(f"  {BOLD}[{i+1}/{len(DEMO_TASKS)}] {task_id}{RESET}")
        print(f"  {DIM}Type: {task_type} | Difficulty: {difficulty}{RESET}")
        print(f"  Goal: {goal}")

        # Run the task
        try:
            client.reset_env()
            env = SimBenchEnv(base_url=args.url, task_id=task_id, mode="rest")
            obs, info = env.reset()

            # Reset agent state
            demo_agent._goal = ""
            demo_agent._task_id = task_id
            demo_agent._task_type = task_type
            demo_agent._step = 0
            demo_agent._acted = False

            actions_taken = []
            done = False
            steps = 0
            start = time.time()

            while not done and steps < task_info.get("maxSteps", 10):
                action = demo_agent.agent_step(obs, info)
                actions_taken.append(action.get("action", "?"))
                obs, reward, terminated, truncated, info = env.step(action)
                steps += 1
                done = terminated or truncated

            # Get agent response for retrieval/impossible
            agent_resp = demo_agent.agent_response(obs, info)
            result = env.finish(agent_resp)
            elapsed = time.time() - start
            env.close()

            score = result.get("score", 0)
            status = result.get("status", "?")

            # Color the score
            if score >= 1.0:
                score_color = GREEN
                icon = "PASS"
            elif score >= 0.5:
                score_color = YELLOW
                icon = "PARTIAL"
            else:
                score_color = RED
                icon = "FAIL"

            actions_str = " -> ".join(actions_taken[:5])
            if len(actions_taken) > 5:
                actions_str += f" ... (+{len(actions_taken)-5})"

            print(f"  Actions: {DIM}{actions_str}{RESET}")
            if agent_resp:
                display_resp = agent_resp[:60] + "..." if len(agent_resp) > 60 else agent_resp
                print(f"  Response: {DIM}{display_resp}{RESET}")
            print(f"  Result: {score_color}{BOLD}{icon}{RESET} {score_color}(score: {score:.0%}){RESET} in {steps} steps ({elapsed:.1f}s)")

            judge = result.get("judge_result")
            if judge:
                jcolor = GREEN if judge.get("passed") else RED
                print(f"  Judge: {jcolor}{'PASS' if judge.get('passed') else 'FAIL'}{RESET} ({judge.get('matchType', '?')})")

            results.append({"id": task_id, "score": score, "steps": steps, "time": elapsed})

        except Exception as e:
            print(f"  {RED}Error: {e}{RESET}")
            results.append({"id": task_id, "score": 0, "steps": 0, "time": 0})

        print()

    # ─── Summary ─────────────────────────────────────────────────
    total_time = time.time() - total_start
    scores = [r["score"] for r in results]
    passed = sum(1 for s in scores if s >= 1.0)
    avg = sum(scores) / len(scores) if scores else 0

    print(f"{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  RESULTS{RESET}")
    print(f"{'='*60}")
    print()
    print(f"  {'Task':<15} {'Score':>8} {'Steps':>7} {'Time':>7}")
    print(f"  {'─'*15} {'─'*8} {'─'*7} {'─'*7}")
    for r in results:
        sc = r["score"]
        color = GREEN if sc >= 1.0 else YELLOW if sc >= 0.5 else RED
        print(f"  {r['id']:<15} {color}{sc:>7.0%}{RESET} {r['steps']:>7} {r['time']:>6.1f}s")
    print()
    print(f"  {BOLD}Total:{RESET}   {passed}/{len(results)} passed | Avg score: {avg:.0%} | Time: {total_time:.1f}s")
    print()

    client.close()


if __name__ == "__main__":
    main()
