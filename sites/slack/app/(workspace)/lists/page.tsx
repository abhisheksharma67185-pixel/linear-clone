"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutList } from "lucide-react"

type SlackList = {
  id: string
  name: string
  channelId: string | null
  items: unknown[]
}

export default function ListsPage() {
  const [lists, setLists] = useState<SlackList[]>([])
  useEffect(() => {
    fetch("/api/data/lists")
      .then((r) => r.json())
      .then(setLists)
  }, [])

  return (
    <>
      <SimplePageHeader title="Lists" subtitle={`${lists.length} lists`} />
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((l) => (
            <div
              key={l.id}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-4"
            >
              <LayoutList className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-bold">{l.name}</span>
                <span className="text-xs text-muted-foreground">
                  {l.items.length} items
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
