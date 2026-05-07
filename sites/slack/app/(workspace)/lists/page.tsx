"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
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

export default function ListsPage() {
  const [lists, setLists] = useState<SlackList[]>([])
  const [channelsById, setChannelsById] = useState<Record<string, Channel>>({})
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    const [listsRes, channelsRes] = await Promise.all([
      fetch("/api/data/lists").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ])
    setLists(listsRes as SlackList[])
    const byId: Record<string, Channel> = {}
    for (const c of channelsRes as Channel[]) byId[c.id] = c
    setChannelsById(byId)
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const deleteList = async (listId: string, listName: string) => {
    if (!window.confirm(`Delete list "${listName}"? This cannot be undone.`)) {
      return
    }
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
        title="Lists"
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
                Lists track structured work — checklists, projects, OKRs.
              </p>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="mt-4"
              >
                <Plus className="size-3.5" />
                Create your first list
              </Button>
            </div>
          ) : (
            lists.map((list) => {
              const channel = list.channelId
                ? channelsById[list.channelId]
                : null
              return (
                <section
                  key={list.id}
                  className="rounded-lg border border-border bg-card"
                >
                  <header className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
                    <div>
                      <h2 className="font-bold">{list.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {channel ? (
                          <Link
                            href={`/c/${channel.name}/lists`}
                            className="hover:underline"
                          >
                            #{channel.name}
                          </Link>
                        ) : (
                          "Workspace list"
                        )}{" "}
                        · {list.items.length}{" "}
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
              )
            })
          )}
        </div>
      </ScrollArea>
      <CreateListDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        channelId={null}
        onCreated={load}
      />
    </>
  )
}
