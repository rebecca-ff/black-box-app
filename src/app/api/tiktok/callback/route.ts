import { type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/tiktok/callback — TikTok returns here with ?code & ?state. We exchange
// the code for a token, read the creator's real handle + follower count, store
// them in connected_accounts, and bounce back to the app.
export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;
  const code = req.nextUrl.searchParams.get("code");
  const stateRaw = req.nextUrl.searchParams.get("state") || "";
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  let userId = "";
  try { userId = JSON.parse(Buffer.from(stateRaw, "base64url").toString()).u || ""; } catch { /* ignore */ }

  if (!code || !clientKey || !clientSecret) {
    return Response.redirect(`${base}/?tiktok=error`, 302);
  }

  try {
    // 1. code -> access token
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${base}/api/tiktok/callback`,
      }),
    });
    const token = await tokenRes.json();
    const accessToken = token?.access_token;
    if (!accessToken) return Response.redirect(`${base}/?tiktok=error`, 302);

    // 2. real handle + follower count
    const infoRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=display_name,username,follower_count",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const info = await infoRes.json();
    const user = info?.data?.user || {};
    const handle = (user.username || user.display_name || "").replace(/^@/, "");
    const followers = typeof user.follower_count === "number" ? user.follower_count : null;

    // 3. store on the creator's account (service role; RLS bypassed server-side)
    const db = supabaseAdmin();
    if (db && userId) {
      await db.from("connected_accounts").upsert(
        { user_id: userId, platform: "tiktok", handle, follower_count: followers, connected_at: new Date().toISOString() },
        { onConflict: "user_id,platform" },
      );
    }
    return Response.redirect(`${base}/?tiktok=connected`, 302);
  } catch {
    return Response.redirect(`${base}/?tiktok=error`, 302);
  }
}
