"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger, usePopoverContext } from "./popover";

export function DropdownMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <Popover className={className}>{children}</Popover>;
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  return <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>;
}

export function DropdownMenuContent({
  className,
  align,
  children,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}) {
  return (
    <PopoverContent align={align} className={cn("min-w-48", className)}>
      {children}
    </PopoverContent>
  );
}

export function DropdownMenuItem({
  className,
  onSelect,
  children,
  disabled,
}: {
  className?: string;
  onSelect?: (e?: { preventDefault: () => void }) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const popover = usePopoverContext();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        let prevented = false;
        onSelect?.({ preventDefault: () => { prevented = true; } });
        if (!prevented) popover?.setOpen(false);
      }}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors outline-none hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} />;
}

export function DropdownMenuLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-[0.625rem] font-semibold tracking-wide uppercase text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
