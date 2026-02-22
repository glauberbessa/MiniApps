import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
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

// Get the auth secret with proper validation
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  console.log(`[ROOT_AUTH_INIT] Checking secrets: AUTH_SECRET=${process.env.AUTH_SECRET ? 'SET' : 'NOT_SET'}, NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'}`);

  if (secret) {
    console.log(`[ROOT_AUTH_INIT] Using ${process.env.AUTH_SECRET ? 'AUTH_SECRET' : 'NEXTAUTH_SECRET'}`);
    return secret;
  }

  // In production, we must have a secret - throw a clear error
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    console.error(
      "[Auth] CRITICAL: AUTH_SECRET or NEXTAUTH_SECRET environment variable is not set! " +
      "Authentication will not work properly. Please set AUTH_SECRET in your Vercel environment variables."
    );
    const emergencyFallback = process.env.VERCEL_URL || process.env.VERCEL_GIT_COMMIT_SHA || "insecure-fallback-please-set-auth-secret";
    return `emergency-${emergencyFallback}`;
  }

  console.warn("[Auth] Warning: No AUTH_SECRET set. Using development fallback.");
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
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date
            ? Math.floor(credentials.expiry_date / 1000)
            : null,
        },
      });
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
  const prismaMatch = message.match(/The table `([^`]+)` does not exist/i);
  if (prismaMatch?.[1]) {
    return prismaMatch[1];
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

function withRetryAdapter(adapter: ReturnType<typeof PrismaAdapter>) {
  const isTransientError = (error: unknown): boolean => {
    const msg = error instanceof Error ? error.message : String(error);
    return /connection|timeout|ECONNREFUSED|ECONNRESET|socket|fetch failed|Can't reach database/i.test(msg);
  };

  const handler: ProxyHandler<typeof adapter> = {
    get(target, prop: string) {
      const original = target[prop as keyof typeof target];
      if (typeof original !== "function") return original;

      return async (...args: unknown[]) => {
        try {
          return await (original as (...a: unknown[]) => Promise<unknown>).apply(target, args);
        } catch (error) {
          if (!isTransientError(error)) throw error;

          logger.warn("DATABASE", `Adapter method "${prop}" failed with transient error, retrying once...`, {
            error: error instanceof Error ? error.message : String(error),
          });
          await new Promise((r) => setTimeout(r, 500));
          return await (original as (...a: unknown[]) => Promise<unknown>).apply(target, args);
        }
      };
    },
  };
  return new Proxy(adapter, handler);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: withRetryAdapter(PrismaAdapter(prisma)),
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
        logger.critical("DATABASE", "Missing Prisma table detected during auth", causeChain.rootError, {
          missingTable,
          isVercel: !!process.env.VERCEL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          guidance: "Run `prisma migrate deploy` (or `prisma db push`) against the production database and confirm DATABASE_URL points to that database.",
        });
      }

      // Check for missing column in the cause chain (schema drift)
      const missingColumn = extractMissingColumn(causeChain.message);
      if (missingColumn) {
        logger.critical("DATABASE", "Missing database column detected - schema out of sync", causeChain.rootError, {
          missingColumn,
          isVercel: !!process.env.VERCEL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          guidance: "The Prisma schema has columns that don't exist in the database. Run `prisma migrate deploy` (or `prisma db push`) against the production database to add the missing columns.",
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
        maxAge: 60 * 15,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              isActive: true,
              youtubeChannelId: true,
            },
          });

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
          const oauth2Client = new google.auth.OAuth2();
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
            await prisma.user.update({
              where: { email: user.email },
              data: { youtubeChannelId: channelId },
            });

            logger.info("AUTH_CALLBACK", "signIn - User updated with YouTube channel ID", {
              userEmail: user.email,
              channelId,
            });
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
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
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
            const dbAccount = await prisma.account.findFirst({
              where: {
                providerAccountId: token.accountId as string,
                provider: "google",
              },
            });

            if (dbAccount) {
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
                logger.error("AUTH_JWT", "jwt - Token refresh returned null (failed)", undefined, {
                  accountId: token.accountId,
                  dbAccountId: dbAccount.id,
                });
              }
            } else {
              logger.error("AUTH_JWT", "jwt - Account NOT FOUND in database for refresh", undefined, {
                providerAccountId: token.accountId,
              });
            }
          } catch (error) {
            logger.error("AUTH_JWT", "jwt - Token refresh EXCEPTION", error instanceof Error ? error : undefined, {
              errorMessage: error instanceof Error ? error.message : String(error),
              accountId: token.accountId,
            });
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
          const user = await prisma.user.findFirst({
            where: whereClause,
            include: { accounts: true },
          });

          const elapsed = Date.now() - fetchStartTime;
          logger.info("AUTH_SESSION", "session - fetchUserWithAccount result", {
            whereClause,
            found: !!user,
            userId: user?.id,
            accountsCount: user?.accounts?.length ?? 0,
            hasYoutubeChannelId: !!user?.youtubeChannelId,
            youtubeChannelId: user?.youtubeChannelId,
            elapsed: `${elapsed}ms`,
            accountProviders: user?.accounts?.map(a => a.provider),
            accountHasAccessToken: user?.accounts?.map(a => !!a.access_token),
            accountAccessTokenLengths: user?.accounts?.map(a => a.access_token?.length ?? 0),
            accountExpiresAt: user?.accounts?.map(a => a.expires_at),
            accountHasRefreshToken: user?.accounts?.map(a => !!a.refresh_token),
          });

          return user;
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

        const recentUser = await prisma.user.findFirst({
          where: { accounts: { some: { provider: "google" } } },
          include: { accounts: true },
          orderBy: { updatedAt: "desc" },
        });

        if (recentUser) {
          session.user.id = recentUser.id;
          session.user.youtubeChannelId = recentUser.youtubeChannelId;

          const account = recentUser.accounts[0];
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

          logger.info("AUTH_SESSION", "session callback END via STRATEGY 3", {
            userId: session.user.id,
            hasAccessToken: !!session.accessToken,
          });

          return session;
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

          const result = await prisma.account.updateMany({
            where: { userId: user.id, provider: account.provider },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });

          logger.info("AUTH", "signIn EVENT - Account tokens updated", {
            userId: user.id,
            provider: account.provider,
            updatedCount: result.count,
          });
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
