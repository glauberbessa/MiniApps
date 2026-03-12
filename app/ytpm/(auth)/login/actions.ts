"use server";

import { signIn } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function signInWithGoogle() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  logger.info("AUTH", "signInWithGoogle action called - PRE-FLIGHT CHECK", {
    hasGoogleClientId: !!googleClientId,
    googleClientIdLength: googleClientId?.length ?? 0,
    googleClientIdPrefix: googleClientId ? `${googleClientId.substring(0, 12)}...` : 'MISSING',
    hasGoogleClientSecret: !!googleClientSecret,
    googleClientSecretLength: googleClientSecret?.length ?? 0,
    hasAuthSecret: !!authSecret,
    nextauthUrl: nextauthUrl || "NOT_SET",
    appUrl: appUrl || "NOT_SET",
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    vercelUrl: process.env.VERCEL_URL || "NOT_SET",
  });

  console.log(`[SIGN_IN_ACTION] ===== signInWithGoogle PRE-FLIGHT =====`);
  console.log(`[SIGN_IN_ACTION] GOOGLE_CLIENT_ID: ${googleClientId ? `SET (${googleClientId.length} chars, "${googleClientId.substring(0, 12)}...")` : '❌ NOT SET'}`);
  console.log(`[SIGN_IN_ACTION] GOOGLE_CLIENT_SECRET: ${googleClientSecret ? `SET (${googleClientSecret.length} chars)` : '❌ NOT SET'}`);
  console.log(`[SIGN_IN_ACTION] AUTH_SECRET: ${process.env.AUTH_SECRET ? 'SET' : 'NOT SET'}`);
  console.log(`[SIGN_IN_ACTION] NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}`);
  console.log(`[SIGN_IN_ACTION] NEXTAUTH_URL: ${nextauthUrl || 'NOT SET'}`);
  console.log(`[SIGN_IN_ACTION] DATABASE_URL: ${process.env.DATABASE_URL ? `SET (${process.env.DATABASE_URL.length} chars)` : '❌ NOT SET'}`);

  if (!googleClientId || !googleClientSecret) {
    console.error(`[SIGN_IN_ACTION] ❌ CRITICAL: Google OAuth credentials are missing!`);
    console.error(`[SIGN_IN_ACTION] ❌ This WILL result in "Configuration" error on the login page.`);
    console.error(`[SIGN_IN_ACTION] ❌ Env keys containing "GOOGLE": ${Object.keys(process.env).filter(k => k.includes('GOOGLE')).join(', ') || 'NONE'}`);
    console.error(`[SIGN_IN_ACTION] ❌ All env keys: ${Object.keys(process.env).sort().join(', ')}`);
  }

  console.log(`[SIGN_IN_ACTION] Calling signIn("google", { redirectTo: "/ytpm/playlists" })...`);

  try {
    await signIn("google", { redirectTo: "/ytpm/playlists" });
    console.log(`[SIGN_IN_ACTION] signIn call completed (should not reach here - signIn redirects)`);
  } catch (error) {
    // signIn throws a NEXT_REDIRECT which is expected behavior
    const isRedirect = error instanceof Error && (
      error.message.includes('NEXT_REDIRECT') ||
      error.message.includes('redirect') ||
      (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')
    );

    if (isRedirect) {
      console.log(`[SIGN_IN_ACTION] signIn threw redirect (expected behavior)`);
      throw error; // Re-throw redirects
    }

    console.error(`[SIGN_IN_ACTION] ❌ signIn threw UNEXPECTED error:`, error instanceof Error ? error.message : String(error));
    console.error(`[SIGN_IN_ACTION] ❌ Error type: ${error?.constructor?.name}`);
    console.error(`[SIGN_IN_ACTION] ❌ Error stack:`, error instanceof Error ? error.stack : 'no stack');
    logger.error("AUTH", "signInWithGoogle UNEXPECTED ERROR", error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
