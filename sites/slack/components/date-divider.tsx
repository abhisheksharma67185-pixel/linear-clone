export function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center gap-3 px-5">
      <div className="flex-1 border-t border-border" />
      <div className="rounded-full border border-border bg-background px-3 py-0.5 text-xs font-semibold text-foreground">
        {label}
      </div>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

export function formatDateLabel(iso: string, todayIso: string): string {
  const d = new Date(iso)
  const today = new Date(todayIso)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dayIso = iso.slice(0, 10)
  if (dayIso === todayIso.slice(0, 10)) return "Today"
  if (dayIso === yesterday.toISOString().slice(0, 10)) return "Yesterday"
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  })
}
