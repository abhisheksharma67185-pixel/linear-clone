"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

export async function createKeyAction(projectId: string, name: string) {
  const key = await api.createApiKey(projectId, name);
  revalidatePath(`/`);
  return key;
}

export async function revokeKeyAction(projectId: string, keyId: string) {
  await api.revokeApiKey(projectId, keyId);
  revalidatePath(`/`);
}
