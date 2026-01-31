import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Note: These are placeholder configs for Edge Runtime
    // The actual authorize logic runs in the full auth.ts
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
