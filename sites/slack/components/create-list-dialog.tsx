"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type FieldType = "text" | "number" | "status" | "user" | "date"

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "status", label: "Status" },
  { value: "user", label: "Person" },
  { value: "date", label: "Date" },
]

type DraftField = { name: string; type: FieldType }

const DEFAULT_FIELDS: DraftField[] = [
  { name: "Title", type: "text" },
  { name: "Status", type: "status" },
  { name: "Owner", type: "user" },
]

export function CreateListDialog({
  open,
  onOpenChange,
  channelId = null,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  // When opened from a channel page we pre-scope the list; the workspace
  // /lists page passes null so the user creates a workspace-level list.
  channelId?: string | null
  onCreated?: (listId: string) => void
}) {
  const [name, setName] = useState("")
  const [fields, setFields] = useState<DraftField[]>(DEFAULT_FIELDS)
  const [loading, setLoading] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      // Reset on close so reopening is clean.
      setName("")
      setFields(DEFAULT_FIELDS)
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const cleaned = fields
      .map((f) => ({ ...f, name: f.name.trim() }))
      .filter((f) => f.name.length > 0)
    if (cleaned.length === 0) {
      toast.error("Add at least one field")
      return
    }
    setLoading(true)
    const res = await fetch("/api/data/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        channelId,
        fields: cleaned.map((f, i) => ({
          id: `f-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          type: f.type,
        })),
      }),
    })
    setLoading(false)
    if (res.ok) {
      const list = await res.json()
      toast.success(`Created list "${list.name}"`)
      onOpenChange(false)
      onCreated?.(list.id)
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to create list")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a list</DialogTitle>
          <DialogDescription>
            Lists track structured work with custom columns.{" "}
            {channelId
              ? "This list will live in the current channel."
              : "Workspace lists are visible to anyone."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="list-name">Name</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Launch checklist"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFields((f) => [...f, { name: "", type: "text" }])
                }
                className="h-7"
              >
                <Plus className="size-3.5" />
                Add field
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={field.name}
                    onChange={(e) =>
                      setFields((all) =>
                        all.map((f, i) =>
                          i === idx ? { ...f, name: e.target.value } : f
                        )
                      )
                    }
                    placeholder="Column name"
                    className="flex-1"
                  />
                  <Select
                    value={field.type}
                    onValueChange={(v) =>
                      setFields((all) =>
                        all.map((f, i) =>
                          i === idx ? { ...f, type: v as FieldType } : f
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setFields((all) => all.filter((_, i) => i !== idx))
                    }
                    disabled={fields.length === 1}
                    aria-label={`Remove field ${field.name || idx + 1}`}
                    className="size-8"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || loading}>
            {loading ? "Creating…" : "Create list"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
