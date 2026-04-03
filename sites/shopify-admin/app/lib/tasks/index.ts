import type { TaskDefinition, TaskDomain, TaskDifficulty, TaskType } from "./types";
import { navigationTasks } from "./navigation";
import { productTasks } from "./products";
import { orderTasks } from "./orders";
import { customerTasks } from "./customers";
import { discountTasks } from "./discounts";
import { settingsTasks } from "./settings";
import { searchTasks } from "./search";
import { multiDomainTasks } from "./multi-domain";
import { retrievalTasks } from "./retrieval";
import { impossibleTasks } from "./impossible";

// ---------------------------------------------------------------------------
// Build indexed lookup maps for O(1) access
// ---------------------------------------------------------------------------

const allTasks: TaskDefinition[] = [
  ...navigationTasks,
  ...productTasks,
  ...orderTasks,
  ...customerTasks,
  ...discountTasks,
  ...settingsTasks,
  ...searchTasks,
  ...multiDomainTasks,
  ...retrievalTasks,
  ...impossibleTasks,
];

const taskById = new Map<string, TaskDefinition>(allTasks.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getTaskById(id: string): TaskDefinition | undefined {
  return taskById.get(id);
}

export function getAllTasks(): TaskDefinition[] {
  return allTasks;
}

export function getTasksByDomain(domain: TaskDomain): TaskDefinition[] {
  return allTasks.filter((t) => t.domain === domain);
}

export function getTasksByDifficulty(difficulty: TaskDifficulty): TaskDefinition[] {
  return allTasks.filter((t) => t.difficulty === difficulty);
}

export function getTasksByType(type: TaskType): TaskDefinition[] {
  return allTasks.filter((t) => t.type === type);
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
