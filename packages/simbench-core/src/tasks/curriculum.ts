import { getAllTasks } from "./registry";
import type { TaskDefinition } from "./types";
import type { CurriculumStage } from "../types";

// ---------------------------------------------------------------------------
// Generic curriculum builder — builds stages from registered tasks
// ---------------------------------------------------------------------------

const STAGE_DEFINITIONS: Omit<CurriculumStage, "taskIds">[] = [
  {
    stage: 1,
    title: "Navigation Basics",
    description: "Navigate between pages and identify content",
    domains: ["navigation"],
    difficultyRange: ["easy", "easy"],
  },
  {
    stage: 2,
    title: "Single Field Reads & Updates",
    description: "Read data and modify one field on existing entities",
    domains: ["products", "customers", "settings", "retrieval"],
    difficultyRange: ["easy", "easy"],
  },
  {
    stage: 3,
    title: "Entity Creation",
    description: "Create new entities",
    domains: ["products", "customers", "discounts"],
    difficultyRange: ["easy", "medium"],
  },
  {
    stage: 4,
    title: "Order Operations",
    description: "Fulfill orders, capture payments, issue refunds",
    domains: ["orders"],
    difficultyRange: ["medium", "medium"],
  },
  {
    stage: 5,
    title: "Multi-Field Operations",
    description: "Update multiple fields in one operation",
    domains: ["products", "customers", "discounts", "settings"],
    difficultyRange: ["medium", "medium"],
  },
  {
    stage: 6,
    title: "Search & Information Retrieval",
    description: "Find specific data using search and calculation",
    domains: ["search", "retrieval"],
    difficultyRange: ["medium", "hard"],
  },
  {
    stage: 7,
    title: "Conditional Logic",
    description: "Tasks requiring inspection before action",
    domains: ["products", "orders"],
    difficultyRange: ["hard", "hard"],
  },
  {
    stage: 8,
    title: "Error Recognition & Multi-Step",
    description: "Impossible tasks and multi-step workflows",
    domains: ["orders", "products", "discounts", "impossible"],
    difficultyRange: ["hard", "hard"],
  },
  {
    stage: 9,
    title: "Cross-Domain Workflows",
    description: "Tasks spanning multiple domains",
    domains: ["multi-domain"],
    difficultyRange: ["hard", "expert"],
  },
  {
    stage: 10,
    title: "Expert Scenarios",
    description: "Complex real-world scenarios with multiple objectives",
    domains: ["multi-domain"],
    difficultyRange: ["expert", "expert"],
  },
];

export function getCurriculum(): CurriculumStage[] {
  const tasks = getAllTasks();
  const byStage = new Map<number, TaskDefinition[]>();

  for (const task of tasks) {
    const existing = byStage.get(task.curriculumStage) ?? [];
    existing.push(task);
    byStage.set(task.curriculumStage, existing);
  }

  return STAGE_DEFINITIONS.map((def) => ({
    ...def,
    taskIds: (byStage.get(def.stage) ?? []).map((t) => t.id),
  }));
}

export function getStageForTask(taskId: string): CurriculumStage | undefined {
  const tasks = getAllTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return undefined;
  return getCurriculum().find((s) => s.stage === task.curriculumStage);
}
