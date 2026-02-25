// MOCKED SUPABASE CLIENT FOR LARAVEL INTEGRATION
// This file satisfies legacy imports while we migrate to our Laravel API.
import { api } from "@/lib/api/client";

export const supabase: any = {
  auth: {
    getSession: async () => {
      const token = localStorage.getItem("up_auth_token");
      return { data: { session: token ? { access_token: token } : null }, error: null };
    },
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => { } } },
    }),
    signInWithPassword: async () => ({ data: {}, error: { message: "Use AuthContext login instead" } }),
    signUp: async () => ({ data: {}, error: { message: "Use AuthContext signup instead" } }),
    signOut: async () => {
      localStorage.removeItem("up_auth_token");
      return { error: null };
    },
    updateUser: async (data: any) => {
      // Bridge to our profile update if needed
      return { data: {}, error: null };
    },
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        order: () => ({
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          })
        }),
      }),
      order: () => ({
        ascending: () => ({
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          })
        })
      }),
      maybeSingle: async () => ({ data: null, error: null }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
  }),
};