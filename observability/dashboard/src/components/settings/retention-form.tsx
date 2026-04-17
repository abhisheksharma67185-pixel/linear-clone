"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateProjectRetentionAction } from "@/actions/projects";

export function RetentionForm({
  projectId,
  initialDays,
}: {
  projectId: string;
  initialDays: number;
}) {
  const [days, setDays] = React.useState(String(initialDays));
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="days">Retention period</Label>
          <Select id="days" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </Select>
          <p className="text-[0.625rem] text-muted-foreground">
            This controls the project&apos;s trace retention window in the control
            plane.
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await updateProjectRetentionAction(projectId, Number(days));
                toast.success("Retention settings saved");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to save retention");
              }
            });
          }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
