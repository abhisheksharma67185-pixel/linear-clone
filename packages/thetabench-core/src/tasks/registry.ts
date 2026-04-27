import type {
  TaskDefinition,
  TaskDomain,
  TaskDifficulty,
  TaskType,
} from "./types"
import { defaultEngine } from "../sim-engine"

// ---------------------------------------------------------------------------
// Task registry — thin shims around `defaultEngine`. Sites continue to call
// `registerTasks(...)` at module init; the underlying state lives on the
// SimEngine instance.
// ---------------------------------------------------------------------------

export function registerTasks(tasks: TaskDefinition[]): void {
  defaultEngine.registerTasks(tasks)
}

export function getTaskById(id: string): TaskDefinition | undefined {
  return defaultEngine.getTaskById(id)
}

export function getAllTasks(): TaskDefinition[] {
  return defaultEngine.getAllTasks()
}

export function getTasksByCriteria(criteria: {
  domain?: TaskDomain
  difficulty?: TaskDifficulty
  type?: TaskType
  stage?: number
  site?: string
}): TaskDefinition[] {
  return defaultEngine.getTasksByCriteria(criteria)
}

export function getTaskCount(): number {
  return defaultEngine.getTaskCount()
}

export function clearTasks(): void {
  defaultEngine.clearTasks()
}
