"use server";

import { signIn } from "@/lib/auth";

export async function signInWithGoogle() {
  // Pre-flight check: validate that Google OAuth credentials are configured
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      `[SIGN_IN_ACTION] CRITICAL: Cannot start Google OAuth - missing credentials. ` +
      `GOOGLE_CLIENT_ID=${clientId ? 'SET' : 'MISSING'}, ` +
      `GOOGLE_CLIENT_SECRET=${clientSecret ? 'SET' : 'MISSING'}. ` +
      `Set these in your Vercel environment variables.`
    );
    // Redirect to login with error instead of letting NextAuth throw a cryptic error
    const { redirect } = await import("next/navigation");
    redirect("/ytpm/login?error=Configuration");
  }

  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    console.error(
      `[SIGN_IN_ACTION] CRITICAL: Cannot start auth - AUTH_SECRET/NEXTAUTH_SECRET is missing. ` +
      `Set AUTH_SECRET in your Vercel environment variables.`
    );
    const { redirect } = await import("next/navigation");
    redirect("/ytpm/login?error=MissingSecret");
  }

  console.log(
    `[SIGN_IN_ACTION] Starting Google OAuth flow. ` +
    `AUTH_URL=${process.env.AUTH_URL || 'NOT SET'}, ` +
    `VERCEL_URL=${process.env.VERCEL_URL || 'NOT SET'}, ` +
    `NEXTAUTH_URL=${process.env.NEXTAUTH_URL || 'NOT SET'}`
  );

  await signIn("google", { redirectTo: "/ytpm/playlists" });
}
