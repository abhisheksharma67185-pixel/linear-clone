"use client";

import * as React from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createWebhookAction } from "@/actions/webhooks";

const EVENT_OPTIONS = ["trace.created", "trace.errored", "incident.detected"];

export function CreateWebhookDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<string[]>(["trace.created", "trace.errored"]);
  const [pending, startTransition] = React.useTransition();

  function toggleEvent(event: string, checked: boolean) {
    setEvents((current) =>
      checked ? Array.from(new Set([...current, event])) : current.filter((item) => item !== event)
    );
  }

  async function create() {
    startTransition(async () => {
      try {
        const webhook = await createWebhookAction(projectId, url, events, true);
        setSecret(webhook.secret);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create webhook");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setSecret(null);
          setUrl("");
          setEvents(["trace.created", "trace.errored"]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-3" /> New webhook</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{secret ? "Copy your webhook secret now" : "Create webhook"}</DialogTitle>
          <DialogDescription>
            {secret
              ? "This is the only time the full webhook secret is shown."
              : "Theta will POST matching events to this endpoint."}
          </DialogDescription>
        </DialogHeader>
        {secret ? (
          <div className="space-y-3">
            <code className="block break-all rounded-md border border-border bg-muted/60 p-3 font-mono text-[0.7rem]">
              {secret}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(secret);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="size-3" /> Copy
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="webhook-url">Destination URL</Label>
              <Input
                id="webhook-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/hooks/theta"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid gap-2">
                {EVENT_OPTIONS.map((event) => (
                  <label key={event} className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={events.includes(event)}
                      onCheckedChange={(checked) => toggleEvent(event, checked === true)}
                    />
                    <span>{event}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {secret ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={pending || !url || events.length === 0}>
                Create webhook
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
