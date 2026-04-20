"use client";

import * as React from "react";
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
  const [naturalSize, setNaturalSize] = React.useState<{ width: number; height: number } | null>(
    width && height ? { width, height } : null
  );

  const resolvedWidth = width ?? naturalSize?.width;
  const resolvedHeight = height ?? naturalSize?.height;
  const aspectRatio = imageAspectRatio(platform, resolvedWidth, resolvedHeight);
  const isSquareDesktopImport =
    platform === "desktop" &&
    Boolean(resolvedWidth && resolvedHeight && resolvedWidth === resolvedHeight);
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt ?? ""}
      onLoad={(event) => {
        if (width && height) {
          return;
        }
        const target = event.currentTarget;
        setNaturalSize({
          width: target.naturalWidth,
          height: target.naturalHeight,
        });
      }}
      className={
        isSquareDesktopImport
          ? "h-full w-full origin-center scale-[1.38] object-cover object-center"
          : "h-full w-full object-contain object-top"
      }
      width={resolvedWidth}
      height={resolvedHeight}
      loading="lazy"
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
