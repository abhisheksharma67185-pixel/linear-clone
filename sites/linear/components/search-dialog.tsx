"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FilterHorizontalIcon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons"

type Tab = "all" | "issues" | "projects" | "documents"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("all")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setTab("all")
    }
  }, [open])

  const tabs: { value: Tab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "issues", label: "Issues" },
    { value: "projects", label: "Projects" },
    { value: "documents", label: "Documents" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-none flex-col gap-0 overflow-hidden p-0"
        style={{
          width: "calc(100vw - var(--sidebar-width, 240px))",
          marginLeft: "auto",
          marginRight: 0,
          transform: "none",
          left: "auto",
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 0,
          height: "100vh",
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-5 py-3.5">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground size-4 shrink-0"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, projects, and documents..."
            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Tabs + toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-1.5">
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tab === t.value
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} className="size-3.5" />
            </button>
            <button
              type="button"
              className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
            >
              <HugeiconsIcon
                icon={SlidersHorizontalIcon}
                className="size-3.5"
              />
            </button>
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-auto">
          {query.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground/50 text-xs">Type to search</p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-xs">
                No results for &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
