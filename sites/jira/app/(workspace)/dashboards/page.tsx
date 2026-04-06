"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Dashboard {
  id: string
  name: string
  owner: string
  viewers: string
  editors: string
  starredBy: string
}

const defaultDashboards: Dashboard[] = [
  {
    id: "dash-1",
    name: "Default dashboard",
    owner: "",
    viewers: "My organization",
    editors: "Private",
    starredBy: "0 people",
  },
]

export default function DashboardsPage() {
  const [search, setSearch] = useState("")
  const [dashboards] = useState<Dashboard[]>(defaultDashboards)

  const filtered = dashboards.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Create dashboard
        </Button>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder="Search dashboards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 pl-9"
          />
        </div>
        {["Owner", "Space", "Group"].map((label) => (
          <button
            key={label}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            {label}
            <svg className="size-3.5 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8">
                <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 text-xs font-medium">
                  Name
                  <svg className="size-3 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 4l4 4H4z" />
                  </svg>
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium">Owner</TableHead>
              <TableHead className="text-xs font-medium">Viewers</TableHead>
              <TableHead className="text-xs font-medium">Editors</TableHead>
              <TableHead className="text-xs font-medium">Starred by</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((dashboard) => (
              <TableRow key={dashboard.id}>
                <TableCell>
                  <button className="text-muted-foreground hover:text-yellow-500">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </TableCell>
                <TableCell>
                  <button className="font-medium text-blue-600 hover:underline">
                    {dashboard.name}
                  </button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dashboard.owner}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                    </svg>
                    {dashboard.viewers}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {dashboard.editors}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dashboard.starredBy}
                </TableCell>
                <TableCell>
                  <button className="text-muted-foreground hover:text-foreground">
                    <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  No dashboards found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
