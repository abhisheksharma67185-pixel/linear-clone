"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PILL_OPTIONS = [
  { label: "Backlog", active: true },
  { label: "No priority", active: true },
  { label: "Lead", active: false },
  { label: "Members", active: false },
  { label: "Start", active: false },
  { label: "Target", active: false },
  { label: "Labels", active: false },
  { label: "Dependencies", active: false },
]

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("")
  const [summary, setSummary] = useState("")
  const [desc, setDesc] = useState("")

  function handleClose() {
    onOpenChange(false)
    setName("")
    setSummary("")
    setDesc("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-3xl flex-col gap-0 p-0 sm:max-w-3xl"
        style={{ height: "min(82vh, 760px)" }}
      >
        {/* Header breadcrumb */}
        <div className="text-muted-foreground flex items-center gap-1.5 border-b px-5 py-3 text-xs">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
            <svg viewBox="0 0 10 10" className="size-2.5" fill="currentColor">
              <rect x="1" y="1" width="3.5" height="3.5" rx="0.5" />
              <rect x="5.5" y="1" width="3.5" height="3.5" rx="0.5" />
              <rect x="1" y="5.5" width="3.5" height="3.5" rx="0.5" />
              <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.5" />
            </svg>
          </span>
          <span className="text-foreground font-medium">ABH</span>
          <span className="text-muted-foreground/50">›</span>
          <span>New project</span>

          <DialogClose
            render={
              <button
                type="button"
                className="text-muted-foreground hover:bg-muted hover:text-foreground ml-auto flex size-6 items-center justify-center rounded-md"
              />
            }
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="size-3.5"
              strokeWidth={2}
            />
          </DialogClose>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-auto px-8 py-6">
          {/* Project icon */}
          <button
            type="button"
            className="border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border border-dashed"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none">
              <circle
                cx="10"
                cy="10"
                r="7.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              <circle
                cx="10"
                cy="10"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>

          {/* Project name */}
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="text-foreground placeholder:text-muted-foreground/40 mb-2 bg-transparent text-2xl font-medium focus:outline-none"
          />

          {/* Summary */}
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Add a short summary..."
            className="text-muted-foreground placeholder:text-muted-foreground/50 mb-5 bg-transparent text-sm focus:outline-none"
          />

          {/* Attribute pills */}
          <div className="mb-6 flex flex-wrap gap-1.5">
            {PILL_OPTIONS.map((pill) => (
              <button
                key={pill.label}
                type="button"
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  pill.active
                    ? "border-border bg-muted text-foreground"
                    : "border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50"
                }`}
              >
                {pill.label === "Backlog" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <circle
                      cx="6"
                      cy="6"
                      r="4.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="2.5 1.5"
                    />
                  </svg>
                )}
                {pill.label === "No priority" && (
                  <span className="flex gap-[2px]">
                    <span className="block size-[3px] rounded-full bg-current" />
                    <span className="block size-[3px] rounded-full bg-current" />
                    <span className="block size-[3px] rounded-full bg-current" />
                  </span>
                )}
                {pill.label === "Lead" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <circle
                      cx="6"
                      cy="4.5"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M2 10.5c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                  </svg>
                )}
                {pill.label === "Members" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <circle
                      cx="4.5"
                      cy="4.5"
                      r="1.8"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M1 10c0-1.8 1.4-3 3.5-3s3.5 1.2 3.5 3"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <circle
                      cx="8.5"
                      cy="4.5"
                      r="1.5"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M8.5 7.5c1.5 0 2.5 1 2.5 2.5"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                  </svg>
                )}
                {pill.label === "Start" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <rect
                      x="1"
                      y="1.5"
                      width="10"
                      height="9"
                      rx="1.2"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M4 1v1.5M8 1v1.5M1 5h10"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                  </svg>
                )}
                {pill.label === "Target" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <rect
                      x="1"
                      y="1.5"
                      width="10"
                      height="9"
                      rx="1.2"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M4 1v1.5M8 1v1.5M1 5h10"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                  </svg>
                )}
                {pill.label === "Labels" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <path
                      d="M6.5 1.5H9.5C10.1 1.5 10.5 1.9 10.5 2.5V5.5L6 10C5.6 10.4 5 10.4 4.6 10L2 7.4C1.6 7 1.6 6.4 2 6L6.5 1.5Z"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <circle cx="8" cy="4" r="1" fill="currentColor" />
                  </svg>
                )}
                {pill.label === "Dependencies" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <path
                      d="M2 6h4M8 3l2 3-2 3"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="2"
                      cy="6"
                      r="1.2"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                  </svg>
                )}
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Description textarea */}
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Write a description, a project brief, or collect ideas..."
            className="text-foreground placeholder:text-muted-foreground/40 flex-1 resize-none bg-transparent text-sm focus:outline-none"
            rows={8}
          />
        </div>

        {/* Milestones row */}
        <div className="flex items-center justify-between border-t px-8 py-3">
          <span className="text-muted-foreground text-xs font-medium">
            Milestones
          </span>
          <button
            type="button"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-5 items-center justify-center rounded"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full px-4 py-1.5 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            Create project
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
