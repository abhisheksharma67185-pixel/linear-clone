import { cn } from "@/lib/utils";
import { Info, AlertTriangle, Lightbulb } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "tip";
  title?: string;
  children: React.ReactNode;
}

const config = {
  info: {
    icon: Info,
    border: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
    title: "Info",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
    title: "Warning",
  },
  tip: {
    icon: Lightbulb,
    border: "border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
    title: "Tip",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <div
      className={cn(
        "my-4 rounded-r-lg border-l-4 p-4",
        c.border,
        c.bg,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-4 shrink-0", c.iconColor)} />
        <div className="min-w-0">
          {title && (
            <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
          )}
          <div className="text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs dark:[&_code]:bg-zinc-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
