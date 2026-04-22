// ---------------------------------------------------------------------------
// `theta interactive` — guided REPL backed by @clack/prompts.
//
// Flow:
//   1. Pick a site (by probing the base URL; we don't need a site list file —
//      we just use the /api/health response's `site` field).
//   2. Pick a task (grouped by curriculum stage).
//   3. Optionally enter a seed.
//   4. Start episode → loop: show observation, prompt for action JSON,
//      step until `done` or the user quits.
//   5. Prompt for agent response (if retrieval) → finish → show result.
// ---------------------------------------------------------------------------

import { Command } from "commander"
import * as p from "@clack/prompts"
import {
  fetchActionSpace,
  fetchHealth,
  fetchObservation,
  fetchTasks,
  finishEpisodeRemote,
  startEpisodeRemote,
  stepEnvironment,
  type TaskListItem,
} from "../client/api.js"
import { HttpError } from "../client/http.js"
import { c, err as errColor, muted, ok, warn } from "../render/colors.js"
import { command, parseIntFlag, resolveBaseUrl } from "../util.js"

async function pickTask(tasks: TaskListItem[]): Promise<TaskListItem | null> {
  // Group by curriculum stage for readability.
  const options = tasks.slice(0, 200).map((t) => ({
    value: t.id,
    label: `[${t.curriculum_stage}] ${t.id}`,
    hint: `${t.domain}/${t.difficulty}/${t.type} — ${t.title}`,
  }))

  const id = await p.select({
    message: `Pick a task (${tasks.length} total, showing first ${options.length})`,
    options,
  })
  if (p.isCancel(id)) return null
  return tasks.find((t) => t.id === id) ?? null
}

