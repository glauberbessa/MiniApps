import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

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
 * Rotas que requerem autenticação
 * Usuários não autenticados serão redirecionados para /login
 */
const protectedRoutes = ['/perfil'];

/**
 * Verifica se a rota atual requer autenticação
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Middleware to handle:
 * 1. Route protection - redirects unauthenticated users from protected routes
 * 2. PKCE cookie cleanup - removes stale PKCE cookies that could cause auth errors
 *
 * This middleware runs BEFORE route handlers.
 */
export const middleware = auth((request) => {
  const url = new URL(request.url);
  const session = request.auth;

  // [DEBUG] Log requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] ${request.method} ${url.pathname} | Auth: ${session ? 'yes' : 'no'}`);
  }

  // ==== ROUTE PROTECTION ====
  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(url.pathname) && !session) {
    console.log(`[MIDDLEWARE] Redirecting unauthenticated user from ${url.pathname} to /login`);
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

  // Log detection of PKCE cookies (this runs before the route handler logging)
  console.log(`[MIDDLEWARE] Detected ${pkceCookies.length} PKCE cookie(s):`, pkceCookies.map(c => c.name));

  // Create response that will delete the PKCE cookies from the browser
  const response = NextResponse.next();

  // Delete PKCE cookies by setting them with maxAge=0
  for (const cookie of pkceCookies) {
    console.log(`[MIDDLEWARE] Scheduling deletion of PKCE cookie: ${cookie.name}`);

    // Delete with multiple configurations to ensure removal across different cookie settings
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
  // Match all routes except static files and API routes that don't need protection
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
