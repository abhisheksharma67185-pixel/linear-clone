/**
 * Solid colored disc + white uppercase initials, used wherever a
 * user has no uploaded photo. Replaces the dashed/transparent ring
 * placeholder that used to read as "missing data" in the project
 * Lead column.
 *
 * The colour and initials come from the pure helpers in
 * `lib/initials-avatar.ts` so the same user always gets the same
 * disc colour anywhere in the app.
 */

import { specForUser } from "@/lib/initials-avatar"

export function InitialsAvatar({
  name,
  seed,
  size = 22,
  fontWeight = 600,
  className = "",
  title,
  ariaLabel,
}: {
  /** Display name used to derive initials. */
  name: string
  /**
   * Stable seed used to pick the disc colour. Pass the user's id or
   * email so the colour is consistent across surfaces. Defaults to
   * `name` if absent (less stable but visually coherent).
   */
  seed?: string
  /** Diameter in px. Linear's compact discs are ~22px. */
  size?: number
  /** font-weight for the initials. Linear uses 600. */
  fontWeight?: number
  className?: string
  title?: string
  ariaLabel?: string
}) {
  const { initials, backgroundColor } = specForUser(name, seed ?? name)
  return (
    <span
      data-testid="initials-avatar"
      data-avatar-color={backgroundColor}
      role="img"
      aria-label={ariaLabel ?? name}
      title={title ?? name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
        fontWeight,
      }}
    >
      {initials}
    </span>
  )
}
