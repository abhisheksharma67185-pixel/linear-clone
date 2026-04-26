import type { Issue } from "@/app/lib/mock-data"

type Status = Issue["status"]
type Priority = Issue["priority"]

export function StatusIcon({
  status,
  className = "size-3.5",
}: {
  status: Status
  className?: string
}) {
  if (status === "backlog") {
    return (
      <span
        className={`border-muted-foreground/60 rounded-full border border-dashed ${className}`}
      />
    )
  }
  if (status === "todo") {
    return (
      <span
        className={`border-muted-foreground/70 rounded-full border ${className}`}
      />
    )
  }
  if (status === "in_progress") {
    return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="#eab308"
          strokeWidth="1.5"
        />
        <path d="M8 8 L8 2 A6 6 0 0 1 13.2 11 Z" fill="#eab308" />
      </svg>
    )
  }
  if (status === "done") {
    return (
      <svg viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="7" fill="#6366f1" />
        <path
          d="M5 8 L7 10 L11 6"
          stroke="white"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <circle cx="8" cy="8" r="7" fill="#9ca3af" />
      <path
        d="M5 5 L11 11 M11 5 L5 11"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PriorityIcon({
  priority,
  className = "size-3.5",
}: {
  priority: Priority
  className?: string
}) {
  if (priority === "none") {
    return (
      <svg
        viewBox="0 0 16 16"
        className={`text-muted-foreground ${className}`}
      >
        <line
          x1="3"
          y1="8"
          x2="5"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="7"
          y1="8"
          x2="9"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="11"
          y1="8"
          x2="13"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (priority === "urgent") {
    return (
      <svg viewBox="0 0 16 16" className={className}>
        <rect x="1" y="1" width="14" height="14" rx="3" fill="#ef4444" />
        <rect x="7.25" y="3.5" width="1.5" height="6" fill="white" />
        <rect x="7.25" y="10.5" width="1.5" height="1.5" fill="white" />
      </svg>
    )
  }
  const heights: Record<string, [number, number, number]> = {
    high: [4, 8, 12],
    medium: [4, 8, 4],
    low: [4, 4, 4],
  }
  const opacity: Record<string, [number, number, number]> = {
    high: [1, 1, 1],
    medium: [1, 1, 0.45],
    low: [1, 0.45, 0.45],
  }
  const h = heights[priority] ?? [4, 4, 4]
  const o = opacity[priority] ?? [1, 1, 1]
  return (
    <svg viewBox="0 0 16 16" className={`text-foreground ${className}`}>
      <rect
        x="2"
        y={14 - h[0]}
        width="3"
        height={h[0]}
        rx="0.5"
        fill="currentColor"
        opacity={o[0]}
      />
      <rect
        x="6.5"
        y={14 - h[1]}
        width="3"
        height={h[1]}
        rx="0.5"
        fill="currentColor"
        opacity={o[1]}
      />
      <rect
        x="11"
        y={14 - h[2]}
        width="3"
        height={h[2]}
        rx="0.5"
        fill="currentColor"
        opacity={o[2]}
      />
    </svg>
  )
}
