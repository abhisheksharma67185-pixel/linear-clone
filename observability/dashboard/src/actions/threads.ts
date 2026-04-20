"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

export async function createConversationThreadAction(
  projectId: string,
  data: {
    title: string;
    external_id?: string;
    user_id?: string;
    session_id?: string;
    metadata?: Record<string, unknown>;
    trace_ids?: string[];
  }
) {
  const thread = await api.createConversationThread(projectId, data);
  revalidatePath("/");
  return thread;
}

export async function updateConversationThreadAction(
  threadId: string,
  patch: {
    title?: string;
    external_id?: string;
    user_id?: string;
    session_id?: string;
    metadata?: Record<string, unknown>;
    trace_ids?: string[];
  }
) {
  const thread = await api.updateConversationThread(threadId, patch);
  revalidatePath("/");
  return thread;
}

export async function deleteConversationThreadAction(threadId: string) {
  await api.deleteConversationThread(threadId);
  revalidatePath("/");
}
