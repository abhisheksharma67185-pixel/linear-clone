"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const BG = "#2A2A2A"
const FG = "#B0B0B0"

const CircularIconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(function CircularIconButton(
  { label, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-[#2A2A2A] text-[#B0B0B0] transition-colors hover:border-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none",
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
      width="16"
      height="16"
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
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="2.5" y1="5" x2="13.5" y2="5" />
      <circle cx="10.5" cy="5" r="1.5" fill={BG} />
      <line x1="2.5" y1="11" x2="13.5" y2="11" />
      <circle cx="5.5" cy="11" r="1.5" fill={BG} />
    </svg>
  )
}

export function CardViewIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
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
      className={cn("flex items-center gap-2", className)}
      style={{ color: FG }}
    >
      {children}
    </div>
  )
}

export { CircularIconButton }
