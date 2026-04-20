import { DeviceFrame } from "./device-frame";

function imageAspectRatio(
  platform?: string,
  width?: number,
  height?: number,
): string | undefined {
  if (platform === "mobile") {
    return undefined;
  }

  if (width && height) {
    // Imported desktop screenshots are often padded into square canvases.
    // Render them as landscape browser captures instead of preserving the square.
    if (platform === "desktop" && width === height) {
      return "16 / 9";
    }
    return `${width} / ${height}`;
  }

  if (platform === "desktop") {
    return "16 / 9";
  }

  return undefined;
}

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
  const aspectRatio = imageAspectRatio(platform, width, height);
  const isSquareDesktopImport = platform === "desktop" && width === height;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt ?? ""}
      className={
        isSquareDesktopImport
          ? "h-full w-full object-cover object-top"
          : "h-full w-full object-contain object-top"
      }
      width={width}
      height={height}
    />
  );
  if (platform === "mobile") {
    return <DeviceFrame variant="phone">{img}</DeviceFrame>;
  }
  if (platform === "desktop") {
    return (
      <DeviceFrame variant="desktop">
        <div
          className="relative w-full overflow-hidden bg-muted/30"
          style={aspectRatio ? { aspectRatio } : undefined}
        >
          {img}
        </div>
      </DeviceFrame>
    );
  }
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-muted"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {img}
    </div>
  );
}
