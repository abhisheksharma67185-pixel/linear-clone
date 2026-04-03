import type { TaskDefinition, TaskDomain, TaskDifficulty, TaskType } from "./types";

// ---------------------------------------------------------------------------
// Generic task registry — sites register their tasks into this
// ---------------------------------------------------------------------------

const allTasks: TaskDefinition[] = [];
const taskById = new Map<string, TaskDefinition>();

export function registerTasks(tasks: TaskDefinition[]): void {
  for (const task of tasks) {
    if (!taskById.has(task.id)) {
      allTasks.push(task);
      taskById.set(task.id, task);
    }
  }
}

export function getTaskById(id: string): TaskDefinition | undefined {
  return taskById.get(id);
}

export function getAllTasks(): TaskDefinition[] {
  return allTasks;
}

export function getTasksByCriteria(criteria: {
  domain?: TaskDomain;
  difficulty?: TaskDifficulty;
  type?: TaskType;
  stage?: number;
  site?: string;
}): TaskDefinition[] {
  return allTasks.filter((t) => {
    if (criteria.domain && t.domain !== criteria.domain) return false;
    if (criteria.difficulty && t.difficulty !== criteria.difficulty) return false;
    if (criteria.type && t.type !== criteria.type) return false;
    if (criteria.stage !== undefined && t.curriculumStage !== criteria.stage) return false;
    if (criteria.site && t.site !== criteria.site) return false;
    return true;
  });
}

export function getTaskCount(): number {
  return allTasks.length;
}

export function clearTasks(): void {
  allTasks.length = 0;
  taskById.clear();
}
