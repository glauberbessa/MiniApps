/**
 * YTPM sub-app NextAuth route handler.
 *
 * This route handles auth requests within the /ytpm sub-application.
 * Most auth callbacks go to /api/auth/callback/google (root level),
 * but this handler is needed for session checks and other auth operations
 * when accessed via /ytpm/api/auth/*.
 *
 * IMPORTANT: This is the SIMPLEST possible implementation to ensure it works.
 * Complex PKCE handling is done in middleware.ts instead.
 */

import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

// Log when this module is loaded (helps debug compilation issues)
console.log("[YTPM_API_AUTH_MODULE] Module loaded at", new Date().toISOString());
console.log("[YTPM_API_AUTH_MODULE] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? `SET (${process.env.GOOGLE_CLIENT_ID.length} chars)` : "❌ NOT SET");
console.log("[YTPM_API_AUTH_MODULE] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? `SET (${process.env.GOOGLE_CLIENT_SECRET.length} chars)` : "❌ NOT SET");

// Wrap handlers with request logging
const originalGET = handlers.GET;
const originalPOST = handlers.POST;

async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log(`[YTPM_API_AUTH] GET ${url.pathname}${url.search}`);
  console.log(`[YTPM_API_AUTH] GET cookies: ${request.cookies.getAll().map(c => `${c.name}(${c.value.length}ch)`).join(', ')}`);

  if (url.pathname.includes('/callback')) {
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const code = url.searchParams.get('code');
    console.log(`[YTPM_API_AUTH] CALLBACK - error: ${error || 'none'}, error_description: ${errorDescription || 'none'}, has code: ${!!code}`);
  }

  try {
    const response = await originalGET(request);
    console.log(`[YTPM_API_AUTH] GET response status: ${response?.status || 'undefined'}`);
    if (response && response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.log(`[YTPM_API_AUTH] GET REDIRECT to: ${location}`);
      if (location && location.includes('error=')) {
        console.error(`[YTPM_API_AUTH] ❌ REDIRECT contains error! Location: ${location}`);
      }
    }
    return response;
  } catch (error) {
    console.error(`[YTPM_API_AUTH] ❌ GET EXCEPTION:`, error instanceof Error ? error.message : String(error));
    console.error(`[YTPM_API_AUTH] ❌ Stack:`, error instanceof Error ? error.stack : 'no stack');
    throw error;
  }
}

async function POST(request: NextRequest) {
  const url = new URL(request.url);
  console.log(`[YTPM_API_AUTH] POST ${url.pathname}`);

  try {
    const response = await originalPOST(request);
    console.log(`[YTPM_API_AUTH] POST response status: ${response?.status || 'undefined'}`);
    if (response && response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.log(`[YTPM_API_AUTH] POST REDIRECT to: ${location}`);
      if (location && location.includes('error=')) {
        console.error(`[YTPM_API_AUTH] ❌ POST REDIRECT contains error! Location: ${location}`);
      }
    }
    return response;
  } catch (error) {
    console.error(`[YTPM_API_AUTH] ❌ POST EXCEPTION:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export { GET, POST };
