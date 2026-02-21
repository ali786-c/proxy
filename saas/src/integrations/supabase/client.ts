// This file is mocked to prevent Supabase initialization errors during migration
// import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Mock client that returns empty data for everything
const mockSupabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Mock client') }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () => ({ data: [], error: null }),
        data: [],
        error: null,
      }),
      eq: () => ({
        single: () => ({ data: null, error: null }),
        data: [],
        error: null,
      }),
      data: [],
      error: null,
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => { } }),
    }),
  }),
};

export const supabase = mockSupabase as any;