"use client";

import { Bot, Brain, Cpu, Database, Sparkles, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLatency } from "@/lib/utils";
import type { Step, StepType } from "@/lib/types";

const TYPE_ICON: Record<StepType, React.ComponentType<{ className?: string }>> = {
  llm: Brain,
  tool: Wrench,
  retrieval: Database,
  robotics: Cpu,
  human: User,
  annotation: Sparkles,
  custom: Bot,
};

const TYPE_COLOR: Record<StepType, string> = {
  llm: "text-primary bg-primary/10",
  tool: "text-chart-3 bg-chart-3/10",
  retrieval: "text-chart-2 bg-chart-2/10",
  robotics: "text-chart-4 bg-chart-4/10",
  human: "text-chart-5 bg-chart-5/10",
  annotation: "text-warning bg-warning/10",
  custom: "text-muted-foreground bg-muted",
};

export function StepRail({
  steps,
  activeStepId,
  onSelect,
}: {
  steps: Step[];
  activeStepId: string;
  onSelect: (id: string) => void;
}) {
  const maxLatency = Math.max(...steps.map((s) => s.latency_ms ?? 0), 1);
  return (
    <ol className="space-y-0.5 p-3">
      {steps.map((step, i) => {
        const Icon = TYPE_ICON[step.type] ?? Bot;
        const active = step.step_id === activeStepId;
        const widthPct = Math.max(8, ((step.latency_ms ?? 0) / maxLatency) * 100);
        return (
          <li key={step.step_id}>
            <button
              type="button"
              onClick={() => onSelect(step.step_id)}
              className={cn(
                "group/step flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors",
                active ? "bg-muted text-foreground" : "hover:bg-muted/40 text-foreground/80"
              )}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[0.6rem] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md",
                  TYPE_COLOR[step.type]
                )}
              >
                <Icon className="size-3" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">
                    {step.name ?? step.type}
                  </span>
                  <span className="text-[0.625rem] tabular-nums text-muted-foreground">
                    {formatLatency(step.latency_ms)}
                  </span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-muted">
                  <div
                    className="h-1 rounded-full bg-primary/70"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
