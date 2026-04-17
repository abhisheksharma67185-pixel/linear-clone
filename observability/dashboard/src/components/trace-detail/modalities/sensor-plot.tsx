"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface SensorPoint {
  t: number;
  j1: number;
  j2: number;
  j3: number;
}

// Generate sample joint data if none provided.
function sampleData(): SensorPoint[] {
  return Array.from({ length: 120 }, (_, i) => ({
    t: i * 16,
    j1: Math.sin(i / 10) * 30 + 20,
    j2: Math.cos(i / 8) * 25 - 10,
    j3: Math.sin(i / 6 + 1) * 40,
  }));
}

export function SensorPlot({
  label = "joint_state",
  data,
}: {
  label?: string;
  data?: SensorPoint[];
}) {
  const series = data ?? sampleData();
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
          sensor · {label}
        </p>
        <p className="text-[0.625rem] text-muted-foreground">
          {series.length} samples · 60 Hz
        </p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={series}>
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 11,
            }}
          />
          <Line type="monotone" dataKey="j1" stroke="var(--chart-1)" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="j2" stroke="var(--chart-2)" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="j3" stroke="var(--chart-3)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
