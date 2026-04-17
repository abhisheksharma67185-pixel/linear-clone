export function AudioPlayer({ url }: { url: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <audio controls src={url} className="w-full" />
    </div>
  );
}
