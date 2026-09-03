import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { isSupabaseConfigured } from "./client";

/**
 * Server-only Supabase client for Server Components, Route Handlers, and Server Actions.
 * 
 * When elevated privileges are required (e.g. background GitHub App sync, migrations),
 * it uses SUPABASE_SECRET_KEY. For public reads, it uses the publishable key.
 * 
 * Never import this file into Client Components.
 */
export function getSupabaseServerClient(
  elevated = false
): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  if (elevated) {
    const secretKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey || secretKey.includes("example_key")) {
      console.warn("SUPABASE_SECRET_KEY is not configured for elevated server operations.");
      return null;
    }

    return createClient<Database>(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!;

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
