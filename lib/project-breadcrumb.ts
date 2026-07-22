/**
 * Derive the project-detail breadcrumb from server-known route data.
 *
 * The bug we're fixing: the breadcrumb varied based on entry path —
 * a direct navigation showed only the project name, while clicking
 * from the projects list showed "Team › Project". The fix is to
 * derive the hierarchy purely from the URL params + the project
 * record, so the same crumb appears regardless of how the user got
 * there.
 *
 * Returns crumbs in display order (root → leaf). Each crumb is a
 * `{ label, href? }` so the leaf can be rendered as plain text and
 * earlier segments as links.
 */

import type { Project, Team } from "@/app/lib/mock-data"

export interface BreadcrumbCrumb {
  label: string
  /** Omit `href` for the leaf (current page). */
  href?: string
}

/**
 * Build the project breadcrumb. Inputs are intentionally minimal —
 * just the project + an optional team — so callers don't have to
 * shape data for this helper.
 */
export function buildProjectBreadcrumb(
  project: Pick<Project, "name" | "id">,
  team: Pick<Team, "name" | "key"> | null
): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = []
  // Always start with Workspace > Team if we know the team. When the
  // team isn't yet loaded (race), we fall back to "Projects" as the
  // root so the crumb never goes blank.
  if (team) {
    crumbs.push({
      label: team.name,
      href: `/teams/${team.key.toLowerCase()}/issues`,
    })
  } else {
    crumbs.push({ label: "Projects", href: "/projects" })
  }
  crumbs.push({ label: project.name })
  return crumbs
}
