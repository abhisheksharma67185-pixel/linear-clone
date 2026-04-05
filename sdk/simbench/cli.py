"""SimBench CLI — command-line interface for task listing, running, and evaluation."""

from __future__ import annotations
import argparse
import importlib.util
import json
import sys
from typing import Any, Optional

import httpx

from simbench.client import SimBenchClient, SimBenchError
from simbench.runner import BatchRunner

# ANSI colors
BOLD = "\033[1m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
DIM = "\033[2m"
RESET = "\033[0m"


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="simbench",
        description="SimBench — Web Agent Benchmark Platform",
    )
    parser.add_argument("--url", default="http://localhost:3000", help="SimBench server URL")
    sub = parser.add_subparsers(dest="command")

    # simbench info
    sub.add_parser("info", help="Show platform info")

    # simbench tasks
    tp = sub.add_parser("tasks", help="List available tasks")
    tp.add_argument("--domain", help="Filter by domain")
    tp.add_argument("--type", help="Filter by type (action, retrieval, no_action)")
    tp.add_argument("--difficulty", help="Filter by difficulty (easy, medium, hard)")
    tp.add_argument("--stage", type=int, help="Filter by curriculum stage (1-10)")

    # simbench run
    rp = sub.add_parser("run", help="Run a single task")
    rp.add_argument("--task", required=True, help="Task ID (e.g. prod-001)")
    rp.add_argument("--agent", help="Path to agent .py file")

    # simbench eval
    ep = sub.add_parser("eval", help="Batch evaluation across all tasks")
    ep.add_argument("--agent", required=True, help="Path to agent .py file")
    ep.add_argument("--domain", help="Filter by domain")
    ep.add_argument("--difficulty", help="Filter by difficulty")
    ep.add_argument("--type", help="Filter by type")
    ep.add_argument("--output", default="results.json", help="Output file (default: results.json)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    try:
        if args.command == "info":
            cmd_info(args.url)
        elif args.command == "tasks":
            cmd_tasks(args)
        elif args.command == "run":
            cmd_run(args)
        elif args.command == "eval":
            cmd_eval(args)
    except SimBenchError as e:
        print(f"{RED}Error: {e.detail}{RESET}")
        sys.exit(1)
    except (httpx.ConnectError, httpx.ConnectTimeout):
        print(f"{RED}Cannot connect to SimBench server at {args.url}{RESET}")
        print(f"Start the server: cd sites/shopify-admin && npm run dev")
        sys.exit(1)
    except Exception as e:
        print(f"{RED}Error: {e}{RESET}")
        sys.exit(1)


def cmd_info(url: str) -> None:
    import httpx
    r = httpx.get(f"{url}/api/health", timeout=10)
    d = r.json()

    print(f"\n{BOLD}SimBench Platform{RESET}")
    print(f"  Version:    {d.get('version', '?')}")
    print(f"  Site:       {d.get('site', '?')}")
    print(f"  Tasks:      {d.get('tasks', '?')}")
    print(f"  Domains:    {d.get('domains', '?')}")
    print(f"  Curriculum: {d.get('curriculum_stages', '?')} stages")
    print(f"  Server:     {url}")

    breakdown = d.get("domain_breakdown", {})
    if breakdown:
        print(f"\n  {BOLD}Domain Breakdown:{RESET}")
        for domain, count in sorted(breakdown.items()):
            print(f"    {domain:<20} {count:>3} tasks")
    print()


def cmd_tasks(args: argparse.Namespace) -> None:
    client = SimBenchClient(args.url)
    filters: dict[str, Any] = {}
    if args.domain:
        filters["domain"] = args.domain
    if args.type:
        filters["type"] = args.type
    if args.difficulty:
        filters["difficulty"] = args.difficulty
    if args.stage:
        filters["stage"] = args.stage

    result = client.list_tasks(**filters)
    client.close()

    print(f"\n{BOLD}Tasks{RESET} ({result.filtered}/{result.total})\n")
    print(f"  {'ID':<20} {'Domain':<15} {'Type':<15} {'Difficulty':<10} {'Stage':>5}")
    print(f"  {'─'*20} {'─'*15} {'─'*15} {'─'*10} {'─'*5}")
    for t in result.tasks:
        print(f"  {t.id:<20} {t.domain:<15} {t.type:<15} {t.difficulty:<10} {t.curriculum_stage:>5}")
    print()


def cmd_run(args: argparse.Namespace) -> None:
    agent_step, agent_response = _load_agent(args.agent) if args.agent else (_noop_agent, None)

    client = SimBenchClient(args.url)
    task = client.get_task(args.task)
    client.close()

    print(f"\n{BOLD}Task:{RESET} {task['id']}")
    print(f"  Goal: {task['goal']}")
    print(f"  Type: {task['type']} | Difficulty: {task['difficulty']} | Max steps: {task['maxSteps']}")
    print()

    from simbench.curriculum import CurriculumRunner
    runner = CurriculumRunner(args.url)
    result = runner.run_task(args.task, agent_step, agent_response)
    runner.close()

    score = result.get("score", 0)
    color = GREEN if score >= 1.0 else YELLOW if score >= 0.5 else RED
    status = result.get("status", "?")

    print(f"  {BOLD}Result:{RESET}")
    print(f"    Score:  {color}{score:.0%}{RESET}")
    print(f"    Status: {status}")
    print(f"    Steps:  {result.get('steps', '?')}")
    if result.get("judge_result"):
        jr = result["judge_result"]
        print(f"    Judge:  {'PASS' if jr.get('passed') else 'FAIL'} ({jr.get('matchType', '?')})")
    print()


def cmd_eval(args: argparse.Namespace) -> None:
    agent_step, agent_response = _load_agent(args.agent)

    agent_module_name = args.agent.replace("/", ".").replace("\\", ".").removesuffix(".py").split(".")[-1]

    runner = BatchRunner(
        base_url=args.url,
        agent_step_fn=agent_step,
        agent_response_fn=agent_response,
        agent_name=agent_module_name,
        model_name=getattr(sys.modules.get("agent_module"), "MODEL", "rule-based"),
        mode="rest",
        verbose=True,
    )

    results = runner.run_all(
        domain=args.domain,
        difficulty=args.difficulty,
        task_type=args.type,
    )
    runner.close()

    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)

    s = results["summary"]
    print(f"\n{BOLD}Evaluation Complete{RESET}")
    print(f"  Tasks:  {s['total_evaluated']}/{s['total_available']}")
    print(f"  Passed: {s['passed']}")
    print(f"  Score:  {GREEN if s['score'] >= 0.5 else YELLOW}{s['score']:.1%}{RESET}")
    print(f"  Output: {args.output}")

    print(f"\n  {BOLD}Domains:{RESET}")
    for d, v in sorted(results["domains"].items()):
        color = GREEN if v["score"] >= 0.5 else YELLOW if v["score"] >= 0.25 else RED
        print(f"    {d:<20} {color}{v['score']:.0%}{RESET}  ({v['passed']}/{v['tasks']} passed)")
    print()


def _load_agent(path: Optional[str]):
    """Load agent step and response functions from a Python file."""
    if not path:
        return _noop_agent, None

    spec = importlib.util.spec_from_file_location("agent_module", path)
    if not spec or not spec.loader:
        print(f"{RED}Cannot load agent from: {path}{RESET}")
        sys.exit(1)

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    agent_step = getattr(module, "agent_step", None) or getattr(module, "agent", None)
    agent_response = getattr(module, "agent_response", None)

    if not agent_step:
        print(f"{RED}Agent file must export 'agent_step(obs, info) -> action' function{RESET}")
        sys.exit(1)

    return agent_step, agent_response


def _noop_agent(_obs: dict, _info: dict) -> dict:
    return {"action": "navigate", "url": "/admin"}


if __name__ == "__main__":
    main()
