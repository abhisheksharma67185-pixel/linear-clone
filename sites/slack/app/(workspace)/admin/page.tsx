"use client"

import { useEffect, useState } from "react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Workspace = {
  name: string
  urlKey: string
  domain: string
  plan: string
  createdAt: string
}

export default function AdminPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [counts, setCounts] = useState<{
    channels: number
    users: number
    messages: number
  }>({
    channels: 0,
    users: 0,
    messages: 0,
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/data/workspace").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/messages").then((r) => r.json()),
    ]).then(([ws, chs, us, msgs]) => {
      setWorkspace(ws)
      setCounts({
        channels: chs.length,
        users: us.length,
        messages: msgs.length,
      })
    })
  }, [])

  return (
    <>
      <SimplePageHeader title="Workspace admin" subtitle={workspace?.domain} />
      <ScrollArea className="flex-1">
        <div className="grid max-w-4xl grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{counts.channels}</CardTitle>
              <CardDescription>Channels</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{counts.users}</CardTitle>
              <CardDescription>Members</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{counts.messages}</CardTitle>
              <CardDescription>Total messages</CardDescription>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Workspace details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Name
                </div>
                <div>{workspace?.name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  URL key
                </div>
                <div>{workspace?.urlKey}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Plan
                </div>
                <div>{workspace?.plan}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Created
                </div>
                <div>
                  {workspace
                    ? new Date(workspace.createdAt).toLocaleDateString()
                    : ""}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  )
}
