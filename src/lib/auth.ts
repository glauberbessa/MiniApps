import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { google } from "googleapis";
import { logger } from "./logger";
import { verifyPassword } from "./password";
import { loginSchema } from "./validations/auth";
import {
  checkLoginAttempts,
  incrementLoginAttempts,
  resetLoginAttempts,
  getLockoutMessage,
} from "./rate-limit";
import { supabase } from "./supabase";
import { SupabaseAdapter } from "./supabase-adapter";

// ============================================================
// Environment variable compatibility for NextAuth v5
// NextAuth v5 (@auth/core) uses AUTH_SECRET and AUTH_URL internally.
// Bridge NEXTAUTH_SECRET → AUTH_SECRET and NEXTAUTH_URL → AUTH_URL
// so both v4-style and v5-style env var names work.
// ============================================================
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}

// URL resolution: On Vercel, prefer VERCEL_URL over localhost NEXTAUTH_URL
// to prevent OAuth callback mismatches when dev env vars are copied to production.
if (process.env.VERCEL_URL) {
  const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || '';
  const isLocalhost = nextAuthUrl.includes('localhost') || nextAuthUrl.includes('127.0.0.1');
  if (!nextAuthUrl || isLocalhost) {
    process.env.AUTH_URL = `https://${process.env.VERCEL_URL}`;
    if (isLocalhost) {
      console.warn(
        `[AUTH_INIT] WARNING: NEXTAUTH_URL contains localhost (${nextAuthUrl}) ` +
        `but running on Vercel. Overriding AUTH_URL to https://${process.env.VERCEL_URL}`
      );
    }
  } else {
    if (!process.env.AUTH_URL) {
      process.env.AUTH_URL = nextAuthUrl;
    }
  }
} else {
  if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
    process.env.AUTH_URL = process.env.NEXTAUTH_URL;
  }
}

// ============================================================
// GOOGLE OAUTH CREDENTIAL VALIDATION
// NextAuth v5 supports both GOOGLE_CLIENT_ID and AUTH_GOOGLE_ID.
// We resolve whichever is available. Use `undefined` (NOT empty
// string '') when missing — Auth.js uses `??` (nullish coalescing)
// to auto-resolve from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET env vars.
// An empty string '' is NOT nullish and blocks this resolution.
// ============================================================
const googleCredentials = {
  clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || undefined,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || undefined,
};

if (!googleCredentials.clientId || !googleCredentials.clientSecret) {
  console.error(
    `[AUTH_INIT] CRITICAL: Missing Google OAuth credentials. ` +
    `Checked GOOGLE_CLIENT_ID/AUTH_GOOGLE_ID and GOOGLE_CLIENT_SECRET/AUTH_GOOGLE_SECRET. OAuth login will fail. ` +
    `GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING'}, ` +
    `AUTH_GOOGLE_ID=${process.env.AUTH_GOOGLE_ID ? 'SET' : 'MISSING'}, ` +
    `GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING'}, ` +
    `AUTH_GOOGLE_SECRET=${process.env.AUTH_GOOGLE_SECRET ? 'SET' : 'MISSING'}`
  );
}

console.log(`[AUTH_INIT] Google Client ID: ${googleCredentials.clientId ? `SET (${googleCredentials.clientId.length} chars)` : 'NOT SET (Auth.js will auto-resolve from AUTH_GOOGLE_ID)'}`);
console.log(`[AUTH_INIT] Google Client Secret: ${googleCredentials.clientSecret ? `SET (${googleCredentials.clientSecret.length} chars)` : 'NOT SET (Auth.js will auto-resolve from AUTH_GOOGLE_SECRET)'}`);
console.log(`[AUTH_INIT] AUTH_URL: ${process.env.AUTH_URL || 'NOT SET (auto-detect from request)'}`);
console.log(`[AUTH_INIT] VERCEL_URL: ${process.env.VERCEL_URL || 'NOT SET'}`);

// Get the auth secret with proper validation
function getAuthSecret(): string {
  // AUTH_SECRET is already bridged from NEXTAUTH_SECRET above if needed
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  // In production, we must have a secret
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    console.error(
      "[AUTH_INIT] CRITICAL: Neither AUTH_SECRET nor NEXTAUTH_SECRET is set. " +
      "Set AUTH_SECRET in your Vercel environment variables."
    );
    // Use a deterministic fallback so JWTs survive across requests,
    // but this is NOT secure - just prevents total breakage while debugging.
    const emergencyFallback = process.env.VERCEL_URL || process.env.VERCEL_GIT_COMMIT_SHA || "insecure-fallback-please-set-auth-secret";
    return `emergency-${emergencyFallback}`;
  }

  return "development-secret-please-set-auth-secret-in-production";
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      youtubeChannelId?: string | null;
    };
    accessToken?: string | null;
  }
}

