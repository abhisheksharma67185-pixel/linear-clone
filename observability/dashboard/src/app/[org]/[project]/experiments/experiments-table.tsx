"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExperimentRow {
  id: string;
  name: string;
  baseline_run_id: string;
  experiment_run_id: string;
  metrics: {
    name: string;
    baseline_pass_rate: number;
    experiment_pass_rate: number;
  }[];
  created_at: string;
}

// Mock experiment data
const MOCK_EXPERIMENTS: ExperimentRow[] = [
  {
    id: "exp_1",
    name: "Prompt v2 for checkout",
    baseline_run_id: "run_base_001",
    experiment_run_id: "run_exp_001",
    metrics: [
      { name: "Task completion", baseline_pass_rate: 78, experiment_pass_rate: 85 },
      { name: "Hallucination", baseline_pass_rate: 92, experiment_pass_rate: 96 },
      { name: "Latency SLA", baseline_pass_rate: 88, experiment_pass_rate: 82 },
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "exp_2",
    name: "GPT-5 vs Claude Opus",
    baseline_run_id: "run_base_002",
    experiment_run_id: "run_exp_002",
    metrics: [
      { name: "Task completion", baseline_pass_rate: 82, experiment_pass_rate: 81 },
      { name: "Hallucination", baseline_pass_rate: 89, experiment_pass_rate: 95 },
      { name: "Latency SLA", baseline_pass_rate: 75, experiment_pass_rate: 91 },
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "exp_3",
    name: "RAG retrieval top_k=10",
    baseline_run_id: "run_base_003",
    experiment_run_id: "run_exp_003",
    metrics: [
      { name: "Task completion", baseline_pass_rate: 71, experiment_pass_rate: 79 },
      { name: "Hallucination", baseline_pass_rate: 94, experiment_pass_rate: 93 },
      { name: "User satisfaction", baseline_pass_rate: 65, experiment_pass_rate: 74 },
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function DeltaIndicator({ baseline, experiment }: { baseline: number; experiment: number }) {
  const delta = experiment - baseline;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-success">
        <ArrowUp className="size-3" />
        +{delta}%
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-destructive">
        <ArrowDown className="size-3" />
        {delta}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      <Minus className="size-3" />
      0%
    </span>
  );
}

export function ExperimentsTable({
  orgSlug,
  projectSlug,
}: {
  orgSlug: string;
  projectSlug: string;
}) {
  const experiments = MOCK_EXPERIMENTS;

  if (experiments.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="text-center">
          <p className="text-sm font-medium">No experiments yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tag traces with run_type=&quot;experiment&quot; to compare against baselines.
          </p>
        </div>
      </div>
    );
  }

  // Collect all unique metric names
  const metricNames = [...new Set(experiments.flatMap((e) => e.metrics.map((m) => m.name)))];

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Experiment</TableHead>
            <TableHead>Baseline run</TableHead>
            <TableHead>Experiment run</TableHead>
            {metricNames.map((name) => (
              <TableHead key={name} className="text-center">
                {name}
              </TableHead>
            ))}
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell className="min-w-[220px] font-medium">{exp.name}</TableCell>
              <TableCell>
                <Link
                  href={`/${orgSlug}/${projectSlug}/traces?run_id=${encodeURIComponent(exp.baseline_run_id)}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {exp.baseline_run_id}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/${orgSlug}/${projectSlug}/traces?run_id=${encodeURIComponent(exp.experiment_run_id)}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {exp.experiment_run_id}
                </Link>
              </TableCell>
              {metricNames.map((name) => {
                const m = exp.metrics.find((mm) => mm.name === name);
                if (!m) {
                  return (
                    <TableCell key={name} className="text-center text-muted-foreground">
                      --
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={name} className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                        {m.baseline_pass_rate}% → {m.experiment_pass_rate}%
                      </span>
                      <Badge
                        variant={
                          m.experiment_pass_rate > m.baseline_pass_rate
                            ? "success"
                            : m.experiment_pass_rate < m.baseline_pass_rate
                            ? "destructive"
                            : "ghost"
                        }
                        className="text-[0.55rem]"
                      >
                        <DeltaIndicator
                          baseline={m.baseline_pass_rate}
                          experiment={m.experiment_pass_rate}
                        />
                      </Badge>
                    </div>
                  </TableCell>
                );
              })}
              <TableCell className="text-muted-foreground">
                {new Date(exp.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
