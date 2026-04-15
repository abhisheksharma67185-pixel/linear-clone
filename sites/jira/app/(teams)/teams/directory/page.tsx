"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface TeamData {
  id: string
  name: string
  description: string
  members: number
  color: string
}

export default function TeamsDirectoryPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const fetchTeams = () => {
    fetch("/api/data/teams").then((r) => r.json()).then(setTeams).catch(() => {})
  }

  useEffect(() => {
    fetchTeams()
    const onCreated = () => fetchTeams()
    window.addEventListener("team-created", onCreated)
    return () => window.removeEventListener("team-created", onCreated)
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await fetch("/api/data/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
    })
    if (res.ok) {
      const t = await res.json()
      setTeams((prev) => [...prev, t])
      setCreateOpen(false)
      setNewName("")
      setNewDesc("")
    }
  }

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team directory</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setCreateOpen(true)}>
          Create team
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{filteredTeams.length} {filteredTeams.length === 1 ? "team" : "teams"} found</p>

      {filteredTeams.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="group flex flex-col rounded-lg border p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${team.color}`}>
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px] bg-teal-500 text-white font-bold">AS</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{team.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-muted-foreground">Official team</span>
                <svg className="size-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                <span className="text-xs text-muted-foreground">· {team.members} member{team.members !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 size-12 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <h3 className="mb-1 text-sm font-medium">No teams found</h3>
          <p className="text-sm text-muted-foreground">
            Try a different search term or{" "}
            <button className="text-blue-600 hover:underline" onClick={() => setCreateOpen(true)}>create a new team</button>
          </p>
        </div>
      )}

      {/* Create team modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setCreateOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-[440px] rounded-lg border bg-popover shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold">Create a team</h3>
              <button onClick={() => setCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Team name <span className="text-red-500">*</span></label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Marketing" autoFocus onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) handleCreate() }} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this team work on?" rows={3} className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={!newName.trim()} onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
