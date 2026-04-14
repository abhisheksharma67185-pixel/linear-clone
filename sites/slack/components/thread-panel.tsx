"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageItem } from "./message-item";
import { Composer } from "./composer";
import { useThreadPanel } from "./thread-panel-provider";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  presence: "active" | "away" | "offline" | "dnd";
};

type Message = {
  id: string;
  channelId: string | null;
  dmId: string | null;
  authorId: string;
  text: string;
  reactions: { emoji: string; userIds: string[] }[];
  attachments: { id: string; type: "file" | "image" | "link"; name: string; url: string }[];
  createdAt: string;
  editedAt: string | null;
  isDeleted: boolean;
  threadRootId: string | null;
  threadReplyCount: number;
  threadParticipantIds: string[];
  mentions: string[];
};

const CURRENT_USER_ID = "usr-1";

export function ThreadPanel() {
  const { rootId, close } = useThreadPanel();
  const [root, setRoot] = useState<Message | null>(null);
  const [replies, setReplies] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [broadcast, setBroadcast] = useState(false);

  const load = useCallback(async () => {
    if (!rootId) return;
    const [rootRes, repliesRes, usersRes] = await Promise.all([
      fetch(`/api/data/messages/${rootId}`),
      fetch(`/api/data/messages?threadRootId=${rootId}`),
      fetch("/api/data/users"),
    ]);
    if (rootRes.ok) setRoot(await rootRes.json());
    if (repliesRes.ok) setReplies(await repliesRes.json());
    if (usersRes.ok) setUsers(await usersRes.json());
  }, [rootId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (rootId) {
      load();
    } else {
      setRoot(null);
      setReplies([]);
    }
  }, [rootId, load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!rootId || !root) return null;

  const handleReplySend = async (text: string) => {
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: root.channelId ?? undefined,
        dmId: root.dmId ?? undefined,
        authorId: CURRENT_USER_ID,
        text,
        threadRootId: rootId,
        broadcastToChannel: broadcast,
      }),
    });
    if (res.ok) {
      await load();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Failed to reply");
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const all = [root, ...replies];
    const message = all.find((m) => m.id === messageId);
    if (!message) return;
    const mine = message.reactions
      .find((r) => r.emoji === emoji)
      ?.userIds.includes(CURRENT_USER_ID);
    const method = mine ? "DELETE" : "POST";
    const url = `/api/data/messages/${messageId}/reactions${
      mine ? `?emoji=${encodeURIComponent(emoji)}&userId=${CURRENT_USER_ID}` : ""
    }`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: mine ? undefined : JSON.stringify({ emoji, userId: CURRENT_USER_ID }),
    });
    load();
  };

  const handleAddReaction = async (messageId: string) => {
    await handleToggleReaction(messageId, ":+1:");
  };

  const handleSave = async (messageId: string) => {
    await fetch(`/api/data/messages/${messageId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: CURRENT_USER_ID }),
    });
    toast.success("Saved to Later");
  };

  const handleEdit = async (messageId: string) => {
    const all = [root, ...replies];
    const message = all.find((m) => m.id === messageId);
    if (!message) return;
    const next = window.prompt("Edit message", message.text);
    if (next === null || next.trim() === "") return;
    await fetch(`/api/data/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: next }),
    });
    load();
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm("Delete this message?")) return;
    await fetch(`/api/data/messages/${messageId}`, { method: "DELETE" });
    load();
  };

  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-l border-border bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <div>
          <div className="text-sm font-bold">Thread</div>
          <div className="text-xs text-muted-foreground">#thread</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={close}
          aria-label="Close thread"
        >
          <X className="size-4" />
        </Button>
      </header>
      <ScrollArea className="flex-1">
        <div className="py-2">
          <MessageItem
            message={root}
            author={users.find((u) => u.id === root.authorId)}
            users={users}
            compact={false}
            onToggleReaction={(emoji) => handleToggleReaction(root.id, emoji)}
            onAddReaction={() => handleAddReaction(root.id)}
            onSave={() => handleSave(root.id)}
            onForward={() => toast.info("Forward — pick destination")}
            onEdit={() => handleEdit(root.id)}
            onDelete={() => handleDelete(root.id)}
          />
          <Separator className="my-2" />
          <div className="px-5 text-xs font-semibold text-muted-foreground">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </div>
          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              author={users.find((u) => u.id === reply.authorId)}
              users={users}
              compact={false}
              onToggleReaction={(emoji) => handleToggleReaction(reply.id, emoji)}
              onAddReaction={() => handleAddReaction(reply.id)}
              onSave={() => handleSave(reply.id)}
              onForward={() => toast.info("Forward — pick destination")}
              onEdit={() => handleEdit(reply.id)}
              onDelete={() => handleDelete(reply.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="shrink-0">
        <Composer
          placeholder="Reply…"
          onSend={handleReplySend}
          compact
        />
        {root.channelId ? (
          <label className="mx-4 mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={broadcast}
              onCheckedChange={(v) => setBroadcast(v === true)}
            />
            Also send to channel
          </label>
        ) : null}
      </div>
    </aside>
  );
}
