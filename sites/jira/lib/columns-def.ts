export interface ColumnDef {
  id: string
  label: string
  icon: string
  enabled: boolean
  locked: boolean
  /** True for custom fields added by users */
  custom?: boolean
  /** Field type for custom columns */
  fieldType?: "Text" | "Number" | "User" | "Select" | "Date" | "URL"
  /** Options for Select type */
  options?: string[]
  /** Allow multiple selections (Select type only) */
  multi?: boolean
}

export const BUILT_IN_COLUMN_IDS = [
  "name",
  "status",
  "progress",
  "target_date",
  "owner",
  "following",
  "last_updated",
  "tags",
  "team",
  "contributing",
  "follower_count",
] as const

/** Labels that cannot be used for custom fields */
export const RESERVED_LABELS = [
  "Name",
  "Status",
  "Progress",
  "Target date",
  "Owner",
  "Following",
  "Last updated",
  "Tags",
  "Team",
  "Department",
  "Project key",
  "Sponsor",
]

export const BASE_COLUMNS_DEF: ColumnDef[] = [
  { id: "name", label: "Name", icon: "type", enabled: true, locked: true },
  {
    id: "status",
    label: "Status",
    icon: "status",
    enabled: true,
    locked: false,
  },
  {
    id: "progress",
    label: "Progress",
    icon: "activity",
    enabled: true,
    locked: false,
  },
  {
    id: "target_date",
    label: "Target date",
    icon: "calendar",
    enabled: true,
    locked: false,
  },
  { id: "owner", label: "Owner", icon: "user", enabled: true, locked: false },
  {
    id: "following",
    label: "Following",
    icon: "eye",
    enabled: true,
    locked: false,
  },
  {
    id: "last_updated",
    label: "Last updated",
    icon: "calendar",
    enabled: true,
    locked: false,
  },
  { id: "tags", label: "Tags", icon: "hash", enabled: false, locked: false },
  { id: "team", label: "Team", icon: "team", enabled: false, locked: false },
  {
    id: "contributing",
    label: "Contributing projects",
    icon: "link",
    enabled: false,
    locked: false,
  },
  {
    id: "follower_count",
    label: "Follower count",
    icon: "bar",
    enabled: false,
    locked: false,
  },
]

/** Column widths used for grid layout in list views */
export const COL_WIDTHS: Record<string, string> = {
  name: "1fr",
  status: "90px",
  progress: "120px",
  target_date: "110px",
  owner: "60px",
  following: "80px",
  last_updated: "110px",
  tags: "80px",
  team: "80px",
  contributing: "150px",
  follower_count: "110px",
}

export function customColWidth(fieldType: string | undefined): string {
  if (fieldType === "Number") return "90px"
  if (fieldType === "User") return "120px"
  return "120px"
}
