"use client";

import { Plus } from "lucide-react";
import { emojiFor } from "./reaction-bar";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  emoji: string;
};

export function ChannelBookmarksBar({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (bookmarks.length === 0) return null;
  return (
    <div className="flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-4 text-xs">
      {bookmarks.map((b) => (
        <a
          key={b.id}
          href={b.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted"
        >
          <span>{emojiFor(b.emoji)}</span>
          <span className="font-medium">{b.title}</span>
        </a>
      ))}
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:bg-muted"
      >
        <Plus className="size-3.5" />
        Add
      </button>
    </div>
  );
}
