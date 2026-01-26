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

// Log when this module is loaded (helps debug compilation issues)
console.log("[YTPM_API_AUTH_MODULE] Module loaded at", new Date().toISOString());

// Re-export the handlers directly from NextAuth
// This is the standard pattern recommended by Auth.js v5
export const { GET, POST } = handlers;
