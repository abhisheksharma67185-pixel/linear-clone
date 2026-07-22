/**
 * Deterministic "solid colored disc + white initials" avatar helper.
 *
 * The Lead column (and any other compact avatar surface) used to
 * render a dashed/transparent border for users without uploaded
 * photos — that visual reads as "placeholder" / "missing data". Real
 * Linear renders a solid colored disc with white uppercase initials,
 * with the disc colour deterministically derived from the user's
 * id/email so the same user always gets the same colour everywhere.
 *
 * This module exports the pure helpers; the React component lives in
 * `components/initials-avatar.tsx`. Splitting them keeps the colour
 * + initials logic unit-testable without React Testing Library.
 */

/**
 * The fixed palette of "vibrant but readable on white text" colours
 * used for synthetic avatars. Eight values is enough variety for
 * 15 users to feel distinct while remaining a small set the eye can
 * recognise (so a user's avatar feels stable across reloads).
 */
export const AVATAR_PALETTE = [
  "#7c3aed", // violet
  "#2563eb", // blue
  "#0891b2", // cyan
  "#059669", // emerald
  "#ca8a04", // yellow-600
  "#ea580c", // orange-600
  "#dc2626", // red-600
  "#db2777", // pink-600
] as const

export type AvatarColor = (typeof AVATAR_PALETTE)[number]

/**
 * Hash a string into a stable index into AVATAR_PALETTE. Uses the
 * same FNV-1a-style multiply-and-XOR construction we use elsewhere
 * for content-derived colors, so two callers passing the same seed
 * always land on the same color.
 */
export function hashStringToIndex(seed: string, modulo: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  // Math.abs to normalize the negative-int case before %.
  return Math.abs(h) % Math.max(1, modulo)
}

/** Pick a palette colour for the given seed. */
export function colorForSeed(seed: string): AvatarColor {
  return AVATAR_PALETTE[hashStringToIndex(seed, AVATAR_PALETTE.length)]
}

/**
 * Compute up-to-2-character uppercase initials from a display name.
 * Falls back to the first character of the seed if the name is empty.
 */
export function initialsFromName(name: string, fallbackSeed = ""): string {
  const trimmed = name.trim()
  if (!trimmed) {
    return (fallbackSeed.trim().charAt(0) || "?").toUpperCase()
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Bundle of style props consumed by the React component. Returning
 * a plain object means tests can assert the exact colour/initials
 * for a given seed without spinning up a renderer.
 */
export interface InitialsAvatarSpec {
  initials: string
  backgroundColor: AvatarColor
}

export function specForUser(name: string, seed: string): InitialsAvatarSpec {
  return {
    initials: initialsFromName(name, seed),
    backgroundColor: colorForSeed(seed || name),
  }
}
