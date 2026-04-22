"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Channel = {
  id: string
  name: string
  topic: string
  purpose: string
  type: "public" | "private"
  isArchived: boolean
  postingPermission: "all" | "admins" | "owners"
}

export default function ChannelSettingsPage() {
  const params = useParams<{ channelName: string }>()
  const router = useRouter()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [draft, setDraft] = useState({ name: "", topic: "", purpose: "" })

  useEffect(() => {
    fetch(`/api/data/channels/${params.channelName}`)
      .then((r) => r.json())
      .then((c: Channel) => {
        setChannel(c)
        setDraft({ name: c.name, topic: c.topic, purpose: c.purpose })
      })
  }, [params.channelName])

  const save = async () => {
    if (!channel) return
    const res = await fetch(`/api/data/channels/${channel.name}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const updated = await res.json()
      toast.success("Channel updated")
      if (updated.name !== channel.name)
        router.push(`/c/${updated.name}/settings`)
      else setChannel(updated)
    } else {
      const err = await res.json()
      toast.error(err.error ?? "Failed")
    }
  }

  const archive = async () => {
    if (!channel) return
    if (!window.confirm(`Archive #${channel.name}?`)) return
    const res = await fetch(`/api/data/channels/${channel.name}`, {
      method: "DELETE",
    })
    if (res.ok) {
      toast.success("Channel archived")
      router.push("/c/general")
    } else {
      const err = await res.json()
      toast.error(err.error ?? "Failed")
    }
  }

  if (!channel) return null

  return (
    <>
      <SimplePageHeader title={`Settings for #${channel.name}`} />
      <ScrollArea className="flex-1">
        <div className="flex max-w-xl flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Topic</Label>
            <Input
              value={draft.topic}
              onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Purpose</Label>
            <Textarea
              value={draft.purpose}
              onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>Save changes</Button>
            <Button
              variant="outline"
              onClick={archive}
              disabled={channel.isArchived}
            >
              {channel.isArchived ? "Archived" : "Archive channel"}
            </Button>
          </div>
          <div className="rounded-md border border-border bg-muted/50 p-4 text-sm">
            <div className="font-semibold">Posting permission</div>
            <div className="text-muted-foreground">
              Currently: {channel.postingPermission}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
