import "server-only";
import { Pool } from "pg";
import { env } from "./env";

let _pool: Pool | null = null;
function pool() {
  if (!_pool) _pool = new Pool({ connectionString: env.DATABASE_URL });
  return _pool!;
}

export interface OrgRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
}
export interface ProjectRow {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string | null;
  retention_days: number;
}

export async function getOrgBySlug(slug: string): Promise<OrgRow | null> {
  if (!env.DATABASE_URL) return null;
  const { rows } = await pool().query(
    "SELECT id, name, slug, plan FROM orgs WHERE slug = $1 LIMIT 1",
    [slug]
  );
  return rows[0] ?? null;
}

export async function getProjectBySlug(
  orgId: string,
  slug: string
): Promise<ProjectRow | null> {
  if (!env.DATABASE_URL) return null;
  const { rows } = await pool().query(
    "SELECT id, org_id, name, slug, description, retention_days FROM projects WHERE org_id = $1 AND slug = $2 LIMIT 1",
    [orgId, slug]
  );
  return rows[0] ?? null;
}

export async function listProjectsForOrg(orgId: string): Promise<ProjectRow[]> {
  if (!env.DATABASE_URL) return [];
  const { rows } = await pool().query(
    "SELECT id, org_id, name, slug, description, retention_days FROM projects WHERE org_id = $1 ORDER BY created_at DESC",
    [orgId]
  );
  return rows;
}

export async function listOrgsForUser(userId: string): Promise<OrgRow[]> {
  if (!env.DATABASE_URL) return [];
  const { rows } = await pool().query(
    `SELECT o.id, o.name, o.slug, o.plan FROM orgs o
     JOIN org_members m ON m.org_id = o.id WHERE m.user_id = $1
     ORDER BY o.created_at ASC`,
    [userId]
  );
  return rows;
}
