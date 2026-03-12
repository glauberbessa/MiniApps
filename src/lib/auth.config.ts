import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// ============================================================
// EDGE RUNTIME: Environment variable compatibility for NextAuth v5
// NextAuth v5 uses AUTH_SECRET and AUTH_URL internally, but many
// users configure NEXTAUTH_SECRET and NEXTAUTH_URL (the v4 names).
// We bridge them here so both work.
// ============================================================
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}
if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
}

const edgeGoogleClientId = process.env.GOOGLE_CLIENT_ID || '';
const edgeGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const edgeAuthSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';

if (!edgeGoogleClientId || !edgeGoogleClientSecret) {
  console.error(`[AUTH_CONFIG_EDGE] CRITICAL: Missing Google OAuth credentials. OAuth login will fail with "Configuration" error.`);
}
if (!edgeAuthSecret) {
  console.error(`[AUTH_CONFIG_EDGE] CRITICAL: Missing AUTH_SECRET/NEXTAUTH_SECRET. Authentication will fail.`);
}

/**
 * NextAuth configuration for Edge Runtime (middleware).
 *
 * This config does NOT include the Prisma adapter or any Node.js-only dependencies.
 * It's used by the middleware for route protection.
 *
 * The full auth.ts config extends this and adds the Prisma adapter.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: edgeAuthSecret || undefined,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/ytpm/login",
    error: "/ytpm/login",
  },
  providers: [
    // Note: These are placeholder configs for Edge Runtime
    // The actual authorize logic runs in the full auth.ts
    GoogleProvider({
      clientId: edgeGoogleClientId,
      clientSecret: edgeGoogleClientSecret,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
      checks: ["state"],
    }),
    CredentialsProvider({
      id: "credentials",
      name: "E-mail e Senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // authorize is not called in middleware, only in the full auth.ts
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Protected routes that require authentication
      const protectedRoutes = ["/perfil"];
      const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
      );

      // If it's a protected route and user is not authenticated, deny access
      if (isProtectedRoute && !auth?.user) {
        return false; // Redirects to signIn page
      }

      return true;
    },
  },
};
