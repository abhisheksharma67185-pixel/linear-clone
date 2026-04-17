import { DeviceFrame } from "./device-frame";

export function ImageFrame({
  url,
  alt,
  platform,
  width,
  height,
}: {
  url: string;
  alt?: string;
  platform?: string;
  width?: number;
  height?: number;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt ?? ""}
      className="h-full w-full object-cover"
      width={width}
      height={height}
    />
  );
  if (platform === "mobile") {
    return <DeviceFrame variant="phone">{img}</DeviceFrame>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted">
      {img}
    </div>
  );
}
