"use client"

import {
  Bookmark,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  Sparkles,
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
import { emojiFor } from "./reaction-bar"
import { toast } from "sonner"

// Three quick-react buttons that appear before the emoji picker, matching
// real Slack. Real Slack picks these from the user's frequently-used set;
// we hardcode three common ones that exist in our emoji catalog.
const QUICK_REACTIONS = [
  { code: ":white_check_mark:", label: "Done" },
  { code: ":eyes:", label: "Eyes on it" },
  { code: ":raised_hands:", label: "Raised hands" },
]

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
      {/* Quick-react row — three pre-set emojis that fire on click. */}
      {QUICK_REACTIONS.map((q) => (
        <Tooltip key={q.code}>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-none text-base"
                onClick={() => onReact(q.code)}
                aria-label={q.label}
              >
                <span className="leading-none">{emojiFor(q.code)}</span>
              </Button>
            }
          />
          <TooltipContent>{q.label}</TooltipContent>
        </Tooltip>
      ))}

      {/* Full emoji picker — can't be wrapped in TooltipTrigger render
          (double render-prop breaks ref forwarding to Popover.Trigger
          and the popover loses its anchor). Use a native title attr. */}
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

      {/* AI / sparkles — real Slack opens summarize / quick-actions menu.
          Decorative for our mock; surfaces a toast hint. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none"
              onClick={() => toast.info("AI assist coming soon")}
              aria-label="AI assist"
            >
              <Sparkles className="size-4" />
            </Button>
          }
        />
        <TooltipContent>AI assist</TooltipContent>
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
