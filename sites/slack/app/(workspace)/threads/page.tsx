"use client";

import { useEffect, useState } from "react";
import { SimplePageHeader } from "@/components/simple-page-header";
import { MessageItem } from "@/components/message-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { MessageSquare } from "lucide-react";

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

const CURRENT_USER_ID = "usr-1";

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/data/messages").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([msgs, u]: [Message[], User[]]) => {
      // Threads where viewer has participated (authored a reply or was mentioned in root)
      const replyRoots = new Set<string>();
      for (const m of msgs) {
        if (m.threadRootId && m.authorId === CURRENT_USER_ID) {
          replyRoots.add(m.threadRootId);
        }
      }
      for (const m of msgs) {
        if (m.mentions.includes(CURRENT_USER_ID) && m.threadReplyCount > 0) {
          replyRoots.add(m.id);
        }
      }
      const roots = msgs
        .filter((m) => replyRoots.has(m.id) && m.threadReplyCount > 0)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setThreads(roots);
      setUsers(u);
    });
  }, []);

  return (
    <>
      <SimplePageHeader title="Threads" subtitle={`${threads.length} active`} />
      <ScrollArea className="flex-1">
        {threads.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>No threads yet</EmptyTitle>
              <EmptyDescription>
                When you reply to or are mentioned in a thread, it will show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col py-2">
            {threads.map((t) => (
              <MessageItem
                key={t.id}
                message={t}
                author={users.find((u) => u.id === t.authorId)}
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
