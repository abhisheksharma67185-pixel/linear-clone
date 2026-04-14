"use client";

import { useState, type KeyboardEvent } from "react";
import { Bold, Italic, Link as LinkIcon, Paperclip, Send, Smile, Strikethrough, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function Composer({
  placeholder,
  onSend,
  disabled,
  compact,
}: {
  placeholder: string;
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        "m-4 mt-2 flex flex-col rounded-lg border border-border bg-background shadow-sm focus-within:border-primary/40",
        compact && "m-2",
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border px-2 py-1">
        <Button variant="ghost" size="icon" className="size-7">
          <Bold className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7">
          <Italic className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7">
          <Strikethrough className="size-3.5" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Button variant="ghost" size="icon" className="size-7">
          <LinkIcon className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7">
          <Code className="size-3.5" />
        </Button>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[44px] resize-none border-0 px-3 py-2 text-[15px] shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="size-7">
            <Paperclip className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <Smile className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            @
          </Button>
          <Button variant="ghost" size="icon" className="size-7 font-mono">
            /
          </Button>
        </div>
        <Button
          size="sm"
          onClick={submit}
          disabled={!text.trim() || disabled || sending}
          className="h-7 gap-1 rounded px-2"
        >
          <Send className="size-3.5" />
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
