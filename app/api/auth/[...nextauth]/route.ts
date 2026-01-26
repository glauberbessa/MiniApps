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

// Log when this module is loaded (helps debug compilation issues)
console.log("[ROOT_API_AUTH_MODULE] Module loaded at", new Date().toISOString());

// Re-export the handlers directly from NextAuth
// This is the standard pattern recommended by Auth.js v5
export const { GET, POST } = handlers;
