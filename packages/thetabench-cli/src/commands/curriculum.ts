// ---------------------------------------------------------------------------
// `theta curriculum` — build a 10-stage curriculum view from the running site.
// ---------------------------------------------------------------------------

import { Command } from "commander";
import { fetchHealth, fetchTasks } from "../client/api.js";
import { muted } from "../render/colors.js";
import { renderTable } from "../render/table.js";
import { command, header, printJson, resolveBaseUrl } from "../util.js";

export function registerCurriculumCommand(program: Command): void {
  program
    .command("curriculum")
    .description("Show the 10-stage curriculum with task counts per stage")
    .option("--url <site-url>", "Site base URL (default: $THETA_URL or http://localhost:3000)")
    .option("--json", "Output JSON instead of a table")
    .addHelpText("after", `\nExample:\n  $ theta curriculum --url http://localhost:3000\n`)
    .action(
      command(async (opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);

        // Gather tasks + health (health provides stage count for validation).
        const [health, tasksResp] = await Promise.all([
          fetchHealth(baseUrl),
          fetchTasks(baseUrl),
        ]);

        // Bucket tasks by curriculum stage (1..10).
        const byStage = new Map<number, typeof tasksResp.tasks>();
        for (const t of tasksResp.tasks) {
          const bucket = byStage.get(t.curriculum_stage) ?? [];
          bucket.push(t);
          byStage.set(t.curriculum_stage, bucket);
        }

        const stages = Array.from({ length: health.curriculum_stages || 10 }, (_, i) => {
          const stage = i + 1;
          const stageTasks = byStage.get(stage) ?? [];
          const domains = [...new Set(stageTasks.map((t) => t.domain))];
          const difficulties = [...new Set(stageTasks.map((t) => t.difficulty))];
          return {
            stage,
            taskCount: stageTasks.length,
            domains,
            difficulties,
            tasks: stageTasks.map((t) => t.id),
          };
        });

        if (opts.json) {
          printJson({
            site: health.site,
            totalStages: stages.length,
            totalTasks: tasksResp.total,
            stages,
          });
          return;
        }

        process.stdout.write(header(`Curriculum — ${health.site} (${tasksResp.total} tasks)`));
        process.stdout.write("\n");

        const rows = stages.map((s) => [
          s.stage,
          s.taskCount,
          s.domains.join(", ") || muted("—"),
          s.difficulties.join(", ") || muted("—"),
        ]);
        process.stdout.write(
          renderTable(rows, {
            head: ["Stage", "Tasks", "Domains", "Difficulties"],
            colWidths: [8, 8, 40, 28],
          }) + "\n",
        );
      }),
    );
}
