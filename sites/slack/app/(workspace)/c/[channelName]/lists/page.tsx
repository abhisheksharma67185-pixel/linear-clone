"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { LayoutList, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateListDialog } from "@/components/create-list-dialog"
import { ListTable, type SlackList } from "@/components/list-table"
import { toast } from "sonner"

type Channel = { id: string; name: string }

export default function ChannelListsPage() {
  const params = useParams<{ channelName: string }>()
  const [lists, setLists] = useState<SlackList[]>([])
  const [channel, setChannel] = useState<Channel | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    const c = (await fetch(`/api/data/channels/${params.channelName}`).then(
      (r) => r.json()
    )) as Channel
    setChannel(c)
    const res = await fetch(`/api/data/lists?channelId=${c.id}`)
    if (res.ok) setLists((await res.json()) as SlackList[])
  }, [params.channelName])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const deleteList = async (listId: string, listName: string) => {
    if (!window.confirm(`Delete list "${listName}"?`)) return
    const res = await fetch(`/api/data/lists/${listId}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to delete list")
      return
    }
    toast.success(`Deleted "${listName}"`)
    load()
  }

  return (
    <>
      <SimplePageHeader
        title={`Lists in #${channel?.name ?? ""}`}
        subtitle={`${lists.length} ${lists.length === 1 ? "list" : "lists"}`}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            New list
          </Button>
        }
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4">
          {lists.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-12 text-center">
              <LayoutList className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No lists yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Track work for #{channel?.name ?? "this channel"} with a list.
              </p>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="mt-4"
              >
                <Plus className="size-3.5" />
                Create a list
              </Button>
            </div>
          ) : (
            lists.map((list) => (
              <section
                key={list.id}
                className="rounded-lg border border-border bg-card"
              >
                <header className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
                  <div>
                    <h2 className="font-bold">{list.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {list.items.length}{" "}
                      {list.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label="List actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => deleteList(list.id, list.name)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        Delete list
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </header>
                <div className="p-3">
                  <ListTable list={list} onChange={load} />
                </div>
              </section>
            ))
          )}
        </div>
      </ScrollArea>
      <CreateListDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        channelId={channel?.id ?? null}
        onCreated={load}
      />
    </>
  )
}
