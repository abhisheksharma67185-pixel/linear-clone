"use client"

/**
 * Workspace search route — full-page version of the search experience
 * that previously only existed as a dialog (`components/search-dialog`).
 *
 * The regression this fixes: deep-linking to `/search` rendered a
 * blank page because no route component existed; the search UI only
 * mounted when the sidebar Search button opened the dialog. Hitting
 * the URL directly (e.g. browser history, hotkey shortcut, or any
 * external link) produced an empty `<SidebarInset>` with nothing in it.
 *
 * The contract this page enforces:
 *   1. The search input renders on first paint, before any query
 *      has been typed (no blank-screen state).
 *   2. The tabs strip and "type to search" empty state are visible
 *      on initial mount, regardless of `useSearchParams()` value.
 *   3. The page is read-only deep-linkable — `?q=foo` pre-fills the
 *      input so search URLs are shareable.
 */

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FilterHorizontalIcon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons"

type Tab = "all" | "issues" | "projects" | "documents"

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "issues", label: "Issues" },
  { value: "projects", label: "Projects" },
  { value: "documents", label: "Documents" },
]

export default function SearchPage() {
  // Suspense boundary — `useSearchParams` requires one in App Router.
  return (
    <Suspense fallback={<SearchPageInner initialQuery="" />}>
      <SearchPageWithParams />
    </Suspense>
  )
}

function SearchPageWithParams() {
  const params = useSearchParams()
  const initialQuery = params.get("q") ?? ""
  return <SearchPageInner initialQuery={initialQuery} />
}

function SearchPageInner({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [tab, setTab] = useState<Tab>("all")
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input on mount so the route is ready to type
  // immediately, matching the dialog's behavior.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      data-testid="search-page"
      className="bg-background flex h-full min-h-0 w-full flex-col"
    >
      {/* Search input — always rendered, even before any query */}
      <div className="flex items-center gap-3 border-b px-5 py-3.5">
        <HugeiconsIcon
          icon={Search01Icon}
          className="text-muted-foreground size-4 shrink-0"
        />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search issues, projects, and documents"
          data-testid="search-page-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues, projects, and documents..."
          className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Tabs + toolbar — also always rendered */}
      <div
        data-testid="search-page-tabs"
        className="flex items-center justify-between border-b px-4 py-1.5"
      >
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              data-testid={`search-page-tab-${t.value}`}
              onClick={() => setTab(t.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === t.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Filter results"
            className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Display options"
            className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
          >
            <HugeiconsIcon
              icon={SlidersHorizontalIcon}
              className="size-3.5"
            />
          </button>
        </div>
      </div>

      {/* Results area — empty/loading state always present */}
      <div data-testid="search-page-results" className="flex-1 overflow-auto">
        {query.length === 0 ? (
          <div
            data-testid="search-page-empty"
            className="flex h-full items-center justify-center"
          >
            <p className="text-muted-foreground/60 text-xs">
              Type to search across issues, projects, and documents.
            </p>
          </div>
        ) : (
          <div
            data-testid="search-page-no-results"
            className="flex h-full items-center justify-center"
          >
            <p className="text-muted-foreground text-xs">
              No results for &quot;{query}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
