import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the NextAuth config. Used by middleware so we don't
// pull in the Postgres adapter (which uses Node APIs) into the Edge runtime.
export const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAuthed = !!auth?.user;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/about") ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/privacy") ||
        pathname.startsWith("/terms") ||
        pathname.startsWith("/docs") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/invite") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/api/auth");
      if (isPublic) return true;
      return isAuthed;
    },
  },
} satisfies NextAuthConfig;
