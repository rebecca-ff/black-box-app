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

// Auth is only on when explicitly enabled AND configured — so adding the anon
// key alone never flips the live app into a login wall by surprise.
export function authEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_ENABLED === "true" && !!supabaseBrowser();
}
