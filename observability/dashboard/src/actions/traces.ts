"use server";

import { revalidateTag } from "next/cache";
import * as api from "@/lib/api";
import type { ListTracesFilters } from "@/lib/types";

export async function listTracesAction(projectId: string, filters: ListTracesFilters) {
  return api.listTraces(projectId, filters);
}

export async function getTraceAction(traceId: string) {
  return api.getTrace(traceId);
}

export async function flagTraceAction(traceId: string) {
  const res = await api.flagTraceForReview(traceId);
  revalidateTag(`trace:${traceId}`, "default");
  return res;
}

export async function semanticSearchAction(projectId: string, query: string, limit?: number) {
  return api.semanticSearch(projectId, query, limit);
}

export async function listTraceMetadataFieldsAction(projectId: string, sampleLimit?: number) {
  return api.listProjectMetadataFields(projectId, sampleLimit);
}
