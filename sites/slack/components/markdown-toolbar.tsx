"use client"

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Action =
  | { kind: "wrap"; before: string; after?: string }
  | { kind: "prefix"; prefix: string }
  | { kind: "link" }

type ToolbarBtn = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  action: Action
}

const BUTTONS: (ToolbarBtn | "separator")[] = [
  {
    icon: Heading1,
    label: "Heading 1",
    action: { kind: "prefix", prefix: "# " },
  },
  {
    icon: Heading2,
    label: "Heading 2",
    action: { kind: "prefix", prefix: "## " },
  },
  "separator",
  { icon: Bold, label: "Bold", action: { kind: "wrap", before: "**" } },
  { icon: Italic, label: "Italic", action: { kind: "wrap", before: "*" } },
  {
    icon: Strikethrough,
    label: "Strike",
    action: { kind: "wrap", before: "~~" },
  },
  { icon: Code, label: "Code", action: { kind: "wrap", before: "`" } },
  "separator",
  {
    icon: List,
    label: "Bulleted list",
    action: { kind: "prefix", prefix: "- " },
  },
  {
    icon: ListOrdered,
    label: "Numbered list",
    action: { kind: "prefix", prefix: "1. " },
  },
  { icon: Quote, label: "Quote", action: { kind: "prefix", prefix: "> " } },
  "separator",
  { icon: LinkIcon, label: "Link", action: { kind: "link" } },
]

/**
 * Compact markdown toolbar used by the canvas editor (and reusable for any
 * other markdown surface). The textarea ref lets us mutate the user's
 * selection in-place: wrap/prefix actions splice markers around the current
 * range and re-focus so typing continues seamlessly.
 */
export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (next: string) => void
}) {
  const apply = (action: Action) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart ?? value.length
    const end = ta.selectionEnd ?? value.length
    const selected = value.slice(start, end) || ""

    let next = value
    let cursorOffset = 0

    if (action.kind === "wrap") {
      const after = action.after ?? action.before
      next = `${value.slice(0, start)}${action.before}${selected}${after}${value.slice(end)}`
      cursorOffset = action.before.length + selected.length + after.length
    } else if (action.kind === "prefix") {
      // Find the start of the line at `start` so the prefix lands at column 0.
      const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1
      next = `${value.slice(0, lineStart)}${action.prefix}${value.slice(lineStart)}`
      cursorOffset = action.prefix.length
    } else if (action.kind === "link") {
      const url = window.prompt("Link URL")
      if (!url) return
      const label = selected || "link"
      next = `${value.slice(0, start)}[${label}](${url})${value.slice(end)}`
      cursorOffset = label.length + url.length + 4
    }

    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + cursorOffset
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1">
      {BUTTONS.map((b, i) => {
        if (b === "separator") {
          return (
            <Separator
              key={`sep-${i}`}
              orientation="vertical"
              className="mx-1 h-4"
            />
          )
        }
        const Icon = b.icon
        return (
          <Button
            key={b.label}
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => apply(b.action)}
            aria-label={b.label}
            title={b.label}
          >
            <Icon className="size-3.5" />
          </Button>
        )
      })}
    </div>
  )
}
