"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

export async function createWebhookAction(
  projectId: string,
  url: string,
  events: string[],
  active = true
) {
  const webhook = await api.createWebhook(projectId, url, events, active);
  revalidatePath("/");
  return webhook;
}

export async function updateWebhookAction(
  projectId: string,
  webhookId: string,
  patch: { url?: string; events?: string[]; active?: boolean }
) {
  const webhook = await api.updateWebhook(projectId, webhookId, patch);
  revalidatePath("/");
  return webhook;
}

export async function deleteWebhookAction(projectId: string, webhookId: string) {
  await api.deleteWebhook(projectId, webhookId);
  revalidatePath("/");
}
