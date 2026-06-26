import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/tiktok/auth?u=<userId> — kick off real TikTok Login Kit OAuth.
// Redirects the creator to TikTok to authorize; TikTok returns to /callback.
// Needs TIKTOK_CLIENT_KEY (+ the redirect URI registered in your TikTok app).
export async function GET(req: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const base = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;
  if (!clientKey) {
    return Response.redirect(`${base}/?tiktok=unconfigured`, 302);
  }

  const u = req.nextUrl.searchParams.get("u") || "";
  const state = Buffer.from(JSON.stringify({ u })).toString("base64url");

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("scope", "user.info.basic,user.info.profile,user.info.stats");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${base}/api/tiktok/callback`);
  url.searchParams.set("state", state);

  return Response.redirect(url.toString(), 302);
}
