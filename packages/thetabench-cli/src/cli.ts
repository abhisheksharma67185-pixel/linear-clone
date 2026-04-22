// ---------------------------------------------------------------------------
// `theta` — entry point.
// ---------------------------------------------------------------------------

import { Command } from "commander"
import { registerBaselineCommand } from "./commands/baseline.js"
import { registerCurriculumCommand } from "./commands/curriculum.js"
import { registerDoctorCommand } from "./commands/doctor.js"
import { registerEpisodeCommand } from "./commands/episode.js"
import { registerInteractiveCommand } from "./commands/interactive.js"
import { registerJudgeCommand } from "./commands/judge.js"
import { registerTasksCommand } from "./commands/tasks.js"
import { setColorEnabled } from "./render/colors.js"

const VERSION = "0.1.0"

export function buildProgram(): Command {
  const program = new Command()

  program
    .name("theta")
    .description(
      "ThetaBench CLI — talk to a running site (or the @thetabench/core engine offline) from the terminal."
    )
    .version(VERSION, "-v, --version", "Print CLI version")
    .option("--no-color", "Disable colored output (NO_COLOR=1 also works)")
    .hook("preAction", (thisCommand) => {
      const opts = thisCommand.opts()
      if (opts.color === false) setColorEnabled(false)
    })

  registerTasksCommand(program)
  registerCurriculumCommand(program)
  registerEpisodeCommand(program)
  registerBaselineCommand(program)
  registerJudgeCommand(program)
  registerDoctorCommand(program)
  registerInteractiveCommand(program)

  program.addHelpText(
    "after",
    `\nEnvironment:\n  THETA_URL    Default base URL for site commands (overridden by --url)\n  NO_COLOR     Disable colored output\n  DEBUG=1      Show stack traces on error\n\nQuick start:\n  $ theta doctor --url http://localhost:3000\n  $ theta tasks list --limit 10\n  $ theta interactive\n`
  )

  return program
}

async function main(): Promise<void> {
  const program = buildProgram()
  await program.parseAsync(process.argv)
}

main().catch((e) => {
  process.stderr.write(
    `unexpected error: ${e instanceof Error ? e.message : String(e)}\n`
  )
  if (process.env.DEBUG === "1" && e instanceof Error && e.stack) {
    process.stderr.write(e.stack + "\n")
  }
  process.exit(1)
})
