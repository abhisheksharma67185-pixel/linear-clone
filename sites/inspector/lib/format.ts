// Small formatting helpers shared by the UI.

export function relativeTime(iso: string | undefined | null): string {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Date.now() - then
  const sec = Math.round(diff / 1000)
  if (sec < 5) return "just now"
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  return `${day}d ago`
}

export function difficultyVariant(
  difficulty: string,
): "default" | "secondary" | "warning" | "destructive" {
  switch (difficulty) {
    case "easy":
      return "secondary"
    case "medium":
      return "default"
    case "hard":
      return "warning"
    case "expert":
      return "destructive"
    default:
      return "secondary"
  }
}

export function compactNumber(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n / 1000)}k`
}
