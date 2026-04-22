"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"

type SavedItem = {
  id: string
  userId: string
  messageId: string
  reminder: string | null
  createdAt: string
  isCompleted: boolean
}
type Message = { id: string; text: string; authorId: string }
type User = { id: string; name: string }

const CURRENT_USER_ID = "usr-1"

export default function LaterPage() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])

  const load = async () => {
    const [m, u] = await Promise.all([
      fetch("/api/data/messages").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ])
    // Saved items are under read-states-like access via store; we expose via state endpoint
    const state = await fetch("/api/sim/state").then((r) => r.json())
    setItems(
      (state.savedItems as SavedItem[]).filter(
        (s) => s.userId === CURRENT_USER_ID
      )
    )
    setMessages(m)
    setUsers(u)
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const unsave = async (messageId: string) => {
    await fetch(
      `/api/data/messages/${messageId}/save?userId=${CURRENT_USER_ID}`,
      {
        method: "DELETE",
      }
    )
    toast.success("Removed from Later")
    load()
  }

  return (
    <>
      <SimplePageHeader
        title="Later"
        subtitle={`${items.length} items saved`}
      />
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bookmark />
              </EmptyMedia>
              <EmptyTitle>Nothing saved for later</EmptyTitle>
              <EmptyDescription>
                Save any message to come back to it later.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {items.map((item) => {
              const msg = messages.find((m) => m.id === item.messageId)
              const author = users.find((u) => u.id === msg?.authorId)
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={() => unsave(item.messageId)}
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      {author?.name ?? "Unknown"}
                    </span>
                    <span className="text-sm text-foreground">{msg?.text}</span>
                    {item.reminder ? (
                      <span className="text-xs text-muted-foreground">
                        Remind: {new Date(item.reminder).toLocaleString()}
                      </span>
                    ) : null}
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
