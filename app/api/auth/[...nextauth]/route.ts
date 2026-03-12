/**
 * Root-level NextAuth route handler.
 *
 * This route handles OAuth callbacks at /api/auth/callback/* (without ytpm prefix).
 * Google OAuth is configured to redirect to /api/auth/callback/google, so this
 * root-level route is required to catch those callbacks.
 *
 * IMPORTANT: This is the SIMPLEST possible implementation to ensure it works.
 * Complex PKCE handling is done in middleware.ts instead.
 */

import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

// Log when this module is loaded (helps debug compilation issues)
console.log("[ROOT_API_AUTH_MODULE] Module loaded at", new Date().toISOString());
console.log("[ROOT_API_AUTH_MODULE] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? `SET (${process.env.GOOGLE_CLIENT_ID.length} chars)` : "❌ NOT SET");
console.log("[ROOT_API_AUTH_MODULE] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? `SET (${process.env.GOOGLE_CLIENT_SECRET.length} chars)` : "❌ NOT SET");
console.log("[ROOT_API_AUTH_MODULE] AUTH_SECRET:", process.env.AUTH_SECRET ? "SET" : "NOT SET");
console.log("[ROOT_API_AUTH_MODULE] NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "NOT SET");

// Wrap handlers with request logging
const originalGET = handlers.GET;
const originalPOST = handlers.POST;

async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log(`[ROOT_API_AUTH] GET ${url.pathname}${url.search}`);
  console.log(`[ROOT_API_AUTH] GET query params: ${url.searchParams.toString()}`);
  console.log(`[ROOT_API_AUTH] GET headers host: ${request.headers.get('host')}`);
  console.log(`[ROOT_API_AUTH] GET cookies: ${request.cookies.getAll().map(c => `${c.name}(${c.value.length}ch)`).join(', ')}`);

  // Check if this is a callback with an error
  if (url.pathname.includes('/callback')) {
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    console.log(`[ROOT_API_AUTH] CALLBACK detected!`);
    console.log(`[ROOT_API_AUTH] CALLBACK - error: ${error || 'none'}`);
    console.log(`[ROOT_API_AUTH] CALLBACK - error_description: ${errorDescription || 'none'}`);
    console.log(`[ROOT_API_AUTH] CALLBACK - has state: ${!!state} (length=${state?.length || 0})`);
    console.log(`[ROOT_API_AUTH] CALLBACK - has code: ${!!code} (length=${code?.length || 0})`);
  }

  // Check if this is a signin request
  if (url.pathname.includes('/signin')) {
    console.log(`[ROOT_API_AUTH] SIGNIN page requested`);
    console.log(`[ROOT_API_AUTH] SIGNIN - callbackUrl: ${url.searchParams.get('callbackUrl') || 'none'}`);
    console.log(`[ROOT_API_AUTH] SIGNIN - error: ${url.searchParams.get('error') || 'none'}`);
  }

  try {
    const response = await originalGET(request);
    console.log(`[ROOT_API_AUTH] GET response status: ${response?.status || 'undefined'}`);
    if (response && response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.log(`[ROOT_API_AUTH] GET REDIRECT to: ${location}`);
      if (location && location.includes('error=')) {
        console.error(`[ROOT_API_AUTH] ❌ REDIRECT contains error! Location: ${location}`);
      }
    }
    return response;
  } catch (error) {
    console.error(`[ROOT_API_AUTH] ❌ GET handler EXCEPTION:`, error instanceof Error ? error.message : String(error));
    console.error(`[ROOT_API_AUTH] ❌ GET handler stack:`, error instanceof Error ? error.stack : 'no stack');
    console.error(`[ROOT_API_AUTH] ❌ GOOGLE_CLIENT_ID at error time: ${process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'}`);
    console.error(`[ROOT_API_AUTH] ❌ GOOGLE_CLIENT_SECRET at error time: ${process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'}`);
    throw error;
  }
}

async function POST(request: NextRequest) {
  const url = new URL(request.url);
  console.log(`[ROOT_API_AUTH] POST ${url.pathname}`);
  console.log(`[ROOT_API_AUTH] POST headers content-type: ${request.headers.get('content-type')}`);
  console.log(`[ROOT_API_AUTH] POST cookies: ${request.cookies.getAll().map(c => `${c.name}(${c.value.length}ch)`).join(', ')}`);

  try {
    const response = await originalPOST(request);
    console.log(`[ROOT_API_AUTH] POST response status: ${response?.status || 'undefined'}`);
    if (response && response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.log(`[ROOT_API_AUTH] POST REDIRECT to: ${location}`);
      if (location && location.includes('error=')) {
        console.error(`[ROOT_API_AUTH] ❌ POST REDIRECT contains error! Location: ${location}`);
      }
    }
    return response;
  } catch (error) {
    console.error(`[ROOT_API_AUTH] ❌ POST handler EXCEPTION:`, error instanceof Error ? error.message : String(error));
    console.error(`[ROOT_API_AUTH] ❌ POST handler stack:`, error instanceof Error ? error.stack : 'no stack');
    throw error;
  }
}

export { GET, POST };
