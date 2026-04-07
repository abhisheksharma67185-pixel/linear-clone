"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

const filterApps = [
  { name: "Projects", icon: <div className="flex size-6 items-center justify-center rounded bg-pink-100 dark:bg-pink-900/30"><svg className="size-3.5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div> },
  { name: "Goals", icon: <div className="flex size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30"><svg className="size-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg></div> },
  { name: "Teams", icon: <div className="flex size-6 items-center justify-center rounded bg-teal-100 dark:bg-teal-900/30"><svg className="size-3.5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div> },
]

export default function StarredPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filterOpen])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">Starred</h1>

      {/* Search + Filter */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative w-56">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <Input placeholder="Search by title" className="pl-9" />
        </div>

        <div className="relative" ref={filterRef}>
          {activeFilter ? (
            <button
              onClick={() => setActiveFilter(null)}
              className="flex items-center gap-1.5 rounded-md border-2 border-blue-600 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              App is
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          ) : (
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Filter by app
            </button>
          )}

          {filterOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background py-1 shadow-lg">
              {filterApps.map((app) => (
                <button
                  key={app.name}
                  onClick={() => { setActiveFilter(app.name); setFilterOpen(false) }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  {app.icon}
                  {app.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Star/medal illustration */}
        <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="50" r="28" fill="#F5A623" />
          <polygon points="60,30 65,45 80,45 68,54 72,68 60,59 48,68 52,54 40,45 55,45" fill="none" stroke="#333" strokeWidth="2" />
          <polygon points="45,72 60,85 75,72 70,100 60,90 50,100" fill="#2563EB" />
        </svg>

        <h2 className="mb-2 text-lg font-semibold">A little empty, but ready to shine</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Start adding a star to items that are important to you like pages, blogs, projects, and goals, and you&apos;ll find them here for easy access.
        </p>
      </div>
    </div>
  )
}
