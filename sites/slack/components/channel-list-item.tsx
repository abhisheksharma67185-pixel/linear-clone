"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Hash, Lock, Volume2 } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ChannelListItem({
  channel,
  unreadCount = 0,
  unreadMentions = 0,
}: {
  channel: {
    id: string
    name: string
    type: "public" | "private"
    isArchived: boolean
    isShared?: boolean
  }
  unreadCount?: number
  unreadMentions?: number
}) {
  const pathname = usePathname()
  const href = `/c/${channel.name}`
  const isActive = pathname === href
  const Icon =
    channel.type === "private" ? Lock : channel.isShared ? Volume2 : Hash
  const isBold = unreadCount > 0 && !isActive

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        size="sm"
        render={
          <Link href={href} className="gap-2">
            <Icon className="size-3.5 shrink-0 opacity-80" />
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                isBold && "font-semibold text-sidebar-primary",
                channel.isArchived && "italic opacity-60"
              )}
            >
              {channel.name}
            </span>
            {unreadMentions > 0 ? (
              <Badge className="h-4 bg-slack-mention-red px-1.5 text-[10px] font-semibold text-white hover:bg-slack-mention-red">
                {unreadMentions}
              </Badge>
            ) : null}
          </Link>
        }
      />
    </SidebarMenuItem>
  )
}
