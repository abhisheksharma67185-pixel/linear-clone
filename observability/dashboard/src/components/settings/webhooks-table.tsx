"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteWebhookAction, updateWebhookAction } from "@/actions/webhooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Webhook } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

export function WebhooksTable({
  projectId,
  webhooks,
}: {
  projectId: string;
  webhooks: Webhook[];
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function toggle(webhook: Webhook, active: boolean) {
    setPendingId(webhook.id);
    try {
      await updateWebhookAction(projectId, webhook.id, { active });
      toast.success(active ? "Webhook enabled" : "Webhook disabled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update webhook");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(webhook: Webhook) {
    setPendingId(webhook.id);
    try {
      await deleteWebhookAction(projectId, webhook.id);
      toast.success("Webhook deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete webhook");
    } finally {
      setPendingId(null);
    }
  }

  if (webhooks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm font-medium">No webhooks yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create one to receive trace and incident events in your own systems.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="divide-y divide-border">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{webhook.url}</p>
                <Badge variant={webhook.active ? "success" : "secondary"}>
                  {webhook.active ? "Active" : "Paused"}
                </Badge>
              </div>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                {webhook.events.join(", ")}
              </p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                {webhook.last_delivery_at
                  ? `Last delivery ${formatRelative(webhook.last_delivery_at)}`
                  : "No deliveries yet"}
                {typeof webhook.last_delivery_status === "number"
                  ? ` · HTTP ${webhook.last_delivery_status}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={webhook.active}
                disabled={pendingId === webhook.id}
                onCheckedChange={(checked) => void toggle(webhook, checked)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pendingId === webhook.id}
                onClick={() => void remove(webhook)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
