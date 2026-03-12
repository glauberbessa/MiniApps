/**
 * YTPM sub-app NextAuth route handler.
 *
 * Handles auth requests within the /ytpm sub-application path.
 * Uses the same auth configuration as the root-level handler.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
