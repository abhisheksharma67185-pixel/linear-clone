// ---------------------------------------------------------------------------
// `theta doctor` — ping every standard endpoint and report pass/fail + latency.
// ---------------------------------------------------------------------------

import { Command } from "commander"
import { HttpError, request } from "../client/http.js"
import { c, err as errColor, muted, ok } from "../render/colors.js"
import { renderTable } from "../render/table.js"
import {
  command,
  header,
  printJson,
  resolveBaseUrl,
  truncate,
} from "../util.js"

interface Probe {
  name: string
  method: "GET" | "POST"
  path: string
  /** Endpoints that may legitimately return a non-2xx when there's no active episode. */
  allow4xx?: boolean
  /** Optional body for POST probes — the server must 2xx on this body. */
  body?: unknown
}

const PROBES: Probe[] = [
  { name: "health", method: "GET", path: "api/health" },
  { name: "sim/tasks", method: "GET", path: "api/sim/tasks" },
  { name: "sim/state", method: "GET", path: "api/sim/state" },
  { name: "sim/episode", method: "GET", path: "api/sim/episode" },
  {
    name: "sim/snapshot",
    method: "GET",
    path: "api/sim/snapshot",
    allow4xx: true,
  },
  { name: "sim/leaderboard", method: "GET", path: "api/sim/leaderboard" },
  { name: "rl", method: "GET", path: "api/rl" },
  { name: "rl/action-space", method: "GET", path: "api/rl/action-space" },
]

interface ProbeResult {
  name: string
  ok: boolean
  status: number
  latencyMs: number
  message: string
}

async function probe(baseUrl: string, p: Probe): Promise<ProbeResult> {
  const t0 = Date.now()
  try {
    await request({
      baseUrl,
      path: p.path,
      method: p.method,
      json: p.body,
      timeoutMs: 8_000,
    })
    return {
      name: p.name,
      ok: true,
      status: 200,
      latencyMs: Date.now() - t0,
      message: "",
    }
  } catch (e) {
    const latencyMs = Date.now() - t0
    if (e instanceof HttpError) {
      const okStatus = Boolean(p.allow4xx) && e.status >= 400 && e.status < 500
      return {
        name: p.name,
        ok: okStatus,
        status: e.status,
        latencyMs,
        message: okStatus ? `(expected ${e.status}: ${e.message})` : e.message,
      }
    }
    return {
      name: p.name,
      ok: false,
      status: 0,
      latencyMs,
      message: e instanceof Error ? e.message : String(e),
    }
  }
}

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Ping every standard endpoint and print pass/fail + latency")
    .option(
      "--url <site-url>",
      "Site base URL (default: $THETA_URL or http://localhost:3000)"
    )
    .option("--json", "Output JSON instead of a table")
    .addHelpText(
      "after",
      `\nExample:\n  $ theta doctor --url http://localhost:3000\n`
    )
    .action(
      command(async (opts: Record<string, string | boolean>) => {
        const baseUrl = resolveBaseUrl(opts.url as string | undefined)

        // Skip the human header in --json mode so output is pipe-clean
        // (`theta doctor --json | jq ...` previously broke on the title line).
        if (!opts.json) {
          process.stdout.write(header(`Doctor: ${baseUrl}`))
          process.stdout.write("\n")
        }

        const results = await Promise.all(PROBES.map((p) => probe(baseUrl, p)))

        if (opts.json) {
          printJson({ baseUrl, results })
          process.exitCode = results.every((r) => r.ok) ? 0 : 1
          return
        }

        const rows = results.map((r) => {
          const mark = r.ok ? ok("✓") : errColor("✗")
          return [
            mark,
            r.name,
            r.status === 0 ? muted("—") : String(r.status),
            `${r.latencyMs} ms`,
            truncate(r.message, 60) || muted(r.ok ? "ok" : ""),
          ]
        })
        process.stdout.write(
          renderTable(rows, {
            head: ["", "Endpoint", "Status", "Latency", "Message"],
            colWidths: [4, 22, 10, 12, 62],
          }) + "\n"
        )

        const passed = results.filter((r) => r.ok).length
        const total = results.length
        const summary =
          passed === total
            ? ok(`All ${total} probes passed`)
            : errColor(`${passed}/${total} probes passed`)
        process.stdout.write(`\n  ${c.bold("Summary")}: ${summary}\n`)

        process.exitCode = passed === total ? 0 : 1
      })
    )
}
