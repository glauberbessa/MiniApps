"use server";

import { signIn } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function signInWithGoogle() {
  logger.info("AUTH", "signInWithGoogle action called", {
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    nextauthUrl: process.env.NEXTAUTH_URL || "NOT_SET",
  });

  await signIn("google", { redirectTo: "/ytpm/playlists" });
}
