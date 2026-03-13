import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import process from "node:process";

const PRIMARY_TABLE = "Account";

function runCommand(command) {
  const result = spawnSync(command, {
    shell: true,
    encoding: "utf8",
    stdio: "pipe",
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (output.trim()) {
    process.stdout.write(output);
  }
  return { status: result.status ?? 1, output };
}

async function checkTableExists() {
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    // Try to query the table with a simple select to verify it exists
    const { error } = await supabase.from(PRIMARY_TABLE).select("id", { count: "exact", head: true });

    if (error) {
      if (error.message.includes("does not exist") || error.code === "PGRST116") {
        return false;
      }
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error checking table:", error);
    return false;
  }
}

async function main() {
  if (process.env.VERCEL && process.env.SKIP_DB_MIGRATIONS === "1") {
    console.log("Detected Vercel environment with SKIP_DB_MIGRATIONS=1. Skipping database checks.");
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Skipping database checks.");
    console.log("Ensure Supabase credentials are configured in your environment.");
    return;
  }

  console.log("Checking database schema...");
  const tableExists = await checkTableExists();

  if (!tableExists) {
    console.log(
      `WARNING: Table '${PRIMARY_TABLE}' was not found in Supabase.`,
    );
    console.log("Please ensure all required tables exist in your Supabase project.");
    console.log("You can create them using the Supabase dashboard or via SQL migrations.");
  } else {
    console.log(`✓ Table '${PRIMARY_TABLE}' exists. Database schema is ready.`);
  }
}

main().catch((error) => {
  console.error("Unexpected error while ensuring database schema:");
  console.error(error);
  process.exit(1);
});
