"use client"

import { useEffect, useState } from "react"
import type { SavedFilter, User } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function FiltersPage() {
  const [filters, setFilters] = useState<SavedFilter[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newJql, setNewJql] = useState("")

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

  const userName = (id: string) =>
    users.find((u) => u.id === id)?.name ?? id

  const handleCreate = async () => {
    if (!newName.trim() || !newJql.trim()) return
    const res = await fetch("/api/data/filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, jql: newJql, owner: "usr-1" }),
    })
    if (res.ok) {
      const created = await res.json()
      setFilters((prev) => [...prev, created])
      setNewName("")
      setNewJql("")
      setOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Filters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved JQL filters for quick issue searches.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            Create Filter
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="filter-name">Name</Label>
                <Input
                  id="filter-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Filter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-jql">JQL</Label>
                <Input
                  id="filter-jql"
                  value={newJql}
                  onChange={(e) => setNewJql(e.target.value)}
                  placeholder='assignee = currentUser() AND status != "Done"'
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filters.map((filter) => (
          <Card key={filter.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {filter.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block text-xs text-muted-foreground bg-muted rounded px-2 py-1.5 mb-3 font-mono break-all">
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
        ))}
      </div>
    </div>
  )
}
