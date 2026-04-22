// ---------------------------------------------------------------------------
// Color wrapper around picocolors.
//
// picocolors already auto-detects TTY + NO_COLOR, but we expose an explicit
// `colorEnabled` and a `setColorEnabled` so commands like `--json` can force
// uncolored output independently of the terminal.
// ---------------------------------------------------------------------------

import pc from "picocolors";

let _enabled = pc.isColorSupported && process.env.NO_COLOR !== "1";

export function setColorEnabled(enabled: boolean): void {
  _enabled = enabled && pc.isColorSupported && process.env.NO_COLOR !== "1";
}

export function colorEnabled(): boolean {
  return _enabled;
}

type Wrap = (s: string) => string;
const wrap = (fn: Wrap): Wrap => (s: string) => (_enabled ? fn(s) : s);

export const c = {
  bold: wrap(pc.bold),
  dim: wrap(pc.dim),
  italic: wrap(pc.italic),
  underline: wrap(pc.underline),

  red: wrap(pc.red),
  green: wrap(pc.green),
  yellow: wrap(pc.yellow),
  blue: wrap(pc.blue),
  magenta: wrap(pc.magenta),
  cyan: wrap(pc.cyan),
  gray: wrap(pc.gray),
  white: wrap(pc.white),
};

// Semantic helpers
export const ok = (s: string): string => c.green(s);
export const warn = (s: string): string => c.yellow(s);
export const err = (s: string): string => c.red(s);
export const info = (s: string): string => c.cyan(s);
export const muted = (s: string): string => c.gray(s);
export const label = (s: string): string => c.bold(s);
