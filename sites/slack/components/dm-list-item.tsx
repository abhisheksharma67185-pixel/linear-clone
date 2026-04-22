"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "./user-avatar"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
}

export function DmListItem({
  dm,
  users,
  currentUserId,
  unreadCount = 0,
}: {
  dm: { id: string; participantIds: string[]; isGroup: boolean }
  users: User[]
  currentUserId: string
  unreadCount?: number
}) {
  const pathname = usePathname()
  const href = `/dm/${dm.id}`
  const isActive = pathname === href

  const others = dm.participantIds
    .filter((id) => id !== currentUserId)
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u))

  const label = dm.isGroup
    ? others.map((u) => u.displayName).join(", ")
    : (others[0]?.name ?? "(Unknown)")
  const isBold = unreadCount > 0 && !isActive

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        size="sm"
        render={
          <Link href={href} className="gap-2">
            {dm.isGroup ? (
              <span className="flex size-5 items-center justify-center rounded-md bg-sidebar-accent">
                <Users className="size-3" />
              </span>
            ) : (
              <UserAvatar
                name={others[0]?.name ?? ""}
                src={others[0]?.avatar}
                presence={others[0]?.presence}
                size="xs"
                className="shrink-0"
              />
            )}
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                isBold && "font-semibold text-sidebar-primary"
              )}
            >
              {label}
              {dm.participantIds.length === 1 &&
              dm.participantIds[0] === currentUserId
                ? " (you)"
                : ""}
            </span>
            {unreadCount > 0 ? (
              <Badge className="h-4 bg-slack-mention-red px-1.5 text-[10px] font-semibold text-white hover:bg-slack-mention-red">
                {unreadCount}
              </Badge>
            ) : null}
          </Link>
        }
      />
    </SidebarMenuItem>
  )
}
