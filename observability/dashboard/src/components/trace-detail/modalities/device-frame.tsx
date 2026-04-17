import * as React from "react";
import { cn } from "@/lib/utils";

export function DeviceFrame({
  children,
  className,
  variant = "phone",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "phone" | "desktop";
}) {
  if (variant === "desktop") {
    return (
      <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-card", className)}>
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-1.5">
          <span className="size-2 rounded-full bg-destructive/60" />
          <span className="size-2 rounded-full bg-warning/60" />
          <span className="size-2 rounded-full bg-success/60" />
        </div>
        <div className="relative">{children}</div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative mx-auto w-[260px] overflow-hidden rounded-[2rem] border-[6px] border-[oklch(0.2_0_0)] bg-[oklch(0.12_0_0)] shadow-xl",
        className
      )}
    >
      <div className="absolute left-1/2 top-1 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      <div className="aspect-[9/19.5] relative">{children}</div>
    </div>
  );
}
