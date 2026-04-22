"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

type Canvas = {
  id: string
  title: string
  content: string
  channelId: string | null
  updatedAt: string
}

export default function CanvasesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([])
  useEffect(() => {
    fetch("/api/data/canvases")
      .then((r) => r.json())
      .then(setCanvases)
  }, [])

  return (
    <>
      <SimplePageHeader
        title="Canvases"
        subtitle={`${canvases.length} canvases`}
      />
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {canvases.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="truncate font-bold">{c.title}</span>
              </div>
              <p className="line-clamp-3 text-xs text-muted-foreground">
                {c.content}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Updated {new Date(c.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
