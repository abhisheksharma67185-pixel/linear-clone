import { IconCheck, IconCircleDot, IconClock } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ThreadStatus } from "@/app/lib/mock-data"

const STATUS_LABEL: Record<ThreadStatus, string> = {
  open: "Open",
  snoozed: "Snoozed",
  done: "Done",
}

/**
 * Status pill — soft, monochrome by default, with semantic-color accents
 * for done (emerald) and snoozed (amber). Open stays neutral, like Linear.
 */
export function StatusPill({
  status,
  className,
}: {
  status: ThreadStatus
  className?: string
}) {
  const Icon =
    status === "done"
      ? IconCheck
      : status === "snoozed"
        ? IconClock
        : IconCircleDot
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full border-border/60 bg-muted/30 font-normal",
        status === "done" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "snoozed" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        className
      )}
    >
      <Icon className="size-3" />
      {STATUS_LABEL[status]}
    </Badge>
  )
}
