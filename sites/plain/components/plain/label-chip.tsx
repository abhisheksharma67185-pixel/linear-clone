import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { Label } from "@/app/lib/mock-data"

const DOT_COLORS: Record<string, string> = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  fuchsia: "bg-fuchsia-500",
  orange: "bg-orange-500",
  slate: "bg-slate-500",
}

/**
 * Label chip — dot + name, monochrome chrome.
 * The dot carries the only color. Compose plenty per row without visual noise.
 */
export function LabelChip({
  label,
  className,
}: {
  label: Label
  className?: string
}) {
  const dot = DOT_COLORS[label.color] ?? "bg-slate-500"
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-md border-border/60 bg-muted/30 px-1.5 font-normal text-foreground/80",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />
      {label.name}
    </Badge>
  )
}
