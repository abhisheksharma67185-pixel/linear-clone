"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SimplePageHeader } from "@/components/simple-page-header"
import { UserAvatar } from "@/components/user-avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users } from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
}

type DirectMessage = {
  id: string
  participantIds: string[]
  isGroup: boolean
  lastMessageAt: string
}

const CURRENT_USER_ID = "usr-1"

export default function DmsPage() {
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/data/dms").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([d, u]) => {
      setDms(d)
      setUsers(u)
    })
  }, [])

  return (
    <>
      <SimplePageHeader
        title="Direct messages"
        subtitle={`${dms.length} conversations`}
      />
      <ScrollArea className="flex-1">
        {dms.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No direct messages</EmptyTitle>
              <EmptyDescription>
                Start a conversation from the sidebar.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {dms
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.lastMessageAt).getTime() -
                  new Date(a.lastMessageAt).getTime()
              )
              .map((dm) => {
                const others = dm.participantIds
                  .filter((id) => id !== CURRENT_USER_ID)
                  .map((id) => users.find((u) => u.id === id))
                  .filter((u): u is User => Boolean(u))
                const title = dm.isGroup
                  ? others.map((u) => u.displayName).join(", ")
                  : (others[0]?.name ?? "Unknown")
                return (
                  <Link
                    key={dm.id}
                    href={`/dm/${dm.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
                  >
                    {dm.isGroup ? (
                      <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                        <Users className="size-4" />
                      </span>
                    ) : (
                      <UserAvatar
                        name={others[0]?.name ?? ""}
                        src={others[0]?.avatar}
                        presence={others[0]?.presence}
                        size="md"
                        showPresence
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold text-foreground">
                        {title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dm.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                )
              })}
          </div>
        )}
      </ScrollArea>
    </>
  )
}
