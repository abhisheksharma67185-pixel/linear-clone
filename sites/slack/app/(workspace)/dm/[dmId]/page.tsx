"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageList } from "@/components/message-list";
import { Composer } from "@/components/composer";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Headphones, Info, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type User = {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  presence: "active" | "away" | "offline" | "dnd";
  status: { emoji: string; text: string; expiresAt: string | null };
  title: string;
};

type DirectMessage = {
  id: string;
  participantIds: string[];
  isGroup: boolean;
};

type Message = {
  id: string;
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

export default function DmPage() {
  const params = useParams<{ dmId: string }>();
  const dmId = params.dmId;
  const [dm, setDm] = useState<DirectMessage | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [dmRes, usersRes] = await Promise.all([
      fetch(`/api/data/dms/${dmId}`),
      fetch("/api/data/users"),
    ]);
    if (!dmRes.ok) {
      setLoading(false);
      return;
    }
    const d = (await dmRes.json()) as DirectMessage;
    const u = (await usersRes.json()) as User[];
    setDm(d);
    setUsers(u);
    const msgRes = await fetch(`/api/data/messages?dmId=${d.id}`);
    setMessages((await msgRes.json()) as Message[]);
    setLoading(false);
    fetch(`/api/data/read-states/dm/${d.id}?userId=${CURRENT_USER_ID}`, {
      method: "POST",
    });
  }, [dmId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSend = async (text: string) => {
    if (!dm) return;
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dmId: dm.id,
        authorId: CURRENT_USER_ID,
        text,
      }),
    });
    if (res.ok) load();
    else toast.error("Failed to send");
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find((m) => m.id === messageId);
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!dm) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        DM not found.
      </div>
    );
  }

  const others = dm.participantIds
    .filter((id) => id !== CURRENT_USER_ID)
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u));

  const title = dm.isGroup
    ? others.map((u) => u.displayName).join(", ")
    : others[0]?.name ?? "Direct message";
  const subtitle = dm.isGroup
    ? `${others.length + 1} people`
    : others[0]?.title ?? "";

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex min-w-0 items-center gap-2">
          {dm.isGroup ? (
            <span className="flex size-6 items-center justify-center rounded-md bg-muted">
              <Users className="size-3.5" />
            </span>
          ) : (
            <UserAvatar
              name={others[0]?.name ?? ""}
              src={others[0]?.avatar}
              presence={others[0]?.presence}
              size="sm"
              showPresence
            />
          )}
          <button
            type="button"
            className="flex min-w-0 flex-col items-start rounded-md px-2 py-0.5 hover:bg-muted"
          >
            <span className="truncate font-bold text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground">{subtitle}</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <Headphones className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Start huddle</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <Phone className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Start call</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <Info className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Details</TooltipContent>
          </Tooltip>
        </div>
      </header>
      <MessageList
        messages={messages}
        users={users}
        onToggleReaction={handleToggleReaction}
        onAddReaction={(id) => handleToggleReaction(id, ":+1:")}
        onSaveMessage={async (id) => {
          await fetch(`/api/data/messages/${id}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: CURRENT_USER_ID }),
          });
          toast.success("Saved to Later");
        }}
        onForwardMessage={() => toast.info("Forward — pick destination")}
        onEditMessage={async (id) => {
          const message = messages.find((m) => m.id === id);
          if (!message) return;
          const next = window.prompt("Edit message", message.text);
          if (next === null || next.trim() === "") return;
          await fetch(`/api/data/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: next }),
          });
          load();
        }}
        onDeleteMessage={async (id) => {
          if (!window.confirm("Delete this message?")) return;
          await fetch(`/api/data/messages/${id}`, { method: "DELETE" });
          load();
        }}
      />
      <Composer placeholder={`Message ${title}`} onSend={handleSend} />
    </>
  );
}
