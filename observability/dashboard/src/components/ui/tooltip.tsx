"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <span className="relative inline-flex group/tooltip">{children}</span>;
}

export function TooltipTrigger({
  asChild: _asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  void _asChild;
  return <>{children}</>;
}

export function TooltipContent({
  className,
  children,
  side = "top",
}: {
  className?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[0.625rem] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100",
        side === "top" && "bottom-full left-1/2 mb-1 -translate-x-1/2",
        side === "bottom" && "top-full left-1/2 mt-1 -translate-x-1/2",
        side === "left" && "right-full top-1/2 mr-1 -translate-y-1/2",
        side === "right" && "left-full top-1/2 ml-1 -translate-y-1/2",
        className
      )}
    >
      {children}
    </span>
  );
}
