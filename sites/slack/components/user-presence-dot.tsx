import { cn } from "@/lib/utils";

type Presence = "active" | "away" | "offline" | "dnd";

export function UserPresenceDot({
  presence,
  className,
}: {
  presence: Presence;
  className?: string;
}) {
  const color = {
    active: "bg-slack-presence-active",
    away: "bg-slack-presence-away",
    offline: "bg-transparent outline outline-current",
    dnd: "bg-slack-presence-dnd",
  }[presence];
  return (
    <span
      aria-label={`${presence} presence`}
      className={cn(
        "inline-block size-2.5 rounded-full border border-background",
        color,
        className,
      )}
    />
  );
}
