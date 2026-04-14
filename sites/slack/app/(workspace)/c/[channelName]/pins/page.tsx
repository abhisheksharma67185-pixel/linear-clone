"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SimplePageHeader } from "@/components/simple-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "@/components/message-item";

type User = {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  presence: "active" | "away" | "offline" | "dnd";
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

type Channel = { id: string; name: string };

export default function ChannelPinsPage() {
  const params = useParams<{ channelName: string }>();
  const [pins, setPins] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/channels/${params.channelName}`).then((r) => r.json()),
      fetch(`/api/data/channels/${params.channelName}/pins`).then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([c, p, u]) => {
      setChannel(c);
      setPins(p.filter(Boolean));
      setUsers(u);
    });
  }, [params.channelName]);

  return (
    <>
      <SimplePageHeader
        title={`Pinned in #${channel?.name ?? ""}`}
        subtitle={`${pins.length} items pinned`}
      />
      <ScrollArea className="flex-1">
        {pins.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No pinned messages.
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {pins.map((m) => (
              <MessageItem
                key={m.id}
                message={m}
                author={users.find((u) => u.id === m.authorId)}
                users={users}
                compact={false}
                onToggleReaction={() => {}}
                onAddReaction={() => {}}
                onSave={() => {}}
                onForward={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
