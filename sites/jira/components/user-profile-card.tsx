"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
}

interface UserProfileCardProps {
  name: string
  email?: string
  initials?: string
  avatarClassName?: string
  size?: "sm" | "md"
}

export function UserProfileCard({
  name,
  email,
  initials,
  avatarClassName,
  size = "md",
}: UserProfileCardProps) {
  const displayInitials = initials || getInitials(name)
  const avatarSize = size === "sm" ? "size-6" : "size-7"

  return (
    <Popover>
      <PopoverTrigger className="rounded-full">
        <Avatar
          className={`${avatarSize} cursor-pointer transition-all hover:ring-2 hover:ring-ring/30 ${avatarClassName ?? ""}`}
        >
          <AvatarFallback className="bg-blue-600 text-[9px] font-semibold text-white">
            {displayInitials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[260px] p-0"
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              {email && (
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="border-t p-1">
          <Link
            href="/home/profile"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <svg
              className="size-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
            </svg>
            View profile
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
