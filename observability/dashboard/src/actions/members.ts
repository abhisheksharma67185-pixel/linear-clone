"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";
import type { Role } from "@/lib/types";

export async function inviteMemberAction(orgId: string, email: string, role: Role) {
  await api.inviteMember(orgId, email, role);
  revalidatePath(`/`);
}
