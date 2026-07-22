/**
 * Filter helpers and constants for the Initiatives page tabs.
 *
 * The page previously rendered an "active"-only table and stubbed
 * Planned / Completed as static empty states. That meant a tab badge
 * showing "Active 2" could co-exist with a Planned tab showing the
 * empty banner — the badge and list were derived from different
 * sources of truth.
 *
 * Funnelling all three tabs through `bucketsForTabs` guarantees
 * `bucket.length === <badge>` because both the badge and the rendered
 * list read the same array. The unit test in
 * `__tests__/initiatives-tabs.test.ts` locks that contract.
 */
import type { NewInitiative } from "@/components/create-initiative-dialog"

export type InitiativeTab = "active" | "planned" | "completed"

export type InitiativeStatus = InitiativeTab

export interface InitiativeWithStatus extends NewInitiative {
  status?: InitiativeStatus
}

/**
 * Default tab order. The Initiatives header tabs render in this order
 * and the URL `?tab=` param accepts any of these strings.
 */
export const INITIATIVE_TABS: readonly InitiativeTab[] = [
  "active",
  "planned",
  "completed",
] as const

/**
 * Validate an unknown tab key from a URL search param. Falls back to
 * `"active"` when the value is missing or unrecognised.
 */
export function resolveTab(value: string | null | undefined): InitiativeTab {
  if (value === "planned" || value === "completed" || value === "active") {
    return value
  }
  return "active"
}

/**
 * Group initiatives into per-tab buckets. The contract is:
 *
 *   buckets.active.length     === <Active tab badge count>
 *   buckets.planned.length    === <Planned tab badge count>
 *   buckets.completed.length  === <Completed tab badge count>
 *
 * Initiatives without an explicit `status` default to "active" — that
 * matches Linear's behavior where freshly-created initiatives appear
 * on the Active tab until explicitly moved.
 */
export function bucketsForTabs(
  initiatives: InitiativeWithStatus[]
): Record<InitiativeTab, InitiativeWithStatus[]> {
  const buckets: Record<InitiativeTab, InitiativeWithStatus[]> = {
    active: [],
    planned: [],
    completed: [],
  }
  for (const init of initiatives) {
    const status: InitiativeStatus = init.status ?? "active"
    buckets[status].push(init)
  }
  return buckets
}

/**
 * Shorthand: list of initiatives for one tab.
 */
export function initiativesForTab(
  initiatives: InitiativeWithStatus[],
  tab: InitiativeTab
): InitiativeWithStatus[] {
  return bucketsForTabs(initiatives)[tab]
}
