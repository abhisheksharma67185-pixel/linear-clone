"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createConversationThreadAction } from "@/actions/threads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseJson(value: string): Record<string, unknown> | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Metadata must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function parseTraceIds(value: string): string[] | undefined {
  const items = value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? Array.from(new Set(items)) : undefined;
}

export function CreateThreadDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [externalId, setExternalId] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [traceIds, setTraceIds] = React.useState("");
  const [metadata, setMetadata] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function reset() {
    setTitle("");
    setExternalId("");
    setUserId("");
    setSessionId("");
    setTraceIds("");
    setMetadata("");
  }

  function submit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    startTransition(async () => {
      try {
        await createConversationThreadAction(projectId, {
          title: trimmedTitle,
          external_id: externalId.trim() || undefined,
          user_id: userId.trim() || undefined,
          session_id: sessionId.trim() || undefined,
          trace_ids: parseTraceIds(traceIds),
          metadata: parseJson(metadata),
        });
        toast.success("Conversation thread created");
        setOpen(false);
        reset();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create thread");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3" />
          New thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create conversation thread</DialogTitle>
          <DialogDescription>
            Group related traces by user, session, or an external thread identifier.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="thread-title">Title</Label>
            <Input
              id="thread-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Customer support chat"
              autoFocus
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="thread-external-id">External ID</Label>
              <Input
                id="thread-external-id"
                value={externalId}
                onChange={(event) => setExternalId(event.target.value)}
                placeholder="thread_123"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="thread-user-id">User ID</Label>
              <Input
                id="thread-user-id"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="user_42"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="thread-session-id">Session ID</Label>
              <Input
                id="thread-session-id"
                value={sessionId}
                onChange={(event) => setSessionId(event.target.value)}
                placeholder="sess_abc"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="thread-trace-ids">Trace IDs</Label>
              <Input
                id="thread-trace-ids"
                value={traceIds}
                onChange={(event) => setTraceIds(event.target.value)}
                placeholder="tr_a, tr_b, tr_c"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="thread-metadata">Metadata JSON</Label>
            <textarea
              id="thread-metadata"
              value={metadata}
              onChange={(event) => setMetadata(event.target.value)}
              placeholder='{"source":"import","channel":"desktop"}'
              className="min-h-24 rounded-md border border-input bg-input/20 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !title.trim()}>
            {pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
            Create thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
