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

// ============================================================
// GOOGLE OAUTH CREDENTIALS
// Resolve Google credentials from environment variables.
// IMPORTANT: Use `undefined` (NOT empty string '') when credentials
// are missing. Auth.js uses `??` (nullish coalescing) to auto-resolve
// credentials from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET env vars.
// An empty string '' is NOT nullish, so it would prevent Auth.js's
// built-in env var resolution from working.
// ============================================================
const edgeGoogleClientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || undefined;
const edgeGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || undefined;

if (!edgeGoogleClientId || !edgeGoogleClientSecret) {
  console.error(
    `[AUTH_CONFIG_EDGE] CRITICAL: Missing Google OAuth credentials. ` +
    `Checked GOOGLE_CLIENT_ID/AUTH_GOOGLE_ID and GOOGLE_CLIENT_SECRET/AUTH_GOOGLE_SECRET. ` +
    `OAuth login will fail. ` +
    `GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING'}, ` +
    `AUTH_GOOGLE_ID=${process.env.AUTH_GOOGLE_ID ? 'SET' : 'MISSING'}, ` +
    `GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING'}, ` +
    `AUTH_GOOGLE_SECRET=${process.env.AUTH_GOOGLE_SECRET ? 'SET' : 'MISSING'}`
  );
}

console.log(`[AUTH_CONFIG_EDGE] Google Client ID: ${edgeGoogleClientId ? `SET (${edgeGoogleClientId.length} chars)` : 'NOT SET'}`);
console.log(`[AUTH_CONFIG_EDGE] Google Client Secret: ${edgeGoogleClientSecret ? `SET (${edgeGoogleClientSecret.length} chars)` : 'NOT SET'}`);
console.log(`[AUTH_CONFIG_EDGE] AUTH_URL: ${process.env.AUTH_URL || 'NOT SET (auto-detect from request)'}`);
console.log(`[AUTH_CONFIG_EDGE] VERCEL_URL: ${process.env.VERCEL_URL || 'NOT SET'}`);

// ============================================================
// COOKIE CONFIGURATION
// Must match auth.ts cookie config exactly so middleware and
// route handlers use the same cookie names. A mismatch causes
// state/CSRF validation failures that surface as "Configuration"
// errors because Auth.js maps all non-client-safe errors to that
// generic error type.
// ============================================================
const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

/**
 * NextAuth configuration for Edge Runtime (middleware).
 *
 * This config does NOT include the Prisma adapter or any Node.js-only dependencies.
 * It's used by the middleware for route protection.
 *
 * The full auth.ts config extends this and adds the Prisma adapter.
 *
 * IMPORTANT: Cookie names MUST match auth.ts to prevent state/CSRF
 * validation failures during the OAuth callback.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 0, // PKCE disabled — using state checks only
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
  pages: {
    signIn: "/ytpm/login",
    error: "/ytpm/login",
  },
  providers: [
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
