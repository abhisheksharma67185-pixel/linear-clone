"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

export async function listIncidentsAction(projectId: string, status?: string) {
  return api.listIncidents(projectId, status);
}

export async function getIncidentAction(incidentId: string) {
  return api.getIncident(incidentId);
}

export async function updateIncidentStatusAction(
  incidentId: string,
  status: string,
  revalidate?: string
) {
  await api.updateIncidentStatus(incidentId, status);
  if (revalidate) revalidatePath(revalidate);
}

export async function triggerIncidentDetectionAction(projectId: string) {
  await api.triggerIncidentDetection(projectId);
}
