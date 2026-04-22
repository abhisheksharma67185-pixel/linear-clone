// ---------------------------------------------------------------------------
// `theta judge retrieval` — run the deterministic retrieval matcher offline.
//
// Imports `judgeRetrieval` directly from @thetabench/core so no server is
// needed. This is the recommended way to tune a task's `acceptableVariations`
// or sanity-check a ground truth against a set of candidate responses.
// ---------------------------------------------------------------------------

import { Command } from "commander";
import { judgeRetrieval } from "@thetabench/core";
import type { RetrievalRubric } from "@thetabench/core";
import { c, err as errColor, ok } from "../render/colors.js";
import { renderKeyValue } from "../render/table.js";
import { command, printJson } from "../util.js";

export function registerJudgeCommand(program: Command): void {
  const judge = program.command("judge").description("Test rubric scoring offline");

  judge
    .command("retrieval")
    .description("Run the deterministic string matcher against a response")
    .requiredOption("--ground-truth <text>", "Canonical answer")
    .requiredOption("--response <text>", "Agent response to grade")
    .option(
      "--variations <comma-separated>",
      "Additional acceptable answers (comma-separated)",
    )
    .option("--question <text>", "The question being answered (for the rubric record)")
    .option("--rubric <text>", "Free-form rubric description")
    .option("--json", "Output JSON instead of formatted text")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta judge retrieval --ground-truth "29.99" --response "$29.99"\n  $ theta judge retrieval --ground-truth "5" --response "there are 5 open issues" --variations "five,5 issues"\n`,
    )
    .action(
      command((opts: Record<string, string | boolean>) => {
        const rubric: RetrievalRubric = {
          question: (opts.question as string | undefined) ?? "",
          groundTruth: opts.groundTruth as string,
          acceptableVariations:
            typeof opts.variations === "string"
              ? opts.variations
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          rubric: (opts.rubric as string | undefined) ?? "Default deterministic match",
        };

        const result = judgeRetrieval(opts.response as string, rubric);

        if (opts.json) {
          printJson({ rubric, result });
          return;
        }

        const verdict = result.passed ? ok("PASS") : errColor("FAIL");
        process.stdout.write(
          `\n${c.bold("Retrieval judgement")}: ${verdict}  (matchType: ${result.matchType})\n\n`,
        );
        process.stdout.write(
          renderKeyValue([
            ["ground truth", rubric.groundTruth],
            ["response", opts.response as string],
            ["variations", rubric.acceptableVariations.join(", ") || null],
            ["reasoning", result.reasoning],
          ]) + "\n\n",
        );

        // Non-zero exit when the judgement fails, so this can be used in CI.
        if (!result.passed) process.exitCode = 1;
      }),
    );
}
