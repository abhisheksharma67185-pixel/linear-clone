"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  id,
  disabled,
}: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        checked && "border-primary bg-primary text-primary-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {checked ? <Check className="size-2.5" /> : null}
    </button>
  );
}
