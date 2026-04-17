"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const PopoverCtx = React.createContext<Ctx | null>(null);

export function Popover({
  children,
  className,
  open: controlled,
  onOpenChange,
}: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [internal, setInternal] = React.useState(false);
  const open = controlled ?? internal;
  const setOpen = (v: boolean) => {
    if (controlled === undefined) setInternal(v);
    onOpenChange?.(v);
  };
  const triggerRef = React.useRef<HTMLElement | null>(null);
  return (
    <PopoverCtx.Provider value={{ open, setOpen, triggerRef }}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </PopoverCtx.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const ctx = React.useContext(PopoverCtx)!;
  const onClick = (e: React.MouseEvent) => {
    (children.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
    ctx.setOpen(!ctx.open);
  };
  return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    ref: ctx.triggerRef as unknown as React.Ref<HTMLElement>,
    onClick,
    "aria-expanded": ctx.open,
    "data-state": ctx.open ? "open" : "closed",
    ...(asChild ? {} : {}),
  });
}

export function PopoverContent({
  className,
  align = "start",
  children,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}) {
  const ctx = React.useContext(PopoverCtx)!;
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!ctx.open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      const t = e.target as Node;
      if (ref.current.contains(t)) return;
      if (ctx.triggerRef.current?.contains(t)) return;
      ctx.setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") ctx.setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ctx]);
  if (!ctx.open) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      className={cn(
        "absolute z-50 mt-1 min-w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function usePopoverContext() {
  return React.useContext(PopoverCtx);
}
