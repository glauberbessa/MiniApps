import { createClient } from "@supabase/supabase-js";
import "server-only";

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined;
};

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are not set"
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Use lazy initialization to avoid creating the client during build time
function getSupabaseClient() {
  if (!globalForSupabase.supabase) {
    globalForSupabase.supabase = createSupabaseClient();
  }
  return globalForSupabase.supabase;
}

// Check if we should skip DB initialization (during build without Supabase env vars)
function shouldSkipInit(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Create a proxy that lazily initializes the Supabase client
// This prevents errors during Next.js build when Supabase env vars are not available
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    // Skip initialization for internal properties or during build
    if (typeof prop === "symbol" || prop === "then" || prop === "catch") {
      return undefined;
    }

    // During build without Supabase env vars, return async no-ops for method calls
    if (shouldSkipInit()) {
      // Return a proxy that returns empty promises for any method call
      return new Proxy(() => {}, {
        get() {
          return () => Promise.resolve({ data: null, error: null });
        },
        apply() {
          return Promise.resolve({ data: null, error: null });
        },
      });
    }

    const client = getSupabaseClient();
    const value = (client as Record<string, any>)[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
