import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only: importing this file from a client component fails the build, so the key can never reach the browser.
// SUPABASE_URL and SUPABASE_ANON_KEY come from .env.local (see .env.local.example).

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill them in.");
  }
  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
