/**
 * Full-route fallback rendered by the workspace layout's Suspense
 * boundary while a new route's content (Server Components, dynamic
 * imports, or async data) is loading. The Suspense boundary is keyed
 * by pathname so the previous route's tree unmounts immediately on
 * navigation — this component is what fills the gap until the new
 * tree paints.
 *
 * Shape: a header row (page title + toolbar buttons) followed by an
 * issue-list-shaped pulse stack. Linear's surfaces are dominated by
 * issue lists, so a list-shaped skeleton reads as "the page you
 * clicked is loading" rather than a generic spinner.
 *
 * Variant: pass `variant="board"` to render kanban-style column
 * placeholders instead of rows, for routes where the destination is a
 * board (e.g. project boards, view boards).
 */
export function RoutePageSkeleton({
  variant = "list",
}: {
  variant?: "list" | "board"
}) {
  return (
    <div
      data-testid="route-page-skeleton"
      data-variant={variant}
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex h-full min-h-0 w-full flex-1 flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-3">
        <div className="bg-muted/40 h-5 w-32 animate-pulse rounded" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/30 size-7 animate-pulse rounded-md"
            />
          ))}
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-2 px-4 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted/30 h-6 w-16 animate-pulse rounded-full"
          />
        ))}
      </div>

      {/* Body */}
      {variant === "board" ? (
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-4">
          {Array.from({ length: 5 }).map((_, c) => (
            <div
              key={c}
              className="flex w-72 shrink-0 flex-col gap-2 rounded-md p-2"
            >
              <div className="bg-muted/30 h-4 w-24 animate-pulse rounded" />
              {Array.from({ length: 3 }).map((_, r) => (
                <div
                  key={r}
                  className="bg-muted/20 h-16 w-full animate-pulse rounded"
                  style={{ animationDelay: `${(c * 3 + r) * 50}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-border min-h-0 flex-1 divide-y overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-6 py-2.5"
              style={{ opacity: 1 - i * 0.08 }}
            >
              <div className="bg-muted/30 h-4 w-14 animate-pulse rounded" />
              <div className="bg-muted/20 h-3 w-12 animate-pulse rounded" />
              <div className="bg-muted/30 h-3 flex-1 animate-pulse rounded" />
              <div className="bg-muted/20 h-4 w-16 animate-pulse rounded" />
              <div className="bg-muted/30 size-6 animate-pulse rounded-full" />
            </li>
          ))}
        </ul>
      )}

      <span className="sr-only">Loading…</span>
    </div>
  )
}
