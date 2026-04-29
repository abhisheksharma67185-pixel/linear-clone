// ---------------------------------------------------------------------------
// `theta baseline run` — run a simple rule-based agent across tasks.
//
// The agent is intentionally dumb; it exists to prove the wiring end-to-end
// and to serve as a lower-bound baseline for comparing real agents.
//
// Per task:
//   1. Start episode via /api/sim/config.
//   2. Inspect available actions; pick a sensible first navigation/action.
//   3. Step until `done` or --max-steps.
//   4. For retrieval tasks, emit the most-likely literal from the goal text
//      (or an explicit impossibility phrase for impossible tasks).
//   5. POST /api/sim/finish and record the result.
// ---------------------------------------------------------------------------

import { writeFileSync } from "node:fs"
import { resolve as pathResolve } from "node:path"
import { Command } from "commander"
import ora, { type Ora } from "ora"
import {
  fetchObservation,
  fetchTasks,
  finishEpisodeRemote,
  startEpisodeRemote,
  stepEnvironment,
  type TaskListItem,
} from "../client/api.js"
import { HttpError } from "../client/http.js"
import { c, err as errColor, muted, ok } from "../render/colors.js"
import { renderTable } from "../render/table.js"
import { command, header, parseIntFlag, resolveBaseUrl } from "../util.js"

interface BaselineResult {
  taskId: string
  site: string
  domain: string
  type: string
  status: string
  score: number
  totalReward: number
  steps: number
  passed: boolean
  walltimeSec: number
  error?: string
}

/** Pick a literal-looking token from the task goal (numbers, $-amounts, quoted strings). */
function extractLikelyResponse(goal: string): string {
  // Quoted string wins
  const q = goal.match(/"([^"]+)"|'([^']+)'/)
  if (q) return q[1] ?? q[2] ?? ""
  // Dollar amount
  const money = goal.match(/\$\s*([0-9,]+(?:\.[0-9]+)?)/)
  if (money) return `$${money[1]}`
  // Bare number
  const num = goal.match(/\b([0-9]+(?:\.[0-9]+)?)\b/)
  if (num) return num[1] ?? "0"
  // Fallback to a short summary
  return goal.slice(0, 120)
}

/**
 * Pick the first "productive" action given the available action names, falling
 * back to a safe `navigate` when nothing obviously applies.
 */
function pickAction(
  availableActions: string[],
  observation: Record<string, unknown>
): Record<string, unknown> {
  if (availableActions.includes("respond")) {
    // Default respond is harmless; overridden on finish.
    // But only use respond when we have nothing else.
  }
  if (availableActions.includes("search")) {
    return { action: "search", query: "status" }
  }
  if (availableActions.includes("navigate")) {
    const current = (observation.currentPage as string | undefined) ?? "/"
    // Try a known page rotation so we visit something new.
    const candidates = [
      "/board",
      "/backlog",
      "/projects",
      "/orders",
      "/products",
      "/customers",
      "/",
    ]
    const next = candidates.find((p) => p !== current) ?? "/"
    return { action: "navigate", target: next }
  }
  // Last resort
  return { action: "respond", message: "noop" }
}

async function runOne(
  baseUrl: string,
  task: TaskListItem,
  maxSteps: number
): Promise<BaselineResult> {
  const t0 = Date.now()
  try {
    await startEpisodeRemote(baseUrl, { task_id: task.id })

    let steps = 0
    let done = false
    while (steps < maxSteps && !done) {
      const obs = await fetchObservation(baseUrl)
      const available =
        (obs.observation.availableActions as string[] | undefined) ?? []
      const action = pickAction(available, obs.observation)
      const step = await stepEnvironment(baseUrl, action)
      steps++
      done = step.done
      if (step.truncated) break
    }

    const response =
      task.type === "retrieval" ||
      task.type === "action_retrieval" ||
      task.domain === "impossible"
        ? task.domain === "impossible"
          ? "This task is not possible because the required entity does not exist."
          : extractLikelyResponse(task.goal)
        : undefined

    const finish = await finishEpisodeRemote(baseUrl, response)
    // A task counts as "passed" when either (a) every eval check passed (and
    // there was at least one), or (b) there are no eval checks but the final
    // score is 1.0 (judge-only retrieval / impossibility tasks).
    const hasChecks = !!finish.eval && finish.eval.total > 0
    const passed = hasChecks
      ? finish.eval!.passed === finish.eval!.total
      : finish.score >= 1.0

    return {
      taskId: task.id,
      site: task.site,
      domain: task.domain,
      type: task.type,
      status: finish.status,
      score: finish.score,
      totalReward: finish.total_reward,
      steps: finish.steps ?? steps,
      passed,
      walltimeSec: (Date.now() - t0) / 1000,
    }
  } catch (e) {
    return {
      taskId: task.id,
      site: task.site,
      domain: task.domain,
      type: task.type,
      status: "error",
      score: 0,
      totalReward: 0,
      steps: 0,
      passed: false,
      walltimeSec: (Date.now() - t0) / 1000,
      error:
        e instanceof HttpError
          ? `${e.status}: ${e.message}`
          : e instanceof Error
            ? e.message
            : String(e),
    }
  }
}

