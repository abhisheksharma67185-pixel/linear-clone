import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import type { TraceStatus } from "@/lib/types";

export const STATUS_META: Record<
  TraceStatus,
  {
    label: string;
    variant: "success" | "destructive" | "outline";
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }
> = {
  success: {
    label: "success",
    variant: "success",
    Icon: CircleCheck,
    color: "text-success",
    bg: "bg-success/10",
  },
  error: {
    label: "error",
    variant: "destructive",
    Icon: CircleX,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  running: {
    label: "running",
    variant: "outline",
    Icon: Loader2,
    color: "text-primary animate-spin",
    bg: "bg-primary/10",
  },
};