export function registerInteractiveCommand(program: Command): void {
  program
    .command("interactive")
    .alias("repl")
    .description("Interactive episode walkthrough (pick task, step by step)")
    .option(
      "--url <site-url>",
      "Site base URL (default: $THETA_URL or http://localhost:3000)"
    )
    .addHelpText(
      "after",
      `\nExample:\n  $ theta interactive --url http://localhost:3000\n`
    )
    .action(
      command(async (opts: Record<string, string>) => {
        const baseUrl = resolveBaseUrl(opts.url)

        p.intro(c.cyan("ThetaBench interactive"))

        // --- 1. Probe site + load tasks ---
        const spinner = p.spinner()
        spinner.start(`Connecting to ${baseUrl}…`)
        let siteName = "(unknown)"
        let tasks: TaskListItem[] = []
        let actionSpace: Awaited<ReturnType<typeof fetchActionSpace>> | null =
          null
        try {
          const [health, tasksResp, actions] = await Promise.all([
            fetchHealth(baseUrl).catch(() => null),
            fetchTasks(baseUrl),
            fetchActionSpace(baseUrl).catch(() => null),
          ])
          siteName = health?.site ?? "(unknown)"
          tasks = tasksResp.tasks
          actionSpace = actions
          spinner.stop(`Connected: ${siteName} (${tasks.length} tasks)`)
        } catch (e) {
          spinner.stop(errColor("Could not reach site"))
          p.outro(
            e instanceof HttpError
              ? `${e.message} — ${e.url}`
              : e instanceof Error
                ? e.message
                : String(e)
          )
          process.exitCode = 1
          return
        }

        if (tasks.length === 0) {
          p.outro(warn("Site has no registered tasks."))
          return
        }

        // --- 2. Pick a task ---
        const task = await pickTask(tasks)
        if (!task) {
          p.cancel("Cancelled.")
          return
        }

        // --- 3. Seed ---
        const seedRaw = await p.text({
          message: "Seed (optional, non-negative integer)",
          placeholder: "leave blank for default",
          validate: (v) => {
            if (!v) return undefined
            const n = Number(v)
            if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
              return "Must be a non-negative integer"
            }
            return undefined
          },
        })
        if (p.isCancel(seedRaw)) {
          p.cancel("Cancelled.")
          return
        }
        const seed = parseIntFlag("seed", seedRaw || undefined)

        // --- 4. Start episode ---
        const startSpin = p.spinner()
        startSpin.start("Starting episode…")
        let ep: Awaited<ReturnType<typeof startEpisodeRemote>>
        try {
          ep = await startEpisodeRemote(baseUrl, { task_id: task.id, seed })
          startSpin.stop(`Episode ${ep.episode_id} started.`)
        } catch (e) {
          startSpin.stop(errColor("Failed to start episode"))
          p.outro(e instanceof Error ? e.message : String(e))
          process.exitCode = 1
          return
        }

        p.note(
          `${c.bold("Goal")}: ${ep.task.goal}\n` +
            `${c.bold("Max steps")}: ${ep.task.max_steps}   ${c.bold("Type")}: ${ep.task.type}   ${c.bold("Difficulty")}: ${ep.task.difficulty}`,
          `Task ${ep.task.id}`
        )

        if (actionSpace) {
          const names = actionSpace.actions.map((a) => a.name).join(", ")
          p.note(muted(names), "Action space")
        }

        // --- 5. Step loop ---
        let done = false
        let steps = 0
        while (!done && steps < ep.task.max_steps) {
          const obsSpin = p.spinner()
          obsSpin.start("Fetching observation…")
          let obs: Awaited<ReturnType<typeof fetchObservation>>
          try {
            obs = await fetchObservation(baseUrl)
          } catch (e) {
            obsSpin.stop(errColor("Observation failed"))
            p.outro(e instanceof Error ? e.message : String(e))
            process.exitCode = 1
            return
          }
          obsSpin.stop(
            `Step ${steps + 1}/${ep.task.max_steps}  —  page: ${(obs.observation.currentPage as string) ?? "?"}`
          )

          const available =
            (obs.observation.availableActions as string[] | undefined) ?? []
          p.note(
            available.length
              ? available.join(", ")
              : muted("(no available actions)"),
            "Available actions"
          )

          const actionRaw = await p.text({
            message: "Next action (JSON) — or 'quit' to finish now",
            placeholder: '{"action":"navigate","target":"/board"}',
            validate: (v) => {
              if (!v) return "Enter an action JSON or 'quit'"
              if (v.trim() === "quit") return undefined
              try {
                const parsed = JSON.parse(v)
                if (
                  typeof parsed !== "object" ||
                  parsed === null ||
                  Array.isArray(parsed)
                ) {
                  return "Must be a JSON object"
                }
              } catch (e) {
                return `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`
              }
              return undefined
            },
          })
          if (p.isCancel(actionRaw)) {
            p.cancel("Cancelled.")
            return
          }
          if (actionRaw.trim() === "quit") break

          const actionObj = JSON.parse(actionRaw) as Record<string, unknown>
          const stepSpin = p.spinner()
          stepSpin.start(`Executing ${String(actionObj.action ?? "?")}…`)
          try {
            const res = await stepEnvironment(baseUrl, actionObj)
            const rewStr =
              res.reward >= 0
                ? ok(res.reward.toFixed(4))
                : warn(res.reward.toFixed(4))
            stepSpin.stop(
              `reward=${rewStr}  done=${res.done}  truncated=${res.truncated}`
            )
            done = res.done
            if (res.truncated) break
          } catch (e) {
            stepSpin.stop(errColor("Step failed"))
            p.log.error(e instanceof Error ? e.message : String(e))
            // Don't bail: let the user try again.
          }
          steps++
        }

        // --- 6. Finish ---
        let response: string | undefined
        if (
          task.type === "retrieval" ||
          task.type === "action_retrieval" ||
          task.domain === "impossible"
        ) {
          const r = await p.text({
            message: "Agent response (required for retrieval/impossible tasks)",
            placeholder:
              task.domain === "impossible"
                ? "This task is not possible because…"
                : "e.g. $29.99",
          })
          if (p.isCancel(r)) {
            p.cancel("Cancelled (episode not finished).")
            return
          }
          response = r
        }

        const finishSpin = p.spinner()
        finishSpin.start("Finishing episode…")
        try {
          const res = await finishEpisodeRemote(baseUrl, response)
          finishSpin.stop(
            `Done. status=${res.status}  score=${res.score.toFixed(3)}`
          )
          const passed = res.eval ? res.eval.passed : undefined
          const total = res.eval ? res.eval.total : undefined
          p.note(
            `score: ${res.score.toFixed(3)}   reward: ${res.total_reward.toFixed(3)}\n` +
              `steps: ${res.steps}   wall time: ${res.wall_time_seconds.toFixed(2)}s\n` +
              (passed !== undefined && total !== undefined
                ? `checks: ${passed}/${total}\n`
                : "") +
              (res.judge_result
                ? `judge: ${res.judge_result.passed ? ok("PASS") : errColor("FAIL")} (${res.judge_result.matchType})`
                : ""),
            "Result"
          )
        } catch (e) {
          finishSpin.stop(errColor("Finish failed"))
          p.log.error(e instanceof Error ? e.message : String(e))
          process.exitCode = 1
          return
        }

        p.outro(ok("Episode complete."))
      })
    )
}
