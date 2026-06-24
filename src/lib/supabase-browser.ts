import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client for Auth (anon key). Client-side session is fine here
// because the whole app is a single client component. Returns null if env is
// missing so the app can fall back to anonymous demo mode.
let client: SupabaseClient | null | undefined;

export function supabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}

// Auth turns on as soon as the browser Supabase client is configured (URL +
// anon key present). Set NEXT_PUBLIC_AUTH_ENABLED="false" to force demo mode.
export function authEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED === "false") return false;
  return !!supabaseBrowser();
}
