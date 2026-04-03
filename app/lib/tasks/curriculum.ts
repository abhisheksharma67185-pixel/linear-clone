import { getAllTasks } from "./index";
import type { TaskDefinition } from "./types";

// ---------------------------------------------------------------------------
// Curriculum stage definitions
// ---------------------------------------------------------------------------

export interface CurriculumStage {
  stage: number;
  title: string;
  description: string;
  domains: string[];
  difficultyRange: [string, string];
  taskIds: string[];
}

export function getCurriculum(): CurriculumStage[] {
  const tasks = getAllTasks();
  const byStage = new Map<number, TaskDefinition[]>();

  for (const task of tasks) {
    const existing = byStage.get(task.curriculumStage) ?? [];
    existing.push(task);
    byStage.set(task.curriculumStage, existing);
  }

  const stages: CurriculumStage[] = [
    { stage: 1, title: "Navigation Basics", description: "Navigate between admin pages and identify page content", domains: ["navigation"], difficultyRange: ["easy", "easy"], taskIds: [] },
    { stage: 2, title: "Single Field Reads & Updates", description: "Read data and modify one field on existing entities", domains: ["products", "customers", "settings", "retrieval"], difficultyRange: ["easy", "easy"], taskIds: [] },
    { stage: 3, title: "Entity Creation", description: "Create new products, customers, and discounts", domains: ["products", "customers", "discounts"], difficultyRange: ["easy", "medium"], taskIds: [] },
    { stage: 4, title: "Order Operations", description: "Fulfill orders, capture payments, issue refunds, add notes", domains: ["orders"], difficultyRange: ["medium", "medium"], taskIds: [] },
    { stage: 5, title: "Multi-Field Operations", description: "Update multiple fields in one operation", domains: ["products", "customers", "discounts", "settings"], difficultyRange: ["medium", "medium"], taskIds: [] },
    { stage: 6, title: "Search & Information Retrieval", description: "Find specific data using search, filters, and calculation", domains: ["search", "retrieval"], difficultyRange: ["medium", "hard"], taskIds: [] },
    { stage: 7, title: "Conditional Logic", description: "Tasks requiring inspection before action, multi-entity operations", domains: ["products", "orders"], difficultyRange: ["hard", "hard"], taskIds: [] },
    { stage: 8, title: "Error Recognition & Multi-Step", description: "Impossible tasks, multi-step workflows in one domain", domains: ["orders", "products", "discounts", "impossible"], difficultyRange: ["hard", "hard"], taskIds: [] },
    { stage: 9, title: "Cross-Domain Workflows", description: "Tasks spanning products, orders, customers, and discounts", domains: ["multi-domain"], difficultyRange: ["hard", "expert"], taskIds: [] },
    { stage: 10, title: "Expert Scenarios", description: "Complex real-world merchant scenarios with multiple objectives", domains: ["multi-domain"], difficultyRange: ["expert", "expert"], taskIds: [] },
  ];

  // Populate task IDs from actual task data
  for (const stage of stages) {
    const stageTasks = byStage.get(stage.stage) ?? [];
    stage.taskIds = stageTasks.map((t) => t.id);
  }

  return stages;
}

export function getStageForTask(taskId: string): CurriculumStage | undefined {
  const tasks = getAllTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return undefined;

  const curriculum = getCurriculum();
  return curriculum.find((s) => s.stage === task.curriculumStage);
}
