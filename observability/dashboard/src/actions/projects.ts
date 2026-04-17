"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as api from "@/lib/api";

export async function createProjectAction(orgId: string, name: string) {
  const project = await api.createProject(orgId, name);
  revalidatePath("/");
  return project;
}

export async function updateProjectRetentionAction(projectId: string, retentionDays: number) {
  const project = await api.updateProject(projectId, { retention_days: retentionDays });
  revalidatePath("/");
  return project;
}

export async function switchProjectAction(orgSlug: string, projectSlug: string) {
  redirect(`/${orgSlug}/${projectSlug}/traces`);
}
