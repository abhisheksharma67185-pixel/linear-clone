import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatLatency } from "@/lib/utils";
import type { ToolCall } from "@/lib/types";

export function ToolCallCard({ call }: { call: ToolCall }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Wrench className="size-3 text-chart-3" />
        <span className="font-mono text-xs font-semibold">{call.name}</span>
        {call.latency_ms !== undefined && (
          <span className="ml-auto text-[0.625rem] text-muted-foreground">
            {formatLatency(call.latency_ms)}
          </span>
        )}
        {call.error ? <Badge variant="destructive">error</Badge> : <Badge variant="success">ok</Badge>}
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Arguments
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed">
            {JSON.stringify(call.arguments ?? {}, null, 2)}
          </pre>
        </div>
        <div>
          <p className="mb-1 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Result
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed">
            {JSON.stringify(call.result ?? call.error ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
