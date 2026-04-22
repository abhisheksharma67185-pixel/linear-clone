"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const filterApps = [
  {
    name: "Projects",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-pink-100 dark:bg-pink-900/30">
        <svg
          className="size-3.5 text-pink-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Goals",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30">
        <svg
          className="size-3.5 text-purple-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    ),
  },
  {
    name: "Teams",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-teal-100 dark:bg-teal-900/30">
        <svg
          className="size-3.5 text-teal-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
    ),
  },
  {
    name: "Filters",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
        <svg
          className="size-3.5 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </div>
    ),
  },
  {
    name: "Dashboards",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-green-100 dark:bg-green-900/30">
        <svg
          className="size-3.5 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
    ),
  },
]

type StarredItem = {
  id: string
  name: string
  description: string
  href: string
  app: string
  typeIcon: React.ReactNode
}

const initialStarredItems: StarredItem[] = [
  {
    id: "proj-scrum",
    name: "SCRUM Project",
    description: "Software project - 14 issues",
    href: "/projects/SCRUM/board",
    app: "Projects",
    typeIcon: (
      <div className="flex size-8 items-center justify-center rounded bg-pink-100 dark:bg-pink-900/30">
        <svg
          className="size-4 text-pink-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
  {
    id: "filter-open",
    name: "My open work items",
    description: "Filter - Shows all unresolved issues assigned to you",
    href: "/filters/my-open-work-items",
    app: "Filters",
    typeIcon: (
      <div className="flex size-8 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
        <svg
          className="size-4 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </div>
    ),
  },
  {
    id: "dash-default",
    name: "Default dashboard",
    description: "Dashboard - Team overview and sprint progress",
    href: "/dashboards/dash-1",
    app: "Dashboards",
    typeIcon: (
      <div className="flex size-8 items-center justify-center rounded bg-green-100 dark:bg-green-900/30">
        <svg
          className="size-4 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
    ),
  },
  {
    id: "goal-v2",
    name: "Launch v2.0 by Q3",
    description: "Goal - 42% complete across 3 projects",
    href: "/goals",
    app: "Goals",
    typeIcon: (
      <div className="flex size-8 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30">
        <svg
          className="size-4 text-purple-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    ),
  },
  {
    id: "proj-design",
    name: "Design System",
    description: "Software project - 8 issues",
    href: "/projects/SCRUM/board",
    app: "Projects",
    typeIcon: (
      <div className="flex size-8 items-center justify-center rounded bg-pink-100 dark:bg-pink-900/30">
        <svg
          className="size-4 text-pink-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
]

export default function StarredPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [starredItems, setStarredItems] =
    useState<StarredItem[]>(initialStarredItems)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filterOpen])

  const filteredItems = starredItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter ? item.app === activeFilter : true
    return matchesSearch && matchesFilter
  })

  function handleUnstar(id: string) {
    setStarredItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Starred</h1>

      {/* Search + Filter */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative w-56">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder="Search by title"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative" ref={filterRef}>
          {activeFilter ? (
            <button
              onClick={() => setActiveFilter(null)}
              className="flex items-center gap-1.5 rounded-md border-2 border-blue-600 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              App is {activeFilter}
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Filter by app
            </button>
          )}

          {filterOpen && (
            <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border bg-background py-1 shadow-lg">
              {filterApps.map((app) => (
                <button
                  key={app.name}
                  onClick={() => {
                    setActiveFilter(app.name)
                    setFilterOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {app.icon}
                  {app.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Starred items list */}
      {filteredItems.length > 0 ? (
        <div className="flex flex-col divide-y rounded-lg border">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
            >
              {/* Filled star */}
              <svg
                className="size-5 shrink-0 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>

              {/* Type icon */}
              {item.typeIcon}

              {/* Name + description */}
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground group-hover:text-blue-600">
                  {item.name}
                </span>
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>

              {/* Unstar button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleUnstar(item.id)
                }}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-yellow-500"
                title="Remove star"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="mb-4 size-12 text-muted-foreground/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p className="text-sm text-muted-foreground">
            {searchQuery || activeFilter
              ? "No starred items match your search or filter."
              : "You haven't starred anything yet."}
          </p>
        </div>
      )}
    </div>
  )
}
