"use client";

import * as React from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metric, MetricEvent } from "@/lib/types";

export function MetricsGrid({
  metrics,
  eventsMap,
}: {
  metrics: Metric[];
  eventsMap: Record<string, MetricEvent[]>;
}) {
  if (metrics.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center rounded-xl border bg-card p-10">
        <div className="max-w-sm text-center">
          <p className="text-base font-semibold">No metrics configured yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a metric via the API or SDK to start tracking pass rates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {metrics.map((metric) => {
        const events = eventsMap[metric.id] ?? [];
        const passRate = computePassRate(events);
        const chartData = buildChartData(events);
        const lastEvent = events[0];
        const totalEvents = events.length;

        return (
          <Card
            key={metric.id}
            className="overflow-hidden"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.type === "automated" ? "Automated metric" : "Observed metric"}
                </p>
                <CardTitle>{metric.name}</CardTitle>
                {metric.description && (
                  <p className="text-xs leading-5 text-muted-foreground line-clamp-2">
                    {metric.description}
                  </p>
                )}
              </div>
              <Badge variant={metric.type === "automated" ? "default" : "outline"} className="capitalize">
                {metric.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_7rem]">
                <div className="grid gap-3">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Pass rate
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <p className="text-4xl font-semibold tracking-tight">
                        {passRate !== null ? `${passRate}%` : "--"}
                      </p>
                      <p className="text-right text-xs text-muted-foreground">
                        {totalEvents} events
                        <br />
                        {lastEvent ? `Last ${lastEvent.evaluated_at.slice(0, 10)}` : "No recent events"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetricInfo label="Metric ID" value={metric.id.slice(-8)} mono />
                    <MetricInfo
                      label="Signal"
                      value={metric.type === "automated" ? "Prompt-driven" : "Observed"}
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Trend
                    </p>
                    <span className="text-[0.62rem] text-muted-foreground">7d</span>
                  </div>
                  {chartData.length > 0 ? (
                    <div className="h-28 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <Tooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                            content={({ payload }) => {
                              if (!payload?.[0]) return null;
                              const d = payload[0].payload as { day: string; rate: number };
                              return (
                                <div className="rounded-md border border-border bg-popover px-2.5 py-2 text-xs shadow-sm">
                                  {d.day}: {d.rate}%
                                </div>
                              );
                            }}
                          />
                          <Bar
                            dataKey="rate"
                            fill="var(--primary)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="grid h-28 place-items-center text-center text-xs text-muted-foreground">
                      No recent pass-rate samples
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MetricInfo({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[1rem] border border-border/65 bg-card/72 px-3 py-3">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function computePassRate(events: MetricEvent[]): number | null {
  const withPassed = events.filter((e) => e.passed !== undefined);
  if (withPassed.length === 0) return null;
  const passed = withPassed.filter((e) => e.passed).length;
  return Math.round((passed / withPassed.length) * 100);
}

function buildChartData(events: MetricEvent[]): { day: string; rate: number }[] {
  // Group events by day (last 7 days)
  const byDay: Record<string, { total: number; passed: number }> = {};
  for (const ev of events) {
    if (ev.passed === undefined) continue;
    const day = ev.evaluated_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { total: 0, passed: 0 };
    byDay[day].total++;
    if (ev.passed) byDay[day].passed++;
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([day, { total, passed }]) => ({
      day,
      rate: Math.round((passed / total) * 100),
    }));
}
