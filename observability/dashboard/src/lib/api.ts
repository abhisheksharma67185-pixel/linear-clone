import "server-only";
import { env } from "./env";
import { auth } from "./auth";
import type {
  Annotation,
  AnnotationType,
  ApiKey,
  Cluster,
  Incident,
  ListTracesFilters,
  Member,
  Metric,
  MetricEvent,
  Organization,
  Project,
  SavedFilter,
  SearchResult,
  Trace,
  TraceSummary,
  Usage,
  Webhook,
} from "./types";

interface ApiOptions extends RequestInit {
  tag?: string;
}

async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const session = await auth().catch(() => null);
  const token = (session as unknown as { accessToken?: string })?.accessToken;
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...opts,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
    next: opts.tag ? { tags: [opts.tag] } : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[api ${res.status}] ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

function filtersToQuery(f: ListTracesFilters): string {
  const p = new URLSearchParams();
  if (f.search) p.set("q", f.search);
  f.status?.forEach((s) => p.append("status", s));
  f.platform?.forEach((s) => p.append("platform", s));
  f.model?.forEach((s) => p.append("model", s));
  f.run_type?.forEach((s) => p.append("run_type", s));
  f.use_case?.forEach((s) => p.append("use_case", s));
  if (f.user_id) p.set("user_id", f.user_id);
  if (f.run_id) p.set("run_id", f.run_id);
  if (f.group) p.set("group", f.group);
  f.metadata?.forEach((filter) => {
    if (!filter.key || !filter.value) return;
    p.append("meta_key", filter.key);
    p.append("meta_value", filter.value);
  });
  if (f.time_range) p.set("time_range", f.time_range);
  if (f.sort) p.set("sort", f.sort);
  if (f.cursor) p.set("cursor", f.cursor);
  p.set("limit", String(f.limit ?? 100));
  return p.toString();
}

// ── Traces ───────────────────────────────────────────────────────────────

export async function listTraces(
  projectId: string,
  filters: ListTracesFilters = {}
): Promise<{ data: TraceSummary[]; next_cursor?: string }> {
  try {
    const qs = filtersToQuery({ ...filters });
    const body = await apiFetch<{
      items?: TraceSummary[];
      data?: TraceSummary[];
      next_cursor?: string;
    }>(`/v1/traces?project_id=${projectId}&${qs}`);
    return { data: body.items ?? body.data ?? [], next_cursor: body.next_cursor };
  } catch (e) {
    console.error("listTraces failed:", e);
    return { data: [] };
  }
}

export async function getTrace(traceId: string): Promise<Trace> {
  const body = await apiFetch<{ meta: TraceSummary; trace: Trace }>(
    `/v1/traces/${traceId}`,
    { tag: `trace:${traceId}` }
  );
  return body.trace ?? (body as unknown as Trace);
}

export async function flagTraceForReview(traceId: string): Promise<{ ok: true }> {
  return apiFetch(`/v1/traces/${traceId}/flag`, { method: "POST" });
}

// ── Orgs / Projects ──────────────────────────────────────────────────────

