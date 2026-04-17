"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function JsonViewer({ value, initialDepth = 2 }: { value: unknown; initialDepth?: number }) {
  return (
    <div className="overflow-auto rounded-lg border border-border bg-[oklch(0.12_0_0)] p-4 font-mono text-xs leading-relaxed text-[oklch(0.88_0_0)] scrollbar-thin">
      <Node value={value} depth={0} initialDepth={initialDepth} />
    </div>
  );
}

function Node({ value, depth, initialDepth, keyName }: { value: unknown; depth: number; initialDepth: number; keyName?: string }) {
  const [open, setOpen] = React.useState(depth < initialDepth);

  if (value === null) return <Inline keyName={keyName}><span className="text-[oklch(0.65_0.15_304)]">null</span></Inline>;
  if (typeof value === "boolean") return <Inline keyName={keyName}><span className="text-[oklch(0.7_0.17_76)]">{String(value)}</span></Inline>;
  if (typeof value === "number") return <Inline keyName={keyName}><span className="text-[oklch(0.75_0.17_148)]">{String(value)}</span></Inline>;
  if (typeof value === "string")
    return (
      <Inline keyName={keyName}>
        <span className="text-[oklch(0.75_0.16_20)]">&quot;{value}&quot;</span>
      </Inline>
    );

  const isArr = Array.isArray(value);
  const entries = isArr ? (value as unknown[]).map((v, i) => [i, v] as [number, unknown]) : Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return <Inline keyName={keyName}>{isArr ? "[]" : "{}"}</Inline>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[oklch(0.65_0_0)] hover:text-foreground"
      >
        <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} />
        {keyName !== undefined && (
          <>
            <span className="text-[oklch(0.7_0.15_259)]">&quot;{keyName}&quot;</span>
            <span className="text-[oklch(0.55_0_0)]">:</span>
          </>
        )}
        <span className="text-[oklch(0.55_0_0)]">
          {isArr ? `Array(${entries.length})` : `{${entries.length}}`}
        </span>
      </button>
      {open && (
        <div className="ml-3.5 border-l border-[oklch(0.25_0_0)] pl-3">
          {entries.map(([k, v]) => (
            <Node
              key={String(k)}
              value={v}
              depth={depth + 1}
              initialDepth={initialDepth}
              keyName={String(k)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Inline({ keyName, children }: { keyName?: string; children: React.ReactNode }) {
  return (
    <div>
      {keyName !== undefined && (
        <>
          <span className="text-[oklch(0.7_0.15_259)]">&quot;{keyName}&quot;</span>
          <span className="text-[oklch(0.55_0_0)]">: </span>
        </>
      )}
      {children}
    </div>
  );
}
