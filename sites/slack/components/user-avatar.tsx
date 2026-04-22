import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPresenceDot } from "./user-presence-dot"
import { cn } from "@/lib/utils"

type Presence = "active" | "away" | "offline" | "dnd"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function UserAvatar({
  name,
  src,
  presence,
  size = "md",
  showPresence = true,
  className,
}: {
  name: string
  src?: string
  presence?: Presence
  size?: "xs" | "sm" | "md" | "lg"
  showPresence?: boolean
  className?: string
}) {
  const sizeClass = {
    xs: "size-5",
    sm: "size-7",
    md: "size-9",
    lg: "size-12",
  }[size]
  const dotClass = {
    xs: "size-1.5 -right-0 -bottom-0",
    sm: "size-2 -right-0 -bottom-0",
    md: "size-2.5 -right-0.5 -bottom-0.5",
    lg: "size-3 -right-0.5 -bottom-0.5",
  }[size]
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Avatar className={cn(sizeClass, "rounded-md")}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className="rounded-md bg-slack-aubergine text-[10px] font-semibold text-white">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {showPresence && presence ? (
        <UserPresenceDot
          presence={presence}
          className={cn("absolute", dotClass)}
        />
      ) : null}
    </span>
  )
}