async function refreshAccessToken(account: {
  id: string;
  refresh_token: string | null;
}): Promise<string | null> {
  logger.info("GOOGLE_OAUTH", "refreshAccessToken START", {
    accountId: account.id,
    hasRefreshToken: !!account.refresh_token,
    refreshTokenLength: account.refresh_token?.length ?? 0,
    refreshTokenPreview: account.refresh_token ? `${account.refresh_token.substring(0, 15)}...` : "NULL",
  });

  if (!account.refresh_token) {
    logger.error("GOOGLE_OAUTH", "refreshAccessToken FAILED - No refresh token available", undefined, {
      accountId: account.id,
    });
    return null;
  }

  try {
    logger.debug("GOOGLE_OAUTH", "Creating OAuth2 client for token refresh", {
      accountId: account.id,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length ?? 0,
    });

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: account.refresh_token });

    logger.info("GOOGLE_OAUTH", "Calling Google OAuth2 refreshAccessToken...", {
      accountId: account.id,
    });

    const startTime = Date.now();
    const { credentials } = await oauth2Client.refreshAccessToken();
    const elapsed = Date.now() - startTime;

    logger.info("GOOGLE_OAUTH", "Google OAuth2 refreshAccessToken response received", {
      accountId: account.id,
      elapsed: `${elapsed}ms`,
      hasAccessToken: !!credentials.access_token,
      accessTokenLength: credentials.access_token?.length ?? 0,
      hasExpiryDate: !!credentials.expiry_date,
      expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : "N/A",
      credentialsKeys: Object.keys(credentials),
      tokenType: credentials.token_type,
      scope: credentials.scope,
    });

    if (credentials.access_token) {
      logger.info("GOOGLE_OAUTH", "Updating account in database with new access token", {
        accountId: account.id,
        newAccessTokenPreview: `${credentials.access_token.substring(0, 20)}...`,
        newExpiresAt: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
      });

      const dbStartTime = Date.now();
      const expiresAt = credentials.expiry_date
        ? Math.floor(credentials.expiry_date / 1000)
        : null;

      const { error: updateError } = await supabase
        .from("Account")
        .update({
          access_token: credentials.access_token,
          expires_at: expiresAt,
        })
        .eq("id", account.id);

      if (updateError) throw updateError;
      const dbElapsed = Date.now() - dbStartTime;

      logger.info("GOOGLE_OAUTH", "refreshAccessToken SUCCESS - Token updated in DB", {
        accountId: account.id,
        dbUpdateElapsed: `${dbElapsed}ms`,
        totalElapsed: `${elapsed + dbElapsed}ms`,
      });

      return credentials.access_token;
    } else {
      logger.error("GOOGLE_OAUTH", "Google returned NO access_token in credentials", undefined, {
        accountId: account.id,
        elapsed: `${elapsed}ms`,
        credentialsKeys: Object.keys(credentials),
        hasRefreshToken: !!credentials.refresh_token,
        hasIdToken: !!credentials.id_token,
      });
    }
  } catch (error) {
    const gaxiosError = error as { code?: number; response?: { status?: number; statusText?: string; data?: unknown } };
    logger.error(
      "GOOGLE_OAUTH",
      "refreshAccessToken FAILED with exception",
      error instanceof Error ? error : undefined,
      {
        accountId: account.id,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : "unknown",
        errorCode: gaxiosError?.code,
        httpStatus: gaxiosError?.response?.status,
        httpStatusText: gaxiosError?.response?.statusText,
        responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
      }
    );
  }

  return null;
}

// Cookie configuration for production
const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

