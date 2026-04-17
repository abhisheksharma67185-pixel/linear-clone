"use server";

import * as api from "@/lib/api";
import type { ListTracesFilters, SavedFilter } from "@/lib/types";

export async function listSavedFiltersAction(
  projectId: string
): Promise<SavedFilter[]> {
  return api.listSavedFilters(projectId);
}

export async function createSavedFilterAction(
  projectId: string,
  name: string,
  filters: ListTracesFilters,
  color?: string
): Promise<SavedFilter> {
  return api.createSavedFilter(projectId, { name, filters, color });
}

export async function deleteSavedFilterAction(
  filterId: string
): Promise<void> {
  return api.deleteSavedFilter(filterId);
}
