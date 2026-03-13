import { SupabaseClient } from "@supabase/supabase-js";
import { Adapter } from "next-auth/adapters";

export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  return {
    async createUser(data) {
      const { data: user, error } = await supabase
        .from("User")
        .insert([
          {
            name: data.name,
            email: data.email,
            emailVerified: data.emailVerified,
            image: data.image,
          },
        ])
        .select()
        .single();

      if (error) throw error;
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
      const { data: account, error } = await supabase
        .from("Account")
        .insert([
          {
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

      if (error) throw error;
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
