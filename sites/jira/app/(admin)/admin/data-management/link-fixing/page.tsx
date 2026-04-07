"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LinkFixingPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Link fixing</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        When you migrate to cloud, links between individual Jira work items or Confluence pages stop working, because they still point at their old destinations. For each app listed here, perform a link update that will fix your links in bulk.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Learn more about link fixing</a>
      </p>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          App
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Status
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>Showing 0 results out of 0 items</span>
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">App</th>
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  Last migrated
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14" />
                    <path d="M19 12l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Last updated</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm italic text-muted-foreground">
                No migrated Atlassian apps yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
