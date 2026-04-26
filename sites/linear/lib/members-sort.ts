/**
 * Pure sort comparator for the Members admin table.
 *
 * Extracted from the React component so the null-handling contract
 * (treat null as the SMALLEST value, deterministic across asc + desc)
 * is unit-testable. The component imports `compareByMembersColumn`
 * and applies it inside its useMemo'd `sorted` array.
 *
 * Two invariants the unit tests pin:
 *   1. compare(null, X) treats null as smaller than X — so nulls
 *      land at the top on ascending and the bottom on descending.
 *   2. compare(a, b) === -compare(b, a) for any (a, b) pair.
 *      Without this property, sort stability across React re-renders
 *      isn't guaranteed.
 */

export type MembersSortKey =
  | "name"
  | "email"
  | "status"
  | "teamCount"
  | "joinedAt"
  | "lastSeenAt"

export type MembersSortDirection = 1 | -1

/**
 * Generic value comparator with the "null is smallest" rule baked in.
 * `direction = 1` is ascending; `-1` is descending. The same function
 * powers both — descending negates the result of ascending — so we
 * never have a code path that's only exercised in one direction.
 */
export function compareNullSmallest<T extends string | number | null>(
  a: T,
  b: T,
  direction: MembersSortDirection
): number {
  if (a == null && b == null) return 0
  // null < anything: ascending puts null first; descending puts null last.
  if (a == null) return -1 * direction
  if (b == null) return 1 * direction
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * direction
  }
  return String(a).localeCompare(String(b)) * direction
}

/**
 * Convenience overload for the Members table specifically.
 */
export function compareByMembersColumn<
  M extends Record<MembersSortKey, unknown>,
>(
  a: M,
  b: M,
  key: MembersSortKey,
  direction: MembersSortDirection
): number {
  return compareNullSmallest(
    a[key] as string | number | null,
    b[key] as string | number | null,
    direction
  )
}
