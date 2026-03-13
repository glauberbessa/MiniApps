# Fix: Google Authentication Error (Configuration)

## Problem
When trying to register/login with Google OAuth, you get:
- Error: "Configuration"
- Message: "Erro interno do servidor durante a autenticação..."
- Logs show: `DATABASE_URL: ❌ NOT SET`

## Root Cause
The `DATABASE_URL` environment variable is missing from your Vercel production environment. When NextAuth tries to create a new user during OAuth login via the Supabase adapter, Prisma cannot connect to the database.

The error is masked as "Configuration" by NextAuth.js v5 - this is a catch-all error code that hides the actual database connection failure.

## Solution

### Step 1: Get Your Supabase Connection String

1. Go to your **Supabase Dashboard**
2. Select your project
3. Navigate to **Settings** → **Database**
4. Look for **Connection pooling** or **Connection string** section
5. Copy the **URI** (the full PostgreSQL connection string)
   - Format: `postgresql://postgres.[project-id]:[password]@aws-0-[region].pooling.supabase.co:6543/postgres?schema=public`

### Step 2: Add to Vercel Environment Variables

1. Go to your **Vercel Project Dashboard**
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add Environment Variable**
4. Fill in:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste your Supabase connection URI)
   - **Environments:** Select `Production` (minimum), optionally add to `Preview` and `Development`
5. Click **Save**

### Step 3: Redeploy

After adding the environment variable:
1. Commit any local changes (if needed)
2. Push to your branch
3. Vercel will automatically redeploy with the new env var
4. Or manually trigger a redeploy from Vercel dashboard

### Step 4: Test

1. Clear browser cache and cookies
2. Try Google OAuth login again
3. User should be created successfully in the database

## Verification

Check your Vercel logs at the time of the error:
- Should NOT see: `DATABASE_URL: ❌ NOT SET`
- Should see: `DATABASE_URL: [SET]`
- Error log should show successful database operations instead of adapter errors

## Why This Happens

- **Local Development:** DATABASE_URL likely comes from your `.env.local` file
- **Vercel Production:** Environment variables must be explicitly set in Vercel dashboard
- **Supabase Adapter:** Your auth system uses a Supabase-based adapter (SupabaseAdapter in `src/lib/supabase-adapter.ts`) that requires database connectivity to store user accounts and OAuth tokens

## Environment Variables Summary

For reference, these env vars are required in Vercel:

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | Supabase PostgreSQL connection | ⚠️ **MISSING** |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | ✅ SET |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ✅ SET |
| `AUTH_SECRET` | NextAuth JWT signing key | ✅ SET |
| `NEXTAUTH_URL` | Auth callback URL | ✅ SET |
| `RESEND_API_KEY` | Email service (optional) | - |
| `EMAIL_FROM` | Email sender (optional) | - |

## Related Files

- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/supabase-adapter.ts` - Database adapter for user storage
- `prisma/schema.prisma` - Database schema

## Additional Notes

- Make sure the Supabase project is **active** (not paused)
- Verify the connection string is for the correct Supabase project
- If using connection pooling, ensure the port matches (usually 6543 for pooling)
- For local testing, add `DATABASE_URL` to `.env.local` before running `npm run dev`
