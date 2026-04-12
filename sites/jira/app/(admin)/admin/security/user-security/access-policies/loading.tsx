export default function Loading() {
  return (
    <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
      <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
      Loading access policies...
    </div>
  )
}
