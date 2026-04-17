import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { SignJWT } from "jose";
import { authConfig as baseConfig } from "./auth.config";
import { env } from "./env";

async function ensureDefaultOrg(userId: string, email: string): Promise<string[]> {
  if (!env.DATABASE_URL) return [];
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  try {
    const { rows } = await pool.query(
      "SELECT org_id FROM org_members WHERE user_id = $1",
      [userId]
    );
    if (rows.length) return rows.map((r) => r.org_id);
    // Demo behaviour: if there's already an org, attach this user as a member
    // so they immediately see existing traces. Otherwise create a fresh org.
    const { rows: existing } = await pool.query(
      "SELECT id FROM orgs ORDER BY created_at ASC LIMIT 1"
    );
    let orgId: string;
    if (existing.length) {
      orgId = existing[0].id;
    } else {
      const name = email.split("@")[0] + "-workspace";
      const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const { rows: o } = await pool.query(
        `INSERT INTO orgs (name, slug, created_by) VALUES ($1, $2, $3) RETURNING id`,
        [name, slug + "-" + Math.random().toString(36).slice(2, 6), userId]
      );
      orgId = o[0].id;
      await pool.query(
        `INSERT INTO projects (org_id, name, slug) VALUES ($1, 'Default', 'default')`,
        [orgId]
      );
    }
    await pool.query(
      "INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner') ON CONFLICT DO NOTHING",
      [orgId, userId]
    );
    return [orgId];
  } finally {
    await pool.end();
  }
}

async function mintGoApiJwt(userId: string, email: string, orgs: string[]): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET ?? env.NEXTAUTH_SECRET);
  return await new SignJWT({ email, orgs })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

// Postgres adapter is loaded lazily so the app boots in mock/standalone mode
// without a DB configured. In production, `DATABASE_URL` is required.
async function maybeAdapter() {
  if (!env.DATABASE_URL) return undefined;
  try {
    const { default: PgAdapter } = await import("@auth/pg-adapter");
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    return PgAdapter(pool);
  } catch {
    return undefined;
  }
}

export const authConfig: NextAuthConfig = {
  ...baseConfig,
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(env.AUTH_RESEND_KEY && env.AUTH_EMAIL_FROM
      ? [
          Resend({
            apiKey: env.AUTH_RESEND_KEY,
            from: env.AUTH_EMAIL_FROM,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...baseConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (token.sub && token.email && !token.orgs) {
        try {
          token.orgs = await ensureDefaultOrg(token.sub, token.email as string);
        } catch (e) {
          console.error("ensureDefaultOrg failed", e);
          token.orgs = [];
        }
      }
      if (token.sub && token.email) {
        token.goApiToken = await mintGoApiJwt(
          token.sub,
          token.email as string,
          (token.orgs as string[]) ?? []
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      (session as unknown as { accessToken?: string; orgs?: string[] }).accessToken =
        token.goApiToken as string | undefined;
      (session as unknown as { orgs?: string[] }).orgs = (token.orgs as string[]) ?? [];
      return session;
    },
  },
};

// Wire up the adapter when available, otherwise fall back to JWT-only auth.
const configWithAdapter: NextAuthConfig = {
  ...authConfig,
  adapter: await maybeAdapter(),
};

export const { auth, handlers, signIn, signOut } = NextAuth(configWithAdapter);
