"use server";

import * as api from "@/lib/api";

export async function listMetricsAction(projectId: string) {
  return api.listMetrics(projectId);
}

export async function listMetricEventsAction(metricId: string, limit?: number) {
  return api.listMetricEvents(metricId, limit);
}
