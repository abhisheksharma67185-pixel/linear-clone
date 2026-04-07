"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminTeamsPage() {
  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Create team</Button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground max-w-3xl">
        Use Atlassian teams to represent real-world teams across your organization. Accurate membership and associations to work will help your organization collaborate more effectively. <button className="text-blue-600 hover:underline">Learn more about Teams.</button>
      </p>

      <div className="mb-6 grid grid-cols-2 gap-px rounded-lg border overflow-hidden">
        <div className="p-4"><p className="text-xs text-muted-foreground">Total Teams</p><p className="text-2xl font-bold">0</p></div>
        <div className="border-l p-4"><p className="text-xs text-muted-foreground">Managed Teams</p><p className="text-2xl font-bold">0</p></div>
      </div>

      <div className="mb-4 relative max-w-sm">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <Input placeholder="Search by team name" className="pl-9" />
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
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                No teams found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
