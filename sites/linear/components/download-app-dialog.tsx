"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

type Platform = { key: "mac" | "win" | "linux"; label: string; hint: string }

const PLATFORMS: Platform[] = [
  { key: "mac", label: "macOS", hint: "Apple silicon · 116 MB" },
  { key: "win", label: "Windows", hint: "x64 · 132 MB" },
  { key: "linux", label: "Linux", hint: ".deb · .AppImage" },
]

export function DownloadAppDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [started, setStarted] = useState<Platform | null>(null)

  const start = (p: Platform) => {
    setStarted(p)
    setTimeout(() => {
      onOpenChange(false)
      setStarted(null)
    }, 1500)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setStarted(null)
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Download the desktop app</DialogTitle>
          <DialogDescription>
            Get the native app with offline support and keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>

        {started ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-7 text-emerald-500"
            />
            <p className="text-sm font-medium">Preparing download for {started.label}…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => start(p)}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent/50"
              >
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-[11px] text-muted-foreground">{p.hint}</div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Download
                </Button>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
