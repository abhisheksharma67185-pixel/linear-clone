"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMonitorConfigAction } from "@/actions/monitors";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select } from "@/components/ui/select";

const OPERATORS = [
  { value: "gt", label: "Greater than" },
  { value: "gte", label: "Greater than or equal" },
  { value: "lt", label: "Less than" },
  { value: "lte", label: "Less than or equal" },
  { value: "eq", label: "Equal" },
];

function parseJson(value: string): Record<string, unknown> | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Filters must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
}

export function CreateMonitorDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [signalKey, setSignalKey] = React.useState("latency_ms");
  const [operator, setOperator] = React.useState("gt");
  const [warnThreshold, setWarnThreshold] = React.useState("");
  const [criticalThreshold, setCriticalThreshold] = React.useState("");
  const [windowMinutes, setWindowMinutes] = React.useState("5");
  const [groupBy, setGroupBy] = React.useState("");
  const [filters, setFilters] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [pending, startTransition] = React.useTransition();

  function reset() {
    setName("");
    setDescription("");
    setSignalKey("latency_ms");
    setOperator("gt");
    setWarnThreshold("");
    setCriticalThreshold("");
    setWindowMinutes("5");
    setGroupBy("");
    setFilters("");
    setActive(true);
  }

  function submit() {
    const trimmedName = name.trim();
    const trimmedSignalKey = signalKey.trim();
    if (!trimmedName || !trimmedSignalKey) {
      return;
    }

    startTransition(async () => {
      try {
        await createMonitorConfigAction(projectId, {
          name: trimmedName,
          description: description.trim() || undefined,
          signal_key: trimmedSignalKey,
          operator,
          warn_threshold: parseNumber(warnThreshold),
          critical_threshold: parseNumber(criticalThreshold),
          window_minutes: parseNumber(windowMinutes),
          group_by: groupBy.trim() || undefined,
          filters: parseJson(filters),
          active,
        });
        toast.success("Monitor created");
        setOpen(false);
        reset();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create monitor");
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
          New monitor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create monitor</DialogTitle>
          <DialogDescription>
            Define warning and critical thresholds for a project-level signal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="monitor-name">Name</Label>
            <Input
              id="monitor-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Slow desktop runs"
              autoFocus
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-signal-key">Signal key</Label>
              <Input
                id="monitor-signal-key"
                value={signalKey}
                onChange={(event) => setSignalKey(event.target.value)}
                placeholder="latency_ms"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-operator">Operator</Label>
              <Select
                id="monitor-operator"
                value={operator}
                onChange={(event) => setOperator(event.target.value)}
              >
                {OPERATORS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-warn-threshold">Warn threshold</Label>
              <Input
                id="monitor-warn-threshold"
                inputMode="decimal"
                value={warnThreshold}
                onChange={(event) => setWarnThreshold(event.target.value)}
                placeholder="5000"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-critical-threshold">Critical threshold</Label>
              <Input
                id="monitor-critical-threshold"
                inputMode="decimal"
                value={criticalThreshold}
                onChange={(event) => setCriticalThreshold(event.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-window-minutes">Window (minutes)</Label>
              <Input
                id="monitor-window-minutes"
                inputMode="numeric"
                value={windowMinutes}
                onChange={(event) => setWindowMinutes(event.target.value)}
                placeholder="5"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-group-by">Group by</Label>
              <Input
                id="monitor-group-by"
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value)}
                placeholder="platform"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="monitor-description">Description</Label>
              <Input
                id="monitor-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Alert when desktop latency drifts above the baseline."
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="monitor-filters">Filters JSON</Label>
            <textarea
              id="monitor-filters"
              value={filters}
              onChange={(event) => setFilters(event.target.value)}
              placeholder='{"platform":["desktop"],"run_type":["prod"]}'
              className="min-h-24 rounded-md border border-input bg-input/20 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={active} onCheckedChange={(checked) => setActive(checked === true)} />
            <span>Enable immediately</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !name.trim() || !signalKey.trim()}>
            {pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
            Create monitor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
