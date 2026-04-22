"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Send, Clock } from "lucide-react"

type Message = {
  id: string
  text: string
  authorId: string
  scheduledFor: string | null
  createdAt: string
  channelId: string | null
}

type Channel = { id: string; name: string }

export default function DraftsPage() {
  const [scheduled, setScheduled] = useState<Message[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  useEffect(() => {
    Promise.all([
      fetch("/api/data/scheduled").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ]).then(([s, c]) => {
      setScheduled(s)
      setChannels(c)
    })
  }, [])

  return (
    <>
      <SimplePageHeader
        title="Drafts & sent"
        subtitle={`${scheduled.length} scheduled`}
      />
      <ScrollArea className="flex-1">
        {scheduled.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Send />
              </EmptyMedia>
              <EmptyTitle>No scheduled messages</EmptyTitle>
              <EmptyDescription>
                Messages you schedule for later delivery will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {scheduled.map((m) => {
              const ch = channels.find((c) => c.id === m.channelId)
              return (
                <div key={m.id} className="flex items-start gap-3 px-4 py-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs text-muted-foreground">
                      Scheduled for{" "}
                      {m.scheduledFor
                        ? new Date(m.scheduledFor).toLocaleString()
                        : "—"}{" "}
                      · {ch ? `#${ch.name}` : "DM"}
                    </span>
                    <span className="text-sm text-foreground">{m.text}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </>
  )
}
