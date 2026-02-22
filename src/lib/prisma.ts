import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "server-only";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  console.log(`[PRISMA] Creating PrismaClient | DATABASE_URL: ${connectionString ? `SET (length: ${connectionString.length}, starts with: ${connectionString.substring(0, 30)}...)` : 'NOT SET'}`);
  console.log(`[PRISMA] Environment: NODE_ENV=${process.env.NODE_ENV} | VERCEL=${process.env.VERCEL || 'not set'}`);

  if (!connectionString) {
    console.error("[PRISMA] CRITICAL: DATABASE_URL environment variable is not set!");
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Se for localhost, usa conexão TCP padrão (sem driver serverless)
  if (connectionString.includes("localhost")) {
    console.log("[PRISMA] Using local TCP connection (localhost detected)");
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  console.log("[PRISMA] Using Neon serverless adapter");
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Use lazy initialization to avoid creating the client during build time
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    console.log("[PRISMA] Initializing PrismaClient (first access)...");
    globalForPrisma.prisma = createPrismaClient();
    console.log("[PRISMA] PrismaClient initialized successfully");
  }
  return globalForPrisma.prisma;
}

// Check if we should skip DB initialization (during build without DATABASE_URL)
function shouldSkipInit(): boolean {
  return !process.env.DATABASE_URL;
}

// Create a proxy that lazily initializes the Prisma client
// This prevents errors during Next.js build when DATABASE_URL is not available
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Skip initialization for internal properties or during build
    if (typeof prop === "symbol" || prop === "then" || prop === "catch") {
      return undefined;
    }

    // During build without DATABASE_URL, return async no-ops for model methods
    if (shouldSkipInit()) {
      console.warn(`[PRISMA] Skipping DB init (no DATABASE_URL) - returning no-op for: ${String(prop)}`);
      // Return a proxy that returns empty promises for any method call
      return new Proxy(() => {}, {
        get() {
          return () => Promise.resolve(null);
        },
        apply() {
          return Promise.resolve(null);
        },
      });
    }

    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
