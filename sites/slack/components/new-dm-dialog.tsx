"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "./user-avatar"
import { toast } from "sonner"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  email?: string
  title?: string
}

const CURRENT_USER_ID = "usr-1"

export function NewDmDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated?: () => void
}) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/data/users")
      .then((r) => r.json())
      .then((u: User[]) => setUsers(u))
      .catch(() => {})
  }, [open])

  // Reset on close so re-opening is clean.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setQuery("")
      setSelected([])
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const candidates = useMemo(() => {
    const selectedIds = new Set(selected.map((u) => u.id))
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => u.id !== CURRENT_USER_ID)
      .filter((u) => !selectedIds.has(u.id))
      .filter((u) => {
        if (!q) return true
        return (
          u.name.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
        )
      })
      .slice(0, 50)
  }, [users, selected, query])

  const submit = async () => {
    if (selected.length === 0) return
    setLoading(true)
    const res = await fetch("/api/data/dms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantIds: [CURRENT_USER_ID, ...selected.map((u) => u.id)],
      }),
    })
    setLoading(false)
    if (res.ok) {
      const dm = await res.json()
      onOpenChange(false)
      onCreated?.()
      router.push(`/dm/${dm.id}`)
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to open conversation")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            Add up to 8 people to start a direct message.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Selected chips + search input */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            {selected.map((u) => (
              <Badge
                key={u.id}
                variant="secondary"
                className="gap-1 py-0.5 pr-1 pl-1.5"
              >
                <span className="text-xs">{u.name}</span>
                <button
                  type="button"
                  className="hover:text-destructive"
                  onClick={() =>
                    setSelected((s) => s.filter((x) => x.id !== u.id))
                  }
                  aria-label={`Remove ${u.name}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" &&
                  query === "" &&
                  selected.length > 0
                ) {
                  setSelected((s) => s.slice(0, -1))
                }
                if (e.key === "Enter" && candidates[0]) {
                  e.preventDefault()
                  if (selected.length < 8) {
                    setSelected((s) => [...s, candidates[0]])
                  }
                  setQuery("")
                }
              }}
              placeholder={
                selected.length === 0 ? "Search by name or email" : ""
              }
              className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {/* Candidate list */}
          <div className="max-h-72 overflow-y-auto rounded-md border border-border">
            {candidates.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                {query ? `No users match "${query}"` : "No more users to add"}
              </p>
            ) : (
              <ul className="py-1">
                {candidates.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      disabled={selected.length >= 8}
                      onClick={() => {
                        setSelected((s) => [...s, u])
                        setQuery("")
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserAvatar
                        name={u.name}
                        src={u.avatar}
                        presence={u.presence}
                        size="sm"
                        showPresence
                      />
                      <span className="min-w-0 flex-1 truncate">{u.name}</span>
                      {u.title ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {u.title}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={selected.length === 0 || loading}>
            {loading
              ? "Opening…"
              : selected.length > 1
                ? "Open group message"
                : "Open conversation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
