"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const filterButtons = ["Filter by Project", "Goal", "Team", "Job title", "Manager", "Department", "Location"]

export default function PeoplePage() {
  const [search, setSearch] = useState("")

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">People</h1>
        <Button variant="outline">Add people</Button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <Input placeholder="Search people" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Filter buttons */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filterButtons.map((label) => (
          <button key={label} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {label === "Filter by Project" && <><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></>}
              {label === "Goal" && <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></>}
              {label === "Team" && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
              {label === "Job title" && <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>}
              {label === "Manager" && <><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>}
              {label === "Department" && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></>}
              {label === "Location" && <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>}
            </svg>
            {label}
          </button>
        ))}
      </div>

      {/* Count + view toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">1 people</p>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md border">
            <button className="bg-accent px-2 py-1">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
            <button className="px-2 py-1 text-muted-foreground hover:bg-accent">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <svg className="size-5" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
          </button>
        </div>
      </div>

      {/* Person card */}
      <div className="flex gap-4">
        <div className="flex w-64 items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
          <Avatar className="size-14">
            <AvatarFallback className="bg-blue-600 text-lg font-semibold text-white">AS</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Abhishek Sharma</span>
        </div>
      </div>
    </div>
  )
}
