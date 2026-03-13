import { SupabaseClient } from "@supabase/supabase-js";
import { Adapter } from "next-auth/adapters";
import { randomUUID } from "crypto";

export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  return {
    async createUser(data) {
      // Check if user already exists by email (important for OAuth linking)
      const { data: existingUser, error: existingError } = await supabase
        .from("User")
        .select()
        .eq("email", data.email)
        .single();

      // If user exists, return existing user instead of creating duplicate
      if (existingUser) {
        console.log("[ADAPTER] createUser - Found existing user by email:", data.email);
        return existingUser;
      }

      // Only throw if there's a real error (not "no rows found")
      if (existingError && existingError.code !== "PGRST116") {
        console.error("[ADAPTER] createUser - Error checking for existing user:", existingError);
        throw existingError;
      }

      const { data: user, error } = await supabase
        .from("User")
        .insert([
          {
            id: randomUUID(),
            name: data.name,
            email: data.email,
            emailVerified: data.emailVerified,
            image: data.image,
            password: null, // OAuth users don't have passwords
            isActive: true, // New users are active by default
            loginAttempts: 0, // Reset login attempts counter
            lockedUntil: null, // Not locked initially
            passwordResetToken: null,
            passwordResetExpires: null,
            youtubeChannelId: null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("[ADAPTER] createUser ERROR:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
          email: data.email,
        });
        throw error;
      }
      return user;
    },

    async getUser(id) {
      const { data: user, error } = await supabase
        .from("User")
        .select()
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return user || null;
    },

    async getUserByEmail(email) {
      const { data: user, error } = await supabase
        .from("User")
        .select()
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return user || null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const { data: account, error: accountError } = await supabase
        .from("Account")
        .select("userId")
        .eq("provider", provider)
        .eq("providerAccountId", providerAccountId)
        .single();

      if (accountError && accountError.code !== "PGRST116") throw accountError;
      if (!account) return null;

      const { data: user, error: userError } = await supabase
        .from("User")
        .select()
        .eq("id", account.userId)
        .single();

      if (userError && userError.code !== "PGRST116") throw userError;
      return user || null;
    },

    async updateUser(data) {
      const { data: user, error } = await supabase
        .from("User")
        .update({
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return user;
    },

    async deleteUser(userId) {
      await supabase.from("User").delete().eq("id", userId);
    },

    async linkAccount(data) {
      // Check if account already exists (important for re-linking or token refresh)
      const { data: existingAccount, error: existingError } = await supabase
        .from("Account")
        .select()
        .eq("provider", data.provider)
        .eq("providerAccountId", data.providerAccountId)
        .single();

      // If account exists, update it with new tokens
      if (existingAccount) {
        console.log("[ADAPTER] linkAccount - Found existing account, updating tokens:", {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        });

        const { data: account, error: updateError } = await supabase
          .from("Account")
          .update({
            userId: data.userId,
            type: data.type,
            refresh_token: data.refresh_token,
            access_token: data.access_token,
            expires_at: data.expires_at,
            token_type: data.token_type,
            scope: data.scope,
            id_token: data.id_token,
            session_state: data.session_state,
          })
          .eq("provider", data.provider)
          .eq("providerAccountId", data.providerAccountId)
          .select()
          .single();

        if (updateError) {
          console.error("[ADAPTER] linkAccount UPDATE ERROR:", {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            status: updateError.status,
            provider: data.provider,
          });
          throw updateError;
        }
        return account;
      }

      // Only throw if there's a real error (not "no rows found")
      if (existingError && existingError.code !== "PGRST116") {
        console.error("[ADAPTER] linkAccount - Error checking for existing account:", existingError);
        throw existingError;
      }

      // Create new account link
      const { data: account, error } = await supabase
        .from("Account")
        .insert([
          {
            id: randomUUID(),
            userId: data.userId,
            type: data.type,
            provider: data.provider,
            providerAccountId: data.providerAccountId,
            refresh_token: data.refresh_token,
            access_token: data.access_token,
            expires_at: data.expires_at,
            token_type: data.token_type,
            scope: data.scope,
            id_token: data.id_token,
            session_state: data.session_state,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("[ADAPTER] linkAccount ERROR:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
          provider: data.provider,
        });
        throw error;
      }
      return account;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await supabase
        .from("Account")
        .delete()
        .eq("provider", provider)
        .eq("providerAccountId", providerAccountId);
    },

    async createSession(data) {
      const { data: session, error } = await supabase
        .from("Session")
        .insert([
          {
            id: randomUUID(),
            sessionToken: data.sessionToken,
            userId: data.userId,
            expires: data.expires,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return session;
    },

    async getSessionAndUser(sessionToken) {
      const { data: session, error: sessionError } = await supabase
        .from("Session")
        .select("*")
        .eq("sessionToken", sessionToken)
        .single();

      if (sessionError && sessionError.code !== "PGRST116")
        throw sessionError;
      if (!session) return null;

      const { data: user, error: userError } = await supabase
        .from("User")
        .select()
        .eq("id", session.userId)
        .single();

      if (userError && userError.code !== "PGRST116") throw userError;
      if (!user) return null;

      return { session, user };
    },

    async updateSession(data) {
      const { data: session, error } = await supabase
        .from("Session")
        .update({
          expires: data.expires,
        })
        .eq("sessionToken", data.sessionToken)
        .select()
        .single();

      if (error) throw error;
      return session || null;
    },

    async deleteSession(sessionToken) {
      await supabase
        .from("Session")
        .delete()
        .eq("sessionToken", sessionToken);
    },

    async createVerificationToken(data) {
      // VerificationToken doesn't need an id - it uses (identifier, token) as composite key
      const { data: token, error } = await supabase
        .from("VerificationToken")
        .insert([
          {
            identifier: data.identifier,
            token: data.token,
            expires: data.expires,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      const { data: verificationToken, error } = await supabase
        .from("VerificationToken")
        .select()
        .eq("identifier", identifier)
        .eq("token", token)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (verificationToken) {
        await supabase
          .from("VerificationToken")
          .delete()
          .eq("identifier", identifier)
          .eq("token", token);
      }

      return verificationToken || null;
    },
  };
}
