"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export type ListField = {
  id: string
  name: string
  type: "text" | "number" | "status" | "user" | "date"
}

export type ListItem = {
  id: string
  values: Record<string, unknown>
}

export type SlackList = {
  id: string
  name: string
  channelId: string | null
  fields: ListField[]
  items: ListItem[]
}

/**
 * Inline-editable list table. Cells convert to inputs on click; pressing
 * Enter or blurring the input persists via PATCH. The "+ Add row" button
 * appends an empty row that's immediately editable.
 *
 * Local state mirrors `list.items` so edits feel instant; the parent's
 * `onChange` is fired after each successful mutation so it can refetch
 * for canonical state if it wants.
 */
export function ListTable({
  list,
  onChange,
}: {
  list: SlackList
  onChange?: () => void
}) {
  const [items, setItems] = useState<ListItem[]>(list.items)

  // Re-sync when the parent passes a fresh list (after a hard refetch).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setItems(list.items)
  }, [list.items])
  /* eslint-enable react-hooks/set-state-in-effect */

  const persistItem = async (
    itemId: string,
    values: Record<string, unknown>
  ) => {
    const res = await fetch(`/api/data/lists/${list.id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, values }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to update")
      return
    }
    onChange?.()
  }

  const updateLocal = (itemId: string, fieldId: string, value: unknown) => {
    setItems((all) =>
      all.map((it) =>
        it.id === itemId
          ? { ...it, values: { ...it.values, [fieldId]: value } }
          : it
      )
    )
  }

  const handleAddRow = async () => {
    const emptyValues: Record<string, unknown> = {}
    for (const f of list.fields) emptyValues[f.id] = ""
    const res = await fetch(`/api/data/lists/${list.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: emptyValues }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to add row")
      return
    }
    const updated = await res.json()
    if (Array.isArray(updated?.items)) {
      setItems(updated.items as ListItem[])
    }
    onChange?.()
  }

  const handleDeleteRow = async (itemId: string) => {
    const res = await fetch(
      `/api/data/lists/${list.id}/items?itemId=${encodeURIComponent(itemId)}`,
      { method: "DELETE" }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to delete row")
      return
    }
    setItems((all) => all.filter((it) => it.id !== itemId))
    onChange?.()
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            {list.fields.map((f) => (
              <th
                key={f.id}
                className="px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {f.name}
                <span className="ml-2 text-[10px] font-normal opacity-60">
                  {f.type}
                </span>
              </th>
            ))}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={list.fields.length + 1}
                className="px-3 py-6 text-center text-xs text-muted-foreground"
              >
                No items. Click <span className="font-semibold">Add row</span>{" "}
                below.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className="group border-b border-border last:border-0 hover:bg-muted/20"
              >
                {list.fields.map((f) => (
                  <td key={f.id} className="px-1 py-0.5 align-top">
                    <CellEditor
                      field={f}
                      value={item.values[f.id]}
                      onCommit={(v) => {
                        updateLocal(item.id, f.id, v)
                        persistItem(item.id, {
                          ...item.values,
                          [f.id]: v,
                        })
                      }}
                    />
                  </td>
                ))}
                <td className="w-10 px-2 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 opacity-0 group-hover:opacity-100"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteRow(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        Delete row
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
          <tr>
            <td
              colSpan={list.fields.length + 1}
              className="border-t border-border"
            >
              <button
                type="button"
                onClick={handleAddRow}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Add row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function CellEditor({
  field,
  value,
  onCommit,
}: {
  field: ListField
  value: unknown
  onCommit: (v: unknown) => void
}) {
  const [draft, setDraft] = useState<string>(value == null ? "" : String(value))

  // Re-sync when the parent passes a different canonical value.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setDraft(value == null ? "" : String(value))
  }, [value])
  /* eslint-enable react-hooks/set-state-in-effect */

  const commit = () => {
    const original = value == null ? "" : String(value)
    if (draft === original) return
    if (field.type === "number") {
      const n = Number(draft)
      onCommit(Number.isFinite(n) ? n : draft)
      return
    }
    onCommit(draft)
  }

  return (
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          ;(e.currentTarget as HTMLInputElement).blur()
        }
        if (e.key === "Escape") {
          setDraft(value == null ? "" : String(value))
          ;(e.currentTarget as HTMLInputElement).blur()
        }
      }}
      type={field.type === "number" ? "number" : "text"}
      placeholder={field.type === "date" ? "YYYY-MM-DD" : ""}
      className="h-8 border-transparent bg-transparent text-sm shadow-none hover:border-border focus-visible:bg-background"
    />
  )
}
