// Shared helpers for the Import & Export settings page's issue export flow.

export type IncludePrivateTeams = "none" | "all"

export type ExportIssuesRequest = {
  includePrivateTeams: IncludePrivateTeams
}

export function buildExportRequest(
  includePrivateTeams: unknown
): ExportIssuesRequest {
  // Narrow unknown → the canonical union, defaulting to "none" for anything
  // unexpected so the payload shape is always well-formed.
  const v =
    includePrivateTeams === "all"
      ? ("all" as const)
      : ("none" as const)
  return { includePrivateTeams: v }
}

export function privateTeamsLabel(value: IncludePrivateTeams): string {
  return value === "all" ? "All" : "None"
}
