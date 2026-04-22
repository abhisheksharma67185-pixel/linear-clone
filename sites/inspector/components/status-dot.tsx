import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusKind = "ok" | "warn" | "error" | "loading" | "unknown"

const COLOR: Record<StatusKind, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-red-500",
  loading: "bg-muted-foreground/40 animate-pulse",
  unknown: "bg-muted-foreground/40",
}

const RING: Record<StatusKind, string> = {
  ok: "shadow-[0_0_0_3px_rgb(16_185_129_/_0.18)]",
  warn: "shadow-[0_0_0_3px_rgb(245_158_11_/_0.18)]",
  error: "shadow-[0_0_0_3px_rgb(239_68_68_/_0.18)]",
  loading: "",
  unknown: "",
}

export function StatusDot({
  status,
  className,
  label,
}: {
  status: StatusKind
  className?: string
  label?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
      aria-label={label ?? status}
    >
      <span
        className={cn("inline-block size-2.5 rounded-full", COLOR[status], RING[status])}
        aria-hidden
      />
      {label && (
        <span className="text-xs text-muted-foreground capitalize">{label}</span>
      )}
    </span>
  )
}
