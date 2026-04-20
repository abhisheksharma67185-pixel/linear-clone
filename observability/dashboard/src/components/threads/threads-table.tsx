"use client";

import * as React from "react";
import { MessageSquareText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteConversationThreadAction } from "@/actions/threads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ConversationThread } from "@/lib/types";
import { formatRelative, formatNumber } from "@/lib/utils";

export function ThreadsTable({ threads }: { threads: ConversationThread[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function remove(threadId: string) {
    setPendingId(threadId);
    try {
      await deleteConversationThreadAction(threadId);
      toast.success("Conversation thread deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete thread");
    } finally {
      setPendingId(null);
    }
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-xl border bg-card px-6 py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareText className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No conversation threads yet</EmptyTitle>
            <EmptyDescription>
              Create threads to group related runs by user, session, or external conversation ID.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thread</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Linked traces</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-16 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {threads.map((thread) => (
            <TableRow key={thread.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{thread.title}</span>
                    <Badge variant="outline">{thread.id}</Badge>
                  </div>
                  {thread.external_id ? (
                    <p className="text-xs text-muted-foreground">External: {thread.external_id}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {thread.user_id ? <Badge variant="secondary">user:{thread.user_id}</Badge> : null}
                  {thread.session_id ? <Badge variant="secondary">session:{thread.session_id}</Badge> : null}
                  {!thread.user_id && !thread.session_id ? (
                    <span className="text-xs text-muted-foreground">Unscoped</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{formatNumber(thread.trace_count)}</span>
                  {thread.trace_ids.length > 0 ? (
                    <p className="max-w-[20rem] truncate text-xs text-muted-foreground">
                      {thread.trace_ids.slice(0, 3).join(", ")}
                      {thread.trace_ids.length > 3 ? ` +${thread.trace_ids.length - 3} more` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No traces linked yet</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelative(thread.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pendingId === thread.id}
                  onClick={() => void remove(thread.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
