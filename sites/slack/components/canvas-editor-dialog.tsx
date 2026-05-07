"use client"

import { useEffect, useRef, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MarkdownToolbar } from "./markdown-toolbar"
import { toast } from "sonner"

type CanvasInput = {
  id?: string
  title: string
  content: string
}

/**
 * Combined create/edit dialog for canvases. Pass `existing` to edit; pass
 * undefined to create a new workspace-level canvas. The toolbar mutates the
 * textarea selection in-place for headings, bold, links, etc.
 */
export function CanvasEditorDialog({
  open,
  onOpenChange,
  existing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  existing?: CanvasInput
  onSaved?: () => void
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    setTitle(existing?.title ?? "")
    setContent(existing?.content ?? "")
  }, [open, existing])
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async () => {
    const trimmed = title.trim()
    if (!trimmed) return
    setLoading(true)
    const res = existing?.id
      ? await fetch(`/api/data/canvases/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed, content }),
        })
      : await fetch("/api/data/canvases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed, content, channelId: null }),
        })
    setLoading(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to save canvas")
      return
    }
    toast.success(existing?.id ? "Canvas saved" : "Canvas created")
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {existing?.id ? "Edit canvas" : "New canvas"}
          </DialogTitle>
          <DialogDescription>
            Canvases are documents that live alongside channels.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="canvas-title">Title</Label>
            <Input
              id="canvas-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Launch checklist"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Content</Label>
            <div className="rounded-md border border-border">
              <MarkdownToolbar
                textareaRef={textareaRef}
                value={content}
                onChange={setContent}
              />
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Section\n\nWrite something…"
                className="min-h-[40vh] resize-none rounded-none border-0 p-3 font-mono text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!title.trim() || loading}>
            {loading
              ? "Saving…"
              : existing?.id
                ? "Save changes"
                : "Create canvas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
