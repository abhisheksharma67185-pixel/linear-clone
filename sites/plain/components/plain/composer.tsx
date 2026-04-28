"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconClock,
  IconPaperclip,
  IconTag,
  IconUserPlus,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Kbd } from "./kbd"

export type ComposerSendAction = "reply" | "reply-snooze" | "reply-done"

export function Composer({
  onSend,
  pending = false,
}: {
  onSend?: (body: string, action: ComposerSendAction) => void
  pending?: boolean
}) {
  const [value, setValue] = React.useState("")
  const [primaryAction, setPrimaryAction] =
    React.useState<ComposerSendAction>("reply")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Track the last pending state we observed so we only clear/refocus once
  // when a send completes (transitions from pending → idle).
  const prevPendingRef = React.useRef(pending)
  React.useEffect(() => {
    if (prevPendingRef.current && !pending) {
      setValue("")
      textareaRef.current?.focus()
    }
    prevPendingRef.current = pending
  }, [pending])

  const send = (action: ComposerSendAction) => {
    if (!value.trim() || pending) return
    onSend?.(value.trim(), action)
    setPrimaryAction(action)
  }

  const primaryLabel =
    primaryAction === "reply"
      ? "Reply"
      : primaryAction === "reply-snooze"
        ? "Reply and snooze"
        : "Reply and done"

  const sendDisabled = !value.trim() || pending

  return (
    <div className="border-t border-border/50 bg-card/30 p-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reply to the customer…"
        rows={3}
        disabled={pending}
        className="min-h-20 resize-none border-border/60 bg-background/60 text-sm focus-visible:border-foreground/30"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            send(primaryAction)
          }
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Add label">
                  <IconTag className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Add label</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Snooze">
                  <IconClock className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Assign">
                  <IconUserPlus className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Assign</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Attach file">
                  <IconPaperclip className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Attach</TooltipContent>
          </Tooltip>
        </div>

        {/* Split-action send button */}
        <div className="inline-flex items-stretch overflow-hidden rounded-md border border-border/60 bg-muted/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => send(primaryAction)}
            disabled={sendDisabled}
            className="h-8 rounded-none border-0 bg-transparent px-3 text-xs font-medium text-foreground hover:bg-muted/70"
          >
            {pending ? "Sending…" : primaryLabel}
            <Kbd className="ml-2">⌘ ⏎</Kbd>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More send options"
                  disabled={pending}
                  className="h-8 w-7 rounded-none border-l border-border/60 bg-transparent hover:bg-muted/70"
                >
                  <IconChevronDown className="size-3" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setPrimaryAction("reply")}>
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPrimaryAction("reply-snooze")}
                >
                  Reply and snooze
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPrimaryAction("reply-done")}
                >
                  Reply and mark done
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Send as internal note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
