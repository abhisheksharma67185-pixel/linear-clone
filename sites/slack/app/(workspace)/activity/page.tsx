"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  AtSign,
  Bell,
  Heart,
  MessageSquare,
  Users,
  Grid3x3,
} from "lucide-react"
import { toast } from "sonner"

type Notification = {
  id: string
  type:
    | "mention"
    | "dm"
    | "thread_reply"
    | "keyword"
    | "channel_invite"
    | "reaction"
    | "huddle_invite"
  channelId: string | null
  dmId: string | null
  messageId: string
  read: boolean
  createdAt: string
}

const CURRENT_USER_ID = "usr-1"
const ICONS = {
  mention: AtSign,
  dm: MessageSquare,
  thread_reply: MessageSquare,
  keyword: Bell,
  channel_invite: Users,
  reaction: Heart,
  huddle_invite: Grid3x3,
}

export default function ActivityPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])

  const load = async () => {
    const n = await fetch(
      `/api/data/notifications?userId=${CURRENT_USER_ID}`
    ).then((r) => r.json())
    setNotifs(n)
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const byType = (t: Notification["type"] | "all") =>
    t === "all" ? notifs : notifs.filter((n) => n.type === t)

  const markAll = async () => {
    await fetch(`/api/data/notifications?userId=${CURRENT_USER_ID}`, {
      method: "PATCH",
    })
    toast.success("All read")
    load()
  }

  return (
    <>
      <SimplePageHeader
        title="Activity"
        subtitle={`${notifs.filter((n) => !n.read).length} unread`}
        action={
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all read
          </Button>
        }
      />
      <Tabs defaultValue="all" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit rounded-none border-b bg-transparent px-4">
          <TabsTrigger value="all">All ({notifs.length})</TabsTrigger>
          <TabsTrigger value="mention">Mentions</TabsTrigger>
          <TabsTrigger value="thread_reply">Threads</TabsTrigger>
          <TabsTrigger value="reaction">Reactions</TabsTrigger>
          <TabsTrigger value="dm">DMs</TabsTrigger>
        </TabsList>
        {(["all", "mention", "thread_reply", "reaction", "dm"] as const).map(
          (tab) => (
            <TabsContent key={tab} value={tab} className="flex-1">
              <ScrollArea className="h-full">
                <div className="flex flex-col divide-y divide-border">
                  {byType(tab).length === 0 ? (
                    <div className="p-12 text-center text-sm text-muted-foreground">
                      Nothing here.
                    </div>
                  ) : (
                    byType(tab).map((n) => {
                      const Icon = ICONS[n.type]
                      return (
                        <div
                          key={n.id}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            n.read ? "opacity-70" : ""
                          }`}
                        >
                          <Icon className="size-4 text-muted-foreground" />
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm text-foreground capitalize">
                              {n.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {!n.read ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                fetch(`/api/data/notifications/${n.id}`, {
                                  method: "PATCH",
                                }).then(load)
                              }
                            >
                              Mark read
                            </Button>
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )
        )}
      </Tabs>
    </>
  )
}
