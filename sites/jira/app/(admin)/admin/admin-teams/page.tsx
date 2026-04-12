"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<{ name: string; admin: string; members: number }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (!dialogOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setDialogOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [dialogOpen])

  const handleCreate = () => {
    const name = teamName.trim()
    if (!name) return
    setTeams((prev) => [...prev, { name, admin: "Abhishek Sharma", members: 1 }])
    setDialogOpen(false)
    setTeamName("")
    showToast(`Team "${name}" created successfully`)
  }

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[10000] rounded-lg border bg-background px-4 py-3 shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg className="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          {toast}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setDialogOpen(true)}>Create team</Button>
      </div>

      {/* Create team modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setDialogOpen(false) }}>
          <div className="w-full max-w-md rounded-lg border bg-background shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Create team</h2>
              <p className="mt-1 text-sm text-muted-foreground">Required fields are marked with an asterisk <span className="text-red-500">*</span></p>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team name <span className="text-red-500">*</span></label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }} autoFocus />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button type="button" onClick={() => { setDialogOpen(false); setTeamName("") }} className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
              <button type="button" onClick={handleCreate} disabled={!teamName.trim()} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      <p className="mb-6 text-sm text-muted-foreground max-w-3xl">
        Use Atlassian teams to represent real-world teams across your organization. Accurate membership and associations to work will help your organization collaborate more effectively. <button className="text-blue-600 hover:underline">Learn more about Teams.</button>
      </p>

      <div className="mb-6 grid grid-cols-2 gap-px rounded-lg border overflow-hidden">
        <div className="p-4"><p className="text-xs text-muted-foreground">Total Teams</p><p className="text-2xl font-bold">{teams.length}</p></div>
        <div className="border-l p-4"><p className="text-xs text-muted-foreground">Managed Teams</p><p className="text-2xl font-bold">{teams.length}</p></div>
      </div>

      <div className="mb-4 relative max-w-sm">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Search by team name" className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">Showing results</p>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Team</TableHead>
              <TableHead className="font-medium w-[140px]">Administered by</TableHead>
              <TableHead className="font-medium w-[100px]">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                  No teams found
                </TableCell>
              </TableRow>
            ) : teams.map((t) => (
              <TableRow key={t.name}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.admin}</TableCell>
                <TableCell className="text-sm">{t.members}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
