// ---------------------------------------------------------------------------
// `theta episode start|observe|step|finish`
// ---------------------------------------------------------------------------

import { Command } from "commander";
import {
  fetchObservation,
  finishEpisodeRemote,
  startEpisodeRemote,
  stepEnvironment,
} from "../client/api.js";
import { c, muted, ok, warn } from "../render/colors.js";
import { renderKeyValue } from "../render/table.js";
import { command, header, parseIntFlag, printJson, resolveBaseUrl } from "../util.js";

export function registerEpisodeCommand(program: Command): void {
  const episode = program.command("episode").description("Control a running episode");

  episode
    .command("start <task-id>")
    .description("Start a new episode for the given task")
    .option("--seed <n>", "Deterministic seed for task setup")
    .option("--url <site-url>", "Site base URL")
    .option("--json", "Output JSON instead of formatted text")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta episode start jira-easy-001 --seed 42 --url http://localhost:3000\n`,
    )
    .action(
      command(async (taskId: string, opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);
        const seed = parseIntFlag("seed", opts.seed as string | undefined);

        const res = await startEpisodeRemote(baseUrl, { task_id: taskId, seed });

        if (opts.json) {
          printJson(res);
          return;
        }

        process.stdout.write(header(`Episode started: ${res.episode_id}`));
        process.stdout.write("\n");
        process.stdout.write(
          renderKeyValue([
            ["Task", res.task.id],
            ["Title", res.task.title],
            ["Difficulty", res.task.difficulty],
            ["Type", res.task.type],
            ["Max steps", res.task.max_steps],
            ["Stage", res.task.curriculum_stage],
            ["Status", res.status],
          ]),
        );
        process.stdout.write("\n\n");
        process.stdout.write(`  ${c.bold("Goal")}\n`);
        process.stdout.write(`    ${res.task.goal}\n`);

        const snapshotKeys = Object.keys(res.initial_snapshot ?? {});
        process.stdout.write(
          `\n  ${c.bold("Initial snapshot keys")}  ${muted(`(${snapshotKeys.length})`)}\n`,
        );
        process.stdout.write(`    ${snapshotKeys.join(", ") || muted("(empty)")}\n`);
      }),
    );

  episode
    .command("observe")
    .description("Fetch the current RL observation")
    .option("--url <site-url>", "Site base URL")
    .option("--json", "Output JSON (recommended for scripting)")
    .addHelpText("after", `\nExample:\n  $ theta episode observe --url http://localhost:3000 --json\n`)
    .action(
      command(async (opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);
        const res = await fetchObservation(baseUrl);

        if (opts.json) {
          printJson(res);
          return;
        }

        const obs = res.observation ?? {};
        process.stdout.write(header("Observation"));
        process.stdout.write("\n");
        process.stdout.write(
          renderKeyValue([
            ["currentPage", (obs.currentPage as string | undefined) ?? null],
            [
              "availableActions",
              Array.isArray(obs.availableActions) ? obs.availableActions.join(", ") : null,
            ],
            ["stepCount", (obs.stepCount as number | undefined) ?? null],
            ["lastAction", (obs.lastAction as string | undefined) ?? null],
            ["episodeActive", Boolean(res.info?.episodeActive)],
          ]),
        );
        process.stdout.write(`\n\n  ${c.bold("Full observation (JSON)")}\n`);
        process.stdout.write(JSON.stringify(obs, null, 2) + "\n");
      }),
    );

  episode
    .command("step <action-json>")
    .description("Execute one action; <action-json> is e.g. '{\"action\":\"navigate\",\"target\":\"/board\"}'")
    .option("--url <site-url>", "Site base URL")
    .option("--json", "Output JSON instead of formatted text")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta episode step '{"action":"navigate","target":"/board"}'\n  $ theta episode step '{"action":"transition_issue","issueId":"iss-1","status":"done"}'\n`,
    )
    .action(
      command(async (actionJson: string, opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(actionJson);
        } catch (e) {
          throw new Error(
            `Could not parse <action-json> as JSON: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("<action-json> must be a JSON object, e.g. '{\"action\":\"navigate\",\"target\":\"/board\"}'");
        }

        const res = await stepEnvironment(baseUrl, parsed);
        if (opts.json) {
          printJson(res);
          return;
        }

        const rewardStr = res.reward >= 0 ? ok(res.reward.toFixed(4)) : warn(res.reward.toFixed(4));
        process.stdout.write(header("Step result"));
        process.stdout.write("\n");
        process.stdout.write(
          renderKeyValue([
            ["reward", rewardStr],
            ["done", res.done],
            ["truncated", res.truncated],
            ["currentPage", (res.observation.currentPage as string | undefined) ?? null],
            ["lastAction", (res.info?.lastAction as string | undefined) ?? null],
            ["success", res.info?.success as boolean | undefined],
          ]),
        );
        process.stdout.write("\n");
      }),
    );

  episode
    .command("finish")
    .description("Finish the active episode and print final evaluation")
    .option("--response <text>", "Agent response (required for retrieval tasks)")
    .option("--url <site-url>", "Site base URL")
    .option("--json", "Output JSON instead of formatted text")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta episode finish --response "29.99"\n  $ theta episode finish  # for pure action tasks\n`,
    )
    .action(
      command(async (opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined);
        const res = await finishEpisodeRemote(baseUrl, opts.response as string | undefined);

        if (opts.json) {
          printJson(res);
          return;
        }

        const passed = res.eval ? res.eval.passed : undefined;
        const total = res.eval ? res.eval.total : undefined;
        const judge = res.judge_result;

        process.stdout.write(header(`Episode finished: ${res.episode_id}`));
        process.stdout.write("\n");
        process.stdout.write(
          renderKeyValue([
            ["task", res.task_id],
            ["status", res.status],
            ["steps", res.steps],
            ["score", res.score.toFixed(4)],
            ["total reward", res.total_reward.toFixed(4)],
            ["wall time (s)", res.wall_time_seconds.toFixed(2)],
            ["eval checks", passed !== undefined && total !== undefined ? `${passed} / ${total}` : null],
            ["judge", judge ? `${judge.passed ? ok("PASS") : warn("FAIL")} (${judge.matchType})` : null],
          ]),
        );
        process.stdout.write("\n");

        if (res.eval?.checks?.length) {
          process.stdout.write(`  ${c.bold("Check detail")}\n`);
          for (const check of res.eval.checks) {
            const marker = check.passed ? ok("✓") : warn("✗");
            const weight = typeof check.weight === "number" ? ` (w=${check.weight})` : "";
            process.stdout.write(`    ${marker} ${check.message}${muted(weight)}\n`);
          }
          process.stdout.write("\n");
        }
        if (judge) {
          process.stdout.write(`  ${c.bold("Judge reasoning")}\n    ${judge.reasoning}\n\n`);
        }
      }),
    );
}
