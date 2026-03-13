import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase configuration. " +
    `SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}, ` +
    `SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'SET' : 'MISSING'}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
