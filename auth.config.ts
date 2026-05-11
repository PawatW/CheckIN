// Edge-safe config — no Node.js-only imports (no bcrypt, no Prisma).
// Used by middleware for JWT validation at the edge.
// auth.ts extends this with the full Credentials provider + DB calls.
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (!isLoggedIn && !pathname.startsWith("/login")) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (
        pathname.startsWith("/admin") &&
        (auth?.user as { role?: string } | undefined)?.role !== "ADMIN"
      ) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [],  // providers are added in auth.ts — not needed for edge middleware
};
