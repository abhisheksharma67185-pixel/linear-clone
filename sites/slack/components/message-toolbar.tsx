"use client"

import {
  Bookmark,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  SmilePlus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EmojiPicker } from "./emoji-picker"

export function MessageToolbar({
  onReact,
  onReplyInThread,
  onSave,
  onForward,
  onEdit,
  onDelete,
  canEdit,
}: {
  // Now receives the picked emoji shortcode rather than no-arg.
  onReact: (emoji: string) => void
  onReplyInThread: () => void
  onSave: () => void
  onForward: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
}) {
  return (
    <div className="absolute -top-4 right-6 hidden items-center rounded-md border border-border bg-background shadow-sm group-hover:flex">
      {/* EmojiPicker can't be wrapped in TooltipTrigger render — the
          double render-prop chain breaks ref forwarding to the inner
          Popover.Trigger, which then can't anchor and pops in the
          top-left corner. Use the native title attr instead. */}
      <EmojiPicker onSelect={onReact}>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-none"
          aria-label="Add reaction"
          title="Add reaction"
        >
          <SmilePlus className="size-4" />
        </Button>
      </EmojiPicker>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none"
              onClick={onReplyInThread}
            >
              <MessageSquare className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Reply in thread</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none"
              onClick={onForward}
            >
              <Share2 className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Forward</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none"
              onClick={onSave}
            >
              <Bookmark className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Save for later</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-7 rounded-none">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {canEdit ? (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit message
            </DropdownMenuItem>
          ) : null}
          {canEdit ? (
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="size-4" />
              Delete message
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem>Mark unread from here</DropdownMenuItem>
          <DropdownMenuItem>Pin to channel</DropdownMenuItem>
          <DropdownMenuItem>Remind me about this</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
