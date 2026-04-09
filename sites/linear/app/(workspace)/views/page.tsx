"use client"

import { useEffect, useState } from "react"
import type { View, Member } from "@/app/lib/mock-data"
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ViewsPage() {
  const [views, setViews] = useState<View[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const [newName, setNewName] = useState("")
  const [newFilterQuery, setNewFilterQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ]).then(([v, m]) => {
      setViews(v)
      setMembers(m)
      setLoading(false)
    })
  }, [])

  const handleCreate = async () => {
    const res = await fetch("/api/data/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        filterQuery: newFilterQuery,
      }),
    })
    const created = await res.json()
    setViews((prev) => [...prev, created])
    setNewName("")
    setNewFilterQuery("")
    setDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Views</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved filters and custom views.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>New View</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create View</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="view-name">Name</Label>
                <Input
                  id="view-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Custom View"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="view-filter">Filter Query</Label>
                <Input
                  id="view-filter"
                  value={newFilterQuery}
                  onChange={(e) => setNewFilterQuery(e.target.value)}
                  placeholder='status = "in_progress"'
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleCreate} disabled={!newName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {views.length === 0 ? (
        <p className="text-sm text-muted-foreground">No views yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {views.map((view) => {
            const owner = members.find((m) => m.id === view.ownerId)
            return (
              <Card key={view.id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {view.name}
                    </CardTitle>
                    {owner && (
                      <Badge variant="outline" className="text-[10px]">
                        {owner.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {view.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {view.description}
                    </p>
                  )}
                  <pre className="text-xs bg-muted rounded-md p-2 overflow-x-auto">
                    <code>{view.filterQuery}</code>
                  </pre>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
