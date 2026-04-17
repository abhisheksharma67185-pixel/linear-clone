"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
}: {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        checked && "bg-primary",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "inline-block size-3 translate-x-0.5 rounded-full bg-background shadow transition-transform",
          checked && "translate-x-3.5"
        )}
      />
    </button>
  );
}
