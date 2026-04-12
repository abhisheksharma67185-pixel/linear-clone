"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const filterDefs = [
  { key: "project", label: "Filter by Project", activeLabel: "Project is", placeholder: "Choose a project", icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>, options: [] as string[] },
  { key: "goal", label: "Goal", activeLabel: "Goal is", placeholder: "Choose a goal", icon: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></>, options: [] as string[] },
  { key: "team", label: "Team", activeLabel: "Team is", placeholder: "Choose a team", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, options: [] as string[] },
  { key: "jobtitle", label: "Job title", activeLabel: "Job title is", placeholder: "Choose a job title", icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>, options: [] as string[] },
  { key: "manager", label: "Manager", activeLabel: "Manager is", placeholder: "Choose a manager", icon: <><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>, options: ["Abhishek Sharma"] },
  { key: "department", label: "Department", activeLabel: "Department is", placeholder: "Choose a department", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, options: [] as string[] },
  { key: "location", label: "Location", activeLabel: "Location is", placeholder: "Choose a location", icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>, options: [] as string[] },
]

const initialPeople = [
  { name: "Abhishek Sharma", initials: "AS", jobTitle: "", manager: "", department: "" },
]

function AddPeopleDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string) => void }) {
  const [input, setInput] = useState("")

  if (!open) return null

  const handleAdd = () => {
    if (input.trim()) {
      input.split(",").forEach((entry) => {
        const name = entry.trim()
        if (name) onAdd(name)
      })
      setInput("")
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add people to Jira</DialogTitle>
        </DialogHeader>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Names or emails <span className="text-red-500">*</span>
          </label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g., Maria, maria@company.com"
            autoFocus
          />

          <p className="mt-3 text-[11px] text-muted-foreground">
            This site is protected by reCAPTCHA and the Google{" "}
            <span className="text-blue-600 underline">Privacy Policy</span> and{" "}
            <span className="text-blue-600 underline">Terms of Service</span> apply.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleAdd} disabled={!input.trim()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PeoplePage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [people, setPeople] = useState(initialPeople)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filterSearch, setFilterSearch] = useState("")
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [colSearch, setColSearch] = useState("")
  const [wrapText, setWrapText] = useState(false)
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    name: true, jobTitle: true, manager: true, department: true, location: false, teams: false,
  })

  const toggleCol = (key: string) => {
    if (key === "name") return
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const columnDefs = [
    { key: "name", label: "Name", alwaysOn: true },
    { key: "jobTitle", label: "Job title" },
    { key: "manager", label: "Manager" },
    { key: "department", label: "Department" },
    { key: "location", label: "Location" },
    { key: "teams", label: "Teams" },
  ]

  const addPerson = (name: string) => {
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    setPeople((prev) => [...prev, { name, initials, jobTitle: "", manager: "", department: "" }])
  }

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => { setCopied(false); setMenuOpen(false) }, 1000)
  }

  const handleExportCSV = () => {
    const csv = "Name,Job title,Manager,Department\n" + filtered.map((p) => `${p.name},${p.jobTitle},${p.manager},${p.department}`).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "people.csv"
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">People</h1>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          Add people
        </Button>
      </div>

      <AddPeopleDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addPerson} />

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people" className="pl-9" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {activeFilter ? (
          (() => {
            const def = filterDefs.find((f) => f.key === activeFilter)!
            const filteredOptions = def.options.filter((o) => o.toLowerCase().includes(filterSearch.toLowerCase()))
            return (
              <div className="relative">
                <button
                  onClick={() => { setActiveFilter(null); setFilterSearch("") }}
                  className="flex items-center gap-1.5 rounded-full border-2 border-blue-600 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{def.icon}</svg>
                  {def.activeLabel}
                  <svg className="size-3.5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <div className="absolute left-0 top-full z-10 mt-1 w-60 rounded-lg border bg-popover shadow-lg">
                  <div className="flex items-center border-b px-3 py-2">
                    <input
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder={def.placeholder}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      autoFocus
                    />
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((opt) => (
                        <button key={opt} onClick={() => { setActiveFilter(null); setFilterSearch("") }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors">
                          <Avatar className="size-5"><AvatarFallback className="bg-blue-600 text-[8px] font-semibold text-white">{opt.split(" ").map((w) => w[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                          {opt}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-center text-sm text-muted-foreground">No options</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })()
        ) : (
          filterDefs.map((f) => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setFilterSearch("") }}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{f.icon}</svg>
              {f.label}
            </button>
          ))
        )}
      </div>

      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">{filtered.length} people</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("grid")}
            className={`rounded p-1.5 transition-colors ${view === "grid" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded p-1.5 transition-colors ${view === "list" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </button>
          {/* Columns dropdown (list view only) */}
          {view === "list" && (
            <div className="relative">
              <button
                onClick={() => { setColumnsOpen(!columnsOpen); setMenuOpen(false) }}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors ${columnsOpen ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent"}`}
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                Columns
              </button>
              {columnsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setColumnsOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover shadow-lg">
                    <div className="flex items-center border-b px-3 py-2">
                      <input value={colSearch} onChange={(e) => setColSearch(e.target.value)} placeholder="Search" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
                      <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {columnDefs.filter((c) => c.label.toLowerCase().includes(colSearch.toLowerCase())).map((col) => (
                        <button
                          key={col.key}
                          onClick={() => { if (!col.alwaysOn) toggleCol(col.key) }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                        >
                          <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                          <span className="flex-1">{col.label}</span>
                          {col.alwaysOn ? (
                            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <div
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${visibleCols[col.key] ? "bg-green-500" : "bg-muted-foreground/30"}`}
                            >
                              <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${visibleCols[col.key] ? "translate-x-4.5" : "translate-x-1"}`} />
                              {visibleCols[col.key] ? (
                                <svg className="absolute left-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                              ) : (
                                <svg className="absolute right-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              )}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => { setMenuOpen(!menuOpen); setColumnsOpen(false) }}
              className={`rounded p-1.5 transition-colors ${menuOpen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border bg-popover py-1 shadow-lg">
                  <button onClick={handleCopyLink} className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors">
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button onClick={handleExportCSV} className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors">
                    Export CSV
                  </button>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">Wrap text</span>
                    <button
                      onClick={() => setWrapText(!wrapText)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${wrapText ? "bg-green-500" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${wrapText ? "translate-x-4.5" : "translate-x-1"}`} />
                      {wrapText ? (
                        <svg className="absolute left-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg className="absolute right-0.5 size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((person) => (
            <div key={person.name} className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 cursor-pointer">
              <Avatar className="size-14 rounded-md">
                <AvatarFallback className="rounded-md bg-blue-600 text-lg font-semibold text-white">{person.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{person.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                {visibleCols.name && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>}
                {visibleCols.jobTitle && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Job title</th>}
                {visibleCols.manager && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Manager</th>}
                {visibleCols.department && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Department</th>}
                {visibleCols.location && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Location</th>}
                {visibleCols.teams && <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Teams</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr key={person.name} className="border-b last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors">
                  {visibleCols.name && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6"><AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">{person.initials}</AvatarFallback></Avatar>
                        <span className={`text-sm ${wrapText ? "" : "truncate max-w-[200px]"}`}>{person.name}</span>
                      </div>
                    </td>
                  )}
                  {visibleCols.jobTitle && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.jobTitle || "—"}</td>}
                  {visibleCols.manager && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.manager || "—"}</td>}
                  {visibleCols.department && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>{person.department || "—"}</td>}
                  {visibleCols.location && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>—</td>}
                  {visibleCols.teams && <td className={`px-4 py-3 text-sm text-muted-foreground ${wrapText ? "" : "truncate max-w-[150px]"}`}>—</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
