import { cn } from "@/lib/utils"

/**
 * Small monospaced "key" badge — used in command menus and tooltips
 * to indicate keyboard shortcuts.
 */
export function Kbd({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none ml-auto inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded border border-border/60 bg-muted/40 px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none",
        className
      )}
    >
      {children}
    </kbd>
  )
}
