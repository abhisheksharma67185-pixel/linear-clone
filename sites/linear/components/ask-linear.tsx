"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function AskLinear() {
  return (
    <button
      type="button"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
    >
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
      <span>Ask Linear</span>
    </button>
  )
}
