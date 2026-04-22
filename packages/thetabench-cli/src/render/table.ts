// ---------------------------------------------------------------------------
// Thin wrapper around cli-table3 with project-default styling.
// ---------------------------------------------------------------------------

import Table from "cli-table3"
import { c, colorEnabled } from "./colors.js"

export interface TableOptions {
  head: string[]
  /** Per-column widths in characters. Omit to autosize. */
  colWidths?: (number | null)[]
  /** Per-column word-wrap. Defaults to true for all columns. */
  wordWrap?: boolean
}

export function renderTable(
  rows: (string | number | null | undefined)[][],
  options: TableOptions
): string {
  const head = options.head.map((h) => (colorEnabled() ? c.bold(c.cyan(h)) : h))

  const table = new Table({
    head,
    // cli-table3 reads `colWidths[i]` per cell during layout; passing
    // `undefined` makes it crash. Omit the key entirely to let it autosize.
    ...(options.colWidths ? { colWidths: options.colWidths } : {}),
    wordWrap: options.wordWrap ?? true,
    style: {
      head: [], // we already styled
      border: colorEnabled() ? ["gray"] : [],
      "padding-left": 1,
      "padding-right": 1,
    },
  })

  for (const row of rows) {
    table.push(
      row.map((cell) =>
        cell === null || cell === undefined ? "" : String(cell)
      )
    )
  }

  return table.toString()
}

/** Pretty key/value vertical block. */
export function renderKeyValue(
  pairs: [string, string | number | boolean | null | undefined][]
): string {
  const keyWidth = pairs.reduce((m, [k]) => Math.max(m, k.length), 0)
  return pairs
    .map(([k, v]) => {
      const key = c.bold(k.padEnd(keyWidth))
      const val =
        v === null || v === undefined || v === "" ? c.gray("—") : String(v)
      return `  ${key}  ${val}`
    })
    .join("\n")
}
