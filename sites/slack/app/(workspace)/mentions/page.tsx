"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AtSign } from "lucide-react";
import { toast } from "sonner";

type Notification = {
  id: string;
  type: string;
  channelId: string | null;
  dmId: string | null;
  messageId: string;
  read: boolean;
  createdAt: string;
};

type Message = { id: string; text: string; authorId: string; createdAt: string };
type User = { id: string; name: string; displayName: string; avatar: string };
type Channel = { id: string; name: string };

const CURRENT_USER_ID = "usr-1";

export default function MentionsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const load = async () => {
    const [n, m, u, c] = await Promise.all([
      fetch(`/api/data/notifications?userId=${CURRENT_USER_ID}`).then((r) => r.json()),
      fetch("/api/data/messages").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ]);
    setNotifs(n.filter((x: Notification) => x.type === "mention"));
    setMessages(m);
    setUsers(u);
    setChannels(c);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const markAllRead = async () => {
    await fetch(`/api/data/notifications?userId=${CURRENT_USER_ID}`, {
      method: "PATCH",
    });
    toast.success("All notifications marked read");
    load();
  };

  return (
    <>
      <SimplePageHeader
        title="Mentions & reactions"
        subtitle={`${notifs.filter((n) => !n.read).length} unread`}
        action={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {notifs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
              <AtSign className="mr-2 size-4" />
              No mentions yet.
            </div>
          ) : (
            notifs.map((n) => {
              const msg = messages.find((m) => m.id === n.messageId);
              const author = users.find((u) => u.id === msg?.authorId);
              const channel = channels.find((c) => c.id === n.channelId);
              return (
                <Link
                  key={n.id}
                  href={channel ? `/c/${channel.name}` : n.dmId ? `/dm/${n.dmId}` : "#"}
                  className={`flex flex-col gap-1 px-4 py-3 hover:bg-muted ${
                    n.read ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AtSign className="size-3" />
                    {author?.name ?? "Unknown"} mentioned you
                    {channel ? ` in #${channel.name}` : n.dmId ? " in DM" : ""}
                  </div>
                  <div className="truncate text-sm text-foreground">
                    {msg?.text ?? "(message)"}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </>
  );
}
