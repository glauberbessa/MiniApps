import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
 * Middleware to handle authentication-related cookie issues.
 *
 * This middleware runs BEFORE the auth route handlers and:
 * 1. Detects PKCE cookies that could cause "pkceCodeVerifier could not be parsed" errors
 * 2. Deletes stale PKCE cookies from the response to clean up the browser
 *
 * This is necessary because:
 * - PKCE cookies from previous auth attempts may be encrypted with old AUTH_SECRET
 * - Auth.js tries to parse these cookies even when PKCE is disabled (checks: ["state"])
 * - The cookie stripping in the route handler may not catch all cases
 */
export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // [DEBUG] Log every request hitting the ROOT middleware in production
  console.log(`[ROOT_MIDDLEWARE] >>> ${request.method} ${url.pathname}${url.search}`);

  // Detailed logging for auth-related routes
  const isAuthRoute = url.pathname.includes('/api/auth') || url.pathname.includes('/callback');
  if (isAuthRoute) {
    console.log(`[ROOT_MIDDLEWARE] [AUTH_DEBUG] Headers:`, JSON.stringify({
      host: request.headers.get('host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      referer: request.headers.get('referer'),
    }));
  }

  // Only process auth-related routes
  if (!url.pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  // Check for PKCE cookies
  const allCookies = request.cookies.getAll();
  const pkceCookies = allCookies.filter(c => isPkceCookie(c.name));

  if (pkceCookies.length === 0) {
    console.log(`[ROOT_MIDDLEWARE] [AUTH_DEBUG] No PKCE cookies found for path: ${url.pathname}`);
    return NextResponse.next();
  }

  // Log detection of PKCE cookies (this runs before the route handler logging)
  console.log(`[MIDDLEWARE] Detected ${pkceCookies.length} PKCE cookie(s):`, pkceCookies.map(c => c.name));

  // Create response that will delete the PKCE cookies from the browser
  // This is a "belt and suspenders" approach - we delete them from the response
  // while the route handler strips them from the request
  const response = NextResponse.next();

  // Delete PKCE cookies by setting them with maxAge=0
  for (const cookie of pkceCookies) {
    console.log(`[MIDDLEWARE] Scheduling deletion of PKCE cookie: ${cookie.name}`);

    // Delete with multiple configurations to ensure removal across different cookie settings
    // Standard deletion
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
}

// Configure middleware to only run on auth routes
export const config = {
  matcher: ['/ytpm/api/auth/:path*', '/api/auth/:path*'],
};
