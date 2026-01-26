import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Root-level NextAuth route handler.
 *
 * This route handles OAuth callbacks at /api/auth/callback/* (without ytpm prefix).
 * Google OAuth is configured to redirect to /api/auth/callback/google, so this
 * root-level route is required to catch those callbacks.
 */

interface Cookie {
  name: string;
  value: string;
}

/**
 * Check if a cookie name is PKCE-related.
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
 * Strip PKCE cookies from the request to prevent parsing errors.
 */
function stripPkceCookies(request: NextRequest): Request {
  const url = new URL(request.url);
  const isCallback = url.pathname.includes("/callback") || url.searchParams.has("code");

  const cookies: Cookie[] = request.cookies.getAll();
  const pkceCookieNames = cookies
    .filter((c: Cookie) => isPkceCookie(c.name))
    .map((c: Cookie) => c.name);

  if (pkceCookieNames.length === 0) {
    return request;
  }

  logger.warn("AUTH_PKCE", "Stripping PKCE cookies from request", {
    cookieNames: pkceCookieNames,
    pathname: url.pathname,
    isCallback,
  });

  const filteredCookies = cookies
    .filter((c: Cookie) => !isPkceCookie(c.name))
    .map((c: Cookie) => `${c.name}=${c.value}`)
    .join('; ');

  const newHeaders = new Headers();
  request.headers.forEach((value: string, key: string) => {
    if (key.toLowerCase() !== 'cookie') {
      newHeaders.set(key, value);
    }
  });

  if (filteredCookies) {
    newHeaders.set('cookie', filteredCookies);
  }

  const cleanRequest = new Request(request.url, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
  });

  return cleanRequest;
}

/**
 * Check if an error is PKCE-related.
 */
function isPkceError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  const name = error.name?.toLowerCase() || '';
  return (
    message.includes('pkcecod') ||
    message.includes('pkce') ||
    message.includes('code_verifier') ||
    message.includes('code verifier') ||
    name === 'invalidcheck'
  );
}

/**
 * Create a response that clears PKCE cookies and redirects.
 */
function createPkceClearingRedirectResponse(request: NextRequest): NextResponse {
  const url = new URL(request.url);
  const isCallback = url.pathname.includes('/callback') || url.searchParams.has('code');

  let redirectUrl: string;
  if (isCallback) {
    redirectUrl = '/ytpm/login?error=AuthenticationError';
  } else {
    redirectUrl = url.pathname;
  }

  const response = NextResponse.redirect(new URL(redirectUrl, request.url));

  const cookiesToClear = [
    'authjs.pkce.code_verifier',
    '__Secure-authjs.pkce.code_verifier',
    '__Host-authjs.pkce.code_verifier',
    'next-auth.pkce.code_verifier',
    '__Secure-next-auth.pkce.code_verifier',
    '__Host-next-auth.pkce.code_verifier',
    'authjs.pkce',
    '__Secure-authjs.pkce',
  ];

  for (const cookieName of cookiesToClear) {
    response.cookies.set(cookieName, '', {
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });
    if (cookieName.startsWith('__Secure-') || cookieName.startsWith('__Host-')) {
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        expires: new Date(0),
        secure: true,
        sameSite: 'lax',
      });
    }
  }

  logger.info("AUTH_PKCE", "Created PKCE-clearing redirect response", {
    redirectUrl,
    clearedCookies: cookiesToClear.length,
  });

  return response;
}

/**
 * Add PKCE cookie deletion headers to an existing response.
 */
function addPkceClearingHeaders(response: Response | NextResponse, request: NextRequest): NextResponse {
  const pkceCookies = request.cookies.getAll().filter((c: Cookie) => isPkceCookie(c.name));

  if (pkceCookies.length === 0) {
    return response instanceof NextResponse ? response : NextResponse.json(null, { status: response.status, headers: response.headers });
  }

  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });

  for (const cookie of pkceCookies) {
    newResponse.cookies.set(cookie.name, '', {
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });
  }

  return newResponse;
}

export async function GET(request: NextRequest) {
  logger.info("AUTH_ROUTE", `GET ${request.url}`);
  console.log(`[ROOT_API_AUTH] GET ${request.url}`);

  try {
    const sanitizedRequest = stripPkceCookies(request) as NextRequest;
    const response = await handlers.GET(sanitizedRequest);

    logger.info("AUTH_ROUTE", `GET response status: ${response.status}`);
    console.log(`[ROOT_API_AUTH] GET response status: ${response.status}`);

    return addPkceClearingHeaders(response, request);
  } catch (error) {
    console.error("[ROOT_API_AUTH] GET error:", error);
    logger.error("AUTH_ROUTE", "GET /api/auth failed", error instanceof Error ? error : new Error(String(error)));

    if (isPkceError(error)) {
      logger.warn("AUTH_PKCE", "Caught PKCE error, returning cookie-clearing redirect");
      return createPkceClearingRedirectResponse(request);
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  logger.info("AUTH_ROUTE", `POST ${request.url}`);
  console.log(`[ROOT_API_AUTH] POST ${request.url}`);

  try {
    const sanitizedRequest = stripPkceCookies(request) as NextRequest;
    const response = await handlers.POST(sanitizedRequest);

    logger.info("AUTH_ROUTE", `POST response status: ${response.status}`);
    console.log(`[ROOT_API_AUTH] POST response status: ${response.status}`);

    return addPkceClearingHeaders(response, request);
  } catch (error) {
    console.error("[ROOT_API_AUTH] POST error:", error);
    logger.error("AUTH_ROUTE", "POST /api/auth failed", error instanceof Error ? error : new Error(String(error)));

    if (isPkceError(error)) {
      logger.warn("AUTH_PKCE", "Caught PKCE error, returning cookie-clearing redirect");
      return createPkceClearingRedirectResponse(request);
    }

    throw error;
  }
}
