# Fix: Google Authentication Error (Configuration)

## Problem
When trying to register/login with Google OAuth, you get:
- Error: "Configuration"
- Message: "Erro interno do servidor durante a autenticação..."
- Logs show: `SUPABASE_URL: ❌ NOT SET` or `SUPABASE_SERVICE_ROLE_KEY: ❌ NOT SET`

## Root Cause
The `SUPABASE_URL` and/or `SUPABASE_SERVICE_ROLE_KEY` environment variables are missing from your Vercel production environment.

When NextAuth tries to create a new user during OAuth login via the Supabase adapter (using Supabase JS SDK), it cannot connect to the database and the operation fails.

The error is masked as "Configuration" by NextAuth.js v5 - this is a catch-all error code that hides the actual database connection failure.

## Solution

### Step 1: Get Your Supabase Credentials

1. Go to your **Supabase Dashboard**
2. Select your project
3. Navigate to **Settings** → **API**
4. Look for:
   - **Project URL** - this is your `SUPABASE_URL`
   - **Service Role Key** - this is your `SUPABASE_SERVICE_ROLE_KEY` (the secret, not the anon key!)

   Format examples:
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Add to Vercel Environment Variables

1. Go to your **Vercel Project Dashboard**
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add Environment Variable** twice to add both:

   **First variable:**
   - **Name:** `SUPABASE_URL`
   - **Value:** (paste your Supabase Project URL)
   - **Environments:** Select `Production` (minimum), optionally add to `Preview` and `Development`

   **Second variable:**
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (paste your Supabase Service Role Key - the secret key, NOT the anon key)
   - **Environments:** Select `Production` (minimum), optionally add to `Preview` and `Development`

4. Click **Save** for each

### Step 3: Redeploy

After adding the environment variables:
1. Commit any local changes (if needed)
2. Push to your branch
3. Vercel will automatically redeploy with the new env vars
4. Or manually trigger a redeploy from Vercel dashboard

### Step 4: Test

1. Clear browser cache and cookies
2. Try Google OAuth login again
3. User should be created successfully in the database

## Verification

Check your Vercel logs at the time of the error:
- Should NOT see: `SUPABASE_URL: ❌ NOT SET` or `SUPABASE_SERVICE_ROLE_KEY: ❌ NOT SET`
- Should see: `SUPABASE_URL: [SET]` and `SUPABASE_SERVICE_ROLE_KEY: [SET]`
- Error log should show successful database operations instead of adapter errors

## Why This Happens

- **Local Development:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` likely come from your `.env.local` file
- **Vercel Production:** Environment variables must be explicitly set in Vercel dashboard
- **Supabase Adapter:** Your auth system uses the Supabase JS SDK adapter (`SupabaseAdapter` in `src/lib/supabase-adapter.ts`) that requires database connectivity to store user accounts and OAuth tokens

## Important: Service Role Key vs Anon Key

⚠️ **Use the CORRECT key:**
- ✅ For `SUPABASE_SERVICE_ROLE_KEY`: Use the **Service Role Key** (the secret key from Settings → API → "service_role")
- ❌ NOT the **Anon Key** (the public key used in frontend code)

The service role key has full database access and should be kept private.

## Environment Variables Summary

For reference, these env vars are required in Vercel:

| Variable | Purpose | Status |
|----------|---------|--------|
| `SUPABASE_URL` | Supabase project URL | ⚠️ **MISSING** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | ⚠️ **MISSING** |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | ✅ SET |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ✅ SET |
| `AUTH_SECRET` | NextAuth JWT signing key | ✅ SET |
| `NEXTAUTH_URL` | Auth callback URL | ✅ SET |
| `RESEND_API_KEY` | Email service (optional) | - |
| `EMAIL_FROM` | Email sender (optional) | - |

## Related Files

- `src/lib/supabase.ts` - Supabase JS SDK client configuration
- `src/lib/supabase-adapter.ts` - NextAuth adapter for Supabase
- `src/lib/auth.ts` - NextAuth configuration

## Technology Stack

The project uses:
- **Supabase JS SDK** (`@supabase/supabase-js`) - for database access and authentication
- **NextAuth.js v5** - for OAuth and credential authentication
- **PostgreSQL** (via Supabase) - for user data persistence

## Additional Notes

- Make sure the Supabase project is **active** (not paused)
- Verify you're using the **Service Role Key** (not the Anon Key)
- For local testing, add both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Do not commit the `.env.local` file to git (it contains secrets)
