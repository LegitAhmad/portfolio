import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Returns true if public Supabase environment variables are provided.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    key &&
    url !== "https://your-project.supabase.co" &&
    !key.includes("example_key")
  );
}

/**
 * Singleton client for browser-side queries.
 * Uses the modern publishable key (sb_publishable_...) with legacy fallback.
 * Strictly adheres to Row Level Security (RLS).
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publishableKey = (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )!;

    browserClient = createClient<Database>(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}
