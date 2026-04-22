// Status badges for issues
export const statusVariant: Record<string, string> = {
  to_do: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  in_review:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
}

// Priority badges
export const priorityVariant: Record<string, string> = {
  highest: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  lowest: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
}

// Issue type badges
export const typeVariant: Record<string, string> = {
  story: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  task: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  bug: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  subtask: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
}

// Type display labels
export const typeLabel: Record<string, string> = {
  story: "Story",
  task: "Task",
  bug: "Bug",
  subtask: "Sub-task",
}

// Priority display labels
export const priorityDisplayLabel: Record<string, string> = {
  highest: "Highest",
  high: "High",
  medium: "Medium",
  low: "Low",
  lowest: "Lowest",
}

// Sprint state badges
export const sprintStateVariant: Record<string, string> = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  future: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
}

// Sprint state display labels
export const sprintStateLabel: Record<string, string> = {
  active: "Active",
  closed: "Closed",
  future: "Future",
}

// Project type badges
export const projectTypeVariant: Record<string, string> = {
  scrum: "border-blue-300 text-blue-700 dark:text-blue-400",
  kanban: "border-purple-300 text-purple-700 dark:text-purple-400",
}

// Project type display labels
export const projectTypeLabel: Record<string, string> = {
  scrum: "Scrum",
  kanban: "Kanban",
}

// Project status badges (for project directory)
export const projectStatusVariant: Record<string, string> = {
  "ON TRACK":
    "border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  "AT RISK":
    "border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  "OFF TRACK":
    "border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
}

// Goal status styles
export const goalStatusVariant: Record<string, string> = {
  "On track": "bg-green-500",
  "At risk": "bg-yellow-500",
  "Off track": "bg-red-500",
}

// Canonical display labels for issue statuses
export const statusDisplayLabel: Record<string, string> = {
  to_do: "TO DO",
  in_progress: "IN PROGRESS",
  in_review: "IN REVIEW",
  done: "DONE",
}

// Format status for display — uses the canonical map, falls back to title-casing
export function formatStatus(status: string): string {
  return (
    statusDisplayLabel[status] ??
    status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  )
}
