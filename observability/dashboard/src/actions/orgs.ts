"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";

export async function createOrgAction(name: string) {
  const org = await api.createOrg(name);
  revalidatePath("/");
  return org;
}
