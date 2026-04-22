"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"

type ListField = { id: string; name: string; type: string }
type ListItem = { id: string; values: Record<string, unknown> }
type SlackList = {
  id: string
  name: string
  fields: ListField[]
  items: ListItem[]
}
type Channel = { id: string; name: string }

export default function ChannelListsPage() {
  const params = useParams<{ channelName: string }>()
  const [lists, setLists] = useState<SlackList[]>([])
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    fetch(`/api/data/channels/${params.channelName}`)
      .then((r) => r.json())
      .then(async (c: Channel) => {
        setChannel(c)
        const res = await fetch(`/api/data/lists?channelId=${c.id}`)
        if (res.ok) setLists(await res.json())
      })
  }, [params.channelName])

  return (
    <>
      <SimplePageHeader title={`Lists in #${channel?.name ?? ""}`} />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {lists.length === 0 ? (
            <div className="text-sm text-muted-foreground">No lists yet.</div>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h2 className="mb-2 font-bold">{list.name}</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {list.fields.map((f) => (
                        <th
                          key={f.id}
                          className="px-2 py-1.5 text-left font-semibold text-muted-foreground"
                        >
                          {f.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-0"
                      >
                        {list.fields.map((f) => (
                          <td key={f.id} className="px-2 py-1.5">
                            {String(item.values[f.id] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  )
}
