"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MarkdownToolbar } from "@/components/markdown-toolbar"
import { toast } from "sonner"

type Canvas = {
  id: string
  title: string
  content: string
  createdBy: string
  updatedAt: string
}
type Channel = { id: string; name: string; canvasId: string | null }

export default function ChannelCanvasPage() {
  const params = useParams<{ channelName: string }>()
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState("")
  const [creating, setCreating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch(`/api/data/channels/${params.channelName}`)
      .then((r) => r.json())
      .then(async (c: Channel) => {
        setChannel(c)
        if (c.canvasId) {
          const res = await fetch(`/api/data/canvases/${c.canvasId}`)
          if (res.ok) {
            const canv = (await res.json()) as Canvas
            setCanvas(canv)
            setContent(canv.content)
          }
        }
      })
  }, [params.channelName])
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = async () => {
    if (!canvas) return
    const res = await fetch(`/api/data/canvases/${canvas.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      setCanvas(await res.json())
      setEditing(false)
      toast.success("Canvas saved")
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to save")
    }
  }

  const createCanvas = async () => {
    if (!channel) return
    setCreating(true)
    const res = await fetch("/api/data/canvases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: channel.id,
        title: `${channel.name} canvas`,
        content: `# ${channel.name}\n\nStart writing…`,
      }),
    })
    setCreating(false)
    if (!res.ok) {
      toast.error("Failed to create canvas")
      return
    }
    const c = (await res.json()) as Canvas
    setCanvas(c)
    setContent(c.content)
    setEditing(true)
  }

  return (
    <>
      <SimplePageHeader
        title={canvas?.title ?? "Canvas"}
        subtitle={
          canvas
            ? `Updated ${new Date(canvas.updatedAt).toLocaleDateString()}`
            : undefined
        }
        action={
          canvas ? (
            editing ? (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContent(canvas.content)
                    setEditing(false)
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={save}>
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )
          ) : null
        }
      />
      {canvas ? (
        editing ? (
          <div className="flex flex-1 flex-col">
            <MarkdownToolbar
              textareaRef={textareaRef}
              value={content}
              onChange={setContent}
            />
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[60vh] flex-1 resize-none rounded-none border-0 p-6 font-mono text-sm focus-visible:ring-0"
            />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <article className="prose-canvas mx-auto max-w-3xl p-6 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {canvas.content}
            </article>
          </ScrollArea>
        )
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center text-sm text-muted-foreground">
          <p>This channel has no canvas yet.</p>
          <Button onClick={createCanvas} disabled={creating}>
            {creating ? "Creating…" : "Create canvas"}
          </Button>
        </div>
      )}
    </>
  )
}
