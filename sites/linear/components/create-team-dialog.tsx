"use client"

import { useEffect, useState } from "react"
import type { Team } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CreateTeamDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (team: Team) => void
}) {
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [keyDirty, setKeyDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setName("")
      setKey("")
      setKeyDirty(false)
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  const autoKey = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase()
  const effectiveKey = keyDirty ? key : autoKey

  const canSubmit = name.trim().length > 0 && effectiveKey.length > 0 && !submitting

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), key: effectiveKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create team")
        setSubmitting(false)
        return
      }
      onCreated(data as Team)
      onOpenChange(false)
    } catch {
      setError("Network error")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create new team</DialogTitle>
          <DialogDescription>
            Teams are where you organize issues, projects, and members.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="team-name" className="text-xs font-medium">
              Team name
            </label>
            <input
              id="team-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design"
              className="h-8 rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="team-key" className="text-xs font-medium">
              Identifier
            </label>
            <input
              id="team-key"
              value={effectiveKey}
              onChange={(e) => {
                setKeyDirty(true)
                setKey(e.target.value.toUpperCase().slice(0, 5))
              }}
              placeholder="DES"
              className="h-8 w-24 rounded-md border bg-transparent px-2 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              Used as the prefix on issue IDs (e.g. {effectiveKey || "ABC"}-123).
            </p>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? "Creating…" : "Create team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
