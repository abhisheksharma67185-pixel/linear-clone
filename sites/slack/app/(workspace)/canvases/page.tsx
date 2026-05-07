"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { FileText, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CanvasEditorDialog } from "@/components/canvas-editor-dialog"
import { toast } from "sonner"

type Canvas = {
  id: string
  title: string
  content: string
  channelId: string | null
  updatedAt: string
}
type Channel = { id: string; name: string }

export default function CanvasesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Canvas | undefined>(undefined)

  const load = useCallback(async () => {
    const [c, ch] = await Promise.all([
      fetch("/api/data/canvases").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ])
    setCanvases(c as Canvas[])
    setChannels(ch as Channel[])
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const openCreate = () => {
    setEditing(undefined)
    setEditorOpen(true)
  }

  const openEdit = (c: Canvas) => {
    setEditing(c)
    setEditorOpen(true)
  }

  const remove = async (c: Canvas) => {
    if (!window.confirm(`Delete canvas "${c.title}"?`)) return
    const res = await fetch(`/api/data/canvases/${c.id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to delete")
      return
    }
    toast.success(`Deleted "${c.title}"`)
    load()
  }

  const channelLink = (id: string | null) => {
    if (!id) return null
    return channels.find((c) => c.id === id) ?? null
  }

  return (
    <>
      <SimplePageHeader
        title="Canvases"
        subtitle={`${canvases.length} canvases`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-3.5" />
            New canvas
          </Button>
        }
      />
      <ScrollArea className="flex-1">
        {canvases.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No canvases yet</EmptyTitle>
              <EmptyDescription>
                Canvases are docs you can edit alongside channels — onboarding
                guides, runbooks, retros.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {canvases.map((c) => {
              const ch = channelLink(c.channelId)
              return (
                <div
                  key={c.id}
                  className="group flex flex-col gap-2 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="truncate font-bold">{c.title}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto size-7 opacity-0 group-hover:opacity-100"
                            aria-label="Canvas actions"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => remove(c)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="line-clamp-3 text-xs text-muted-foreground">
                    {c.content || "Empty canvas"}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      Updated {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                    {ch ? (
                      <Link
                        href={`/c/${ch.name}/canvas`}
                        className="font-semibold text-primary hover:underline"
                      >
                        Open in #{ch.name}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="font-semibold text-primary hover:underline"
                      >
                        Open
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      <CanvasEditorDialog
        open={editorOpen}
        onOpenChange={(v) => {
          setEditorOpen(v)
          if (!v) setEditing(undefined)
        }}
        existing={editing}
        onSaved={load}
      />
    </>
  )
}
