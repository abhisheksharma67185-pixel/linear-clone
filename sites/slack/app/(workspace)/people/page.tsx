"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/user-avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type User = {
  id: string
  cessId: string
  name: string
  displayName: string
  email: string
  avatar: string
  title: string
  timezone: string
  status: { emoji: string; text: string; expiresAt: string | null }
  presence: "active" | "away" | "offline" | "dnd"
  role: string
}

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/data/users")
      .then((r) => r.json())
      .then(setUsers)
  }, [])

  const filtered = users.filter((u) =>
    `${u.name} ${u.displayName} ${u.email} ${u.title}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <>
      <SimplePageHeader
        title="People"
        subtitle={`${users.length} members in Theta HQ`}
      />
      <div className="border-b border-border p-4">
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Link
              key={u.id}
              href={`/people/${u.id}`}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-4 hover:bg-muted"
            >
              <UserAvatar
                name={u.name}
                src={u.avatar}
                presence={u.presence}
                size="lg"
                showPresence
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold text-foreground">
                  {u.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {u.title}
                </span>
                {u.status.text ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {u.status.emoji} {u.status.text}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
