// Pure helpers for the Project labels page. Kept outside the component file so
// they can be unit-tested without a DOM.

export type ProjectLabelScope = "workspace" | "archived"

export function parseScope(value: string | null): ProjectLabelScope {
  return value === "archived" ? "archived" : "workspace"
}

export type SortDir = "asc" | "desc"

export type ProjectLabelRow = {
  id: string
  name: string
  description?: string
  archivedAt?: string | null
  createdAt?: string
}

/**
 * Apply the Project labels table's scope + filter + sort in one pass.
 * Mirrored in a unit test to enforce UI behavior.
 */
export function applyTableQuery<T extends ProjectLabelRow>(
  rows: T[],
  opts: { term: string; scope: ProjectLabelScope; sortDir: SortDir }
): T[] {
  const q = opts.term.trim().toLowerCase()
  return rows
    .filter((r) => {
      const archived = Boolean(r.archivedAt)
      if (opts.scope === "archived" && !archived) return false
      if (opts.scope === "workspace" && archived) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        (typeof r.description === "string" &&
          r.description.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return opts.sortDir === "asc" ? cmp : -cmp
    })
}

/**
 * The empty-state illustration must appear only when there are zero labels in
 * scope *and* no inline draft row is in progress. Extracted so the gating is
 * unit-testable separately from the render tree.
 */
export function shouldShowEmptyState(
  visibleCount: number,
  hasDraft: boolean
): boolean {
  return visibleCount === 0 && !hasDraft
}