export function registerBaselineCommand(program: Command): void {
  const baseline = program
    .command("baseline")
    .description("Run a built-in rule-based agent")

  baseline
    .command("run")
    .description(
      "Run the baseline agent against a set of tasks and save a results JSON"
    )
    .requiredOption("--url <site-url>", "Site base URL")
    .option(
      "--tasks <ids>",
      "Comma-separated task IDs, or 'all' to iterate everything",
      "all"
    )
    .option(
      "-o, --output <file.json>",
      "Where to write the result JSON (alias: --out)",
      "baseline-results.json"
    )
    // Friendly alias — many users type `--out` first.
    .option("--out <file.json>", "Alias for --output")
    .option(
      "--max-steps <n>",
      "Per-task step budget before forcing finish",
      "25"
    )
    .option(
      "--limit <n>",
      "Run at most N tasks (safety cap when --tasks=all)",
      "10"
    )
    .addHelpText(
      "after",
      `\nExample:\n  $ theta baseline run --url http://localhost:3000 --tasks all --limit 5\n  $ theta baseline run --url http://localhost:3000 --tasks shopify-easy-001,shopify-easy-002\n`
    )
    .action(
      command(async (opts: Record<string, string>) => {
        const baseUrl = resolveBaseUrl(opts.url)
        const maxSteps = parseIntFlag("max-steps", opts.maxSteps) ?? 25
        const limit = parseIntFlag("limit", opts.limit) ?? 10

        const loader = ora({ text: "Fetching task list…" }).start()
        const all = await fetchTasks(baseUrl)
        loader.succeed(
          `Loaded ${all.tasks.length} task definitions from ${baseUrl}`
        )

        let selected: TaskListItem[]
        if (opts.tasks === "all" || !opts.tasks) {
          selected = all.tasks.slice(0, limit)
        } else {
          const ids = new Set(
            opts.tasks
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
          selected = all.tasks.filter((t) => ids.has(t.id))
          const missing = [...ids].filter(
            (id) => !selected.some((t) => t.id === id)
          )
          if (missing.length > 0) {
            process.stderr.write(
              errColor(`warning:`) +
                ` unknown task IDs: ${missing.join(", ")}\n`
            )
          }
        }

        if (selected.length === 0) {
          throw new Error(
            "No tasks to run (check --tasks / --limit and that the site has tasks)."
          )
        }

        process.stdout.write(
          header(`Baseline run — ${selected.length} task(s) against ${baseUrl}`)
        )
        process.stdout.write("\n")

        const results: BaselineResult[] = []
        let spinner: Ora | null = null
        for (let i = 0; i < selected.length; i++) {
          const task = selected[i]!
          spinner = ora({
            text: `[${i + 1}/${selected.length}] ${task.id} — ${task.domain}/${task.difficulty}`,
          }).start()
          const result = await runOne(baseUrl, task, maxSteps)
          if (result.error) {
            spinner.fail(`${task.id} — ${result.error}`)
          } else {
            const mark = result.passed
              ? ok("passed")
              : muted(`score=${result.score.toFixed(2)}`)
            spinner.succeed(
              `${task.id} — ${mark}  steps=${result.steps}  reward=${result.totalReward.toFixed(2)}`
            )
          }
          results.push(result)
        }

        // Render summary
        process.stdout.write("\n")
        const rows = results.map((r) => [
          r.passed ? ok("✓") : errColor("✗"),
          r.taskId,
          r.domain,
          r.type,
          r.steps,
          r.score.toFixed(3),
          r.totalReward.toFixed(3),
          r.error ? errColor("error") : r.status,
        ])
        process.stdout.write(
          renderTable(rows, {
            head: [
              "",
              "Task",
              "Domain",
              "Type",
              "Steps",
              "Score",
              "Reward",
              "Status",
            ],
            colWidths: [4, 26, 14, 18, 7, 8, 9, 14],
          }) + "\n"
        )

        const passed = results.filter((r) => r.passed).length
        const avgScore =
          results.length === 0
            ? 0
            : results.reduce((s, r) => s + r.score, 0) / results.length
        process.stdout.write(
          `\n  ${c.bold("Summary")}: ${passed}/${results.length} passed — avg score ${avgScore.toFixed(3)}\n`
        )

        // Write JSON. --out is a friendly alias for --output.
        const outPath = pathResolve(
          process.cwd(),
          (opts.out as string | undefined) ??
            opts.output ??
            "baseline-results.json"
        )
        writeFileSync(
          outPath,
          JSON.stringify(
            {
              baseUrl,
              startedAt: new Date().toISOString(),
              totalTasks: results.length,
              tasksPassed: passed,
              avgScore,
              avgSteps: results.length
                ? results.reduce((s, r) => s + r.steps, 0) / results.length
                : 0,
              avgReward: results.length
                ? results.reduce((s, r) => s + r.totalReward, 0) /
                  results.length
                : 0,
              results,
            },
            null,
            2
          ),
          "utf8"
        )
        process.stdout.write(`  ${muted("results saved to:")} ${outPath}\n`)
      })
    )
}