export async function createOrg(name: string, slug?: string): Promise<Organization> {
  return apiFetch("/v1/orgs", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
}

export async function createProject(
  orgId: string,
  name: string,
  slug?: string,
  description?: string
): Promise<Project> {
  return apiFetch("/v1/projects", {
    method: "POST",
    body: JSON.stringify({ org_id: orgId, name, slug, description }),
  });
}

export async function updateProject(
  projectId: string,
  patch: Partial<Pick<Project, "name" | "slug" | "description" | "retention_days">>
): Promise<Project> {
  return apiFetch(`/v1/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ── API Keys ─────────────────────────────────────────────────────────────

export async function listApiKeys(projectId: string): Promise<ApiKey[]> {
  try {
    const body = await apiFetch<{ items?: ApiKey[] } | ApiKey[]>(
      `/v1/projects/${projectId}/keys`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function createApiKey(
  projectId: string,
  name: string
): Promise<ApiKey & { secret: string }> {
  const body = await apiFetch<ApiKey & { secret?: string; plaintext?: string }>(
    `/v1/projects/${projectId}/keys`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );
  return {
    ...body,
    secret: body.secret ?? body.plaintext ?? "",
  };
}

export async function revokeApiKey(projectId: string, keyId: string): Promise<void> {
  await apiFetch(`/v1/projects/${projectId}/keys/${keyId}`, { method: "DELETE" });
}

// ── Members ──────────────────────────────────────────────────────────────

export async function listMembers(orgId: string): Promise<Member[]> {
  try {
    const body = await apiFetch<{ items?: Member[] } | Member[]>(
      `/v1/orgs/${orgId}/members`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function inviteMember(
  orgId: string,
  email: string,
  role: Member["role"]
): Promise<void> {
  await apiFetch(`/v1/invites`, {
    method: "POST",
    body: JSON.stringify({ org_id: orgId, email, role }),
  });
}

// ── Metrics ──────────────────────────────────────────────────────────────

export async function listMetrics(projectId: string): Promise<Metric[]> {
  try {
    const body = await apiFetch<{ items?: Metric[] } | Metric[]>(
      `/v1/metrics?project_id=${projectId}`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function listMetricEvents(
  metricId: string,
  limit = 50
): Promise<MetricEvent[]> {
  try {
    const body = await apiFetch<{ items?: MetricEvent[] } | MetricEvent[]>(
      `/v1/metrics/${metricId}/events?limit=${limit}`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

// ── Webhooks ─────────────────────────────────────────────────────────────

export async function listWebhooks(projectId: string): Promise<Webhook[]> {
  try {
    const body = await apiFetch<{ items?: Webhook[] } | Webhook[]>(
      `/v1/projects/${projectId}/webhooks`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function createWebhook(
  projectId: string,
  url: string,
  events: string[],
  active = true
): Promise<Webhook & { secret: string }> {
  return apiFetch(`/v1/projects/${projectId}/webhooks`, {
    method: "POST",
    body: JSON.stringify({ url, events, active }),
  });
}

export async function updateWebhook(
  projectId: string,
  webhookId: string,
  patch: Partial<Pick<Webhook, "url" | "events" | "active">>
): Promise<Webhook> {
  return apiFetch(`/v1/projects/${projectId}/webhooks/${webhookId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteWebhook(projectId: string, webhookId: string): Promise<void> {
  await apiFetch(`/v1/projects/${projectId}/webhooks/${webhookId}`, {
    method: "DELETE",
  });
}

// ── Incidents ────────────────────────────────────────────────────────────

export async function listIncidents(
  projectId: string,
  status?: string
): Promise<Incident[]> {
  try {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    const body = await apiFetch<{ items?: Incident[] } | Incident[]>(
      `/v1/incidents?project_id=${projectId}&${p}`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function getIncident(incidentId: string): Promise<Incident> {
  return apiFetch<Incident>(`/v1/incidents/${incidentId}`);
}

export async function updateIncidentStatus(
  incidentId: string,
  status: string
): Promise<void> {
  await apiFetch(`/v1/incidents/${incidentId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function triggerIncidentDetection(projectId: string): Promise<void> {
  await apiFetch(`/v1/incidents/detect`, {
    method: "POST",
    body: JSON.stringify({ project_id: projectId }),
  });
}

// ── Billing ──────────────────────────────────────────────────────────────

export async function getUsage(orgId: string): Promise<Usage> {
  return apiFetch<Usage>(`/v1/usage?org_id=${orgId}`);
}

// ── Clusters ─────────────────────────────────────────────────────────────

export async function listClusters(projectId: string): Promise<Cluster[]> {
  try {
    const body = await apiFetch<{ items?: Cluster[] } | Cluster[]>(
      `/v1/clusters?project_id=${projectId}`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function getCluster(clusterId: string): Promise<Cluster> {
  return apiFetch<Cluster>(`/v1/clusters/${clusterId}`);
}

export async function triggerClusterDiscovery(projectId: string): Promise<void> {
  await apiFetch(`/v1/clusters/discover`, {
    method: "POST",
    body: JSON.stringify({ project_id: projectId }),
  });
}

// ── Annotations ─────────────────────────────────────────────────────

export async function listTraceAnnotations(traceId: string): Promise<Annotation[]> {
  try {
    const body = await apiFetch<{ items?: Annotation[] } | Annotation[]>(
      `/v1/traces/${traceId}/annotations`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function createAnnotation(
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
): Promise<Annotation> {
  return apiFetch<Annotation>(`/v1/traces/${traceId}/annotations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAnnotation(annotationId: string): Promise<void> {
  await apiFetch(`/v1/annotations/${annotationId}`, { method: "DELETE" });
}

export async function listAnnotationLabels(projectId: string): Promise<string[]> {
  try {
    const body = await apiFetch<{ labels?: string[] }>(
      `/v1/annotations/labels?project_id=${projectId}`
    );
    return body.labels ?? [];
  } catch {
    return [];
  }
}

export async function listProjectAnnotations(
  projectId: string,
  opts?: { label?: string; annotation_type?: string; limit?: number }
): Promise<Annotation[]> {
  try {
    const p = new URLSearchParams();
    if (opts?.label) p.set("label", opts.label);
    if (opts?.annotation_type) p.set("annotation_type", opts.annotation_type);
    if (opts?.limit) p.set("limit", String(opts.limit));
    const body = await apiFetch<{ items?: Annotation[] } | Annotation[]>(
      `/v1/annotations?project_id=${projectId}&${p}`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

// ── Saved filters ───────────────────────────────────────────────────────

export async function listSavedFilters(projectId: string): Promise<SavedFilter[]> {
  try {
    const body = await apiFetch<{ items?: SavedFilter[] } | SavedFilter[]>(
      `/v1/projects/${projectId}/saved-filters`
    );
    return Array.isArray(body) ? body : body.items ?? [];
  } catch {
    return [];
  }
}

export async function createSavedFilter(
  projectId: string,
  data: {
    name: string;
    filters: ListTracesFilters;
    color?: string;
    description?: string;
    is_default?: boolean;
  }
): Promise<SavedFilter> {
  return apiFetch<SavedFilter>(`/v1/projects/${projectId}/saved-filters`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSavedFilter(
  filterId: string,
  data: Partial<Pick<SavedFilter, "name" | "description" | "filters" | "color" | "is_default">>
): Promise<SavedFilter> {
  return apiFetch<SavedFilter>(`/v1/saved-filters/${filterId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSavedFilter(filterId: string): Promise<void> {
  await apiFetch(`/v1/saved-filters/${filterId}`, { method: "DELETE" });
}

// ── Semantic search ──────────────────────────────────────────────────────

export async function semanticSearch(
  projectId: string,
  query: string,
  limit = 20
): Promise<SearchResult[]> {
  try {
    const body = await apiFetch<{ results?: SearchResult[] }>(
      `/v1/search`,
      {
        method: "POST",
        body: JSON.stringify({ query, project_id: projectId, limit }),
      }
    );
    return body.results ?? [];
  } catch {
    return [];
  }
}
