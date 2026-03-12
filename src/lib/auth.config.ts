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

// URL resolution: On Vercel, prefer VERCEL_URL over localhost NEXTAUTH_URL
// to prevent OAuth callback mismatches when dev env vars are copied to production.
if (process.env.VERCEL_URL) {
  const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || '';
  const isLocalhost = nextAuthUrl.includes('localhost') || nextAuthUrl.includes('127.0.0.1');
  if (!nextAuthUrl || isLocalhost) {
    process.env.AUTH_URL = `https://${process.env.VERCEL_URL}`;
    if (isLocalhost) {
      console.warn(
        `[AUTH_CONFIG_EDGE] WARNING: NEXTAUTH_URL contains localhost (${nextAuthUrl}) ` +
        `but running on Vercel. Overriding AUTH_URL to https://${process.env.VERCEL_URL}`
      );
    }
  } else {
    // Use the explicitly configured URL (non-localhost)
    if (!process.env.AUTH_URL) {
      process.env.AUTH_URL = nextAuthUrl;
    }
  }
} else {
  // Not on Vercel - use NEXTAUTH_URL as fallback
  if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
    process.env.AUTH_URL = process.env.NEXTAUTH_URL;
  }
}

// NextAuth v5 supports both GOOGLE_CLIENT_ID and AUTH_GOOGLE_ID conventions.
// Resolve whichever is available. Use empty string fallback so GoogleProvider
// doesn't receive undefined (which causes a cryptic "Configuration" error).
const edgeGoogleClientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '';
const edgeGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '';
const edgeAuthSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';

if (!edgeGoogleClientId || !edgeGoogleClientSecret) {
  console.error(
    `[AUTH_CONFIG_EDGE] CRITICAL: Missing Google OAuth credentials. ` +
    `Checked GOOGLE_CLIENT_ID/AUTH_GOOGLE_ID and GOOGLE_CLIENT_SECRET/AUTH_GOOGLE_SECRET. ` +
    `OAuth login will fail with "Configuration" error. ` +
    `GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING'}, ` +
    `AUTH_GOOGLE_ID=${process.env.AUTH_GOOGLE_ID ? 'SET' : 'MISSING'}, ` +
    `GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING'}, ` +
    `AUTH_GOOGLE_SECRET=${process.env.AUTH_GOOGLE_SECRET ? 'SET' : 'MISSING'}`
  );
}
if (!edgeAuthSecret) {
  console.error(`[AUTH_CONFIG_EDGE] CRITICAL: Missing AUTH_SECRET/NEXTAUTH_SECRET. Authentication will fail.`);
}

console.log(`[AUTH_CONFIG_EDGE] Google Client ID: ${edgeGoogleClientId ? `SET (${edgeGoogleClientId.length} chars)` : 'NOT SET'}`);
console.log(`[AUTH_CONFIG_EDGE] Google Client Secret: ${edgeGoogleClientSecret ? `SET (${edgeGoogleClientSecret.length} chars)` : 'NOT SET'}`);
console.log(`[AUTH_CONFIG_EDGE] AUTH_SECRET: ${edgeAuthSecret ? 'SET' : 'NOT SET'}`);
console.log(`[AUTH_CONFIG_EDGE] AUTH_URL: ${process.env.AUTH_URL || 'NOT SET (auto-detect from request)'}`);
console.log(`[AUTH_CONFIG_EDGE] VERCEL_URL: ${process.env.VERCEL_URL || 'NOT SET'}`);

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
