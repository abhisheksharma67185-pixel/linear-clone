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
import {
  Github01Icon,
  File01Icon,
  InboxDownloadIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

type Source = {
  key: string
  name: string
  tag: string
}

const SOURCES: Source[] = [
  { key: "jira", name: "Jira", tag: "Cloud / Server" },
  { key: "github", name: "GitHub", tag: "Issues" },
  { key: "asana", name: "Asana", tag: "Tasks" },
  { key: "trello", name: "Trello", tag: "Cards" },
  { key: "shortcut", name: "Shortcut", tag: "Stories" },
  { key: "csv", name: "CSV", tag: "Upload file" },
]

export function ImportIssuesDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [status, setStatus] = useState<{
    source: string
    state: "importing" | "done"
  } | null>(null)

  const start = (source: Source) => {
    setStatus({ source: source.name, state: "importing" })
    setTimeout(() => setStatus({ source: source.name, state: "done" }), 1200)
  }

  const close = () => {
    onOpenChange(false)
    setTimeout(() => setStatus(null), 200)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? onOpenChange(true) : close())}
    >
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Import issues</DialogTitle>
          <DialogDescription>
            Move issues from another tool into your Linear workspace.
          </DialogDescription>
        </DialogHeader>

        {status ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <HugeiconsIcon
              icon={
                status.state === "done"
                  ? CheckmarkCircle02Icon
                  : InboxDownloadIcon
              }
              className={`size-8 ${status.state === "done" ? "text-emerald-500" : "text-muted-foreground"}`}
            />
            <div className="text-center">
              <p className="text-sm font-medium">
                {status.state === "done"
                  ? `Imported from ${status.source}`
                  : `Importing from ${status.source}…`}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {status.state === "done"
                  ? "You can close this dialog."
                  : "This may take a few moments."}
              </p>
            </div>
            {status.state === "done" && (
              <Button onClick={close} className="mt-2">
                Done
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-3">
            {SOURCES.map((source) => (
              <button
                key={source.key}
                type="button"
                onClick={() => start(source)}
                className="bg-card hover:border-foreground/30 hover:bg-accent/50 flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors"
              >
                <SourceIcon source={source.key} />
                <span className="mt-2 text-sm font-medium">{source.name}</span>
                <span className="text-muted-foreground text-[11px]">
                  {source.tag}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SourceIcon({ source }: { source: string }) {
  if (source === "github") {
    return (
      <HugeiconsIcon icon={Github01Icon} className="text-foreground size-5" />
    )
  }
  if (source === "csv") {
    return (
      <HugeiconsIcon
        icon={File01Icon}
        className="text-muted-foreground size-5"
      />
    )
  }
  const color: Record<string, string> = {
    jira: "bg-sky-500",
    asana: "bg-rose-500",
    trello: "bg-indigo-500",
    shortcut: "bg-amber-500",
  }
  return (
    <div
      className={`flex size-5 items-center justify-center rounded text-[9px] font-semibold text-white ${color[source] ?? "bg-muted-foreground"}`}
    >
      {source.slice(0, 2).toUpperCase()}
    </div>
  )
}
