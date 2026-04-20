"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

export async function createMonitorConfigAction(
  projectId: string,
  data: {
    name: string;
    description?: string;
    signal_key: string;
    operator: string;
    warn_threshold?: number;
    critical_threshold?: number;
    window_minutes?: number;
    group_by?: string;
    filters?: Record<string, unknown>;
    active?: boolean;
  }
) {
  const monitor = await api.createMonitorConfig(projectId, data);
  revalidatePath("/");
  return monitor;
}

export async function updateMonitorConfigAction(
  monitorId: string,
  patch: {
    name?: string;
    description?: string;
    signal_key?: string;
    operator?: string;
    warn_threshold?: number;
    critical_threshold?: number;
    window_minutes?: number;
    group_by?: string;
    filters?: Record<string, unknown>;
    active?: boolean;
  }
) {
  const monitor = await api.updateMonitorConfig(monitorId, patch);
  revalidatePath("/");
  return monitor;
}

export async function deleteMonitorConfigAction(monitorId: string) {
  await api.deleteMonitorConfig(monitorId);
  revalidatePath("/");
}