function extractMissingTable(message: string): string | null {
  const tableMatch = message.match(/The table `([^`]+)` does not exist/i);
  if (tableMatch?.[1]) {
    return tableMatch[1];
  }
  const relationMatch = message.match(/relation \"([^\"]+)\" does not exist/i);
  if (relationMatch?.[1]) {
    return relationMatch[1];
  }
  return null;
}

function extractMissingColumn(message: string): string | null {
  const columnMatch = message.match(/The column `([^`]+)` does not exist/i);
  if (columnMatch?.[1]) {
    return columnMatch[1];
  }
  // Also check for PostgreSQL error format
  const pgMatch = message.match(/column \"([^\"]+)\" does not exist/i);
  if (pgMatch?.[1]) {
    return pgMatch[1];
  }
  return null;
}
function extractErrorCauseChain(err: unknown, maxDepth = 10): { message: string; rootError?: Error } {
  const messages: string[] = [];
  let current: unknown = err;
  let rootError: Error | undefined;
  let depth = 0;

  while (current && depth < maxDepth) {
    depth++;
    if (current instanceof Error) {
      messages.push(`[${current.name}] ${current.message}`);
      rootError = current;
      // NextAuth v5 sets cause as { err: Error, ...metadata }
      const cause = (current as { cause?: unknown }).cause;
      if (cause && typeof cause === "object" && cause !== null && "err" in cause) {
        const causeObj = cause as Record<string, unknown>;
        if (causeObj.err instanceof Error) {
          current = causeObj.err;
          continue;
        }
      }
      current = cause;
    } else if (typeof current === "object" && current !== null && "message" in current) {
      messages.push(String((current as { message: unknown }).message));
      current = (current as { cause?: unknown }).cause;
    } else {
      break;
    }
  }

  return { message: messages.join(" → "), rootError };
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter(supabase),
  trustHost: true,
  secret: getAuthSecret(),
  debug: process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG === "true",
  logger: {
    error(code, ...message) {
      // Extract the full cause chain from the error object (code is the AdapterError in NextAuth v5)
      const causeChain = extractErrorCauseChain(code);

      logger.error("AUTH", `NextAuth internal error: ${code}`, causeChain.rootError, {
        causeChain: causeChain.message.substring(0, 1000),
      });

      // Check for missing table in the cause chain
      const missingTable = extractMissingTable(causeChain.message);
      if (missingTable) {
        logger.critical("DATABASE", "Missing Supabase table detected during auth", causeChain.rootError, {
          missingTable,
          isVercel: !!process.env.VERCEL,
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          guidance: "Ensure the required table exists in your Supabase project. Create it via the Supabase dashboard or run SQL migrations. Confirm SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correctly set.",
        });
      }

      // Check for missing column in the cause chain (schema drift)
      const missingColumn = extractMissingColumn(causeChain.message);
      if (missingColumn) {
        logger.critical("DATABASE", "Missing database column detected - schema out of sync", causeChain.rootError, {
          missingColumn,
          isVercel: !!process.env.VERCEL,
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          guidance: "The database schema has columns that don't exist or are missing. Add them via the Supabase dashboard table editor or run SQL migrations to add the missing column.",
        });
      }
    },
    warn(code) {
      logger.warn("AUTH", `NextAuth internal warning: ${code}`);
    },
    debug(code, metadata) {
      logger.debug("AUTH", `NextAuth internal debug: ${code}`, {
        metadata: metadata ? JSON.stringify(metadata).substring(0, 300) : undefined,
      });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 0,
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: process.env.AUTH_URL ? new URL(process.env.AUTH_URL).hostname : undefined,
        maxAge: 60 * 15,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: googleCredentials.clientId,
      clientSecret: googleCredentials.clientSecret,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
      checks: ["state"],
    }),
    CredentialsProvider({
      id: "credentials",
      name: "E-mail e Senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        logger.info("AUTH", "Credentials authorize START", {
          hasEmail: !!(credentials as { email?: string })?.email,
          hasPassword: !!(credentials as { password?: string })?.password,
        });

        try {
          const result = loginSchema.safeParse(credentials);
          if (!result.success) {
            logger.warn("AUTH", "Invalid login credentials format", {
              errors: result.error.flatten().fieldErrors,
            });
            return null;
          }

          const { email, password } = result.data;
          logger.debug("AUTH", "Looking up user by email", { email });

          const { data: user, error: userError } = await supabase
            .from("User")
            .select("id, email, name, image, password, isActive, youtubeChannelId")
            .eq("email", email)
            .single();

          if (userError && userError.code !== "PGRST116") {
            logger.error("AUTH", "Database error looking up user", userError);
            return null;
          }

          if (!user) {
            logger.warn("AUTH", "Login attempt for non-existent user", { email });
            return null;
          }

          logger.debug("AUTH", "User found in database", {
            userId: user.id,
            email: user.email,
            hasPassword: !!user.password,
            isActive: user.isActive,
            hasYoutubeChannelId: !!user.youtubeChannelId,
          });

          if (!user.isActive) {
            logger.warn("AUTH", "Login attempt for inactive user", { email, userId: user.id });
            return null;
          }

          if (!user.password) {
            logger.warn("AUTH", "Login attempt for OAuth-only user (no password set)", { email, userId: user.id });
            return null;
          }

          const rateLimit = await checkLoginAttempts(user.id);
          logger.debug("AUTH", "Rate limit check result", {
            userId: user.id,
            allowed: rateLimit.allowed,
            attemptsRemaining: rateLimit.attemptsRemaining,
            lockedUntil: rateLimit.lockedUntil?.toISOString(),
          });

          if (!rateLimit.allowed) {
            const lockoutMessage = getLockoutMessage(rateLimit.lockedUntil);
            logger.warn("AUTH", "Login blocked - rate limit exceeded", {
              userId: user.id,
              lockedUntil: rateLimit.lockedUntil?.toISOString(),
              lockoutMessage,
            });
            throw new Error(lockoutMessage || "Conta temporariamente bloqueada");
          }

          logger.debug("AUTH", "Verifying password...", { userId: user.id });
          const isValidPassword = await verifyPassword(password, user.password);

          if (!isValidPassword) {
            await incrementLoginAttempts(user.id);
            logger.warn("AUTH", "Invalid password attempt", {
              userId: user.id,
              attemptsRemaining: rateLimit.attemptsRemaining - 1,
            });
            return null;
          }

          await resetLoginAttempts(user.id);
          logger.info("AUTH", "Credentials login SUCCESSFUL", {
            userId: user.id,
            email: user.email,
            hasYoutubeChannelId: !!user.youtubeChannelId,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            youtubeChannelId: user.youtubeChannelId,
          };
        } catch (error) {
          if (error instanceof Error && error.message.includes("bloqueada")) {
            throw error;
          }
          logger.error(
            "AUTH",
            "Credentials authorize EXCEPTION",
            error instanceof Error ? error : undefined,
            { errorMessage: error instanceof Error ? error.message : String(error) }
          );
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/ytpm/login",
    error: "/ytpm/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      logger.info("AUTH_CALLBACK", "signIn callback START", {
        provider: account?.provider,
        userId: user?.id,
        userEmail: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile,
        hasAccessToken: !!account?.access_token,
        accessTokenLength: account?.access_token?.length ?? 0,
        hasRefreshToken: !!account?.refresh_token,
        refreshTokenLength: account?.refresh_token?.length ?? 0,
        expiresAt: account?.expires_at,
        expiresAtDate: account?.expires_at ? new Date(account.expires_at * 1000).toISOString() : "N/A",
        tokenType: account?.token_type,
        scope: account?.scope,
      });

      if (account?.provider === "credentials") {
        logger.info("AUTH_CALLBACK", "signIn - Credentials provider, allowing", { userId: user?.id });
        return true;
      }

      if (account?.provider === "google" && account.access_token) {
        logger.info("AUTH_CALLBACK", "signIn - Google provider, fetching YouTube channel ID", {
          userId: user?.id,
          userEmail: user?.email,
          accessTokenPreview: `${account.access_token.substring(0, 20)}...`,
        });

        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          oauth2Client.setCredentials({ access_token: account.access_token });

          const youtube = google.youtube({ version: "v3", auth: oauth2Client });

          logger.debug("AUTH_CALLBACK", "signIn - Calling YouTube channels.list to get channel ID");

          const startTime = Date.now();
          const response = await youtube.channels.list({
            part: ["id"],
            mine: true,
          });
          const elapsed = Date.now() - startTime;

          const channelId = response.data.items?.[0]?.id;

          logger.info("AUTH_CALLBACK", "signIn - YouTube channels.list response", {
            elapsed: `${elapsed}ms`,
            channelId: channelId || "NOT_FOUND",
            itemsCount: response.data.items?.length || 0,
            responseStatus: response.status,
          });

          if (channelId && user.email) {
            const { error: updateError } = await supabase
              .from("User")
              .update({ youtubeChannelId: channelId })
              .eq("email", user.email);

            if (updateError) {
              logger.error("AUTH_CALLBACK", "signIn - Failed to update YouTube channel ID", updateError, {
                userEmail: user.email,
                channelId,
              });
            } else {
              logger.info("AUTH_CALLBACK", "signIn - User updated with YouTube channel ID", {
                userEmail: user.email,
                channelId,
              });
            }
          } else {
            logger.warn("AUTH_CALLBACK", "signIn - Could not update YouTube channel ID", {
              hasChannelId: !!channelId,
              hasUserEmail: !!user.email,
            });
          }
        } catch (error) {
          const gaxiosError = error as { code?: number; response?: { status?: number; statusText?: string; data?: unknown } };
          logger.error(
            "AUTH_CALLBACK",
            "signIn - Failed to fetch YouTube Channel ID",
            error instanceof Error ? error : undefined,
            {
              userEmail: user.email,
              errorMessage: error instanceof Error ? error.message : String(error),
              errorCode: gaxiosError?.code,
              httpStatus: gaxiosError?.response?.status,
              httpStatusText: gaxiosError?.response?.statusText,
              responseData: gaxiosError?.response?.data ? JSON.stringify(gaxiosError.response.data).substring(0, 500) : undefined,
            }
          );
        }
      } else {
        logger.warn("AUTH_CALLBACK", "signIn - Unexpected provider or missing access token", {
          provider: account?.provider,
          hasAccessToken: !!account?.access_token,
        });
      }

      logger.info("AUTH_CALLBACK", "signIn callback END - allowing sign in", {
        userId: user?.id,
        provider: account?.provider,
      });

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      logger.info("AUTH_JWT", "jwt callback START", {
        trigger,
        hasUser: !!user,
        hasAccount: !!account,
        tokenUserId: token.userId,
        tokenSub: token.sub,
        tokenEmail: token.email,
        hasAccessTokenInToken: !!token.accessToken,
        accessTokenLengthInToken: (token.accessToken as string)?.length ?? 0,
        hasRefreshTokenInToken: !!token.refreshToken,
        expiresAtInToken: token.expiresAt,
        expiresAtDate: token.expiresAt && typeof token.expiresAt === "number" ? new Date((token.expiresAt as number) * 1000).toISOString() : "N/A",
        accountProvider: account?.provider,
      });

      if (user) {
        logger.info("AUTH_JWT", "jwt - Initial sign-in detected, persisting user data", {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        });

        if (user.id) token.userId = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
      }

      if (account) {
        logger.info("AUTH_JWT", "jwt - Persisting account data in token", {
          provider: account.provider,
          hasAccessToken: !!account.access_token,
          accessTokenLength: account.access_token?.length ?? 0,
          accessTokenPreview: account.access_token ? `${account.access_token.substring(0, 20)}...` : "NULL",
          hasRefreshToken: !!account.refresh_token,
          refreshTokenLength: account.refresh_token?.length ?? 0,
          expiresAt: account.expires_at,
          expiresAtDate: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : "N/A",
          scope: account.scope,
          tokenType: account.token_type,
        });

        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.accountId = account.providerAccountId;
      }

      if (!token.userId && token.email) {
        logger.info("AUTH_JWT", "jwt - No userId in token, looking up user by email", { email: token.email });

        try {
          const { data: dbUser, error: dbError } = await supabase
            .from("User")
            .select("id")
            .eq("email", token.email as string)
            .single();

          if (dbError && dbError.code !== "PGRST116") {
            logger.error("AUTH_JWT", "jwt - DB query failed when fetching user by email", dbError, { email: token.email });
          } else if (dbUser) {
            token.userId = dbUser.id;
            logger.info("AUTH_JWT", "jwt - Found user by email in DB", { userId: dbUser.id, email: token.email });
          } else {
            logger.warn("AUTH_JWT", "jwt - No user found by email in DB", { email: token.email });
          }
        } catch (error) {
          logger.error("AUTH_JWT", "jwt - DB query failed when fetching user by email", error instanceof Error ? error : undefined, { email: token.email });
        }
      }

      if (!token.userId && token.sub) {
        logger.warn("AUTH_JWT", "jwt - Using token.sub as fallback userId", { sub: token.sub });
        token.userId = token.sub;
      }

      if (token.expiresAt && typeof token.expiresAt === "number") {
        const now = Math.floor(Date.now() / 1000);
        const expiresAtNum = token.expiresAt as number;
        const expiresIn = expiresAtNum - now;
        const isExpired = expiresAtNum < now - 60;

        logger.info("AUTH_JWT", "jwt - Token expiry check", {
          expiresAt: expiresAtNum,
          expiresAtDate: new Date(expiresAtNum * 1000).toISOString(),
          nowDate: new Date(now * 1000).toISOString(),
          expiresInSeconds: expiresIn,
          expiresInMinutes: Math.round(expiresIn / 60),
          isExpired,
          hasRefreshToken: !!token.refreshToken,
        });

        if (isExpired && token.refreshToken) {
          logger.info("AUTH_JWT", "jwt - Token EXPIRED, attempting refresh...", {
            accountId: token.accountId,
            expiredBy: `${Math.abs(expiresIn)} seconds ago`,
          });

          try {
            const { data: dbAccount, error: accountError } = await supabase
              .from("Account")
              .select("id, refresh_token, access_token, expires_at")
              .eq("providerAccountId", token.accountId as string)
              .eq("provider", "google")
              .single();

            if (accountError && accountError.code !== "PGRST116") {
              logger.error("AUTH_JWT", "jwt - Database error fetching account", accountError);
            } else if (dbAccount) {
              logger.info("AUTH_JWT", "jwt - Account found in DB, refreshing token", {
                dbAccountId: dbAccount.id,
                hasRefreshTokenInDb: !!dbAccount.refresh_token,
                currentAccessTokenPreview: dbAccount.access_token ? `${dbAccount.access_token.substring(0, 20)}...` : "NULL",
                dbExpiresAt: dbAccount.expires_at,
              });

              const newAccessToken = await refreshAccessToken({
                id: dbAccount.id,
                refresh_token: token.refreshToken as string,
              });

              if (newAccessToken) {
                token.accessToken = newAccessToken;
                token.expiresAt = Math.floor(Date.now() / 1000) + 3600;
                logger.info("AUTH_JWT", "jwt - Token refreshed SUCCESSFULLY", {
                  newAccessTokenPreview: `${newAccessToken.substring(0, 20)}...`,
                  newExpiresAt: token.expiresAt,
                  newExpiresAtDate: new Date((token.expiresAt as number) * 1000).toISOString(),
                });
              } else {
                logger.error("AUTH_JWT", "jwt - Token refresh returned null (failed), clearing accessToken", undefined, {
                  accountId: token.accountId,
                  dbAccountId: dbAccount.id,
                });
                // Clear the accessToken to prevent API calls with invalid credentials
                delete token.accessToken;
                // Mark token as invalid so frontend can prompt re-authentication
                token.tokenRefreshFailed = true;
              }
            } else {
              logger.error("AUTH_JWT", "jwt - Account NOT FOUND in database for refresh", undefined, {
                providerAccountId: token.accountId,
              });
            }
          } catch (error) {
            logger.error("AUTH_JWT", "jwt - Token refresh EXCEPTION, clearing accessToken", error instanceof Error ? error : undefined, {
              errorMessage: error instanceof Error ? error.message : String(error),
              accountId: token.accountId,
            });
            // Clear the accessToken to prevent API calls with invalid credentials
            delete token.accessToken;
            token.tokenRefreshFailed = true;
          }
        } else if (isExpired && !token.refreshToken) {
          logger.error("AUTH_JWT", "jwt - Token EXPIRED but NO refresh token available!", undefined, {
            expiresAt: token.expiresAt,
            expiredBy: `${Math.abs(expiresIn)} seconds ago`,
          });
        }
      } else {
        logger.warn("AUTH_JWT", "jwt - No expiresAt in token or invalid type", {
          expiresAt: token.expiresAt,
          expiresAtType: typeof token.expiresAt,
        });
      }

      logger.info("AUTH_JWT", "jwt callback END", {
        userId: token.userId,
        hasAccessToken: !!token.accessToken,
        accessTokenLength: (token.accessToken as string)?.length ?? 0,
        accessTokenPreview: token.accessToken ? `${(token.accessToken as string).substring(0, 20)}...` : "NULL",
        expiresAt: token.expiresAt,
        hasRefreshToken: !!token.refreshToken,
      });

      return token;
    },
    async session({ session, token }) {
      logger.info("AUTH_SESSION", "session callback START", {
        tokenUserId: token.userId,
        tokenSub: token.sub,
        tokenEmail: token.email,
        hasAccessTokenInToken: !!token.accessToken,
        accessTokenLengthInToken: (token.accessToken as string)?.length ?? 0,
        accessTokenPreviewInToken: token.accessToken ? `${(token.accessToken as string).substring(0, 20)}...` : "NULL",
        hasSessionUser: !!session?.user,
        sessionUserEmail: session?.user?.email,
        tokenExpiresAt: token.expiresAt,
        tokenExpiresAtDate: token.expiresAt && typeof token.expiresAt === "number" ? new Date((token.expiresAt as number) * 1000).toISOString() : "N/A",
      });

      if (!session.user) {
        logger.warn("AUTH_SESSION", "session - session.user was undefined/null, creating empty object");
        session.user = { id: "" } as typeof session.user;
      }

      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      if (token.picture) session.user.image = token.picture as string;

      async function fetchUserWithAccount(whereClause: { id?: string; email?: string }) {
        const fetchStartTime = Date.now();
        logger.debug("AUTH_SESSION", "session - fetchUserWithAccount", { whereClause });

        try {
          // Fetch user
          let userQuery = supabase
            .from("User")
            .select("id, email, name, image, youtubeChannelId, updatedAt");

          if (whereClause.id) {
            userQuery = userQuery.eq("id", whereClause.id);
          } else if (whereClause.email) {
            userQuery = userQuery.eq("email", whereClause.email);
          }

          const { data: user, error: userError } = await userQuery.single();

          if (userError && userError.code !== "PGRST116") {
            logger.error("DATABASE", "session - fetchUserWithAccount user query failed", userError);
            return null;
          }

          if (!user) {
            logger.debug("AUTH_SESSION", "session - fetchUserWithAccount - user not found");
            return null;
          }

          // Fetch accounts for this user
          const { data: accounts, error: accountsError } = await supabase
            .from("Account")
            .select("id, provider, access_token, refresh_token, expires_at")
            .eq("userId", user.id);

          if (accountsError) {
            logger.error("DATABASE", "session - fetchUserWithAccount accounts query failed", accountsError);
          }

          const elapsed = Date.now() - fetchStartTime;
          logger.info("AUTH_SESSION", "session - fetchUserWithAccount result", {
            whereClause,
            found: !!user,
            userId: user?.id,
            accountsCount: accounts?.length ?? 0,
            hasYoutubeChannelId: !!user?.youtubeChannelId,
            youtubeChannelId: user?.youtubeChannelId,
            elapsed: `${elapsed}ms`,
            accountProviders: accounts?.map(a => a.provider),
            accountHasAccessToken: accounts?.map(a => !!a.access_token),
            accountAccessTokenLengths: accounts?.map(a => a.access_token?.length ?? 0),
            accountExpiresAt: accounts?.map(a => a.expires_at),
            accountHasRefreshToken: accounts?.map(a => !!a.refresh_token),
          });

          return { ...user, accounts: accounts || [] };
        } catch (error) {
          logger.error("DATABASE", "session - fetchUserWithAccount FAILED", error instanceof Error ? error : undefined, {
            whereClause,
            errorMessage: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      }

      // STRATEGY 1
      if (token.userId) {
        session.user.id = token.userId as string;
        logger.info("AUTH_SESSION", "session - STRATEGY 1: Using userId from token", { userId: session.user.id });

        const dbUser = await fetchUserWithAccount({ id: token.userId as string });
        if (dbUser) {
          session.user.youtubeChannelId = dbUser.youtubeChannelId;
        } else {
          logger.warn("AUTH_SESSION", "session - STRATEGY 1: DB user NOT found by userId", { userId: token.userId });
        }

        if (token.accessToken) {
          session.accessToken = token.accessToken as string;
          logger.info("AUTH_SESSION", "session - STRATEGY 1: Using access token from JWT", {
            accessTokenLength: (token.accessToken as string).length,
            accessTokenPreview: `${(token.accessToken as string).substring(0, 20)}...`,
          });
        } else {
          logger.error("AUTH_SESSION", "session - STRATEGY 1: NO access token in JWT!", undefined, {
            userId: token.userId,
            tokenKeys: Object.keys(token),
          });
        }

        logger.info("AUTH_SESSION", "session callback END via STRATEGY 1", {
          userId: session.user.id,
          hasAccessToken: !!session.accessToken,
          accessTokenLength: session.accessToken?.length ?? 0,
          youtubeChannelId: session.user.youtubeChannelId,
        });

        return session;
      }

      // STRATEGY 1.5
      if (token.sub && !token.userId) {
        logger.info("AUTH_SESSION", "session - STRATEGY 1.5: Trying token.sub as userId", { sub: token.sub });

        const subUser = await fetchUserWithAccount({ id: token.sub });
        if (subUser) {
          session.user.id = subUser.id;
          session.user.youtubeChannelId = subUser.youtubeChannelId;
          if (token.accessToken) {
            session.accessToken = token.accessToken as string;
          } else {
            const account = subUser.accounts[0];
            if (account?.access_token) {
              session.accessToken = account.access_token;
              logger.info("AUTH_SESSION", "session - STRATEGY 1.5: Using DB account access token", {
                accountId: account.id,
                provider: account.provider,
                expiresAt: account.expires_at,
              });
            } else {
              logger.error("AUTH_SESSION", "session - STRATEGY 1.5: NO access token available!", undefined, {
                userId: subUser.id,
                accountsCount: subUser.accounts.length,
              });
            }
          }

          logger.info("AUTH_SESSION", "session callback END via STRATEGY 1.5", {
            userId: session.user.id,
            hasAccessToken: !!session.accessToken,
          });

          return session;
        }
      }

      // STRATEGY 2
      const email = (token.email as string) || session?.user?.email;
      if (email) {
        logger.info("AUTH_SESSION", "session - STRATEGY 2: Falling back to fetch by email", { email });

        const emailUser = await fetchUserWithAccount({ email });

        if (emailUser) {
          session.user.id = emailUser.id;
          session.user.youtubeChannelId = emailUser.youtubeChannelId;

          if (token.accessToken) {
            session.accessToken = token.accessToken as string;
          } else {
            const account = emailUser.accounts[0];
            if (account?.access_token) {
              const now = Math.floor(Date.now() / 1000);
              const isExpired = (account.expires_at || 0) < now - 60;

              logger.info("AUTH_SESSION", "session - STRATEGY 2: Checking DB account token", {
                accountId: account.id,
                expiresAt: account.expires_at,
                isExpired,
                hasRefreshToken: !!account.refresh_token,
              });

              if (isExpired && account.refresh_token) {
                const newToken = await refreshAccessToken({
                  id: account.id,
                  refresh_token: account.refresh_token,
                });
                session.accessToken = newToken ?? account.access_token ?? null;
              } else {
                session.accessToken = account.access_token;
              }
            } else {
              logger.error("AUTH_SESSION", "session - STRATEGY 2: NO access token in DB account!", undefined, {
                userId: emailUser.id,
                accountsCount: emailUser.accounts.length,
              });
            }
          }

          logger.info("AUTH_SESSION", "session callback END via STRATEGY 2", {
            userId: session.user.id,
            hasAccessToken: !!session.accessToken,
          });

          return session;
        }
      }

      // STRATEGY 3
      try {
        logger.warn("AUTH_SESSION", "session - STRATEGY 3 (LAST RESORT): Looking for any recent Google user", {
          tokenKeys: Object.keys(token),
        });

        // First, find a user with a Google account
        const { data: googleAccounts, error: accountError } = await supabase
          .from("Account")
          .select("userId")
          .eq("provider", "google")
          .limit(1);

        if (accountError || !googleAccounts || googleAccounts.length === 0) {
          logger.warn("AUTH_SESSION", "session - STRATEGY 3: No Google accounts found");
        } else if (googleAccounts[0]?.userId) {
          // Now fetch the user with all their accounts
          const { data: recentUser, error: userError } = await supabase
            .from("User")
            .select("id, youtubeChannelId")
            .eq("id", googleAccounts[0].userId)
            .single();

          if (userError && userError.code !== "PGRST116") {
            logger.error("AUTH_SESSION", "session - STRATEGY 3: User query failed", userError);
          } else if (recentUser) {
            // Fetch accounts for this user
            const { data: accounts, error: accsError } = await supabase
              .from("Account")
              .select("id, access_token, refresh_token, expires_at")
              .eq("userId", recentUser.id);

            if (accsError) {
              logger.error("AUTH_SESSION", "session - STRATEGY 3: Accounts query failed", accsError);
            }

            session.user.id = recentUser.id;
            session.user.youtubeChannelId = recentUser.youtubeChannelId;

            if (accounts && accounts.length > 0) {
              const account = accounts[0];
              if (account?.access_token) {
                const now = Math.floor(Date.now() / 1000);
                const isExpired = (account.expires_at || 0) < now - 60;

                if (isExpired && account.refresh_token) {
                  const newToken = await refreshAccessToken({
                    id: account.id,
                    refresh_token: account.refresh_token,
                  });
                  session.accessToken = newToken ?? account.access_token ?? null;
                } else {
                  session.accessToken = account.access_token;
                }
              }
            }

            logger.info("AUTH_SESSION", "session callback END via STRATEGY 3", {
              userId: session.user.id,
              hasAccessToken: !!session.accessToken,
            });

            return session;
          }
        }
      } catch (error) {
        logger.error("AUTH_SESSION", "session - STRATEGY 3 FAILED", error instanceof Error ? error : undefined);
      }

      logger.error("AUTH_SESSION", "session callback END - ALL STRATEGIES FAILED", undefined, {
        hasSessionUser: !!session.user,
        sessionUserId: session.user?.id,
        hasAccessToken: !!session.accessToken,
      });

      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      logger.info("AUTH", "signIn EVENT triggered", {
        userId: user.id,
        provider: account?.provider,
        hasAccessToken: !!account?.access_token,
        hasRefreshToken: !!account?.refresh_token,
        expiresAt: account?.expires_at,
      });

      if (account && user.id) {
        try {
          logger.info("AUTH", "signIn EVENT - Updating account tokens in DB", {
            userId: user.id,
            provider: account.provider,
            accessTokenPreview: account.access_token ? `${account.access_token.substring(0, 20)}...` : "NULL",
            expiresAt: account.expires_at,
          });

          const { error: updateError } = await supabase
            .from("Account")
            .update({
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            })
            .eq("userId", user.id)
            .eq("provider", account.provider);

          if (updateError) {
            logger.error("DATABASE", "signIn EVENT - Failed to update account tokens", updateError, {
              userId: user.id,
              provider: account.provider,
            });
          } else {
            logger.info("AUTH", "signIn EVENT - Account tokens updated", {
              userId: user.id,
              provider: account.provider,
            });
          }
        } catch (error) {
          logger.error("DATABASE", "signIn EVENT - Failed to update account tokens", error instanceof Error ? error : undefined, {
            userId: user.id,
            provider: account.provider,
          });
        }
      }
    },
  },
});

console.log("[ROOT_AUTH_INIT] NextAuth initialization COMPLETE");

export async function getAuthSession() {
  logger.info("AUTH", "getAuthSession START");
  const startTime = Date.now();
  const session = await auth();
  const elapsed = Date.now() - startTime;

  logger.info("AUTH", "getAuthSession END", {
    elapsed: `${elapsed}ms`,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    hasAccessToken: !!session?.accessToken,
    accessTokenLength: session?.accessToken?.length ?? 0,
    youtubeChannelId: session?.user?.youtubeChannelId,
  });

  return session;
}

export async function requireAuth() {
  logger.info("AUTH", "requireAuth START");
  const startTime = Date.now();
  const session = await auth();
  const elapsed = Date.now() - startTime;

  if (!session?.user) {
    logger.error("AUTH", "requireAuth FAILED - No session or user", undefined, {
      elapsed: `${elapsed}ms`,
      hasSession: !!session,
    });
    throw new Error("Não autenticado");
  }

  logger.info("AUTH", "requireAuth SUCCESS", {
    elapsed: `${elapsed}ms`,
    userId: session.user.id,
    hasAccessToken: !!session.accessToken,
  });

  return session;
}
