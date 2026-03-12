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
console.log(`[MIDDLEWARE_INIT] ===== MIDDLEWARE INITIALIZATION =====`);
console.log(`[MIDDLEWARE_INIT] GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? `SET (${process.env.GOOGLE_CLIENT_ID.length} chars)` : '❌ NOT SET'}`);
console.log(`[MIDDLEWARE_INIT] GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? `SET (${process.env.GOOGLE_CLIENT_SECRET.length} chars)` : '❌ NOT SET'}`);
console.log(`[MIDDLEWARE_INIT] AUTH_SECRET: ${process.env.AUTH_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`[MIDDLEWARE_INIT] NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`[MIDDLEWARE_INIT] NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`);
console.log(`[MIDDLEWARE_INIT] NODE_ENV: ${process.env.NODE_ENV}`);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error(`[MIDDLEWARE_INIT] ❌ CRITICAL: Google OAuth credentials missing in middleware!`);
  console.error(`[MIDDLEWARE_INIT] ❌ Login with Google WILL fail with "Configuration" error.`);
}

const { auth } = NextAuth(authConfig);

/**
 * Middleware to handle:
 * 1. Route protection - redirects unauthenticated users from protected routes
 * 2. PKCE cookie cleanup - removes stale PKCE cookies that could cause auth errors
 */
export default auth((request) => {
  const url = new URL(request.url);
  const session = request.auth;

  // Always log middleware invocations for YouTube connection debugging
  console.log(`[MIDDLEWARE] ${request.method} ${url.pathname} | Auth: ${session ? 'yes' : 'no'} | HasUser: ${!!session?.user} | UserId: ${session?.user?.id || 'N/A'}`);

  // Extra logging for OAuth callback routes (where "Configuration" errors happen)
  if (url.pathname.includes('/api/auth/callback') || url.pathname.includes('/api/auth/signin')) {
    console.log(`[MIDDLEWARE] ===== OAUTH FLOW DETECTED =====`);
    console.log(`[MIDDLEWARE] OAuth path: ${url.pathname}`);
    console.log(`[MIDDLEWARE] OAuth query: ${url.search}`);
    console.log(`[MIDDLEWARE] OAuth error param: ${url.searchParams.get('error') || 'none'}`);
    console.log(`[MIDDLEWARE] OAuth error_description: ${url.searchParams.get('error_description') || 'none'}`);
    console.log(`[MIDDLEWARE] OAuth has code: ${!!url.searchParams.get('code')}`);
    console.log(`[MIDDLEWARE] OAuth has state: ${!!url.searchParams.get('state')}`);
    console.log(`[MIDDLEWARE] GOOGLE_CLIENT_ID at request time: ${process.env.GOOGLE_CLIENT_ID ? 'SET' : '❌ NOT SET'}`);
    console.log(`[MIDDLEWARE] GOOGLE_CLIENT_SECRET at request time: ${process.env.GOOGLE_CLIENT_SECRET ? 'SET' : '❌ NOT SET'}`);
  }

  // Log all cookies for auth-related and YouTube API routes
  if (url.pathname.includes('/api/auth') || url.pathname.includes('/api/playlists') || url.pathname.includes('/api/channels') || url.pathname.includes('/api/quota')) {
    const allCookies = request.cookies.getAll();
    const cookieNames = allCookies.map(c => c.name);
    const sessionCookie = allCookies.find(c => c.name.includes('session-token'));
    console.log(`[MIDDLEWARE] API route detected: ${url.pathname}`);
    console.log(`[MIDDLEWARE] Total cookies: ${allCookies.length} | Cookie names: ${cookieNames.join(', ')}`);
    console.log(`[MIDDLEWARE] Session cookie present: ${!!sessionCookie} | Session cookie name: ${sessionCookie?.name || 'N/A'} | Session cookie value length: ${sessionCookie?.value?.length || 0}`);
    console.log(`[MIDDLEWARE] Session from auth(): ${JSON.stringify({
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
    })}`);
  }

  // ==== ROUTE PROTECTION ====
  if (isProtectedRoute(url.pathname) && !session?.user) {
    console.log(`[MIDDLEWARE] Protected route ${url.pathname} - redirecting to login (no session user)`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ==== PKCE COOKIE CLEANUP ====
  if (!url.pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  // Check for PKCE cookies
  const allCookies = request.cookies.getAll();
  const pkceCookies = allCookies.filter(c => isPkceCookie(c.name));

  if (pkceCookies.length === 0) {
    console.log(`[MIDDLEWARE] Auth route ${url.pathname} - No PKCE cookies found, proceeding`);
    return NextResponse.next();
  }

  // Log detection of PKCE cookies
  console.log(`[MIDDLEWARE] WARNING: Detected ${pkceCookies.length} PKCE cookie(s): ${pkceCookies.map(c => c.name).join(', ')}`);

  // Create response that will delete the PKCE cookies from the browser
  const response = NextResponse.next();

  // Delete PKCE cookies by setting them with maxAge=0
  for (const cookie of pkceCookies) {
    console.log(`[MIDDLEWARE] Scheduling deletion of PKCE cookie: ${cookie.name} (value length: ${cookie.value?.length || 0})`);

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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
