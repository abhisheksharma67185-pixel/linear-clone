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
}: {
  onSend?: (body: string, action: ComposerSendAction) => void
}) {
  const [value, setValue] = React.useState("")
  const [primaryAction, setPrimaryAction] =
    React.useState<ComposerSendAction>("reply")

  const send = (action: ComposerSendAction) => {
    if (!value.trim()) return
    onSend?.(value.trim(), action)
    setValue("")
    setPrimaryAction(action)
  }

  const primaryLabel =
    primaryAction === "reply"
      ? "Reply"
      : primaryAction === "reply-snooze"
        ? "Reply and snooze"
        : "Reply and done"

  return (
    <div className="border-t border-border/50 bg-card/30 p-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reply to the customer…"
        rows={3}
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
            disabled={!value.trim()}
            className="h-8 rounded-none border-0 bg-transparent px-3 text-xs font-medium text-foreground hover:bg-muted/70"
          >
            {primaryLabel}
            <Kbd className="ml-2">⌘ ⏎</Kbd>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More send options"
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
