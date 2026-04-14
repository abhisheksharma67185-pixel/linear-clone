"use client";

import { MessageItem } from "./message-item";
import { DateDivider, formatDateLabel } from "./date-divider";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const GROUP_WINDOW_MS = 5 * 60 * 1000;
const TODAY_ISO = "2026-04-13T12:00:00.000Z";

export function MessageList({
  messages,
  users,
  onToggleReaction,
  onAddReaction,
  onSaveMessage,
  onForwardMessage,
  onEditMessage,
  onDeleteMessage,
  emptyState,
}: {
  messages: Message[];
  users: User[];
  onToggleReaction: (messageId: string, emoji: string) => void;
  onAddReaction: (messageId: string) => void;
  onSaveMessage: (messageId: string) => void;
  onForwardMessage: (messageId: string) => void;
  onEditMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  emptyState?: React.ReactNode;
}) {
  if (messages.length === 0 && emptyState) {
    return <div className="flex flex-1 items-center justify-center">{emptyState}</div>;
  }

  // Sort by createdAt
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Group consecutive messages by author + time window
  const rows: Array<
    { type: "divider"; label: string } | { type: "message"; msg: Message; compact: boolean }
  > = [];
  let lastDate = "";
  let prev: Message | null = null;
  for (const m of sorted) {
    const day = m.createdAt.slice(0, 10);
    if (day !== lastDate) {
      rows.push({ type: "divider", label: formatDateLabel(m.createdAt, TODAY_ISO) });
      lastDate = day;
      prev = null;
    }
    const compact =
      prev !== null &&
      prev.authorId === m.authorId &&
      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() <
        GROUP_WINDOW_MS;
    rows.push({ type: "message", msg: m, compact });
    prev = m;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col py-4">
        {rows.map((row, i) =>
          row.type === "divider" ? (
            <DateDivider key={`d-${i}`} label={row.label} />
          ) : (
            <MessageItem
              key={row.msg.id}
              message={row.msg}
              author={users.find((u) => u.id === row.msg.authorId)}
              users={users}
              compact={row.compact}
              onToggleReaction={(emoji) => onToggleReaction(row.msg.id, emoji)}
              onAddReaction={() => onAddReaction(row.msg.id)}
              onSave={() => onSaveMessage(row.msg.id)}
              onForward={() => onForwardMessage(row.msg.id)}
              onEdit={() => onEditMessage(row.msg.id)}
              onDelete={() => onDeleteMessage(row.msg.id)}
            />
          ),
        )}
      </div>
    </ScrollArea>
  );
}
