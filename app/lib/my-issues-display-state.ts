export type Layout = "list" | "board"

export type GroupingKind =
  | "none"
  | "focus"
  | "status"
  | "agent"
  | "assignee"
  | "project"
  | "priority"
  | "cycle"
  | "labels"
  | "team"

export type SubGroupingKind =
  | "none"
  | "status"
  | "agent"
  | "assignee"
  | "project"
  | "priority"
  | "cycle"
  | "labels"
  | "team"

export type Ordering =
  | "priority"
  | "lastUpdated"
  | "lastCreated"
  | "manual"
  | "importance"

export type CompletedIssues =
  | "all"
  | "pastDay"
  | "pastWeek"
  | "pastMonth"
  | "none"

export const DISPLAY_PROPERTIES = [
  "ID",
  "Status",
  "Assignee",
  "Priority",
  "Project",
  "Due date",
  "Milestone",
  "Labels",
  "Links",
  "Time in status",
  "Created",
  "Updated",
] as const
export type DisplayProperty = (typeof DISPLAY_PROPERTIES)[number]

export interface DisplayState {
  layout: Layout
  grouping: GroupingKind
  subGrouping: SubGroupingKind
  ordering: Ordering
  orderCompletedByRecency: boolean
  completedIssues: CompletedIssues
  showSubIssues: boolean
  nestedSubIssues: boolean
  displayProperties: DisplayProperty[]
}

export const DEFAULT_DISPLAY: DisplayState = {
  layout: "list",
  grouping: "focus",
  subGrouping: "none",
  ordering: "importance",
  orderCompletedByRecency: false,
  completedIssues: "pastDay",
  showSubIssues: true,
  nestedSubIssues: false,
  displayProperties: ["ID", "Status", "Assignee", "Priority", "Updated"],
}

export const DISPLAY_STORAGE_KEY = "linear:my-issues:display:v1"

export function loadDisplay(): DisplayState {
  if (typeof window === "undefined") return DEFAULT_DISPLAY
  try {
    const raw = window.localStorage.getItem(DISPLAY_STORAGE_KEY)
    if (!raw) return DEFAULT_DISPLAY
    const parsed = JSON.parse(raw) as Partial<DisplayState>
    return { ...DEFAULT_DISPLAY, ...parsed }
  } catch {
    return DEFAULT_DISPLAY
  }
}

export function saveDisplay(state: DisplayState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota or privacy-mode errors
  }
}
