# `@thetabench/cli`

A small Node.js CLI that talks to a running ThetaBench site (or the
`@thetabench/core` engine offline) from the terminal.

It exposes a `theta` binary that can:

- list & inspect tasks, view the curriculum
- start, observe, step, and finish episodes against `/api/sim/*` and `/api/rl`
- run a built-in rule-based baseline agent across tasks and dump a results JSON
- evaluate retrieval rubrics offline against the deterministic matcher
- "doctor" a site by probing every standard endpoint with timings
- drive an interactive REPL for guided episode walkthroughs

## Install

```bash
# Local development (from the monorepo root)
pnpm install
pnpm --filter @thetabench/cli build

# Run from the build output
node packages/thetabench-cli/dist/cli.js --help

# Or, after publishing
pnpm add -g @thetabench/cli
theta --help
```

## Global flags

| Flag           | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `--no-color`   | Disable colored output (`NO_COLOR=1` env var also works).    |
| `-v --version` | Print the CLI version.                                       |
| `--help`       | Show help for any command.                                   |

| Env var      | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `THETA_URL`  | Default base URL for site commands; overridden by `--url`.                 |
| `NO_COLOR`   | Disable colored output.                                                    |
| `DEBUG=1`    | Show stack traces on error (useful when reporting bugs).                   |

## Commands

### `theta tasks list`

List tasks from a running site.

```bash
$ theta tasks list --url http://localhost:3000 --domain orders --limit 5

Tasks (5/120)
─────────────
┌────────────────────┬────────────┬──────────┬────────────┬──────────────────┬───────┬────────────────────────────────────────────────────┐
│ ID                 │ Site       │ Domain   │ Difficulty │ Type             │ Stage │ Title                                              │
├────────────────────┼────────────┼──────────┼────────────┼──────────────────┼───────┼────────────────────────────────────────────────────┤
│ shopify-orders-001 │ shopify    │ orders   │ medium     │ action           │ 4     │ Fulfill order #1234 with tracking                  │
│ ...                                                                                                                                       │
└────────────────────┴────────────┴──────────┴────────────┴──────────────────┴───────┴────────────────────────────────────────────────────┘
```

Filters: `--site`, `--domain`, `--difficulty`, `--type`, `--stage`. Add `--json`
for machine-readable output.

### `theta tasks get <task-id>`

Pretty-print a single task definition.

```bash
$ theta tasks get jira-easy-001 --url http://localhost:3000
```

### `theta curriculum`

Show the 10-stage curriculum and how many tasks live in each stage.

```bash
$ theta curriculum --url http://localhost:3000
```

### `theta episode start <task-id>`

Start a new episode, returning `episode_id` + the task goal + the keys present
in `initial_snapshot`.

```bash
$ theta episode start jira-easy-001 --seed 42
```

### `theta episode observe`

Fetch the current `/api/rl` observation. Combine with `--json` for scripting.

### `theta episode step <action-json>`

Execute one action. The argument must be a JSON object compatible with the site's
action space.

```bash
$ theta episode step '{"action":"navigate","target":"/board"}'
$ theta episode step '{"action":"transition_issue","issueId":"iss-1","status":"done"}'
```

### `theta episode finish [--response <text>]`

Finish the active episode. For retrieval / impossible tasks, supply `--response`.

```bash
$ theta episode finish --response "29.99"
$ theta episode finish    # action-only tasks
```

### `theta baseline run --url <url>`

Run a built-in rule-based agent against tasks. Picks a sensible navigation /
search / respond action each step until `done` or `--max-steps`.

```bash
$ theta baseline run --url http://localhost:3000 --tasks all --limit 5
$ theta baseline run --url http://localhost:3000 --tasks shopify-easy-001,shopify-easy-002
```

Writes a JSON file (default: `./baseline-results.json`) with per-task results.

### `theta judge retrieval`

Test the deterministic retrieval matcher offline (no server needed). Useful for
tuning rubrics.

```bash
$ theta judge retrieval --ground-truth "29.99" --response "$29.99"
$ theta judge retrieval --ground-truth "5" --response "there are 5 open issues" --variations "five,5 issues"
```

Exit code is non-zero on `FAIL` so the command is CI-friendly.

### `theta doctor`

Probe every standard endpoint and report status + latency. Useful for "is the
integration working?" checks.

```bash
$ theta doctor --url http://localhost:3000
```

Exits non-zero if any probe fails.

### `theta interactive`

Guided REPL backed by `@clack/prompts`: pick a task, optionally enter a seed,
then loop: show observation → prompt for action JSON → step → repeat until done,
then prompt for a response and finish.

```bash
$ theta interactive --url http://localhost:3000
```

Type `quit` at the action prompt to break out and finish the episode early.

## Example workflows

### "Evaluate a fresh model on Shopify"

```bash
# in one terminal
pnpm --filter shopify-admin-sim dev      # starts the Shopify site on :3000

# in another
theta doctor --url http://localhost:3000 # sanity-check
theta baseline run \
  --url http://localhost:3000 \
  --tasks all --limit 10 \
  --output baseline-shopify.json
```

### "Interactive episode walkthrough"

```bash
theta interactive --url http://localhost:3000
```

Then follow the prompts.

### "Tune a retrieval task offline"

```bash
theta judge retrieval --ground-truth "29.99" --response "$ 29.99"
theta judge retrieval --ground-truth "29.99" --response "around thirty bucks" --variations "thirty,~30,$30"
```

## Error handling

All HTTP failures are caught at the command boundary and reported with the URL
that failed and the actual status / message — no raw stack traces unless you set
`DEBUG=1`. Network failures (ECONNREFUSED, DNS) get human-readable causes.

## Programmatic API

The package also exposes a typed JS/TS API for embedding the CLI in other
tooling — see `src/index.ts`. Example:

```ts
import { fetchTasks, HttpError } from "@thetabench/cli";

try {
  const { tasks } = await fetchTasks("http://localhost:3000", { domain: "orders" });
  console.log(tasks.length);
} catch (e) {
  if (e instanceof HttpError) console.error(e.url, e.status, e.message);
}
```

## License

MIT.
