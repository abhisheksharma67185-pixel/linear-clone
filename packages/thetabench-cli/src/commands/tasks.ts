// ---------------------------------------------------------------------------
// `theta tasks list` and `theta tasks get`
// ---------------------------------------------------------------------------

import { Command } from "commander";
import { fetchTasks, type TaskListItem } from "../client/api.js";
import { c, muted } from "../render/colors.js";
import { renderKeyValue, renderTable } from "../render/table.js";
import { command, header, parseIntFlag, printJson, resolveBaseUrl, truncate } from "../util.js";

function renderTasksTable(tasks: TaskListItem[]): string {
  const rows = tasks.map((t) => [
    t.id,
    t.site,
    t.domain,
    t.difficulty,
    t.type,
    String(t.curriculum_stage),
    truncate(t.title, 50),
  ]);
  return renderTable(rows, {
    head: ["ID", "Site", "Domain", "Difficulty", "Type", "Stage", "Title"],
    colWidths: [22, 12, 12, 12, 18, 7, 52],
  });
}

export function registerTasksCommand(program: Command): void {
  const tasks = program
    .command("tasks")
    .description("List and inspect ThetaBench tasks");

  tasks
    .command("list")
    .description("List tasks from a running site, optionally filtered")
    .option("--site <name>", "Filter by site (e.g. shopify, jira, linear, slack)")
    .option("--domain <d>", "Filter by domain (e.g. orders, products, retrieval)")
    .option("--difficulty <d>", "Filter by difficulty (easy|medium|hard|expert)")
    .option("--type <t>", "Filter by type (action|retrieval|action_retrieval|no_action)")
    .option("--stage <n>", "Filter by curriculum stage (1-10)")
    .option("--limit <n>", "Maximum rows to display", "100")
    .option("--json", "Output JSON instead of a table")
    .option("--url <site-url>", "Site base URL (default: $THETA_URL or http://localhost:3000)")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta tasks list --url http://localhost:3000 --domain orders --limit 5\n  $ theta tasks list --site shopify --difficulty hard --json\n`,
    )
    .action(
      command(async (opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);
        const limit = parseIntFlag("limit", opts.limit as string | undefined) ?? 100;

        const data = await fetchTasks(baseUrl, {
          site: opts.site as string | undefined,
          domain: opts.domain as string | undefined,
          difficulty: opts.difficulty as string | undefined,
          type: opts.type as string | undefined,
          stage: opts.stage as string | undefined,
        });

        const sliced = data.tasks.slice(0, limit);

        if (opts.json) {
          printJson({ ...data, tasks: sliced, displayed: sliced.length });
          return;
        }

        process.stdout.write(header(`Tasks (${data.filtered}/${data.total})`));
        process.stdout.write("\n");

        if (sliced.length === 0) {
          process.stdout.write(muted("  No tasks match the given filters.\n"));
          return;
        }

        process.stdout.write(renderTasksTable(sliced) + "\n");
        if (data.filtered > sliced.length) {
          process.stdout.write(
            muted(`\nShowing ${sliced.length} of ${data.filtered} matching tasks. Increase --limit to see more.\n`),
          );
        }
      }),
    );

  tasks
    .command("get <task-id>")
    .description("Print a single task definition with its eval checks")
    .option("--url <site-url>", "Site base URL")
    .option("--json", "Output JSON instead of formatted text")
    .addHelpText("after", `\nExample:\n  $ theta tasks get jira-easy-001 --url http://localhost:3000\n`)
    .action(
      command(async (taskId: string, opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);
        const data = await fetchTasks(baseUrl);
        const task = data.tasks.find((t) => t.id === taskId);

        if (!task) {
          throw new Error(`Task not found: ${taskId} (searched ${data.tasks.length} tasks at ${baseUrl})`);
        }

        if (opts.json) {
          printJson(task);
          return;
        }

        process.stdout.write(header(`Task: ${task.id}`));
        process.stdout.write("\n");
        process.stdout.write(
          renderKeyValue([
            ["Title", task.title],
            ["Site", task.site],
            ["Domain", task.domain],
            ["Difficulty", task.difficulty],
            ["Type", task.type],
            ["Stage", task.curriculum_stage],
            ["Max steps", task.max_steps],
            ["Tags", task.tags.length ? task.tags.join(", ") : null],
          ]),
        );
        process.stdout.write("\n\n");
        process.stdout.write(`  ${c.bold("Goal")}\n`);
        process.stdout.write(`    ${task.goal}\n`);
        process.stdout.write(
          `\n${muted("(eval_checks are not exposed by /api/sim/tasks; query the source task definition directly to see them)")}\n`,
        );
      }),
    );
}
