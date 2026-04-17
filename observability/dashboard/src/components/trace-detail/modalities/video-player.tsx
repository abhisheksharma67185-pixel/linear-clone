export function VideoPlayer({ url, poster }: { url: string; poster?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-black">
      <video controls src={url} poster={poster} className="w-full" />
    </div>
  );
}
