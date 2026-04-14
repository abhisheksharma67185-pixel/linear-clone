"use client";

import {
  Bookmark,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MessageToolbar({
  onReact,
  onReplyInThread,
  onSave,
  onForward,
  onEdit,
  onDelete,
  canEdit,
}: {
  onReact: () => void;
  onReplyInThread: () => void;
  onSave: () => void;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="absolute -top-4 right-6 hidden items-center rounded-md border border-border bg-background shadow-sm group-hover:flex">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none"
              onClick={onReact}
            >
              <SmilePlus className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Add reaction</TooltipContent>
      </Tooltip>
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
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none"
            >
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
  );
}
