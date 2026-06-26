// Direct TikTok integration (Login Kit + Display API) — no Cruva.
//
// We persist the creator's OAuth tokens server-side (tiktok_tokens, service-role
// only) so we can call TikTok on their behalf and read REAL-TIME video metrics
// (views / likes / comments / shares) straight from TikTok's Display API.

import { supabaseAdmin } from "@/lib/supabase-server";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

// Scopes we request at authorize time. video.list unlocks the creator's own
// public videos + their engagement counts.
export const TIKTOK_SCOPES = "user.info.basic,user.info.profile,user.info.stats,video.list";

// Fields we pull per video from the Display API.
const VIDEO_FIELDS = [
  "id",
  "title",
  "video_description",
  "cover_image_url",
  "share_url",
  "view_count",
  "like_count",
  "comment_count",
  "share_count",
  "create_time",
].join(",");

export function tiktokConfigured(): boolean {
  return !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
}

export type TikTokTokenRow = {
  user_id: string;
  open_id: string | null;
  access_token: string;
  refresh_token: string | null;
  scope: string | null;
  expires_at: string | null;
  refresh_expires_at: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

// Persist (or refresh) a creator's TikTok tokens. Called from the OAuth callback
// after the code→token exchange, and again whenever we refresh an expired token.
export async function storeTikTokToken(userId: string, token: any): Promise<void> {
  const db = supabaseAdmin();
  if (!db || !userId || !token?.access_token) return;
  const now = Date.now();
  const expiresAt = token.expires_in ? new Date(now + token.expires_in * 1000).toISOString() : null;
  const refreshExpiresAt = token.refresh_expires_in ? new Date(now + token.refresh_expires_in * 1000).toISOString() : null;
  await db.from("tiktok_tokens").upsert(
    {
      user_id: userId,
      open_id: token.open_id ?? null,
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? null,
      scope: token.scope ?? null,
      expires_at: expiresAt,
      refresh_expires_at: refreshExpiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

async function loadToken(userId: string): Promise<TikTokTokenRow | null> {
  const db = supabaseAdmin();
  if (!db || !userId) return null;
  const { data } = await db.from("tiktok_tokens").select("*").eq("user_id", userId).maybeSingle();
  return (data as TikTokTokenRow) || null;
}

// Trade a refresh token for a fresh access token, persist it, and return it.
async function refreshToken(row: TikTokTokenRow): Promise<string | null> {
  if (!row.refresh_token || !tiktokConfigured()) return null;
  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: row.refresh_token,
      }),
    });
    const token = await res.json();
    if (!token?.access_token) return null;
    await storeTikTokToken(row.user_id, token);
    return token.access_token as string;
  } catch {
    return null;
  }
}

// Return a usable access token for the creator, refreshing it first if it has
// expired (or is about to). null means "not connected / can't refresh".
async function freshAccessToken(userId: string): Promise<string | null> {
  const row = await loadToken(userId);
  if (!row) return null;
  const expMs = row.expires_at ? Date.parse(row.expires_at) : 0;
  // Refresh if it expires within the next 60s.
  if (expMs && expMs - Date.now() < 60_000) {
    const refreshed = await refreshToken(row);
    if (refreshed) return refreshed;
  }
  return row.access_token;
}

export type TikTokVideo = {
  id: string;
  caption: string;
  cover: string | null;
  url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: number | null;
};

function n(v: unknown): number {
  return typeof v === "number" && isFinite(v) ? v : 0;
}

// Pull the creator's recent videos + live engagement counts straight from
// TikTok. Returns { connected, videos }. connected=false => no stored token.
export async function fetchCreatorVideos(userId: string, maxCount = 20): Promise<{ connected: boolean; videos: TikTokVideo[] }> {
  const accessToken = await freshAccessToken(userId);
  if (!accessToken) return { connected: false, videos: [] };

  const res = await fetch(`${VIDEO_LIST_URL}?fields=${encodeURIComponent(VIDEO_FIELDS)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ max_count: Math.min(Math.max(maxCount, 1), 20) }),
  });
  const json = await res.json();
  const list: any[] = Array.isArray(json?.data?.videos) ? json.data.videos : [];
  const videos: TikTokVideo[] = list.map((v) => ({
    id: String(v.id ?? ""),
    caption: String(v.title || v.video_description || "").trim(),
    cover: v.cover_image_url || null,
    url: v.share_url || null,
    views: n(v.view_count),
    likes: n(v.like_count),
    comments: n(v.comment_count),
    shares: n(v.share_count),
    createdAt: typeof v.create_time === "number" ? v.create_time : null,
  }));
  return { connected: true, videos };
}
