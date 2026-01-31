import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Check if a cookie name is PKCE-related.
 * Covers both Auth.js v5 (authjs.*) and legacy NextAuth v4 (next-auth.*) patterns.
 */
function isPkceCookie(cookieName: string): boolean {
  const lowerName = cookieName.toLowerCase();
  return (
    lowerName.includes('pkce') ||
    lowerName.includes('code_verifier') ||
    lowerName.includes('code-verifier') ||
    lowerName.includes('authjs.pkce') ||
    lowerName.includes('next-auth.pkce')
  );
}

/**
 * Check if the current path is a protected route that requires authentication.
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ['/perfil'];
  return protectedPaths.some(path => pathname.startsWith(path));
}

// Create auth middleware from Edge-compatible config
const { auth } = NextAuth(authConfig);

/**
 * Middleware to handle:
 * 1. Route protection - redirects unauthenticated users from protected routes
 * 2. PKCE cookie cleanup - removes stale PKCE cookies that could cause auth errors
 *
 * This middleware runs BEFORE route handlers.
 *
 * Note: The `authorized` callback in auth.config.ts handles the primary route protection.
 * This middleware provides additional protection check and PKCE cookie cleanup.
 */
export default auth((request) => {
  const url = new URL(request.url);
  const session = request.auth;

  // [DEBUG] Log requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] ${request.method} ${url.pathname} | Auth: ${session ? 'yes' : 'no'}`);
  }

  // ==== ROUTE PROTECTION ====
  // Additional check for protected routes (primary check is in auth.config.ts authorized callback)
  // This ensures protection even if the authorized callback doesn't fire properly
  if (isProtectedRoute(url.pathname) && !session?.user) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Protected route ${url.pathname} - redirecting to login`);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ==== PKCE COOKIE CLEANUP ====
  // Only process auth-related routes for PKCE cleanup
  if (!url.pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  // Check for PKCE cookies
  const allCookies = request.cookies.getAll();
  const pkceCookies = allCookies.filter(c => isPkceCookie(c.name));

  if (pkceCookies.length === 0) {
    return NextResponse.next();
  }

  // Log detection of PKCE cookies
  console.log(`[MIDDLEWARE] Detected ${pkceCookies.length} PKCE cookie(s):`, pkceCookies.map(c => c.name));

  // Create response that will delete the PKCE cookies from the browser
  const response = NextResponse.next();

  // Delete PKCE cookies by setting them with maxAge=0
  for (const cookie of pkceCookies) {
    console.log(`[MIDDLEWARE] Scheduling deletion of PKCE cookie: ${cookie.name}`);

    response.cookies.set(cookie.name, '', {
      maxAge: 0,
      path: '/',
    });

    // Also try with secure flag for __Secure- prefixed cookies
    if (cookie.name.startsWith('__Secure-')) {
      response.cookies.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
        secure: true,
        sameSite: 'lax',
      });
    }
  }

  return response;
});

// Configure middleware matcher
export const config = {
  // Match all routes except static files
  // This is needed for:
  // 1. Route protection (/perfil/*)
  // 2. PKCE cookie cleanup (/api/auth/*)
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
