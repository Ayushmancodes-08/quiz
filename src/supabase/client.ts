'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';
import type { Database } from './types';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      supabaseConfig.url,
      supabaseConfig.anonKey
    );
  }
  return supabaseClient;
}
