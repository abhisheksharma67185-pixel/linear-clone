// ---------------------------------------------------------------------------
// `theta tasks list` and `theta tasks get`
// ---------------------------------------------------------------------------

import { Command } from "commander"
import { fetchTaskById, fetchTasks, type TaskListItem } from "../client/api.js"
import { HttpError } from "../client/http.js"
import { c, muted } from "../render/colors.js"
import { renderKeyValue, renderTable } from "../render/table.js"
import {
  command,
  header,
  parseIntFlag,
  printJson,
  resolveBaseUrl,
  truncate,
} from "../util.js"

function renderTasksTable(tasks: TaskListItem[]): string {
  const rows = tasks.map((t) => [
    t.id,
    t.site,
    t.domain,
    t.difficulty,
    t.type,
    String(t.curriculum_stage),
    truncate(t.title, 50),
  ])
  return renderTable(rows, {
    head: ["ID", "Site", "Domain", "Difficulty", "Type", "Stage", "Title"],
    colWidths: [22, 12, 12, 12, 18, 7, 52],
  })
}

export function registerTasksCommand(program: Command): void {
  const tasks = program
    .command("tasks")
    .description("List and inspect ThetaBench tasks")

  tasks
    .command("list")
    .description("List tasks from a running site, optionally filtered")
    .option(
      "--site <name>",
      "Filter by site (e.g. shopify, jira, linear, slack)"
    )
    .option(
      "--domain <d>",
      "Filter by domain (e.g. orders, products, retrieval)"
    )
    .option(
      "--difficulty <d>",
      "Filter by difficulty (easy|medium|hard|expert)"
    )
    .option(
      "--type <t>",
      "Filter by type (action|retrieval|action_retrieval|no_action)"
    )
    .option("--stage <n>", "Filter by curriculum stage (1-10)")
    .option("--limit <n>", "Maximum rows to display", "100")
    .option("--json", "Output JSON instead of a table")
    .option(
      "--url <site-url>",
      "Site base URL (default: $THETA_URL or http://localhost:3000)"
    )
    .addHelpText(
      "after",
      `\nExample:\n  $ theta tasks list --url http://localhost:3000 --domain orders --limit 5\n  $ theta tasks list --site shopify --difficulty hard --json\n`
    )
    .action(
      command(async (opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined)
        const limit =
          parseIntFlag("limit", opts.limit as string | undefined) ?? 100

        const data = await fetchTasks(baseUrl, {
          site: opts.site as string | undefined,
          domain: opts.domain as string | undefined,
          difficulty: opts.difficulty as string | undefined,
          type: opts.type as string | undefined,
          stage: opts.stage as string | undefined,
        })

        const sliced = data.tasks.slice(0, limit)

        if (opts.json) {
          printJson({ ...data, tasks: sliced, displayed: sliced.length })
          return
        }

        process.stdout.write(header(`Tasks (${data.filtered}/${data.total})`))
        process.stdout.write("\n")

        if (sliced.length === 0) {
          process.stdout.write(muted("  No tasks match the given filters.\n"))
          return
        }

        process.stdout.write(renderTasksTable(sliced) + "\n")
        if (data.filtered > sliced.length) {
          process.stdout.write(
            muted(
              `\nShowing ${sliced.length} of ${data.filtered} matching tasks. Increase --limit to see more.\n`
            )
          )
        }
      })
    )

  tasks
    .command("get <task-id>")
    .description("Print a single task definition with its eval checks")
    .option("--url <site-url>", "Site base URL")
    .option("--json", "Output JSON instead of formatted text")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta tasks get jira-easy-001 --url http://localhost:3000\n`
    )
    .action(
      command(
        async (taskId: string, opts: Record<string, string | boolean>) => {
          const baseUrl = resolveBaseUrl(opts.url as string | undefined)

          // Try the per-id endpoint first (returns full TaskDefinition with
          // evalChecks). Fall back to scanning the list for older sites that
          // haven't shipped /api/sim/tasks/[id] yet.
          let full: Record<string, unknown> | null = null
          try {
            const resp = await fetchTaskById(baseUrl, taskId)
            full =
              "task" in resp && resp.task && typeof resp.task === "object"
                ? (resp.task as Record<string, unknown>)
                : (resp as Record<string, unknown>)
          } catch (err) {
            if (!(err instanceof HttpError) || err.status !== 404) {
              // Network error / 500 — surface to the user.
              if (err instanceof HttpError && err.status === 404) {
                full = null
              } else {
                throw err
              }
            }
          }

          if (!full) {
            const data = await fetchTasks(baseUrl)
            const summary = data.tasks.find((t) => t.id === taskId)
            if (!summary) {
              throw new Error(
                `Task not found: ${taskId} (searched ${data.tasks.length} tasks at ${baseUrl})`
              )
            }
            full = summary as unknown as Record<string, unknown>
          }

          if (opts.json) {
            printJson(full)
            return
          }

          // Normalize a few fields that vary between summary (snake_case from
          // /api/sim/tasks) and full TaskDefinition (camelCase from registry).
          const get = (k: string, fallback?: string) =>
            (full[k] ?? full[fallback ?? k]) as unknown
          const title = String(get("title") ?? taskId)
          const site = String(get("site") ?? "—")
          const domain = String(get("domain") ?? "—")
          const difficulty = String(get("difficulty") ?? "—")
          const type = String(get("type") ?? "—")
          const stage = String(
            get("curriculum_stage", "curriculumStage") ?? "—"
          )
          const maxSteps = String(get("max_steps", "maxSteps") ?? "—")
          const tags = (get("tags") as string[] | undefined) ?? []
          const goal = String(get("goal") ?? "")
          const evalChecks =
            (get("evalChecks") as Array<Record<string, unknown>> | undefined) ??
            (get("eval_checks") as
              | Array<Record<string, unknown>>
              | undefined) ??
            []
          const retrievalRubric = get("retrievalRubric") as
            | Record<string, unknown>
            | undefined
          const rewardProfile = get("rewardProfile") as
            | Record<string, unknown>
            | undefined

          process.stdout.write(header(`Task: ${taskId}`))
          process.stdout.write("\n")
          process.stdout.write(
            renderKeyValue([
              ["Title", title],
              ["Site", site],
              ["Domain", domain],
              ["Difficulty", difficulty],
              ["Type", type],
              ["Stage", stage],
              ["Max steps", maxSteps],
              ["Tags", tags.length ? tags.join(", ") : null],
            ])
          )
          process.stdout.write("\n\n")
          process.stdout.write(`  ${c.bold("Goal")}\n`)
          process.stdout.write(`    ${goal}\n\n`)

          if (retrievalRubric) {
            process.stdout.write(`  ${c.bold("Retrieval rubric")}\n`)
            const q = retrievalRubric.question as string | undefined
            const gt = retrievalRubric.groundTruth as string | undefined
            if (q) process.stdout.write(`    Question:    ${q}\n`)
            if (gt) process.stdout.write(`    Ground truth: ${gt}\n`)
            process.stdout.write("\n")
          }

          if (rewardProfile) {
            process.stdout.write(`  ${c.bold("Reward profile")}\n`)
            for (const [k, v] of Object.entries(rewardProfile)) {
              process.stdout.write(`    ${k}: ${String(v)}\n`)
            }
            process.stdout.write("\n")
          }

          process.stdout.write(
            `  ${c.bold(`Eval checks (${evalChecks.length})`)}\n`
          )
          if (evalChecks.length === 0) {
            process.stdout.write(
              muted("    (none — judged by retrieval rubric only)\n")
            )
          } else {
            for (const [i, check] of evalChecks.entries()) {
              process.stdout.write(
                `    ${i + 1}. ${String(check.predicate ?? check.type ?? "check")}` +
                  (check.weight ? ` (weight ${check.weight})` : "") +
                  "\n"
              )
              if (check.args) {
                process.stdout.write(
                  `       args: ${JSON.stringify(check.args)}\n`
                )
              }
            }
          }
        }
      )
    )
}
