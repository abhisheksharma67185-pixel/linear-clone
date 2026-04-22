"use client"

import * as React from "react"
import { IconChevronRight, IconCopy, IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// A self-contained collapsible JSON viewer. We don't depend on
// react-json-view-lite because (a) it's a pure runtime dep we'd add to the
// lockfile for one component, and (b) we want full control over Tailwind
// theme tokens for proper dark-mode support.
// ---------------------------------------------------------------------------

interface NodeProps {
  name?: string
  value: unknown
  depth: number
  defaultCollapsedDepth: number
  isLast: boolean
}

function valueColor(value: unknown): string {
  if (value === null) return "text-muted-foreground"
  if (typeof value === "string") return "text-emerald-600 dark:text-emerald-400"
  if (typeof value === "number") return "text-blue-600 dark:text-blue-400"
  if (typeof value === "boolean") return "text-purple-600 dark:text-purple-400"
  return "text-foreground"
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (typeof value === "string") {
    return <span className={valueColor(value)}>&quot;{value}&quot;</span>
  }
  if (value === null) {
    return <span className={valueColor(value)}>null</span>
  }
  return <span className={valueColor(value)}>{String(value)}</span>
}

function JsonNode({
  name,
  value,
  depth,
  defaultCollapsedDepth,
  isLast,
}: NodeProps) {
  const isObject = value !== null && typeof value === "object"
  const isArray = Array.isArray(value)
  const [collapsed, setCollapsed] = React.useState(
    depth >= defaultCollapsedDepth
  )

  if (!isObject) {
    return (
      <div className="flex items-baseline" style={{ paddingLeft: depth * 12 }}>
        {name !== undefined && (
          <>
            <span className="text-foreground/80">&quot;{name}&quot;</span>
            <span className="mr-1 text-muted-foreground">:</span>
          </>
        )}
        <PrimitiveValue value={value} />
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    )
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>)

  const open = isArray ? "[" : "{"
  const close = isArray ? "]" : "}"
  const empty = entries.length === 0

  return (
    <div>
      <div
        className="flex cursor-pointer items-baseline gap-1 rounded-sm hover:bg-muted/40"
        style={{ paddingLeft: depth * 12 }}
        onClick={() => !empty && setCollapsed((c) => !c)}
      >
        {!empty && (
          <IconChevronRight
            className={cn(
              "size-3 shrink-0 self-center transition-transform",
              !collapsed && "rotate-90"
            )}
          />
        )}
        {empty && <span className="inline-block size-3" />}
        {name !== undefined && (
          <>
            <span className="text-foreground/80">&quot;{name}&quot;</span>
            <span className="mr-1 text-muted-foreground">:</span>
          </>
        )}
        <span className="text-muted-foreground">{open}</span>
        {(empty || collapsed) && (
          <>
            {!empty && (
              <span className="text-xs text-muted-foreground/60">
                {entries.length} {isArray ? "items" : "keys"}
              </span>
            )}
            <span className="text-muted-foreground">{close}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </>
        )}
      </div>
      {!empty && !collapsed && (
        <>
          {entries.map(([k, v], i) => (
            <JsonNode
              key={k}
              name={isArray ? undefined : k}
              value={v}
              depth={depth + 1}
              defaultCollapsedDepth={defaultCollapsedDepth}
              isLast={i === entries.length - 1}
            />
          ))}
          <div style={{ paddingLeft: depth * 12 }}>
            <span className="text-muted-foreground">{close}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </>
      )}
    </div>
  )
}

interface JsonViewProps {
  data: unknown
  defaultCollapsedDepth?: number
  className?: string
  /** Show a copy-to-clipboard button. Defaults to true. */
  copyable?: boolean
}

export function JsonView({
  data,
  defaultCollapsedDepth = 3,
  className,
  copyable = true,
}: JsonViewProps) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard not available; ignore.
    }
  }, [data])

  return (
    <div className={cn("relative", className)}>
      {copyable && (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={onCopy}
          aria-label="Copy JSON"
          className="absolute top-2 right-2 z-10"
        >
          {copied ? (
            <IconCheck className="size-3" />
          ) : (
            <IconCopy className="size-3" />
          )}
        </Button>
      )}
      <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground">
        <JsonNode
          value={data}
          depth={0}
          defaultCollapsedDepth={defaultCollapsedDepth}
          isLast
        />
      </pre>
    </div>
  )
}
