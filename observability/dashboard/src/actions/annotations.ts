"use server";

import { revalidateTag } from "next/cache";
import * as api from "@/lib/api";
import type { AnnotationType } from "@/lib/types";

export async function listTraceAnnotationsAction(traceId: string) {
  return api.listTraceAnnotations(traceId);
}

export async function createAnnotationAction(
  traceId: string,
  data: {
    step_id?: string;
    project_id?: string;
    label?: string;
    score?: number;
    comment?: string;
    annotation_type?: AnnotationType;
    user_id?: string;
  }
) {
  const result = await api.createAnnotation(traceId, data);
  revalidateTag(`trace:${traceId}`, "max");
  return result;
}

export async function deleteAnnotationAction(annotationId: string, traceId: string) {
  await api.deleteAnnotation(annotationId);
  revalidateTag(`trace:${traceId}`, "max");
}

export async function listAnnotationLabelsAction(projectId: string) {
  return api.listAnnotationLabels(projectId);
}

export async function listProjectAnnotationsAction(
  projectId: string,
  opts?: { label?: string; annotation_type?: string; limit?: number }
) {
  return api.listProjectAnnotations(projectId, opts);
}
