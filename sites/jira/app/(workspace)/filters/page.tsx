"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { SavedFilter, User } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FiltersPage() {
  const [filters, setFilters] = useState<SavedFilter[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/filters").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([f, u]) => {
      setFilters(f)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  const userName = (id: string) => {
    const u = users.find((u) => u.id === id)
    return u?.displayName ?? u?.name ?? id
  }

  const toSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  // If user has custom saved filters, show them
  if (filters.length > 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Filters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your saved filters.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filters.map((filter) => (
            <Link key={filter.id} href={`/filters/${toSlug(filter.name)}`}>
              <Card className="h-full cursor-pointer transition-all hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {filter.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="mb-3 block rounded bg-muted px-2 py-1.5 font-mono text-xs break-all text-muted-foreground">
                    {filter.jql}
                  </code>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Owner:</span>
                    <Badge variant="outline" className="text-[10px]">
                      {userName(filter.owner)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Empty state matching real Jira
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Filters</h1>

      <div className="flex flex-col items-center justify-center py-20">
        {/* Illustration — document with colored dots */}
        <svg className="mb-6 size-32" viewBox="0 0 140 140" fill="none">
          {/* Document body */}
          <rect x="30" y="20" width="80" height="100" rx="6" fill="#E2E8F0" />
          <rect
            x="30"
            y="20"
            width="80"
            height="100"
            rx="6"
            stroke="#CBD5E1"
            strokeWidth="1"
          />

          {/* Document header bar */}
          <rect x="30" y="20" width="80" height="24" rx="6" fill="#DBEAFE" />
          <rect x="30" y="38" width="80" height="6" fill="#DBEAFE" />

          {/* Colored dots in header */}
          <circle cx="52" cy="32" r="4" fill="#FBBF24" />
          <circle cx="64" cy="32" r="4" fill="#F97316" />
          <circle cx="76" cy="32" r="4" fill="#3B82F6" />

          {/* Blue accent bar */}
          <rect x="38" y="52" width="8" height="48" rx="2" fill="#3B82F6" />

          {/* Content lines */}
          <rect x="52" y="54" width="48" height="6" rx="2" fill="#CBD5E1" />
          <rect x="52" y="66" width="40" height="6" rx="2" fill="#CBD5E1" />
          <rect x="52" y="78" width="44" height="6" rx="2" fill="#CBD5E1" />
          <rect x="52" y="90" width="36" height="6" rx="2" fill="#CBD5E1" />
        </svg>

        <h2 className="mb-3 text-xl font-semibold">
          You don&apos;t have any filters
        </h2>
        <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
          You can create a filter by searching. Select{" "}
          <span className="font-semibold text-foreground">
            View all work items
          </span>{" "}
          option from the Filters top bar item and enter your search criteria.
          Then, select{" "}
          <span className="font-semibold text-foreground">Save filter</span> to
          create a filter
        </p>
      </div>
    </div>
  )
}
