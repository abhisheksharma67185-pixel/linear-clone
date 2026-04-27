"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SlidersHorizontalIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const CircularIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(function CircularIconButton({ label, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 relative flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export function FilterSortIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.25 3a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Zm2.75 3.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
      />
    </svg>
  )
}

export function AdjustmentsIcon() {
  return <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
}

export function VerticalAdjustmentsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2.5C8.11933 2.5 9.06613 3.23584 9.38477 4.25H14.75C15.1642 4.25 15.5 4.58579 15.5 5C15.5 5.41421 15.1642 5.75 14.75 5.75H9.38477C9.06613 6.76416 8.11933 7.5 7 7.5C5.88067 7.5 4.93387 6.76416 4.61523 5.75H2.25C1.83579 5.75 1.5 5.41421 1.5 5C1.5 4.58579 1.83579 4.25 2.25 4.25H4.61523C4.93387 3.23584 5.88067 2.5 7 2.5ZM7 4C6.44772 4 6 4.44772 6 5C6 5.55228 6.44772 6 7 6C7.55228 6 8 5.55228 8 5C8 4.44772 7.55228 4 7 4Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 13.5C8.88067 13.5 7.93387 12.7642 7.61523 11.75H2.25C1.83579 11.75 1.5 11.4142 1.5 11C1.5 10.5858 1.83579 10.25 2.25 10.25H7.61523C7.93387 9.23584 8.88067 8.5 10 8.5C11.1193 8.5 12.0661 9.23584 12.3848 10.25H14.75C15.1642 10.25 15.5 10.5858 15.5 11C15.5 11.4142 15.1642 11.75 14.75 11.75H12.3848C12.0661 12.7642 11.1193 13.5 10 13.5ZM10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12Z"
      />
    </svg>
  )
}

export function CardViewIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.25 2C2.45508 2 1 3.45508 1 5.25V10.75C1 12.5449 2.45508 14 4.25 14H11.75C13.5449 14 15 12.5449 15 10.75V5.25C15 3.45508 13.5449 2 11.75 2H4.25ZM2.5 5.5C2.5 4.39543 3.39543 3.5 4.5 3.5H11.5C12.6046 3.5 13.5 4.39543 13.5 5.5V10.5C13.5 11.6046 12.6046 12.5 11.5 12.5H4.5C3.39543 12.5 2.5 11.6046 2.5 10.5V5.5Z"
      />
      <rect x="10" y="5" width="1.5" height="6" rx="0.75" />
    </svg>
  )
}

export function CircularIconToolbarRoot({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-1.5",
        className
      )}
    >
      {children}
    </div>
  )
}

export { CircularIconButton }
