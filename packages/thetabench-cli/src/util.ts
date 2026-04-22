// ---------------------------------------------------------------------------
// Shared helpers for command implementations.
// ---------------------------------------------------------------------------

import { HttpError, DEFAULT_URL } from "./client/http.js";
import { c, err as errColor, muted } from "./render/colors.js";

/** Resolve the API base URL from a flag or the THETA_URL env var. */
export function resolveBaseUrl(flagUrl?: string): string {
  return flagUrl ?? process.env.THETA_URL ?? DEFAULT_URL;
}

/**
 * Print a friendly error and exit non-zero. Intended as the catch-all at the
 * boundary of every command. Stack traces are suppressed by default; pass
 * `--debug` (DEBUG=1) to show them.
 */
export function reportErrorAndExit(error: unknown): never {
  const debug = process.env.DEBUG === "1" || process.env.DEBUG === "true";

  if (error instanceof HttpError) {
    const tag = error.status === 0 ? "network" : `HTTP ${error.status}`;
    process.stderr.write(`${errColor("error")} (${tag}): ${error.message}\n`);
    process.stderr.write(`  ${muted("URL:")} ${error.url}\n`);
    if (
      error.body &&
      typeof error.body === "object" &&
      !Array.isArray(error.body) &&
      Object.keys(error.body).length > 0
    ) {
      const printable = JSON.stringify(error.body, null, 2);
      // Indent 2 spaces, keep it small
      process.stderr.write(`  ${muted("body:")}\n`);
      for (const line of printable.split("\n").slice(0, 12)) {
        process.stderr.write(`    ${line}\n`);
      }
    }
    if (debug && error.stack) {
      process.stderr.write(`\n${muted(error.stack)}\n`);
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    process.stderr.write(`${errColor("error")}: ${error.message}\n`);
    if (debug && error.stack) {
      process.stderr.write(`\n${muted(error.stack)}\n`);
    }
    process.exit(1);
  }

  process.stderr.write(`${errColor("error")}: ${String(error)}\n`);
  process.exit(1);
}

/** Wrap an async command body so all uncaught errors funnel through `reportErrorAndExit`. */
export function command<A extends unknown[]>(
  fn: (...args: A) => Promise<void> | void,
): (...args: A) => Promise<void> {
  return async (...args: A) => {
    try {
      await fn(...args);
    } catch (e) {
      reportErrorAndExit(e);
    }
  };
}

/** Pretty JSON to stdout. */
export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

/** Truncate a string to maxLen with ellipsis. */
export function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, Math.max(0, maxLen - 1)) + "…";
}

/** Parse `--limit` style integer flags safely. */
export function parseIntFlag(name: string, raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid --${name}: expected non-negative integer, got "${raw}"`);
  }
  return n;
}

/** Format a header line, e.g. for section titles in command output. */
export function header(title: string): string {
  return `\n${c.bold(c.cyan(title))}\n${c.gray("─".repeat(Math.min(title.length, 80)))}`;
}
